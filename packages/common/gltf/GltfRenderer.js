import React, { Component } from 'react';
import {
  Scene,
  Color,
  PerspectiveCamera,
  WebGLRenderer,
  AmbientLight,
  AnimationMixer,
  AxesHelper,
  Box3,
  Points,
  Matrix4,
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
  OrthographicCamera,
  PlaneGeometry,
  Mesh,
  LineBasicMaterial,
  PointsMaterial,
  BufferGeometry,
  PlaneBufferGeometry,
  Line,
  Object3D,
  Group,
  CatmullRomCurve3
  /*
    LineSegments,    
    Mesh,
    Group,
    SphereBufferGeometry,
    BoxBufferGeometry, 
    ObjectSpaceNormalMap
    */
} from 'three';

//import {Line2, LineMaterial} from '@three/examples/js/lines';

//import * as THREE from 'three';
import { Float32BufferAttribute } from './BufferAttribute.js';
//import Stats from 'three/examples/jsm/libs/stats.module.js';
import { GLTFLoader, GLTFParser } from './gltfloader.js';
//import { OrbitControls } from './OrbitControl.js';//'three/examples/jsm/controls/OrbitControls.js';
import { GUI } from './GUI.js';
//import CameraSpinControls from './CameraSpinControls.js';
import { TrackballControls } from './TrackballControls.js';

/*
import LineGeometry from './lines/LineGeometry.js';
import LineMesh from './lines/LineMesh.js';
import LineMaterial from './lines/LineMaterial.js';
*/
import { NURBSCurve } from './curves/NURBSCurve.js';

import MeshLine from './MeshLine/MeshLine.js';
import MeshLineMaterial from './MeshLine/MeshLineMaterial.js';
import MeshLineGeometry from './MeshLine/MeshLineGeometry.js';

import {
  resourcePathURL,
  resourcePathBase,
  getAFileFromStore,
  getAFileFromURLStore,
  checkExistingPathFromStore,
  saveGDTInfo
} from '@monostruct/common/api/fileUpload.api.js';
import { stringify } from './Flatted.js';
import {
  SELECTCOLOR,
  SELECTTEXTURE,
  SELECTMETAL,
  SELECTROUGH,
  SELECTOPAQUE,
  SELECTBACKCOLOR,
  SELECTSELECTCOLOR,
  SELECTTOUCHCOLOR,
  gltf_Dict,
  defaultGDTTable,
  SELECT2DTEXTURE,
  SELECT3DTEXTURE,
  SELECTANITEM,
  DEFAULTEDGECOLOR,
  SELECTSOLID,
  SELECTEDGE,
  SELECTCORNER,
  SELECTFACE,
  SELECTLINEAR,
  SELECTCIRCULAR,
  SELECTMEASURE,
  SELECTDISECTPARTS,
  SELECTASSEMBLY,
  SELECTFEATURE,
  SELECTLOADEDGES,
  DEFAULTBACKCOLOR,
  DEFAULTSELECTCOLOR,
  DEFAULTTOUCHCOLOR,
  DEFAULTTEXTCOLOR,
  waitFunction,
  hexToRGB,
  //arrayCopy,
  arrayRemoveFromValue,
  arrayRemoveFromMesh,
  pollFunction,
  isEmptyObjectDictionary,
  elementCopy,
  arrayCopy
} from './Tree/utils';
import './styles/style.css';

import Grid from '@mui/material/Grid';

import Popper from '@mui/material/Popper';

//import { MuiThemeProvider, createMuiTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import GroupFormBuilder from './GroupFormBuilder';
import ModelessDialog from './ModelessDialog';
import { myMenus } from './gltfMenus';
import { CircularProgress, ClickAwayListener, Snackbar } from '@mui/material';
import RotateLeftSharpIcon from '@mui/icons-material/RotateLeftSharp';
import AcUnitSharpIcon from '@mui/icons-material/AcUnitSharp';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import withStyles from '@mui/styles/withStyles';
import { Typography } from '@mui/material';
import MuiAlert from '@mui/material/Alert';
//import { Box } from '@mui/material';

/* const useStyles = makeStyles({ // It throws error if i use this, i dont know///
  table: {
    minWidth: 400
  },
  tableRow: {
    height: 30    
  },
  tableCell: {
    padding: "0px 8px",
    whiteSpace: "normal",
    wordWrap: "break-word",
    wordBreak: "break-all"
  }
});
 */
const StyledTableRow = withStyles((theme) => ({
  root: {
    height: 30,
    '&:nth-of-type(odd)': {
      backgroundColor: 'white'
    },
    '&:nth-of-type(even)': {
      backgroundColor: '#FAFAFA'
    }
  }
}))(TableRow);

const StyledTableCell = withStyles((theme) => ({
  root: {
    padding: '0px 12px'
  }
}))(TableCell);

//import { Box } from "@mui/material";

//import { motion } from 'framer-motion'
//import styled from 'styled-components'

/* const SquareDiv = styled(motion.div)`
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
  
`; */
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
  'specularMap'
];

const Preset = { ASSET_GENERATOR: 'assetgenerator' };

Cache.enabled = false; //If it is true, sometime crashes..

const traverseMaterials = (object, callback) => {
  object
    ? object.traverse((node) => {
        if (!node.isMesh) return;
        const materials = Array.isArray(node.material)
          ? node.material
          : [node.material];
        materials.forEach(callback);
      })
    : '';
};

class GLTFRenderer extends Component {
  /* theme = createMuiTheme({
        palette: {
          primary: { main: '#8BC3D1' },
        },
      }); */

  //classes = useStyles();

  openEl = new Array(myMenus.length);
  idEl = new Array(myMenus.length);
  this_state_gltf = null;
  this_progress_data = null;
  state = {
    playbackSpeed: 1.0,
    actionStates: {},
    camera: DEFAULT_CAMERA,
    wiremesh: false,
    castshadow: false,
    opaque: 'True',
    skeleton: false,
    showedges: true,
    grid: false,
    side: 'Front',
    view: 'Orthographic',
    zoomSpeed: 0.3,
    rotateSpeed: 2.0,
    panSpeed: 1.0,
    zoomToCursor: true,
    maxZoomIn: 50.0,
    maxZoomOut: 50.0,
    animationSpeed: 1.0,
    animationTime: 0,
    pauseAnimation: 'Continue',
    // Lights
    addLights: true,
    exposure: 1.0,
    textureEncoding: 'sRGB',
    ambientIntensity: 0.0,
    ambientColor: 0xffffff,
    directIntensity: 2.0,
    directColor: 0xffffff,
    partsSelection: [],
    intersectedShell: null,
    intersectedShellName: '',
    anchorEls: new Array(myMenus.length),
    selectedmenu: 0,
    displaytext: null,
    isProgressOpen: false,
    progressOpenedFiles: [],
    snackBarMessage: '',
    snackBarAlertType: '',
    snackBarState: false,
    progressBarRender: false,
    lastClickedNode: null,
    autoHideDuration: 1000,
    edgelinewidth: 2.0,
    freezeNonSelection: false
    //gltfobj:this.props.gltfobj
  };
  state_selectedObjects = [];

  gltfJSON = null;
  gltfobj = null;
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
  databackcolor = DEFAULTBACKCOLOR();
  dataselectcolor = DEFAULTSELECTCOLOR();
  datatouchcolor = DEFAULTTOUCHCOLOR();
  data2texture = 'None';
  data3texture = 'None';
  selectedshell = false;
  firstshell = null;
  secondshell = null;
  clientX = 0;
  clientY = 0;
  INTERSECTED = null;
  SELECTED = null;
  mouse = new Vector2(Infinity, Infinity);
  selectedoption = SELECTMEASURE;
  changeddataarray = [];
  changedctrlkey = false;
  changeState = false;
  activeDataTable = 0;
  constructor(props) {
    super(props);
    this.node = React.createRef();
    this.this_state_gltf = null;
    this.this_progress_data = null;
    //this.nodeguiparent = React.createRef;
    //this.nodegui = React.createRef();
  }

  componentDidMount() {
    this.init();
  }

  componentWillUnmount() {
    this.cleanup();
  }

  /* static getDerivedStateFromProps(props, current_state) {
        //console.log("derivedstate",props, current_state);
        if (current_state.gltfobj.gltf !== props.gltfobj.gltf) {
          return {
            gltfobj: props.gltfobj
          }
        }
        return null;
    } */
  /*
    defaultGDTTable = {
        "edges":[],
        "selectedObjects":[],
        "parentObjects":[],
        "mates":[],
        "mateValues": [false,false,false,false,false,false],
        "angle":0,
        "offset":0,                          
        "option":SELECTFEATURE,
        "key":"" 
    };
    */
  setStateWithoutError = (params) => {
    try {
      this.setState(params);
    } catch (error) {
      console.log('Error while setting params', params, error);
    }
  };
  openSnackBar = (alert, message) => {
    this.setStateWithoutError({
      snackBarAlertType: alert,
      snackBarMessage: message,
      autoHideDuration: alert == 'success' ? 1000 : 5000,
      snackBarState: true
    });
    //console.log("Snack Bar",alert,message);
  };

  closeSnackBar = () => {
    this.setStateWithoutError({ snackBarState: false });
  };

  findEdgeChange = (prevProps) => {
    //const state_gltfobj = state.gltfobj || this.props.gltfobj;

    return prevProps.gltfobj
      ? prevProps.gltfobj.gdttable
        ? prevProps.gltfobj.gdttable[this.props.activeDataTable]
          ? prevProps.gltfobj.gdttable[this.props.activeDataTable].edges
            ? prevProps.gltfobj.gdttable[this.props.activeDataTable].edges
                .length > 0
              ? this.props.gltfobj
                ? this.props.gltfobj.gdttable
                  ? this.props.gltfobj.gdttable[this.props.activeDataTable]
                    ? this.props.gltfobj.gdttable[this.props.activeDataTable]
                        .edges
                      ? this.props.gltfobj.gdttable[this.props.activeDataTable]
                          .edges.length == 0
                      : true
                    : true
                  : true
                : false
              : false
            : false
          : false
        : false
      : false;
  };
  componentDidUpdate(prevProps, prevState) {
    //var toChange = ( (prevProps.gltfobj !== this.props.gltfobj)  || (prevState.gltfobj  !== this.props.gltfobj) );
    //console.log('COMPONENT', prevProps, this.props);
    //console.log('STRINGIFY', stringify);

    const toChangeGLTF =
      prevProps.activeGLTFFile !== this.props.activeGLTFFile ||
      prevProps.activeDataTable !== this.props.activeDataTable; //prevProps.activefile !== this.props.activefile;
    console.log(
      '1',
      toChangeGLTF,
      prevProps.activeGLTFFile,
      this.props.activeGLTFFile,
      this.props.gltfobj != null && toChangeGLTF,
      this.props.gltfobj != null,
      this.props.changedata,
      prevProps.changedata,
      this.scene
    );

    var toChange = toChangeGLTF;
    toChange = toChange || prevProps.materialtype != this.props.materialtype;
    const edgeChange = toChange ? this.findEdgeChange(prevProps) : false;
    if (prevProps.selectedoption != this.props.selectedoption) {
      const thisoption = this.getValueOptionFromString(
        this.props.selectedoption
      );
      console.log(
        'Setting the selection menu for option ',
        this.props.selectedoption,
        thisoption
      );
      myMenus[3].groups[0].values.selectedOption = thisoption;
      this.changeSelectedOption(this.props.selectedoption);
    }
    toChange = toChange || edgeChange;

    this.changedctrlkey = this.props.ctrlKey;
    var changeback = this.databackcolor != this.props.backcolor;
    changeback = changeback || this.dataselectcolor != this.props.selectcolor;
    changeback = changeback || this.datatouchcolor != this.props.touchcolor;
    if (changeback) {
      this.changeBackgroundWhenPropsChange();
    }
    if (toChangeGLTF) {
      /* */
      this.this_state_gltf = this.props.gltfobj;
      this.this_progress_data = null;
      if (this.initDone) {
        console.log(
          'Doing this.props.gltfobj in toChangeGLTF',
          this.props.gltfobj
        );
        if (
          prevProps.activeGLTFFile !== this.props.activeGLTFFile ||
          this.content.length == 0
        ) {
          this.alter(this.props.gltfobj);
        } else {
          this.changeddataarray = null;
          this.truncToFirst();
          this.loadAdditionalFeatures();
        }
        this.render();
      } else {
        console.log(
          'Not Doing this.this_state_gltf',
          this.this_state_gltf,
          this.initDone
        );
      }
      //console.log('Doing this.this_state_gltf', this.this_state_gltf, this.renderDone);
      //this.render();
    } else {
      /*  const toInvokeRaycast =
        stringify(prevProps.gltfobj || {}) !==
        stringify(this.props.gltfobj || {});
      if (toInvokeRaycast) {
        this.raycastObjects = this.rayCastObjectFilters(this.partsMeshes);
      } */
    }
    this.changeparts();
    /* 
        if((this.state.gltfobj!=this.props.gltfobj) || (prevState.gltfobj !=this.state.gltfobj)) {
            this.setState({gltfobj:this.props.gltfobj});
            console.log("Setting",this.state.gltfobj,"props obj",this.props.gltfobj);
            this.alter(this.props.gltfobj);
        } else {
            console.log("Not Setting",this.state.gltfobj,"props obj",this.props.gltfobj);
        }
        //console.log("Reachibg here my set",list,prevProps,prevState,this.state.sortedlist);
            if (toChange && this.changeState==false) {
            //this.setState({gltfobj:this.props.gltfobj});
            if (this.selectedoption != this.props.selectedoption) {
                this.changeSelectedOption();                       
            } 
            if (this.activeFile != this.props.activefile ||
                this.materialtype != this.props.materialtype || 
                this.activeDataTable != this.props.activeDataTable ||
                edgeChange ) {               
               
                if(this.initDone) {
                    //this.alter(this.props.gltfobj);       
                    this.setState({gltfobj:this.props.gltfobj});
                    console.log("Alter Setting",this.state.gltfobj,"props obj",this.props.gltfobj);                        
                }            
            }          
        }
        
        if(this.changeState==true) {
            console.log("I am not changing state eventhough props changed")
            this.changeState=false;
        } else {
            console.log("Changing property status:",this.gltfobjLen,toChange,edgeChange,
                        this.changeState,prevProps.gltfobj,this.props.gltfobj);
            console.log(this.activeFile,this.activeId,this.gltfobjLen);
        } */
  }
  truncToFirst = () => {
    for (let index = this.content.length - 1; index > 0; index--) {
      if (index > 0) {
        let myobject = this.content[index];
        this.scene.remove(myobject);
        myobject.traverse((node) => {
          if (!node.isMesh) return;
          if (node.geometry) {
            node.geometry.dispose();
            //node.geometry=null;
          }
        });
      }
    }
    if (this.content.length > 1) {
      this.content.length = 1;
      this.updateParts(this.content[0]);
    }
    if (
      this.props.gltfobj &&
      this.props.gltfobj.tree &&
      this.props.gltfobj.treeLength < this.props.gltfobj.tree.length
    ) {
      this.props.gltfobj.tree.length = this.props.gltfobj.treeLength;
    }
  };
  handlePopperClick = (event, param) => {
    let anchorEls = [...this.state.anchorEls];
    if (this.state.selectedmenu != param) {
      if (anchorEls[this.state.selectedmenu]) {
        anchorEls[this.state.selectedmenu] = null;
        this.openEl[this.state.selectedmenu] = false;
        this.idEl[this.state.selectedmenu] = undefined;
      }
    }
    if (anchorEls[param]) {
      anchorEls[param] = null;
      this.openEl[param] = false;
      this.idEl[param] = undefined;
    } else {
      anchorEls[param] = event.currentTarget;
      this.openEl[param] = true;
      this.idEl[param] = 'popper' + event.target.id.toString();
    }
    this.setStateWithoutError({ anchorEls: anchorEls, selectedmenu: param });
  };

  disposeCameraAndControls = () => {
    if (this.defaultCamera) {
      if (this.scene) {
        this.scene.remove(this.defaultCamera);
        //this.lineScene.remove(this.defaultCamera);
      }
      this.defaultCamera = null;
      //this.defaultCamera.dispose();
    }
    if (this.controls) {
      this.controls.removeEventListener('start', this.controlsStart);
      this.controls.removeEventListener('change', this.updateCameraSpinUI);
      this.controls.removeEventListener('end', this.controlsEnd);
      this.controls.dispose();
      this.controls = null;
    }
  };

  addCameraAndControls = (myView) => {
    this.disposeCameraAndControls();
    //console.log(myView);
    const viewport = this.setSameSize();
    if (myView == 'Orthographic') {
      this.defaultCamera = new OrthographicCamera(
        viewport.left,
        viewport.right,
        viewport.top,
        viewport.bottom
      );
      //console.log(viewport);
    } else {
      const fov =
        this.props.preset === Preset.ASSET_GENERATOR
          ? (0.8 * 180) / Math.PI
          : 60;
      this.defaultCamera = new PerspectiveCamera(
        fov,
        viewport.right / viewport.top,
        0.01
      );
    }
    if (this.scene) {
      this.scene.add(this.defaultCamera);
      //this.lineScene.add(this.defaultCamera);
    }
    if (this.light1) {
      this.defaultCamera.add(this.light1);
    }
    if (this.light2) {
      this.defaultCamera.add(this.light2);
    }
    //console.log(this.defaultCamera);

    this.activeCamera = this.defaultCamera;

    this.controls = new TrackballControls(
      this.defaultCamera,
      this.renderer.domElement
    );
    this.controls.autoRotate = false;
    this.controls.autoRotateSpeed = -10;
    this.controls.screenSpacePanning = false;
    this.controls.staticMoving = true;
    this.controls.rotateSpeed = this.state.rotateSpeed;
    this.controls.noZoom = this.state.zoomToCursor; //this.defaultCamera.isPerspectiveCamera;
    this.controls.zoomSpeed = this.state.zoomSpeed;
    this.controls.emSpeed = Math.pow(
      this.controls.zoomSpeed,
      1.0 / this.OrthographicInitialzoom
    );
    this.controls.panSpeed = this.state.panSpeed;
    this.controls.addEventListener(
      'start',
      this.controlsStart.bind(this),
      false
    );
    this.controls.addEventListener(
      'change',
      this.updateCameraSpinUI.bind(this),
      false
    );
    this.controls.addEventListener('end', this.controlsEnd.bind(this), false);
    this.addAxesHelper(myView);
    if (this.content && this.content.length > 0) {
      const object = this.content[0];
      //console.log(object);
      if (object) {
        this.updateCameraControls(object, false);
      }

      //this.updateLights();
    } else {
      if (this.initDone) {
        console.log('No Content');
      }
    }
  };

  updateCameraControls = (object, reset) => {
    if (object) {
      if (reset) {
        this.originalposition = new Vector3();
        this.originalposition.x = object.position.x;
        this.originalposition.y = object.position.y;
        this.originalposition.z = object.position.z;
      } else {
        if (this.originalposition) {
          object.position.x = this.originalposition.x;
          object.position.y = this.originalposition.y;
          object.position.z = this.originalposition.z;
        }
      }

      const box = new Box3().setFromObject(object);

      //console.log('old values');
      const size3D = box.getSize(new Vector3());
      //console.log(size3D);
      let size = Math.max(size3D.x, size3D.y, size3D.z);
      if (size <= 0) {
        size = 1;
      }

      if (this.defaultCamera && this.defaultCamera.isPerspectiveCamera) {
        size = size3D.length() || 1;
      }
      size = size3D.length() || 1;
      const multipler = 2.36 / 1.64;
      //console.log(size,size3D.length());
      const center = box.getCenter(new Vector3());
      if (this.controls) {
        if (this.controls.reset) {
          this.controls.reset();
        }
      }

      //console.log('AABB centre', center);
      //console.log('obj pos', object.position);
      //console.log(this.originalposition,object.position,size,size3D,center);
      if (this.defaultCamera && this.defaultCamera.isOrthographicCamera) {
        //console.log(size, this.defaultCamera.zoom);
        if (size / 2 < this.defaultCamera.right) {
          this.defaultCamera.right = size / 2;
          this.defaultCamera.left = -this.defaultCamera.right;
          this.defaultCamera.top = this.defaultCamera.right;
          this.defaultCamera.bottom = -this.defaultCamera.right;
          console.log('Resetting camera sizes');
        }
        this.defaultCamera.zoom = (multipler * this.defaultCamera.right) / size; //approx Sqrt(2)
        this.OrthographicInitialzoom = this.defaultCamera.zoom;
        this.controls.emSpeed = Math.pow(
          this.controls.zoomSpeed,
          1.0 / this.OrthographicInitialzoom
        );
        //console.log( this.defaultCamera.zoom);
        //console.log("Initial",this.defaultCamera.zoom, this.defaultCamera.top, this.defaultCamera.left, this.defaultCamera.bottom, this.defaultCamera.right);
        this.defaultCamera.updateProjectionMatrix();
      }

      this.shiftposition = {
        x: object.position.x - center.x,
        y: object.position.y - center.y,
        z: object.position.z - center.z
      };
      object.position.x += this.shiftposition.x;
      object.position.y += this.shiftposition.y;
      object.position.z += this.shiftposition.z;

      //console.log('new values');
      this.orthogonalImageBox = new Box3().setFromObject(object);
      //console.log(this.orthogonalImageBox.getSize(new Vector3()));
      //console.log('AABB centre', this.orthogonalImageBox.getCenter(new Vector3()));
      //console.log('obj pos', object.position);

      if (this.controls) {
        this.controls.maxDistance = size * 10;
      }
      if (this.defaultCamera) {
        this.defaultCamera.near = size / 100;
        this.defaultCamera.far = size * 100;
        //console.log("setting1",size,this.defaultCamera);
        this.defaultCamera.updateProjectionMatrix();
        //console.log("setting2",size,this.defaultCamera);
        if (this.props.cameraPosition) {
          this.defaultCamera.position.fromArray(this.props.cameraPosition);
          this.defaultCamera.cameraposition = new Vector3();
          this.defaultCamera.lookAt(this.defaultCamera.cameraposition);
          //console.log("setting3",size,this.defaultCamera);
        } else {
          this.defaultCamera.position.copy(center);
          this.defaultCamera.position.x += size / 2.0;
          this.defaultCamera.position.y += size / 2.0;
          this.defaultCamera.position.z += size / 2.0;
          this.defaultCamera.cameraposition = center;
          this.defaultCamera.lookAt(this.defaultCamera.cameraposition);
          //console.log("setting4",size,this.defaultCamera);
        }

        this.setCamera(DEFAULT_CAMERA);
        //console.log(box,object,this.defaultCamera,object.position,this.defaultCamera.cameraposition,center,this.props.cameraPosition);

        this.axesCamera.position.copy(this.defaultCamera.position);
        this.axesCamera.lookAt(this.axesScene.position);
        this.axesCamera.near = size / 100;
        this.axesCamera.far = size * 100;
        this.axesCamera.updateProjectionMatrix();
        this.axesCorner.scale.set(size, size, size);
      }

      if (this.controls) {
        if (this.controls.saveState) {
          this.controls.saveState();
        }
      }
    }
  };

  init = () => {
    const state_gltfobj =
      this.props.gltfobj || this.this_state_gltf || this.props.gltfobj;

    this.gltfJSON = state_gltfobj.gltf || state_gltfobj;

    //this.gltfJSON = this.props.gltfobj.gltf||this.props.gltfobj;
    this.gltfobjLen = state_gltfobj
      ? state_gltfobj.gdttable
        ? state_gltfobj.gdttable[this.props.activeDataTable]
          ? state_gltfobj.gdttable[this.props.activeDataTable].edges
            ? state_gltfobj.gdttable[this.props.activeDataTable].edges.length
            : 0
          : 0
        : 0
      : 0;
    //console.log("Setting in init gltfobj",this.gltfobjLen,state_gltfobj.gdttable);
    this.lights = [];
    this.content = null;
    this.mixer = null;
    this.clips = [];
    this.gui = null;
    let myView = this.props.view;
    this.OrthographicInitialzoom = 1;
    if (myMenus && myMenus.length > 0) {
      myView = myView || myMenus[0].groups[0].values.view;
    }
    //console.log("myview",myView);
    this.setStateWithoutError({
      view: myView || 'Orthographic',
      progressOpenedFiles: []
    });
    this.prevTime = 0;

    //this.stats = new Stats();
    //this.stats.dom.height = '48px';
    //[].forEach.call(this.stats.dom.children, (child) => (child.style.display = ''));
    if (this.renderer == null) {
      this.scene = new Scene();
      //this.lineScene = new Scene();
      const viewport = this.setSameSize();
      //const fov = this.props.preset === Preset.ASSET_GENERATOR
      //    ? 0.8 * 180 / Math.PI
      //    : 60;
      //this.defaultCamera = new OrthographicCamera(viewport.left,viewport.right,viewport.top,viewport.bottom,0.01);

      //this.defaultCamera = new OrthographicCamera(-1, 1, 1, -1);

      //this.defaultCamera = new PerspectiveCamera(fov, this.node.clientWidth / this.node.clientHeight, 0.01);

      //this.activeCamera = this.defaultCamera;
      //this.scene.add(this.defaultCamera);

      //console.log("Renderer",this.renderer, window.renderer);
      this.renderer = window.renderer = new WebGLRenderer({
        antialias: true,
        depthBuffer: true
      });

      this.renderer.physicallyCorrectLights = true;
      this.renderer.outputEncoding = sRGBEncoding;
      //console.log("back color",this.props.backcolor);
      this.renderer.setClearColor(this.props.backcolor || DEFAULTBACKCOLOR());
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(viewport.right * 2, viewport.top * 2);
      //this.renderer.autoClear = false;

      //this.controls = new CameraSpinControls(this.defaultCamera, this.renderer.domElement);
      //this.controls = new OrbitControls(this.defaultCamera, this.renderer.domElement);
      //this.controls = new TrackballControls(this.defaultCamera, this.renderer.domElement);
      //this.controls.autoRotate = false;
      //this.controls.autoRotateSpeed = -10;
      //this.controls.screenSpacePanning = false;
      //this.controls.staticMoving = true;
      //this.controls.rotateSpeed = 2.0;
      //this.controls.noZoom = this.defaultCamera.isPerspectiveCamera;
      //this.controls.zoomSpeed = 0.1;
      //this.controls.panSpeed = 1.0;

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
      this.shadowmesh = null;
      this.addCameraAndControls(this.state.view);

      //this.addGUI();
      //if (this.props.kiosk) this.gui.close();

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
      window.addEventListener('keydown', this.onKeyDown.bind(this), false);
      //window.addEventListener('mousedown', this.onMouseDown.bind(this), true); // get event first to enable the correct control
      //window.addEventListener('mouseup', this.onMouseUp.bind(this), false); // get event last, so false on capture
      //window.addEventListener('touchstart', this.onTouchStart.bind(this), false);
      //window.addEventListener('touchend', this.onTouchEnd.bind(this), false);
      //window.addEventListener('wheel', this.onMouseWheel.bind(this), false);
      this.renderer.domElement.addEventListener(
        'mousemove',
        this.onMouseMove.bind(this),
        false
      );
      this.renderer.domElement.addEventListener(
        'click',
        this.onMouseClick.bind(this),
        false
      );
      this.renderer.domElement.addEventListener(
        'mousedown',
        this.onMouseDown.bind(this),
        true
      );
      this.renderer.domElement.addEventListener(
        'mouseup',
        this.onMouseUp.bind(this),
        false
      );
      this.renderer.domElement.addEventListener(
        'touchstart',
        this.onTouchStart.bind(this),
        true
      );
      this.renderer.domElement.addEventListener(
        'touchend',
        this.onTouchEnd.bind(this),
        false
      );
      this.renderer.domElement.addEventListener(
        'wheel',
        this.onMouseWheel.bind(this),
        false
      );

      //this.controls.addEventListener('start', this.controlsStart.bind(this),false);
      //this.controls.addEventListener('change', this.updateCameraSpinUI.bind(this),false);
      //this.controls.addEventListener('end', this.controlsEnd.bind(this),false);
      if (myMenus && myMenus.length > 0) {
        myMenus[0].groups[0].values.view = myView;
        //console.log("My Menus", myMenus);
        for (let index = 0; index < myMenus.length; index++) {
          //console.log("My Groups", myMenus[index].groups);
          if (
            index < 3 ||
            (this.props.fileGDT && index == 3) ||
            (this.props.fileAnimation && index == 4)
          ) {
            for (let group = 0; group < myMenus[index].groups.length; group++) {
              //console.log("My Fields and Values",myMenus[index].groups[group]);
              this.changeValues(
                myMenus[index].groups[group].values,
                index,
                group,
                myMenus[index].folder,
                myMenus[index].groups[group].name
              );
            }
          }
        }
      }
    }
    //this.activeFile = this.props.activefile;
    //this.materialtype = this.props.materialtype;
    //console.log("Rendering here!",this.activeFile,this.props.activefile,
    //        this.materialtype,this.props.materialtype,this.selectedoption,this.props.selectedoption);
    console.log(
      'Doing this.props.gltfobj',
      this.props.gltfobj,
      this.props.activeGLTFFile
    );
    this.this_state_gltf = this.props.gltfobj;
    this.this_progress_data = null;
    this.alter(this.props.gltfobj);
    this.renderDone = true;
    //console.log("Coming from here to changeparts");
    this.changeparts();
    this.onWindowResize();
    this.initDone = true;
    this.render();
  };

