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
    DefaultLoadingManager,
   /* Group,
    SphereBufferGeometry,
    LineBasicMaterial,
    LineSegments,
    Mesh,
    BoxBufferGeometry */
    //ObjectSpaceNormalMap,
} from "three";

//import * as THREE from 'three';
import { Float32BufferAttribute } from './BufferAttribute.js';
//import Stats from 'three/examples/jsm/libs/stats.module.js';
import { GLTFParser } from './gltfloader.js';
import { OrbitControls } from './OrbitControl.js';//'three/examples/jsm/controls/OrbitControls.js';
import { GUI } from './GUI.js';
import CameraSpinControls from './CameraSpinControls.js';

import { resourcePathURL, resourcePathBase } from '@ravibasil/common/api/fileUpload.api.js'
import {
    SELECTCOLOR, SELECTTEXTURE, SELECTMETAL, SELECTROUGH, SELECTOPAQUE,
    SELECTBACKCOLOR, SELECTSELECTCOLOR, SELECTTOUCHCOLOR,
    DEFAULTBACKCOLOR, DEFAULTSELECTCOLOR, DEFAULTTOUCHCOLOR, DEFAULTTEXTCOLOR,
    SELECT2DTEXTURE, SELECT3DTEXTURE, SELECTDISTANCE,
    SELECTSOLID, SELECTEDGE, SELECTCORNER, SELECTMEASURE, SELECTDISECTPARTS,
    SELECTORDER, SELECTASSEMBLY, SELECTFEATURE,
    hexToRGB, gltf_Dict
} from "./Tree/utils";
import './styles/style.css';
import { motion } from 'framer-motion'
import styled from 'styled-components'

const SquareDiv = styled(motion.div)`
    .square {
        position: relative;
        width: 50%;
    }

    .square:after {
        content: "";
        display: block;
        padding-bottom: 100%;
    }

    .content {
        position: absolute;
        width: 100%;
        height: 100%;
    }
  
`;
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

