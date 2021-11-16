import {
  EventDispatcher,
  MOUSE,
  Quaternion,
  Spherical,
  TOUCH,
  Vector2,
  Vector3,
  PerspectiveCamera,
  OrthographicCamera
} from 'three';

// This set of controls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
//
//    Orbit - left mouse / touch: one-finger move
//    Zoom - middle mouse, or mousewheel / touch: two-finger spread or squish
//    Pan - right mouse, or left mouse + ctrl/meta/shiftKey, or arrow keys / touch: two-finger move

let changeEvent = { type: 'change' };
let startEvent = { type: 'start' };
let endEvent = { type: 'end' };

let STATE = {
  NONE: -1,
  ROTATE: 0,
  DOLLY: 1,
  PAN: 2,
  TOUCH_ROTATE: 3,
  TOUCH_DOLLY: 4,
  TOUCH_PAN: 5,
  TOUCH_DOLLY_PAN: 6
};

let state = STATE.NONE;

let EPS = 0.000001;

// current position in spherical coordinates
let spherical = new Spherical();
let sphericalDelta = new Spherical();

let scale = 1;
let panOffset = new Vector3();
let zoomChanged = false;

let rotateStart = new Vector2();
let rotateEnd = new Vector2();
let rotateDelta = new Vector2();

let panStart = new Vector2();
let panEnd = new Vector2();
let panDelta = new Vector2();

let dollyStart = new Vector2();
let dollyEnd = new Vector2();
let dollyDelta = new Vector2();

class OrbitControls extends EventDispatcher {
  //
  // internals
  //

  constructor(object, domElement) {
    super();

    if (domElement === undefined)
      console.warn(
        'THREE.OrbitControls: The second parameter "domElement" is now mandatory.'
      );
    if (domElement === document)
      console.error(
        'THREE.OrbitControls: "document" should not be used as the target "domElement". Please use "renderer.domElement" instead.'
      );

    this.object = object;

    this.domElement = domElement !== undefined ? domElement : document;

    // Set to false to disable this control
    this.enabled = true;

    // "target" sets the location of focus, where the object orbits around
    this.target = new Vector3();

    // How far you can dolly in and out ( PerspectiveCamera only )
    this.minDistance = 0;
    this.maxDistance = Infinity;

    // How far you can zoom in and out ( OrthographicCamera only )
    this.minZoom = 0;
    this.maxZoom = Infinity;

    // How far you can orbit vertically, upper and lower limits.
    // Range is 0 to Math.PI radians.
    this.minPolarAngle = -Infinity; //0; // radians
    this.maxPolarAngle = Infinity; //Math.PI; // radians

    // How far you can orbit horizontally, upper and lower limits.
    // If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
    this.minAzimuthAngle = -Infinity; // radians
    this.maxAzimuthAngle = Infinity; // radians

    // Set to true to enable damping (inertia)
    // If damping is enabled, you must call controls.update() in your animation loop
    this.enableDamping = false;
    this.dampingFactor = 0.25;

    // This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
    // Set to false to disable zooming
    this.enableZoom = true;
    this.zoomSpeed = 1.0;

    // Set to false to disable rotating
    this.enableRotate = true;
    this.rotateSpeed = 1.0;

    // Set to false to disable panning
    this.enablePan = true;
    this.keyPanSpeed = 7.0; // pixels moved per arrow key push

    // Set to true to automatically rotate around the target
    // If auto-rotate is enabled, you must call controls.update() in your animation loop
    this.autoRotate = false;
    this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

    // Set to false to disable use of the keys
    this.enableKeys = true;

    // The four arrow keys
    this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

    // Mouse buttons
    this.mouseButtons = {
      ORBIT: MOUSE.LEFT,
      ZOOM: MOUSE.MIDDLE,
      PAN: MOUSE.RIGHT
    };

    // Set to true to enable both dollying and panning with two fingers, instead of just dollying.
    this.enableTwoFingerZoomPan = false;

    // for reset
    this.target0 = this.target.clone();
    this.position0 = this.object.position.clone();
    this.zoom0 = this.object.zoom;

    this.domElement.addEventListener('contextmenu', this.onContextMenu, false);

    this.domElement.addEventListener('mousedown', this.onMouseDown, false);
    this.domElement.addEventListener('wheel', this.onMouseWheel, false);

    this.domElement.addEventListener('touchstart', this.onTouchStart, false);
    this.domElement.addEventListener('touchend', this.onTouchEnd, false);
    this.domElement.addEventListener('touchmove', this.onTouchMove, false);

    window.addEventListener('keydown', this.onKeyDown, false);

    // force an update at start

    this.update();
  }

