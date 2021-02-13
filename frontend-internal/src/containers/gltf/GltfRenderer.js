import React, { Component } from "react";
import {
  Scene,
  Color,
  MeshNormalMaterial,
  PerspectiveCamera,
  WebGLRenderer,
  AmbientLight,
  AnimationMixer,
  AxesHelper,
  Box3,
  Cache,
  CubeTextureLoader,
  DirectionalLight,
  GridHelper,
  HemisphereLight,
  LinearEncoding,
  LoaderUtils,
  LoadingManager,
  Geometry,
  Points,
  PointsMaterial,
  RGBFormat,
  SkeletonHelper,
  UnsignedByteType,
  Vector2,
  Vector3,
  sRGBEncoding,
  FrontSide,
  Raycaster
} from "three";
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { GUI } from 'dat.gui';
import { resourcePathURL } from '../../api/fileUpload.api.js'
import './style.css';

const DEFAULT_CAMERA = '[default]';

// glTF texture types by the loader .
const MAP_NAMES = [
  'map',
  'aoMap',
  'emissiveMap',
  'glossinessMap',
  'metalnessMap',
  'normalMap',
  'roughnessMap',
  'specularMap',
];

const Preset = { ASSET_GENERATOR: 'assetgenerator' };
const selectionColor = 0xd4ff00;
const touchingColor = 0xffd400;
const backColor = 0xcccccc;
Cache.enabled = true;

const traverseMaterials = (object, callback) => {
  object.traverse((node) => {
    if (!node.isMesh) return;
    const materials = Array.isArray(node.material)
      ? node.material
      : [node.material];
    materials.forEach(callback);
  });
};

class GLTFRenderer extends Component {
  state = {
    playbackSpeed: 1.0,
    actionStates: {},
    camera: DEFAULT_CAMERA,
    wiremesh: false,
    skeleton: false,
    grid: false,

    // Lights
    addLights: true,
    exposure: 1.0,
    textureEncoding: 'sRGB',
    ambientIntensity: 0.3,
    ambientColor: 0xFFFFFF,
    directIntensity: 0.8 * Math.PI, // TODO(#116)
    directColor: 0xFFFFFF,
    partsSelection: []
  };
  gltfJSON = "";
  activeFile = 0;

  constructor(props) {
    super(props);
    this.node = React.createRef();
  }

  componentDidMount() {
    this.init();
  }

  componentWillUnmount() {
    this.cleanup();
  }

  init = () => {

    this.lights = [];
    this.content = null;
    this.mixer = null;
    this.clips = [];
    this.gui = null;

    //console.log(this.props);

    this.prevTime = 0;

    this.stats = new Stats();
    this.stats.dom.height = '48px';
    [].forEach.call(this.stats.dom.children, (child) => (child.style.display = ''));

    this.scene = new Scene();

    const fov = this.props.preset === Preset.ASSET_GENERATOR
      ? 0.8 * 180 / Math.PI
      : 60;
    this.defaultCamera = new PerspectiveCamera(fov, this.node.clientWidth / this.node.clientHeight, 0.01, 1000);
    this.activeCamera = this.defaultCamera;
    this.scene.add(this.defaultCamera);

    this.renderer = window.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.physicallyCorrectLights = true;
    this.renderer.outputEncoding = sRGBEncoding;
    this.renderer.setClearColor(this.props.backColor || backColor);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.node.clientWidth, this.node.clientHeight);

    this.controls = new OrbitControls(this.defaultCamera, this.renderer.domElement);
    this.controls.autoRotate = false;
    this.controls.autoRotateSpeed = -10;
    this.controls.screenSpacePanning = true;


    this.node.appendChild(this.renderer.domElement);

    this.cameraCtrl = null;
    this.cameraFolder = null;
    this.animFolder = null;
    this.animCtrls = [];
    this.morphFolder = null;
    this.morphCtrls = [];
    this.skeletonHelpers = [];
    this.gridHelper = null;
    this.axesHelper = null;

    this.addAxesHelper();
    this.addGUI();
    if (this.props.kiosk) this.gui.close();


