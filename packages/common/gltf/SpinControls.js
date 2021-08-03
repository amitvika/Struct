import {
	EventDispatcher,
	Quaternion,
	Ray,
	Sphere,
	Vector2,
	Vector3
} from 'three';

let _angularVelocity = new Vector3(0, 0, 0),
	_lastQuaternion = new Quaternion(),
	_lastVelTime,

	_pointOnSphere = new Vector3(),
	_pointerScreen = new Vector2(),
	_pointOnSphereOld = new Vector3(),
	_lastPointerEventTime = 0,
	_wasLastPointerEventOnSphere = false,

	_isPointerDown = false,

	_EPS = 0.000001;

let changeEvent = { type: 'change' };
let startEvent = { type: 'start' };
let endEvent = { type: 'end' };
class SpinControls extends EventDispatcher {
	//
	// internals
	//
	constructor( object, trackBallRadius, spinAxisConstraint, camera, domElement ) {
        super();

		this.object = object;
		this.trackballRadius = trackBallRadius;
		this.camera = camera;
		this.domElement = ( domElement !== undefined ) ? domElement : document;

		// API

		this.enabled = true;

		this.rotateSensitivity = 1.0; // Keep at 1 for direct touching feel
		this.relativelySpinOffTrackball = true; // Rotation continues relatively when pointer is beyond trackball
		this.enableDamping = true; // True for movement with momentum after pointer release on control.update 
		this.dampingFactor = 5; // Increase for more friction
		this.spinAxisConstraint = spinAxisConstraint; // Set to a Vector3 to limit spinning to about an axis

		// Raycast projects pointer line through camera frustum for accurate trackball control. 
		// Shoemake has direct touching feel of pointer on orthographically projected sphere but jumps at sphere edge.
		// Holyroyd smooths between sphere and hyperbola to avoid jump at sphere edge.
		// Azimuthal from Yasuhiro Fujii has unlimited rotation behond the sphere edge.
		this.POINTER_SPHERE_MAPPING = { SHOEMAKE: 'shoemake', HOLROYD: 'holroyd', 
			AZIMUTHAL: 'azimuthal', RAYCAST: 'raycast' };

		// Base this on angle change around sphere edge?
		this.offTrackBallVelocityGainMap = {
			'shoemake': 20,
			'holroyd': 8,
			'azimuthal': 8,
			'raycast': 20
		};

		// Internals
		this._pointerMapping = this.POINTER_SPHERE_MAPPING.RAYCAST;
		this._offTrackBallVelocityGain = this.offTrackBallVelocityGainMap[this._pointerMapping];
		this._pointerUpVelDamping = 2000;

		this.screen = { left: 0, top: 0, width: 0, height: 0 };
		this.domElement.addEventListener( 'mousedown', this.onMouseDown );

		this.domElement.addEventListener( 'touchstart', this.onTouchStart, {passive: false} );
		this.domElement.addEventListener( 'touchmove', this.onTouchMove, {passive: false} );
		this.domElement.addEventListener( 'touchend', this.onTouchEnd, {passive: false} );
	
		this.onWindowResize();
		// force an update at start
		this.update();
		
	}
	update = () => {

		let currentTime;
		let lastTime = performance.now() / 1000.0;
		let deltaTime;
		currentTime = performance.now() / 1000.0;
		deltaTime = currentTime - lastTime;
		lastTime = currentTime;

		if( !_isPointerDown && this.enableDamping ) {

			_angularVelocity.multiplyScalar( 1 / ( deltaTime * this.dampingFactor + 1 ) );

			this.applyVelocity();

		}

		if( !this.enableDamping ) {

			_lastVelTime = performance.now(); // ToDo Avoid this hack.  Causes trackball drift.

		}
		
		this.hasPointerMovedThisFrame = false;

	};