  setSameSize = () => {
    let innerWidth = 1;
    let innerHeight = 1;
    if (this.node) {
      if (this.node.clientHeight != this.node.clientWidth) {
        let minsize = Math.max(this.node.clientWidth, this.node.clientHeight);
        //console.log('minsize',this.node.clientWidth,this.node.clientHeight);
        if (minsize <= 0) {
          minsize = 1;
        }

        let minsizePX = minsize.toString() + 'px';
        //console.log(minsizePX,this.node.clientWidth,this.node.clientHeight,this.node.style.width,this.node.style.height);
        if (this.node.style.width != minsizePX) {
          //console.log('minsizePX',minsizePX);
          this.node.style.width = minsizePX;
        }
        if (this.node.style.height != minsizePX) {
          this.node.style.height = minsizePX;
          //console.log(this.node.style.width,this.node.style.height);
        }
      }
      innerWidth = this.node.clientWidth;
      innerHeight = this.node.clientHeight;
    } else {
      innerWidth = window.innerWidth;
      innerHeight = window.innerHeight;
      //console.log("Window",innerWidth,innerHeight)
    }
    if (innerHeight == 0) {
      innerWidth = innerHeight;
    }
    if (innerWidth == 0) {
      innerHeight = innerWidth;
      if (innerHeight == 0) {
        innerWidth = 1;
        innerHeight = 1;
      }
    }
    let viewSize = innerHeight;
    let aspectRatio = innerWidth / innerHeight;
    let viewport = {
      left: (-aspectRatio * viewSize) / 2,
      right: (aspectRatio * viewSize) / 2,
      top: viewSize / 2,
      bottom: -viewSize / 2
    };
    viewport.left = -viewport.right;
    viewport.top = viewport.right;
    viewport.bottom = -viewport.right;
    //console.log(viewport);
    return viewport;
    //return (-1,1,1,-1);
  };

  convertColor = (color) => {
    const colorRGB = hexToRGB(color);
    return new Color(colorRGB[0], colorRGB[1], colorRGB[2]);
  };

  animate = (time) => {
    requestAnimationFrame(this.animate);

    const dt = (time - this.prevTime) / 1000;
    this.raycast();
    if (this.controls) {
      this.controls.update();
    }
    //this.stats.update();
    this.mixer && this.mixer.update(dt);
    this.render();

    this.prevTime = time;
  };

  cleanup = () => {
    //console.log("I have reached here to clean webgl render");
    this.initDone = false;
    this.clear();
    window.removeEventListener('resize', this.onWindowResize);
    window.removeEventListener('keydown', this.onKeyDown);
    //window.removeEventListener('mousedown', this.onMouseDown);
    //window.removeEventListener('mouseup', this.onMouseUp);
    //window.removeEventListener('touchstart', this.onTouchStart);
    //window.removeEventListener('touchend', this.onTouchEnd);
    //window.removeEventListener('wheel', this.onMouseWheel);
    this.disposeAxesHelper();
    this.disposeCameraAndControls();
    /* if(this.controls) {
            this.controls.removeEventListener('start', this.controlsStart);
            this.controls.removeEventListener('change', this.updateCameraSpinUI);
            this.controls.removeEventListener('end', this.controlsEnd);
            this.controls.dispose();
            this.controls=null;
        } */
    if (this.renderer) {
      this.renderer.setAnimationLoop(null);
      this.renderer.domElement.removeEventListener(
        'mousemove',
        this.onMouseMove
      );
      this.renderer.domElement.removeEventListener('click', this.onMouseClick);
      this.renderer.domElement.removeEventListener(
        'mousedown',
        this.onMouseDown
      );
      this.renderer.domElement.removeEventListener('mouseup', this.onMouseUp);
      this.renderer.domElement.removeEventListener(
        'touchstart',
        this.onTouchStart
      );
      this.renderer.domElement.removeEventListener('touchend', this.onTouchEnd);
      this.renderer.domElement.removeEventListener('wheel', this.onMouseWheel);

      this.renderer.dispose();
      this.renderer = null;
    }
    /* if(this.axesRenderer) {
            this.axesRenderer.dispose();
            this.axesRenderer=null;
        } */
    window.renderer = null;
    //this.axesRenderer = null;
    //this.controls=null;
  };

  changeVisibility = (option) => {
    if (this.content) {
      this.content.forEach((element) => {
        element
          ? element.traverse((node) => {
              if (node.isLight) {
                this.setStateWithoutError({ addLights: false });
                //this.state.addLights = false;
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
                const visibility = this.visibllity(node, true, option);
                if (this.props.materialtype != 'Basic') {
                  const materials = Array.isArray(node.material)
                    ? node.material
                    : [node.material];
                  materials.forEach((material) => {
                    material.visible = visibility;
                    var prevMaterial = material;
                    if (this.props.materialtype == 'Standard') {
                      material = new MeshStandardMaterial();
                    } else {
                      if (this.props.materialtype == 'Lambert') {
                        material = new MeshLambertMaterial();
                      } else {
                        if (this.props.materialtype == 'Phong') {
                          material = new MeshPhongMaterial();
                        } else {
                          if (this.props.materialtype == 'Physical') {
                            material = new MeshPhysicalMaterial();
                          }
                        }
                      }
                    }

                    MeshBasicMaterial.prototype.copy.call(
                      material,
                      prevMaterial
                    );
                  });
                } else {
                  const materials = Array.isArray(node.material)
                    ? node.material
                    : [node.material];
                  materials.forEach((material) => {
                    //console.log("before",material);
                    material.visible = visibility;
                    //console.log("after",material);
                  });
                }
                this.changeMaterialStats(
                  node.material,
                  this.state.side,
                  this.state.opaque,
                  this.state.wiremesh,
                  this.state.castshadow
                );
              }
            })
          : '';
      });
    }
  };
  loadAdditionalFeatures = async () => {
    if (this.props.drawLine && this.props.fileGDT) {
      await this.loadAllEdges(0, (firstTime = true));
    }
    /* console.log(
      'For loading edges',
      this.props.fileGDT,
      this.props.fileAnimation
    ); */
    if (this.props.fileGDT /*&& this.props.fileAnimation == false*/) {
      const state_gltfobj = this.this_state_gltf || this.props.gltfobj;

      console.log(
        'GDTTable',
        state_gltfobj.gdttable,
        this.props.activeDataTable
      );
      let gdttable = [];
      if (
        state_gltfobj.gdttable &&
        isEmptyObjectDictionary(state_gltfobj.gdttable)
      ) {
        gdttable = [defaultGDTTable];
      } else {
        gdttable = state_gltfobj.gdttable || [defaultGDTTable];
      }
      if (this.props.activeDataTable < gdttable.length) {
        await this.updateGDTTable(gdttable[this.props.activeDataTable]);
      }

      //console.log(this.props);
    }
  };
  /*
   *
   * @param {THREE.Object3D} object
   * @param {Array<THREE.AnimationClip} clips
   *
   */
  setContent = (object, clips) => {
    this.clear();

    /* const box = new Box3().setFromObject(object);
        const size3D = box.getSize(new Vector3());
        let size = size3D.length() || 1;
        if(size <=0) {
            size=1;
        } 
        const center = box.getCenter(new Vector3());
        if(this.controls) {
            if(this.controls.reset) {
                this.controls.reset();
            }
        }
        if(this.defaultCamera.isOrthographicCamera) {
            //console.log(size, this.defaultCamera.zoom);           
            this.defaultCamera.zoom=2/size;
            //console.log( this.defaultCamera.zoom);
            this.defaultCamera.updateProjectionMatrix(); 
        }
        this.shiftposition = {"x":object.position.x - center.x,
                              "y":object.position.y - center.y,
                              "z":object.position.z - center.z }

        object.position.x += (this.shiftposition.x);
        object.position.y += (this.shiftposition.y);
        object.position.z += (this.shiftposition.z);
        if(this.controls) {
            this.controls.maxDistance = size * 10;
        }

        this.defaultCamera.near = size / 100;
        this.defaultCamera.far = size * 100;
        //console.log("setting1",size,this.defaultCamera);
        this.defaultCamera.updateProjectionMatrix();
        //console.log("setting2",size,this.defaultCamera);
        if (this.props.cameraPosition) {

            this.defaultCamera.position.fromArray(this.props.cameraPosition);
            this.defaultCamera.cameraposition=new Vector3();
            this.defaultCamera.lookAt(this.defaultCamera.cameraposition);
           //console.log("setting3",size,this.defaultCamera);

        } else {

            this.defaultCamera.position.copy(center);
            this.defaultCamera.position.x += size / 2.0;
            this.defaultCamera.position.y += size / 2.0;
            this.defaultCamera.position.z += size / 2.0;
            this.defaultCamera.cameraposition=center;
            this.defaultCamera.lookAt(this.defaultCamera.cameraposition);
            //console.log("setting4",size,this.defaultCamera);
           
        }

        this.setCamera(DEFAULT_CAMERA);

        this.axesCamera.position.copy(this.defaultCamera.position)
        this.axesCamera.lookAt(this.axesScene.position)
        this.axesCamera.near = size / 100;
        this.axesCamera.far = size * 100;
        this.axesCamera.updateProjectionMatrix();
        this.axesCorner.scale.set(size, size, size);
        if(this.controls) {
            if(this.controls.saveState){
                this.controls.saveState();
            }
        } */
    //console.log('Updateing camera', object);
    this.updateCameraControls(object, true);
    /*
            this.dotGeometry = new Geometry();
            this.dotGeometry.vertices.push(new Vector3(0, 0, 0));
            var dotMaterial = new PointsMaterial( { size: 10, sizeAttenuation: false } );
            var dot = new Points( this.dotGeometry, dotMaterial );
            this.scene.add( dot );
        */
    //console.log(object);
    this.scene.add(object);

    this.content = [object];

    //this.state.addLights = true;
    //console.log('adding lights', object);
    this.setStateWithoutError({ addLights: true });
    //console.log('Updateing visibility', object, this.selectedoption);
    this.changeVisibility(this.selectedoption);

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
    //console.log('Updateing clips', object, clips);
    this.setClips(clips);
    //console.log('Updateing parts', object);
    this.updateParts(object);
    //console.log('Updateing lights', object);
    this.updateLights(
      this.state.Exposure,
      this.state.addLights,
      this.state.ambientIntensity,
      this.state.ambientColor,
      this.state.directIntensity,
      this.state.directColor
    );
    //this.updateGUI();
    this.updateTextureEncoding(this.state.textureEncoding);
    this.updateDisplay(
      this.state.side,
      this.state.opaque,
      this.state.wiremesh,
      this.state.castshadow,
      this.state.skeleton,
      this.state.grid
    );
    this.loadAdditionalFeatures();
    //console.log("File props",this.props.fileGDT,this.props.drawLine,this.props.activeId);
    // if (this.props.drawLine && this.props.fileGDT) {
    //   this.loadAllEdges(0, (firstTime = true));
    // }

    // if (this.props.fileGDT ) {
    //   const state_gltfobj = this.this_state_gltf || this.props.gltfobj;

    //   console.log(
    //     'GDTTable',
    //     state_gltfobj.gdttable,
    //     this.props.activeDataTable
    //   );
    //   let gdttable = [];
    //   if (
    //     state_gltfobj.gdttable &&
    //     isEmptyObjectDictionary(state_gltfobj.gdttable)
    //   ) {
    //     gdttable = [defaultGDTTable];
    //   } else {
    //     gdttable = state_gltfobj.gdttable || [defaultGDTTable];
    //   }
    //   if (this.props.activeDataTable < gdttable.length) {
    //     this.updateGDTTable(gdttable[this.props.activeDataTable]);
    //   }
    // }

    //window.content = this.content;
    //console.info('[glTF Viewer] THREE.Scene exported as `window.content`.');
    //this.printGraph(this.content[0]);
  };

  printGraph = (node) => {
    console.group(' <' + node.type + '> ' + node.name);
    node.children.forEach((child) => this.printGraph(child));
    console.groupEnd();
  };

  updateGDTTable = async (gdttableEdges) => {
    console.log('Doing updategdt table', gdttableEdges);
    let firstTime = true;
    if (
      gdttableEdges &&
      gdttableEdges.edges &&
      Array.isArray(gdttableEdges.edges)
    ) {
      for (let index = 0; index < gdttableEdges.edges.length; index++) {
        const element = gdttableEdges.edges[index];
        const node = element.name ? this.findMyMaterial(element, true) : null;
        console.log(
          'my node',
          element.name,
          'material node',
          node,
          element.parent,
          element.start,
          element.finish
        );
        await this.loadAllEdges(
          element.parent,
          element.start,
          element.finish,
          node,
          gdttableEdges,
          firstTime
        );
        firstTime = false;
      }
      if (gdttableEdges.edges.length == 0) {
        let event = {};
        event['ctrlKey'] = false;
        if (Array.isArray(gdttableEdges.selectedObjects)) {
          gdttableEdges.selectedObjects.forEach((element) => {
            element.selectedshell = true;
            //console.log('setting selections to clear all selections');
            this.doOneSelection(element, event, false);
          });
          if (gdttableEdges.selectedObjects.length == 0) {
            //console.log('Resetting blank selections to clear all selections');
            this.changeStateOfSelection(null, event, false);
          }
        }
      }
    }
    if (firstTime) {
      const state_gltfobj = this.this_state_gltf || this.props.gltfobj;

      var myStateTree = state_gltfobj
        ? state_gltfobj.tree
        : this.props.gltfobj.tree;
      if (myStateTree) {
        console.log(
          'Resetting treelength',
          myStateTree.length,
          state_gltfobj.treeLength,
          myStateTree,
          state_gltfobj
        );
        if (
          state_gltfobj.treeLength &&
          myStateTree.length &&
          state_gltfobj.treeLength < myStateTree.length
        ) {
          myStateTree.length = state_gltfobj.treeLength;
        }

        var gltfobj = { ...state_gltfobj };
        gltfobj.tree = myStateTree;
        this.this_state_gltf = gltfobj;
        try {
          if (this.props.setStateOfgltf) {
            this.props.setStateOfgltf(gltfobj);
          }
        } catch (error) {
          console.log('Error while setting gltf state', error);
        }
      }
    }
  };

  addGDTTable = async (parent, start, finish, node) => {
    try {
      if (this.props.setStateOfgltf) {
        const state_gltfobj = this.this_state_gltf || this.props.gltfobj;
        let gltfobj = { ...state_gltfobj };
        let gdttable = gltfobj.gdttable || [defaultGDTTable];
        const gdttableCopy = arrayCopy(gdttable);
        gltfobj.gdttable = gdttableCopy;
        //console.log("AddGDTTABLE", gltfobj.gdttable, gdttable,this.props.activeDataTable);
        console.log('BEfore Changing gdtable in loading edges', gltfobj);
        if (
          Array.isArray(gltfobj.gdttable[this.props.activeDataTable].edges) ==
          false
        ) {
          gltfobj.gdttable[this.props.activeDataTable].edges =
            defaultGDTTable.edges;
        }
        gltfobj.gdttable[this.props.activeDataTable].edges.push({
          parent: parent,
          start: start,
          finish: finish,
          name: node ? elementCopy(node.name) : null
        });
        console.log('After Changing gdtable in loading edges', gltfobj);
        await saveGDTInfo(
          gdttableCopy,
          this.props.fileGDT,
          this.props.fileUUId
        );
        this.props.setStateOfgltf(gltfobj);
      }
    } catch (error) {
      console.log('Error while adding gltf state', error);
    }
  };
  /**
   * @param {Array<THREE.AnimationClip} clips
   */
  setClips = (clips) => {
    if (this.mixer) {
      this.mixer.stopAllAction();
      this.mixer.uncacheRoot(this.mixer.getRoot());
      this.mixer = null;
      //      console.log('Cleared Existing animation');
    } else {
      //      console.log('NO existing animations');
    }

    this.clips = clips;
    //    console.log('Clips', this.clips);
    if (!clips.length) {
      //      console.log('No Clips', this.clips);
      return;
    }
    //    console.log(this.content[0]);
    if (this.content && this.content.length > 0) {
      this.mixer = new AnimationMixer(this.content[0]);
    }
    //    console.log(this.mixer);
    this.playAllClips(this.state.pauseAnimation, true);
  };

  playAllClips = (pauseAnimation, reset) => {
    this.clips.forEach((clip) => {
      //console.log(clip,reset);
      if (clip) {
        try {
          if (pauseAnimation == 'Continue') {
            if (reset) {
              this.mixer.clipAction(clip).reset().play();
            } else {
              this.mixer.clipAction(clip).play();
            }
          } else {
            if (reset) {
              this.mixer.clipAction(clip).reset().stop();
            } else {
              this.mixer.clipAction(clip).stop();
            }
          }
        } catch (error) {
          console.log('While playing animation', error);
        }
      }
      if (clip && clip.name) {
        this.state.actionStates[clip.name] = true;
      }
    });
  };

  updateAimationSpeed = (animationSpeed) => {
    if (this.mixer && animationSpeed != 0) {
      this.mixer.timeScale = animationSpeed;
    }
  };

  updatePauseAnimation = (pauseAnimation) => {
    if (this.mixer) {
      this.clips.forEach((clip) => {
        const action = this.mixer.clipAction(clip);
        /*        console.log(
          clip,
          this.mixer.time,
          this.mixer.timeScale,
          action.time,
          action.timeScale,
          action.loop,
          action.weight,
          action.getEffectiveTimeScale(),
          action.getEffectiveWeight(),
          pauseAnimation
        ); */
        action.paused = pauseAnimation == 'Pause';
      });
      //console.log(this.mixer.timeScale);
    } else {
      //console.log('No mixer found');
    }
  };

  updateAnimationTime = (animationTime) => {
    if (this.mixer) {
      this.clips.forEach((clip) => {
        const action = this.mixer.clipAction(clip);
        const actiontime = (clip.duration * animationTime) / 10;
        action.reset();
        if (actiontime != 0) {
          this.mixer.setTime(actiontime);
        }
        //console.log(this.state.pauseAnimation);
        action.paused = this.state.pauseAnimation == 'Pause';
      });
    }
  };

  /**
   * @param {string} name
   */
  setCamera = (name) => {
    if (name === DEFAULT_CAMERA) {
      if (this.controls) {
        this.controls.enabled = true;
      }
      this.activeCamera = this.defaultCamera;
    } else {
      if (this.controls) {
        this.controls.enabled = false;
      }
      if (this.content && this.content.length > 0) {
        this.content[0]
          ? this.content[0].traverse((node) => {
              if (node.isCamera && node.name === name) {
                this.activeCamera = node;
              }
            })
          : '';
      }
    }
  };

  updateTextureEncoding = (myTextureEncoding) => {
    if (this.content) {
      const encoding =
        myTextureEncoding === 'sRGB' ? sRGBEncoding : LinearEncoding;
      this.content.forEach((element) => {
        element
          ? traverseMaterials(element, (material) => {
              if (material.map) material.map.encoding = encoding;
              if (material.emissiveMap)
                material.emissiveMap.encoding = encoding;
              if (material.map || material.emissiveMap)
                material.needsUpdate = true;
            })
          : '';
      });
    }
  };

  addLights = (
    myAmbientIntensity,
    myAmbientColor,
    myDirectIntensity,
    myDirectColor
  ) => {
    //const state = this.state;
    if (this.defaultCamera) {
      if (this.props.preset === Preset.ASSET_GENERATOR) {
        const hemiLight = new HemisphereLight();
        hemiLight.name = 'hemi_light';
        this.scene.add(hemiLight);
        this.lights.push(hemiLight);
        return;
      }

      this.light1 = new AmbientLight(myAmbientColor, myAmbientIntensity);
      this.light1.name = 'ambient_light';
      this.defaultCamera.add(this.light1);

      this.light2 = new DirectionalLight(myDirectColor, myDirectIntensity);
      this.light2.position.set(0.5, 0, 0.866); // ~60ยบ
      this.light2.name = 'main_light';
      this.defaultCamera.add(this.light2);
      console.log('my directional light', this.light2.matrix);

      this.lights.push(this.light1, this.light2);
    }
  };

  removeLights = () => {
    this.lights.forEach((light) => light.parent.remove(light));
    this.lights.length = 0;
  };

  updateLights = (
    myExposure,
    myAddLights,
    myAmbientIntensity,
    myAmbientColor,
    myDirectIntensity,
    myDirectColor
  ) => {
    //const state = this.state;
    const lights = this.lights;

    if (myAddLights && !lights.length) {
      this.addLights(
        myAmbientIntensity,
        myAmbientColor,
        myDirectIntensity,
        myDirectColor
      );
    } else if (!myAddLights && lights.length) {
      this.removeLights();
    }
    if (this.renderer) {
      this.renderer.toneMappingExposure = myExposure;
    }

    if (lights.length === 2) {
      lights[0].intensity = myAmbientIntensity;
      lights[0].color.setHex(myAmbientColor);
      lights[1].intensity = myDirectIntensity;
      lights[1].color.setHex(myDirectColor);
    }
    //console.log(lights);
  };

