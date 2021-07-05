import {
	EventDispatcher,
	MOUSE,
	Quaternion,	
	Vector2,
	Vector3,
	Object3D,
	Matrix4
} from 'three';

import SpinControls from './SpinControls.js';

const transformTo = (outParentToTarget, parent, target) => {
	outParentToTarget.copy(parent);
	outParentToTarget.invert();
	outParentToTarget.multiply(target);
}
//
// internals
//

let changeEvent = { type: 'change' };
let startEvent = { type: 'start' };
let endEvent = { type: 'end' };

let STATE = { NONE: 0, ROTATE: 1, DOLLY: 2, PAN: 3, TOUCH_DOLLY_PAN: 4 };


let state = STATE.NONE;

let EPS = 0.000001;

let scale = 1;
let panOffset = new Vector3();
let zoomChanged = false;

let panStart = new Vector2();
let panEnd = new Vector2();
let panDelta = new Vector2();

let dollyStart = new Vector2();
let dollyEnd = new Vector2();
let dollyDelta = new Vector2();

let rollToCamera = new Quaternion();

class CameraSpinControls extends EventDispatcher {
	//
	// internals
	//	
	constructor( camera, domElement ) {
        super();


		this.domElement = ( domElement !== undefined ) ? domElement : document;

		// Set to false to disable this control
		this.enabled = true;

		this.object = camera;
		// "target" sets the location of focus, where the object orbits around
		this.targetObj = new Object3D();
		this.target = this.targetObj.position;
		console.log(this.target);

		if ( camera.position.length() < EPS ) {
			camera.position.set(0, 0, 1);
		}	
		
		this.STATE = STATE; // to compare against startEvent.state

		this.targetObj.lookAt(camera.position);

		this.startTrackballScreenCenter = true;
		this.trackballToObject = new Matrix4();

		this.targetObj.updateWorldMatrix(true, false);
		this.object.updateWorldMatrix(true, false);
		transformTo(this.trackballToObject, this.targetObj.matrixWorld, this.object.matrixWorld);

		// How far you can dolly in and out ( PerspectiveCamera only )
		// Will cause jumps if target is moved closer or further than limits
		this.minDistance = 0;
		this.maxDistance = Infinity;

		// How far you can zoom in and out ( OrthographicCamera only )
		this.minZoom = 0;
		this.maxZoom = Infinity;

		// Set to true to enable damping (inertia)
		// If damping is enabled, you must call controls.update() in your animation loop
		this.enableDamping = false;
		this.dampingFactor = 0.25;

		// This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
		// Set to false to disable zooming
		this.enableZoom = true;
		this.zoomSpeed = 1.0;

		// Use setEnableRotate(isEnabled) function
		this.enableRotate = true;

		// Set to false to disable panning
		this.enablePan = true;
		this.panSpeed = 1.0;
		this.screenSpacePanning = true; // if true, pan in screen-space
		this.keyPanSpeed = 7.0;	// pixels moved per arrow key push

		// Set to false to disable use of the keys
		this.enableKeys = true;

		// The four arrow keys
		this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

		// Mouse buttons
		this.mouseButtons = { LEFT: MOUSE.LEFT, MIDDLE: MOUSE.MIDDLE, RIGHT: MOUSE.RIGHT };

		// for reset
		this.target0 = this.target.clone();
		this.position0 = this.object.position.clone();
		this.zoom0 = this.object.zoom;

		this.domElement.addEventListener( 'contextmenu', this.onContextMenu, false );

		this.domElement.addEventListener( 'mousedown', this.onMouseDown, false );
		this.domElement.addEventListener( 'wheel', this.onMouseWheel, false );

		this.domElement.addEventListener( 'touchstart', this.onTouchStart, true );
		
		window.addEventListener( 'keydown', this.onKeyDown, false );
		
		this.spinControl = new SpinControls( this.targetObj, 1, null, camera, this.domElement );
		this.spinControl.rotateSensitivity *= -1; // Negated it to pull camera around sphere as if sphere is fixed.
		
		this.domElement.addEventListener( 'touchend', this.onTouchEnd, true );
		this.domElement.addEventListener( 'touchmove', this.onTouchMove, false );
		
		this.spinControl.addEventListener( 'change', function ( event ) {

			this.dispatchEvent( changeEvent );

		} );
		
		// Starts touch control off right
		this.adjustTrackballRadius();
		
		// force an update at start
		this.update();
		this.startTrackballScreenCenter = false; //After first update, make it as false.

	}
	
		  
	//
	// public methods
	//