	updateAngularVelocity = ( p1, p0, timeDelta ) => {

		let q0 = new Quaternion(),
			q1 = new Quaternion(),
			q0Conj = new Quaternion(); //for path independent rotation

		// path independent rotation from Shoemake
		q0Conj.set(p0.x, p0.y, p0.z, 0.0)
		q0Conj.normalize();
		q0Conj.conjugate();
		q1.set(p1.x, p1.y, p1.z, 0.0).multiply(q0Conj); 
		timeDelta *= 2.0; // divide angleDelta by 2 to keep sphere under pointer.  Might break algorithm properties, TODO: perhaps investigate.
		
		// path dependent
		// q1.setFromUnitVectors(p0, p1);
		
		q0.set(p0.x, p0.y, p0.z, 1.0);
		const angleSpeed = q1.angleTo(q0) / timeDelta;

		// Just set velocity because we are touching trackball without sliding
		_angularVelocity.crossVectors( p0, p1);
		_angularVelocity.setLength( angleSpeed );
		this.applyVelocity();

	};


	applyVelocity = () => {

		let quat = new Quaternion(),
		normalizedAxis = new Vector3(),
		deltaAngle,
		deltaTime,
		timeStamp;

		timeStamp = performance.now();
		deltaTime = ( timeStamp - _lastVelTime ) / 1000.0;
		_lastVelTime = timeStamp;

		if( this.spinAxisConstraint ) {

			normalizedAxis.copy( this.spinAxisConstraint );
			deltaAngle = normalizedAxis.dot( _angularVelocity ) ;

		} else {

			normalizedAxis.copy( _angularVelocity );
			deltaAngle = _angularVelocity.length();

		}

		if ( deltaAngle && deltaTime ) {

			normalizedAxis.normalize();
			quat.setFromAxisAngle( normalizedAxis, deltaAngle * deltaTime * this.rotateSensitivity );

			this.object.quaternion.normalize();
			this.object.quaternion.premultiply(quat);

			// using small-angle approximation cos(x/2) = 1 - x^2 / 8

			if ( 8 * ( 1 - _lastQuaternion.dot( this.object.quaternion ) ) > _EPS) {

				this.dispatchEvent( changeEvent );

				_lastQuaternion.copy( this.object.quaternion );

			}

		}

	};

	onWindowResize = () => {

		if ( this.domElement === document ) {

			this.screen.left = 0;
			this.screen.top = 0;
			this.screen.width = window.innerWidth;
			this.screen.height = window.innerHeight;

		} else {

			let box = this.domElement.getBoundingClientRect();
			let d = this.domElement.ownerDocument.documentElement;
			this.screen.left = box.left + window.pageXOffset - d.clientLeft;
			this.screen.top = box.top + window.pageYOffset - d.clientTop;
			this.screen.width = box.width;
			this.screen.height = box.height;

		}

	};


	resetInputAfterCameraMovement = () => {
		
		if( _isPointerDown ) {

			// Need to update camera.matrixWorldInverse if camera is moved 
			// and renderer has not updated matrixWorldInverse yet.
			this.camera.updateWorldMatrix(true, false);
			this.camera.matrixWorldInverse.copy( this.camera.matrixWorld ).invert();

			_pointOnSphere.copy( this.getPointerInSphere( this.getPointerInNdc( _pointerScreen.x, _pointerScreen.y ) ) );
		}
		
	};

	getPointerInNdc = ( pageX, pageY ) => {

		let vector = new Vector2();
		vector.set(
			( pageX - this.screen.width * 0.5 - this.screen.left ) / ( this.screen.width * 0.5 ),
			( this.screen.height + 2 * ( this.screen.top - pageY ) ) / this.screen.height
		);

		return vector;

	};


	// Find vector from object to pointer in screen space
	getObjectToPointer = ( pointerNdcScreen ) => { 

		let objPos = new Vector3(),
		objEdgePos = new Vector3(),
		offset = new Vector3(),
		objToPointer = new Vector2(),
		cameraRot = new Quaternion();

		
		this.object.updateWorldMatrix( true, false );
		objPos.setFromMatrixPosition( this.object.matrixWorld );
		this.camera.updateWorldMatrix( true, false );
		// Need to update camera.matrixWorldInverse if camera moved before renderer.render
		this.camera.matrixWorldInverse.copy( this.camera.matrixWorld ).invert();
		objPos.project( this.camera ); // position in ndc/screen
		objToPointer.set( objPos.x, objPos.y ); 
		objToPointer.subVectors( pointerNdcScreen, objToPointer ); 

		// Normalize objToPointer by object screen size
		// so objToPointer of length 1 is 1 object radius distance from object center.
		objEdgePos.setFromMatrixPosition( this.object.matrixWorld ); // objEdgePos is still aspirational on this line
		offset.set( this.trackballRadius, 0, 0 );

		offset.applyQuaternion( cameraRot.setFromRotationMatrix( this.camera.matrixWorld ) );
		objEdgePos.add( offset );
		objEdgePos.project( this.camera ); // position in ndc/screen
		objEdgePos.z = 0;
		objPos.z = 0;
		let objRadiusNDC = objEdgePos.distanceTo( objPos );

		objToPointer.x /= objRadiusNDC;
		objToPointer.y /= objRadiusNDC;
		if ( this.camera.aspect ) { // Perspective camera probably
			objToPointer.y /= this.camera.aspect;
		}

		return objToPointer;

	};
	