  updateDisplay = (
    mySide,
    myOpaque,
    myWiremesh,
    myCastShadow,
    mySkeleton,
    myGrid
  ) => {
    if (this.skeletonHelpers.length) {
      this.skeletonHelpers.forEach((helper) => this.scene.remove(helper));
    }
    if (this.content) {
      if (!myCastShadow && this.shadowmesh) {
        this.scene.remove(this.shadowmesh);
        this.shadowmesh = null;
      }
      if (myCastShadow && !this.shadowmesh) {
        const mesh = new Mesh(
          new PlaneGeometry(100, 100),
          new MeshPhongMaterial({ color: 0xffffff, depthWrite: false })
        );
        mesh.rotation.x = -Math.PI / 2;
        mesh.receiveShadow = false;
        this.scene.add(mesh);
        this.shadowmesh = mesh;
        //console.log("I am adding shadow");
      }
      this.content.forEach((element) => {
        element
          ? traverseMaterials(element, (material) => {
              this.changeMaterialStats(
                material,
                mySide,
                myOpaque,
                myWiremesh,
                myCastShadow
              );
            })
          : '';
      });
      this.content.forEach((element) => {
        element
          ? element.traverse((node) => {
              if (node.isMesh && node.skeleton && mySkeleton) {
                const helper = new SkeletonHelper(
                  node.skeleton.bones[0].parent
                );
                helper.material.linewidth = 3;
                this.scene.add(helper);
                this.skeletonHelpers.push(helper);
              }
            })
          : '';
      });
    }

    if (myGrid !== Boolean(this.gridHelper)) {
      if (myGrid) {
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

  disposeAxesHelper = () => {
    if (this.axesDiv && this.axesRenderer && this.axesRenderer.domElement) {
      this.axesDiv.removeChild(this.axesRenderer.domElement);
    }
    if (this.axesCorner && this.axesScene) {
      this.axesScene.remove(this.axesCorner);
    }
    if (this.axesCorner) {
      this.axesCorner.dispose();
      this.axesCorner = null;
    }

    if (this.axesCamera && this.axesScene) {
      this.axesScene.remove(this.axesCamera);
    }
    if (this.axesCamera) {
      //this.axesCamera.dispose();
      this.axesCamera = null;
    }
    if (this.axesScene) {
      //this.axesScene.dispose();
      this.axesScene = null;
    }
    if (this.node && this.axesDiv) {
      this.node.removeChild(this.axesDiv);
    }

    if (this.axesRenderer) {
      this.axesRenderer.dispose();
      this.axesRenderer = null;
    }
  };
  /**
   * Adds AxesHelper.
   *
   * See: https://stackoverflow.com/q/16226693/1314762
   */
  addAxesHelper = (myView) => {
    this.disposeAxesHelper();

    this.axesDiv = document.createElement('div');
    this.node.appendChild(this.axesDiv);
    this.axesDiv.classList.add('axes');

    const { clientWidth, clientHeight } = this.axesDiv;

    this.axesScene = new Scene();

    //this.axesCamera = new OrthographicCamera(-clientWidth/2, clientWidth/2, clientHeight/2, -clientHeight/2,0.1,10);
    if (myView == 'Orthographic') {
      this.axesCamera = new OrthographicCamera(-1, 1, 1, -1);
    } else {
      this.axesCamera = new PerspectiveCamera(
        50,
        clientWidth / clientHeight,
        0.1,
        10
      );
    }
    this.axesScene.add(this.axesCamera);

    this.axesRenderer = new WebGLRenderer({ alpha: true });

    this.axesRenderer.setPixelRatio(window.devicePixelRatio);
    this.axesRenderer.setSize(
      this.axesDiv.clientWidth,
      this.axesDiv.clientHeight
    );

    this.axesCamera.up = this.defaultCamera.up;

    this.axesCorner = new AxesHelper(5);
    this.axesScene.add(this.axesCorner);
    this.axesDiv.appendChild(this.axesRenderer.domElement);
  };

  addGUI = () => {
    const gui = (this.gui = new GUI({
      autoPlace: false,
      hideable: false,
      resizable: false
    }));

    // Display controls.
    const dispFolder = gui.addFolder('Display');

    const viewingCtrl = dispFolder.add(this.state, 'view', [
      'Perspective',
      'Orthographic'
    ]);
    //viewingCtrl.object.view = this.state.view;
    viewingCtrl.onChange(() => {
      //console.log("before",this.state.view,this.content);
      this.setStateWithoutError({ view: viewingCtrl.object.view });
      //console.log("after",this.state.view,this.content);
      this.addCameraAndControls(viewingCtrl.object.view);
      //console.log("afterControls",this.state.view,this.content);
    });
    const sideCtrl = dispFolder.add(this.state, 'side', [
      'Front',
      'Back',
      'Both'
    ]);
    sideCtrl.onChange(() => {
      //this.state.side = sideCtrl.object.side;
      this.setStateWithoutError({ side: sideCtrl.object.side });
      this.updateDisplay(
        sideCtrl.object.side,
        this.state.opaque,
        this.state.wiremesh,
        this.state.castshadow,
        this.state.skeleton,
        this.state.grid
      );
    });
    const depthCtrl = dispFolder.add(this.state, 'opaque', [
      'True',
      'False',
      'Self'
    ]);
    depthCtrl.onChange(() => {
      //this.state.opaque = depthCtrl.object.opaque;
      this.setStateWithoutError({ opaque: depthCtrl.object.opaque });
      this.updateDisplay(
        this.state.side,
        depthCtrl.object.opaque,
        this.state.wiremesh,
        this.state.castshadow,
        this.state.skeleton,
        this.state.grid
      );
    });
    const wiremeshCtrl = dispFolder.add(this.state, 'wiremesh');
    wiremeshCtrl.onChange(() => {
      //this.state.wiremesh = wiremeshCtrl.object.wiremesh;
      this.setStateWithoutError({ wiremesh: wiremeshCtrl.object.wiremesh });
      this.updateDisplay(
        this.state.side,
        this.state.opaque,
        wiremeshCtrl.object.wiremesh,
        this.state.castshadow,
        this.state.skeleton,
        this.state.grid
      );
    });
    const castShadowCtrl = dispFolder.add(this.state, 'castshadow');
    castShadowCtrl.onChange(() => {
      //this.state.wiremesh = wiremeshCtrl.object.wiremesh;
      this.setStateWithoutError({
        castshadow: castShadowCtrl.object.castshadow
      });
      this.updateDisplay(
        this.state.side,
        this.state.opaque,
        this.state.wiremesh,
        castShadowCtrl.object.castshadow,
        this.state.skeleton,
        this.state.grid
      );
    });
    const skeletonCtrl = dispFolder.add(this.state, 'skeleton');
    skeletonCtrl.onChange(() => {
      //this.state.skeleton = skeletonCtrl.object.skeleton;
      this.setStateWithoutError({ skeleton: skeletonCtrl.object.skeleton });
      this.updateDisplay(
        this.state.side,
        this.state.opaque,
        this.state.wiremesh,
        this.state.castshadow,
        skeletonCtrl.object.skeleton,
        this.state.grid
      );
    });
    const gridCtrl = dispFolder.add(this.state, 'grid');
    gridCtrl.onChange(() => {
      //this.state.grid = gridCtrl.object.grid;
      this.setStateWithoutError({ grid: gridCtrl.object.grid });
      this.updateDisplay(
        this.state.side,
        this.state.opaque,
        this.state.wiremesh,
        this.state.castshadow,
        this.state.skeleton,
        gridCtrl.object.grid
      );
    });
    if (this.controls) {
      dispFolder.add(this.controls, 'autoRotate');
      dispFolder.add(this.controls, 'screenSpacePanning');
    }
    const speedFolder = gui.addFolder('Speeds');
    const SpeedZoomCtrl = speedFolder.add(this.state, 'zoomSpeed', 0, 3);
    SpeedZoomCtrl.onChange((speed) => {
      //this.state.zoomSpeed = speed;
      this.setStateWithoutError({ zoomSpeed: speed });
      if (this.controls) {
        this.controls.zoomSpeed = speed;
      }
    });
    const SpeedPanCtrl = speedFolder.add(this.state, 'panSpeed', 0, 3);
    SpeedPanCtrl.onChange((speed) => {
      //this.state.panSpeed = speed;
      this.setStateWithoutError({ panSpeed: speed });
      if (this.controls) {
        this.controls.panSpeed = speed;
      }
    });
    const SpeedRotateCtrl = speedFolder.add(this.state, 'rotateSpeed', 0, 3);
    SpeedRotateCtrl.onChange((speed) => {
      //this.state.rotateSpeed = speed;
      this.setStateWithoutError({ rotateSpeed: speed });
      if (this.controls) {
        this.controls.rotateSpeed = speed;
      }
    });
    // Lighting controls.
    const lightFolder = gui.addFolder('Lighting');
    const encodingCtrl = lightFolder.add(this.state, 'textureEncoding', [
      'sRGB',
      'Linear'
    ]);
    encodingCtrl.onChange(() => {
      //this.state.textureEncoding = encodingCtrl.object.textureEncoding;
      this.setStateWithoutError({
        textureEncoding: encodingCtrl.object.textureEncoding
      });
      this.updateTextureEncoding(encodingCtrl.object.textureEncoding);
    });
    lightFolder
      .add(this.renderer, 'outputEncoding', {
        sRGB: sRGBEncoding,
        Linear: LinearEncoding
      })
      .onChange(() => {
        if (this.renderer) {
          this.renderer.outputEncoding = Number(
            lightFolder.object.outputEncoding
          ); // Number(this.renderer.outputEncoding);
        }
        this.content.forEach((element) => {
          element
            ? traverseMaterials(element, (material) => {
                material.needsUpdate = true;
              })
            : '';
        });
      });

    [
      lightFolder.add(this.state, 'exposure', 0, 2),
      lightFolder.add(this.state, 'addLights').listen(),
      lightFolder.add(this.state, 'ambientIntensity', 0, 2),
      lightFolder.addColor(this.state, 'ambientColor'),
      lightFolder.add(this.state, 'directIntensity', 0, 4), // TODO(#116)
      lightFolder.addColor(this.state, 'directColor')
    ].forEach((ctrl) =>
      ctrl.onChange(() => {
        //this.state.exposure = ctrl.object.exposure;
        //this.state.addLights = ctrl.object.addLights;
        //this.state.ambientIntensity = ctrl.object.ambientIntensity;
        //this.state.ambientColor = ctrl.object.ambientColor;
        //this.state.directIntensity = ctrl.object.directIntensity;
        //this.state.directColor = ctrl.object.directColor;
        this.setStateWithoutError({
          exposure: ctrl.object.exposure,
          ambientIntensity: ctrl.object.ambientIntensity,
          ambientColor: ctrl.object.ambientColor,
          directIntensity: ctrl.object.directIntensity,
          directColor: ctrl.object.directColor
        });
        this.updateLights(
          ctrl.object.exposure,
          ctrl.object.addLights,
          ctrl.object.ambientIntensity,
          ctrl.object.ambientColor,
          ctrl.object.directIntensity,
          ctrl.object.directColor
        );
      })
    );

    // Animation controls.
    this.animFolder = gui.addFolder('Animation');
    this.animFolder.domElement.style.display = 'none';
    const playbackSpeedCtrl = this.animFolder.add(
      this.state,
      'playbackSpeed',
      0,
      1
    );
    playbackSpeedCtrl.onChange((speed) => {
      //this.state.playbackSpeed = playbackSpeedCtrl.object.playbackSpeed;
      this.setStateWithoutError({
        playbackSpeed: playbackSpeedCtrl.object.playbackSpeed
      });
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
    this.nodegui.appendChild(guiWrap);
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
    this.content.forEach((element) => {
      element
        ? element.traverse((node) => {
            if (node.isMesh && node.morphTargetInfluences) {
              morphMeshes.push(node);
            }
            if (node.isCamera) {
              node.name =
                node.name || `VIEWER__camera_${cameraNames.length + 1}`;
              cameraNames.push(node.name);
            }
          })
        : '';
    });

    if (cameraNames.length) {
      this.defaultCameraFolder.domElement.style.display = '';
      if (this.defaultCameraCtrl) this.defaultCameraCtrl.remove();
      const cameraOptions = [DEFAULT_CAMERA].concat(cameraNames);
      this.defaultCameraCtrl = this.defaultCameraFolder.add(
        this.state,
        'camera',
        cameraOptions
      );
      this.defaultCameraCtrl.onChange((name) => {
        //this.state.camera = this.defaultCameraCtrl.object.camera;
        this.setStateWithoutError({
          camera: this.defaultCameraCtrl.object.camera
        });
        this.setCamera(name);
      });
    }

    if (morphMeshes.length) {
      this.morphFolder.domElement.style.display = '';
      morphMeshes.forEach((mesh) => {
        if (mesh.morphTargetInfluences.length) {
          const nameCtrl = this.morphFolder.add(
            { name: mesh.name || 'Untitled' },
            'name'
          );
          this.morphCtrls.push(nameCtrl);
        }
        for (let i = 0; i < mesh.morphTargetInfluences.length; i++) {
          const ctrl = this.morphFolder
            .add(mesh.morphTargetInfluences, i, 0, 1, 0.01)
            .listen();
          Object.keys(mesh.morphTargetDictionary).forEach((key) => {
            if (key && mesh.morphTargetDictionary[key] === i) ctrl.name(key);
          });
          this.morphCtrls.push(ctrl);
        }
      });
    }

    if (this.clips.length) {
      this.animFolder.domElement.style.display = '';
      this.setStateWithoutError({ actionStates: {} });
      const actionStates = this.state.actionStates;
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
  rayCastObjectFilters = (meshes, consolelog = false) => {
    //console.log(this.props.selectedoption, SELECTFACE);
    if (consolelog) {
      console.log('MESHES', meshes);
    }
    var objects = [];
    if (meshes) {
      meshes.forEach((element) => {
        if (consolelog) {
          console.log(element);
        }

        if (this.visibllity(element, false, this.selectedoption, consolelog)) {
          objects.push(element);
        }
      });
    }
    //console.log(objects);
    return objects;
  };
  updateParts = (meshes) => {
    /*  if (this.partsFolder) {
            this.gui.removeFolder(this.partsFolder);
        }
        this.partsFolder = this.gui.addFolder("Parts"); */
    //console.log('My Meshes', meshes);
    if (!meshes) {
      return;
    }
    this.partsMeshes = meshes.children;
    if (this.partsMeshes[0].children.length > 0) {
      this.partsMeshes = this.partsMeshes[0].children;
    }

    if (this.partsMeshes[0].children.length > 0) {
      this.partsMeshes = this.partsMeshes[0].children;
    }

    this.raycastObjects = this.rayCastObjectFilters(this.partsMeshes);
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
          if (
            this.SELECTED.currentEmissive === null ||
            typeof this.SELECTED.currentEmissive === 'undefined'
          ) {
            this.SELECTED.currentEmissive =
              this.SELECTED.material.emissive.getHex();
          }
          this.SELECTED.material.emissive.setHex(
            0xffffff - this.SELECTED.material.color.getHex()
          );
        }

        break;
      }
    }
    this.render();
  };

  clear = () => {
    if (!this.content) return;
    this.content.forEach((element) => {
      if (element) {
        //if ((element instanceof Group)||(element instanceof OrthographicCamera)||(element instanceof PerspectiveCamera)) {
        this.scene.remove(element);
        //} else {
        //    this.lineScene.remove(element);
        //}

        // dispose geometry
        element.traverse((node) => {
          if (!node.isMesh) return;
          if (node.geometry) {
            node.geometry.dispose();
            //node.geometry=null;
          }
        });
      }

      // dispose textures
      traverseMaterials(element, (material) => {
        if (material) {
          MAP_NAMES.forEach((map) => {
            if (material[map]) {
              material[map].dispose();
              material[map] = null;
            }
          });
        }
      });
    });
  };

  onWindowResize = () => {
    const viewport = this.setSameSize();
    const innerWidth = viewport.right * 2;
    const innerHeight = viewport.top * 2;
    //if (this.node) {

    /* if (this.node.parentElement) {               
                const { clientHeight, clientWidth } = this.node.parentElement;
                this.defaultCamera.aspect = clientWidth / clientHeight;
                this.defaultCamera.updateProjectionMatrix();
                console.log("I am doing it from there",this.defaultCamera.aspect);
                //console.log("Parent",clientWidth, clientHeight);
                //this.vignette.style({aspect: this.defaultCamera.aspect});
                //this.renderer.setSize(clientWidth, clientHeight);
            } else {               
                this.defaultCamera.aspect = this.node.clientWidth / this.node.clientHeight;
                this.defaultCamera.updateProjectionMatrix();
                //console.log("I am doing it from here",this.defaultCamera.aspect);
                //console.log("Node",clientWidth, clientHeight);
                //this.vignette.style({aspect: this.defaultCamera.aspect});
                //this.renderer.setSize(this.node.clientWidth, this.node.clientHeight);
             } */
    //const innerWidth = this.node ? this.node.clientWidth : window.innerWidth;
    //const innerHeight = this.node ? this.node.clientHeight : window.innerHeight;

    //console.log("Node",innerWidth, innerHeight);
    if (this.activeCamera) {
      this.activeCamera.aspect = innerWidth / innerHeight;
      this.activeCamera.updateProjectionMatrix();
    } else {
      if (this.defaultCamera) {
        this.defaultCamera.aspect = innerWidth / innerHeight;
        this.defaultCamera.updateProjectionMatrix();
      }
    }

    if (this.renderer) {
      this.renderer.setSize(innerWidth, innerHeight);
    }

    //}
    if (this.axesRenderer) {
      this.axesCamera.aspect =
        this.axesDiv.clientWidth / this.axesDiv.clientHeight;
      this.axesCamera.updateProjectionMatrix();
      this.axesRenderer.setSize(
        this.axesDiv.clientWidth,
        this.axesDiv.clientHeight
      );
    }
    if (this.controls) {
      if (this.controls.handleResize) {
        this.controls.handleResize();
      }
    }
  };

  setMouseCoOrdinates = (event) => {
    const myrect = this.node
      ? this.node.getBoundingClientRect()
      : { left: 0, top: 0 };
    const leftShift = this.node ? myrect.left : 0;
    const topShift = this.node ? myrect.top : 0;
    const innerWidth = this.node ? this.node.clientWidth : window.innerWidth;
    const innerHeight = this.node ? this.node.clientHeight : window.innerHeight;

    this.mouse.x = ((event.clientX - leftShift) / innerWidth) * 2 - 1;
    this.mouse.y = -((event.clientY - topShift) / innerHeight) * 2 + 1;
    this.clientX = event.clientX;
    this.clientY = event.clientY;
  };

  getMouseCoOrdinates = (vector) => {
    const myrect = this.node
      ? this.node.getBoundingClientRect()
      : { left: 0, top: 0 };
    const leftShift = this.node ? myrect.left : 0;
    const topShift = this.node ? myrect.top : 0;
    const innerWidth = this.node ? this.node.clientWidth : window.innerWidth;
    const innerHeight = this.node ? this.node.clientHeight : window.innerHeight;
    //console.log("MYRECT",myrect,innerWidth,innerHeight);
    var pos = new Vector3().copy(vector);

    let projScreenMat = new Matrix4();
    projScreenMat.multiplyMatrices(
      this.activeCamera.projectionMatrix,
      this.activeCamera.matrixWorldInverse
    );
    pos.applyMatrix4(projScreenMat);

    //pos.project(this.activeCamera);
    //console.log("Projected",pos,vector);

    let thismouse = new Vector2();
    //console.log(leftShift,topShift,pos.x,pos.y);
    thismouse.x = Math.round(((1 + pos.x) * innerWidth) / 2) + leftShift;
    thismouse.y = Math.round(((1 - pos.y) * innerHeight) / 2) + topShift;
    return thismouse;
  };

  onMouseMove = (event) => {
    event.preventDefault();
    //console.log("On Movuse Move",event);
    /* this.mouse3D = new Vector3( ( event.clientX / window.innerWidth ) * 2 - 1,   
          -( event.clientY / window.innerHeight ) * 2 + 1,  
          0.5 );   */
    this.setMouseCoOrdinates(event);
    /* const myrect = this.node ? this.node.getBoundingClientRect() : { "left": 0, "top": 0 };
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
        this.clientY = event.clientY; */
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
    if (this.controls) {
      if (this.controls.onMouseMove) {
        this.controls.onMouseMove(event);
      }
    }
  };

  onMouseClick = (event) => {
    if (this.INTERSECTED !== null) {
      //console.log("Before",this.INTERSECTED.material.color);
      this.setStateWithoutError({ lastClickedNode: { ...this.INTERSECTED } });
      //console.log("Before", this.INTERSECTED.name,this.INTERSECTED.selectedshell, event.ctrlKey );
      if (this.selectedoption == SELECTMEASURE || event.ctrlKey) {
        this.INTERSECTED.selectedshell = !this.INTERSECTED.selectedshell;
      } else {
        this.INTERSECTED.selectedshell = true;
      }
      //console.log("After", this.INTERSECTED.name,this.INTERSECTED.selectedshell, event.ctrlKey );
      this.setOriginalColor(this.INTERSECTED);
      //this.INTERSECTED.material.color.setHex(this.INTERSECTED.currentHex);
      this.changeStateOfSelection(this.INTERSECTED, event);
      /* console.log(
        this.INTERSECTED,
        'Going for inner table selection',
        event,
        this.props.onClick,
        this.INTERSECTED.selectedshell
      ); */
      try {
        if (this.props.onClick) {
          this.props.onClick(this.INTERSECTED, SELECTANITEM, event);
        }
      } catch (error) {
        console.log('Error while doing onclick', error);
      }

      /* console.log(
        'After',
        this.INTERSECTED.material.color,
        this.INTERSECTED.selectedshell
      ); */
      //if(this.INTERSECTED.selectedshell) this.INTERSECTED = null;
    } else {
      console.log('I got to click', this.state.freezeNonSelection);
      if (this.state.freezeNonSelection) {
        this.changeStateOfSelection(this.INTERSECTED, event);
        try {
          if (this.props.onClick) {
            this.props.onClick(this.INTERSECTED, SELECTANITEM, event);
          }
        } catch (error) {
          console.log('Error while doing onlcikc', error);
        }
      }
      //console.log(event.clientX, event.clientY);
    }
  };

  touchStart = (event) => {
    this.setMouseCoOrdinates(event);
    /* const myrect = this.node ? this.node.getBoundingClientRect() : { "left": 0, "top": 0 };
        const leftShift = this.node ? myrect.left : 0;
        const topShift = this.node ? myrect.top : 0;
        const innerWidth = this.node ? this.node.clientWidth : window.innerWidth;
        const innerHeight = this.node ? this.node.clientHeight : window.innerHeight;

        this.mouse.x = ((event.touches[ 0 ].clientX - leftShift) / innerWidth) * 2 - 1;
        this.mouse.y = - ((event.touches[ 0 ].clientY - topShift) / innerHeight) * 2 + 1;
        this.clientX = event.touches[ 0 ].clientX;
        this.clientY = event.touches[ 0 ].clientY; */

    if (this.controls) {
      if (this.controls.touchstart) {
        this.controls.touchstart(event);
      }
    }
  };

  updateCameraSpinUI = () => {
    if (this.trackballWidget && this.controls) {
      this.trackballWidget.position.copy(this.controls.target);
      //this.controls.target.copy(this.trackballWidget.position);
      if (this.controls.spinControl) {
        var r = this.controls.spinControl.trackballRadius;
        //console.log(r);
        r = 1;
        this.trackballWidget.scale.set(r, r, r);
      }
    }
  };

  controlsStart = (event) => {
    if (this.controls) {
      if (this.controls.STATE) {
        if (event.state === this.controls.STATE.DOLLY) {
          if (
            this.controls.target &&
            this.controls.target.setFromMatrixPosition &&
            this.controls.trackballToObject
          ) {
            this.controls.target.setFromMatrixPosition(
              this.controls.trackballToObject
            );
            var startDistance = this.controls.target.length();
            this.raycaster.setFromCamera(this.mouse, this.defaultCamera);
            this.controls.target.copy(this.raycaster.ray.direction);
            this.controls.target.setLength(startDistance);
            this.controls.target.add(this.raycaster.ray.origin);
            this.controls.setTargetPosition(this.controls.target);
            //console.log("Reset1",this.controls.target);
          }
        } else {
          // Turn on trackball graphics for input except dolly
          if (this.trackballWidget) {
            this.trackballWidget.visible = true;
            this.updateCameraSpinUI();
          }
        }
      } else {
        if (
          this.controls.target &&
          this.controls.target.setFromMatrixPosition &&
          this.controls.trackballToObject
        ) {
          this.controls.target.setFromMatrixPosition(
            this.controls.trackballToObject
          );
          var startDistance = this.controls.target.length();
          this.raycaster.setFromCamera(this.mouse, this.defaultCamera);
          this.controls.target.copy(this.raycaster.ray.direction);
          this.controls.target.setLength(startDistance);
          this.controls.target.add(this.raycaster.ray.origin);
          this.controls.setTargetPosition(this.controls.target);
          //console.log("Reset2",this.controls.target);
        }

        // Turn on trackball graphics for input except dolly
        if (this.trackballWidget) {
          this.trackballWidget.visible = true;
          this.updateCameraSpinUI();
        }
      }
    }
  };

  controlsEnd = (event) => {
    if (this.trackballWidget && this.controls) {
      if (this.controls.STATE) {
        if (event.state !== this.controls.STATE.DOLLY) {
          // Don't turn off if dolly as may still be clicking with pointer
          this.trackballWidget.visible = false;
        }
      } else {
        this.trackballWidget.visible = false;
      }
    }
  };

  pickControlToEnable = (pointerNDC) => {
    // Hit static model we want to set pivot point on
    if (this.controls) {
      this.controls.enabled = true;
    }
  };

  onMouseDown = (event) => {
    //console.log("Down",event);
    event.preventDefault();
    if (event.button === 0) {
      this.pickControlToEnable(this.getPointerInNdc(event.pageX, event.pageY));
    } else {
      //if not left click then move camera
      if (this.controls) {
        this.controls.enabled = true;
      }
    }
    this.setMouseCoOrdinates(event);

    if (this.controls) {
      /*  var vector = new Vector3(this.mouse.x, this.mouse.y, 0.5);
            //console.log(vector);
            vector.unproject(this.activeCamera);
            vector.sub(this.activeCamera.position);
            const factor=0.001;
            this.activeCamera.position.addVectors(this.activeCamera.position, vector.setLength(factor));
            this.controls.target.addVectors(this.controls.target,vector.setLength(factor));
            this.activeCamera.updateProjectionMatrix(); */

      //console.log(event);
      if (this.controls.onMouseDown) {
        this.controls.onMouseDown(event);
      }
    }
  };

  onMouseUp = (event) => {
    //console.log("Up",event);
    if (this.controls) {
      this.controls.enabled = false;
      if (this.controls.onMouseUp) {
        this.controls.onMouseUp(event);
      }
    }
    this.raycast();
  };

  onKeyDown = (event) => {
    //console.log("Onkey down",event,this.props.fileGDT,this.INTERSECTED,this.state.lastClickedNode);
    if (
      this.props.fileGDT &&
      (event.ctrlKey || event.altKey) &&
      event.key === 'b' &&
      (this.INTERSECTED !== null || this.state.lastClickedNode !== null)
    ) {
      event.preventDefault();

      // console.log(
      //   'Reaching here to load edges',
      //   'Node',
      //   this.state.lastClickedNode,
      //   'intersect',
      //   this.INTERSECTED
      // );
      this.findSingleNode(
        this.state.lastClickedNode
          ? this.state.lastClickedNode
          : this.INTERSECTED,
        true,
        event
      );
    }
  };
  onMouseWheel = (event) => {
    /* console.log("onMouseWheel",event);
        if(this.controls) {
            this.controls.enabled = true;
            this.controls.handleMouseWheel(event);
        }  */
    event.preventDefault();
    this.setMouseCoOrdinates(event);

    if (this.controls && this.controls.noZoom && this.activeCamera) {
      if (this.activeCamera.isPerspectiveCamera) {
        let facpowfac = Math.pow(
          this.controls.zoomSpeed,
          this.controls.zoomSpeed
        );
        let factor = facpowfac / (1 + facpowfac);
        factor *= this.controls.zoomSpeed;
        var vector = new Vector3(this.mouse.x, this.mouse.y, 0.5);
        vector.unproject(this.activeCamera);
        vector.subVectors(this.activeCamera.position, vector);
        let myPosition = new Vector3().copy(this.activeCamera.position);
        let myTarget = new Vector3().copy(this.controls.target);
        let toTransform = true;
        //console.log(vector);
        if (event.deltaY < 0) {
          myPosition.subVectors(
            this.activeCamera.position,
            vector.setLength(factor)
          );
          myTarget.subVectors(this.controls.target, vector.setLength(factor));
          //console.log("Reset3",this.controls.target);
        } else {
          myPosition.addVectors(
            this.activeCamera.position,
            vector.setLength(factor)
          );
          myTarget.addVectors(this.controls.target, vector.setLength(factor));
          //console.log("Reset4",this.controls.target);
        }
        /* if ( (myPosition.x <0 || myPosition.y <0) ||
                     (myPosition.x > 1000 || myPosition.y > 1000 || myTarget.x > 1000 || myTarget.y > 1000 ) ) {
                    //myPosition = new Vector3().copy(this.activeCamera.position);  
                    //myTarget = new Vector3().copy(this.controls.target); 
                    console.log("Perspective",myPosition,myTarget);     
                    toTransform = true;             
                }  */
        if (toTransform) {
          this.activeCamera.position.copy(myPosition);
          this.controls.target.copy(myTarget);
          this.activeCamera.updateProjectionMatrix();
        } else {
          //console.log('PerspectiveZoom ', myPosition, myTarget);
        }
      } else if (this.activeCamera.isOrthographicCamera) {
        const prevzoom = this.activeCamera.zoom;
        let currentzoom = this.activeCamera.zoom;
        let lessthan = true;
        let facpowfac = Math.pow(this.controls.emSpeed, currentzoom);
        let factor = -facpowfac;
        //console.log(facpowfac,factor,this.controls.zoomSpeed,this.controls.emSpeed);
        factor *= this.controls.emSpeed;
        //console.log(factor);
        if (event.deltaY < 0) {
          currentzoom = prevzoom - factor;
          lessthan = true;
        } else {
          currentzoom = prevzoom + factor;
          lessthan = false;
        }
        let toTransform = true;
        if (
          currentzoom <=
          this.OrthographicInitialzoom / this.state.maxZoomOut
        ) {
          //factor = prevzoom-this.OrthographicInitialzoom;
          if (factor > 0) {
            factor = -factor;
            lessthan = false;
          } else {
            lessthan = true;
          }
          toTransform = false;
          //console.log("I can do",this.OrthographicInitialzoom,currentzoom,"Hence not doing");
          currentzoom = prevzoom - factor;
        } else {
          if (
            currentzoom >=
            this.OrthographicInitialzoom * this.state.maxZoomIn
          ) {
            //factor = prevzoom-this.OrthographicInitialzoom;
            if (factor > 0) {
              factor = -factor;
              lessthan = true;
            } else {
              lessthan = false;
            }
            toTransform = false;
            //console.log("I can do",this.OrthographicInitialzoom,currentzoom,"Hence not doing");
            currentzoom = prevzoom + factor;
          }
        }
        //console.log("What a beauty", currentzoom,toTransform,this.OrthographicInitialzoom/this.state.maxZoomIn,this.OrthographicInitialzoom*this.state.maxZoomOut);
        if (!toTransform) return;
        //console.log(currentzoom,this.OrthographicInitialzoom*5,this.OrthographicInitialzoom/2);
        let zoomDirection = new Vector3(
          this.mouse.x,
          this.mouse.y,
          (this.activeCamera.near + this.activeCamera.far) /
            (this.activeCamera.near - this.activeCamera.far)
        );
        /*  zoomDirection.unproject(this.activeCamera);  
                let revVector = new Vector3().copy(zoomDirection).project(this.activeCamera);
                let mymouse = this.getMouseCoOrdinates(revVector);
                console.log(mymouse,this.mouse,revVector);
                zoomDirection = new Vector3(this.mouse.x, this.mouse.y, (this.activeCamera.near + this.activeCamera.far)/(this.activeCamera.far - this.activeCamera.near));
          */
        zoomDirection
          .unproject(this.activeCamera)
          .sub(this.activeCamera.position)
          .multiplyScalar(factor / currentzoom);
        //console.log((currentzoom-prevzoom) / currentzoom,event.deltaY,zoomDirection);
        //const myClonePosition = new Vector3().copy( this.activeCamera.position );
        //const myCloneTarget = new Vector3().copy(this.controls.target);
        //const myCloneZoom = this.activeCamera.zoom;

        /* let myPosition = new Vector3().copy( this.activeCamera.position );
                let myTarget = new Vector3().copy(this.controls.target); */
        if (lessthan) {
          this.activeCamera.position.subVectors(
            this.activeCamera.position,
            zoomDirection
          );
          this.controls.target.subVectors(this.controls.target, zoomDirection);
        } else {
          this.activeCamera.position.addVectors(
            this.activeCamera.position,
            zoomDirection
          );
          this.controls.target.addVectors(this.controls.target, zoomDirection);
        }
        this.activeCamera.zoom = currentzoom;
        //let k = 0;
        //let dir = this.activeCamera.getWorldDirection(new Vector3());
        //console.log('camera dir',  dir, this.activeCamera.zoom,this.OrthographicInitialzoom/2 );
        //this.activeCamera.position.add(  this.activeCamera.getWorldDirection(new Vector3()) * k );

        this.activeCamera.updateProjectionMatrix();
        if (this.orthogonalImageBox && this.state.displaytext) {
          const startx = this.orthogonalImageBox.min.x; //+this.shiftposition.x;
          const starty = this.orthogonalImageBox.min.y; //+this.shiftposition.y;
          const startz = this.orthogonalImageBox.min.z; //+this.shiftposition.z;
          const lowerBox = new Vector3(startx, starty, startz);

          const upperBox = new Vector3(
            startx +
              this.orthogonalImageBox.max.x -
              this.orthogonalImageBox.min.x,
            starty +
              this.orthogonalImageBox.max.y -
              this.orthogonalImageBox.min.y,
            startz +
              this.orthogonalImageBox.max.z -
              this.orthogonalImageBox.min.z +
              this.shiftposition.z
          );
          /*  const u1=new Vector3(this.orthogonalImageBox.max.x,this.orthogonalImageBox.min.y,this.orthogonalImageBox.min.z);
                    const u2=new Vector3(this.orthogonalImageBox.min.x,this.orthogonalImageBox.max.y,this.orthogonalImageBox.min.z);
                    const u3=new Vector3(this.orthogonalImageBox.min.x,this.orthogonalImageBox.min.y,this.orthogonalImageBox.max.z);
                    const u4=new Vector3(this.orthogonalImageBox.max.x,this.orthogonalImageBox.max.y,this.orthogonalImageBox.min.z);
                    const u5=new Vector3(this.orthogonalImageBox.min.x,this.orthogonalImageBox.max.y,this.orthogonalImageBox.max.z);
                    const u6=new Vector3(this.orthogonalImageBox.max.x,this.orthogonalImageBox.min.y,this.orthogonalImageBox.max.z);
                    */
          //console.log(lowerBox,upperBox);
          //lowerBox.project(this.activeCamera);
          //upperBox.project(this.activeCamera);
          const lowerBoxScreen = this.getMouseCoOrdinates(lowerBox);
          const upperBoxScreen = this.getMouseCoOrdinates(upperBox);
          const myrect = this.node.getBoundingClientRect();
          const lowXOutside =
            lowerBoxScreen.x < myrect.x ||
            lowerBoxScreen.x > myrect.x + myrect.width;
          const upperXOutside =
            upperBoxScreen.x < myrect.x ||
            upperBoxScreen.x > myrect.x + myrect.width;
          const lowYOutside =
            lowerBoxScreen.y < myrect.y ||
            lowerBoxScreen.x > myrect.y + myrect.height;
          const upperYOutside =
            upperBoxScreen.y < myrect.y ||
            upperBoxScreen.x > myrect.y + myrect.height;

          //let mytext = "Lower 2D"+(lowerBoxScreen.x + "," + lowerBoxScreen.y)+"Upper 2D"+upperBoxScreen.toString()+"Event"+event.clientX.toString()+","+event.clientY.toString();

          //this.state.displaytext = mytext; //myrect,lowXOutside,lowYOutside,upperXOutside,upperYOutside).toString();
          //console.log("Lower 3D",lowerBox,"Upper 3D",upperBox,"Lower 2D",lowerBoxScreen,"Upper 2D",upperBoxScreen,myrect,lowXOutside,lowYOutside,upperXOutside,upperYOutside);
        }
        /* if ( (myPosition.x <0 || myPosition.y <0) ||
                     (myPosition.x > 1000 || myPosition.y > 1000 || myTarget.x > 1000 || myTarget.y > 1000 ) ) {
                    //myPosition = new Vector3().copy(this.activeCamera.position);  
                    //myTarget = new Vector3().copy(this.controls.target); 
                    console.log("Orthographic",myPosition,myTarget);   
                    toTransform = true;             
                }     
                   
                if(toTransform) {
                    this.activeCamera.position.copy(myPosition);
                    this.controls.target.copy(myTarget);
                    this.activeCamera.zoom =  currentzoom;
                    this.activeCamera.updateProjectionMatrix();
                    console.log("OrthographicZoomApplied",myPosition,myTarget,currentzoom,this.OrthographicInitialzoom); 
 
                } else {
                    console.log("OrthographicZoom",myPosition,myTarget,currentzoom,this.OrthographicInitialzoom); 
                    //console.log("I am not transforming",myPosition,myTarget);
                }
                */

        //console.log("After Wheel",currentzoom,prevzoom,this.activeCamera.position, this.controls.target);
        /* var zoom = 0;
                if (event.deltaY < 0) {
                    zoom = this.activeCamera.zoom + factor;
                } else {
                    zoom = this.activeCamera.zoom - factor;
                }
                if(zoom <=0) {
                    zoom=1;
                }
                console.log(zoom);
                vector.multiplyScalar(1 / zoom);
                this.activeCamera.position.subVectors(this.activeCamera.position,vector);
                this.controls.target.subVectors(this.controls.target,vector);
                this.activeCamera.zoom = zoom;
                this.activeCamera.updateProjectionMatrix(); */

        /*
                let myZoom = 1;
                if (event.deltaY < 0) {
                    myZoom = 1/(1+factor);                    
                } else {
                    myZoom = 1/(1-factor); 
                }
                
                //vector.multiplyScalar(1 / myZoom);
                //this.activeCamera.position.subVectors(this.activeCamera.position,vector);
                this.activeCamera.zoom *= myZoom;
                this.activeCamera.updateProjectionMatrix();
                let vector2 = new Vector3(this.mouse.x, this.mouse.y, 0.5);
                vector2.unproject(this.activeCamera);
                console.log("2",vector2, this.activeCamera.position);
                (vector.sub(vector2)).multiplyScalar(myZoom);
                this.activeCamera.position.add(vector);
                this.activeCamera.updateProjectionMatrix();
                let vector3 = new Vector3(this.mouse.x, this.mouse.y, 0.5);
                vector3.unproject(this.activeCamera);
                console.log("3",vector3, this.activeCamera.position);
               
                */
      }
    }
  };

  canvas = {};
  updateCanvas = () => {
    if (this.renderer.domElement === document) {
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
  };

  getPointerInNdc = (pageX, pageY) => {
    var vector = new Vector2();
    vector.set(
      (pageX - this.canvas.width * 0.5 - this.canvas.left) /
        (this.canvas.width * 0.5),
      (this.canvas.height + 2 * (this.canvas.top - pageY)) / this.canvas.height
    );

    return vector;
  };

  onTouchStart = (event) => {
    if (!this.isTouched) {
      this.isTouched = true;
      this.pickControlToEnable(
        this.getPointerInNdc(
          event.changedTouches[0].pageX,
          event.changedTouches[0].pageY
        )
      );
    }
    this.touchStart(event);
  };

  onTouchEnd = (event) => {
    if (event.touches.length === 0) {
      if (this.controls) {
        this.controls.enabled = false;
      }
      this.isTouched = false;
    }
    this.raycast();
  };

  isObjectSame = (first, second) => {
    if (!first && !second) return true;
    if (first && !second) return false;
    if (!first && second) return false;
    if (first.name == second.name) return true;
    return false;
  };

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
  };

  visibllity = (mynode, display, option, consolelog = false) => {
    if (mynode?.type == 'Line' || mynode?.type == 'MeshLine') {
      //console.log("Returning true");
      if (display) {
        return (
          this.state.showedges ||
          option == SELECTEDGE ||
          option == SELECTLINEAR ||
          option == SELECTCIRCULAR
        );
      }
    }

    const first4chars = mynode?.name?.slice(0, 4);
    const curvechar = mynode?.name?.slice(4, 5);
    const first6chars = mynode?.name?.slice(0, 6);
    var visible = option == SELECTMEASURE || option == SELECTFEATURE;
    if (consolelog) {
      console.log(
        'VVIISBLE',
        first4chars,
        curvechar,
        first6chars,
        option,
        visible
      );
    }
    //console.log(this.partsMeshes[i].name,data.name,(this.partsMeshes[i].name==data.name))
    if (first4chars != 'PART') {
      if (first4chars == 'FACE') {
        if (display) {
          visible =
            visible ||
            option == SELECTFACE ||
            option == SELECTEDGE ||
            option == SELECTCORNER ||
            (option == SELECTLINEAR && curvechar == 'L') ||
            (option == SELECTCIRCULAR &&
              (curvechar == 'C' || curvechar == 'N'));
          if (consolelog) {
            console.log(
              'VVIISBLE2',
              first4chars,
              curvechar,
              first6chars,
              option,
              visible
            );
          }
        } else {
          visible =
            visible ||
            option == SELECTFACE ||
            (option == SELECTLINEAR && curvechar == 'L') ||
            (option == SELECTCIRCULAR &&
              (curvechar == 'C' || curvechar == 'N')); //||
          if (consolelog) {
            console.log(
              'VVIISBLE3',
              first4chars,
              curvechar,
              first6chars,
              option,
              visible
            );
          }
          //((this.props.selectedoption == SELECTLINEAR) && (curvechar=="L")) ||
          //(this.props.selectedoption == SELECTCIRCULAR &&
          //(curvechar == 'C' || curvechar == 'N'));
        }
      } else if (first4chars == 'EDGE') {
        if (display) {
          //console.log("What i got in side display",this.props.selectedoption, SELECTLINEAR,curvechar);
          visible =
            visible ||
            option == SELECTEDGE ||
            option == SELECTCORNER ||
            (option == SELECTLINEAR && curvechar == 'L') ||
            (option == SELECTCIRCULAR &&
              (curvechar == 'C' || curvechar == 'E'));
        } else {
          //console.log("What i got in side intersection",this.props.selectedoption, SELECTLINEAR,curvechar);
          visible =
            visible ||
            option == SELECTEDGE ||
            (option == SELECTLINEAR && curvechar == 'L') ||
            (option == SELECTCIRCULAR &&
              (curvechar == 'C' || curvechar == 'E'));
        }
      } else if (first6chars == 'VERTEX') {
        if (display) {
          visible = visible || option == SELECTCORNER;
        } else {
          visible = visible || option == SELECTCORNER;
        }
      }
    } else {
      if (display) {
        visible = true;
      } else {
        if (option == SELECTFACE) {
          visible = !mynode.facesLoaded;
        } else if (option == SELECTEDGE) {
          visible = !mynode.edgesLoaded;
        } else if (option == SELECTCORNER) {
          visible = !mynode.verticesLoaded;
        } else {
          visible = true;
        }
        if (consolelog) {
          console.log(
            'VVIISBLE4',
            first4chars,
            curvechar,
            first6chars,
            option,
            visible,
            mynode
          );
        }
      }
    }
    //console.log(visible,name,this.props.selectedoption);
    /*
        if (first4chars == "EDGE") {
            visible = (this.props.selectedoption == SELECTEDGE) || ((this.props.selectedoption == SELECTCORNER) && (display))
                || (this.props.selectedoption == SELECTMEASURE) || (this.props.selectedoption == SELECTFEATURE) 
                || (this.props.selectedoption==SELECTLOADEDGES);
        } else {
            if (first6chars == "VERTEX") {
                visible = (this.props.selectedoption == SELECTCORNER)
                    || (this.props.selectedoption == SELECTMEASURE) || (this.props.selectedoption == SELECTFEATURE);
            } else {
                visible = ((this.props.selectedoption != SELECTEDGE) && (this.props.selectedoption != SELECTCORNER))
                    || (this.props.selectedoption == SELECTMEASURE) || (this.props.selectedoption == SELECTFEATURE);
            }
        }
        */
    return visible;
  };

  objectFilters = () => {
    if (this.raycastObjects) {
      return this.raycastObjects;
    } else {
      return this.scene.children;
    }
    // if (this.partsMeshes) {
    //   var objects = [];
    //   this.partsMeshes.forEach((element) => {
    //     //console.log(element);
    //     if (this.visibllity(element, false)) {
    //       objects.push(element);
    //     }
    //   });
    //   //console.log('h');
    //   return objects;
    // } else {
    //   return this.scene.children;
    // }
  };

  changeEdgeVisibility = (value) => {
    if (this.partsMeshes) {
      //var objects = [];
      var objects = [];
      this.partsMeshes.forEach((element) => {
        if (element instanceof Line || element instanceof MeshLine) {
          //
          const materials = Array.isArray(element.material)
            ? element.material
            : [element.material];
          materials.forEach((material) => {
            material.visible = value;
            if (value) {
              objects.push(element);
            }
          });
          //console.log('Changing', element);
        } else {
          if (this.visibllity(element, false, this.selectedoption)) {
            objects.push(element);
          }
          //element.visible = !value;
          //console.log('Not changing', element);
        }
      });
      this.raycastObjects = objects;
    }
  };
  changeEdgeLineWidth = (value) => {
    if (this.partsMeshes) {
      var objects = [];
      this.partsMeshes.forEach((element) => {
        if (element instanceof MeshLine) {
          element.material.lineWidth = value; /* = new MeshLineMaterial({
            color: this.props.edgecolor
              ? this.props.edgecolor
              : DEFAULTEDGECOLOR,
            resolution: new Vector2(400, 400),
            sizeAttenuation: 0,
            lineWidth: value,
            side: DoubleSide
          }); */
          //element.visible = !value;
          //console.log('Not changing', element);
        }
      });
    }
  };
  raycast = () => {
    //1. set the picking ray from the camera position and mouse coordinates
    this.activeCamera.updateMatrixWorld();

    this.raycaster.setFromCamera(this.mouse, this.activeCamera);
    this.raycaster.params.Line.threshold = 0.001;
    //2. compute intersections (note the 2nd parameter)
    var intersects = this.raycaster.intersectObjects(
      this.objectFilters(),
      true
    );

    if (intersects.length == 0) {
      this.resetSelection();
    } else {
      //console.log(intersects);
      var myObject = intersects.length;
      for (var i = 0; i < intersects.length; i++) {
        //console.log("First",intersects[ i ].object);
        if (
          intersects[i].object.type == 'Line' ||
          intersects[i].object.type == 'MeshLine'
        ) {
          myObject = i;
          //console.log("I found a face",intersects[i].object.name);
          break;
        }
        if (intersects[i].object.type == 'Mesh') {
          //console.log("name found",intersects[ i ].object.name);
          if (!this.onlyparts(intersects[i].object.name)) {
            myObject = i;
            //console.log("I found a face",intersects[i].object.name);
            break;
          }
        }
      }
      /*
            if (myObject == intersects.length) {
                for (var i = 0; i < intersects.length; i++) {
                    //console.log("First",intersects[ i ].object);
                   
                    if (intersects[i].object.type == "Mesh" ) {
                        //console.log("name found",intersects[ i ].object.name);
                        
                            myObject = i;
                            //console.log("I found a face",intersects[i].object.name);
                            break;
                        
                       
                    }
                }
            }; */
      //console.log("Got",myObject);
      if (myObject == intersects.length) {
        //console.log("Entered here");
        for (var i = 0; i < intersects.length; i++) {
          //console.log("Second",intersects[ i ].object);
          if (
            intersects[i].object.type == 'Mesh' ||
            intersects[i].object.type == 'Line' ||
            intersects[i].object.type == 'MeshLine'
          ) {
            //console.log(intersects[ i ].object);
            myObject = i;
            break;
          }
        }
      }
      if (myObject != intersects.length) {
        if (this.INTERSECTED != intersects[myObject].object) {
          if (this.INTERSECTED) {
            if (
              this.isObjectSame(this.INTERSECTED, this.firstshell) ||
              this.isObjectSame(this.INTERSECTED, this.secondshell) ||
              this.isObjectsSame(this.INTERSECTED, this.state_selectedObjects)
            ) {
              this.setSelectionColor(this.INTERSECTED);
              //this.INTERSECTED.material.color = this.convertColor(this.props.selectcolor || DEFAULTSELECTCOLOR) ;
            } else {
              this.setOriginalColor(this.INTERSECTED);
              //this.INTERSECTED.material.color.setHex(this.INTERSECTED.currentHex);
            }
          }
          this.INTERSECTED = intersects[myObject].object;
          this.setTouchingColor(this.INTERSECTED);
          this.setStateWithoutError({
            intersectedShell: this.INTERSECTED,
            intersectedShellName: this.getIntersectedName(this.INTERSECTED)
          });
          /* if (this.selectedoption == SELECTASSEMBLY) {
            console.log(
              'My name to display',
              this.getIntersectedName(this.INTERSECTED.name),
              this.INTERSECTED.name
            );
          } */
          if (this.controls) {
            if (this.controls.setTargetPosition) {
              //console.log("Intersects", intersects[myObject],intersects[myObject].object,intersects[myObject].point );
              this.controls.setTargetPosition(intersects[myObject].point);
            }
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

  alter = (myGltfJson) => {
    //console.log("Getting me!");
    //if(this.controls) {
    //console.log("Getting me2!");
    //this.gltfJSON = state.gltfobj.gltf || this.props.gltfobj.gltf;
    const state_gltfobj = myGltfJson || this.props.gltfobj;

    this.gltfobjLen = state_gltfobj
      ? state_gltfobj.gdttable
        ? state_gltfobj.gdttable[this.props.activeDataTable]
          ? state_gltfobj.gdttable[this.props.activeDataTable].edges
            ? state_gltfobj.gdttable[this.props.activeDataTable].edges.length
            : 0
          : 0
        : 0
      : 0;
    //console.log("Setting in alter gltfobj",this.gltfobjLen, state_gltfobj, state_gltfobj.gltf);
    this.gltfJSON = state_gltfobj.gltf;
    this.activeFile = this.props.activefile;
    this.materialtype = this.props.materialtype;
    this.selectedoption = this.props.selectedoption;
    this.activeDataTable = this.props.activeDataTable;
    const myResourcePath = state_gltfobj.resourcepath
      ? state_gltfobj.resourcepath
      : resourcePathURL;
    if (this.gltfJSON != null) {
      console.log(
        'Getting me3!',
        this.selectedoption,
        this.activeFile,
        state_gltfobj.gltf
      );
      //this.gltfLoader = new GLTFLoader().setCrossOrigin('anonymous');
      //console.log(this.props.gltfobj.gltf);
      let myParserParams = {
        path: this.props.fileUUId
          ? (myResourcePath || '') + this.props.fileUUId + '/'
          : myResourcePath || '',
        crossOrigin: 'anonymous',
        requestHeader: null,
        manager: DefaultLoadingManager,
        ktx2Loader: null,
        meshoptDecoder: null,
        renderOrder: 0
      };
      const parser = new GLTFParser(this.gltfJSON, myParserParams);

      const onload = (gltf) => {
        this.object = gltf.scene || gltf.scenes[0];
        this.clips = gltf.animations || [];
        //console.log('gltf', gltf, 'Objects', this.object, 'Clips', this.clips);
        this.setContent(this.object, this.clips);
        try {
          this.setStateWithoutError({ progressBarRender: false });
          if (this.props.setProgressBarRender) {
            this.props.setProgressBarRender(false);
          }
        } catch (error) {
          console.log('Error while setting progress', error);
        }

        try {
          this.openSnackBar('success', 'Rendered Succesfully');
        } catch (error) {
          console.log(
            'Error while displaying snackbar in success message',
            error
          );
        }
      };

      const onError = (exception) => {
        console.log(exception, this.props, myParserParams, this.props.fileUUId);
        try {
          this.setStateWithoutError({ progressBarRender: false });
          if (this.props.setProgressBarRender) {
            this.props.setProgressBarRender(false);
          }
        } catch (error) {
          console.log('While updating error progress', error);
        }

        try {
          let errorMessage = 'Did not Render Properly ';
          try {
            errorMessage += exception.toString();
          } catch (exc) {}
          this.openSnackBar('error', errorMessage);
        } catch (error) {
          console.log(
            'Error while displaying snackbar in error message',
            error
          );
        }
      };
      const onProgress = (progress) => {
        //console.log(progress);
      };
      try {
        this.setStateWithoutError({ progressBarRender: true });
        if (this.props.setProgressBarRender) {
          this.props.setProgressBarRender(true);
        }
      } catch (error) {
        console.log('Error while updating progress bar', error);
      }

      parser.parse(onload, onError, onProgress);
      //console.log('Parsing started', this.props.gltfobj.gltf);
    }
    //}
  };

  updateChildsOfMine = (
    myColor,
    myTexture,
    myMetal,
    myRough,
    myOpaque,
    myId,
    whatchanged
  ) => {
    //const myStateTree = state.gltfobj.tree || this.props.gltfobj.tree;
    const state_gltfobj = this.this_state_gltf || this.props.gltfobj;

    const myStateTree = state_gltfobj.tree;
    myStateTree.forEach((element) => {
      if (element[gltf_Dict['parentId']] == myId) {
        if (element[gltf_Dict['leaf']]) {
          if (element[gltf_Dict['name']]) {
            //console.log('Coming from hre 3');
            const mymesh = this.findMyMaterial(element, false);
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
                  if (!mymesh['setUV']) {
                    mymesh.geometry.setAttribute(
                      'uv',
                      new Float32BufferAttribute(uvarry, 2)
                    );
                    mymesh['setUV'] = true;
                  }

                  mymaterial.needsUpdate = true;
                }
              }
              if (whatchanged == SELECTMETAL) {
                //console.log(this.partsMeshes[element.binId-1]);
                //const mymaterial = this.partsMeshes[element.binId-1].material;
                const mymaterial = mymesh.material;
                if (mymaterial) {
                  mymaterial[gltf_Dict['metallicFactor']] = myMetal;
                  mymaterial.metalness = myMetal;
                }
              }
              if (whatchanged == SELECTROUGH) {
                //console.log(this.partsMeshes[element.binId-1]);
                //const mymaterial = this.partsMeshes[element.binId-1].material;
                const mymaterial = mymesh.material;
                if (mymaterial) {
                  mymaterial[gltf_Dict['roughnessFactor']] = myRough;
                  mymaterial.roughness = myRough;
                }
              }
              if (whatchanged == SELECTOPAQUE) {
                //console.log(this.partsMeshes[element.binId-1]);
                //const mymaterial = this.partsMeshes[element.binId-1].material;
                const mymaterial = mymesh.material;
                if (mymaterial) {
                  mymaterial.transparent = myOpaque != 1;
                  mymaterial.opaque = myOpaque;
                  mymaterial.opacity = myOpaque;
                }
              }
            }
          }
        } else {
          this.updateChildsOfMine(
            myColor,
            myTexture,
            myMetal,
            myRough,
            myOpaque,
            element[gltf_Dict['id']],
            whatchanged
          );
        }
      }
    });
  };

  getFloatArray = (data64, data = null) => {
    //console.log(data64);
    var blob = null;
    if (data) {
      blob = data;
    } else {
      try {
        blob = atob(data64);
      } catch (error) {
        console.log('not a base64');
      }
    }

    if (blob) {
      var fLen = blob.length / Float32Array.BYTES_PER_ELEMENT, // How many floats can be made, but be even
        dView = new DataView(new ArrayBuffer(Float32Array.BYTES_PER_ELEMENT)), // ArrayBuffer/DataView to convert 4 bytes into 1 float.
        fAry = new Float32Array(fLen), // Final Output at the correct size
        p = 0; // Position

      for (var j = 0; j < fLen; j++) {
        p = j * 4;
        dView.setUint8(0, blob.charCodeAt(p));
        dView.setUint8(1, blob.charCodeAt(p + 1));
        dView.setUint8(2, blob.charCodeAt(p + 2));
        dView.setUint8(3, blob.charCodeAt(p + 3));
        fAry[j] = dView.getFloat32(0, true);
        //console.log(fAry[j]);
      }
      return fAry;
    } else {
      return null;
    }
  };

  readUV = (data64) => {
    //console.log(data64);
    var blob = atob(data64), // Base64 string converted to a char array
      fLen = blob.length / Float32Array.BYTES_PER_ELEMENT, // How many floats can be made, but be even
      dView = new DataView(new ArrayBuffer(Float32Array.BYTES_PER_ELEMENT)), // ArrayBuffer/DataView to convert 4 bytes into 1 float.
      fAry = new Float32Array(fLen), // Final Output at the correct size
      p = 0; // Position

    for (var j = 0; j < fLen; j++) {
      p = j * 4;
      dView.setUint8(0, blob.charCodeAt(p));
      dView.setUint8(1, blob.charCodeAt(p + 1));
      dView.setUint8(2, blob.charCodeAt(p + 2));
      dView.setUint8(3, blob.charCodeAt(p + 3));
      fAry[j] = dView.getFloat32(0, true);
    }
    return fAry;
  };

  assignUVs = (geometry) => {
    if (geometry.faces) {
      if (geometry.faceVertexUvs) {
        geometry.faceVertexUvs[0] = [];
      } else {
        geometry['faceVertexUvs'] = [];
        geometry['faceVertexUvs'][0] = [];
      }

      geometry.faces.forEach((face) => {
        var uvs = [];
        var ids = ['a', 'b', 'c'];
        for (var i = 0; i < ids.length; i++) {
          var vertex = geometry.vertices[face[ids[i]]].clone();

          var n = vertex.normalize();
          var yaw = 0.5 - Math.atan(n.z, -n.x) / (2.0 * Math.PI);
          var pitch = 0.5 - Math.asin(n.y) / Math.PI;

          var u = yaw,
            v = pitch;
          uvs.push(new Vector2(u, v));
        }
        geometry.faceVertexUvs[0].push(uvs);
      });

      geometry.uvsNeedUpdate = true;
    }
  };

  onlyfaces = (name) => {
    const first4chars = name.slice(0, 4);
    const first6chars = name.slice(0, 6);
    if (
      first4chars == 'PART' ||
      first4chars == 'EDGE' ||
      first6chars == 'VERTEX'
    ) {
      return false;
    }
    return true;
  };

  onlyparts = (name) => {
    const first4chars = name.slice(0, 4);
    return first4chars == 'PART';
  };

  /*
    fetchTree = (fileStore,progressfile) => {        
        getAFileFromStore(fileStore,"tree")
        .then(res => res.data)
        .then((data) => {
                //console.log(data);
                //console.log(this.props.gltfobj.tree);
                //var myStateTree = state.gltfobj.tree || this.props.gltfobj.tree;
                const state_gltfobj = this.this_state_gltf || this.state.gltfobj  || this.props.gltfobj;

                var myStateTree = state_gltfobj.tree;
                myStateTree = [...myStateTree,...data];
                //var gltfobj = { ...state.gltfobj } || { ...this.props.gltfobj }
                var gltfobj = { ...state_gltfobj }
                gltfobj.tree = myStateTree; 
                //this.changeState = true;
                //this.setState({gltfobj:gltfobj});
                if(this.props.setStateOfgltf) {
                    this.props.setStateOfgltf(gltfobj);
                }
                //this.props.gltfobj.tree = [...this.props.gltfobj.tree,...data];
                                    
                //console.log(this.props.gltfobj.tree);
        }).catch(err => {           
            console.log("Error While Loading Tree", err);
            getAFileFromStore(progressfile,"progress")
            .then(res => res.data)
            .then((data) => {
                if(!data || data.begin!=data.end) {
                    console.log(data);
                    alert("Edges are still under construction. Please try after sometime");
                } 
             })
            .catch(err => {           
                console.log("Error While Loading Progress", err);
            }); 
        });           
    };
    */

  findSingleNode = async (mynode, addToGDTTable = true, clickKey = null) => {
    let selectHere = true;
    //console.log(this.props,this.props.fileGDT,addToGDTTable);
    if (this.props.fileGDT && addToGDTTable && clickKey !== null) {
      var myParentID = -1;
      var findEdges = 0;
      //const myStateTree = state.gltfobj.tree || this.props.gltfobj.tree;
      const state_gltfobj = this.this_state_gltf || this.props.gltfobj;

      const myStateTree = state_gltfobj.tree;
      //console.log('State tree', myStateTree, this.props.gltfobj);
      for (var i = 0; i < myStateTree.length; i++) {
        if (myStateTree[i][gltf_Dict['name']] == mynode.name) {
          myParentID = myStateTree[i][gltf_Dict['id']];
          //myParentID = this.props.gltfobj.tree[i][gltf_Dict["parentId"]];
          findEdges = myStateTree[i][gltf_Dict['subfeatures']];
          if (!findEdges) {
            if (myStateTree[i][gltf_Dict['element']] == 'F') {
              myParentID = myStateTree[i][gltf_Dict['parentId']];
            }
          }
          break;
        }
      }
      if (myParentID == -1) {
        //alert("Unable to find a parent for this!");
        console.log('Unable to find a parent for this!', mynode);
      }
      //console.log("My ID",myParentID)
      if (myParentID != -1 && !findEdges) {
        let featureSetStart = 0;
        if (!findEdges) {
          for (var i = 0; i < myStateTree.length; i++) {
            if (myStateTree[i][gltf_Dict['parentId']] == myParentID) {
              findEdges = myStateTree[i][gltf_Dict['subfeatures']];
              if (findEdges == 'v') {
                featureSetStart = 3;
                break;
              }
            }
          }
        }
        if (findEdges == 'e') {
          featureSetStart = 2;
        }
        if (findEdges != 'e' && findEdges != 'v') {
          for (var i = 0; i < myStateTree.length; i++) {
            if (myStateTree[i][gltf_Dict['parentId']] == myParentID) {
              if (myStateTree[i][gltf_Dict['subfeatures']] == 'e') {
                findEdges = 'e';
                featureSetStart = 2;
                //console.log("Finds already edges",i,this.props.gltfobj.tree[i],this.props.gltfobj.tree[i][gltf_Dict["parentId"]],myParentID,this.props.gltfobj.tree[i][gltf_Dict["subfeatures"]]);
                break;
              }
            }
          }
        }
        if (findEdges == 'f') {
          featureSetStart = 1;
        }
        if (findEdges != 'f' && findEdges != 'e' && findEdges != 'v') {
          for (var i = 0; i < myStateTree.length; i++) {
            if (myStateTree[i][gltf_Dict['parentId']] == myParentID) {
              if (myStateTree[i][gltf_Dict['subfeatures']] == 'f') {
                findEdges = 'f';
                featureSetStart = 1;
                //console.log("Finds already edges",i,this.props.gltfobj.tree[i],this.props.gltfobj.tree[i][gltf_Dict["parentId"]],myParentID,this.props.gltfobj.tree[i][gltf_Dict["subfeatures"]]);
                break;
              }
            }
          }
        }
        //console.log("Load Features bef",findEdges,!findEdges,featureSetStart);
        if (
          !findEdges ||
          (findEdges != 'f' && findEdges != 'e' && findEdges != 'v')
        ) {
          featureSetStart = 0;
        }

        let featureSetFinish = 3;
        if (this.selectedoption == SELECTFACE || clickKey.ctrlKey) {
          featureSetFinish = 1;
        } else if (this.selectedoption == SELECTEDGE || clickKey.altKey) {
          featureSetFinish = 2;
        } else if (
          this.selectedoption == SELECTASSEMBLY ||
          this.selectedoption == SELECTSOLID
        ) {
          featureSetFinish = 0;
        }
        console.log(
          'Load Features',
          findEdges,
          featureSetStart,
          featureSetFinish
        );
        if (featureSetStart < featureSetFinish) {
          await this.loadAllEdges(
            myParentID,
            featureSetStart,
            featureSetFinish,
            mynode
          ); //Reusable component..
          if (addToGDTTable) {
            //console.log("Adding here Gdt table",myParentID,featureSetStart, featureSetFinish, mynode);
            await this.addGDTTable(
              myParentID,
              featureSetStart,
              featureSetFinish,
              mynode
            );
          }
          if (mynode) {
            const first4chars = mynode.name.slice(0, 4);
            selectHere = first4chars != 'PART';
          }
          //selectHere=false;
          /* const loader = new GLTFLoader().setPath(resourcePathURL || '').setCrossOrigin('anonymous');
                   
            
                    const onload = ( gltf ) => {
                        const myobject = gltf.scene || gltf.scenes[0];
                        myobject.position.x += (this.shiftposition.x);
                        myobject.position.y += (this.shiftposition.y);
                        myobject.position.z += (this.shiftposition.z);
                        this.scene.add(myobject);
                        this.content.push(myobject);
                        //console.log("MyObject",myobject);
                        let partsMeshes = myobject.children;

                        if (partsMeshes[0].children.length > 0) {
                            partsMeshes = partsMeshes[0].children;
                        }

                        if (partsMeshes[0].children.length > 0) {
                            partsMeshes = partsMeshes[0].children;
                        }
                        //console.log(partsMeshes);
                        //partsMeshes.forEach(element => {
                        //    if(!element.renderOrder) {
                        //        console.log("Chaning Renderingorder from",element.renderOrder,1,element.name);
                        //        element.renderOrder=1;
                        //    }                           
                        //});
                        //console.log(this.partsMeshes);
                        this.partsMeshes = [...this.partsMeshes,...partsMeshes];
                        //console.log(this.partsMeshes);
                    }
                    
                    const onError = (exception) => {
                        console.log(exception);
                    }
                    const onProgress = (progress) => {
                        //console.log(progress);
                    }
                    //this.fetchTree(gltfFILE,progressFile,myParentID);
                    
                    const progressFile = this.props.fileGDT.slice(0, this.props.fileGDT.length - 1);                   
                    getAFileFromStore(progressFile,"progress")
                    .then(res => res.data)
                    .then((data) => {
                        if(!data || data.begin!=data.end) {
                            console.log(data);
                            alert("Edges are still under construction. Please try after sometime");
                        } else {
                            let howManyFiles = data.files?data.files[myParentID]:1;
                            if(howManyFiles==0) {
                                howManyFiles=1;
                            }
                            let fileStore = progressFile + "-" +myParentID.toString()+"3";
                            for (let index = 0; index < howManyFiles; index++) {
                                if(index > 0) {
                                    fileStore = progressFile + "-" +myParentID.toString()+"-"+index.toString()+"3";
                                }
                                getAFileFromStore(fileStore,"tree")
                                .then(res => res.data)
                                .then((data) => {
                                        //console.log(data);
                                        //console.log(this.props.gltfobj.tree);
                                        this.props.gltfobj.tree = [...this.props.gltfobj.tree,...data];
                                        //console.log(this.props.gltfobj.tree);
                                }).catch(err => {           
                                    console.log("Error While Loading Tree", err);
                                
                                })
                                loader.load(fileStore+".gltf", onload, onProgress, onError,1 );
                            }
                            
                        }
                    })
                    .catch(err => {           
                        console.log("Error While Loading Progress", err);
                    });  */
        }
      }
    } else {
      //alert("Unable to find a GDT for this!");
      //console.log("Unable to find a GDT for this!");
    }
    return { node: [mynode], select: selectHere };
  };

  findMyParentPart = (mynode) => {
    var myParentID = -1;
    //const myStateTree = state.gltfobj.tree || this.props.gltfobj.tree;
    const state_gltfobj = this.this_state_gltf || this.props.gltfobj;

    const myStateTree = state_gltfobj.tree;
    for (var i = 0; i < myStateTree.length; i++) {
      if (myStateTree[i][gltf_Dict['name']] == mynode.name) {
        myParentID = myStateTree[i][gltf_Dict['parentId']];
        if (myStateTree[i][gltf_Dict['element']] == 'P') {
          return myStateTree[i];
        } else {
          break;
        }
      }
    }

    if (myParentID == -1) {
      return null;
    } else {
      var myParentsParentID = -1;
      for (var i = 0; i < myStateTree.length; i++) {
        if (myStateTree[i][gltf_Dict['id']] == myParentID) {
          myParentsParentID = myStateTree[i][gltf_Dict['parentId']];
          if (myStateTree[i][gltf_Dict['element']] == 'P') {
            return myStateTree[i];
          } else {
            break;
          }
        }
      }
      //console.log("Parent", myParentsParentID, myParentID, mynode);
      if (myParentsParentID == -1) {
        //RootNode
        //console.log("Pushing", myParentsParentID, myParentID, myID);
        return null;
      } else {
        for (var i = 0; i < myStateTree.length; i++) {
          if (myStateTree[i][gltf_Dict['id']] == myParentsParentID) {
            if (myStateTree[i][gltf_Dict['element']] == 'P') {
              return myStateTree[i];
            }
          }
        }
      }
      return null;
    }
  };

  findSiblingNodes = (mynode, addToGDTTable = true) => {
    //console.log(this.props.selectedoption,SELECTSOLID,this.props.selectedoption != SELECTSOLID);
    const myParentPart = this.findMyParentPart(mynode);
    var myMaterials = [];
    if (myParentPart) {
      //console.log('Coming from hre 4');
      const myChild = this.findMyMaterial(myParentPart, false);
      if (myChild) {
        myMaterials.push(myChild);
      }
    }
    //console.log("MySiblings",myParentPart,myMaterials);
    /* var myParentID = -1;
        
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
                        if ((this.props.gltfobj.tree[i][gltf_Dict["element"]]=="F") ||
                             (this.onlyfaces(myChild.name)) ) {
                            myMaterials.push(myChild);
                        }
                    }
                }
            }
        }
        */
    if (myMaterials.length != 0) {
      return myMaterials;
    }
    return [mynode];
  };

  findMyMaterial = (data, byname = true) => {
    //console.log(this.partsMeshes);
    if (this.partsMeshes) {
      for (var i = 0; i < this.partsMeshes.length; i++) {
        //console.log(this.partsMeshes[i].name,data.name,(this.partsMeshes[i].name==data.name))

        if (byname) {
          if (this.partsMeshes[i].name == data.name) {
            return this.partsMeshes[i];
          }
        } else {
          if (this.partsMeshes[i].name == data[gltf_Dict['name']]) {
            return this.partsMeshes[i];
          }
        }
      }
    }
    console.log(
      'I could not Find my Material, please check',
      this.partsMeshes,
      data
    );
    return null;
  };

  findFamilyNodes = (mynode, addToGDTTable = true) => {
    var myParentID = -1;
    var myID = -1;
    var mySelectedNode = mynode;
    var parentNode = null;
    const state_gltfobj = this.this_state_gltf || this.props.gltfobj;
    const myStateTree = state_gltfobj ? state_gltfobj.tree : [];
    const getTopParentNode = (node) => {
      let nodeParentID = node[gltf_Dict['parentId']];
      if (nodeParentID == null || nodeParentID == 1) {
        return node;
      } else {
        if (myStateTree) {
          for (var i = 0; i < myStateTree.length; i++) {
            if (myStateTree[i][gltf_Dict['id']] == nodeParentID) {
              let myParentsParent = getTopParentNode(myStateTree[i]);
              if (myParentsParent) {
                return myParentsParent;
              }
            }
          }
        }
        return null;
      }
    };
    const getAllChildNodes = (node) => {
      const nodeID = node[gltf_Dict['id']];
      let childNodes = [];
      if (node[gltf_Dict['element']] == 'P') {
        childNodes = [node];
      }
      if (myStateTree) {
        for (var i = 0; i < myStateTree.length; i++) {
          const curNode = myStateTree[i];
          if (curNode[gltf_Dict['parentId']] == nodeID) {
            const curChildNodes = getAllChildNodes(curNode);
            curChildNodes.forEach((element) => {
              childNodes.push(element);
            });
          }
        }
      }
      return childNodes;
    };
    if (myStateTree) {
      for (var i = 0; i < myStateTree.length; i++) {
        if (myStateTree[i][gltf_Dict['name']] == mynode['name']) {
          mySelectedNode = myStateTree[i];
          myParentID = mySelectedNode[gltf_Dict['parentId']];
          myID = mySelectedNode[gltf_Dict['id']];
          parentNode = mySelectedNode;
          break;
        }
      }
    }
    const myParentPart = this.findMyParentPart(mynode);
    if (myParentPart) {
      parentNode = myParentPart;
      myParentID = parentNode[gltf_Dict['id']];
    }
    //console.log('GOt parentnode for selctions', myParentPart, myParentID);
    if (myParentID != -1) {
      if (myParentID != 1) {
        var myParentsParentID = -1;
        if (myStateTree) {
          for (var i = 0; i < myStateTree.length; i++) {
            if (myStateTree[i][gltf_Dict['id']] == myParentID) {
              myParentsParentID = myStateTree[i][gltf_Dict['parentId']];
              if (myParentsParentID != 1) {
                parentNode = myStateTree[i];
              }
              break;
            }
          }
        }
      }
      let myTopParent = parentNode ? parentNode : mynode;
      // console.log(
      //   'GOt parentnode for selctions1',
      //   myParentPart,
      //   myParentID,
      //   myTopParent
      // );
      if (
        myTopParent &&
        myTopParent[gltf_Dict['id']] != 1 &&
        myTopParent[gltf_Dict['parentId']] != 1
      ) {
        myTopParent = getTopParentNode(myTopParent);
      }
      // console.log(
      //   'GOt parentnode for selctions2',
      //   myParentPart,
      //   myParentID,
      //   myTopParent
      // );
      var myParents = [];
      if (myParentID == 1) {
        myParents = getAllChildNodes(mySelectedNode ? mySelectedNode : mynode);
        // console.log(
        //   'GOt parentnode for selctions3',
        //   myParentPart,
        //   myParentID,
        //   myTopParent,
        //   myMaterials
        // );
      } else {
        myParents = getAllChildNodes(
          myTopParent ? myTopParent : mySelectedNode ? mySelectedNode : mynode
        );
        // console.log(
        //   'GOt parentnode for selctions4',
        //   myParentPart,
        //   myParentID,
        //   myTopParent,
        //   myMaterials
        // );
      }
      if (myParents.length != 0) {
        var myMaterials = [];
        myParents.forEach((elementNode) => {
          var myChild = this.findMyMaterial(elementNode, false);
          if (myChild) {
            myMaterials.push(myChild);
          }
        });
        if (myMaterials.length != 0) {
          // console.log(
          //   'GOt parentnode for selctions5',
          //   myParentPart,
          //   myParentID,
          //   myTopParent,
          //   myMaterials
          // );
          return myMaterials;
        }
      }
    }
    //console.log('GOt parentnode for selctions6', mynode);
    return [mynode];
  };

  /*
  findFamilyNodes = (mynode, addToGDTTable = true) => {
    var myParentID = -1;
    var myID = -1;
    //const myStateTree = state.gltfobj.tree || this.props.gltfobj.tree;
    const state_gltfobj = this.this_state_gltf || this.props.gltfobj;

    const myStateTree = state_gltfobj.tree;
    for (var i = 0; i < myStateTree.length; i++) {
      if (myStateTree[i][gltf_Dict['name']] == mynode.name) {
        myParentID = myStateTree[i][gltf_Dict['parentId']];
        myID = myStateTree[i][gltf_Dict['id']];
        //console.log("Getting Here1",this.props.gltfobj.tree[i]);
        break;
      }
    }
    const myParentPart = this.findMyParentPart(mynode);
    if (myParentPart) {
      myParentID = myParentPart[gltf_Dict['id']];
      //console.log("Getting Here2",myParentPart);
    }
    //console.log("Parent", myParentID, myID);
    var myMaterials = [];
    if (myParentID != -1) {
      var myParentsParentID = -1;
      for (var i = 0; i < myStateTree.length; i++) {
        if (myStateTree[i][gltf_Dict['id']] == myParentID) {
          myParentsParentID = myStateTree[i][gltf_Dict['parentId']];
          break;
        }
      }
      //console.log("Parent", myParentsParentID, myParentID, myID);
      var myParents = [];
      if (myParentID == 1) {
        myParents.push(myID);
      } else {
        if (myParentsParentID == -1 || myParentsParentID == 1) {
          //RootNode
          //console.log("Pushing", myParentsParentID, myParentID, myID);
          myParents.push(myParentID);
        } else {
          for (var i = 0; i < myStateTree.length; i++) {
            if (myStateTree[i][gltf_Dict['parentId']] == myParentsParentID) {
              myParents.push(myStateTree[i][gltf_Dict['id']]);
            }
          }
        }
      }

      //console.log("MyParents",myParents);
      for (var j = 0; j < myParents.length; j++) {
        myParentID = myParents[j];
        for (var i = 0; i < myStateTree.length; i++) {
          if (myStateTree[i][gltf_Dict['id']] == myParentID) {
            //console.log('Coming from hre 1');
            var myChild = this.findMyMaterial(myStateTree[i], false);
            if (myChild) {
              if (
                myStateTree[i][gltf_Dict['element']] == 'P' ||
                this.onlyparts(myChild.name)
              ) {
                myMaterials.push(myChild);
              }
            }
            //console.log(myChild,myMaterials,this.props.gltfobj.tree[i]);
          }
        }
      }
    }
    if (myMaterials.length != 0) {
      return myMaterials;
    }
    return [mynode];
  };
  */
  findTopAssembly = (mynode) => {
    var myParentID = -1;
    var myID = -1;
    var mySelectedNode = null;
    var parentNode = null;
    const state_gltfobj = this.this_state_gltf || this.props.gltfobj;
    const myStateTree = state_gltfobj ? state_gltfobj.tree : [];
    const getTopParentNode = (node) => {
      let nodeParentID = node[gltf_Dict['parentId']];
      if (nodeParentID == null || nodeParentID == 1) {
        return node;
      } else {
        if (myStateTree) {
          for (var i = 0; i < myStateTree.length; i++) {
            if (myStateTree[i][gltf_Dict['id']] == nodeParentID) {
              let myParentsParent = getTopParentNode(myStateTree[i]);
              if (myParentsParent) {
                return myParentsParent;
              }
            }
          }
        }
        return null;
      }
    };

    if (myStateTree) {
      for (var i = 0; i < myStateTree.length; i++) {
        if (myStateTree[i][gltf_Dict['name']] == mynode[['name']]) {
          mySelectedNode = myStateTree[i];
          myParentID = mySelectedNode[gltf_Dict['parentId']];
          myID = mySelectedNode[gltf_Dict['id']];
          parentNode = mySelectedNode;
          break;
        }
      }
    }
    const myParentPart = this.findMyParentPart(mynode);
    if (myParentPart) {
      parentNode = myParentPart;
      myParentID = parentNode[gltf_Dict['id']];
    }
    //console.log('GOt parentnode for selctions', myParentPart, myParentID);
    if (myParentID != -1) {
      if (myParentID != 1) {
        var myParentsParentID = -1;
        if (myStateTree) {
          for (var i = 0; i < myStateTree.length; i++) {
            if (myStateTree[i][gltf_Dict['id']] == myParentID) {
              myParentsParentID = myStateTree[i][gltf_Dict['parentId']];
              if (myParentsParentID != 1) {
                parentNode = myStateTree[i];
              }
              break;
            }
          }
        }
      }
      let myTopParent = parentNode ? parentNode : mySelectedNode;
      // console.log(
      //   'GOt parentnode for selctions1',
      //   myParentPart,
      //   myParentID,
      //   myTopParent
      // );
      if (
        myTopParent &&
        myTopParent[gltf_Dict['id']] != 1 &&
        myTopParent[gltf_Dict['parentId']] != 1
      ) {
        myTopParent = getTopParentNode(myTopParent);
      }
      // console.log(
      //   'GOt parentnode for selctions2',
      //   myParentPart,
      //   myParentID,
      //   myTopParent
      // );

      if (myParentID == 1 || !myTopParent) {
        return mySelectedNode;
      } else {
        return myTopParent;
        // console.log(
        //   'GOt parentnode for selctions4',
        //   myParentPart,
        //   myParentID,
        //   myTopParent,
        //   myMaterials
        // );
      }
    }
    //console.log('GOt parentnode for selctions6', mynode);
    return mySelectedNode;
  };

  findMyParentChilds = async (mynode, addToGDTTable = true) => {
    /*console.log(this.props.selectedoption,SELECTSOLID,
            this.props.selectedoption != SELECTSOLID,this.props.selectedoption,SELECTASSEMBLY,
            this.props.splitmethod,SELECTDISECTPARTS); 
        */
    if (
      (this.selectedoption != SELECTSOLID &&
        this.selectedoption != SELECTASSEMBLY) ||
      this.props.splitmethod != SELECTDISECTPARTS
    ) {
      //console.log("I am finding single node");
      return await this.findSingleNode(mynode, addToGDTTable);
    }
    if (this.selectedoption == SELECTASSEMBLY) {
      //console.log("I am finding family node");
      return {
        node: this.findFamilyNodes(mynode, addToGDTTable),
        select: true
      };
    } else {
      //console.log("I am finding sibling node");
      return {
        node: this.findSiblingNodes(mynode, addToGDTTable),
        select: true
      };
    }
  };

  changeBackground = () => {
    if (
      this.databackcolor != this.props.backcolor &&
      this.props.dataselection == SELECTBACKCOLOR
    ) {
      this.databackcolor = this.props.backcolor;
      //console.log(this.databackcolor);
      if (this.renderer) {
        if (this.scene) {
          this.scene.background = null;
        }
        this.renderer.setClearColor(this.databackcolor || DEFAULTBACKCOLOR());
      }
    }
    if (
      this.dataselectcolor != this.props.selectcolor &&
      this.props.dataselection == SELECTSELECTCOLOR
    ) {
      this.dataselectcolor = this.props.selectcolor;
      if (this.firstshell) {
        if (this.firstshell.selectedshell) {
          this.firstshell.material.color = this.convertColor(
            this.props.selectcolor || DEFAULTSELECTCOLOR()
          );
        }
      }
      if (this.secondshell) {
        if (this.secondshell.selectedshell) {
          this.secondshell.material.color = this.convertColor(
            this.props.selectcolor || DEFAULTSELECTCOLOR()
          );
        }
      }
    }
    if (
      this.datatouchcolor != this.props.touchcolor &&
      this.props.dataselection == SELECTTOUCHCOLOR
    ) {
      this.datatouchcolor = this.props.touchcolor;
      if (this.INTERSECTED) {
        this.INTERSECTED.material.color = this.convertColor(
          this.props.touchcolor || DEFAULTTOUCHCOLOR()
        );
      }
    }
    //console.log("data2texture",this.data2texture,"prp2",this.props.data2texture,this.props.dataselection )
    if (
      this.data2texture != this.props.data2texture &&
      this.props.dataselection == SELECT2DTEXTURE
    ) {
      this.data2texture = this.props.data2texture;
      var myTexture = null;
      if (this.scene) {
        if (this.data2texture == 'None' || this.data2texture == null) {
          myTexture = null;
        } else {
          const textureLoader = new TextureLoader();
          //console.log(this.data2texture);
          myTexture = textureLoader.load(resourcePathBase + this.data2texture);
        }
        this.scene.background = myTexture;
        if (!myTexture) {
          if (this.renderer) {
            this.renderer.setClearColor(
              this.databackcolor || DEFAULTBACKCOLOR()
            );
          }
        }
      }
    }
    //console.log("data3texture",this.data3texture,"prp3",this.props.data23texture,this.props.dataselection )
    if (
      this.data3texture != this.props.data3texture &&
      this.props.dataselection == SELECT3DTEXTURE
    ) {
      this.data3texture = this.props.data3texture;
      var myTexture = null;
      if (this.scene) {
        if (this.data3texture == 'None' || this.data3texture == null) {
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
          ]);
        }
        this.scene.background = myTexture;
        if (!myTexture) {
          if (this.renderer) {
            this.renderer.setClearColor(
              this.databackcolor || DEFAULTBACKCOLOR()
            );
          }
        }
      }
    }
  };

  changeBackgroundWhenPropsChange = () => {
    if (this.databackcolor != this.props.backcolor) {
      this.databackcolor = this.props.backcolor;
      console.log('Backcolor change', this.databackcolor);
      if (this.renderer) {
        if (this.scene) {
          this.scene.background = null;
        }
        this.renderer.setClearColor(this.databackcolor || DEFAULTBACKCOLOR());
      }
    }
    if (this.dataselectcolor != this.props.selectcolor) {
      this.dataselectcolor = this.props.selectcolor;
      console.log('selectcolor change', this.dataselectcolor);
      if (this.firstshell) {
        if (this.firstshell.selectedshell) {
          this.firstshell.material.color = this.convertColor(
            this.props.selectcolor || DEFAULTSELECTCOLOR()
          );
        }
      }
      if (this.secondshell) {
        if (this.secondshell.selectedshell) {
          this.secondshell.material.color = this.convertColor(
            this.props.selectcolor || DEFAULTSELECTCOLOR()
          );
        }
      }
    }
    if (this.datatouchcolor != this.props.touchcolor) {
      this.datatouchcolor = this.props.touchcolor;
      console.log('touchcolor change', this.datatouchcolor);
      if (this.INTERSECTED) {
        this.INTERSECTED.material.color = this.convertColor(
          this.props.touchcolor || DEFAULTTOUCHCOLOR()
        );
      }
    }
  };

  setTouchingColor = (meshmaterial) => {
    /* if(!(this.isObjectSame(meshmaterial,this.firstshell)||this.isObjectSame(meshmaterial,this.firstshell ))) {
            if( (meshmaterial.currentHex === null) || (typeof meshmaterial.currentHex === 'undefined')){
                meshmaterial.currentHex = meshmaterial.material.color.getHex();
            } else {
                //console.log("My color1",meshmaterial.currentHex);
            }
        } else { */
    if (meshmaterial && meshmaterial.material) {
      if (
        meshmaterial.currentHex === null ||
        typeof meshmaterial.currentHex === 'undefined'
      ) {
        meshmaterial.currentHex = meshmaterial.material.color.getHex();
        meshmaterial.currentOpaque = meshmaterial.material.opacity;
      } else {
        //console.log("My color2",meshmaterial.currentHex);
      }
      /*}*/
      //console.log("before",meshmaterial,meshmaterial.material.color);
      meshmaterial.material.color = this.convertColor(
        this.props.touchcolor || DEFAULTTOUCHCOLOR()
      ); // this.props.distanceColor || distanceColor);
      meshmaterial.material.opacity = 1.0;
    }
    //console.log("after",meshmaterial,meshmaterial.material.color);
  };

  setSelectionColor = (meshmaterial) => {
    /* if(!(this.isObjectSame(meshmaterial,this.firstshell)||this.isObjectSame(meshmaterial,this.firstshell ))) {
            if( (meshmaterial.currentHex === null) || (typeof meshmaterial.currentHex === 'undefined')){
                meshmaterial.currentHex = meshmaterial.material.color.getHex();
            } else {
                //console.log("My color1",meshmaterial.currentHex);
            }
        } else { */
    if (meshmaterial && meshmaterial.material) {
      if (
        meshmaterial.currentHex === null ||
        typeof meshmaterial.currentHex === 'undefined'
      ) {
        meshmaterial.currentHex = meshmaterial.material.color.getHex();
        meshmaterial.currentOpaque = meshmaterial.material.opacity;
      } else {
        //console.log("My color2",meshmaterial.currentHex);
      }
      /*}*/
      //console.log("before",meshmaterial.material.color);
      meshmaterial.material.color = this.convertColor(
        this.props.selectcolor || DEFAULTSELECTCOLOR()
      ); // this.props.distanceColor || distanceColor);
      meshmaterial.material.opacity = 1.0;
    }

    //console.log("after",meshmaterial.material.color);
  };

  setOriginalColor = (meshmaterial) => {
    if (meshmaterial && meshmaterial.material) {
      if (
        meshmaterial.currentHex === null ||
        typeof meshmaterial.currentHex === 'undefined'
      ) {
        return;
      }
      meshmaterial.material.color.setHex(meshmaterial.currentHex);
      meshmaterial.material.opacity = meshmaterial.currentOpaque;
    }
    //console.log('Setting here!', meshmaterial);
  };

  changeStateOfSelection = async (
    meshmaterial,
    event,
    addToGDTTable = true
  ) => {
    if (meshmaterial && this.selectedoption == SELECTMEASURE) {
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
            this.setOriginalColor(this.firstshell);
            //this.firstshell.material.color.setHex(this.firstshell.currentHex);
            this.firstshell.selectedshell = false;
            this.firstshell = this.secondshell;
            this.secondshell = meshmaterial;
            //console.log("First and second",this.firstshell,this.secondshell,meshmaterial);
          }
        }
      } else {
        if (this.firstshell && this.firstshell.name == meshmaterial.name) {
          this.setOriginalColor(this.firstshell);
          //this.firstshell.material.color.setHex(this.firstshell.currentHex);
          this.firstshell.selectedshell = false;
          this.firstshell = this.secondshell;
          this.secondshell = null;
          //console.log("First and second making null",this.firstshell,this.secondshell)
        } else {
          if (this.secondshell && this.secondshell.name == meshmaterial.name) {
            this.setOriginalColor(this.secondshell);
            //this.secondshell.material.color.setHex(this.secondshell.currentHex);
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
          this.state_selectedObjects.forEach((elementobject) => {
            if (meshmaterial.name != elementobject.name) {
              elementobject.selectedshell = false;
              this.setOriginalColor(elementobject);
              //elementobject.material.color.setHex(elementobject.currentHex);
            }
          });
        }

        const myAllChilds = await this.findMyParentChilds(
          meshmaterial,
          addToGDTTable
        );
        //console.log('My Mesh name', meshmaterial, myAllChilds);
        if (
          myAllChilds.select == false &&
          this.selectedoption != SELECTFEATURE &&
          this.selectedoption != SELECTASSEMBLY &&
          this.selectedoption != SELECTSOLID
        ) {
          meshmaterial.selectedshell = myAllChilds.select;
          this.setOriginalColor(meshmaterial);
          //meshmaterial.material.color.setHex(meshmaterial.currentHex);
          this.state_selectedObjects.forEach((elementobject) => {
            if (meshmaterial.name == elementobject.name) {
              elementobject.selectedshell = false;
              this.setOriginalColor(elementobject);
              //elementobject.material.color.setHex(elementobject.currentHex);
            }
          });
        }
        var copy_selectobjects = [
          ...(this.state_selectedObjects ? this.state_selectedObjects : [])
        ];
        //console.log('My All childs', myAllChilds);
        myAllChilds.node.forEach((element) => {
          // console.log(
          //   'Setting colors',
          //   meshmaterial.selectedshell,
          //   element.selectedshell
          // );
          element.selectedshell = meshmaterial.selectedshell;
          /* console.log(
            'Before Setting colors',
            meshmaterial.selectedshell,
            element.selectedshell,
            toAdd,
            element
          ); */
          if (meshmaterial.selectedshell) {
            this.setSelectionColor(element);
          } else {
            this.setOriginalColor(element);
            /*  if(element.currentHex){
                            element.material.color.setHex(element.currentHex);
                        }   */
          }
          // console.log(
          //   'After Setting colors',
          //   meshmaterial.selectedshell,
          //   element.selectedshell,
          //   toAdd,
          //   element
          // );
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
              //console.log("Before Removing object from",copy_selectobjects, element.name,element,element.selectedshell);
              copy_selectobjects = arrayRemoveFromMesh(
                copy_selectobjects,
                element.name
              );
              //console.log("After Removing object from",copy_selectobjects, element.name,element,element.selectedshell);
              this.state_selectedObjects = copy_selectobjects;
              //this.setState({selectedObjects:selectedObjects});
            }
          } else {
            if (meshmaterial.selectedshell) {
              this.state_selectedObjects = myAllChilds.node;
              //this.setState({selectedObjects:[meshmaterial]});
              //this.setSelectionColor(meshmaterial);
            } else {
              this.state_selectedObjects = [];
              //this.setState({selectedObjects:[]});
              //meshmaterial.material.color.setHex( meshmaterial.currentHex );
            }
          }
        });
        // console.log(
        //   'Selected Objects',
        //   this.state_selectedObjects,
        //   meshmaterial
        // );
      } else {
        //console.log('No material', this.state_selectedObjects);
        this.state_selectedObjects.forEach((elementobject) => {
          elementobject.selectedshell = false;
          this.setOriginalColor(elementobject);
          //elementobject.material.color.setHex(elementobject.currentHex);
        });
        this.state_selectedObjects = [];
      }
    }
  };