	setEnableRotate = (isEnabled) => {

		this.enableRotate = isEnabled;
		this.spinControl.enabled = isEnabled;

	};

	saveState = () => {

		this.target0.copy( this.target );
		this.position0.copy( this.object.position );
		this.zoom0 = this.object.zoom;

	};

	reset = () => {

		this.target.copy( this.target0 );
		this.object.position.copy( this.position0 );
		this.object.zoom = this.zoom0;

		this.object.updateProjectionMatrix();
		this.dispatchEvent( changeEvent );

		this.update();

		state = STATE.NONE;

	};

	movedTarget = () => {

		let v = new Vector3();

		this.targetObj.updateWorldMatrix( true, false );
		this.object.updateWorldMatrix( true, false );
		transformTo( this.trackballToObject, this.targetObj.matrixWorld, this.object.matrixWorld );
		
		// restrict radius to be between desired limits
		v.setFromMatrixPosition( this.trackballToObject );
		v.multiplyScalar( scale );
		v.clampLength( this.minDistance, this.maxDistance );
		this.trackballToObject.setPosition( v );
		this.object.matrix.copy( this.targetObj.matrixWorld );
		this.object.matrix.multiply( this.trackballToObject );

		this.adjustTrackballRadius();
	};

	setTargetPosition = ( positionVector ) =>{
		console.log("Target",this.target,positionVector);
		console.log(this.target.x,this.target.y, this.target.z, positionVector.x, positionVector.y, positionVector.z);
		this.target.copy( positionVector );
		this.movedTarget();

	}

	update = () => {

		let lastPosition = new Vector3();
		let lastQuaternion = new Quaternion();
		let v = new Vector3();
		this.spinControl.update();

		// move target to panned location
		this.target.add( panOffset );
		this.targetObj.updateWorldMatrix( true, false );

		v.setFromMatrixPosition( this.trackballToObject );
		v.multiplyScalar( scale );
		// restrict radius to be between desired limits
		v.clampLength( this.minDistance, this.maxDistance );
		this.trackballToObject.setPosition(v);
		this.object.matrix.copy( this.targetObj.matrixWorld );
		this.object.matrix.multiply( this.trackballToObject );

		this.adjustTrackballRadius();

		this.object.matrix.decompose( this.object.position, this.object.quaternion, this.object.scale );

		if ( this.enableDamping === true ) {

			panOffset.multiplyScalar( 1 - this.dampingFactor );

		} else {

			panOffset.set( 0, 0, 0 );

		}

		scale = 1;

		// rotation angle update condition is:
		// min(camera displacement, camera rotation in radians)^2 > EPS
		// using small-angle approximation cos(x/2) = 1 - x^2 / 8
		if ( zoomChanged 
			|| lastPosition.distanceToSquared( this.object.position ) > EPS 
			|| 8 * ( 1 - lastQuaternion.dot( this.object.quaternion ) ) > EPS ) {

			this.dispatchEvent( changeEvent );

			lastPosition.copy( this.object.position );
			lastQuaternion.copy( this.object.quaternion );
			zoomChanged = false;

			// Don't let camera movement cause mouse to move over sphere across frames
			this.spinControl.resetInputAfterCameraMovement();

			return true;

		}

		return false;

	};
  
	onWindowResize = () => {

		this.spinControl.onWindowResize();
		this.adjustTrackballRadius();

	}