  //
  // public methods
  //

  getPolarAngle = () => {
    return spherical.phi;
  };

  getAzimuthalAngle = () => {
    return spherical.theta;
  };

  saveState = () => {
    this.target0.copy(this.target);
    this.position0.copy(this.object.position);
    this.zoom0 = this.object.zoom;
  };

  reset = () => {
    this.target.copy(this.target0);
    this.object.position.copy(this.position0);
    this.object.zoom = this.zoom0;

    this.object.updateProjectionMatrix();
    this.dispatchEvent(changeEvent);

    this.update();

    state = STATE.NONE;
  };

  update = () => {
    let offset = new Vector3();

    // so camera.up is the orbit axis
    let quat = new Quaternion().setFromUnitVectors(
      this.object.up,
      new Vector3(0, 1, 0)
    );
    let quatInverse = quat.clone().invert();

    let lastPosition = new Vector3();
    let lastQuaternion = new Quaternion();

    let position = this.object.position;

    offset.copy(position).sub(this.target);
    //offset.copy( position ).sub( panOffset );

    // rotate offset to "y-axis-is-up" space
    offset.applyQuaternion(quat);

    // angle from z-axis around y-axis
    spherical.setFromVector3(offset);

    if (this.autoRotate && state === STATE.NONE) {
      this.rotateLeft(this.getAutoRotationAngle());
    }

    spherical.theta += sphericalDelta.theta;
    spherical.phi += sphericalDelta.phi;

    // restrict theta to be between desired limits
    spherical.theta = Math.max(
      this.minAzimuthAngle,
      Math.min(this.maxAzimuthAngle, spherical.theta)
    );

    // restrict phi to be between desired limits
    spherical.phi = Math.max(
      this.minPolarAngle,
      Math.min(this.maxPolarAngle, spherical.phi)
    );
    if (spherical.phi > Math.PI) {
      spherical.phi = 2 * Math.PI - spherical.phi;
      while (spherical.phi > Math.PI) {
        spherical.phi -= Math.PI;
      }
    }
    if (spherical.phi < 0) {
      spherical.phi = 2 * Math.PI + spherical.phi;
      while (spherical.phi < 0) {
        spherical.phi += Math.PI;
      }
    }
    //spherical.makeSafe();

    spherical.radius *= scale;

    // restrict radius to be between desired limits
    spherical.radius = Math.max(
      this.minDistance,
      Math.min(this.maxDistance, spherical.radius)
    );

    // move target to panned location
    this.target.add(panOffset);

    offset.setFromSpherical(spherical);

    // rotate offset back to "camera-up-vector-is-up" space
    offset.applyQuaternion(quatInverse);

    position.copy(this.target).add(offset);

    //this.target.add( panOffset );

    //this.object.position.sub(panOffset);

    this.object.lookAt(this.target);

    if (this.enableDamping === true) {
      sphericalDelta.theta *= 1 - this.dampingFactor;
      sphericalDelta.phi *= 1 - this.dampingFactor;
    } else {
      sphericalDelta.set(0, 0, 0);
    }

    scale = 1;
    panOffset.set(0, 0, 0);

    // update condition is:
    // min(camera displacement, camera rotation in radians)^2 > EPS
    // using small-angle approximation cos(x/2) = 1 - x^2 / 8

    if (
      zoomChanged ||
      lastPosition.distanceToSquared(this.object.position) > EPS ||
      8 * (1 - lastQuaternion.dot(this.object.quaternion)) > EPS
    ) {
      this.dispatchEvent(changeEvent);

      lastPosition.copy(this.object.position);
      lastQuaternion.copy(this.object.quaternion);
      zoomChanged = false;

      return true;
    }

    return false;
  };

