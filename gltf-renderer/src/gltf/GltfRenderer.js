import React, { Component } from "react";
import {
  Scene,
  Color,
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
  SkeletonHelper,
  Vector2,
  Vector3,
  sRGBEncoding,
  Raycaster,
  FrontSide,  
  DoubleSide,
  BackSide,
  TextureLoader,
  MeshStandardMaterial,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshPhongMaterial,
  MeshPhysicalMaterial,
} from "three";

import { Float32BufferAttribute } from 'three/src/core/BufferAttribute.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { GUI } from 'dat.gui';
import { resourcePathURL, resourcePathBase } from '../api/fileUpload.api.js'


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

const Preset = {ASSET_GENERATOR: 'assetgenerator'};
const selectionColor = 0x2C6E49;
const touchingColor = 0xCA5310;
const backColor = 0xC1C1C1;
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
	  opaque: "True",
      skeleton: false,
      grid: false,
	  side: "Front",
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
	includeparts = 0;
	disectparts = false;
	activeId = 0;
	whatchanged = 0;
	R = 0.7529000043869019;
	G = 0.7529000043869019;
	B = 0.7529000043869019;
	texture = null; 
	datametal = 0.1;
	datarough = 0.7;
	dataopaque = 1.0;
	datacolor = "#C1C1C1";
	data2texture = "None";
	data3texture = "None";

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
		this.gltfJSON = this.props.gltfjson;
		this.lights = [];
		this.content = null;
		this.mixer = null;
		this.clips = [];
		this.gui = null;

		
		this.prevTime = 0;

		this.stats = new Stats();
		this.stats.dom.height = '48px';
		[].forEach.call(this.stats.dom.children, (child) => (child.style.display = ''));

		this.scene = new Scene();

		const fov = this.props.preset === Preset.ASSET_GENERATOR
		  ? 0.8 * 180 / Math.PI
		  : 60;
		this.defaultCamera = new PerspectiveCamera( fov, this.node.clientWidth / this.node.clientHeight, 0.01, 1000 );
		this.activeCamera = this.defaultCamera;
		this.scene.add( this.defaultCamera );

		this.renderer = window.renderer = new WebGLRenderer({antialias: true, depthBuffer: true});
		this.renderer.physicallyCorrectLights = true;
		this.renderer.outputEncoding = sRGBEncoding;
		//console.log("back color",this.props.backcolor);
		this.renderer.setClearColor( this.props.backcolor || backColor );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( this.node.clientWidth, this.node.clientHeight );

		this.controls = new OrbitControls( this.defaultCamera, this.renderer.domElement );
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
		this.mouse3D = new Vector3( Infinity, Infinity,  0.5 );
		this.mouse = new Vector2( Infinity, Infinity );
		this.raycaster = new Raycaster();
		
		this.animate = this.animate.bind(this);
		requestAnimationFrame( this.animate );
		window.addEventListener('resize', this.onWindowResize.bind(this), false);
		this.renderer.domElement.addEventListener( 'mousemove', this.onMouseMove.bind(this), false );
		this.renderer.domElement.addEventListener( 'click', this.onMouseClick.bind(this), false );
		this.alter();
		this.onWindowResize();
	}
  
	  
	animate = (time) => {

		requestAnimationFrame( this.animate );

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
		this.renderer.domElement.removeEventListener( 'mousemove', this.onMouseMove );
		
		this.renderer.domElement.removeEventListener( 'click', this.onMouseClick );
	};
	
	/*
	*
	* @param {THREE.Object3D} object
	* @param {Array<THREE.AnimationClip} clips
	*
	*/
	setContent = ( object, clips ) => {

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

		  this.defaultCamera.position.fromArray( this.props.cameraPosition );
		  this.defaultCamera.lookAt( new Vector3() );

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
				if(this.props.materialtype != "Basic") {
					const materials = Array.isArray(node.material) 	? node.material : [node.material];
					materials.forEach((material)=>{
						var prevMaterial = material;
						if(this.props.materialtype=="Standard") {
							material = new MeshStandardMaterial();
						} else {
							if(this.props.materialtype=="Lambert") {
								material = new MeshLambertMaterial();
							} else {
								if(this.props.materialtype=="Phong") {
									material = new MeshPhongMaterial();
								} else {
									if(this.props.materialtype=="Physical") {
										material = new MeshPhysicalMaterial();
									}
								}
							}
						}
						
						MeshBasicMaterial.prototype.copy.call( material, prevMaterial );
					});	
				}
						
				this.changeMaterialStats(node.material);	 
			 }
		});

		this.setClips(clips);
		this.updateParts(object);
		this.updateLights();
		this.updateGUI();
		this.updateTextureEncoding();
		this.updateDisplay();

		window.content = this.content;
		//console.info('[glTF Viewer] THREE.Scene exported as `window.content`.');
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
	setClips = ( clips ) => {
		if (this.mixer) {
		  this.mixer.stopAllAction();
		  this.mixer.uncacheRoot(this.mixer.getRoot());
		  this.mixer = null;
		}

		this.clips = clips;
		if (!clips.length) return;

		this.mixer = new AnimationMixer( this.content );
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
	setCamera = ( name ) => {
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

	
	addLights =()=> {
		const state = this.state;

		if (this.props.preset === Preset.ASSET_GENERATOR) {
		  const hemiLight = new HemisphereLight();
		  hemiLight.name = 'hemi_light';
		  this.scene.add(hemiLight);
		  this.lights.push(hemiLight);
		  return;
		}

		const light1  = new AmbientLight(state.ambientColor, state.ambientIntensity);
		light1.name = 'ambient_light';
		this.defaultCamera.add( light1 );

		const light2  = new DirectionalLight(state.directColor, state.directIntensity);
		light2.position.set(0.5, 0, 0.866); // ~60ยบ
		light2.name = 'main_light';
		this.defaultCamera.add( light2 );

		this.lights.push(light1, light2);
	};

	removeLights = () => {

		this.lights.forEach((light) => light.parent.remove(light));
		this.lights.length = 0;

	};
	
	updateLights =()=> {
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
		  this.changeMaterialStats(material);
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
		this.node.appendChild( this.axesDiv );
		this.axesDiv.classList.add('axes');

		const {clientWidth, clientHeight} = this.axesDiv;

		this.axesScene = new Scene();
		this.axesCamera = new PerspectiveCamera( 50, clientWidth / clientHeight, 0.1, 10 );
		this.axesScene.add( this.axesCamera );

		this.axesRenderer = new WebGLRenderer( { alpha: true } );
		this.axesRenderer.setPixelRatio( window.devicePixelRatio );
		this.axesRenderer.setSize( this.axesDiv.clientWidth, this.axesDiv.clientHeight );

		this.axesCamera.up = this.defaultCamera.up;

		this.axesCorner = new AxesHelper(5);
		this.axesScene.add( this.axesCorner );
		this.axesDiv.appendChild(this.axesRenderer.domElement);
	};

	addGUI = () => {

		const gui = this.gui = new GUI({autoPlace: false, width: 260, hideable: true});

		// Display controls.
		const dispFolder = gui.addFolder('Display');
		const sideCtrl = dispFolder.add(this.state, 'side',['Front','Back','Both']);
		sideCtrl.onChange(() => this.updateDisplay());	
		const depthCtrl = dispFolder.add(this.state, 'opaque',['True','False','Self']);
		depthCtrl.onChange(() => this.updateDisplay());	
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
		lightFolder.add(this.renderer, 'outputEncoding', {sRGB: sRGBEncoding, Linear: LinearEncoding})
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
		this.animFolder.add({playAll: () => this.playAllClips()}, 'playAll');

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
		this.node.appendChild( guiWrap );
		guiWrap.classList.add('gui-wrap');
		guiWrap.appendChild(gui.domElement);
		gui.open();
		gui.closed=true;
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
			  const nameCtrl = this.morphFolder.add({name: mesh.name || 'Untitled'}, 'name');
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
		if(this.partsFolder) {
			this.gui.removeFolder(this.partsFolder);
		}		
		this.partsFolder = this.gui.addFolder("Parts");
		this.partsMeshes = meshes.children;
		
		if(this.partsMeshes[0].children.length > 0 ) {
			this.partsMeshes = this.partsMeshes[0].children;
		}
		
		if(this.partsMeshes[0].children.length > 0 ) {
			this.partsMeshes = this.partsMeshes[0].children;
		}
		
		this.ListBoxes = ["All Parts"];
		this.ListValues = [this.partsMeshes.length];
		
		
		for ( var i = 0; i < this.partsMeshes.length; i++ ) {
			
			if( this.partsMeshes[ i ].type=="Mesh" ) {
				this.partsMeshes[ i ].partSelected = false;
				this.ListBoxes.push(this.partsMeshes[ i ].name);
				this.ListValues.push(i);
			}
		}
		this.state.partsSelection = this.ListBoxes[0];
		this.partsCtrl=this.partsFolder.add(this.state,"partsSelection",this.ListBoxes,0);	
		this.partsCtrl.onChange((name) => this.hiLightMesh(name));
		
	};
  
	hiLightMesh = (name) => {
	 
	  
		for ( var i = 0; i < this.ListBoxes.length; i++ ) {
			if( this.ListBoxes[i]==name ) {
				if ( this.INTERSECTED) {
					this.INTERSECTED.material.color.setHex( this.INTERSECTED.currentHex );
					this.INTERSECTED = null;
				}
				if ( this.SELECTED ) {
					this.SELECTED.material.color.setHex( this.SELECTED.currentHex );
					this.SELECTED.partSelected = false;
				}
				if(this.ListValues[i]==this.partsMeshes.length) {
					this.SELECTED = null;
				} else {
					
					this.SELECTED = this.partsMeshes[this.ListValues[i]];
					this.SELECTED.partSelected = true;
					this.SELECTED.currentHex = this.SELECTED.material.color.getHex();
					this.SELECTED.material.color.setHex( this.props.selectionColor || selectionColor );
				}
				
				break;
			}
		}
		this.render();
	};
  
	clear = () => {

		if ( !this.content ) return;

		this.scene.remove( this.content );

		// dispose geometry
		this.content.traverse((node) => {

		  if ( !node.isMesh ) return;

		  node.geometry.dispose();

		} );

		// dispose textures
		traverseMaterials( this.content, (material) => {

		  MAP_NAMES.forEach( (map) => {

			if (material[ map ]) material[ map ].dispose();

		  } );

		} );

	};
  
	onWindowResize = () => {
		if(this.node) {
			 if(this.node.parentElement) {
				const {clientHeight, clientWidth} = this.node.parentElement;
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
  
	onMouseMove = ( event ) => {
      
      	event.preventDefault();

		this.mouse3D = new Vector3( ( event.clientX / window.innerWidth ) * 2 - 1,   
		  -( event.clientY / window.innerHeight ) * 2 + 1,  
		  0.5 );    
		var myrect = this.node.getBoundingClientRect();
		//console.log( (myrect.left / myrect.width ),myrect);
		// Detect light helper
		//sets the mouse position with a coordinate system where the center of the screen is the origin 
		

		this.mouse.x = ( (event.clientX) / window.innerWidth )* 2 - 1 - (myrect.left / (2*myrect.width) );
		this.mouse.y = - ( (event.clientY) / window.innerHeight )* 2 + 1 +(myrect.top / (2*myrect.height) );
		
		//this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1 - (myrect.left / myrect.width );
		this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
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
  
	onMouseClick = ( event ) => {
      
      	if ( this.INTERSECTED !== null ) {
			console.log( this.INTERSECTED.name || this.INTERSECTED );
		}
      
	};
  
	raycast = () => {

		
		//1. set the picking ray from the camera position and mouse coordinates
		this.activeCamera.updateMatrixWorld();
		this.raycaster.setFromCamera(this.mouse, this.activeCamera );    

		//2. compute intersections (note the 2nd parameter)
		var intersects = this.raycaster.intersectObjects( this.scene.children, true );
		
		if ( intersects.length == 0 ) {
			this.resetSelection();
		} else 	{
				
			var myObject = intersects.length;
			for ( var i = intersects.length-1; i >= 0; i-- ) {
				//console.log(intersects[ i ].object);
				if( intersects[ i ].object.type=="Mesh" ) {
					//console.log(intersects[ i ].object);
					myObject = i;
					break;
				}					
			}
			if( myObject != intersects.length) {
			
				if ( this.INTERSECTED != intersects[ myObject ].object ) {
				  
					if ( this.INTERSECTED ) {
						if(this.INTERSECTED.partSelected) {
							this.INTERSECTED.material.color.setHex( this.props.selectionColor || selectionColor );
						} else {
							this.INTERSECTED.material.color.setHex( this.INTERSECTED.currentHex );
						}
					}
					this.INTERSECTED = intersects[ myObject ].object;
					if(!this.INTERSECTED.partSelected) {
						this.INTERSECTED.currentHex = this.INTERSECTED.material.color.getHex();
					}
					this.INTERSECTED.material.color.setHex( this.props.touchingColor || touchingColor );
					
				}
			} else {
				this.resetSelection();
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
		this.includeparts = this.props.includeparts;
		this.disectparts = this.props.disectparts;
		this.materialtype = this.props.materialtype;
		if(this.gltfJSON!="") {
			
			this.gltfLoader = new GLTFLoader().setCrossOrigin('anonymous');
			  
			this.gltfLoader.parse(this.gltfJSON, resourcePathURL, ({ scene, scenes, cameras, animations, asset} ) => {
				this.object = scene || scenes[0] ;
				this.clips = animations || [];
				this.setContent(this.object, this.clips);			  
			});
		}
		
	};

	
	updateChildsOfMine(myColor, myTexture, myMetal, myRough, myOpaque, myId, whatchanged) {
		this.props.gltfobj.tree.forEach( element => {
			if(element.parentId==myId) {
				if(element.leaf) {
					if(element.name ) {
						const mymesh = this.findMyMaterial(element);
						if(mymesh){
							if (whatchanged==1) { 
								//console.log(this.partsMeshes[element.binId-1]);
								//const mymaterial = this.partsMeshes[element.binId-1].material;

								//console.log(mymesh);
								const mymaterial = mymesh.material;
								if(mymaterial){
									mymaterial.color = myColor;
								}
							}
							if (whatchanged==2) {														
								//console.log(this.partsMeshes[element.binId-1]);
								//const mymaterial = this.partsMeshes[element.binId-1].material;
								const mymaterial=mymesh.material;
								if(mymaterial){
									mymaterial.map = myTexture;
									const uvarry = this.readUV(element.uv64);
									//console.log(uvarry);	
									if(!mymesh["setUV"]) {
										mymesh.geometry.setAttribute('uv', new Float32BufferAttribute( uvarry, 2 ) );
										mymesh["setUV"] =true;
									}			
									
									mymaterial.needsUpdate = true;
								}					
							
							}
							if (whatchanged==3) { 
								//console.log(this.partsMeshes[element.binId-1]);
								//const mymaterial = this.partsMeshes[element.binId-1].material;
								const mymaterial = mymesh.material;
								if(mymaterial){
									mymaterial.metallicFactor = myMetal;
									mymaterial.metalness = myMetal;
								}
								
							}
							if (whatchanged==4) { 
								//console.log(this.partsMeshes[element.binId-1]);
								//const mymaterial = this.partsMeshes[element.binId-1].material;
								const mymaterial = mymesh.material;
								if(mymaterial){
									mymaterial.roughnessFactor = myRough;
									mymaterial.roughness = myRough;
								}
							}
							if (whatchanged==5) { 
								//console.log(this.partsMeshes[element.binId-1]);
								//const mymaterial = this.partsMeshes[element.binId-1].material;
								const mymaterial = mymesh.material;
								if(mymaterial){								
									mymaterial.transparent = (myOpaque!=1);
									mymaterial.opaque =  myOpaque;
									mymaterial.opacity = myOpaque;
								}
							}
						}
						
					}

				} else {
					this.updateChildsOfMine(myColor, myTexture, myMetal, myRough, myOpaque, element.id, whatchanged);
				}

			}
			
		});

	}
	readUV = (data64) => {
		
		//console.log(data64);
		var blob	= atob(data64),	// Base64 string converted to a char array
		fLen	= blob.length / Float32Array.BYTES_PER_ELEMENT,						// How many floats can be made, but be even
		dView	= new DataView( new ArrayBuffer(Float32Array.BYTES_PER_ELEMENT) ),	// ArrayBuffer/DataView to convert 4 bytes into 1 float.
		fAry	= new Float32Array(fLen),											// Final Output at the correct size
		p		= 0;																// Position

		for(var j=0; j < fLen; j++){
			p = j * 4;
			dView.setUint8(0,blob.charCodeAt(p));
			dView.setUint8(1,blob.charCodeAt(p+1));
			dView.setUint8(2,blob.charCodeAt(p+2));
			dView.setUint8(3,blob.charCodeAt(p+3));
			fAry[j] = dView.getFloat32(0,true);
		}
		return fAry;
	}

	assignUVs = (geometry) => {

		if(geometry.faces) {
			if(geometry.faceVertexUvs) {
				geometry.faceVertexUvs[0] = [];
			} else {
				geometry["faceVertexUvs"]=[];
				geometry["faceVertexUvs"][0]=[];
			}
			
		
			geometry.faces.forEach( (face) => {
		
				var uvs = [];
				var ids = [ 'a', 'b', 'c'];
				for( var i = 0; i < ids.length; i++ ) {
					var vertex = geometry.vertices[ face[ ids[ i ] ] ].clone();
		
					var n = vertex.normalize();
					var yaw = .5 - Math.atan( n.z, - n.x ) / ( 2.0 * Math.PI );
					var pitch = .5 - Math.asin( n.y ) / Math.PI;
		
					var u = yaw,
						v = pitch;
					uvs.push( new THREE.Vector2( u, v ) );
				}
				geometry.faceVertexUvs[ 0 ].push( uvs );
			});
		
			geometry.uvsNeedUpdate = true;
		}
		
	}
	findMyMaterial = (data) => {
		if(this.partsMeshes) {
			var i;
			for(i=0;i<this.partsMeshes.length;i++){
				//console.log(this.partsMeshes[i].name,data.name,(this.partsMeshes[i].name==data.name))
				if(this.partsMeshes[i].name==data.name){
					return this.partsMeshes[i];
				}
			}			
		};		
		return null;
	}
	changeBackground = () => {
		if(this.datacolor != this.props.backcolor && (this.props.dataselection==1) ) {
			this.datacolor = this.props.backcolor;
			//console.log(this.datacolor);
			if(this.renderer) {
				if(this.scene) {
					this.scene.background = null;
				}
				this.renderer.setClearColor( this.datacolor || backColor );			
			}			
		}
		//console.log("data2texture",this.data2texture,"prp2",this.props.data2texture,this.props.dataselection )
		if(this.data2texture != this.props.data2texture && (this.props.dataselection==2) ) {
			this.data2texture = this.props.data2texture;
			var myTexture = null;
			if(this.scene) {
				
				if(this.data2texture == "None" || this.data2texture == null ) {
					myTexture = null;
				} else {
					const textureLoader = new TextureLoader();
					//console.log(this.data2texture);
					myTexture = textureLoader.load( resourcePathBase+this.data2texture )
				}				
				this.scene.background = myTexture;
				if(!myTexture){
					if(this.renderer) {
						this.renderer.setClearColor( this.datacolor || backColor );
					}	
				}
			}			
		}
		//console.log("data3texture",this.data3texture,"prp3",this.props.data23texture,this.props.dataselection )
		if(this.data3texture != this.props.data3texture && (this.props.dataselection==3)) {
			this.data3texture = this.props.data3texture;
			var myTexture = null;
			if(this.scene) {
				
				if(this.data3texture == "None" || this.data3texture == null ) {
					myTexture = null;
				} else {
					const textureLoader = new CubeTextureLoader();
					//console.log(this.data3texture);
					myTexture = textureLoader.load( [
							resourcePathBase+this.data3texture+'-px.jpg',
							resourcePathBase+this.data3texture+'-nx.jpg',
							resourcePathBase+this.data3texture+'-py.jpg',
							resourcePathBase+this.data3texture+'-ny.jpg',
							resourcePathBase+this.data3texture+'-pz.jpg',
							resourcePathBase+this.data3texture+'-nz.jpg'
						])
				}				
				this.scene.background = myTexture;
				if(!myTexture){
					if(this.renderer) {
						this.renderer.setClearColor( this.datacolor || backColor );
					}	
				}
			}			
		}
	}
	
	changeparts = () => {
		
		const changedata = this.props.changedata;
		
		if( this.props.whatchanged != this.whatchanged || 
			changedata.name != this.activeId ||
			( (this.props.whatchanged==1) && 
			  (this.R != changedata.R || this.G!=changedata.G || this.B !=changedata.B ) ) || 
			( (this.props.whatchanged==2) && (changedata.texture) &&
			  (this.texture != changedata.texture.name ) ) 	 ||
			( (this.props.whatchanged==3) &&
			  (this.datametal != changedata.metallicFactor ) ) ||
			( (this.props.whatchanged==4) &&
			  (this.datarough != changedata.roughnessFactor ) ) ||
			( (this.props.whatchanged==5) &&
			  (this.dataopaque != changedata.A ) ) 
		  )
		{
			this.whatchanged = this.props.whatchanged;
			this.activeId = changedata.name;
						
			if (this.props.whatchanged==1) { 
				this.R = changedata.R; 
				this.G = changedata.G;
				this.B = changedata.B; 
				//console.log(changedata);
				if(changedata.leaf) {
					if(changedata.name ) {
						//console.log(this.partsMeshes[changedata.binId-1]);
						//const mymaterial = this.partsMeshes[element.binId-1].material;
						const mymesh = this.findMyMaterial(changedata);
						if(mymesh){
							const mymaterial = mymesh.material;
							//console.log("1",mymaterial);
							if(mymaterial){
								mymaterial.color = new Color(changedata.R, changedata.G, changedata.B);
							}
						}
						
					}
				} else {
					this.updateChildsOfMine( new Color(changedata.R, changedata.G, changedata.B), null, null, null,null, changedata.id, this.props.whatchanged);
				}

			}
			var myTexture = null;
			if ((this.props.whatchanged==2) && (changedata.texture)) { 	
				this.texture = changedata.texture.name;
				//console.log(changedata);
				if(changedata.leaf ) {
					if( changedata.name ) {
						//console.log(this.partsMeshes[changedata.binId-1]);
						//const mymaterial = this.partsMeshes[element.binId-1].material;
						const mymesh = this.findMyMaterial(changedata);
						if(mymesh){
							const mymaterial = mymesh.material;
							//console.log("2",mymaterial);
							if(mymaterial){
							
								if(this.texture == "None") {
									myTexture = null;
								} else {
									const textureLoader = new TextureLoader();
									myTexture = textureLoader.load( resourcePathBase+this.texture )
									/* myTexture.wrapT = RepeatWrapping;
									myTexture.wrapS = RepeatWrapping;
									myTexture.repeat.set( 9, 1 ); */								
								}
								mymaterial.map = myTexture;
								mymaterial.needsUpdate = true;
								//console.log(mymaterial);
								const uvarry = this.readUV(changedata.uv64);
								//console.log(uvarry);
								if(!mymesh["setUV"]) {
									mymesh.geometry.setAttribute('uv', new Float32BufferAttribute( uvarry, 2 ) );
									mymesh["setUV"] =true;
								}									//this.updateTexture( mymaterial, 'roughnessMap',this.roughnessMaps()  );
							}
						}
					}
				} else {
					
					if(this.texture == "None") {
						myTexture = null;
					} else {
						const textureLoader = new TextureLoader();
						myTexture = textureLoader.load( resourcePathBase+this.texture )
						/* myTexture.wrapT = RepeatWrapping;
						myTexture.wrapS = RepeatWrapping;
						myTexture.repeat.set( 9, 1 ); */
						
					}
					this.updateChildsOfMine( null, myTexture, null, null, null, changedata.id, this.props.whatchanged);
				}			
				
			}
			if (this.props.whatchanged==3) { 
				this.datametal = changedata.metallicFactor; 				
				if(changedata.leaf) {
					if( changedata.name ) {
						//console.log(this.partsMeshes[changedata.binId-1]);
						//const mymaterial = this.partsMeshes[element.binId-1].material;
						const mymesh = this.findMyMaterial(changedata);
						if(mymesh){
							const mymaterial = mymesh.material;
							if(mymaterial){
								mymaterial.metallicFactor = changedata.metallicFactor ;
								mymaterial.metalness = changedata.metallicFactor;
							}
							//console.log(mymaterial);
						}
					}
				} else {
					this.updateChildsOfMine( null, null, changedata.metallicFactor, null,null,  changedata.id, this.props.whatchanged);
				}

			}
			if (this.props.whatchanged==4) { 
				this.datarough = changedata.roughnessFactor; 				
				if(changedata.leaf) {
					if( changedata.name ) {
						//console.log(this.partsMeshes[changedata.binId-1]);
						//const mymaterial = this.partsMeshes[element.binId-1].material;
						const mymesh = this.findMyMaterial(changedata);
						if(mymesh){
							const mymaterial = mymesh.material;
							if(mymaterial){
								mymaterial.roughnessFactor = changedata.roughnessFactor ;
								mymaterial.roughness = changedata.roughnessFactor;
							}
							//console.log(mymaterial);
						}
					}
				} else {
					this.updateChildsOfMine( null, null, null, changedata.roughnessFactor, null,  changedata.id, this.props.whatchanged);
				}

			}
			if (this.props.whatchanged==5) { 
				this.dataopaque = changedata.A; 				
				if(changedata.leaf) {
					if( changedata.name ) {
						//console.log(this.partsMeshes[changedata.binId-1]);
						//const mymaterial = this.partsMeshes[element.binId-1].material;
						const mymesh = this.findMyMaterial(changedata);
						if(mymesh){
							const mymaterial = mymesh.material;
							if(mymaterial){
								mymaterial.transparent = (changedata.A!=1);
								mymaterial.opaque =  changedata.A;
								mymaterial.opacity = changedata.A;
							}
						}
					}
				} else {
					this.updateChildsOfMine( null, null, null,null, changedata.A, changedata.id, this.props.whatchanged);
				}

			}
		}	
	}
     
	changeMaterialStats(material) {
		material.wireframe = this.state.wiremesh;
		material.depthTest = true;
		material.depthWrite = this.state.opaque == "True" ? true : this.state.opaque == "False" ? false : !material.transparent;
		material.side = this.state.side == "Front" ? FrontSide : this.state.side == "Back" ? BackSide : DoubleSide;
	}

	resetSelection() {
		if (this.INTERSECTED) {
			if (this.INTERSECTED.partSelected) {
				this.INTERSECTED.material.color.setHex(this.props.selectionColor || selectionColor);
			} else {
				this.INTERSECTED.material.color.setHex(this.INTERSECTED.currentHex);
			}
			this.INTERSECTED = null;
		}
	}

	render() {
		if( this.activeFile != this.props.activefile || 
			this.includeparts != this.props.includeparts || 
			this.disectparts != this.props.disectparts || 
			this.materialtype != this.props.materialtype ) {
			this.alter();		
		}		
		if(this.renderer) {
			this.changeBackground();
			this.renderer.render( this.scene, this.activeCamera );
			if (this.state.grid) {
			  this.axesCamera.position.copy(this.defaultCamera.position)
			  this.axesCamera.lookAt(this.axesScene.position)
			  this.axesRenderer.render( this.axesScene, this.axesCamera );
			}
			this.changeparts()
		}
		return (
		  <div
			css={{ width: "600px", height: "600px" }}
			ref={el => (this.node = el)}
		  />
		);
	}
}

export default GLTFRenderer;