  doOneSelection = async (element, event, addToGDTTable = true) => {
    if (element) {
      //console.log('Starting in gltfrender', element, element.selectedshell);
      let myItem = this.getSubDepthPart(element);
      if (!myItem) {
        myItem = element;
      }
      const aShape = this.getPrefixItem(myItem);
      if (
        aShape == 'FACE' ||
        aShape == 'EDGE' ||
        aShape == 'PART' ||
        aShape == 'VERTEX'
      ) {
        //console.log("Setting..",element);
        //element.selectedshell=true;
        //console.log("Setting..Done",element);
        //console.log('Coming from hre 5');
        const mymesh = this.findMyMaterial(myItem, false);

        if (mymesh) {
          // console.log(
          //   'Before',
          //   mymesh,
          //   element,
          //   mymesh.selectedshell,
          //   element.selectedshell
          // );
          mymesh.selectedshell = element.selectedshell;
          await this.changeStateOfSelection(mymesh, event, addToGDTTable);
          /*  if (this.props.onClick) {
                            const mytask =  this.props.onClick(mymesh, SELECTDISTANCE, event);                                                                      
                            console.log(element,mymesh);
                        } else {
                            console.log("No Click functions found",this.props.onClick,element);
                        } */
          event['ctrlKey'] = true;
          console.log(
            'aftet',
            mymesh,
            element,
            mymesh.selectedshell,
            element.selectedshell
          );
        } else {
          console.log('No mesh...?', mymesh, element, element.selectedshell);
        }
      }
    }
  };