	adjustTrackballRadius = () => {
	  
		let TRACKBALL_PERCENT_OF_SCREEN = .9;
		let v = new Vector3();
		let cameraToTrackball = new Matrix4();

		if ( this.object.isPerspectiveCamera ) {

			let limitingFov = Math.min( this.object.fov,  this.object.fov * this.object.aspect );
			let distanceToScreenSize = Math.sin( ( limitingFov / 2 ) * Math.PI / 180.0 );
			
			transformTo( cameraToTrackball, this.object.matrix, this.targetObj.matrixWorld );
			v.setFromMatrixPosition( cameraToTrackball );
			this.spinControl.trackballRadius = 1;// TRACKBALL_PERCENT_OF_SCREEN * v.length() * distanceToScreenSize;
			console.log("radis", this.spinControl.trackballRadius);
		} else { // assume orthographic camera

			let limitingDimension = Math.min( this.object.right - this.object.left, this.object.top - this.object.bottom ) / this.object.zoom;
			this.spinControl.trackballRadius =1;// TRACKBALL_PERCENT_OF_SCREEN / 2  * limitingDimension;
			console.log("radius",this.spinControl.trackballRadius);
		}
		
	};

	dispose = () => {

		this.domElement.removeEventListener( 'contextmenu', this.onContextMenu, false );
		this.domElement.removeEventListener( 'mousedown', this.onMouseDown, false );
		this.domElement.removeEventListener( 'wheel', this.onMouseWheel, false );

		this.domElement.removeEventListener( 'touchstart', this.onTouchStart, false );
		this.domElement.removeEventListener( 'touchend', this.onTouchEnd, false );
		this.domElement.removeEventListener( 'touchmove', this.onTouchMove, false );

		document.removeEventListener( 'mousemove', this.onMouseMove );
		document.removeEventListener( 'mouseup', this.onMouseUp );

		window.removeEventListener( 'keydown', this.onKeyDown, false );

	};



	getZoomScale = () => {

		return Math.pow( 0.95, this.zoomSpeed );

	}

	panLeft = ( distance, objectMatrix ) => {

		let v = new Vector3();

		v.setFromMatrixColumn( objectMatrix, 0 ); // get X column of objectMatrix
		v.multiplyScalar( - distance );

		panOffset.add( v );

	};

	panUp = ( distance, objectMatrix ) => {

		let v = new Vector3();

		if ( this.screenSpacePanning === true ) {

			v.setFromMatrixColumn( objectMatrix, 1 );

		} else {

			v.setFromMatrixColumn( objectMatrix, 0 );
			v.crossVectors( this.object.up, v );

		}

		v.multiplyScalar( distance );

		panOffset.add( v );

	};


	// deltaX and deltaY are in pixels; right and down are positive
	pan = ( deltaX, deltaY ) => {

		let offset = new Vector3();

		let element = this.domElement === document ? this.domElement.body : this.domElement;

		if ( this.object.isPerspectiveCamera ) {

			// perspective
			let position = this.object.position;
			offset.copy( position ).sub( this.target );
			let targetDistance = offset.length();

			// half of the fov is center to top of screen
			targetDistance *= Math.tan( ( this.object.fov / 2 ) * Math.PI / 180.0 );

			// we use only clientHeight here so aspect ratio does not distort speed
			this.panLeft( 2 * deltaX * targetDistance / element.clientHeight, this.object.matrix );
			this.panUp( 2 * deltaY * targetDistance / element.clientHeight, this.object.matrix );

		} else if ( this.object.isOrthographicCamera ) {

			// orthographic
			this.panLeft( deltaX * ( this.object.right - this.object.left ) / this.object.zoom / element.clientWidth, this.object.matrix );
			this.panUp( deltaY * ( this.object.top - this.object.bottom ) / this.object.zoom / element.clientHeight, this.object.matrix );

		} else {

			// camera neither orthographic nor perspective
			console.warn( 'WARNING: CameraSpinControls.js encountered an unknown camera type - pan disabled.' );
			this.enablePan = false;

		}

	};