  dispose = () => {
    this.domElement.removeEventListener(
      'contextmenu',
      this.onContextMenu,
      false
    );
    this.domElement.removeEventListener('mousedown', this.onMouseDown, false);
    this.domElement.removeEventListener('wheel', this.onMouseWheel, false);

    this.domElement.removeEventListener('touchstart', this.onTouchStart, false);
    this.domElement.removeEventListener('touchend', this.onTouchEnd, false);
    this.domElement.removeEventListener('touchmove', this.onTouchMove, false);

    document.removeEventListener('mousemove', this.onMouseMove, false);
    document.removeEventListener('mouseup', this.onMouseUp, false);

    window.removeEventListener('keydown', this.onKeyDown, false);

    //this.dispatchEvent( { type: 'dispose' } ); // should this be added here?
  };

  getDomElement = () => {
    return this.domElement === document
      ? this.domElement.body
      : this.domElement;
  };

  getAutoRotationAngle = () => {
    return ((2 * Math.PI) / 60 / 60) * this.autoRotateSpeed;
  };

  getZoomScale = (speedMultiplier) => {
    speedMultiplier = speedMultiplier || 1.0;

    return Math.pow(0.95, this.zoomSpeed * speedMultiplier);
  };

  rotateLeft = (angle) => {
    sphericalDelta.theta -= angle;
  };

  rotateUp = (angle) => {
    sphericalDelta.phi -= angle;
  };

  panLeft = (distance, objectMatrix) => {
    let v = new Vector3();

    v.setFromMatrixColumn(objectMatrix, 0); // get X column of objectMatrix
    v.multiplyScalar(-distance);

    panOffset.add(v);
  };

  panUp = (distance, objectMatrix) => {
    let v = new Vector3();

    v.setFromMatrixColumn(objectMatrix, 1); // get Y column of objectMatrix
    v.multiplyScalar(distance);

    panOffset.add(v);
  };

  // deltaX and deltaY are in pixels; right and down are positive
  pan = (deltaX, deltaY) => {
    let offset = new Vector3();

    let element = this.getDomElement();

    if (this.object instanceof PerspectiveCamera) {
      // perspective
      let position = this.object.position;
      offset.copy(position).sub(this.target);
      let targetDistance = offset.length();

      // half of the fov is center to top of screen
      targetDistance *= Math.tan(((this.object.fov / 2) * Math.PI) / 180.0);

      // we actually don't use screenWidth, since perspective camera is fixed to screen height
      this.panLeft(
        (2 * deltaX * targetDistance) / element.clientHeight,
        this.object.matrix
      );
      this.panUp(
        (2 * deltaY * targetDistance) / element.clientHeight,
        this.object.matrix
      );
    } else if (this.object instanceof OrthographicCamera) {
      // orthographic
      this.panLeft(
        (deltaX * (this.object.right - this.object.left)) /
          this.object.zoom /
          element.clientWidth,
        this.object.matrix
      );
      this.panUp(
        (deltaY * (this.object.top - this.object.bottom)) /
          this.object.zoom /
          element.clientHeight,
        this.object.matrix
      );
    } else {
      // camera neither orthographic nor perspective
      console.warn(
        'WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.'
      );
      this.enablePan = false;
    }
  };

  dollyIn = (dollyScale) => {
    if (this.object instanceof PerspectiveCamera) {
      scale /= dollyScale;
    } else if (this.object instanceof OrthographicCamera) {
      this.object.zoom = Math.max(
        this.minZoom,
        Math.min(this.maxZoom, this.object.zoom * dollyScale)
      );
      this.object.updateProjectionMatrix();
      zoomChanged = true;
    } else {
      console.warn(
        'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.'
      );
      this.enableZoom = false;
    }
  };