  changeparts = () => {
    const changedata = this.props.changedata;
    this.changedctrlkey = this.props.ctrlKey;
    /* console.log(
      this.props.whatchanged,
      this.whatchanged,
      JSON.stringify(changedata),
      JSON.stringify(this.changeddataarray)
    ); */
    if (
      (this.props.whatchanged == SELECTANITEM &&
        stringify(changedata || {}) !=
          stringify(this.changeddataarray || {})) ||
      this.props.whatchanged != this.whatchanged ||
      (changedata ? changedata[gltf_Dict['name']] : '') != this.activeId ||
      (this.props.whatchanged == SELECTCOLOR &&
        (this[gltf_Dict['R']] != changedata[gltf_Dict['R']] ||
          this[gltf_Dict['G']] != changedata[gltf_Dict['G']] ||
          this[gltf_Dict['B']] != changedata[gltf_Dict['B']])) ||
      (this.props.whatchanged == SELECTTEXTURE &&
        changedata[gltf_Dict['texture']] &&
        this[gltf_Dict['texture']] != changedata[gltf_Dict['texture']].name) ||
      (this.props.whatchanged == SELECTMETAL &&
        this.datametal != changedata[gltf_Dict['metallicFactor']]) ||
      (this.props.whatchanged == SELECTROUGH &&
        this.datarough != changedata[gltf_Dict['roughnessFactor']]) ||
      (this.props.whatchanged == SELECTOPAQUE &&
        this.dataopaque != changedata[gltf_Dict['A']])
      /* ||
            ((this.props.whatchanged == SELECTDISTANCE) &&
                (this.selectedshell != changedata)) */
    ) {
      //console.log("BEFore",changedata,this.whatchanged,this.props.whatchanged,this.changeddataarray,this.changedctrlkey,this.props.ctrlKey);
      this.whatchanged = this.props.whatchanged;
      this.changeddataarray = changedata;
      this.changedctrlkey = this.props.ctrlKey;
      this.activeId = changedata ? changedata[gltf_Dict['name']] : '';
      //console.log("AFTer",changedata,this.whatchanged,this.props.whatchanged,this.changeddataarray,this.changedctrlkey,this.props.ctrlKey);

      if (this.props.whatchanged == SELECTCOLOR) {
        this[gltf_Dict['R']] = changedata[gltf_Dict['R']];
        this[gltf_Dict['G']] = changedata[gltf_Dict['G']];
        this[gltf_Dict['B']] = changedata[gltf_Dict['B']];
        //console.log(changedata);
        if (changedata[gltf_Dict['leaf']]) {
          if (changedata[gltf_Dict['name']]) {
            //console.log(this.partsMeshes[changedata.binId-1]);
            //const mymaterial = this.partsMeshes[element.binId-1].material;
            //console.log('Coming from hre 6');
            const mymesh = this.findMyMaterial(changedata, false);
            if (mymesh) {
              const mymaterial = mymesh.material;
              //console.log("1",mymaterial);
              if (mymaterial) {
                mymaterial.color = new Color(
                  changedata[gltf_Dict['R']],
                  changedata[gltf_Dict['G']],
                  changedata[gltf_Dict['B']]
                );
              }
            }
          }
        } else {
          this.updateChildsOfMine(
            new Color(
              changedata[gltf_Dict['R']],
              changedata[gltf_Dict['G']],
              changedata[gltf_Dict['B']]
            ),
            null,
            null,
            null,
            null,
            changedata[gltf_Dict['id']],
            this.props.whatchanged
          );
        }
      }
      var myTexture = null;
      if (
        this.props.whatchanged == SELECTTEXTURE &&
        changedata[gltf_Dict['texture']]
      ) {
        this[gltf_Dict['texture']] = changedata[gltf_Dict['texture']].name;
        //console.log(changedata);
        if (changedata[gltf_Dict['leaf']]) {
          if (changedata[gltf_Dict['name']]) {
            //console.log(this.partsMeshes[changedata.binId-1]);
            //const mymaterial = this.partsMeshes[element.binId-1].material;
            //console.log('Coming from hre 7');
            const mymesh = this.findMyMaterial(changedata, false);
            if (mymesh) {
              const mymaterial = mymesh.material;
              //console.log("2",mymaterial);
              if (mymaterial) {
                if (this[gltf_Dict['texture']] == 'None') {
                  myTexture = null;
                } else {
                  const textureLoader = new TextureLoader();
                  myTexture = textureLoader.load(
                    resourcePathBase + this[gltf_Dict['texture']]
                  );
                  /* myTexture.wrapT = RepeatWrapping;
                                    myTexture.wrapS = RepeatWrapping;
                                    myTexture.repeat.set( 9, 1 ); */
                }
                mymaterial.map = myTexture;
                mymaterial.needsUpdate = true;
                //console.log(mymaterial);
                const uvarry = this.readUV(changedata.uv64);
                //console.log(uvarry);
                if (!mymesh['setUV']) {
                  mymesh.geometry.setAttribute(
                    'uv',
                    new Float32BufferAttribute(uvarry, 2)
                  );
                  mymesh['setUV'] = true;
                } //this.updateTexture( mymaterial, 'roughnessMap',this.roughnessMaps()  );
              }
            }
          }
        } else {
          if (this[gltf_Dict['texture']] == 'None') {
            myTexture = null;
          } else {
            const textureLoader = new TextureLoader();
            myTexture = textureLoader.load(
              resourcePathBase + this[gltf_Dict['texture']]
            );
            /* myTexture.wrapT = RepeatWrapping;
                        myTexture.wrapS = RepeatWrapping;
                        myTexture.repeat.set( 9, 1 ); */
          }
          this.updateChildsOfMine(
            null,
            myTexture,
            null,
            null,
            null,
            changedata[gltf_Dict['id']],
            this.props.whatchanged
          );
        }
      }
      if (this.props.whatchanged == SELECTMETAL) {
        this.datametal = changedata[gltf_Dict['metallicFactor']];
        if (changedata[gltf_Dict['leaf']]) {
          if (changedata[gltf_Dict['name']]) {
            //console.log(this.partsMeshes[changedata.binId-1]);
            //const mymaterial = this.partsMeshes[element.binId-1].material;
            //console.log('Coming from hre 8');
            const mymesh = this.findMyMaterial(changedata, false);
            if (mymesh) {
              const mymaterial = mymesh.material;
              if (mymaterial) {
                mymaterial[gltf_Dict['metallicFactor']] =
                  changedata[gltf_Dict['metallicFactor']];
                mymaterial.metalness = changedata[gltf_Dict['metallicFactor']];
              }
              //console.log(mymaterial);
            }
          }
        } else {
          this.updateChildsOfMine(
            null,
            null,
            changedata[gltf_Dict['metallicFactor']],
            null,
            null,
            changedata[gltf_Dict['id']],
            this.props.whatchanged
          );
        }
      }
      if (this.props.whatchanged == SELECTROUGH) {
        this.datarough = changedata[gltf_Dict['roughnessFactor']];
        if (changedata[gltf_Dict['leaf']]) {
          if (changedata[gltf_Dict['name']]) {
            //console.log(this.partsMeshes[changedata.binId-1]);
            //const mymaterial = this.partsMeshes[element.binId-1].material;
            //console.log('Coming from hre 9');
            const mymesh = this.findMyMaterial(changedata, false);
            if (mymesh) {
              const mymaterial = mymesh.material;
              if (mymaterial) {
                mymaterial[gltf_Dict['roughnessFactor']] =
                  changedata[gltf_Dict['roughnessFactor']];
                mymaterial.roughness = changedata[gltf_Dict['roughnessFactor']];
              }
              //console.log(mymaterial);
            }
          }
        } else {
          this.updateChildsOfMine(
            null,
            null,
            null,
            changedata[gltf_Dict['roughnessFactor']],
            null,
            changedata[gltf_Dict['id']],
            this.props.whatchanged
          );
        }
      }
      if (this.props.whatchanged == SELECTOPAQUE) {
        this.dataopaque = changedata[gltf_Dict['A']];
        if (changedata[gltf_Dict['leaf']]) {
          if (changedata[gltf_Dict['name']]) {
            //console.log(this.partsMeshes[changedata.binId-1]);
            //const mymaterial = this.partsMeshes[element.binId-1].material;
            //console.log('Coming from hre 10');
            const mymesh = this.findMyMaterial(changedata, false);
            if (mymesh) {
              const mymaterial = mymesh.material;
              if (mymaterial) {
                mymaterial.transparent = changedata[gltf_Dict['A']] != 1;
                mymaterial.opaque = changedata[gltf_Dict['A']];
                mymaterial.opacity = changedata[gltf_Dict['A']];
              }
            }
          }
        } else {
          this.updateChildsOfMine(
            null,
            null,
            null,
            null,
            changedata[gltf_Dict['A']],
            changedata[gltf_Dict['id']],
            this.props.whatchanged
          );
        }
      }
      if (this.props.whatchanged == SELECTANITEM) {
        //console.log("Ok Here?",changedata);
        let event = {};
        event['ctrlKey'] = this.changedctrlkey;
        if (changedata.length == 0) {
          this.changeStateOfSelection(null, event);
          /*  console.log("I am resetting!");
                    
                    if(this.props.resetSelections){
                        console.log("I have resetted");
                        this.props.resetSelections();
                    } */
        } else {
          //console.log('Reducing', event, changedata);
          changedata.reduce(
            (p, x) => p.then((_) => this.doOneSelection(x, event)),
            Promise.resolve()
          );
          /* changedata.forEach(x => {
                        this.doOneSelection(x,event);
                    }); */
          /*
                    changedata.forEach(element => {
                        const aShape = element[gltf_Dict['name']];
                        const first4chars = aShape.slice(0, 4);
                        const first6chars = aShape.slice(0, 6);
                        if( (first4chars=="FACE") || (first4chars=="EDGE") || 
                        (first4chars=="PART") || (first6chars=="VERTEX") ) {               
                        element.selectedshell=true;
                        const mymesh = this.findMyMaterial(element);                       
                        console.log("Before",mymesh);
                        if (mymesh) {
                            mymesh.selectedshell=true;
                            this.changeStateOfSelection(mymesh, event);
                            if (this.props.onClick) {
                                this.props.onClick(mymesh, SELECTDISTANCE, event);                                                                                         
                                console.log(element,mymesh);
                            } else {
                                console.log("No Click functions found",this.props.onClick,element);
                            }
                            event['ctrlKey']=true;
                        }
                        
                        }                
                    });*/
        }
        /* if(this.props.resetSelectionFromTree) {
                    this.props.resetSelectionFromTree(); // This is causing delay!!!
                }  */
        /* this.selectedshell = changedata.selectedshell;
                if (changedata[gltf_Dict["leaf"]]) {
                    if (changedata[gltf_Dict["name"]]) {
                        //console.log(this.partsMeshes[changedata.binId-1]);
                        //const mymaterial = this.partsMeshes[element.binId-1].material;
                        const mymesh = this.findMyMaterial(changedata);                       
                        console.log("Before",mymesh);
                        if (mymesh) {
                            mymesh.selectedshell = changedata.selectedshell;
                            if (changedata.selectedshell) {
                                this.setSelectionColor(mymesh);
                            } else {
                                mymesh.material.color.setHex(mymesh.currentHex);
                            }
                            const event = {ctrlKey:this.props.ctrlKey}
                            this.changeStateOfSelection(mymesh, event);
                        }
                        //console.log("After",mymesh);
                    } else {
                        console.log("Could not get name",changedata,gltf_Dict["name"],changedata[gltf_Dict["name"]])
                    }

                } else {
                    console.log("could not get leaf",changedata,gltf_Dict["leaf"],changedata[gltf_Dict["leaf"]]);
                } */
      }
      console.log('Performed all operations to rerender');
    }
  };