    this.INTERSECTED = null;
    this.SELECTED = null;
    this.mouse = new Vector2(Infinity, Infinity);
    this.raycaster = new Raycaster();

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
    window.addEventListener('resize', this.onWindowResize.bind(this), false);
    this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this), false);
    this.renderer.domElement.addEventListener('click', this.onMouseClick.bind(this), false);
    this.alter();
    this.onWindowResize();
  }


  animate = (time) => {

    requestAnimationFrame(this.animate);

    const dt = (time - this.prevTime) / 1000;
    this.raycast();
    this.controls.update();
    this.stats.update();
    this.mixer && this.mixer.update(dt);
    this.render();

    this.prevTime = time;

  }

  cleanup = () => {

    this.clear();
    window.removeEventListener("resize", this.onWindowResize);
    this.renderer.setAnimationLoop(null);
    this.renderer.domElement.removeEventListener('mousemove', this.onMouseMove);

    this.renderer.domElement.removeEventListener('click', this.onMouseClick);
  };

  /*
  *
  * @param {THREE.Object3D} object
  * @param {Array<THREE.AnimationClip} clips
  *
  */
  setContent = (object, clips) => {

    this.clear();

    const box = new Box3().setFromObject(object);
    const size = box.getSize(new Vector3()).length();
    const center = box.getCenter(new Vector3());

    this.controls.reset();

    object.position.x += (object.position.x - center.x);
    object.position.y += (object.position.y - center.y);
    object.position.z += (object.position.z - center.z);
    this.controls.maxDistance = size * 10;
    this.defaultCamera.near = size / 100;
    this.defaultCamera.far = size * 100;
    this.defaultCamera.updateProjectionMatrix();

    if (this.props.cameraPosition) {

      this.defaultCamera.position.fromArray(this.props.cameraPosition);
      this.defaultCamera.lookAt(new Vector3());

    } else {

      this.defaultCamera.position.copy(center);
      this.defaultCamera.position.x += size / 2.0;
      this.defaultCamera.position.y += size / 2.0;
      this.defaultCamera.position.z += size / 2.0;
      this.defaultCamera.lookAt(center);

    }

    this.setCamera(DEFAULT_CAMERA);

    this.axesCamera.position.copy(this.defaultCamera.position)
    this.axesCamera.lookAt(this.axesScene.position)
    this.axesCamera.near = size / 100;
    this.axesCamera.far = size * 100;
    this.axesCamera.updateProjectionMatrix();
    this.axesCorner.scale.set(size, size, size);

    this.controls.saveState();
    /*
      this.dotGeometry = new Geometry();
      this.dotGeometry.vertices.push(new Vector3(0, 0, 0));
      var dotMaterial = new PointsMaterial( { size: 10, sizeAttenuation: false } );
      var dot = new Points( this.dotGeometry, dotMaterial );
      this.scene.add( dot );
    */

    this.scene.add(object);
    this.content = object;

    this.state.addLights = true;

    this.content.traverse((node) => {
      if (node.isLight) {
        this.state.addLights = false;
      } else if (node.isMesh) {
        // TODO(https://github.com/mrdoob/three.js/pull/18235): Clean up.
        node.material.depthWrite = !node.material.transparent;
        node.material.side = FrontSide;
      }
    });

    this.setClips(clips);
    this.updateParts(object);
    this.updateLights();
    this.updateGUI();
    this.updateTextureEncoding();
    this.updateDisplay();

    window.content = this.content;
    console.info('[glTF Viewer] THREE.Scene exported as `window.content`.');
    this.printGraph(this.content);

  };

  printGraph = (node) => {

    console.group(' <' + node.type + '> ' + node.name);
    node.children.forEach((child) => this.printGraph(child));
    console.groupEnd();

  };

  /**
  * @param {Array<THREE.AnimationClip} clips
  */
  setClips = (clips) => {
    if (this.mixer) {
      this.mixer.stopAllAction();
      this.mixer.uncacheRoot(this.mixer.getRoot());
      this.mixer = null;
    }

    this.clips = clips;
    if (!clips.length) return;

    this.mixer = new AnimationMixer(this.content);
  };

  playAllClips = () => {
    this.clips.forEach((clip) => {
      this.mixer.clipAction(clip).reset().play();
      this.state.actionStates[clip.name] = true;
    });
  };

  /**
  * @param {string} name
  */
  setCamera = (name) => {
    if (name === DEFAULT_CAMERA) {
      this.controls.enabled = true;
      this.activeCamera = this.defaultCamera;
    } else {
      this.controls.enabled = false;
      this.content.traverse((node) => {
        if (node.isCamera && node.name === name) {
          this.activeCamera = node;
        }
      });
    }
  };

  updateTextureEncoding = () => {
    const encoding = this.state.textureEncoding === 'sRGB'
      ? sRGBEncoding
      : LinearEncoding;
    traverseMaterials(this.content, (material) => {
      if (material.map) material.map.encoding = encoding;
      if (material.emissiveMap) material.emissiveMap.encoding = encoding;
      if (material.map || material.emissiveMap) material.needsUpdate = true;
    });
  };


  addLights = () => {
    const state = this.state;

    if (this.props.preset === Preset.ASSET_GENERATOR) {
      const hemiLight = new HemisphereLight();
      hemiLight.name = 'hemi_light';
      this.scene.add(hemiLight);
      this.lights.push(hemiLight);
      return;
    }

    const light1 = new AmbientLight(state.ambientColor, state.ambientIntensity);
    light1.name = 'ambient_light';
    this.defaultCamera.add(light1);

    const light2 = new DirectionalLight(state.directColor, state.directIntensity);
    light2.position.set(0.5, 0, 0.866); // ~60ยบ
    light2.name = 'main_light';
    this.defaultCamera.add(light2);

    this.lights.push(light1, light2);
  };

  removeLights = () => {

    this.lights.forEach((light) => light.parent.remove(light));
    this.lights.length = 0;

  };

  updateLights = () => {
    const state = this.state;
    const lights = this.lights;

    if (state.addLights && !lights.length) {
      this.addLights();
    } else if (!state.addLights && lights.length) {
      this.removeLights();
    }

    this.renderer.toneMappingExposure = state.exposure;

    if (lights.length === 2) {
      lights[0].intensity = state.ambientIntensity;
      lights[0].color.setHex(state.ambientColor);
      lights[1].intensity = state.directIntensity;
      lights[1].color.setHex(state.directColor);
    }
  };

  updateDisplay = () => {
    if (this.skeletonHelpers.length) {
      this.skeletonHelpers.forEach((helper) => this.scene.remove(helper));
    }

    traverseMaterials(this.content, (material) => {
      material.wireframe = this.state.wiremesh;
    });

    this.content.traverse((node) => {
      if (node.isMesh && node.skeleton && this.state.skeleton) {
        const helper = new SkeletonHelper(node.skeleton.bones[0].parent);
        helper.material.linewidth = 3;
        this.scene.add(helper);
        this.skeletonHelpers.push(helper);
      }
    });

    if (this.state.grid !== Boolean(this.gridHelper)) {
      if (this.state.grid) {
        this.gridHelper = new GridHelper();
        this.axesHelper = new AxesHelper();
        this.axesHelper.renderOrder = 999;
        this.axesHelper.onBeforeRender = (renderer) => renderer.clearDepth();
        this.scene.add(this.gridHelper);
        this.scene.add(this.axesHelper);
      } else {
        this.scene.remove(this.gridHelper);
        this.scene.remove(this.axesHelper);
        this.gridHelper = null;
        this.axesHelper = null;
        this.axesRenderer.clear();
      }
    }
  };


  /**
  * Adds AxesHelper.
  *
  * See: https://stackoverflow.com/q/16226693/1314762
  */
  addAxesHelper = () => {
    this.axesDiv = document.createElement('div');
    this.node.appendChild(this.axesDiv);
    this.axesDiv.classList.add('axes');

    const { clientWidth, clientHeight } = this.axesDiv;

    this.axesScene = new Scene();
    this.axesCamera = new PerspectiveCamera(50, clientWidth / clientHeight, 0.1, 10);
    this.axesScene.add(this.axesCamera);

    this.axesRenderer = new WebGLRenderer({ alpha: true });
    this.axesRenderer.setPixelRatio(window.devicePixelRatio);
    this.axesRenderer.setSize(this.axesDiv.clientWidth, this.axesDiv.clientHeight);

    this.axesCamera.up = this.defaultCamera.up;

    this.axesCorner = new AxesHelper(5);
    this.axesScene.add(this.axesCorner);
    this.axesDiv.appendChild(this.axesRenderer.domElement);
  };

  addGUI = () => {

    const gui = this.gui = new GUI({ autoPlace: false, width: 260, hideable: true });

    // Display controls.
    const dispFolder = gui.addFolder('Display');

    const wiremeshCtrl = dispFolder.add(this.state, 'wiremesh');
    wiremeshCtrl.onChange(() => this.updateDisplay());
    const skeletonCtrl = dispFolder.add(this.state, 'skeleton');
    skeletonCtrl.onChange(() => this.updateDisplay());
    const gridCtrl = dispFolder.add(this.state, 'grid');
    gridCtrl.onChange(() => this.updateDisplay());
    dispFolder.add(this.controls, 'autoRotate');
    dispFolder.add(this.controls, 'screenSpacePanning');

    // Lighting controls.
    const lightFolder = gui.addFolder('Lighting');
    const encodingCtrl = lightFolder.add(this.state, 'textureEncoding', ['sRGB', 'Linear']);
    encodingCtrl.onChange(() => this.updateTextureEncoding());
    lightFolder.add(this.renderer, 'outputEncoding', { sRGB: sRGBEncoding, Linear: LinearEncoding })
      .onChange(() => {
        this.renderer.outputEncoding = Number(this.renderer.outputEncoding);
        traverseMaterials(this.content, (material) => {
          material.needsUpdate = true;
        });
      });

    [
      lightFolder.add(this.state, 'exposure', 0, 2),
      lightFolder.add(this.state, 'addLights').listen(),
      lightFolder.add(this.state, 'ambientIntensity', 0, 2),
      lightFolder.addColor(this.state, 'ambientColor'),
      lightFolder.add(this.state, 'directIntensity', 0, 4), // TODO(#116)
      lightFolder.addColor(this.state, 'directColor')
    ].forEach((ctrl) => ctrl.onChange(() => this.updateLights()));

    // Animation controls.
    this.animFolder = gui.addFolder('Animation');
    this.animFolder.domElement.style.display = 'none';
    const playbackSpeedCtrl = this.animFolder.add(this.state, 'playbackSpeed', 0, 1);
    playbackSpeedCtrl.onChange((speed) => {
      if (this.mixer) this.mixer.timeScale = speed;
    });
    this.animFolder.add({ playAll: () => this.playAllClips() }, 'playAll');

    // Morph target controls.
    this.morphFolder = gui.addFolder('Morph Targets');
    this.morphFolder.domElement.style.display = 'none';

    // Camera controls.
    this.cameraFolder = gui.addFolder('Cameras');
    this.cameraFolder.domElement.style.display = 'none';
    this.partsFolder = null;

    /*
    // Stats.
    const perfFolder = gui.addFolder('Performance');
    const perfLi = document.createElement('li');
    this.stats.dom.style.position = 'static';
    perfLi.appendChild(this.stats.dom);
    perfLi.classList.add('gui-stats');
    perfFolder.__ul.appendChild( perfLi );
    */

    const guiWrap = document.createElement('div');
    this.node.appendChild(guiWrap);
    guiWrap.classList.add('gui-wrap');
    guiWrap.appendChild(gui.domElement);
    gui.open();
    gui.closed = true;
  };

  updateGUI = () => {
    this.cameraFolder.domElement.style.display = 'none';

    this.morphCtrls.forEach((ctrl) => ctrl.remove());
    this.morphCtrls.length = 0;
    this.morphFolder.domElement.style.display = 'none';

    this.animCtrls.forEach((ctrl) => ctrl.remove());
    this.animCtrls.length = 0;
    this.animFolder.domElement.style.display = 'none';

    const cameraNames = [];
    const morphMeshes = [];
    this.content.traverse((node) => {
      if (node.isMesh && node.morphTargetInfluences) {
        morphMeshes.push(node);
      }
      if (node.isCamera) {
        node.name = node.name || `VIEWER__camera_${cameraNames.length + 1}`;
        cameraNames.push(node.name);
      }
    });

    if (cameraNames.length) {
      this.cameraFolder.domElement.style.display = '';
      if (this.cameraCtrl) this.cameraCtrl.remove();
      const cameraOptions = [DEFAULT_CAMERA].concat(cameraNames);
      this.cameraCtrl = this.cameraFolder.add(this.state, 'camera', cameraOptions);
      this.cameraCtrl.onChange((name) => this.setCamera(name));
    }

    if (morphMeshes.length) {
      this.morphFolder.domElement.style.display = '';
      morphMeshes.forEach((mesh) => {
        if (mesh.morphTargetInfluences.length) {
          const nameCtrl = this.morphFolder.add({ name: mesh.name || 'Untitled' }, 'name');
          this.morphCtrls.push(nameCtrl);
        }
        for (let i = 0; i < mesh.morphTargetInfluences.length; i++) {
          const ctrl = this.morphFolder.add(mesh.morphTargetInfluences, i, 0, 1, 0.01).listen();
          Object.keys(mesh.morphTargetDictionary).forEach((key) => {
            if (key && mesh.morphTargetDictionary[key] === i) ctrl.name(key);
          });
          this.morphCtrls.push(ctrl);
        }
      });
    }

    if (this.clips.length) {
      this.animFolder.domElement.style.display = '';
      const actionStates = this.state.actionStates = {};
      this.clips.forEach((clip, clipIndex) => {
        // Autoplay the first clip.
        let action;
        if (clipIndex === 0) {
          actionStates[clip.name] = true;
          action = this.mixer.clipAction(clip);
          action.play();
        } else {
          actionStates[clip.name] = false;
        }

        // Play other clips when enabled.
        const ctrl = this.animFolder.add(actionStates, clip.name).listen();
        ctrl.onChange((playAnimation) => {
          action = action || this.mixer.clipAction(clip);
          action.setEffectiveTimeScale(1);
          playAnimation ? action.play() : action.stop();
        });
        this.animCtrls.push(ctrl);
      });
    }
  };

  updateParts = (meshes) => {
    if (this.partsFolder) {
      this.gui.removeFolder(this.partsFolder);
    }
    this.partsFolder = this.gui.addFolder("Parts");
    this.partsMeshes = meshes.children;

    if (this.partsMeshes[0].children.length > 0) {
      this.partsMeshes = this.partsMeshes[0].children;
    }

    if (this.partsMeshes[0].children.length > 0) {
      this.partsMeshes = this.partsMeshes[0].children;
    }

    this.ListBoxes = ["All Parts"];
    this.ListValues = [this.partsMeshes.length];


    for (var i = 0; i < this.partsMeshes.length; i++) {

      if (this.partsMeshes[i].type == "Mesh") {
        this.partsMeshes[i].partSelected = false;
        this.ListBoxes.push(this.partsMeshes[i].name);
        this.ListValues.push(i);
      }
    }
    this.partsCtrl = this.partsFolder.add(this.state, "partsSelection", this.ListBoxes, 0);
    this.partsCtrl.onChange((name) => this.hiLightMesh(name));

  };

  hiLightMesh = (name) => {


    for (var i = 0; i < this.ListBoxes.length; i++) {
      if (this.ListBoxes[i] == name) {
        if (this.INTERSECTED) {
          this.INTERSECTED.material.color.setHex(this.INTERSECTED.currentHex);
          this.INTERSECTED = null;
        }
        if (this.SELECTED) {
          this.SELECTED.material.color.setHex(this.SELECTED.currentHex);
          this.SELECTED.partSelected = false;
        }
        if (this.ListValues[i] == this.partsMeshes.length) {
          this.SELECTED = null;
        } else {

          this.SELECTED = this.partsMeshes[this.ListValues[i]];
          this.SELECTED.partSelected = true;
          this.SELECTED.currentHex = this.SELECTED.material.color.getHex();
          this.SELECTED.material.color.setHex(this.props.selectionColor || selectionColor);
        }

        break;
      }
    }
    this.render();
  };

  clear = () => {

    if (!this.content) return;

    this.scene.remove(this.content);

    // dispose geometry
    this.content.traverse((node) => {

      if (!node.isMesh) return;

      node.geometry.dispose();

    });

    // dispose textures
    traverseMaterials(this.content, (material) => {

      MAP_NAMES.forEach((map) => {

        if (material[map]) material[map].dispose();

      });

    });

  };

  onWindowResize = () => {
    if (this.node) {

      if (this.node.parentElement) {
        const { clientHeight, clientWidth } = this.node.parentElement;
        this.defaultCamera.aspect = clientWidth / clientHeight;
        this.defaultCamera.updateProjectionMatrix();
        //this.vignette.style({aspect: this.defaultCamera.aspect});
        this.renderer.setSize(clientWidth, clientHeight);
      } else {
        this.defaultCamera.aspect = this.node.clientWidth / this.node.clientHeight;
        this.defaultCamera.updateProjectionMatrix();
        //this.vignette.style({aspect: this.defaultCamera.aspect});
        this.renderer.setSize(this.node.clientWidth, this.node.clientHeight);
      }
    }
    this.axesCamera.aspect = this.axesDiv.clientWidth / this.axesDiv.clientHeight;
    this.axesCamera.updateProjectionMatrix();
    this.axesRenderer.setSize(this.axesDiv.clientWidth, this.axesDiv.clientHeight);

  };

  onMouseMove = (event) => {

    event.preventDefault();
    var myrect = this.node.getBoundingClientRect();
    // Detect light helper
    //sets the mouse position with a coordinate system where the center of the screen is the origin 

    this.mouse.x = ((event.clientX) / window.innerWidth) * 2 - 1 - (myrect.left / myrect.width);
    this.mouse.y = - ((event.clientY) / window.innerHeight) * 2 + 1 + (myrect.top / myrect.height);

    /*	if (this.dotGeometry)
    {
      var x = new Vector3();
      this.activeCamera.getWorldDirection( x );			
      this.dotGeometry.vertices[0].x = this.mouse.x;
      this.dotGeometry.vertices[0].y = this.mouse.y;
      this.dotGeometry.vertices[0].z = (this.activeCamera.position.z * x);

    }
    */
  };

  onMouseClick = (event) => {

    if (this.INTERSECTED !== null) {
      alert(this.INTERSECTED.name || this.INTERSECTED);
    }

  };

  raycast = () => {


    //1. set the picking ray from the camera position and mouse coordinates
    this.activeCamera.updateMatrixWorld();
    this.raycaster.setFromCamera(this.mouse, this.activeCamera);

    //2. compute intersections (note the 2nd parameter)
    var intersects = this.raycaster.intersectObjects(this.scene.children, true);

    if (intersects.length == 0) {
      if (this.INTERSECTED) {
        if (this.INTERSECTED.partSelected) {
          this.INTERSECTED.material.color.setHex(this.props.selectionColor || selectionColor);
        } else {
          this.INTERSECTED.material.color.setHex(this.INTERSECTED.currentHex);
        }
        this.INTERSECTED = null;
      }
    } else {

      var myObject = intersects.length;
      for (var i = intersects.length - 1; i >= 0; i--) {
        //console.log(intersects[ i ].object);
        if (intersects[i].object.type == "Mesh") {
          //console.log(intersects[ i ].object);
          myObject = i;
          break;
        }
      }
      if (myObject != intersects.length) {

        if (this.INTERSECTED != intersects[myObject].object) {

          if (this.INTERSECTED) {
            if (this.INTERSECTED.partSelected) {
              this.INTERSECTED.material.color.setHex(this.props.selectionColor || selectionColor);
            } else {
              this.INTERSECTED.material.color.setHex(this.INTERSECTED.currentHex);
            }
          }
          this.INTERSECTED = intersects[myObject].object;
          if (!this.INTERSECTED.partSelected) {
            this.INTERSECTED.currentHex = this.INTERSECTED.material.color.getHex();
          }
          this.INTERSECTED.material.color.setHex(this.props.touchingColor || touchingColor);

        }
      }
      /*
        An intersection has the following properties :
          - object : intersected object (THREE.Mesh)
          - distance : distance from camera to intersection (number)
          - face : intersected face (THREE.Face3)
          - faceIndex : intersected face index (number)
          - point : intersection point (THREE.Vector3)
          - uv : intersection point in the object's UV coordinates (THREE.Vector2)
      */

    }



  };

  alter = () => {

    this.gltfJSON = this.props.gltfjson;
    this.activeFile = this.props.activefile;
    //console.log( this.gltfJSON );
    //console.log( this.activeFile );
    if (this.gltfJSON != "") {

      this.gltfLoader = new GLTFLoader().setCrossOrigin('anonymous');

      this.gltfLoader.parse(this.gltfJSON, resourcePathURL, ({ scene, scenes, cameras, animations, asset }) => {
        this.object = scene || scenes[0];
        this.clips = animations || [];
        this.setContent(this.object, this.clips);
      });
    }

  };

  render() {
    if (this.activeFile != this.props.activefile) {
      this.alter();
    }
    if (this.renderer) {
      this.renderer.render(this.scene, this.activeCamera);
      if (this.state.grid) {
        this.axesCamera.position.copy(this.defaultCamera.position)
        this.axesCamera.lookAt(this.axesScene.position)
        this.axesRenderer.render(this.axesScene, this.axesCamera);
      }
    }
    return (
      <div
        style={{ position: 'relative', width: "100%", height: "100%" }}
        ref={el => (this.node = el)}
      />
    );
  }
}

export default GLTFRenderer;