	dollyIn = ( dollyScale ) => {

		if ( this.object.isPerspectiveCamera ) {

			scale /= dollyScale;

		} else if ( this.object.isOrthographicCamera ) {

			this.object.zoom = Math.max( this.minZoom, Math.min( this.maxZoom, this.object.zoom * dollyScale ) );
			this.object.updateProjectionMatrix();
			zoomChanged = true;

		} else {

			console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );
			this.enableZoom = false;

		}

	}

	dollyOut = ( dollyScale ) => {

		if ( this.object.isPerspectiveCamera ) {

			scale *= dollyScale;

		} else if ( this.object.isOrthographicCamera ) {

			this.object.zoom = Math.max( this.minZoom, Math.min( this.maxZoom, this.object.zoom / dollyScale ) );
			this.object.updateProjectionMatrix();
			zoomChanged = true;

		} else {

			console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );
			this.enableZoom = false;

		}

	}

	//
	// event callbacks - update the object state
	//

	handleMouseDownDolly = ( event ) => {

		dollyStart.set( event.clientX, event.clientY );

	}

	handleMouseDownPan = ( event ) => {

		panStart.set( event.clientX, event.clientY );

	}

	handleMouseMoveDolly = ( event ) => {

		dollyEnd.set( event.clientX, event.clientY );

		dollyDelta.subVectors( dollyEnd, dollyStart );

		if ( dollyDelta.y > 0 ) {

			this.dollyIn( this.getZoomScale() );

		} else if ( dollyDelta.y < 0 ) {

			this.dollyOut( this.getZoomScale() );

		}

		dollyStart.copy( dollyEnd );

		this.update();

	}

	handleMouseMovePan = ( event ) => {

		panEnd.set( event.clientX, event.clientY );

		panDelta.subVectors( panEnd, panStart ).multiplyScalar( this.panSpeed );

		this.pan( panDelta.x, panDelta.y );

		panStart.copy( panEnd );

		this.update();

	}

	handleMouseWheel=( event )=> {

		if ( event.deltaY < 0 ) {

			this.dollyOut( this.getZoomScale() );

		} else if ( event.deltaY > 0 ) {

			this.dollyIn( this.getZoomScale() );

		}

		this.update();

	}

	handleKeyDown=( event )=> {

		let needsUpdate = false;

		switch ( event.keyCode ) {

			case this.keys.UP:
				this.pan( 0, this.keyPanSpeed );
				needsUpdate = true;
				break;

			case this.keys.BOTTOM:
				this.pan( 0, - this.keyPanSpeed );
				needsUpdate = true;
				break;

			case this.keys.LEFT:
				this.pan( this.keyPanSpeed, 0 );
				needsUpdate = true;
				break;

			case this.keys.RIGHT:
				this.pan( - this.keyPanSpeed, 0 );
				needsUpdate = true;
				break;

		}

		if ( needsUpdate ) {

			// prevent the browser from scrolling on cursor keys
			event.preventDefault();

			this.update();

		}

	}

	moveTargetToFingersCenter = ( event ) => {

		// Move trackball to fingers centroid
		let x = 0.5 * ( event.touches[ 0 ].pageX + event.touches[ 1 ].pageX );
		let y = 0.5 * ( event.touches[ 0 ].pageY + event.touches[ 1 ].pageY );

		let fingerCenter = this.spinControl.getPointerInNdc(x, y);

		this.target.setFromMatrixPosition(this.trackballToObject);
		let startDistance = this.target.length();
		
		this.target.set( fingerCenter.x, fingerCenter.y, .5 );
		
		// For unproject, need to update camera.matrixWorldInverse if camera moved before renderer.render
		this.object.matrixWorldInverse.copy( this.object.matrixWorld ).invert();

		this.target.unproject( this.object ); // target in world space now
		this.target.sub( this.object.position ).normalize(); // Subtract to put around origin
		this.target.setLength( startDistance );
		this.target.add( this.object.position );
		this.movedTarget();

	}

	handleTouchStartDollyPanRoll = ( event ) => {

		if ( this.enableRotate ) {

			let dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
			let dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
			let theta = Math.atan2(dy, dx);
			
			// Rotation about z axis, inverted
			rollToCamera.set(0, 0, -Math.sin(theta / 2), Math.cos(theta / 2));

			rollToCamera.premultiply(this.object.quaternion);

		}

		if ( this.enableZoom ) {

			this.moveTargetToFingersCenter( event );

			let dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
			let dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;

			let distance = Math.sqrt( dx * dx + dy * dy );

			dollyStart.set( 0, distance );

		}

		if ( this.enablePan ) {

			let x = 0.5 * ( event.touches[ 0 ].pageX + event.touches[ 1 ].pageX );
			let y = 0.5 * ( event.touches[ 0 ].pageY + event.touches[ 1 ].pageY );

			panStart.set( x, y );

		}

	}

	handleTouchMoveDollyPanRoll = ( event )=> {

		event.stopImmediatePropagation(); //Prevent other controls from working.

		if ( this.enableRotate ) {

			let dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
			let dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
			let theta = Math.atan2(dy, dx);
			
			// Rotation about z axis
			this.object.quaternion.set(0, 0, Math.sin(theta / 2), Math.cos(theta / 2));

			this.object.quaternion.premultiply(rollToCamera);
			
		}

		if ( this.enableZoom ) {
			
			this.moveTargetToFingersCenter( event );

			let dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
			let dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;

			let distance = Math.sqrt( dx * dx + dy * dy );

			dollyEnd.set( 0, distance );

			dollyDelta.set( 0, Math.pow( dollyEnd.y / dollyStart.y, this.zoomSpeed ) );

			this.dollyIn( dollyDelta.y );

			dollyStart.copy( dollyEnd );

		}

		if ( this.enablePan ) {

			let x = 0.5 * ( event.touches[ 0 ].pageX + event.touches[ 1 ].pageX );
			let y = 0.5 * ( event.touches[ 0 ].pageY + event.touches[ 1 ].pageY );

			panEnd.set( x, y );

			panDelta.subVectors( panEnd, panStart ).multiplyScalar( this.panSpeed );

			this.pan( panDelta.x, panDelta.y );

			panStart.copy( panEnd );

		}

		this.update();

	}


	//
	// event handlers - FSM: listen for events and reset state
	//

	onMouseDown = ( event ) => {

		if ( this.enabled === false ) return;

		// Prevent the browser from scrolling.

		event.preventDefault();

		// Manually set the focus since calling preventDefault above
		// prevents the browser from setting it automatically.

		this.domElement.focus ? this.domElement.focus() : window.focus();

		switch ( event.button ) {

			case this.mouseButtons.LEFT:

				if ( event.ctrlKey || event.metaKey || event.shiftKey ) {

					if ( this.enablePan === false ) return;

					this.handleMouseDownPan( event );

					state = STATE.PAN;

				} else {

					if ( this.enableRotate === false ) return;

					state = STATE.ROTATE;

				}

				break;

			case this.mouseButtons.MIDDLE:

				if ( this.enableZoom === false ) return;

				this.handleMouseDownDolly( event );

				state = STATE.DOLLY;

				break;

			case this.mouseButtons.RIGHT:

				if ( this.enablePan === false ) return;

				this.handleMouseDownPan( event );

				state = STATE.PAN;

				break;

		}

		if ( state !== STATE.NONE ) {

			document.addEventListener( 'mousemove', this.onMouseMove );
			document.addEventListener( 'mouseup', this.onMouseUp );

			startEvent.state = state;
			this.dispatchEvent( startEvent );

		}

	}

	onMouseMove = ( event ) => {

		if ( this.enabled === false ) return;

		event.preventDefault();

		switch ( state ) {

			case STATE.ROTATE:

				if ( this.enableRotate === false ) return;

				break;

			case STATE.DOLLY:

				if ( this.enableZoom === false ) return;

				this.handleMouseMoveDolly( event );

				break;

			case STATE.PAN:

				if ( this.enablePan === false ) return;

				this.handleMouseMovePan( event );

				break;

		}

	}

	onMouseUp = ( event ) => {

		document.removeEventListener( 'mousemove', this.onMouseMove );
		document.removeEventListener( 'mouseup', this.onMouseUp );

		if ( this.enabled === false ) return;


		state = STATE.NONE;

		endEvent.state = state;
		this.dispatchEvent( endEvent );

	}

	onMouseWheel = ( event ) => {

		if ( this.enabled === false 
			|| this.enableZoom === false 
			|| ( state !== STATE.NONE && state !== STATE.ROTATE ) ) 
			return;

		event.preventDefault();
		event.stopPropagation();

		startEvent.state = STATE.DOLLY;
		this.dispatchEvent( startEvent );

		this.handleMouseWheel( event );

		endEvent.state = STATE.DOLLY;
		this.dispatchEvent( endEvent );

	}

	onKeyDown = ( event ) => {

		if ( this.enabled === false || this.enableKeys === false || this.enablePan === false ) return;

		this.handleKeyDown( event );

	}

	onTouchStart = ( event ) => {

		if ( this.enabled === false ) return;

		event.preventDefault();

		if ( event.touches.length === 1 ) {
			// 1 finger touch: rotate
			if ( this.enableRotate === false ) return;

			state = STATE.ROTATE;
			
			if ( this.startTrackballScreenCenter ) {

				this.target.setFromMatrixPosition(this.trackballToObject);
				let startDistance = this.target.length();
				this.target.set(0, 0, -startDistance);
				this.target.applyQuaternion(this.object.quaternion);
				this.target.add(this.object.position);
				this.setTargetPosition(this.target);

			}

		} else if ( event.touches.length >= 2 ) {
			
			// 2+ finger touch: dolly-pan
		
			if ( this.enableZoom === false 
				&& this.enablePan === false 
				&& this.enableRotate === false) return;

			this.handleTouchStartDollyPanRoll( event );

			state = STATE.TOUCH_DOLLY_PAN;

			this.spinControl.cancelSpin();
			this.spinControl.enabled = false;
		} else {

			state = STATE.NONE;

		}

		if ( state !== STATE.NONE ) {

			this.dispatchEvent( startEvent );

		}

	}

	onTouchMove = ( event ) => {

		if ( this.enabled === false ) return;

		event.preventDefault();
		event.stopPropagation();

		if ( event.touches.length >= 2) {

			// dolly-pan
			if ( this.enableZoom === false && this.enablePan === false ) return;

			this.handleTouchMoveDollyPanRoll( event );

		} else {

			state = STATE.NONE;

		}
		// 1 finger touch events are consumed by underlying SpinControls

	}

	onTouchEnd = ( event ) => {

		if ( this.enabled === false ) return;

		if( event.touches.length === 0 ) {
			
			state = STATE.NONE;
			endEvent.state = state;
			this.dispatchEvent( endEvent );

		} else if( event.touches.length === 1 ) {

			if ( this.startTrackballScreenCenter ) {

				// Set pivot point back to center if going from 2+ fingers to 1
				this.target.setFromMatrixPosition(this.trackballToObject);
				let startDistance = this.target.length();
				this.target.set(0, 0, -startDistance);
				this.target.applyQuaternion(this.object.quaternion);
				this.target.add(this.object.position);
				this.setTargetPosition(this.target);

			}
			
			state = STATE.ROTATE;
			this.spinControl.enabled = true;
			this.spinControl.handleTouchStart( event );

		} else if( event.touches.length >= 2 ) {

			this.handleTouchStartDollyPanRoll( event );

		}

	}

	onContextMenu = ( event ) => {

		event.preventDefault();

	}

	
	
};

/* CameraSpinControls.prototype = Object.create( THREE.EventDispatcher.prototype );
CameraSpinControls.prototype.constructor = CameraSpinControls; */

export default CameraSpinControls;
 