  changeMaterialStats(material, mySide, myOpaque, myWiremesh, myCastShadow) {
    material.wireframe = myWiremesh;
    material.castShadow = myCastShadow;
    material.depthTest = true;
    material.depthWrite =
      myOpaque == 'True'
        ? true
        : myOpaque == 'False'
        ? false
        : !material.transparent;
    material.side =
      mySide == 'Front' ? FrontSide : mySide == 'Back' ? BackSide : DoubleSide;
    //console.log(material);
  }

  resetSelection() {
    if (this.INTERSECTED) {
      if (
        this.isObjectSame(this.INTERSECTED, this.firstshell) ||
        this.isObjectSame(this.INTERSECTED, this.secondshell) ||
        this.isObjectsSame(this.INTERSECTED, this.state_selectedObjects)
      ) {
        this.setSelectionColor(this.INTERSECTED);
        //this.INTERSECTED.material.color=this.convertColor(this.props.selectcolor || DEFAULTSELECTCOLOR);
      } else {
        this.setOriginalColor(this.INTERSECTED);
        //this.INTERSECTED.material.color.setHex(this.INTERSECTED.currentHex);
      }
      this.INTERSECTED = null;
      this.setStateWithoutError({
        intersectedShell: this.INTERSECTED,
        intersectedShellName: ''
      });
      if (
        this.controls &&
        this.controls.target &&
        this.controls.target.setFromMatrixPosition &&
        this.controls.trackballToObject
      ) {
        // Move trackball to center of screen if not clicking on anything.
        this.controls.target.setFromMatrixPosition(
          this.controls.trackballToObject
        );
        var startDistance = this.controls.target.length();
        this.controls.target.set(0, 0, -startDistance);
        this.controls.target.applyQuaternion(this.defaultCamera.quaternion);
        this.controls.target.add(this.defaultCamera.position);
        this.controls.setTargetPosition(this.controls.target);
        //console.log("Reset5",this.controls.target);
      }
    }
  }

  getPrefixItem = (item) => {
    let myName = item[gltf_Dict['name']];
    const myelement = item[gltf_Dict['element']];
    let prefix = '';
    if (myelement) {
      if (myelement == 'F') {
        prefix = 'FACE';
      } else if (myelement == 'E') {
        prefix = 'EDGE';
      } else if (myelement == 'V') {
        prefix = 'VERTEX';
      } else if (myelement == 'P') {
        prefix = 'PART';
      } else if (
        myelement == 'f' ||
        myelement == 'e' ||
        myelement == 'v' ||
        myelement == ' '
      ) {
        prefix = 'ASSEMBLY';
      } else {
        prefix = 'ASSEMBLY';
      }
    } else if (myName) {
      prefix = myName.slice(0, 4);
      if (prefix != 'FACE' && prefix != 'EDGE' && prefix != 'PART') {
        prefix = myName.slice(0, 6);
        if (prefix != 'VERTEX') {
          prefix = 'ASSEMBLY';
        }
      }
    }
    return prefix;
  };

  getSubDepthPart = (item) => {
    const prefix = this.getPrefixItem(item);

    if (prefix != 'ASSEMBLY') {
      return item;
    }
    const state_gltfobj = this.this_state_gltf || this.props.gltfobj;
    const myStateTree = state_gltfobj.tree;
    const myID = item[gltf_Dict['id']];
    for (var i = 0; i < myStateTree.length; i++) {
      if (myStateTree[i][gltf_Dict['parentId']] == myID) {
        const retItem = this.getSubDepthPart(myStateTree[i]);
        if (retItem) {
          return retItem;
        }
      }
    }
    return null;
  };
  getNameWithFeatures = (item) => {
    const myDisplayName = item[gltf_Dict['display']];
    if (!myDisplayName) {
      return item[gltf_Dict['name']];
    }
    const prefix = this.getPrefixItem(item);
    return prefix + myDisplayName;
  };
  getIntersectedName = (mynode) => {
    const myName = mynode.name;
    const state_gltfobj = this.this_state_gltf || this.props.gltfobj;
    const myStateTree = state_gltfobj.tree;
    if (
      this.selectedoption != SELECTASSEMBLY ||
      this.props.splitmethod != SELECTDISECTPARTS
    ) {
      for (var i = 0; i < myStateTree.length; i++) {
        if (myStateTree[i][gltf_Dict['name']] == myName) {
          //console.log(myStateTree[i]);
          return this.getNameWithFeatures(myStateTree[i]);
        }
      }
      return myName;
    }
    const myTopAssembly = this.findTopAssembly(mynode);
    if (myTopAssembly) {
      return this.getNameWithFeatures(myTopAssembly);
    }
    // var myParentID = -1;
    // var myParentTree = null;
    // for (var i = 0; i < myStateTree.length; i++) {
    //   if (myStateTree[i][gltf_Dict['name']] == name) {
    //     myParentID = myStateTree[i][gltf_Dict['parentId']];
    //     myParentTree = myStateTree[i];
    //     break;
    //   }
    // }
    // if (myParentID == 1) {
    //   //console.log(myParentTree);
    //   return this.getNameWithFeatures(myParentTree);
    // }
    // if (myParentID != -1) {
    //   for (var i = 0; i < myStateTree.length; i++) {
    //     if (myStateTree[i][gltf_Dict['id']] == myParentID) {
    //       //console.log(myStateTree[i]);
    //       return this.getNameWithFeatures(myStateTree[i]);
    //     }
    //   }
    // }

    for (var i = 0; i < myStateTree.length; i++) {
      if (myStateTree[i][gltf_Dict['name']] == myName) {
        //console.log(myStateTree[i]);
        return this.getNameWithFeatures(myStateTree[i]);
      }
    }
    return myName;
  };

  getNameID = (name) => {
    if (
      this.selectedoption != SELECTASSEMBLY ||
      this.props.splitmethod != SELECTDISECTPARTS
    ) {
      return name;
    }
    //const myStateTree = state.gltfobj.tree || this.props.gltfobj.tree;
    const state_gltfobj = this.this_state_gltf || this.props.gltfobj;

    const myStateTree = state_gltfobj.tree;
    var myParentID = -1;
    for (var i = 0; i < myStateTree.length; i++) {
      if (myStateTree[i][gltf_Dict['name']] == name) {
        myParentID = myStateTree[i][gltf_Dict['parentId']];
        break;
      }
    }
    var myParentName = '';
    if (myParentID != -1) {
      for (var i = 0; i < myStateTree.length; i++) {
        if (myStateTree[i][gltf_Dict['id']] == myParentID) {
          myParentName = myStateTree[i][gltf_Dict['name']];
          break;
        }
      }
    }
    if (myParentName != '') {
      return myParentName;
    }
    return name;
  };

  /* arrayRemove = (arr, value) => {

        return arr.filter(function (ele) {
            return ele.name != value;
        });
    };

    arrayCopy = (arr) => {
        var copy_selectobjects = [];

        arr.forEach(element => {
            copy_selectobjects.push(element);
        });
        return copy_selectobjects;
    }; */