	// Finds point on sphere in world coordinate space
	getPointerInSphere = ( ndc ) =>{

		let point = new Vector3(),
		objPos = new Vector3(),
		objToPointer = new Vector2(),
		cameraRot = new Quaternion(),
		trackBallSphere = new Sphere(),
		ray = new Ray();
		objToPointer.copy( this.getObjectToPointer( ndc ) );

		cameraRot.setFromRotationMatrix( this.camera.matrixWorld );

		if ( this._pointerMapping === this.POINTER_SPHERE_MAPPING.RAYCAST ) {

			if ( objToPointer.lengthSq() < 1 ) {

				objPos.setFromMatrixPosition( this.object.matrixWorld );
				trackBallSphere.set( objPos, this.trackballRadius );

				ray.origin.copy( this.camera.position );
				ray.direction.set( ndc.x, ndc.y, .5 );
				ray.direction.unproject( this.camera ); // In world space
				ray.direction.sub( this.camera.position ).normalize(); // Subtract to put around origin

				ray.intersectSphere( trackBallSphere, point );
				point.sub( objPos );
				point.normalize(); // updateAngularVelocity expects unit vectors

			} else {

				// Shoemake project on edge of sphere
				objToPointer.normalize();
				point.set( objToPointer.x, objToPointer.y, 0.0 );
				point.applyQuaternion( cameraRot );
				
			}

		}
		// Pointer mapping code below derived from Yasuhiro Fujii's https://mimosa-pudica.net/3d-rotation/
		else if ( this._pointerMapping === this.POINTER_SPHERE_MAPPING.HOLROYD ) {

			let t = objToPointer.lengthSq();
			if (t < 0.5) {
				point.set( objToPointer.x, objToPointer.y, Math.sqrt( 1.0 - t ) );
			} else {
				point.set( objToPointer.x, objToPointer.y, 1.0 / ( 2.0 * Math.sqrt( t ) ) );
				point.normalize();
			}
			point.applyQuaternion( cameraRot ); // Rotate from looking down z axis to camera direction

		} else if ( this._pointerMapping === this.POINTER_SPHERE_MAPPING.SHOEMAKE ) {
			
			let t = objToPointer.lengthSq();
			if (t < 1.0) {
				point.set( objToPointer.x, objToPointer.y, Math.sqrt( 1.0 - t ) );
			} else {
				objToPointer.normalize();
				point.set( objToPointer.x, objToPointer.y, 0.0 );
			}
			point.applyQuaternion( cameraRot );

		} else if ( this._pointerMapping === this.POINTER_SPHERE_MAPPING.AZIMUTHAL ) {
			
			let t = ( Math.PI / 2.0 ) * objToPointer.length();
			let sined = t < Number.EPSILON ? 1.0 : Math.sin( t ) / t;
			objToPointer.multiplyScalar( ( Math.PI / 2.0 ) * sined );
			point.set( objToPointer.x, objToPointer.y, Math.cos( t ) );
			point.applyQuaternion( cameraRot );

		}
		
		return point;

	};
	
	onPointerDown = ( pointerScreenX, pointerScreenY, time ) => {

		let pointerNdc = this.getPointerInNdc( pointerScreenX, pointerScreenY );

		let objToPointer = this.getObjectToPointer( pointerNdc );

		if ( objToPointer.lengthSq() < 1 ) {

			_wasLastPointerEventOnSphere = true;
			_pointOnSphere.copy( this.getPointerInSphere( pointerNdc ) );

		} else {

			_wasLastPointerEventOnSphere = false;
			
		}

		_pointerScreen.set( pointerScreenX, pointerScreenY );
		_lastPointerEventTime = time;
		_angularVelocity.set( 0, 0, 0 );
		_isPointerDown = true;

	}