Cache.enabled = false; //If it is true, sometime crashes..

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
        partsSelection: [],
        intersectedShell: null

    };
    state_selectedObjects = [];
    gltfJSON = null;
    activeFile = 0;
    activeId = 0;
    whatchanged = 0;
    R = 0.7529000043869019;
    G = 0.7529000043869019;
    B = 0.7529000043869019;
    texture = null;
    datametal = 0.1;
    datarough = 0.7;
    dataopaque = 1.0;
    databackcolor = DEFAULTBACKCOLOR;
    dataselectcolor = DEFAULTSELECTCOLOR;
    datatouchcolor = DEFAULTTOUCHCOLOR;
    data2texture = "None";
    data3texture = "None";
    selectedshell = false;
    firstshell = null;
    secondshell = null;
    clientX = 0;
    clientY = 0;
    INTERSECTED = null;
    SELECTED = null;
    mouse = new Vector2(Infinity, Infinity);
    selectedoption = SELECTMEASURE;

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
        this.gltfJSON = this.props.gltfobj.gltf||this.props.gltfobj;
        this.lights = [];
        this.content = null;
        this.mixer = null;
        this.clips = [];
        this.gui = null;


        this.prevTime = 0;

        //this.stats = new Stats();
        //this.stats.dom.height = '48px';
        //[].forEach.call(this.stats.dom.children, (child) => (child.style.display = ''));
        if(this.renderer==null) {
            this.scene = new Scene();

            const fov = this.props.preset === Preset.ASSET_GENERATOR
                ? 0.8 * 180 / Math.PI
                : 60;
            this.defaultCamera = new PerspectiveCamera(fov, this.node.clientWidth / this.node.clientHeight, 0.01, 1000);
            this.activeCamera = this.defaultCamera;
            this.scene.add(this.defaultCamera);
//            console.log("Renderer",this.renderer, window.renderer);
            this.renderer = window.renderer = new WebGLRenderer({ antialias: true, depthBuffer: true });
                
            this.renderer.physicallyCorrectLights = true;
            this.renderer.outputEncoding = sRGBEncoding;
            //console.log("back color",this.props.backcolor);
            this.renderer.setClearColor(this.props.backcolor || DEFAULTBACKCOLOR);
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setSize(this.node.clientWidth, this.node.clientHeight);

            //this.controls = new CameraSpinControls(this.defaultCamera, this.renderer.domElement);
            this.controls = new OrbitControls(this.defaultCamera, this.renderer.domElement);
            this.controls.autoRotate = false;
            this.controls.autoRotateSpeed = -10;
            this.controls.screenSpacePanning = false;


            this.node.appendChild(this.renderer.domElement);
        
            this.defaultCameraCtrl = null;
            this.defaultCameraFolder = null;
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
            //this.mouse3D = new Vector3( Infinity, Infinity,  0.5 );
            this.mouse = new Vector2(Infinity, Infinity);
            this.clientX = 0;
            this.clientY = 0;
            this.raycaster = new Raycaster();

            this.animate = this.animate.bind(this);
            requestAnimationFrame(this.animate);
            window.addEventListener('resize', this.onWindowResize.bind(this), false);
            window.addEventListener('mousedown', this.onMouseDown.bind(this), true); // get event first to enable the correct control
            window.addEventListener('mouseup', this.onMouseUp.bind(this), false); // get event last, so false on capture            
            window.addEventListener('touchstart', this.onTouchStart.bind(this), false);
            window.addEventListener('touchend', this.onTouchEnd.bind(this), false);
           
            this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this), false);
            this.renderer.domElement.addEventListener('click', this.onMouseClick.bind(this), false);
            this.renderer.domElement.addEventListener('mousedown', this.raycast.bind(this), true);
            this.renderer.domElement.addEventListener('touchstart', this.touchStart.bind(this), true);
            this.controls.addEventListener('start', this.controlsStart.bind(this),false);
            this.controls.addEventListener('change', this.updateCameraSpinUI.bind(this),false);
            this.controls.addEventListener('end', this.controlsEnd.bind(this),false);

        }
        this.alter();
        this.changeparts();
        this.onWindowResize();
    }

    convertColor = (color) => {
        const colorRGB = hexToRGB(color);
        return new Color(colorRGB[0], colorRGB[1], colorRGB[2]);
    }
    animate = (time) => {

        requestAnimationFrame(this.animate);

        const dt = (time - this.prevTime) / 1000;
        this.raycast();
        if(this.controls) {
            this.controls.update();
        }        
        //this.stats.update();
        this.mixer && this.mixer.update(dt);
        this.render();

        this.prevTime = time;

    }

    cleanup = () => {
        //console.log("I have reached here to clean webgl render");
        this.clear();
        window.removeEventListener('resize', this.onWindowResize);
        window.removeEventListener('mousedown', this.onMouseDown);  
        window.removeEventListener('mouseup', this.onMouseUp);
        window.removeEventListener('touchstart', this.onTouchStart);
        window.removeEventListener('touchend', this.onTouchEnd);
        if(this.controls) {
            this.controls.removeEventListener('start', this.controlsStart);
            this.controls.removeEventListener('change', this.updateCameraSpinUI);
            this.controls.removeEventListener('end', this.controlsEnd);
            this.controls.dispose();
        }
        if(this.renderer) {
            this.renderer.setAnimationLoop(null);
            this.renderer.domElement.removeEventListener('mousemove', this.onMouseMove);    
            this.renderer.domElement.removeEventListener('click', this.onMouseClick);       
            this.renderer.domElement.removeEventListener('mousedown', this.raycast);
            this.renderer.domElement.removeEventListener('touchstart', this.touchStart.bind);
            this.renderer.dispose();
        }
        if(this.axesRenderer) {
            this.axesRenderer.dispose();
        }
        window.renderer= this.renderer = null;        
        this.axesRenderer = null;
        this.controls=null;       
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
        const size3D = box.getSize(new Vector3());
        const size = size3D.length() || 1;

        const center = box.getCenter(new Vector3());
        if(this.controls?.reset) {
            this.controls.reset();
        }
        

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

                for (var i = 0; i < this.state_selectedObjects.length; i++) {
                    if (node.name == this.state_selectedObjects[i].name) {
                        this.setSelectionColor(node);
                        this.state_selectedObjects[i] = node;
                        break;
                    }
                }
                if (this.firstshell) {
                    if (node.name == this.firstshell.name) {
                        this.setSelectionColor(node);
                        this.firstshell = node;
                    }
                }
                if (this.secondshell) {
                    if (node.name == this.secondshell.name) {
                        this.setSelectionColor(node);
                        this.secondshell = node;
                    }
                }
                const visibility = this.visibllity(node.name, true);
                if (this.props.materialtype != "Basic") {
                    const materials = Array.isArray(node.material) ? node.material : [node.material];
                    materials.forEach((material) => {
                        material.visible = visibility;
                        var prevMaterial = material;
                        if (this.props.materialtype == "Standard") {
                            material = new MeshStandardMaterial();
                        } else {
                            if (this.props.materialtype == "Lambert") {
                                material = new MeshLambertMaterial();
                            } else {
                                if (this.props.materialtype == "Phong") {
                                    material = new MeshPhongMaterial();
                                } else {
                                    if (this.props.materialtype == "Physical") {
                                        material = new MeshPhysicalMaterial();
                                    }
                                }
                            }
                        }

                        MeshBasicMaterial.prototype.copy.call(material, prevMaterial);
                    });
                } else {
                    const materials = Array.isArray(node.material) ? node.material : [node.material];
                    materials.forEach((material) => {
                        material.visible = visibility;
                    });
                }

                this.changeMaterialStats(node.material);
            }
        });

       /*  this.trackballWidget = new Group();
        this.trackballWidget.position.set(0, 0, 0);
        var geometry = new BoxBufferGeometry(0.002,0.004,0.005,8,8); //SphereBufferGeometry( 0.01, 8, 8 );
        const meshMaterial = new MeshBasicMaterial( { color: 0xaaaaff, flatShading: true, transparent: true, opacity: 0.2 } );
        const lineMaterial = new LineBasicMaterial( { color: 0xffffff, transparent: true, opacity: 0.5 } );
        this.trackballWidget.add( new LineSegments( geometry, lineMaterial ) );
        this.trackballWidget.add( new Mesh( geometry, meshMaterial ) );
        this.scene.add( this.trackballWidget );
        this.trackballWidget.visible = false;
        this.trackballWidget.renderOrder = 1; // Don't draw to early, thus obscuring other transparent objects        
				
 */
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
            if(this.controls) {
                this.controls.enabled = true;
            }
            this.activeCamera = this.defaultCamera;
        } else {
            if(this.controls) {
                this.controls.enabled = false;
            }
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
        if(this.renderer) {
            this.renderer.toneMappingExposure = state.exposure;
        }
        

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
        if(this.axesRenderer==null) {
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
        }       
    };

    addGUI = () => {

        const gui = this.gui = new GUI({ autoPlace: false, width: 260, hideable: true });

        // Display controls.
        const dispFolder = gui.addFolder('Display');
        const sideCtrl = dispFolder.add(this.state, 'side', ['Front', 'Back', 'Both']);
        sideCtrl.onChange(() => {
            this.state.side = sideCtrl.object.side;
            this.updateDisplay()
        });
        const depthCtrl = dispFolder.add(this.state, 'opaque', ['True', 'False', 'Self']);
        depthCtrl.onChange(() => {
            this.state.opaque = depthCtrl.object.opaque;
            this.updateDisplay()
        });
        const wiremeshCtrl = dispFolder.add(this.state, 'wiremesh');
        wiremeshCtrl.onChange(() => {
            this.state.wiremesh = wiremeshCtrl.object.wiremesh;
            this.updateDisplay()
        });
        const skeletonCtrl = dispFolder.add(this.state, 'skeleton');
        skeletonCtrl.onChange(() => {
            this.state.skeleton = skeletonCtrl.object.skeleton;
            this.updateDisplay()
        });
        const gridCtrl = dispFolder.add(this.state, 'grid');
        gridCtrl.onChange(() => {
            this.state.grid = gridCtrl.object.grid;
            this.updateDisplay()
        });
        dispFolder.add(this.controls, 'autoRotate');
        dispFolder.add(this.controls, 'screenSpacePanning');

        // Lighting controls.
        const lightFolder = gui.addFolder('Lighting');
        const encodingCtrl = lightFolder.add(this.state, 'textureEncoding', ['sRGB', 'Linear']);
        encodingCtrl.onChange(() => {
            this.state.textureEncoding = encodingCtrl.object.textureEncoding;
            this.updateTextureEncoding()
        });
        lightFolder.add(this.renderer, 'outputEncoding', { sRGB: sRGBEncoding, Linear: LinearEncoding })
            .onChange(() => {
                if(this.renderer) {
                    this.renderer.outputEncoding = Number(lightFolder.object.outputEncoding); // Number(this.renderer.outputEncoding);
                }
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
        ].forEach((ctrl) => ctrl.onChange(() => {
            this.state.exposure = ctrl.object.exposure;
            this.state.addLights = ctrl.object.addLights;
            this.state.ambientIntensity = ctrl.object.ambientIntensity;
            this.state.ambientColor = ctrl.object.ambientColor;
            this.state.directIntensity = ctrl.object.directIntensity;
            this.state.directColor = ctrl.object.directColor;
            this.updateLights()
        }));

        // Animation controls.
        this.animFolder = gui.addFolder('Animation');
        this.animFolder.domElement.style.display = 'none';
        const playbackSpeedCtrl = this.animFolder.add(this.state, 'playbackSpeed', 0, 1);
        playbackSpeedCtrl.onChange((speed) => {
            this.state.playbackSpeed = playbackSpeedCtrl.object.playbackSpeed;
            if (this.mixer) this.mixer.timeScale = speed;
        });
        this.animFolder.add({ playAll: () => this.playAllClips() }, 'playAll');

        // Morph target controls.
        this.morphFolder = gui.addFolder('Morph Targets');
        this.morphFolder.domElement.style.display = 'none';

        // Camera controls.
        this.defaultCameraFolder = gui.addFolder('Cameras');
        this.defaultCameraFolder.domElement.style.display = 'none';
        this.partsFolder = null;
        this.isTouched = false;
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
        // guiWrap.classList.add('gui-wrap');
        guiWrap.appendChild(gui.domElement);
        gui.open();
        gui.closed = true;
    };

    updateGUI = () => {
        this.defaultCameraFolder.domElement.style.display = 'none';

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
            this.defaultCameraFolder.domElement.style.display = '';
            if (this.defaultCameraCtrl) this.defaultCameraCtrl.remove();
            const cameraOptions = [DEFAULT_CAMERA].concat(cameraNames);
            this.defaultCameraCtrl = this.defaultCameraFolder.add(this.state, 'camera', cameraOptions);
            this.defaultCameraCtrl.onChange((name) => {
                this.state.camera = this.defaultCameraCtrl.object.camera;
                this.setCamera(name)
            });
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

        /* this.ListBoxes = ["All Parts"];
        this.ListValues = [this.partsMeshes.length];


        for (var i = 0; i < this.partsMeshes.length; i++) {

            if (this.partsMeshes[i].type == "Mesh") {
                this.partsMeshes[i].partSelected = false;
                this.ListBoxes.push(this.partsMeshes[i].name);
                this.ListValues.push(i);
            }
        }
        this.state.partsSelection = this.ListBoxes[0];
        this.partsCtrl = this.partsFolder.add(this.state, "partsSelection", this.ListBoxes, 0);
        this.partsCtrl.onChange((name) => {
            this.state.partsSelection = this.partsCtrl.object.partsSelection;
            this.hiLightMesh(name)
        }); */

    };

    hiLightMesh = (name) => {


        for (var i = 0; i < this.ListBoxes.length; i++) {
            if (this.ListBoxes[i] == name) {

                if (this.SELECTED) {
                    this.SELECTED.material.emissive.setHex(this.SELECTED.currentEmissive);
                    this.SELECTED.partSelected = false;
                }
                if (this.ListValues[i] == this.partsMeshes.length) {
                    this.SELECTED = null;
                } else {
                    this.SELECTED = this.partsMeshes[this.ListValues[i]];
                    this.SELECTED.partSelected = true;
                    if ((this.SELECTED.currentEmissive === null) || (typeof this.SELECTED.currentEmissive === 'undefined')) {
                        this.SELECTED.currentEmissive = this.SELECTED.material.emissive.getHex();
                    }
                    this.SELECTED.material.emissive.setHex(0xffffff - this.SELECTED.material.color.getHex());
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
                //console.log("Parent",clientWidth, clientHeight);
                //this.vignette.style({aspect: this.defaultCamera.aspect});
                //this.renderer.setSize(clientWidth, clientHeight);
            } else {
                this.defaultCamera.aspect = this.node.clientWidth / this.node.clientHeight;
                this.defaultCamera.updateProjectionMatrix();
                //console.log("Node",clientWidth, clientHeight);
                //this.vignette.style({aspect: this.defaultCamera.aspect});
                //this.renderer.setSize(this.node.clientWidth, this.node.clientHeight);
            }
            const innerWidth = this.node ? this.node.clientWidth : window.innerWidth;
            const innerHeight = this.node ? this.node.clientHeight : window.innerHeight;

            //console.log("Node",innerWidth, innerHeight);
            if(this.renderer) {
                this.renderer.setSize(innerWidth, innerHeight);
            }
            
        }
        if(this.axesRenderer) {
            this.axesCamera.aspect = this.axesDiv.clientWidth / this.axesDiv.clientHeight;
            this.axesCamera.updateProjectionMatrix();
            this.axesRenderer.setSize(this.axesDiv.clientWidth, this.axesDiv.clientHeight);
        }
        

    };

    onMouseMove = (event) => {

        event.preventDefault();
        //console.log("On Movuse Move",event);
        /* this.mouse3D = new Vector3( ( event.clientX / window.innerWidth ) * 2 - 1,   
          -( event.clientY / window.innerHeight ) * 2 + 1,  
          0.5 );   */
        const myrect = this.node ? this.node.getBoundingClientRect() : { "left": 0, "top": 0 };
        const leftShift = this.node ? myrect.left : 0;
        const topShift = this.node ? myrect.top : 0;
        const innerWidth = this.node ? this.node.clientWidth : window.innerWidth;
        const innerHeight = this.node ? this.node.clientHeight : window.innerHeight;

        //console.log("Render",innerWidth,innerHeight, myrect.left, myrect.top)
        //console.log( (myrect.left / myrect.width ),myrect);
        // Detect light helper
        //sets the mouse position with a coordinate system where the center of the screen is the origin 
        //console.log(window)
        //console.log(myrect.left, myrect.width,window.innerWidth, window.outerWidth-window.innerWidth,myrect.top, myrect.height, window.innerHeight, (window.outerHeight-window.innerHeight));

        this.mouse.x = ((event.clientX - leftShift) / innerWidth) * 2 - 1;
        this.mouse.y = - ((event.clientY - topShift) / innerHeight) * 2 + 1;
        this.clientX = event.clientX;
        this.clientY = event.clientY;
        //this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1 ;
        //this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
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
            //console.log("Before",this.INTERSECTED.material.color);
            //console.log("Before", this.INTERSECTED.name,this.INTERSECTED.selectedshell, event.ctrlKey );
            if (this.props.selectedoption == SELECTMEASURE || event.ctrlKey) {
                this.INTERSECTED.selectedshell = !this.INTERSECTED.selectedshell;
            } else {
                this.INTERSECTED.selectedshell = true;
            }
            //console.log("After", this.INTERSECTED.name,this.INTERSECTED.selectedshell, event.ctrlKey );	
            this.INTERSECTED.material.color.setHex(this.INTERSECTED.currentHex);
            this.changeStateOfSelection(this.INTERSECTED, event);
            if (this.props.onClick) {
                this.props.onClick(this.INTERSECTED, SELECTDISTANCE, event);
            }
            //console.log("After",this.INTERSECTED.material.color);
            //if(this.INTERSECTED.selectedshell) this.INTERSECTED = null;
        } else {
            //console.log(event.clientX, event.clientY);
        }

    };

    touchStart = ( event ) =>{

        
        const myrect = this.node ? this.node.getBoundingClientRect() : { "left": 0, "top": 0 };
        const leftShift = this.node ? myrect.left : 0;
        const topShift = this.node ? myrect.top : 0;
        const innerWidth = this.node ? this.node.clientWidth : window.innerWidth;
        const innerHeight = this.node ? this.node.clientHeight : window.innerHeight;

        this.mouse.x = ((event.touches[ 0 ].clientX - leftShift) / innerWidth) * 2 - 1;
        this.mouse.y = - ((event.touches[ 0 ].clientY - topShift) / innerHeight) * 2 + 1;
        this.clientX = event.touches[ 0 ].clientX;
        this.clientY = event.touches[ 0 ].clientY;

        this.raycast();

    };

    updateCameraSpinUI=()=> {
        if(this.trackballWidget) {
            this.trackballWidget.position.copy( this.controls.target );
            //this.controls.target.copy(this.trackballWidget.position);
            if(this.controls.spinControl) {
                var r = this.controls.spinControl.trackballRadius;
                //console.log(r);
                r=1;
                this.trackballWidget.scale.set( r, r, r );
            }
        }
    };

    controlsStart = ( event ) => {

        if(this.controls.STATE) {
            if (event.state === this.controls.STATE.DOLLY) {
                if(this.controls.target && this.controls.target.setFromMatrixPosition && this.controls.trackballToObject) {
 
                    this.controls.target.setFromMatrixPosition(this.controls.trackballToObject);
                    var startDistance = this.controls.target.length();
                    this.raycaster.setFromCamera( this.mouse, this.defaultCamera );
                    this.controls.target.copy(this.raycaster.ray.direction);
                    this.controls.target.setLength(startDistance);
                    this.controls.target.add(this.raycaster.ray.origin);
                    this.controls.setTargetPosition(this.controls.target);
                }
    
            } else {
    
                // Turn on trackball graphics for input except dolly
                if(this.trackballWidget) {
                    this.trackballWidget.visible = true;
                    this.updateCameraSpinUI();    
                }           
            }
        }  else {
            if(this.controls.target && this.controls.target.setFromMatrixPosition && this.controls.trackballToObject) {
                this.controls.target.setFromMatrixPosition(this.controls.trackballToObject);
                var startDistance = this.controls.target.length();
                this.raycaster.setFromCamera( this.mouse, this.defaultCamera );
                this.controls.target.copy(this.raycaster.ray.direction);
                this.controls.target.setLength(startDistance);
                this.controls.target.add(this.raycaster.ray.origin);
                this.controls.setTargetPosition(this.controls.target);
            }
           
            // Turn on trackball graphics for input except dolly
            if(this.trackballWidget) {
                this.trackballWidget.visible = true;
                this.updateCameraSpinUI();    
            }   
        }    

    };

    controlsEnd = ( event ) => {
        if(this.trackballWidget) {
            if(this.controls.STATE) {
                if (event.state !== this.controls.STATE.DOLLY) {
                    
                    // Don't turn off if dolly as may still be clicking with pointer
                    this.trackballWidget.visible = false;
                    
                };
            } else {
                this.trackballWidget.visible = false;
            }
        }
    };
    
    pickControlToEnable = ( pointerNDC ) => {

        // Hit static model we want to set pivot point on
        if(this.controls) {
            this.controls.enabled = true;
        }

    };

    
    onMouseDown = ( event ) =>{
        //console.log("Down",event);
        if ( event.button === 0 ) {

            this.pickControlToEnable( this.getPointerInNdc( event.pageX, event.pageY ) );

        }	else { //if not left click then move camera
            if(this.controls) {
                this.controls.enabled = true;
            }

        }
        
    };

    onMouseUp = ( event ) => {
        //console.log("Up",event);
        if(this.controls) {
            this.controls.enabled = false;
        }

    };

    canvas = {};
	updateCanvas = () => {

        if ( this.renderer.domElement === document ) {

            this.canvas.left = 0;
            this.canvas.top = 0;
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;

        } else {

            var box = this.renderer.domElement.getBoundingClientRect();
            var d = this.renderer.domElement.ownerDocument.documentElement;
            this.canvas.left = box.left + window.pageXOffset - d.clientLeft;
            this.canvas.top = box.top + window.pageYOffset - d.clientTop;
            this.canvas.width = box.width;
            this.canvas.height = box.height;

        }

    }

    getPointerInNdc = ( pageX, pageY ) => {

        var vector = new Vector2();
        vector.set(
            ( ( pageX - this.canvas.width * 0.5 - this.canvas.left ) / ( this.canvas.width * 0.5 ) ),
            ( ( this.canvas.height + 2 * ( this.canvas.top - pageY ) ) / this.canvas.height )
        );

        return vector;

    };


    onTouchStart = ( event ) => {

        if ( !this.isTouched ) {

            this.isTouched = true;
            this.pickControlToEnable( this.getPointerInNdc(
                 event.changedTouches[ 0 ].pageX, event.changedTouches[ 0 ].pageY ) );

        }

    }

    onTouchEnd = ( event ) => {

        if( event.touches.length === 0 ) {
            if(this.controls) {
                this.controls.enabled = false;
            }
            this.isTouched = false;
        }

    }


    isObjectSame = (first, second) => {
        if (!first && !second) return true;
        if (first && !second) return false;
        if (!first && second) return false;
        if (first.name == second.name) return true;
        return false;
    }

    isObjectsSame = (first, secondArray) => {
        if (!first && !secondArray.length) {
            //console.log("I am returning true 0 length first null");
            return true;
        }
        if (!first && secondArray.length) {
            //console.log("I am returning false first null");
            return false;
        }
        if (first && !secondArray.length) {
            //console.log("I am returning false 0 length");
            return false;
        }
        var valToRet = false;
        for (var i = 0; i < secondArray.length; i++) {
            if (first.name == secondArray[i].name) {
                valToRet = true;
                break;
            }
        }
        return valToRet;

    }

    visibllity = (name, display) => {
        const first4chars = name.slice(0, 4);
        const first6chars = name.slice(0, 6);
        var visible = false;
        //console.log(this.partsMeshes[i].name,data.name,(this.partsMeshes[i].name==data.name))
        if (first4chars == "EDGE") {
            visible = (this.props.selectedoption == SELECTEDGE) || ((this.props.selectedoption == SELECTCORNER) && (display))
                || (this.props.selectedoption == SELECTMEASURE) || (this.props.selectedoption == SELECTFEATURE);
        } else {
            if (first6chars == "VERTEX") {
                visible = (this.props.selectedoption == SELECTCORNER)
                    || (this.props.selectedoption == SELECTMEASURE) || (this.props.selectedoption == SELECTFEATURE);
            } else {
                visible = ((this.props.selectedoption != SELECTEDGE) && (this.props.selectedoption != SELECTCORNER))
                    || (this.props.selectedoption == SELECTMEASURE) || (this.props.selectedoption == SELECTFEATURE);
            }
        }
        return visible;
    }

    objectFilters = () => {
        if (this.partsMeshes) {
            var objects = [];
            this.partsMeshes.forEach(element => {
                if (this.visibllity(element.name, false)) {
                    objects.push(element);
                }
            });
            return objects;
        } else {
            return this.scene.children;
        }
    }

    raycast = () => {


        //1. set the picking ray from the camera position and mouse coordinates
        this.activeCamera.updateMatrixWorld();
        this.raycaster.setFromCamera(this.mouse, this.activeCamera);

        //2. compute intersections (note the 2nd parameter)
        var intersects = this.raycaster.intersectObjects(this.objectFilters(), true);

        if (intersects.length == 0) {
            this.resetSelection();
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
                        if (this.isObjectSame(this.INTERSECTED, this.firstshell) ||
                            this.isObjectSame(this.INTERSECTED, this.secondshell) ||
                            this.isObjectsSame(this.INTERSECTED, this.state_selectedObjects)) {
                            this.setSelectionColor(this.INTERSECTED);
                            //this.INTERSECTED.material.color = this.convertColor(this.props.selectcolor || DEFAULTSELECTCOLOR) ;
                        } else {
                            this.INTERSECTED.material.color.setHex(this.INTERSECTED.currentHex);
                        }
                    }
                    this.INTERSECTED = intersects[myObject].object;
                    this.setTouchingColor(this.INTERSECTED);
                    this.setState({ intersectedShell: this.INTERSECTED });
                    if(this.controls.setTargetPosition) {
                        //console.log("Intersects", intersects[myObject],intersects[myObject].object,intersects[myObject].point );
                        this.controls.setTargetPosition(intersects[myObject].point);
                    }

                  


                    /* //if(!(this.isObjectSame(this.INTERSECTED,this.firstshell) || this.isObjectSame(this.INTERSECTED,this.secondshell))) {
                    if( (this.INTERSECTED.currentHex===null) || (typeof this.INTERSECTED.currentHex === 'undefined')){
                        this.INTERSECTED.currentHex = this.INTERSECTED.material.color.getHex();
                    } else {
                        //console.log("My color touch",this.INTERSECTED.currentHex);
                    }					
                    //}
                    this.INTERSECTED.material.color = this.convertColor( this.props.touchcolor || DEFAULTTOUCHCOLOR ); */

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
        //console.log("Getting me!");
        if(this.controls) {
            //console.log("Getting me2!");
            this.gltfJSON = this.props.gltfobj.gltf;
            this.activeFile = this.props.activefile;
            this.materialtype = this.props.materialtype;
            this.selectedoption = this.props.selectedoption;
            if (this.gltfJSON != null) {
                //console.log("Getting me3!");
                //this.gltfLoader = new GLTFLoader().setCrossOrigin('anonymous');
                //console.log(this.props.gltfobj.gltf);
                const parser = new GLTFParser( this.props.gltfobj.gltf, {

                    path: resourcePathURL || '',
                    crossOrigin: 'anonymous',
                    requestHeader: null,
                    manager: DefaultLoadingManager,
                    ktx2Loader: null,
                    meshoptDecoder: null
        
                } );
        
                const onload = ( gltf ) => {
                    this.object = gltf.scene || gltf.scenes[0];
                    this.clips = gltf.animations || [];
                    this.setContent(this.object, this.clips); 
                }
                
                const onError = (exception) => {
                    console.log(exception);
                }
    
                parser.parse( onload, onError );
    
               
            }
        }
    };


    updateChildsOfMine = (myColor, myTexture, myMetal, myRough, myOpaque, myId, whatchanged) => {
        this.props.gltfobj.tree.forEach(element => {
            if (element[gltf_Dict["parentId"]] == myId) {
                if (element[gltf_Dict["leaf"]]) {
                    if (element[gltf_Dict["name"]]) {
                        const mymesh = this.findMyMaterial(element);
                        if (mymesh) {
                            if (whatchanged == SELECTCOLOR) {
                                //console.log(this.partsMeshes[element.binId-1]);
                                //const mymaterial = this.partsMeshes[element.binId-1].material;

                                //console.log(mymesh);
                                const mymaterial = mymesh.material;
                                if (mymaterial) {
                                    mymaterial.color = myColor;
                                }
                            }
                            if (whatchanged == SELECTTEXTURE) {
                                //console.log(this.partsMeshes[element.binId-1]);
                                //const mymaterial = this.partsMeshes[element.binId-1].material;
                                const mymaterial = mymesh.material;
                                if (mymaterial) {
                                    mymaterial.map = myTexture;
                                    const uvarry = this.readUV(element.uv64);
                                    //console.log(uvarry);	
                                    if (!mymesh["setUV"]) {
                                        mymesh.geometry.setAttribute('uv', new Float32BufferAttribute(uvarry, 2));
                                        mymesh["setUV"] = true;
                                    }

                                    mymaterial.needsUpdate = true;
                                }

                            }
                            if (whatchanged == SELECTMETAL) {
                                //console.log(this.partsMeshes[element.binId-1]);
                                //const mymaterial = this.partsMeshes[element.binId-1].material;
                                const mymaterial = mymesh.material;
                                if (mymaterial) {
                                    mymaterial[gltf_Dict["metallicFactor"]] = myMetal;
                                    mymaterial.metalness = myMetal;
                                }

                            }
                            if (whatchanged == SELECTROUGH) {
                                //console.log(this.partsMeshes[element.binId-1]);
                                //const mymaterial = this.partsMeshes[element.binId-1].material;
                                const mymaterial = mymesh.material;
                                if (mymaterial) {
                                    mymaterial[gltf_Dict["roughnessFactor"]] = myRough;
                                    mymaterial.roughness = myRough;
                                }
                            }
                            if (whatchanged == SELECTOPAQUE) {
                                //console.log(this.partsMeshes[element.binId-1]);
                                //const mymaterial = this.partsMeshes[element.binId-1].material;
                                const mymaterial = mymesh.material;
                                if (mymaterial) {
                                    mymaterial.transparent = (myOpaque != 1);
                                    mymaterial.opaque = myOpaque;
                                    mymaterial.opacity = myOpaque;
                                }
                            }
                        }

                    }

                } else {
                    this.updateChildsOfMine(myColor, myTexture, myMetal, myRough, myOpaque, element[gltf_Dict["id"]], whatchanged);
                }

            }

        });

    }

    readUV = (data64) => {

        //console.log(data64);
        var blob = atob(data64),	// Base64 string converted to a char array
            fLen = blob.length / Float32Array.BYTES_PER_ELEMENT,						// How many floats can be made, but be even
            dView = new DataView(new ArrayBuffer(Float32Array.BYTES_PER_ELEMENT)),	// ArrayBuffer/DataView to convert 4 bytes into 1 float.
            fAry = new Float32Array(fLen),											// Final Output at the correct size
            p = 0;																// Position

        for (var j = 0; j < fLen; j++) {
            p = j * 4;
            dView.setUint8(0, blob.charCodeAt(p));
            dView.setUint8(1, blob.charCodeAt(p + 1));
            dView.setUint8(2, blob.charCodeAt(p + 2));
            dView.setUint8(3, blob.charCodeAt(p + 3));
            fAry[j] = dView.getFloat32(0, true);
        }
        return fAry;
    }

    assignUVs = (geometry) => {

        if (geometry.faces) {
            if (geometry.faceVertexUvs) {
                geometry.faceVertexUvs[0] = [];
            } else {
                geometry["faceVertexUvs"] = [];
                geometry["faceVertexUvs"][0] = [];
            }


            geometry.faces.forEach((face) => {

                var uvs = [];
                var ids = ['a', 'b', 'c'];
                for (var i = 0; i < ids.length; i++) {
                    var vertex = geometry.vertices[face[ids[i]]].clone();

                    var n = vertex.normalize();
                    var yaw = .5 - Math.atan(n.z, - n.x) / (2.0 * Math.PI);
                    var pitch = .5 - Math.asin(n.y) / Math.PI;

                    var u = yaw,
                        v = pitch;
                    uvs.push(new Vector2(u, v));
                }
                geometry.faceVertexUvs[0].push(uvs);
            });

            geometry.uvsNeedUpdate = true;
        }

    }

    onlyfaces = (name) => {

        const first4chars = name.slice(0, 4);
        const first6chars = name.slice(0, 6);
        if ((first4chars == "EDGE") || (first6chars == "VERTEX")) {
            return false;
        }
        return true;
    }

    findSingleNode = (mynode) => {
        return [mynode];

    }

    findSiblingNodes = (mynode) => {
        //console.log(this.props.selectedoption,SELECTSOLID,this.props.selectedoption != SELECTSOLID);
        var myParentID = -1;
        for (var i = 0; i < this.props.gltfobj.tree.length; i++) {
            if (this.props.gltfobj.tree[i][gltf_Dict["name"]] == mynode.name) {
                myParentID = this.props.gltfobj.tree[i][gltf_Dict["parentId"]];
                break;
            }
        }
        var myMaterials = [];
        if (myParentID != -1) {
            for (var i = 0; i < this.props.gltfobj.tree.length; i++) {
                if (this.props.gltfobj.tree[i][gltf_Dict["parentId"]] == myParentID) {
                    var myChild = this.findMyMaterial(this.props.gltfobj.tree[i]);
                    if (myChild) {
                        if (this.onlyfaces(myChild.name)) {
                            myMaterials.push(myChild);
                        }
                    }
                }
            }
        }
        if (myMaterials.length != 0) {
            return myMaterials;
        }
        return [mynode];
    }

    findMyMaterial = (data) => {
        if (this.partsMeshes) {

            for (var i = 0; i < this.partsMeshes.length; i++) {
                //console.log(this.partsMeshes[i].name,data.name,(this.partsMeshes[i].name==data.name))
                if (this.partsMeshes[i].name == data[gltf_Dict["name"]]) {
                    return this.partsMeshes[i];
                }
            }
        };
        return null;
    }


    findFamilyNodes = (mynode) => {

        var myParentID = -1;
        var myID = -1;
        for (var i = 0; i < this.props.gltfobj.tree.length; i++) {
            if (this.props.gltfobj.tree[i][gltf_Dict["name"]] == mynode.name) {
                myParentID = this.props.gltfobj.tree[i][gltf_Dict["parentId"]];
                myID = this.props.gltfobj.tree[i][gltf_Dict["id"]];
                break;
            }
        }
        //console.log("Parent", myParentID, myID);
        var myMaterials = [];
        if (myParentID != -1) {
            var myParentsParentID = -1;
            for (var i = 0; i < this.props.gltfobj.tree.length; i++) {
                if (this.props.gltfobj.tree[i][gltf_Dict["id"]] == myParentID) {
                    myParentsParentID = this.props.gltfobj.tree[i][gltf_Dict["parentId"]];
                    break;
                }
            }
            //console.log("Parent", myParentsParentID, myParentID, myID);
            var myParents = [];
            if (myParentsParentID == -1) { //RootNode
                //console.log("Pushing", myParentsParentID, myParentID, myID);
                myParents.push(myID);
            } else {
                for (var i = 0; i < this.props.gltfobj.tree.length; i++) {
                    if ((this.props.gltfobj.tree[i][gltf_Dict["parentId"]] == myParentsParentID)) {
                        myParents.push(this.props.gltfobj.tree[i][gltf_Dict["id"]]);
                    }
                }
            }
            //console.log(myParents);
            for (var j = 0; j < myParents.length; j++) {
                myParentID = myParents[j];
                for (var i = 0; i < this.props.gltfobj.tree.length; i++) {
                    if (this.props.gltfobj.tree[i][gltf_Dict["parentId"]] == myParentID) {
                        var myChild = this.findMyMaterial(this.props.gltfobj.tree[i]);
                        if (myChild) {
                            if (this.onlyfaces(myChild.name)) {
                                myMaterials.push(myChild);
                            }
                        }
                    }
                }
            }

        }
        if (myMaterials.length != 0) {
            return myMaterials;
        }
        return [mynode];
    }

    findMyParentChilds = (mynode) => {
        //console.log(this.props.selectedoption,SELECTSOLID,this.props.selectedoption != SELECTSOLID);
        if (((this.props.selectedoption != SELECTSOLID) && ((this.props.selectedoption != SELECTASSEMBLY))) ||
            (this.props.splitmethod != SELECTDISECTPARTS)) {
            return this.findSingleNode(mynode);
        }
        if (this.props.selectedoption == SELECTASSEMBLY) {
            return this.findFamilyNodes(mynode);
        } else {
            return this.findSiblingNodes(mynode);
        }

    }

    changeBackground = () => {
        if (this.databackcolor != this.props.backcolor && (this.props.dataselection == SELECTBACKCOLOR)) {
            this.databackcolor = this.props.backcolor;
            //console.log(this.databackcolor);
            if (this.renderer) {
                if (this.scene) {
                    this.scene.background = null;
                }
                this.renderer.setClearColor(this.databackcolor || DEFAULTBACKCOLOR);
            }
        }
        if (this.dataselectcolor != this.props.selectcolor && (this.props.dataselection == SELECTSELECTCOLOR)) {
            this.dataselectcolor = this.props.selectcolor;
            if (this.firstshell) {
                if (this.firstshell.selectedshell) {
                    this.firstshell.material.color = this.convertColor(this.props.selectcolor || DEFAULTSELECTCOLOR);
                }
            }
            if (this.secondshell) {
                if (this.secondshell.selectedshell) {
                    this.secondshell.material.color = this.convertColor(this.props.selectcolor || DEFAULTSELECTCOLOR);
                }
            }
        }
        if (this.datatouchcolor != this.props.touchcolor && (this.props.dataselection == SELECTTOUCHCOLOR)) {
            this.datatouchcolor = this.props.touchcolor;
            if (this.INTERSECTED) {
                this.INTERSECTED.material.color = this.convertColor(this.props.touchcolor || DEFAULTTOUCHCOLOR);
            }
        }
        //console.log("data2texture",this.data2texture,"prp2",this.props.data2texture,this.props.dataselection )
        if (this.data2texture != this.props.data2texture && (this.props.dataselection == SELECT2DTEXTURE)) {
            this.data2texture = this.props.data2texture;
            var myTexture = null;
            if (this.scene) {

                if (this.data2texture == "None" || this.data2texture == null) {
                    myTexture = null;
                } else {
                    const textureLoader = new TextureLoader();
                    //console.log(this.data2texture);
                    myTexture = textureLoader.load(resourcePathBase + this.data2texture)
                }
                this.scene.background = myTexture;
                if (!myTexture) {
                    if (this.renderer) {
                        this.renderer.setClearColor(this.databackcolor || DEFAULTBACKCOLOR);
                    }
                }
            }
        }
        //console.log("data3texture",this.data3texture,"prp3",this.props.data23texture,this.props.dataselection )
        if (this.data3texture != this.props.data3texture && (this.props.dataselection == SELECT3DTEXTURE)) {
            this.data3texture = this.props.data3texture;
            var myTexture = null;
            if (this.scene) {

                if (this.data3texture == "None" || this.data3texture == null) {
                    myTexture = null;
                } else {
                    const textureLoader = new CubeTextureLoader();
                    //console.log(this.data3texture);
                    myTexture = textureLoader.load([
                        resourcePathBase + this.data3texture + '-px.jpg',
                        resourcePathBase + this.data3texture + '-nx.jpg',
                        resourcePathBase + this.data3texture + '-py.jpg',
                        resourcePathBase + this.data3texture + '-ny.jpg',
                        resourcePathBase + this.data3texture + '-pz.jpg',
                        resourcePathBase + this.data3texture + '-nz.jpg'
                    ])
                }
                this.scene.background = myTexture;
                if (!myTexture) {
                    if (this.renderer) {
                        this.renderer.setClearColor(this.databackcolor || DEFAULTBACKCOLOR);
                    }
                }
            }
        }
    }

    setTouchingColor = (meshmaterial) => {
        /* if(!(this.isObjectSame(meshmaterial,this.firstshell)||this.isObjectSame(meshmaterial,this.firstshell ))) {
            if( (meshmaterial.currentHex === null) || (typeof meshmaterial.currentHex === 'undefined')){
                meshmaterial.currentHex = meshmaterial.material.color.getHex();
            } else {
                //console.log("My color1",meshmaterial.currentHex);
            }
        } else { */
        if ((meshmaterial.currentHex === null) || (typeof meshmaterial.currentHex === 'undefined')) {
            meshmaterial.currentHex = meshmaterial.material.color.getHex();
        } else {
            //console.log("My color2",meshmaterial.currentHex);
        }
        /*}*/
        //console.log("before",meshmaterial.material.color);
        meshmaterial.material.color = this.convertColor(this.props.touchcolor || DEFAULTTOUCHCOLOR); // this.props.distanceColor || distanceColor);						
        //console.log("after",meshmaterial.material.color);
    }

    setSelectionColor = (meshmaterial) => {
        /* if(!(this.isObjectSame(meshmaterial,this.firstshell)||this.isObjectSame(meshmaterial,this.firstshell ))) {
            if( (meshmaterial.currentHex === null) || (typeof meshmaterial.currentHex === 'undefined')){
                meshmaterial.currentHex = meshmaterial.material.color.getHex();
            } else {
                //console.log("My color1",meshmaterial.currentHex);
            }
        } else { */
        if ((meshmaterial.currentHex === null) || (typeof meshmaterial.currentHex === 'undefined')) {
            meshmaterial.currentHex = meshmaterial.material.color.getHex();
        } else {
            //console.log("My color2",meshmaterial.currentHex);
        }
        /*}*/
        //console.log("before",meshmaterial.material.color);
        meshmaterial.material.color = this.convertColor(this.props.selectcolor || DEFAULTSELECTCOLOR); // this.props.distanceColor || distanceColor);						
        //console.log("after",meshmaterial.material.color);
    }


    changeStateOfSelection = (meshmaterial, event) => {
        if (meshmaterial && this.props.selectedoption == SELECTMEASURE) {
            if (meshmaterial.selectedshell) {
                if (!this.firstshell) {
                    this.setSelectionColor(meshmaterial);
                    //console.log(meshmaterial.material.color.getHex(),0xffffff-meshmaterial.material.color.getHex());

                    this.firstshell = meshmaterial;
                    //console.log("firstshell",meshmaterial,this.firstshell,this.secondshell);
                } else {
                    if (!this.secondshell) {
                        this.setSelectionColor(meshmaterial);
                        //console.log(meshmaterial.material.color.getHex(),0xffffff-meshmaterial.material.color.getHex());

                        this.secondshell = meshmaterial;
                        //console.log("secondshell",meshmaterial,this.firstshell,this.secondshell);
                    } else {
                        this.setSelectionColor(meshmaterial);
                        //console.log(meshmaterial.material.color.getHex(),0xffffff-meshmaterial.material.color.getHex());

                        this.firstshell.material.color.setHex(this.firstshell.currentHex);
                        this.firstshell.selectedshell = false;
                        this.firstshell = this.secondshell;
                        this.secondshell = meshmaterial;
                        //console.log("First and second",this.firstshell,this.secondshell,meshmaterial);
                    }
                }

            } else {
                if (this.firstshell && (this.firstshell.name == meshmaterial.name)) {
                    this.firstshell.material.color.setHex(this.firstshell.currentHex);
                    this.firstshell.selectedshell = false;
                    this.firstshell = this.secondshell;
                    this.secondshell = null;
                    //console.log("First and second making null",this.firstshell,this.secondshell)
                } else {
                    if (this.secondshell && (this.secondshell.name == meshmaterial.name)) {
                        this.secondshell.material.color.setHex(this.secondshell.currentHex);
                        this.secondshell.selectedshell = false;
                        this.secondshell = null;
                        //console.log("First and second only null",this.firstshell,this.secondshell)										
                    } else {
                        //console.log("This condition is not possible");
                    }
                }
            }
        } else {
            if (meshmaterial) {
                var toAdd = true;
                if (event) {
                    toAdd = event.ctrlKey;
                }
                if (!toAdd) {
                    this.state_selectedObjects.forEach(elementobject => {
                        if (meshmaterial.name != elementobject.name) {
                            elementobject.selectedshell = false;
                            elementobject.material.color.setHex(elementobject.currentHex);
                        }
                    });
                }
                const myAllChilds = this.findMyParentChilds(meshmaterial);
                var copy_selectobjects = this.arrayCopy(this.state_selectedObjects);
                myAllChilds.forEach(element => {
                    element.selectedshell = meshmaterial.selectedshell;
                    if (meshmaterial.selectedshell) {
                        this.setSelectionColor(element);
                    } else {
                        element.material.color.setHex(element.currentHex);
                    }
                    if (toAdd) {
                        if (meshmaterial.selectedshell) {
                            var alreadyPresent = false;
                            for (var i = 0; i < this.state_selectedObjects.length; i++) {
                                if (element.name == this.state_selectedObjects[i].name) {
                                    alreadyPresent = true;
                                    break;
                                }
                            }
                            if (!alreadyPresent) {
                                this.state_selectedObjects.push(element);
                                /* this.setState(prevState => ({
                                    selectedObjects: [...prevState.selectedObjects, meshmaterial]					  
                                })); */
                                //this.setSelectionColor(meshmaterial);
                            }

                        } else {
                            copy_selectobjects = this.arrayRemove(copy_selectobjects, element.name);
                            this.state_selectedObjects = copy_selectobjects;
                            //this.setState({selectedObjects:selectedObjects});

                        }
                    } else {

                        if (meshmaterial.selectedshell) {
                            this.state_selectedObjects = myAllChilds;
                            //this.setState({selectedObjects:[meshmaterial]});
                            //this.setSelectionColor(meshmaterial);
                        } else {
                            this.state_selectedObjects = [];
                            //this.setState({selectedObjects:[]});
                            //meshmaterial.material.color.setHex( meshmaterial.currentHex );
                        }

                    }
                });

            }
        }
    }

    changeparts = () => {

        const changedata = this.props.changedata;

        if (this.props.whatchanged != this.whatchanged ||
            changedata[gltf_Dict["name"]] != this.activeId ||
            ((this.props.whatchanged == SELECTCOLOR) &&
                (this[gltf_Dict["R"]] != changedata[gltf_Dict["R"]] || 
                this[gltf_Dict["G"]] != changedata[gltf_Dict["G"]] || 
                this[gltf_Dict["B"]] != changedata[gltf_Dict["B"]])) ||
            ((this.props.whatchanged == SELECTTEXTURE) && (changedata[gltf_Dict["texture"]]) &&
                (this[gltf_Dict["texture"]] != changedata[gltf_Dict["texture"]].name)) ||
            ((this.props.whatchanged == SELECTMETAL) &&
                (this.datametal != changedata[gltf_Dict["metallicFactor"]])) ||
            ((this.props.whatchanged == SELECTROUGH) &&
                (this.datarough != changedata[gltf_Dict["roughnessFactor"]])) ||
            ((this.props.whatchanged == SELECTOPAQUE) &&
                (this.dataopaque != changedata[gltf_Dict["A"]])) ||
            ((this.props.whatchanged == SELECTDISTANCE) &&
                (this.selectedshell != changedata.selectedshell))
        ) {
            this.whatchanged = this.props.whatchanged;
            this.activeId = changedata[gltf_Dict["name"]];

            if (this.props.whatchanged == SELECTCOLOR) {
                this[gltf_Dict["R"]] = changedata[gltf_Dict["R"]];
                this[gltf_Dict["G"]] = changedata[gltf_Dict["G"]];
                this[gltf_Dict["B"]] = changedata[gltf_Dict["B"]];
                //console.log(changedata);
                if (changedata[gltf_Dict["leaf"]]) {
                    if (changedata[gltf_Dict["name"]]) {
                        //console.log(this.partsMeshes[changedata.binId-1]);
                        //const mymaterial = this.partsMeshes[element.binId-1].material;
                        const mymesh = this.findMyMaterial(changedata);
                        if (mymesh) {
                            const mymaterial = mymesh.material;
                            //console.log("1",mymaterial);
                            if (mymaterial) {
                                mymaterial.color = new Color(changedata[gltf_Dict["R"]], 
                                    changedata[gltf_Dict["G"]], changedata[gltf_Dict["B"]]);
                            }
                        }

                    }
                } else {
                    this.updateChildsOfMine(new Color(changedata[gltf_Dict["R"]], 
                        changedata[gltf_Dict["G"]], changedata[gltf_Dict["B"]]), 
                        null, null, null, null, changedata[gltf_Dict["id"]], this.props.whatchanged);
                }

            }
            var myTexture = null;
            if ((this.props.whatchanged == SELECTTEXTURE) && (changedata[gltf_Dict["texture"]])) {
                this[gltf_Dict["texture"]] = changedata[gltf_Dict["texture"]].name;
                //console.log(changedata);
                if (changedata[gltf_Dict["leaf"]]) {
                    if (changedata[gltf_Dict["name"]]) {
                        //console.log(this.partsMeshes[changedata.binId-1]);
                        //const mymaterial = this.partsMeshes[element.binId-1].material;
                        const mymesh = this.findMyMaterial(changedata);
                        if (mymesh) {
                            const mymaterial = mymesh.material;
                            //console.log("2",mymaterial);
                            if (mymaterial) {

                                if (this[gltf_Dict["texture"]] == "None") {
                                    myTexture = null;
                                } else {
                                    const textureLoader = new TextureLoader();
                                    myTexture = textureLoader.load(resourcePathBase + this[gltf_Dict["texture"]])
                                    /* myTexture.wrapT = RepeatWrapping;
                                    myTexture.wrapS = RepeatWrapping;
                                    myTexture.repeat.set( 9, 1 ); */
                                }
                                mymaterial.map = myTexture;
                                mymaterial.needsUpdate = true;
                                //console.log(mymaterial);
                                const uvarry = this.readUV(changedata.uv64);
                                //console.log(uvarry);
                                if (!mymesh["setUV"]) {
                                    mymesh.geometry.setAttribute('uv', new Float32BufferAttribute(uvarry, 2));
                                    mymesh["setUV"] = true;
                                }									//this.updateTexture( mymaterial, 'roughnessMap',this.roughnessMaps()  );
                            }
                        }
                    }
                } else {

                    if (this[gltf_Dict["texture"]] == "None") {
                        myTexture = null;
                    } else {
                        const textureLoader = new TextureLoader();
                        myTexture = textureLoader.load(resourcePathBase + this[gltf_Dict["texture"]])
                        /* myTexture.wrapT = RepeatWrapping;
                        myTexture.wrapS = RepeatWrapping;
                        myTexture.repeat.set( 9, 1 ); */

                    }
                    this.updateChildsOfMine(null, myTexture, null, null, null, 
                        changedata[gltf_Dict["id"]], this.props.whatchanged);
                }

            }
            if (this.props.whatchanged == SELECTMETAL) {
                this.datametal = changedata[gltf_Dict["metallicFactor"]];
                if (changedata[gltf_Dict["leaf"]]) {
                    if (changedata[gltf_Dict["name"]]) {
                        //console.log(this.partsMeshes[changedata.binId-1]);
                        //const mymaterial = this.partsMeshes[element.binId-1].material;
                        const mymesh = this.findMyMaterial(changedata);
                        if (mymesh) {
                            const mymaterial = mymesh.material;
                            if (mymaterial) {
                                mymaterial[gltf_Dict["metallicFactor"]] = changedata[gltf_Dict["metallicFactor"]];
                                mymaterial.metalness = changedata[gltf_Dict["metallicFactor"]];
                            }
                            //console.log(mymaterial);
                        }
                    }
                } else {
                    this.updateChildsOfMine(null, null, changedata[gltf_Dict["metallicFactor"]], 
                        null, null, changedata[gltf_Dict["id"]], this.props.whatchanged);
                }

            }
            if (this.props.whatchanged == SELECTROUGH) {
                this.datarough = changedata[gltf_Dict["roughnessFactor"]];
                if (changedata[gltf_Dict["leaf"]]) {
                    if (changedata[gltf_Dict["name"]]) {
                        //console.log(this.partsMeshes[changedata.binId-1]);
                        //const mymaterial = this.partsMeshes[element.binId-1].material;
                        const mymesh = this.findMyMaterial(changedata);
                        if (mymesh) {
                            const mymaterial = mymesh.material;
                            if (mymaterial) {
                                mymaterial[gltf_Dict["roughnessFactor"]] = changedata[gltf_Dict["roughnessFactor"]];
                                mymaterial.roughness = changedata[gltf_Dict["roughnessFactor"]];
                            }
                            //console.log(mymaterial);
                        }
                    }
                } else {
                    this.updateChildsOfMine(null, null, null, changedata[gltf_Dict["roughnessFactor"]], 
                        null, changedata[gltf_Dict["id"]], this.props.whatchanged);
                }

            }
            if (this.props.whatchanged == SELECTOPAQUE) {
                this.dataopaque = changedata[gltf_Dict["A"]];
                if (changedata[gltf_Dict["leaf"]]) {
                    if (changedata[gltf_Dict["name"]]) {
                        //console.log(this.partsMeshes[changedata.binId-1]);
                        //const mymaterial = this.partsMeshes[element.binId-1].material;
                        const mymesh = this.findMyMaterial(changedata);
                        if (mymesh) {
                            const mymaterial = mymesh.material;
                            if (mymaterial) {
                                mymaterial.transparent = (changedata[gltf_Dict["A"]] != 1);
                                mymaterial.opaque = changedata[gltf_Dict["A"]];
                                mymaterial.opacity = changedata[gltf_Dict["A"]];
                            }
                        }
                    }
                } else {
                    this.updateChildsOfMine(null, null, null, null, 
                        changedata[gltf_Dict["A"]], changedata[gltf_Dict["id"]], this.props.whatchanged);
                }

            }
            if (this.props.whatchanged == SELECTDISTANCE) {
                //console.log(changedata);
                this.selectedshell = changedata.selectedshell;
                if (changedata[gltf_Dict["leaf"]]) {
                    if (changedata[gltf_Dict["name"]]) {
                        //console.log(this.partsMeshes[changedata.binId-1]);
                        //const mymaterial = this.partsMeshes[element.binId-1].material;
                        const mymesh = this.findMyMaterial(changedata);
                        mymesh.selectedshell = changedata.selectedshell;
                        //console.log("Before",mymesh);
                        if (mymesh) {
                            this.changeStateOfSelection(mymesh, null);
                        }
                        //console.log("After",mymesh);
                    }

                }
            }
        }
    }

    changeMaterialStats(material) {
        material.wireframe = this.state.wiremesh;
        material.depthTest = true;
        material.depthWrite = this.state.opaque == "True" ? true : this.state.opaque == "False" ? false : !material.transparent;
        material.side = this.state.side == "Front" ? FrontSide : this.state.side == "Back" ? BackSide : DoubleSide;
        //console.log(material);

    }

    resetSelection() {
        if (this.INTERSECTED) {
            if (this.isObjectSame(this.INTERSECTED, this.firstshell) ||
                this.isObjectSame(this.INTERSECTED, this.secondshell) ||
                this.isObjectsSame(this.INTERSECTED, this.state_selectedObjects)) {
                this.setSelectionColor(this.INTERSECTED);
                //this.INTERSECTED.material.color=this.convertColor(this.props.selectcolor || DEFAULTSELECTCOLOR);
            } else {
                this.INTERSECTED.material.color.setHex(this.INTERSECTED.currentHex);
            }
            this.INTERSECTED = null;
            this.setState({ intersectedShell: this.INTERSECTED });
            if(this.controls.target && this.controls.target.setFromMatrixPosition && this.controls.trackballToObject) {
                // Move trackball to center of screen if not clicking on anything.
                this.controls.target.setFromMatrixPosition(this.controls.trackballToObject);
                var startDistance = this.controls.target.length();
                this.controls.target.set(0, 0, -startDistance);
                this.controls.target.applyQuaternion(this.defaultCamera.quaternion);
                this.controls.target.add(this.defaultCamera.position);
                this.controls.setTargetPosition(this.controls.target);
			}
        }
    }

    getNameID = (name) => {
        if ((this.props.selectedoption != SELECTSOLID) ||
            (this.props.splitmethod != SELECTDISECTPARTS)) {
            return name;
        }
        var myParentID = -1;
        for (var i = 0; i < this.props.gltfobj.tree.length; i++) {
            if (this.props.gltfobj.tree[i][gltf_Dict["name"]] == name) {
                myParentID = this.props.gltfobj.tree[i][gltf_Dict["parentId"]];
                break;
            }
        }
        var myParentName = "";
        if (myParentID != -1) {
            for (var i = 0; i < this.props.gltfobj.tree.length; i++) {
                if (this.props.gltfobj.tree[i][gltf_Dict["id"]] == myParentID) {
                    myParentName = this.props.gltfobj.tree[i][gltf_Dict["name"]];
                    break;
                }
            }
        }
        if (myParentName != "") {
            return myParentName;
        }
        return name;
    }
    arrayRemove = (arr, value) => {

        return arr.filter(function (ele) {
            return ele.name != value;
        });
    }
    arrayCopy = (arr) => {
        var copy_selectobjects = [];

        arr.forEach(element => {
            copy_selectobjects.push(element);
        });
        return copy_selectobjects;
    }
    selectAllSelectedSolids = () => {
        var copy_selectobjects = this.arrayCopy(this.state_selectedObjects);
        copy_selectobjects.forEach(meshmaterial => {
            const myAllChilds = this.findMyParentChilds(meshmaterial);
            //console.log(myAllChilds);
            myAllChilds.forEach(elementdata => {
                var alreadyPresent = false;
                for (var i = 0; i < this.state_selectedObjects.length; i++) {
                    if (elementdata.name == this.state_selectedObjects[i].name) {
                        alreadyPresent = true;
                        break;
                    }
                }
                if (!alreadyPresent) {
                    this.state_selectedObjects.push(elementdata);
                    elementdata.selectedshell = true;
                    this.setSelectionColor(elementdata);
                }
            });
        });
    }

    render() {
        if (this.activeFile != this.props.activefile ||
            this.materialtype != this.props.materialtype ||
            this.selectedoption != this.props.selectedoption) {
            if (this.selectedoption == SELECTMEASURE || this.props.selectedoption == SELECTMEASURE) {
                if (this.secondshell) {
                    this.secondshell.material.color.setHex(this.secondshell.currentHex);
                    this.secondshell.selectedshell = false;
                }
                if (this.firstshell) {
                    this.firstshell.material.color.setHex(this.firstshell.currentHex);
                    this.firstshell.selectedshell = false;
                }
                this.state_selectedObjects.forEach(element => {
                    element.material.color.setHex(element.currentHex);
                    element.selectedshell = false;
                });
                this.secondshell = null;
                this.firstshell = null;
                this.state_selectedObjects = [];
                //this.setState({selectedObjects:[]});
            }
            if (((this.props.selectedoption == SELECTSOLID) && (this.selectedoption != SELECTASSEMBLY))
                || (this.props.selectedoption == SELECTASSEMBLY)) {
                //console.log("Got Here", this.props.selectedoption);
                this.selectAllSelectedSolids();
            }
            //console.log("Ha Ha getting here!");
            this.alter();
        }
        if (this.renderer) {
            this.changeBackground();
            this.renderer.render(this.scene, this.activeCamera);
            if (this.state.grid && this.axesRenderer) {
                this.axesCamera.position.copy(this.defaultCamera.position)
                this.axesCamera.lookAt(this.axesScene.position)
                this.axesRenderer.render(this.axesScene, this.axesCamera);
            }
            this.changeparts();
        }

        return (
            <div
                style={{ width: "100%", height: "600px" }}
                ref={el => (this.node = el)}>
                <div
                    style={{
                        display: this.state.intersectedShell ? 'block' : 'block',
                        position: 'fixed',
                        top: this.clientY + 10,
                        left: this.clientX + 10,
                        color: DEFAULTTEXTCOLOR,
                        ...this.props.style,
                    }}
                >
                    {this.state.intersectedShell ? this.getNameID(this.state.intersectedShell.name) : ""}
                </div>

            </div>

        );
    }
}

export default GLTFRenderer;