  dollyOut = (dollyScale) => {
    if (this.object instanceof PerspectiveCamera) {
      scale *= dollyScale;
    } else if (this.object instanceof OrthographicCamera) {
      this.object.zoom = Math.max(
        this.minZoom,
        Math.min(this.maxZoom, this.object.zoom / dollyScale)
      );
      this.object.updateProjectionMatrix();
      zoomChanged = true;
    } else {
      console.warn(
        'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.'
      );
      this.enableZoom = false;
    }
  };

  //
  // event callbacks - update the object state
  //

  handleMouseDownRotate = (event) => {
    //console.log( 'handleMouseDownRotate' );

    rotateStart.set(event.clientX, event.clientY);
  };

  handleMouseDownDolly = (event) => {
    //console.log( 'handleMouseDownDolly' );

    dollyStart.set(event.clientX, event.clientY);
  };

  handleMouseDownPan = (event) => {
    //console.log( 'handleMouseDownPan' );

    panStart.set(event.clientX, event.clientY);
  };

  handleMouseMoveRotate = (event) => {
    //console.log( 'handleMouseMoveRotate' );

    rotateEnd.set(event.clientX, event.clientY);
    rotateDelta.subVectors(rotateEnd, rotateStart);

    let element = this.getDomElement();

    // rotating across whole screen goes 360 degrees around
    this.rotateLeft(
      ((2 * Math.PI * rotateDelta.x) / element.clientWidth) * this.rotateSpeed
    );

    // rotating up and down along whole screen attempts to go 360, but limited to 180
    this.rotateUp(
      ((2 * Math.PI * rotateDelta.y) / element.clientHeight) * this.rotateSpeed
    );

    rotateStart.copy(rotateEnd);

    this.update();
  };

  handleMouseMoveDolly = (event) => {
    //console.log( 'handleMouseMoveDolly' );

    dollyEnd.set(event.clientX, event.clientY);

    dollyDelta.subVectors(dollyEnd, dollyStart);

    // Adjust the dolly speed based on the amount moved, where 1% of the DOM element height per
    // update is the normal speed.
    let element = this.getDomElement();
    let speedMultiplier =
      Math.abs(dollyDelta.y) / (0.01 * element.clientHeight);

    if (dollyDelta.y > 0) {
      this.dollyIn(this.getZoomScale(speedMultiplier));
    } else if (dollyDelta.y < 0) {
      this.dollyOut(this.getZoomScale(speedMultiplier));
    }

    dollyStart.copy(dollyEnd);

    this.update();
  };

  handleMouseMovePan = (event) => {
    //console.log( 'handleMouseMovePan' );

    panEnd.set(event.clientX, event.clientY);

    panDelta.subVectors(panEnd, panStart);

    this.pan(panDelta.x, panDelta.y);

    panStart.copy(panEnd);

    this.update();
  };

  handleMouseUp = (event) => {
    //console.log( 'handleMouseUp' );
  };

  handleMouseWheel = (event) => {
    //console.log( 'handleMouseWheel' );

    if (event.deltaY < 0) {
      this.dollyOut(this.getZoomScale());
    } else if (event.deltaY > 0) {
      this.dollyIn(this.getZoomScale());
    }

    this.update();
  };

  handleKeyDown = (event) => {
    //console.log( 'handleKeyDown' );

    switch (event.keyCode) {
      case this.keys.UP:
        this.pan(0, this.keyPanSpeed);
        this.update();
        break;

      case this.keys.BOTTOM:
        this.pan(0, -this.keyPanSpeed);
        this.update();
        break;

      case this.keys.LEFT:
        this.pan(this.keyPanSpeed, 0);
        this.update();
        break;

      case this.keys.RIGHT:
        this.pan(-this.keyPanSpeed, 0);
        this.update();
        break;
    }
  };