  selectAllSelectedSolids = async () => {
    var copy_selectobjects = [
      ...(this.state_selectedObjects ? this.state_selectedObjects : [])
    ];

    for (let index = 0; index < copy_selectobjects.length; index++) {
      const meshmaterial = copy_selectobjects[index];
      const myAllChilds = await this.findMyParentChilds(meshmaterial);
      //console.log(myAllChilds);
      myAllChilds.node.forEach((elementdata) => {
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
    }
  };
  /*
    getProgressData = async (progressFile) => {
        if(!this.this_progress_data) {
            //const progressFile = this.props.fileGDT.slice(0, this.props.fileGDT.length - 1);  
            console.log("Getting",progressFile);
            const progressRes = await getAFileFromStore(progressFile, 'progress'); 
            if(!progressRes.data || progressRes.data.begin!=progressRes.data.end) {
                console.log(progressRes.data);
                alert("Edges are still under construction. Please try after sometime");
            } else {
                this.this_progress_data = progressRes.data;
            }
        }
        return this.this_progress_data;       
    }
    */
  extrudePath = (points, depth) => {
    var geometry = new PlaneBufferGeometry(0, 0, points.length - 1, 1);
    var vertices = geometry.vertices;

    for (var i = 0, l = points.length, p; i < l; i++) {
      p = points[i];
      //console.log('point', p, 'Points', points, 'vertices', vertices);
      vertices[i].x = vertices[i + l].x = p[0];
      vertices[i].y = vertices[i + l].y = p[1];

      vertices[i].z = p[2];
      vertices[i + l].z = p[2] + depth;
    }

    geometry.computeFaceNormals();

    return geometry;
  };

  loadAllEdges = async (
    allEdges = 0,
    featureSetStart = 0,
    featureSetFinish = 3,
    mynode = null,
    gdttableEdges = null,
    firstTime = false
  ) => {
    const local_state_gltfobj = this.this_state_gltf || this.props.gltfobj;

    //this.fetchTree(gltfFILE,progressFile,myParentID);
    const filenameWithOutExtension = this.props.fileGDT
      ? this.props.fileGDT.slice(0, this.props.fileGDT.length - 1)
      : '';
    const progressFile =
      (this.props.fileUUId ? this.props.fileUUId + '/' : '') +
      filenameWithOutExtension;
    const progressGLTF = filenameWithOutExtension;
    if (!this.this_progress_data) {
      //const progressFile = this.props.fileGDT.slice(0, this.props.fileGDT.length - 1);
      console.log(
        'Getting',
        progressFile,
        this.props.fileGDT,
        this.props.fileUUId
      );

      let fetchStatus = () => getAFileFromStore(progressFile, 'progress');
      let validateStatus = (result) => {
        //console.log(result.data,result.data.percent,result.data.percent!=100);
        return !result || !result.data || result.data.begin != result.data.end;
      };
      let percentFunction = (result) =>
        result.data.end ? (100 * result.data.begin) / result.data.end : 0;
      console.log('Entering poll', progressFile);
      //this.onInitProgress("Loading Edges"+progressFile);
      try {
        if (this.props.setProgressBarLoad) {
          console.log('Setting progress bar to load', progressFile);
          this.props.setProgressBarLoad(true);
        } else {
          console.log('Setting progress bar to load', progressFile);
        }
        if (this.props.setCenterActionText) {
          console.log('Setting center text', progressFile);
          this.props.setCenterActionText('Parsing Edges');
        } else {
          console.log('Not Setting center text', progressFile);
        }
      } catch (error) {
        console.log('Error while setting bars', error);
      }

      let progressRes = await pollFunction(
        fetchStatus,
        validateStatus,
        20000,
        this.props.setPercentage,
        percentFunction,
        this.props.setCurrentProgressText,
        this.props.setCompletionProgressText
      );
      try {
        if (this.props.setProgressBarLoad) {
          this.props.setProgressBarLoad(false);
        }
      } catch (error) {
        console.log('Error while updating progress bar', error);
      }

      if (
        progressRes &&
        progressRes.data &&
        progressRes.data.begin == progressRes.data.end
      ) {
        this.this_progress_data = progressRes.data;
        //this.onCloseProgress("Loading Edges"+progressFile,"success","Loaded succesfully");
      } else {
        //this.onCloseProgress("Loading Edges"+progressFile,"error","not loaded properly");
      }
    }
    const data = this.this_progress_data;
    if (!data || data.begin != data.end) {
      //console.log(data);
      alert('Edges are still under construction. Please try after sometime');
    } else {
      //console.log("Edges are loaded",data);
      this.this_progress_data = data;
    }
    if (data) {
      let myResourcePath = local_state_gltfobj.resourcepath
        ? local_state_gltfobj.resourcepath
        : resourcePathURL;
      const loader = new GLTFLoader()
        .setPath(
          this.props.fileUUId
            ? (myResourcePath || '') + this.props.fileUUId + '/'
            : myResourcePath || ''
        )
        .setCrossOrigin('anonymous');
      try {
        if (this.props.setCenterActionText) {
          this.props.setCenterActionText('Generating Edges' + progressFile);
        }
      } catch (error) {
        console.log('Error while setting center text', error);
      }

      const updateSelectionFromGdtTable = () => {
        if (
          gdttableEdges &&
          gdttableEdges.selectedObjects &&
          Array.isArray(gdttableEdges.selectedObjects)
        ) {
          //console.log("Inside load edges gdts",this.partsMeshes,gdttableEdges);
          let event = {};
          event['ctrlKey'] = false;
          gdttableEdges.selectedObjects.forEach((element) => {
            console.log('Setting inside the load all edges', element, event);
            element.selectedshell = true;
            this.doOneSelection(element, event, false);
            //console.log(this.scene, this.partsMeshes, this.raycastObjects);
            //this.render();
          });
          if (gdttableEdges.selectedObjects.length == 0) {
            this.changeStateOfSelection(null, event, false);
          }
        } else {
          //console.log("Inside load edges s",this.partsMeshes);
        }
      };
      const onload = (gltf, url) => {
        try {
          const myobject = gltf.scene || gltf.scenes[0];
          myobject.position.x += this.shiftposition.x;
          myobject.position.y += this.shiftposition.y;
          myobject.position.z += this.shiftposition.z;
          myobject.renderOrder += 1;
          this.scene.add(myobject);
          this.content.push(myobject);
          //console.log('MyObject', myobject);
          let partsMeshes = myobject.children;

          if (partsMeshes[0].children.length > 0) {
            partsMeshes = partsMeshes[0].children;
          }

          if (partsMeshes[0].children.length > 0) {
            partsMeshes = partsMeshes[0].children;
          }
          //console.log(partsMeshes);
          /*  partsMeshes.forEach(element => {
                        if(!element.renderOrder) {
                            console.log("Chaning Renderingorder from",element.renderOrder,1,element.name);
                            element.renderOrder=1;
                        }                           
                    }); */
          //console.log(this.partsMeshes);
          this.partsMeshes = [...this.partsMeshes, ...partsMeshes];
          //console.log('PartsMeshes', partsMeshes, this.this_state_gltf.tree);
          //console.log(this.rayCastObjectFilters(partsMeshes, true));
          this.raycastObjects = [
            ...this.raycastObjects,
            ...this.rayCastObjectFilters(partsMeshes)
          ];
          /*  if (gdttableEdges) {
            //console.log("Inside load edges gdts",this.partsMeshes,gdttableEdges);
            let event = {};
            event['ctrlKey'] = false;
            gdttableEdges.selectedObjects.forEach((element) => {
              //console.log("Setting inside the load all edges",element,event);
              element.selectedshell = true;
              this.doOneSelection(element, event, false);
            });
            if (gdttableEdges.edges.length == 0) {
              this.changeStateOfSelection(null, event, false);
            }
          } else {
            //console.log("Inside load edges s",this.partsMeshes);
          } */
          updateSelectionFromGdtTable();
          this.onCloseProgress(url, 'success', 'loaded successfully');
        } catch (error) {
          console.log('Got error while loading', error);
          this.onCloseProgress(url, 'error', error);
        }
      };

      const onError = (exception, url) => {
        console.log('Exception from Loader', exception);

        this.onCloseProgress(url, 'error', exception);
      };

      const onProgress = (progress) => {
        //console.log(progress);
      };

      let myParentID = allEdges;
      let myParentDic = {};
      let addTree = true;
      //console.log("Data got in the progress file",myParentID,data);
      if (data.files) {
        alert(
          'Please reload and regenerate because structure is changed to minimize parent nodes of parts'
        );
        return;
      }
      myParentDic[myParentID.toString()] = data.children
        ? data.children[myParentID]
        : data.files
        ? data.files[myParentID]
        : 1;
      if (allEdges == 0 && data.children) {
        myParentDic = data.children;
      }
      if (allEdges == 0 && data.files) {
        myParentDic = data.files;
      }
      //console.log("ParentDict",myParentDic);
      let parentLineNodes = null;
      for (let [myParentID, howManyFilesJson] of Object.entries(myParentDic)) {
        //myParentID = allEdges;
        //let howManyFiles = data.files?data.files[myParentID]:1;
        //console.log("Getting Files of", myParentID, "Items", howManyFilesJson);
        const featureSet = ['f', 'e', 'v'];
        for (
          let indexFiles = featureSetStart;
          indexFiles < featureSetFinish;
          indexFiles++
        ) {
          let element = featureSet[indexFiles];
          let howManyFiles = 0;
          const myType = typeof howManyFilesJson;
          if (myType === 'number' || myType === 'string') {
            howManyFiles = howManyFilesJson;
            element = '';
            featureSetFinish = featureSetStart + 1;
          } else {
            if (howManyFilesJson) {
              howManyFiles = howManyFilesJson[element];
            } else {
              howManyFiles = 0;
            }
            if (element == 'f' && mynode) {
              mynode.facesLoaded = true;
            } else if (element == 'e' && mynode) {
              mynode.edgesLoaded = true;
            } else if (element == 'v' && mynode) {
              mynode.verticesLoaded = true;
            }
            element = '-' + element;
          }

          /* if(howManyFiles==0) {
                        howManyFiles=1;
                    } */
          let fileStore =
            progressFile + '-' + myParentID.toString() + element + '3';
          let gltfStore =
            progressGLTF + '-' + myParentID.toString() + element + '3';
          //console.log("For Loop",fileStore,howManyFiles);
          if (howManyFiles > 0 && indexFiles > 0) {
            parentLineNodes = new Group(); //new Object3D();
            parentLineNodes.linetype = indexFiles;
          }
          for (let index = 0; index < howManyFiles; index++) {
            if (index > 0) {
              if (indexFiles == 0) {
                //await waitFunction(1000);
              }
              fileStore =
                progressFile +
                '-' +
                myParentID.toString() +
                element +
                index.toString() +
                '3';
              gltfStore =
                progressGLTF +
                '-' +
                myParentID.toString() +
                element +
                index.toString() +
                '3';
            }
            //console.log("Inside Loop",fileStore,index,howManyFiles);
            myResourcePath = await checkExistingPathFromStore(
              fileStore,
              'tree',
              false,
              myResourcePath
            );

            let treeRes = await getAFileFromURLStore(
              fileStore,
              'tree',
              myResourcePath
            );
            if (
              treeRes &&
              treeRes.data &&
              !isEmptyObjectDictionary(treeRes.data)
            ) {
              const state_gltfobj = this.this_state_gltf || this.props.gltfobj;
              //console.log("Inside upload edges",state_gltfobj,this.this_state_gltf,this.props.gltfobj)
              var myStateTree = state_gltfobj.tree;
              if (firstTime && addTree) {
                console.log(myStateTree, state_gltfobj);
                myStateTree.length = state_gltfobj.treeLength;
                addTree = false;
              }
              myStateTree = [...myStateTree, ...treeRes.data];
              //var gltfobj = { ...state.gltfobj } || { ...this.props.gltfobj }
              var gltfobj = { ...state_gltfobj };
              gltfobj.tree = myStateTree;
              //this.changeState = true;
              //this.setState({gltfobj:gltfobj});
              this.this_state_gltf = gltfobj;
              // console.log(
              //   'About to set upload edges',
              //   state_gltfobj,
              //   this.this_state_gltf,
              //   this.props.gltfobj,
              //   gltfobj
              // );
              try {
                if (this.props.setStateOfgltf) {
                  this.props.setStateOfgltf(gltfobj);
                }
              } catch (error) {
                console.log('Error while setting gltf obj', error);
              }

              if (indexFiles >= 1) {
                this.onInitProgress(fileStore + '.tree');
                treeRes.data.forEach((element) => {
                  let points = [];
                  if (element[gltf_Dict['points']]) {
                    const myBase64Points = this.getFloatArray(
                      element[gltf_Dict['points']]
                    );
                    //console.log('From curve', myBase64Points);
                    if (myBase64Points) {
                      for (
                        let points_index = 0;
                        points_index < myBase64Points.length;
                        points_index += 3
                      ) {
                        let thisPoint = new Vector3(
                          myBase64Points[points_index] * 0.001,
                          myBase64Points[points_index + 2] * 0.001,
                          myBase64Points[points_index + 1] * -0.001
                        );
                        points.push(thisPoint);
                      }
                    } else {
                      const myPoints = element[gltf_Dict['points']];
                      if (myPoints) {
                        myPoints.forEach((mypoint) => {
                          const thisPoint = new Vector3(
                            mypoint[0] * 0.001,
                            mypoint[2] * 0.001,
                            mypoint[1] * -0.001
                          );
                          points.push(thisPoint);
                          //xyzpoints.push(thisPoint.x,thisPoint.y,thisPoint.z);
                        });
                      }
                    }
                  } else if (element[gltf_Dict['entity']]) {
                    const thisentity = element[gltf_Dict['entity']];
                    //console.log('Entitites', thisentity);

                    const curveCode = thisentity[gltf_Dict['code']];
                    if (
                      curveCode == 'C' ||
                      curveCode == 'E' ||
                      curveCode == 'H' ||
                      curveCode == 'P'
                    ) {
                      const myBase64Floats = this.getFloatArray(
                        thisentity[gltf_Dict['basic']]
                      );
                      const XDir = [
                        myBase64Floats[0],
                        myBase64Floats[1],
                        myBase64Floats[2]
                      ];
                      const YDir = [
                        myBase64Floats[3],
                        myBase64Floats[4],
                        myBase64Floats[5]
                      ];
                      const Center = [
                        myBase64Floats[6],
                        myBase64Floats[7],
                        myBase64Floats[8]
                      ];
                      let firstU = myBase64Floats[9];
                      let lastU = myBase64Floats[10];
                      const major = myBase64Floats[11];

                      const minor =
                        curveCode == 'C' || curveCode == 'P'
                          ? major
                          : myBase64Floats[12];

                      //   console.log(
                      //     'Parameters',
                      //     XDir,
                      //     YDir,
                      //     Center,
                      //     major,
                      //     minor,
                      //     firstU,
                      //     lastU
                      //   );
                      if (lastU < firstU) {
                        const temp = lastU;
                        lastU = firstU;
                        firstU = temp;
                      }
                      let step =
                        (lastU - firstU + 1) / (major ? 20 * major : 20);
                      for (
                        let tindex = firstU;
                        tindex <= lastU;
                        tindex += step
                      ) {
                        let A1 =
                          curveCode == 'P'
                            ? 0
                            : major *
                              (curveCode == 'H'
                                ? Math.cosh(tindex)
                                : Math.cos(tindex));
                        let A2 =
                          curveCode == 'P'
                            ? 0
                            : minor *
                              (curveCode == 'H'
                                ? Math.sinh(tindex)
                                : Math.sin(tindex));
                        if (curveCode == 'P') {
                          const focal = major;
                          if (focal == 0) {
                            A1 = tindex;
                            A2 = 0;
                          } else {
                            A1 = (tindex * tindex) / (4.0 * focal);
                            A2 = tindex;
                          }
                        }

                        let thisPoint = new Vector3(
                          (A1 * XDir[0] + A2 * YDir[0] + Center[0]) * 0.001,
                          (A1 * XDir[2] + A2 * YDir[2] + Center[2]) * 0.001,
                          (A1 * XDir[1] + A2 * YDir[1] + Center[1]) * -0.001
                        );
                        points.push(thisPoint);
                      }
                    } else {
                      if (curveCode == 'B' || curveCode == 'I') {
                        const myBase64Floats = this.getFloatArray(
                          thisentity[gltf_Dict['basic']]
                        );
                        if (myBase64Floats && myBase64Floats.length) {
                          const myBase64Length = myBase64Floats.length;
                          //   console.log(
                          //     'My Floats',
                          //     myBase64Length,
                          //     myBase64Floats
                          //   );
                          let buffer_index = 0;
                          let floater = myBase64Floats[buffer_index];
                          let degree = 1;
                          let rational = 0;
                          let periodic = 0;
                          let len_knot = 0;
                          let len_pole = 0;
                          let poles = [];

                          let start_index = 0;
                          let end_index = 0;

                          if (floater > 255) {
                            len_pole = Math.trunc(floater / (256.0 * 256.0));
                            len_knot = Math.trunc(
                              (floater - len_pole * 256.0 * 256.0) / 256.0
                            );
                            degree = Math.trunc(
                              (floater -
                                len_pole * 256.0 * 256.0 -
                                len_knot * 256.0) /
                                4.0
                            );
                            rational = Math.trunc(
                              (floater -
                                len_pole * 256.0 * 256.0 -
                                len_knot * 256.0 -
                                degree * 4.0) /
                                2.0
                            );
                            periodic = Math.round(
                              floater -
                                len_pole * 256.0 * 256.0 -
                                len_knot * 256.0 -
                                degree * 4.0 -
                                rational * 2.0
                            );
                            buffer_index += 1;
                            if (curveCode == 'I') {
                              start_index = Math.round(
                                myBase64Floats[buffer_index]
                              );
                              buffer_index += 1;
                              end_index = Math.round(
                                myBase64Floats[buffer_index]
                              );
                              buffer_index += 1;
                            }
                          } else {
                            degree = Math.trunc(floater / 4.0);
                            rational = Math.trunc(
                              (floater - degree * 4.0) / 2.0
                            );
                            periodic = Math.round(
                              floater - degree * 4.0 - rational * 2.0
                            );
                            buffer_index += 1;

                            len_pole = Math.round(myBase64Floats[buffer_index]);
                            buffer_index += 1;

                            if (curveCode == 'I') {
                              len_knot = Math.round(
                                myBase64Floats[buffer_index]
                              );
                              buffer_index += 1;
                              start_index = Math.round(
                                myBase64Floats[buffer_index]
                              );
                              buffer_index += 1;
                              end_index = Math.round(
                                myBase64Floats[buffer_index]
                              );
                              buffer_index += 1;
                            }
                          }

                          /* console.log(
                            'Floater',
                            floater,
                            len_pole,
                            len_knot,
                            len_knot + len_pole * 256.0 * 256.0
                          ); */
                          for (
                            let pole_index = 0;
                            pole_index < len_pole &&
                            buffer_index < myBase64Length;
                            pole_index++
                          ) {
                            const thispole = new Vector3(
                              myBase64Floats[buffer_index] * 0.001,
                              myBase64Floats[buffer_index + 2] * 0.001,
                              myBase64Floats[buffer_index + 1] * -0.001
                            );
                            buffer_index += 3;
                            poles.push(thispole);
                          }
                          let weights = [];
                          for (
                            let pole_index = 0;
                            pole_index < len_pole &&
                            buffer_index < myBase64Length;
                            pole_index++
                          ) {
                            weights.push(myBase64Floats[buffer_index]);
                            buffer_index += 1;
                          }
                          let knots = [];
                          let multiplicities = [];
                          if (curveCode == 'I') {
                            for (
                              let knot_index = 0;
                              knot_index < len_knot &&
                              buffer_index < myBase64Length;
                              knot_index++
                            ) {
                              knots.push(myBase64Floats[buffer_index]);
                              buffer_index += 1;
                            }
                            let multiples =
                              myBase64Floats.length - buffer_index + 1;
                            for (
                              let multiples_index = 0;
                              multiples_index < multiples &&
                              buffer_index < myBase64Length;
                              multiples_index++
                            ) {
                              multiplicities.push(myBase64Floats[buffer_index]);
                              buffer_index += 1;
                            }
                          }
                          // console.log(
                          //   'What we got',
                          //   len_pole,
                          //   len_knot,
                          //   degree,
                          //   periodic,
                          //   rational,
                          //   poles,
                          //   weights,
                          //   knots,
                          //   multiplicities,
                          //   start_index,
                          //   end_index
                          // );
                          let knotswithmultiples = [];
                          let lastKnot = 0;
                          if (curveCode == 'I') {
                            for (
                              var knot_index = 0;
                              knot_index < knots.length;
                              knot_index++
                            ) {
                              for (
                                var multi_index = 0;
                                multi_index <
                                Math.round(multiplicities[knot_index]);
                                multi_index++
                              ) {
                                lastKnot = knots[knot_index];
                                knotswithmultiples.push(lastKnot);
                              }
                            }
                            // if (end_index >= knotswithmultiples.length) {
                            //   const toPush =
                            //     end_index - knotswithmultiples.length + 1;
                            //   for (
                            //     var multi_index = 0;
                            //     multi_index < toPush;
                            //     multi_index++
                            //   ) {
                            //     knotswithmultiples.push(lastKnot);
                            //   }
                            // }
                          } else {
                            knotswithmultiples = [0, 1];
                          }
                          /*  console.log(
                            'Multiple Knots',
                            knotswithmultiples,
                            multiplicities,
                            start_index,
                            end_index,
                            periodic,
                            rational,
                            len_knot,
                            len_pole
                          ); */
                          let nurbsCurve = null;
                          if (curveCode == 'I') {
                            if (start_index < 0) {
                              start_index = 0;
                            }
                            if (end_index >= knotswithmultiples.length) {
                              end_index = knotswithmultiples.length - 1;
                            }
                            nurbsCurve = new NURBSCurve(
                              degree,
                              knotswithmultiples,
                              poles,
                              weights,
                              start_index,
                              end_index
                            );
                          } else {
                            nurbsCurve = new NURBSCurve(
                              degree,
                              knotswithmultiples,
                              poles,
                              weights
                            );
                          }

                          points = nurbsCurve.getPoints(200);
                        } else {
                          console.log('No Length found', myBase64Floats);
                        }
                      }
                    }
                  }
                  /*  */

                  //let extrudepoints=[];
                  //let xyzpoints=[];

                  /*
                    let positions = [];
                    let colors = [];
                    const spline = new CatmullRomCurve3(points);
                    const divisions = Math.round(12 * points.length);
                    console.log('So many division', divisions);
                    let point = new Vector3();
                    const color = new Color(
                      this.props.edgecolor
                        ? this.props.edgecolor
                        : DEFAULTEDGECOLOR
                    );

                    for (let i = 0, l = divisions; i < l; i++) {
                      const t = i / l;

                      spline.getPoint(t, point);
                      positions.push(point.x, point.y, point.z);
                      colors.push(color.r, color.g, color.b);
                    }
                    */
                  let geometry = new BufferGeometry({
                    name: elementCopy(element[gltf_Dict['name']])
                  });
                  geometry.name = elementCopy(element[gltf_Dict['name']]);
                  //geometry.setPositions(myBase64Points);
                  geometry.setFromPoints(points);

                  /*const geometry = new LineGeometry();
                    geometry.setPositions(positions);
                    geometry.setColors(colors);*/
                  //let geometry = this.extrudePath(extrudepoints,0.1);

                  //geometry.setAttribute( 'position', new Float32BufferAttribute( xyzpoints, 3 ) );

                  //let geometry = new BufferGeometry({name:element[gltf_Dict["name"]]}).setFromPoints( points );
                  //geometry.name=element[gltf_Dict["name"]];
                  if (indexFiles == 1) {
                    /*
                    let material = new LineBasicMaterial({
                      color: this.props.edgecolor
                        ? this.props.edgecolor
                        : DEFAULTEDGECOLOR,
                      name: element[gltf_Dict['name']],
                      linewidth: 5
                    });

                    let line = new Line(geometry, material);

                    line.name = element[gltf_Dict['name']];
                    line.renderOrder += 20;
                    parentLineNodes.add(line);
                    */
                    /*material = new PointsMaterial({ 
                                                color: 0xff00ff,//this.props.edgecolor?this.props.edgecolor:DEFAULTEDGECOLOR,
                                                name:element[gltf_Dict["name"]],
                                                size:5});
                      let point = new Points(geometry, material);                                           
                      point.name=element[gltf_Dict["name"]];                                           
                      parentLineNodes.add(point);  
                    */
                    let sketchLineGeometry = new MeshLineGeometry();
                    sketchLineGeometry.setGeometry(geometry);
                    let sketchMatrial = new MeshLineMaterial({
                      color: this.props.edgecolor
                        ? this.props.edgecolor
                        : DEFAULTEDGECOLOR,
                      resolution: new Vector2(400, 400),
                      sizeAttenuation: 0,
                      lineWidth: this.state.edgelinewidth,
                      side: DoubleSide
                    });
                    //Note: resolution is *required*!
                    let ourMesh = new MeshLine(
                      sketchLineGeometry,
                      sketchMatrial
                    );
                    ourMesh.name = elementCopy(element[gltf_Dict['name']]);
                    ourMesh.renderOrder += 20;
                    parentLineNodes.add(ourMesh);
                  } else {
                    let material = new PointsMaterial({
                      color: this.props.edgecolor
                        ? this.props.edgecolor
                        : DEFAULTEDGECOLOR,
                      name: elementCopy(element[gltf_Dict['name']]),
                      size: 10
                    });
                    let point = new Points(geometry, material);
                    point.name = elementCopy(element[gltf_Dict['name']]);
                    parentLineNodes.add(point);
                  }
                });
                this.onCloseProgress(
                  fileStore + '.tree',
                  'success',
                  'loaded successfully'
                );
              } else {
                this.onInitProgress(gltfStore + '.gltf');
                //console.log('Loading inside edges', gltfStore + '.gltf');
                myResourcePath = await checkExistingPathFromStore(
                  fileStore,
                  'gltf',
                  false,
                  myResourcePath
                );
                loader
                  .setPath(
                    this.props.fileUUId
                      ? (myResourcePath || '') + this.props.fileUUId + '/'
                      : myResourcePath || ''
                  )
                  .setCrossOrigin('anonymous');
                loader.load(
                  gltfStore + '.gltf',
                  onload,
                  onProgress,
                  onError,
                  1
                );
              }
            }
          }
          if (howManyFiles > 0 && indexFiles > 0) {
            //console.log(parentLineNodes);
            if (parentLineNodes.children.length > 0) {
              parentLineNodes.position.x += this.shiftposition.x;
              parentLineNodes.position.y += this.shiftposition.y;
              parentLineNodes.position.z += this.shiftposition.z;
              parentLineNodes.renderOrder += 20;
              //parentLineNodes.onBeforeRender = function( renderer ) { renderer.clearDepth(); };
              this.scene.add(parentLineNodes);
              this.content.push(parentLineNodes);
              //console.log('Before adding edges', this.partsMeshes);
              this.partsMeshes = [
                ...this.partsMeshes,
                ...parentLineNodes.children
              ];
              //console.log('After adding edges', this.partsMeshes);
              this.raycastObjects = [
                ...this.raycastObjects,
                ...this.rayCastObjectFilters(parentLineNodes.children)
              ];
              updateSelectionFromGdtTable();
            }
          }
        }
      }
    }
  };

  loadAllEdgesOld = (
    allEdges,
    featureSetStart = 0,
    featureSetFinish = 3,
    mynode = null,
    gdttableEdges = null
  ) => {
    const loader = new GLTFLoader()
      .setPath(
        this.props.fileUUId
          ? (resourcePathURL || '') + this.props.fileUUId + '/'
          : resourcePathURL || ''
      )
      .setCrossOrigin('anonymous');

    //console.log('befor load,', allEdges, featureSetStart, featureSetFinish);
    const onload = (gltf, url) => {
      try {
        const myobject = gltf.scene || gltf.scenes[0];
        myobject.position.x += this.shiftposition.x;
        myobject.position.y += this.shiftposition.y;
        myobject.position.z += this.shiftposition.z;
        this.scene.add(myobject);
        this.content.push(myobject);
        //console.log("MyObject",myobject);
        let partsMeshes = myobject.children;

        if (partsMeshes[0].children.length > 0) {
          partsMeshes = partsMeshes[0].children;
        }

        if (partsMeshes[0].children.length > 0) {
          partsMeshes = partsMeshes[0].children;
        }
        //console.log(partsMeshes);
        /*  partsMeshes.forEach(element => {
                    if(!element.renderOrder) {
                        console.log("Chaning Renderingorder from",element.renderOrder,1,element.name);
                        element.renderOrder=1;
                    }                           
                }); */
        //console.log(this.partsMeshes);
        this.partsMeshes = [...this.partsMeshes, ...partsMeshes];
        if (gdttableEdges) {
          //console.log("Inside load edges gdts",this.partsMeshes,gdttableEdges);
          let event = {};
          event['ctrlKey'] = false;
          gdttableEdges.selectedObjects.forEach((element) => {
            //console.log("Setting inside the load all edges",element,event);
            element.selectedshell = true;
            this.doOneSelection(element, event, false);
          });
          if (gdttableEdges.edges.length == 0) {
            this.changeStateOfSelection(null, event, false);
          }
        } else {
          //console.log("Inside load edges s",this.partsMeshes);
        }

        this.onCloseProgress(url, 'success', 'loaded successfully');
      } catch (error) {
        console.log('Got error while loading', error);
        this.onCloseProgress(url, 'error', error);
      }
    };

    const onError = (exception, url) => {
      console.log('Exception from Loader', exception);

      this.onCloseProgress(url, 'error', exception);
    };

    const onProgress = (progress) => {
      //console.log(progress);
    };
    //this.fetchTree(gltfFILE,progressFile,myParentID);
    const progressFile =
      (this.props.fileUUId ? this.props.fileUUId + '/' : '') +
      this.props.fileGDT.slice(0, this.props.fileGDT.length - 1);
    const progressGLTF = this.props.fileGDT.slice(
      0,
      this.props.fileGDT.length - 1
    );
    if (!this.this_progress_data) {
      //const progressFile = this.props.fileGDT.slice(0, this.props.fileGDT.length - 1);
      //console.log("Getting",progressFile);
      getAFileFromStore(progressFile, 'progress')
        .then((res) => res.data)
        .then((data) => {
          if (!data || data.begin != data.end) {
            //console.log(data);
            alert(
              'Edges are still under construction. Please try after sometime'
            );
          } else {
            //console.log("Edges are loaded",data);
            this.this_progress_data = data;
          }
          if (data) {
            let myParentID = allEdges;
            let myParentDic = {};
            //console.log("Data got in the progress file",myParentID,data);
            if (data.files) {
              alert(
                'Please reload and regenerate because structure is changed to minimize parent nodes of parts'
              );
              return;
            }
            myParentDic[myParentID.toString()] = data.children
              ? data.children[myParentID]
              : data.files
              ? data.files[myParentID]
              : 1;
            if (allEdges == 0 && data.children) {
              myParentDic = data.children;
            }
            if (allEdges == 0 && data.files) {
              myParentDic = data.files;
            }
            //console.log("ParentDict",myParentDic);
            for (let [myParentID, howManyFilesJson] of Object.entries(
              myParentDic
            )) {
              //myParentID = allEdges;
              //let howManyFiles = data.files?data.files[myParentID]:1;
              //console.log("Getting Files of", myParentID, "Items", howManyFilesJson);
              const featureSet = ['f', 'e', 'v'];
              for (
                let indexFiles = featureSetStart;
                indexFiles < featureSetFinish;
                indexFiles++
              ) {
                let element = featureSet[indexFiles];
                let howManyFiles = 0;
                const myType = typeof howManyFilesJson;
                if (myType === 'number' || myType === 'string') {
                  howManyFiles = howManyFilesJson;
                  element = '';
                  featureSetFinish = featureSetStart + 1;
                } else {
                  if (howManyFilesJson) {
                    howManyFiles = howManyFilesJson[element];
                  } else {
                    howManyFiles = 0;
                  }
                  if (element == 'f' && mynode) {
                    mynode.facesLoaded = true;
                  } else if (element == 'e' && mynode) {
                    mynode.edgesLoaded = true;
                  } else if (element == 'v' && mynode) {
                    mynode.verticesLoaded = true;
                  }
                  element = '-' + element;
                }

                /* if(howManyFiles==0) {
                                howManyFiles=1;
                            } */
                let fileStore =
                  progressFile + '-' + myParentID.toString() + element + '3';
                let gltfStore =
                  progressGLTF + '-' + myParentID.toString() + element + '3';
                //console.log("For Loop",fileStore,howManyFiles);
                for (let index = 0; index < howManyFiles; index++) {
                  if (index > 0) {
                    fileStore =
                      progressFile +
                      '-' +
                      myParentID.toString() +
                      element +
                      index.toString() +
                      '3';
                    gltfStore =
                      progressGLTF +
                      '-' +
                      myParentID.toString() +
                      element +
                      index.toString() +
                      '3';
                  }
                  //console.log("Inside Loop",fileStore,index,howManyFiles);
                  getAFileFromStore(fileStore, 'tree')
                    .then((res) => res.data)
                    .then((data) => {
                      //console.log(data);
                      //console.log(this.props.gltfobj.tree);
                      //var myStateTree = state.gltfobj.tree || this.props.gltfobj.tree;
                      const state_gltfobj =
                        this.this_state_gltf || this.props.gltfobj;
                      //console.log("Inside upload edges",state_gltfobj,this.this_state_gltf,this.props.gltfobj)
                      var myStateTree = state_gltfobj.tree;
                      myStateTree = [...myStateTree, ...data];
                      //var gltfobj = { ...state.gltfobj } || { ...this.props.gltfobj }
                      var gltfobj = { ...state_gltfobj };
                      gltfobj.tree = myStateTree;
                      //this.changeState = true;
                      //this.setState({gltfobj:gltfobj});
                      this.this_state_gltf = gltfobj;
                      //console.log("About to set upload edges",state_gltfobj,this.this_state_gltf,this.props.gltfobj,gltfobj)

                      if (this.props.setStateOfgltf) {
                        this.props.setStateOfgltf(gltfobj);
                      }
                      //this.props.gltfobj.tree = [...this.props.gltfobj.tree,...data];
                      //console.log("After setting upload edges",state_gltfobj,this.this_state_gltf,this.props.gltfobj,gltfobj,"GDT TABLES",gdttableEdges)
                      /* if(gdttableEdges) {
                                            let event={};
                                            event['ctrlKey']=false;
                                            gdttableEdges.selectedObjects.forEach(element => {
                                                console.log("Setting inside the load all edges",element,event);
                                                this.doOneSelection(element,event,false);
                                            });
                                            if(gdttableEdges.edges.length==0){
                                                this.changeStateOfSelection(null, event,false);
                                            }
                                        } */
                    })
                    .catch((err) => {
                      console.log('Error While Loading Tree', err);
                    });
                  this.onInitProgress(gltfStore + '.gltf');
                  loader.load(
                    gltfStore + '.gltf',
                    onload,
                    onProgress,
                    onError,
                    1
                  );
                }
              }
            }
          }
        });
    } else {
      console.log('Already data is got', this.this_progress_data);
      const data = this.this_progress_data;
      if (data) {
        let myParentID = allEdges;
        let myParentDic = {};
        //console.log(myParentID,data);
        if (data.files) {
          alert(
            'Please reload and regenerate because structure is changed to minimize parent nodes of parts'
          );
          return;
        }
        myParentDic[myParentID.toString()] = data.children
          ? data.children[myParentID]
          : data.files
          ? data.files[myParentID]
          : 1;
        if (allEdges == 0 && data.children) {
          myParentDic = data.children;
        }
        if (allEdges == 0 && data.files) {
          myParentDic = data.files;
        }
        //console.log("ParentDict",myParentDic);
        for (let [myParentID, howManyFilesJson] of Object.entries(
          myParentDic
        )) {
          //myParentID = allEdges;
          //let howManyFiles = data.files?data.files[myParentID]:1;
          //console.log("Getting Files of", myParentID, "Items", howManyFilesJson);
          const featureSet = ['f', 'e', 'v'];
          for (
            let indexFiles = featureSetStart;
            indexFiles < featureSetFinish;
            indexFiles++
          ) {
            let element = featureSet[indexFiles];
            let howManyFiles = 0;
            const myType = typeof howManyFilesJson;
            if (myType === 'number' || myType === 'string') {
              howManyFiles = howManyFilesJson;
              element = '';
              featureSetFinish = featureSetStart + 1;
            } else {
              if (howManyFilesJson) {
                howManyFiles = howManyFilesJson[element];
              } else {
                howManyFiles = 0;
              }
              if (element == 'f' && mynode) {
                mynode.facesLoaded = true;
              } else if (element == 'e' && mynode) {
                mynode.edgesLoaded = true;
              } else if (element == 'v' && mynode) {
                mynode.verticesLoaded = true;
              }
              element = '-' + element;
            }

            /* if(howManyFiles==0) {
                            howManyFiles=1;
                        } */
            let fileStore =
              progressFile + '-' + myParentID.toString() + element + '3';
            let gltfStore =
              progressGLTF + '-' + myParentID.toString() + element + '3';
            //console.log("For Loop",fileStore,howManyFiles);
            for (let index = 0; index < howManyFiles; index++) {
              if (index > 0) {
                fileStore =
                  progressFile +
                  '-' +
                  myParentID.toString() +
                  element +
                  index.toString() +
                  '3';
                gltfStore =
                  progressGLTF +
                  '-' +
                  myParentID.toString() +
                  element +
                  index.toString() +
                  '3';
              }
              //console.log("Inside Loop",fileStore,index,howManyFiles);
              getAFileFromStore(fileStore, 'tree')
                .then((res) => res.data)
                .then((data) => {
                  //console.log(data);
                  //console.log(this.props.gltfobj.tree);
                  //var myStateTree = state.gltfobj.tree || this.props.gltfobj.tree;
                  const state_gltfobj =
                    this.this_state_gltf || this.props.gltfobj;
                  //console.log("Inside upload edges",state_gltfobj,this.this_state_gltf,this.props.gltfobj)
                  var myStateTree = state_gltfobj.tree;
                  myStateTree = [...myStateTree, ...data];
                  //var gltfobj = { ...state.gltfobj } || { ...this.props.gltfobj }
                  var gltfobj = { ...state_gltfobj };
                  gltfobj.tree = myStateTree;
                  //this.changeState = true;
                  //this.setState({gltfobj:gltfobj});
                  this.this_state_gltf = gltfobj;
                  //console.log("About to set upload edges",state_gltfobj,this.this_state_gltf,this.props.gltfobj,gltfobj)

                  if (this.props.setStateOfgltf) {
                    this.props.setStateOfgltf(gltfobj);
                  }
                  //this.props.gltfobj.tree = [...this.props.gltfobj.tree,...data];
                  //console.log("After setting upload edges",state_gltfobj,this.this_state_gltf,this.props.gltfobj,gltfobj)
                  /*  if(gdttableEdges) {
                                        let event={};
                                        event['ctrlKey']=false;
                                        gdttableEdges.selectedObjects.forEach(element => {
                                            console.log("Setting inside the load all edges",element,event);
                                            this.doOneSelection(element,event,false);
                                        });
                                        if(gdttableEdges.edges.length==0){
                                            this.changeStateOfSelection(null, event,false);
                                        }
                                    } */
                })
                .catch((err) => {
                  console.log('Error While Loading Tree', err);
                });
              this.onInitProgress(gltfStore + '.gltf');
              loader.load(gltfStore + '.gltf', onload, onProgress, onError, 1);
            }
          }
        }
      }
    }
    //const data = this.getProgressData(progressFile);

    /* const progressFile = this.props.fileGDT.slice(0, this.props.fileGDT.length - 1);  
        console.log("Getting",progressFile);                 
        getAFileFromStore(progressFile,"progress")
        .then(res => res.data)
        .then((data) => {
            if(!data || data.begin!=data.end) {
                console.log(data);
                alert("Edges are still under construction. Please try after sometime");
            } else {
                
            }
            //loader.dispose();
        })
        .catch(err => {           
            console.log("Error While Loading Progress", err);
        });  */
  };

  getOptionValueFromString = (value) => {
    if (value == 'Assemblies') return SELECTASSEMBLY;
    if (value == 'Parts') return SELECTSOLID;
    if (value == 'Edges') return SELECTEDGE;
    if (value == 'Specify Assembly Mates and GD&T') return SELECTFEATURE;
    if (value == 'Faces') return SELECTFACE;
    if (value == 'Corners') return SELECTCORNER;
    if (value == 'Circular') return SELECTCIRCULAR;
    if (value == 'Linear') return SELECTLINEAR;
    return SELECTFEATURE;
  };
  getValueOptionFromString = (value) => {
    if (value == SELECTASSEMBLY) return 'Assemblies';
    if (value == SELECTSOLID) return 'Parts';
    if (value == SELECTEDGE) return 'Edges';
    if (value == SELECTFEATURE) return 'Specify Assembly Mates and GD&T';
    if (value == SELECTFACE) return 'Faces';
    if (value == SELECTCORNER) return 'Corners';
    if (value == SELECTCIRCULAR) return 'Circular';
    if (value == SELECTLINEAR) return 'Linear';
    return 'Specify Assembly Mates and GD&T';
  };
  changeValues = (values, param, group, keyfolder, keyname) => {
    let toSet = false;
    //console.log(values,param,group);
    switch (param) {
      case 0:
        toSet = false;
        switch (group) {
          case 0:
            if (values.view != this.state.view) {
              this.setStateWithoutError({ view: values.view });
              this.addCameraAndControls(values.view);
            }
            break;
          case 1:
            if (values.side != this.state.side) {
              this.setStateWithoutError({ side: values.side });
              toSet = true;
            }
            if (toSet) {
              this.updateDisplay(
                values.side,
                this.state.opaque,
                this.state.wiremesh,
                this.state.castshadow,
                this.state.skeleton,
                this.state.grid
              );
            }
            break;
          case 2:
            if (values.opaque != this.state.opaque) {
              this.setStateWithoutError({ opaque: values.opaque });
              toSet = true;
            }
            if (toSet) {
              this.updateDisplay(
                this.state.side,
                values.opaque,
                this.state.wiremesh,
                this.state.castshadow,
                this.state.skeleton,
                this.state.grid
              );
            }
            break;
          case 3:
            //console.log(values, this.state);
            if (values.wiremesh != this.state.wiremesh) {
              this.setStateWithoutError({ wiremesh: values.wiremesh });
              toSet = true;
            }
            if (values.castshadow != this.state.castshadow) {
              this.setStateWithoutError({ castshadow: values.castshadow });
              toSet = true;
            }
            if (values.skeleton != this.state.skeleton) {
              this.setStateWithoutError({ skeleton: values.skeleton });
              toSet = true;
            }
            if (values.grid != this.state.grid) {
              this.setStateWithoutError({ grid: values.grid });
              toSet = true;
            }
            if (toSet) {
              this.updateDisplay(
                this.state.side,
                this.state.opaque,
                values.wiremesh,
                values.castshadow,
                values.skeleton,
                values.grid
              );
            }
            break;
          case 4:
            if (values.showedges != this.state.showedges) {
              //console.log('changing', values.showedges, this.state.showedges);
              this.setStateWithoutError({ showedges: values.showedges });
              this.changeEdgeVisibility(values.showedges);
            } else {
              console.log(
                'Not changing edge visibility',
                values.showedges,
                this.state.showedges
              );
            }
            if (values.linewidth != this.state.edgelinewidth) {
              //console.log('changing', values.showedges, this.state.showedges);
              this.setStateWithoutError({ edgelinewidth: values.linewidth });
              this.changeEdgeLineWidth(values.linewidth);
            } else {
              console.log(
                'Not changing edge line width',
                values.linewidth,
                this.state.edgelinewidth
              );
            }
            break;
          case 5:
            if (values.autoRotate != this.controls.autoRotate) {
              //console.log(values.autoRotate);
              this.controls.autoRotate = values.autoRotate;
            }
            if (values.screenSpacePanning != this.controls.screenSpacePanning) {
              this.controls.screenSpacePanning = values.screenSpacePanning;
            }
            break;
          default:
            break;
        }
        break;
      case 1:
        switch (group) {
          case 0:
            if (values.zoomSpeed != this.state.zoomSpeed) {
              this.setStateWithoutError({ zoomSpeed: values.zoomSpeed });
              if (this.controls) {
                this.controls.zoomSpeed = values.zoomSpeed;
                this.controls.emSpeed = Math.pow(
                  this.controls.zoomSpeed,
                  1.0 / this.OrthographicInitialzoom
                );
              }
            }
            if (values.panSpeed != this.state.panSpeed) {
              this.setStateWithoutError({ panSpeed: values.panSpeed });
              if (this.controls) {
                this.controls.panSpeed = values.panSpeed;
              }
            }
            if (values.rotateSpeed != this.state.rotateSpeed) {
              this.setStateWithoutError({ rotateSpeed: values.rotateSpeed });
              if (this.controls) {
                this.controls.rotateSpeed = values.rotateSpeed;
              }
            }
            break;
          case 1:
            if (values.zoomToCursor != this.state.zoomToCursor) {
              this.setStateWithoutError({ zoomToCursor: values.zoomToCursor });
              if (this.controls) {
                this.controls.noZoom = values.zoomToCursor;
              }
            }
            if (values.maxZoomIn != this.state.maxZoomIn) {
              this.setStateWithoutError({ maxZoomIn: values.maxZoomIn });
            }
            if (values.maxZoomOut != this.state.maxZoomOut) {
              this.setStateWithoutError({ maxZoomOut: values.maxZoomOut });
            }
            break;
          default:
            break;
        }
        break;
      case 2:
        toSet = false;
        switch (group) {
          case 0:
            if (values.textureEncoding != this.state.textureEncoding) {
              this.setStateWithoutError({
                textureEncoding: values.textureEncoding
              });
              this.updateTextureEncoding(values.textureEncoding);
            }
            break;
          case 1:
            if (values.outputEncoding != this.state.outputEncoding) {
              this.setStateWithoutError({
                outputEncoding: values.outputEncoding
              });
              if (this.renderer) {
                this.renderer.outputEncoding =
                  values.outputEncoding == 'sRGB'
                    ? sRGBEncoding
                    : LinearEncoding;
              }
              this.updateTextureEncoding(values.outputEncoding);
            }
            break;
          case 2:
            if (values.exposure != this.state.exposure) {
              this.setStateWithoutError({ exposure: values.exposure });
              toSet = true;
            }
            if (values.addLights != this.state.addLights) {
              this.setStateWithoutError({ addLights: values.addLights });
              toSet = true;
            }
            if (toSet) {
              //console.log(values);
              //console.log(values.exposure,values.addLights,this.state.ambientIntensity,
              //    this.state.ambientColor,this.state.directIntensity,this.state.directColor);
              this.updateLights(
                values.exposure,
                values.addLights,
                this.state.ambientIntensity,
                this.state.ambientColor,
                this.state.directIntensity,
                this.state.directColor
              );
            }
            break;
          case 3:
            if (values.ambientIntensity != this.state.ambientIntensity) {
              this.setStateWithoutError({
                ambientIntensity: values.ambientIntensity
              });
              toSet = true;
            }
            if (values.ambientColor != this.state.ambientColor) {
              this.setStateWithoutError({ ambientColor: values.ambientColor });
              toSet = true;
            }
            if (toSet) {
              //console.log(this.state.exposure,this.state.addLights,values.ambientIntensity,
              //    values.ambientColor,this.state.directIntensity,this.state.directColor);
              this.updateLights(
                this.state.exposure,
                this.state.addLights,
                values.ambientIntensity,
                values.ambientColor,
                this.state.directIntensity,
                this.state.directColor
              );
            }
            break;
          case 4:
            if (values.directIntensity != this.state.directIntensity) {
              this.setStateWithoutError({
                directIntensity: values.directIntensity
              });
              toSet = true;
            }
            if (values.directColor != this.state.directColor) {
              this.setStateWithoutError({ directColor: values.directColor });
              toSet = true;
            }
            if (toSet) {
              //console.log(this.state.exposure,this.state.addLights,this.state.ambientIntensity,
              //    this.state.ambientColor,values.directIntensity,values.directColor);
              this.updateLights(
                this.state.exposure,
                this.state.addLights,
                this.state.ambientIntensity,
                this.state.ambientColor,
                values.directIntensity,
                values.directColor
              );
            }
            break;
          default:
            break;
        }
        break;
      case 3:
        const mySelectedoption = this.getOptionValueFromString(
          values.selectedOption
        );
        if (mySelectedoption != this.selectedoption) {
          if (values.ctrlKey != this.props.ctrlKey) {
            try {
              if (this.props.setCtrlKey) {
                this.props.setCtrlKey(values.ctrlKey);
              }
            } catch (error) {
              console.log('Eror while setting ctrlkey', error);
            }
          }
          if (
            this.selectedoption == SELECTMEASURE ||
            mySelectedoption == SELECTMEASURE
          ) {
            try {
              if (this.props.resetSelections) {
                this.props.resetSelections();
              }
            } catch (error) {
              console.log('Error while rese selctions', error);
            }
          }
          if (
            mySelectedoption == SELECTASSEMBLY ||
            mySelectedoption == SELECTSOLID
          ) {
            try {
              if (this.props.selectAllSelectedSolids) {
                this.props.selectAllSelectedSolids(mySelectedoption);
              }
            } catch (error) {
              console.log('Error while setting all solids', error);
            }
          }
          this.changeVisibility(mySelectedoption);
          this.selectedoption = mySelectedoption;
          try {
            if (this.props.setSelectedOption) {
              this.props.setSelectedOption(mySelectedoption);
            }
          } catch (error) {
            console.log('Error while setting options', error);
          }
        }
        break;
      case 4:
        if (values.animationSpeed != this.state.animationSpeed) {
          this.setStateWithoutError({ animationSpeed: values.animationSpeed });
          this.updateAimationSpeed(values.animationSpeed);
        }

        if (values.pauseAnimation != this.state.pauseAnimation) {
          this.setStateWithoutError({ pauseAnimation: values.pauseAnimation });
          this.updatePauseAnimation(values.pauseAnimation);
        }

        if (values.animationTime != this.state.animationTime) {
          this.setStateWithoutError({ animationTime: values.animationTime });
          this.updateAnimationTime(values.animationTime);
        }
        break;
      default:
        break;
    }
  };

  popMenus = (param) => {
    //console.log("popmenus",myMenus[param],param);
    return (
      <div>
        {/* <MuiThemeProvider theme={this.theme}> */}

        <GroupFormBuilder
          onChange={(values, keyindex) => {
            //console.log(values);
            this.changeValues(
              values,
              param,
              keyindex,
              myMenus[param].folder,
              myMenus[param].groups[keyindex].name
            );
            myMenus[param].groups[keyindex].values = values;
          }}
          groups={myMenus[param].groups}
          closeForm={() => {
            this.handlePopperClick(null, this.state.selectedmenu);
          }}
        />

        {/* </MuiThemeProvider> */}
      </div>
    );
  };

  buildMenus = (myIndex) => {
    return myMenus.map(
      (data, index) =>
        (index < 3 ||
          (this.props.fileGDT && index == 3) ||
          (this.props.fileAnimation && index == 4)) && (
          <Button
            aria-describedby={this.idEl[index]}
            id={'pop' + index.toString()}
            variant="outlined"
            key={this.openEl[index] ? 'O' : 'I' + index.toString()}
            onClick={(event) => {
              this.handlePopperClick(event, index);
            }}
            color={
              index == myIndex && this.openEl[index] ? 'primary' : 'secondary'
            }
            startIcon={data.icon}
          >
            {data.folder}
          </Button>
        )
    );
  };

  resetMyControls = () => {
    if (this.controls && this.controls.reset) {
      this.controls.reset();
      if (this.defaultCamera && this.defaultCamera.isOrthographicCamera) {
        this.controls.zoom = this.OrthographicInitialzoom;
        this.defaultCamera.updateProjectionMatrix();
      }
    }
  };

  changeSelectedOption = (option) => {
    if (this.selectedoption == SELECTMEASURE || option == SELECTMEASURE) {
      if (this.secondshell) {
        this.setOriginalColor(this.secondshell);
        //this.secondshell.material.color.setHex(this.secondshell.currentHex);
        this.secondshell.selectedshell = false;
      }
      if (this.firstshell) {
        this.setOriginalColor(this.firstshell);
        //this.firstshell.material.color.setHex(this.firstshell.currentHex);
        this.firstshell.selectedshell = false;
      }
      this.state_selectedObjects.forEach((element) => {
        this.setOriginalColor(element);
        //element.material.color.setHex(element.currentHex);
        element.selectedshell = false;
      });
      this.secondshell = null;
      this.firstshell = null;
      this.state_selectedObjects = [];
      //this.setState({selectedObjects:[]});
    }
    if (
      (option == SELECTSOLID && this.selectedoption != SELECTASSEMBLY) ||
      option == SELECTASSEMBLY
    ) {
      //console.log("Got Here", this.props.selectedoption);
      this.selectAllSelectedSolids();
    }
    if (this.selectedoption != option) {
      if (
        option == SELECTLOADEDGES ||
        (option == SELECTEDGE && this.props.ctrlKey)
      ) {
        this.loadAllEdges(0);
      }
      this.changeVisibility(option);
      this.selectedoption = option;
    }
  };

  /* arrayFindIndex = (arr, value) => {

        return arr.findIndex(function (ele) {            
          return ele == value;
        });
    }
    
    arrayRemove = (arr, value) => {
    
        return arr.filter(function (ele) {
         
          return ele != value;
        });
    }
     */
  onCloseProgress = (aFile, alert, messages) => {
    let message = '';
    try {
      message += messages.toString();
    } catch (exc) {}
    let openFiles = [...this.state.progressOpenedFiles];
    openFiles = arrayRemoveFromValue(openFiles, aFile);
    try {
      this.setStateWithoutError({ progressOpenedFiles: openFiles });
      if (this.props.setProgressOpenedFiles) {
        this.props.setProgressOpenedFiles(openFiles);
      }
    } catch (error) {
      console.log('Error while closing bar', error);
    }

    if (openFiles.length == 0) {
      try {
        this.openSnackBar(alert, aFile + ' ' + message);
      } catch (error) {
        console.log(
          'Error while displaying snackbar',
          error,
          aFile,
          alert,
          message
        );
      }
      try {
        this.setStateWithoutError({ isProgressOpen: false });
        if (this.props.setIsProgressOpen) {
          this.props.setIsProgressOpen(false);
        }
      } catch (error) {
        console.log('Error while displaying bar', error);
      }

      //console.log("Setting is progress closing",this.state.isProgressOpen,openFiles,aFile);
    } else {
      try {
        this.openSnackBar(
          alert,
          aFile + ' ' + message + ' out of ' + openFiles.length.toString()
        );
      } catch (error) {
        console.log(
          'Error while displaying snackbar',
          error,
          aFile,
          alert,
          message
        );
      }
      //console.log("Setting is progress Opening",this.state.isProgressOpen,openFiles,aFile);
    }
  };

  onInitProgress = (aFile) => {
    let openFiles = [...this.state.progressOpenedFiles];
    openFiles.push(aFile);
    try {
      this.setStateWithoutError({ progressOpenedFiles: openFiles });
      if (this.props.setProgressOpenedFiles) {
        this.props.setProgressOpenedFiles(openFiles);
      }
      this.setStateWithoutError({ isProgressOpen: true });
      if (this.props.setIsProgressOpen) {
        this.props.setIsProgressOpen(true);
      }
    } catch (error) {
      console.log('While initializing bar', error);
    }

    //console.log("Setting is progress open",this.state.isProgressOpen);
  };

  progressStyle = {
    width: '500px',
    boxShadow: 'rgba(0,0,0,.3) 0 0.3rem 1rem',
    background: 'red'
  };

  renderProgress = () => {
    const classes = { tableWow: 'tableRow', tableCell: 'tableCell' };
    const stateProgressOpenFiles = this.state
      ? this.state.progressOpenedFiles
        ? this.state.progressOpenedFiles
        : []
      : [];

    return (
      <Typography component="div">
        <TableContainer component={Paper} style={{ minWidth: 500 }}>
          <Table className={classes.table} aria-label="simple table">
            <TableHead>
              <TableRow
                className={classes.tableRow}
                style={{ background: '#CCCCCC', fontWeight: 'bold' }}
              >
                <TableCell
                  className={classes.tableCell}
                  align="left"
                  size="small"
                >
                  No
                </TableCell>
                <TableCell
                  className={classes.tableCell}
                  align="left"
                  size="small"
                >
                  Feature
                </TableCell>
                <TableCell
                  className={classes.tableCell}
                  align="left"
                  size="small"
                >
                  Progress
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* {this.state.progressOpenedFiles} */}
              {stateProgressOpenFiles.map((row, index) => (
                <StyledTableRow>
                  <StyledTableCell align="left" size="small">
                    {index + 1}
                  </StyledTableCell>
                  <StyledTableCell align="left" size="small">
                    {row}
                  </StyledTableCell>
                  <StyledTableCell align="left" size="small">
                    <CircularProgress />
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Typography>
    );
  };

  /*render() {
    const state_gltfobj = this.props.gltfobj || this.this_state_gltf;

    const edgeLength = state_gltfobj
      ? state_gltfobj.gdttable
        ? state_gltfobj.gdttable[this.props.activeDataTable]
          ? state_gltfobj.gdttable[this.props.activeDataTable].edges
            ? state_gltfobj.gdttable[this.props.activeDataTable].edges.length
            : 0
          : 0
        : 0
      : 0;
    const edgeChange = this.gltfobjLen != 0 && edgeLength == 0;
    // if (fromwhere == 1) {
    //   console.log(this.activeFile, this.props.activefile, this.initDone);
    // }

    if (
      this.activeFile != this.props.activefile ||
      this.materialtype != this.props.materialtype ||
      this.selectedoption != this.props.selectedoption ||
      this.activeDataTable != this.props.activeDataTable ||
      edgeChange
    ) {
      //  if (this.selectedoption == SELECTMEASURE || this.props.selectedoption == SELECTMEASURE) {
      //           if (this.secondshell) {
      //               this.secondshell.material.color.setHex(this.secondshell.currentHex);
      //               this.secondshell.selectedshell = false;
      //           }
      //           if (this.firstshell) {
      //               this.firstshell.material.color.setHex(this.firstshell.currentHex);
      //               this.firstshell.selectedshell = false;
      //           }
      //           this.state_selectedObjects.forEach(element => {
      //               element.material.color.setHex(element.currentHex);
      //               element.selectedshell = false;
      //           });
      //           this.secondshell = null;
      //           this.firstshell = null;
      //           this.state_selectedObjects = [];
      //           //this.setState({selectedObjects:[]});
      //       }
      //       if (((this.props.selectedoption == SELECTSOLID) && (this.selectedoption != SELECTASSEMBLY))
      //           || (this.props.selectedoption == SELECTASSEMBLY)) {
      //           //console.log("Got Here", this.props.selectedoption);
      //           this.selectAllSelectedSolids();
      //       }
      //       if(this.selectedoption !=this.props.selectedoption) {
      //           if(this.props.selectedoption==SELECTLOADEDGES || (this.props.selectedoption==SELECTEDGE && this.props.ctrlKey)) {
      //               this.loadAllEdges(0);                    
      //           }
      //           this.changeVisibility();
      //           this.selectedoption = this.props.selectedoption;
      //       } 
      this.changeSelectedOption(this.props.selectedoption);
      if (
        this.activeFile != this.props.activefile ||
        this.materialtype != this.props.materialtype ||
        this.activeDataTable != this.props.activeDataTable ||
        edgeChange
      ) {
        //console.log("Rerendering here!",this.activeFile,this.props.activefile,this.materialtype,
        //    this.props.materialtype,this.selectedoption,this.props.selectedoption);
        if (this.initDone) {
          // console.log(
          //   'Doing this.this_state_gltf || this.state.gltfobj || this.props.gltfobj',
          //   this.this_state_gltf || this.state.gltfobj || this.props.gltfobj,
          //   this.renderDone
          // );
          if (this.activeFile != this.props.activefile) {
            console.log(
              'I am resetting the activefile',
              this.activeFile,
              this.props.activefile,
              this.props.gltfobj,
              this.this_state_gltf,
              this.props.activeGLTFFile
            );
            if (!isEmptyObjectDictionary(this.props.gltfobj)) {
              this.this_state_gltf = this.props.gltfobj;
            }
          }
          let mygltfcontent = this.this_state_gltf || this.props.gltfobj;
          if (isEmptyObjectDictionary(mygltfcontent)) {
            mygltfcontent = this.props.gltfobj;
          }
          if (!isEmptyObjectDictionary(mygltfcontent)) {
            console.log(
              'I am resloading the activefile',
              this.activeFile,
              this.props.activefile,
              this.props.gltfobj,
              this.this_state_gltf,
              mygltfcontent
            );

            console.log('I am reloading the gltf', this.props.activeGLTFFile);
            this.alter(mygltfcontent);
          } else {
            console.log(
              'Skipping rendering due to blank',
              mygltfcontent,
              this.this_state_gltf || this.props.gltfobj,
              this.this_state_gltf,
              this.activeFile,
              this.props.activefile,
              this.props.gltfobj
            );
            this.activeFile = this.props.activefile;
            this.materialtype = this.props.materialtype;
            this.activeDataTable = this.props.activeDataTable;
          }
        }
      }
    }
    */

  render(/*fromwhere = 0*/) {
    if (this.renderer) {
      this.changeBackground();

      this.renderer.render(this.scene, this.activeCamera);
      //this.renderer.clearDepth();
      //this.renderer.render(this.lineScene, this.activeCamera);

      /* scenechildren.forEach(element => {
                if ((element instanceof Object3D)) {
                    this.renderer.render(element, this.activeCamera);
                }  
            }); */
      //this.renderer.render(this.scene, this.activeCamera);
      if (this.state.grid && this.axesRenderer) {
        this.axesCamera.position.copy(this.defaultCamera.position);
        this.axesCamera.lookAt(this.axesScene.position);
        this.axesRenderer.render(this.axesScene, this.axesCamera);
      }
      //console.log("Coming from here to changeparts");
      //this.changeparts();
    }

    const myID = (id) => {
      if (id === undefined || !id) {
        return '';
      }
      return id.toString();
    };

    //console.log("loadProgresbar",this.props.loadProgressBar);
    return (
      <>
        <Grid container spacing={0} direction="column" alignItems="center">
          <Grid p={1}>
            {this.buildMenus(this.state.selectedmenu)}
            <Button
              variant="contained"
              onClick={(event) => {
                this.resetMyControls();
              }}
              startIcon={<RotateLeftSharpIcon />}
            ></Button>
            <Button
              variant="contained"
              onClick={(event) => {
                this.setState({
                  freezeNonSelection: !this.state.freezeNonSelection
                });
              }}
              style={{
                backgroundColor: this.state.freezeNonSelection
                  ? '#BBBBBB'
                  : '#444444'
              }}
              //color={this.state.freezeNonSelection ? 'light' : 'dark'}
              startIcon={<AcUnitSharpIcon />}
            ></Button>
          </Grid>

          <Popper
            style={{ zIndex: 1600 }}
            id={this.idEl[this.state.selectedmenu]}
            open={this.openEl[this.state.selectedmenu] || false}
            anchorEl={this.state.anchorEls[this.state.selectedmenu]}
            placement={'bottom'}
          >
            <ClickAwayListener
              onClickAway={(event) => {
                {
                  this.handlePopperClick(event, this.state.selectedmenu);
                }
              }}
            >
              <div>{this.popMenus(this.state.selectedmenu)}</div>
            </ClickAwayListener>
          </Popper>
        </Grid>
        {this.props.loadProgressBar && (
          <div
            style={{
              position: 'fixed',
              top: this.clientY + 10,
              left: this.clientX + 10
            }}
          >
            <ModelessDialog
              isOpen={this.state.isProgressOpen}
              onClose={this.onCloseProgress}
              style={this.progressStyle}
              containerClassName={'container'}
              noBackdrop={true}
              clickBackdropToClose={false}
            >
              {this.renderProgress()}
            </ModelessDialog>
          </div>
        )}

        <div style={{ width: '100%' }} ref={(el) => (this.node = el)}></div>

        <div
          style={{
            display:
              this.state.intersectedShell || this.state.displaytext
                ? 'block'
                : 'block',
            position: 'fixed',
            top: this.clientY + 10,
            left: this.clientX + 10,
            color: DEFAULTTEXTCOLOR(),
            ...this.props.style
          }}
        >
          {this.state.intersectedShell
            ? this.state.intersectedShellName //this.getNameID(this.state.intersectedShell.name)
            : ''}
          {/*this.state.displaytext*/}
        </div>
        <Snackbar
          open={this.state.snackBarState}
          autoHideDuration={this.state.autoHideDuration}
          onClose={this.closeSnackBar}
        >
          <MuiAlert
            color={this.state.snackBarAlertType}
            variant="filled"
            onClose={this.closeSnackBar}
          >
            {this.state.snackBarMessage}
          </MuiAlert>
        </Snackbar>
        {/* <div style={{position:"relative", top:0, left:0}}
                    ref={guip=>(this.nodeguiparent=guip)}>
                    <div 
                        style={{ width: "100%", height: "150px" }}
                        ref={guik=>(this.nodegui=guik)}>
                    </div>  
                </div>  */}
      </>
    );
  }
}

export default GLTFRenderer;