	// Finds point on sphere in world coordinate space
	onPointerMove = ( pointerScreenX, pointerScreenY, time ) => {

		let pointerNdc = new Vector3(),
			objToPointer = new Vector2();

		// for relative movement off sphere
		let deltaMouse = new Vector2(),
			lastNdc = new Vector2(),
			objectPos = new Vector3(),
			objectToCamera = new Vector3(),
			polarVel = new Vector3(),
			lastPointOnSphere = new Vector3();
	
		let deltaTime = ( time - _lastPointerEventTime ) / 1000.0;
		_lastPointerEventTime = time;
		
		_pointOnSphereOld.copy( _pointOnSphere );
		
		pointerNdc.copy( this.getPointerInNdc( pointerScreenX, pointerScreenY ) );

		objToPointer.copy( this.getObjectToPointer( pointerNdc ) );

		if ( objToPointer.lengthSq() < 1 || !this.relativelySpinOffTrackball ) {

			// Pointer is within radius of trackball circle on the screen
			// or relative rotation off trackball disabled

			_pointOnSphere.copy( this.getPointerInSphere( pointerNdc ) );

			if ( _wasLastPointerEventOnSphere ) {

				// Still on sphere
				if( deltaTime > 0 ) { // Sometimes zero due to timer precision?			

					this.updateAngularVelocity( _pointOnSphere, _pointOnSphereOld, deltaTime );
		
				}
				
			} 
			else { 

				// Moved onto sphere 
				_angularVelocity.set( 0, 0, 0 );
				_lastVelTime = time;

			}

			_wasLastPointerEventOnSphere = true;
		
		} else {

			// Pointer off trackball

			if ( _wasLastPointerEventOnSphere ) {

				// Just moved off trackball

				_angularVelocity.set( 0, 0, 0 );
				_lastVelTime = time;
				
			} 
			else {

				// Pointer still off trackball this frame
				
				if( deltaTime > 0 ) { // Sometimes zero due to timer precision?		
					
					// Relatively spin towards pointer from trackball center by change in distance amount
					// Simplify by finding pointer's delta polar coordinates with Sphere?

					lastNdc.copy( this.getPointerInNdc( _pointerScreen.x, _pointerScreen.y ) );
					
					deltaMouse.subVectors(pointerNdc, lastNdc);

					// Find change in pointer radius to trackball center
					objectPos.setFromMatrixPosition( this.object.matrixWorld );

					if ( this.camera.isPerspectiveCamera ) {

						objectToCamera.copy( this.camera.position ).sub( objectPos );

					} else { // Assuming orthographic

						this.camera.getWorldDirection( objectToCamera );
						objectToCamera.negate();

					}
				
					_pointOnSphere.copy( this.getPointerInSphere( pointerNdc ) );

					// Radius angular velocity direction
					_angularVelocity.crossVectors( objectToCamera, _pointOnSphere );
					
					// Find radius change over time

					let ndcToBall;

					if ( this.camera.isPerspectiveCamera ) {

						ndcToBall = ( 2 / this.camera.fov ) // NDC per field of view degree
							/ Math.atan( this.trackballRadius / objectToCamera.length() ); // Ball field of view angle size

					} else { //Assume orthographic

						ndcToBall = this.trackballRadius / ( ( this.camera.top - this.camera.bottom ) / this.camera.zoom * 2 );

					}

					objToPointer.normalize();						
					let deltaRadius = deltaMouse.dot( objToPointer ) * ndcToBall / deltaTime;
					_angularVelocity.setLength( deltaRadius * this._offTrackBallVelocityGain ); // Just set it because we are touching trackball without sliding

					// Find polar angle change
					lastPointOnSphere.copy( this.getPointerInSphere( lastNdc ) );
					const angle = lastPointOnSphere.angleTo( _pointOnSphere ) / deltaTime;
					polarVel.crossVectors( lastPointOnSphere, _pointOnSphere );
					polarVel.setLength( angle );

					_angularVelocity.add( polarVel );
					
					this.applyVelocity();
			
				}				

			}

			_wasLastPointerEventOnSphere = false;

		}

		_pointerScreen.set( pointerScreenX, pointerScreenY );
		
		this.hasPointerMovedThisFrame = true;

	}
	