  handleTouchStartRotate = (event) => {
    //console.log( 'handleTouchStartRotate' );

    rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);
  };

  handleTouchStartDolly = (event) => {
    //console.log( 'handleTouchStartDolly' );

    let dx = event.touches[0].pageX - event.touches[1].pageX;
    let dy = event.touches[0].pageY - event.touches[1].pageY;

    let distance = Math.sqrt(dx * dx + dy * dy);

    dollyStart.set(0, distance);
  };

  handleTouchStartPan = (event) => {
    //console.log( 'handleTouchStartPan' );

    panStart.set(event.touches[0].pageX, event.touches[0].pageY);
  };

  handleTouchStartDollyPan = (event) => {
    //console.log( 'handleTouchStartDollyPan' );

    if (this.enableZoom === true) {
      this.handleTouchStartDolly(event);
    }

    if (this.enablePan === true) {
      // Get the center of the two touch points, and track that for panning.
      let centerX = (event.touches[0].pageX + event.touches[1].pageX) / 2.0;
      let centerY = (event.touches[0].pageY + event.touches[1].pageY) / 2.0;
      panStart.set(centerX, centerY);
    }
  };

  handleTouchMoveRotate = (event) => {
    //console.log( 'handleTouchMoveRotate' );

    rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);
    rotateDelta.subVectors(rotateEnd, rotateStart);

    let element = this.getDomElement();

    // rotating across whole screen goes 360 degrees around
    this.rotateLeft(
      ((2 * Math.PI * rotateDelta.x) / element.clientWidth) * this.rotateSpeed
    );

    // rotating up and down along whole screen attempts to go 360, but limited to 180
    this.rotateUp(
      ((2 * Math.PI * rotateDelta.y) / element.clientHeight) * this.rotateSpeed
    );

    rotateStart.copy(rotateEnd);

    this.update();
  };

  handleTouchMoveDolly = (event) => {
    //console.log( 'handleTouchMoveDolly' );

    let dx = event.touches[0].pageX - event.touches[1].pageX;
    let dy = event.touches[0].pageY - event.touches[1].pageY;

    let distance = Math.sqrt(dx * dx + dy * dy);

    dollyEnd.set(0, distance);

    dollyDelta.subVectors(dollyEnd, dollyStart);

    // Adjust the dolly speed based on the amount moved, where 1% of the DOM element height per
    // update is the normal speed.
    let element = this.getDomElement();
    let speedMultiplier =
      Math.abs(dollyDelta.y) / (0.01 * element.clientHeight);

    if (dollyDelta.y > 0) {
      this.dollyOut(this.getZoomScale(speedMultiplier));
    } else if (dollyDelta.y < 0) {
      this.dollyIn(this.getZoomScale(speedMultiplier));
    }

    dollyStart.copy(dollyEnd);

    this.update();
  };

  handleTouchMovePan = (event) => {
    //console.log( 'handleTouchMovePan' );

    panEnd.set(event.touches[0].pageX, event.touches[0].pageY);

    panDelta.subVectors(panEnd, panStart);

    this.pan(panDelta.x, panDelta.y);

    panStart.copy(panEnd);

    this.update();
  };

  handleTouchMoveDollyPan = (event) => {
    //console.log( 'handleTouchMoveDollyPan' );

    // Handling two-finger panning, which is different from normal panning.
    if (this.enablePan === true) {
      // Get the center of the two touch points, and track that for panning.
      let centerX = (event.touches[0].pageX + event.touches[1].pageX) / 2.0;
      let centerY = (event.touches[0].pageY + event.touches[1].pageY) / 2.0;

      panEnd.set(centerX, centerY);

      panDelta.subVectors(panEnd, panStart);

      this.pan(panDelta.x, panDelta.y);

      panStart.copy(panEnd);

      // Update now if dolly will not be performed, since dolly also updates.
      if (this.enableZoom === false) {
        this.update();
      }
    }

    // Handle two-finger dollying, which is the same as normal dollying.
    if (this.enableZoom === true) {
      this.handleTouchMoveDolly(event);
    }
  };

  handleTouchEnd = (event) => {
    //console.log( 'handleTouchEnd' );
  };

  //
  // event handlers - FSM: listen for events and reset state
  //

  onMouseDown = (event) => {
    if (this.enabled === false) return;

    event.preventDefault();

    if (event.button === this.mouseButtons.ORBIT) {
      if (this.enableRotate === false) return;

      this.handleMouseDownRotate(event);

      state = STATE.ROTATE;
    } else if (event.button === this.mouseButtons.ZOOM) {
      if (this.enableZoom === false) return;

      this.handleMouseDownDolly(event);

      state = STATE.DOLLY;
    } else if (event.button === this.mouseButtons.PAN) {
      if (this.enablePan === false) return;

      this.handleMouseDownPan(event);

      state = STATE.PAN;
    }

    if (state !== STATE.NONE) {
      document.addEventListener('mousemove', this.onMouseMove, false);
      document.addEventListener('mouseup', this.onMouseUp, false);

      this.dispatchEvent(startEvent);
    }
  };

  onMouseMove = (event) => {
    if (this.enabled === false) return;

    event.preventDefault();

    if (state === STATE.ROTATE) {
      if (this.enableRotate === false) return;

      this.handleMouseMoveRotate(event);
    } else if (state === STATE.DOLLY) {
      if (this.enableZoom === false) return;

      this.handleMouseMoveDolly(event);
    } else if (state === STATE.PAN) {
      if (this.enablePan === false) return;

      this.handleMouseMovePan(event);
    }
  };

  onMouseUp = (event) => {
    if (this.enabled === false) return;

    this.handleMouseUp(event);

    document.removeEventListener('mousemove', this.onMouseMove, false);
    document.removeEventListener('mouseup', this.onMouseUp, false);

    this.dispatchEvent(endEvent);

    state = STATE.NONE;
  };

  onMouseWheel = (event) => {
    if (
      this.enabled === false ||
      this.enableZoom === false ||
      (state !== STATE.NONE && state !== STATE.ROTATE)
    )
      return;

    event.preventDefault();
    event.stopPropagation();

    this.handleMouseWheel(event);

    this.dispatchEvent(startEvent); // not sure why these are here...
    this.dispatchEvent(endEvent);
  };

  onKeyDown = (event) => {
    if (
      this.enabled === false ||
      this.enableKeys === false ||
      this.enablePan === false
    )
      return;

    this.handleKeyDown(event);
  };

  onTouchStart = (event) => {
    if (this.enabled === false) return;

    switch (event.touches.length) {
      case 1: // one-fingered touch: rotate
        if (this.enableRotate === false) return;

        this.handleTouchStartRotate(event);

        state = STATE.TOUCH_ROTATE;

        break;

      case 2: // two-fingered touch: dolly or dolly + pan
        if (this.enableZoom === false && this.enablePan === false) return;

        if (this.enableTwoFingerZoomPan === true) {
          this.handleTouchStartDollyPan(event);

          state =
            this.enableZoom === true && this.enablePan === true
              ? STATE.TOUCH_DOLLY_PAN
              : this.enableZoom === true && this.eanblePan === false
              ? STATE.TOUCH_DOLLY
              : STATE.TOUCH_PAN;
        } else {
          if (this.enableZoom === false) return;

          this.handleTouchStartDolly(event);

          state = STATE.TOUCH_DOLLY;
        }

        break;

      case 3: // three-fingered touch: pan
        if (this.enablePan === false) return;
        if (this.enableTwoFingerZoomPan === true) return;

        this.handleTouchStartPan(event);

        state = STATE.TOUCH_PAN;

        break;

      default:
        state = STATE.NONE;
    }

    if (state !== STATE.NONE) {
      this.dispatchEvent(startEvent);
    }
  };

  onTouchMove = (event) => {
    if (this.enabled === false) return;

    event.preventDefault();
    event.stopPropagation();

    switch (event.touches.length) {
      case 1: // one-fingered touch: rotate
        if (this.enableRotate === false) return;
        if (state !== STATE.TOUCH_ROTATE) return; // is this needed?...

        this.handleTouchMoveRotate(event);

        break;

      case 2: // two-fingered touch: dolly or dolly + pan
        if (this.enableZoom === false && this.enablePan === false) return;
        if (
          state !== STATE.TOUCH_DOLLY &&
          state !== STATE.TOUCH_PAN &&
          state !== STATE.TOUCH_DOLLY_PAN
        )
          return; // is this needed?...

        if (this.enableTwoFingerZoomPan === true) {
          this.handleTouchMoveDollyPan(event);
        } else {
          if (this.enableZoom === false) return;

          this.handleTouchMoveDolly(event);
        }

        break;

      case 3: // three-fingered touch: pan
        if (this.enablePan === false) return;
        if (state !== STATE.TOUCH_PAN) return; // is this needed?...

        this.handleTouchMovePan(event);

        break;

      default:
        state = STATE.NONE;
    }
  };

  onTouchEnd = (event) => {
    if (this.enabled === false) return;

    this.handleTouchEnd(event);

    this.dispatchEvent(endEvent);

    state = STATE.NONE;
  };

  onContextMenu = (event) => {
    event.preventDefault();
  };

  // event listeners
}