	// call like this: spinControl.setPointerToSphereMapping(spinControl.POINTER_SPHERE_MAPPING.SHOEMAKE)
	setPointerToSphereMapping = ( mappingTechnique ) => {

		this._pointerMapping = mappingTechnique;
		this._offTrackBallVelocityGain = this.offTrackBallVelocityGainMap[this._pointerMapping];

	}

	// listeners

	handlePointerDown = ( event ) => {

		event.preventDefault(); // Prevent the browser from scrolling.
		event.stopImmediatePropagation(); // Stop other controls working.

		// Manually set the focus since calling preventDefault above
		// prevents the browser from setting it automatically.
		this.domElement.focus ? this.domElement.focus() : window.focus();
		
		this.dispatchEvent( startEvent );

	}

	handlePointerUp = ( event ) => {

		event.preventDefault();

		if( !this.hasPointerMovedThisFrame ) {

			// To support subtle touches do big dampening, not just zeroing velocity
			let deltaTime = ( event.timeStamp - _lastPointerEventTime ) / 1000.0;
			_angularVelocity.multiplyScalar( 1 / ( this._pointerUpVelDamping * Math.pow(deltaTime, 2) + this.dampingFactor * deltaTime + 1) );
		
		}
		
		_isPointerDown = false;

		this.dispatchEvent( endEvent );

	}

	onMouseDown = ( event ) => {

		if ( this.enabled === false || event.button !== 0 ) return;
		
		this.onPointerDown( event.pageX, event.pageY, event.timeStamp );

		document.addEventListener( 'mousemove', this.onMouseMove, false );
		document.addEventListener( 'mouseup', this.onMouseUp, false );

		this.handlePointerDown( event );

	}

	onMouseMove = ( event ) => {

		if ( this.enabled === false ) return;

		event.preventDefault();

		this.onPointerMove( event.pageX, event.pageY, event.timeStamp );

	}

	onMouseUp = ( event ) => {

		if ( this.enabled === false ) return;

		document.removeEventListener( 'mousemove', this.onMouseMove );
		document.removeEventListener( 'mouseup', this.onMouseUp );

		this.handlePointerUp( event );

	}

	// For camera controls to stop spin with 2 finger pinch
	cancelSpin = () => {
		
		_angularVelocity.set( 0, 0, 0 );

	};

	// Function broken out for CameraSpinControls to use in touch end if going from 2 fingers to 1
	handleTouchStart = ( event ) => {
		
		this.onPointerDown( event.pageX, event.pageY, event.timeStamp );
		this.applyVelocity();  //TODO Should not be needed here

	}

	onTouchStart = ( event ) => {

		if ( this.enabled === false ) return;

		this.handleTouchStart( event );

		this.handlePointerDown( event );

	}

	onTouchMove = ( event ) => {

		if ( this.enabled === false || !_isPointerDown ) return;

		event.preventDefault();
		event.stopImmediatePropagation(); // Prevent other controls from working.

		this.onPointerMove( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY, event.timeStamp );

	}

	onTouchEnd = ( event ) => {

		if( this.enabled === false ) return;

		this.handlePointerUp( event );

		// override handlePointerUp if finger still down
		if( event.touches.length > 0 ) {
			_isPointerDown = true;
		}

	}

	dispose = () => {

		this.domElement.removeEventListener( 'mousedown', this.onMouseDown );
		document.removeEventListener( 'mousemove', this.onMouseMove );
		document.removeEventListener( 'mouseup', this.onMouseUp );

		this.domElement.removeEventListener( 'touchstart', this.onTouchStart );		
		this.domElement.removeEventListener( 'touchmove', this.onTouchMove );
		this.domElement.removeEventListener( 'touchend', this.onTouchEnd );

	};

	

};

/* SpinControls.prototype = Object.create( EventDispatcher.prototype );
SpinControls.prototype.constructor = SpinControls; */

export default SpinControls;