/* OrbitControls.prototype = Object.create( EventDispatcher.prototype );
OrbitControls.prototype.constructor = OrbitControls;

Object.defineProperties( OrbitControls.prototype, {

	center: {

		get: function () {

			console.warn( 'OrbitControls: .center has been renamed to .target' );
			return this.target;

		}

	},

	// backward compatibility

	noZoom: {

		get: function () {

			console.warn( 'OrbitControls: .noZoom has been deprecated. Use .enableZoom instead.' );
			return ! this.enableZoom;

		},

		set: function ( value ) {

			console.warn( 'OrbitControls: .noZoom has been deprecated. Use .enableZoom instead.' );
			this.enableZoom = ! value;

		}

	},

	noRotate: {

		get: function () {

			console.warn( 'OrbitControls: .noRotate has been deprecated. Use .enableRotate instead.' );
			return ! this.enableRotate;

		},

		set: function ( value ) {

			console.warn( 'OrbitControls: .noRotate has been deprecated. Use .enableRotate instead.' );
			this.enableRotate = ! value;

		}

	},

	noPan: {

		get: function () {

			console.warn( 'OrbitControls: .noPan has been deprecated. Use .enablePan instead.' );
			return ! this.enablePan;

		},

		set: function ( value ) {

			console.warn( 'OrbitControls: .noPan has been deprecated. Use .enablePan instead.' );
			this.enablePan = ! value;

		}

	},

	noKeys: {

		get: function () {

			console.warn( 'OrbitControls: .noKeys has been deprecated. Use .enableKeys instead.' );
			return ! this.enableKeys;

		},

		set: function ( value ) {

			console.warn( 'OrbitControls: .noKeys has been deprecated. Use .enableKeys instead.' );
			this.enableKeys = ! value;

		}

	},

	staticMoving: {

		get: function () {

			console.warn( 'OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead.' );
			return ! this.enableDamping;

		},

		set: function ( value ) {

			console.warn( 'OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead.' );
			this.enableDamping = ! value;

		}

	},

	dynamicDampingFactor: {

		get: function () {

			console.warn( 'OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.' );
			return this.dampingFactor;

		},

		set: function ( value ) {

			console.warn( 'OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.' );
			this.dampingFactor = value;

		}

	}
}); */

// This set of controls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
// This is very similar to OrbitControls, another set of touch behavior
//
//    Orbit - right mouse, or left mouse + ctrl/meta/shiftKey / touch: two-finger rotate
//    Zoom - middle mouse, or mousewheel / touch: two-finger spread or squish
//    Pan - left mouse, or arrow keys / touch: one-finger move

class MapControls extends OrbitControls {
  constructor(object, domElement) {
    super(object, domElement);

    this.screenSpacePanning = false; // pan orthogonal to world-space direction camera.up

    this.mouseButtons.LEFT = MOUSE.PAN;
    this.mouseButtons.RIGHT = MOUSE.ROTATE;

    this.touches.ONE = TOUCH.PAN;
    this.touches.TWO = TOUCH.DOLLY_ROTATE;
  }
}

export { OrbitControls, MapControls };
