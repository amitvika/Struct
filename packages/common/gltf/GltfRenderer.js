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
  CatmullRomCurve3,
  Quaternion,
  SphereBufferGeometry
  /*
    LineSegments,    
    Mesh,
    Group,   
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
import DraggerControl from './DraggerControl.js';
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
  arrayCopy,
  extractKinematicInformation,
  DEFAULTBACKMENUCOLOR,
  DEFAULTTEXTMENUCOLOR,
  DEFAULTBUTTONHOVERCOLOR,
  DEFAULTBUTTONHOVERBACKGROUND
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
import AnimationOutlinedIcon from '@mui/icons-material/AnimationOutlined';
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
    transparency: 0.0,
    skeleton: false,
    showedges: true,
    showchosenaxis: true,
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
    freezeNonSelection: false,
    //parsedKinematicInfo: [],
    indexedKinematicParsedInfo: [],
    kinematicErrorDigits: 4,
    kinematicPrecision: 0.0001,
    kinematicDimension: [0, 0, 0, 0, 0, 0],
    state_selectedObjectsIndex: 0,
    state_pointsIndex: 0
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
      autoHideDuration: alert === 'success' ? 1000 : 5000,
      snackBarState: true
    });
    //console.log("Snack Bar",alert,message);
  };

  closeSnackBar = () => {
    this.setStateWithoutError({ snackBarState: false });
  };

  findEdgeChange = (prevProps) => {
    //const state_gltfobj = state.gltfobj || this.props.gltfobj;

    return prevProps
      ? prevProps.gltfobj
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
                        ? this.props.gltfobj.gdttable[
                            this.props.activeDataTable
                          ].edges.length === 0
                        : true
                      : true
                    : true
                  : false
                : false
              : false
            : false
          : false
        : false
      : false;
  };

  drawAxisLine = (axis, position, objectname) => {
    if (
      this.scene &&
      axis &&
      axis.length === 3 &&
      position &&
      position.length === 3
    ) {
      let axisLineNodes = new Group(); //new Object3D();
      axisLineNodes.linetype = 5;
      const name = 'AXIS' + (objectname ? objectname : '');
      let points = [];
      const maxLength =
        window.innerWidth > window.innerHeight
          ? window.innerWidth
          : window.innerHeight;

      // console.log(
      //   'Got window for drawing edges',
      //   window,
      //   maxLength,
      //   position[0] * 0.001 - axis[0] * maxLength,
      //   position[2] * 0.001 - axis[2] * maxLength,
      //   position[1] * -0.001 + axis[1] * maxLength
      // );
      const startPoint = new Vector3(
        position[0] * 0.001 - axis[0] * maxLength,
        position[2] * 0.001 - axis[2] * maxLength,
        position[1] * -0.001 + axis[1] * maxLength
      );
      const finishPoint = new Vector3(
        position[0] * 0.001 + axis[0] * maxLength,
        position[2] * 0.001 + axis[2] * maxLength,
        position[1] * -0.001 - axis[1] * maxLength
      );
      points.push(startPoint);
      points.push(finishPoint);
      let geometry = new BufferGeometry({
        name: name
      });
      geometry.name = name;
      //geometry.setPositions(myBase64Points);
      //console.log('Setting points to draw axis', points);
      geometry.setFromPoints(points);
      let sketchLineGeometry = new MeshLineGeometry();
      sketchLineGeometry.setGeometry(geometry);
      let sketchMatrial = new MeshLineMaterial({
        color: this.props.edgecolor ? this.props.edgecolor : DEFAULTEDGECOLOR,
        resolution: new Vector2(400, 400),
        sizeAttenuation: 0,
        lineWidth: this.state.edgelinewidth,
        side: DoubleSide
      });
      //Note: resolution is *required*!
      let ourMesh = new MeshLine(sketchLineGeometry, sketchMatrial);
      ourMesh.name = name;
      ourMesh.renderOrder += 40;
      ourMesh.curveCode = '';
      axisLineNodes.add(ourMesh);
      //console.log(this.shiftposition);
      axisLineNodes.position.x += this.shiftposition.x;
      axisLineNodes.position.y += this.shiftposition.y;
      axisLineNodes.position.z += this.shiftposition.z;
      axisLineNodes.renderOrder += 40;
      //parentLineNodes.onBeforeRender = function( renderer ) { renderer.clearDepth(); };
      this.scene.add(axisLineNodes);
      ourMesh.updateMatrix();
      ourMesh.updateMatrixWorld(true);
      axisLineNodes.updateMatrix();
      axisLineNodes.updateMatrixWorld(true);
      this.scene.updateMatrix();
      this.scene.updateMatrixWorld(true);
      this.scene.updateWorldMatrix(true, true);
      if (!this.axisArray) {
        this.axisArray = [];
      }
      if (this.axisArray) {
        this.axisArray.push(axisLineNodes);
      }
      this.raycastObjects = [
        ...this.raycastObjects,
        ...this.rayCastObjectFilters(axisLineNodes.children)
      ];
      return axisLineNodes;
    }
    return null;
  };
  makeVisibilityToAxisArrays = (change) => {
    if (this.axisArray) {
      for (let index = 0; index < this.axisArray.length; index++) {
        let element = this.axisArray[index];
        element.visible = change;
      }
    }
  };
  componentDidUpdate(prevProps, prevState) {
    //var toChange = ( (prevProps.gltfobj !== this.props.gltfobj)  || (prevState.gltfobj  !== this.props.gltfobj) );
    //console.log('COMPONENT', prevProps, this.props);
    //console.log('STRINGIFY', stringify);

    const toChangeGLTF = prevProps
      ? prevProps.activeGLTFFile !== this.props.activeGLTFFile ||
        prevProps.activeDataTable !== this.props.activeDataTable
      : true; //prevProps.activefile !== this.props.activefile;

    var toChange = toChangeGLTF;
    toChange = prevProps
      ? toChange || prevProps.materialtype !== this.props.materialtype
      : true;
    const edgeChange = toChange ? this.findEdgeChange(prevProps) : false;
    if (
      prevProps ? prevProps.selectedoption !== this.props.selectedoption : true
    ) {
      const thisoption = this.getValueOptionFromString(
        this.props.selectedoption
      );
      myMenus[3].groups[0].values.selectedOption = thisoption;
      this.changeSelectedOption(this.props.selectedoption);
    }
    toChange = toChange || edgeChange;

    this.changedctrlkey = this.props.ctrlKey;
    var changeback = this.databackcolor !== this.props.backcolor;
    changeback = changeback || this.dataselectcolor !== this.props.selectcolor;
    changeback = changeback || this.datatouchcolor !== this.props.touchcolor;
    if (changeback) {
      this.changeBackgroundWhenPropsChange();
    }
    //let changedGLTF = false;
    if (toChangeGLTF) {
      /* */
      this.this_state_gltf = { ...this.props.gltfobj };
      this.this_progress_data = null;
      if (this.initDone) {
        if (
          prevProps
            ? prevProps.activeGLTFFile !== this.props.activeGLTFFile ||
              !this.content ||
              this.content.length === 0
            : true
        ) {
          console.log(
            'Doing this.props.gltfobj in toChangeGLTF',
            this.props.gltfobj
          );
          this.alterEntered = true;
          this.alter(this.props.gltfobj);
          //changedGLTF = true;
        } else {
          console.log('keeping position in toChangeGLTF', this.props.gltfobj);
          this.changeddataarray = [];
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

    if (this.props.drawAxisLines) {
      if (
        prevProps
          ? JSON.stringify(prevProps.drawAxisLines || []) !==
            JSON.stringify(this.props.drawAxisLines || [])
          : true
      ) {
        for (
          let indexLines = 0;
          indexLines < this.props.drawAxisLines.length;
          indexLines++
        ) {
          const element = this.props.drawAxisLines[indexLines];
          //console.log('Getting an element to draw axis', element);
          this.drawAxisLine(element.axis, element.position, element.name);
        }
      } else if (this.props.drawAxisLines.length > 0) {
        // console.log(
        //   'I am not drawing because already drawn',
        //   this.props.drawAxisLines,
        //   prevProps.drawAxisLines
        // );
      }
    }
    if (this.props.kinematicParameters) {
      if (
        this.props.kinematicParameters.error != this.state.kinematicErrorDigits
      ) {
        const precision = Math.pow(10, -this.props.kinematicParameters.error);
        this.setStateWithoutError({
          kinematicErrorDigits: this.props.kinematicParameters.error,
          kinematicPrecision: precision
        });
      }
    }
    if (this.props.showKinematicSliderMove && this.alterEntered === false) {
      // console.log(
      //   'Getting from Component DID update',
      //   prevProps,
      //   this.props,
      //   'PrevState',
      //   prevState,
      //   'STATE BEGIN',
      //   this.state,
      //   'STATE END'
      // );
      if (
        this.props.showKinematicSliderAnimate &&
        (prevState.state_selectedObjectsIndex !=
          this.state.state_selectedObjectsIndex ||
          prevState.state_pointsIndex != this.state.state_pointsIndex)
      ) {
        console.log(
          'Getting from Component DID update state',
          prevState,
          this.state
        );
        //this.calculateInverseKinematicMovementFromPointsWithoutLoop(false);
      } else if (
        this.props.showKinematicSliderAnimate !=
        prevProps.showKinematicSliderAnimate
      ) {
        if (this.props.showKinematicSliderAnimate) {
          // this.calculateInverseKinematicMovementFromPoints(
          //   this.state.indexedKinematicParsedInfo,
          //   this.props.xyzShiftPosition,
          //   this.state.kinematicDimension
          // );
          if (this.state_calculatedKinematicItemChainChanged === true) {
            this.calculateInverseKinematicMovementFromPointsWithoutLoop(true);
          } else {
            console.log('No need to recalculate since nothing was changed');
          }
        } else if (this.calculateInverseKinematicMovementArray.length > 0) {
          if (
            this.calculateInverseKinematicMovementIndex >=
              this.calculateInverseKinematicMovementArray.length ||
            this.calculateInverseKinematicMovementIndex < 0
          ) {
            this.calculateInverseKinematicMovementIndex = 0;
          }
          if (this.props.setKinematicItemList) {
            const resultKinematicList = this.cloneChainInfoBackward(
              this.calculateInverseKinematicMovementArray[
                this.calculateInverseKinematicMovementIndex
              ],
              this.props.kinematicItemList,
              this.state.indexedKinematicParsedInfo
            );
            console.log(
              this.calculateInverseKinematicMovementIndex,
              resultKinematicList,
              this.props.kinematicItemList
            );
            this.props.setKinematicItemList(resultKinematicList);
          }
        }
      } else {
        this.ApplyShiftingKinematicMovement(
          prevProps,
          this.state.indexedKinematicParsedInfo
        );
        this.ApplyForwardKinematicMovement(
          prevProps,
          this.state.indexedKinematicParsedInfo,
          this.props.xyzShiftPosition,
          this.state.kinematicDimension
        );
        this.calculateInverseKinematicMovement(
          prevProps,
          this.state.indexedKinematicParsedInfo,
          this.props.xyzShiftPosition,
          this.state.kinematicDimension
        );
      }
    }
    /* 
        if((this.state.gltfobj!==this.props.gltfobj) || (prevState.gltfobj !==this.state.gltfobj)) {
            this.setState({gltfobj:this.props.gltfobj});
            console.log("Setting",this.state.gltfobj,"props obj",this.props.gltfobj);
            this.alter(this.props.gltfobj);
        } else {
            console.log("Not Setting",this.state.gltfobj,"props obj",this.props.gltfobj);
        }
        //console.log("Reachibg here my set",list,prevProps,prevState,this.state.sortedlist);
            if (toChange && this.changeState===false) {
            //this.setState({gltfobj:this.props.gltfobj});
            if (this.selectedoption !== this.props.selectedoption) {
                this.changeSelectedOption();                       
            } 
            if (this.activeFile !== this.props.activefile ||
                this.materialtype !== this.props.materialtype || 
                this.activeDataTable !== this.props.activeDataTable ||
                edgeChange ) {               
               
                if(this.initDone) {
                    //this.alter(this.props.gltfobj);       
                    this.setState({gltfobj:this.props.gltfobj});
                    console.log("Alter Setting",this.state.gltfobj,"props obj",this.props.gltfobj);                        
                }            
            }          
        }
        
        if(this.changeState===true) {
            console.log("I am not changing state eventhough props changed")
            this.changeState=false;
        } else {
            console.log("Changing property status:",this.gltfobjLen,toChange,edgeChange,
                        this.changeState,prevProps.gltfobj,this.props.gltfobj);
            console.log(this.activeFile,this.activeId,this.gltfobjLen);
        } */
  }

  removeFromScreenObjects = (myobject) => {
    if (myobject) {
      this.scene.remove(myobject);
      myobject.traverse((node) => {
        if (node.isMesh && node.geometry) {
          node.geometry.dispose();
        }
      });
    }
  };

  truncToFirst = () => {
    /* if (this.axisArray) {
      for (let index = 0; index < this.axisArray.length; index++) {
        this.removeFromScreenObjects(this.axisArray[index]);
      }
      this.axisArray = [];
    } */
    this.removeDrawnAxisLines();
    this.removeSphere();
    this.removeDragger();
    if (this.content) {
      for (let index = this.content.length - 1; index > 0; index--) {
        if (index > 0) {
          this.removeFromScreenObjects(this.content[index]);
          // let myobject = this.content[index];
          // this.scene.remove(myobject);
          // myobject.traverse((node) => {
          //   if (!node.isMesh) return;
          //   if (node.geometry) {
          //     node.geometry.dispose();
          //     //node.geometry=null;
          //   }
          // });
        }
      }
      if (this.content.length > 1) {
        this.content.length = 1;
        let myobject = this.content[0];
        myobject.traverse((node) => {
          if (!node.isMesh) return;
          //console.log('Initial node', node);
          node.facesLoaded = false;
          node.edgesLoaded = false;
          node.verticesLoaded = false;
          //console.log('Setting node', node);
        });
        this.updateParts(myobject);
      }
    }

    if (
      this.props.gltfobj &&
      this.props.gltfobj.tree &&
      this.props.gltfobj.treeLength < this.props.gltfobj.tree.length
    ) {
      this.this_state_gltf.tree.length = this.props.gltfobj.treeLength;
      console.log('Changing Tree Length', this.this_state_gltf);
    }
  };
  handlePopperClick = (event, param) => {
    let anchorEls = [...this.state.anchorEls];
    if (this.state.selectedmenu !== param) {
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
    if (myView === 'Orthographic') {
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
      const multipler = 2.0 * (this.props.showKinematicMove ? 0.7 : 0.97); //2.36 / 1.64;
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

      this.shiftposition = this.props.showKinematicSliderMove
        ? {
            x: 0, // object.position.x - center.x,
            y: 0, // object.position.y - center.y,
            z: 0 // object.position.z - center.z
          }
        : {
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
        if (
          this.defaultCamera.near > 0.0001 &&
          this.defaultCamera.isOrthographicCamera
        ) {
          this.defaultCamera.near = 0.0001;
          this.defaultCamera.frustumCulled = false;
        }
        this.defaultCamera.far = (size * size) / this.defaultCamera.near;
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
          const distanceFarOff = this.defaultCamera.isOrthographicCamera
            ? 100
            : 1;
          this.defaultCamera.position.x += (size / 2.0) * distanceFarOff;
          this.defaultCamera.position.y += (size / 2.0) * distanceFarOff;
          this.defaultCamera.position.z += (size / 2.0) * distanceFarOff;
          this.defaultCamera.cameraposition = center;
          this.defaultCamera.lookAt(this.defaultCamera.cameraposition);
          //console.log("setting4",size,this.defaultCamera);
        }
        //console.log('My camera', this.defaultCamera);
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
    this.partsMeshes = [];
    this.sphereNode = [null, null];
    this.sphere = [null, null];
    this.dotGeometry = [null, null];
    this.alterEntered = false;
    this.calculateInverseKinematicMovementInCalculation = false;
    this.calculateInverseKinematicMovementArray = [];
    this.calculateInverseKinematicMovementIndex = -1;
    this.calculateInverseKinematicMovementDirection = true;
    this.state_calculatedKinematicItemChainChanged = false;
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
    this.axisArray = null;
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
    if (!this.renderer) {
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
            (this.props.fileGDT && index === 3) ||
            (this.props.fileAnimation && index === 4)
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

    this.this_state_gltf = { ...this.props.gltfobj };
    console.log(
      'Doing this.props.gltfobj',
      this.props.gltfobj,
      this.props.activeGLTFFile,
      this.this_state_gltf
    );
    this.this_progress_data = null;
    this.alterEntered = true;
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
      if (this.node.clientHeight !== this.node.clientWidth) {
        let minsize = Math.max(this.node.clientWidth, this.node.clientHeight);
        //console.log('minsize',this.node.clientWidth,this.node.clientHeight);
        if (minsize <= 0) {
          minsize = 1;
        }

        let minsizePX = minsize.toString() + 'px';
        //console.log(minsizePX,this.node.clientWidth,this.node.clientHeight,this.node.style.width,this.node.style.height);
        if (this.node.style.width !== minsizePX) {
          //console.log('minsizePX',minsizePX);
          this.node.style.width = minsizePX;
        }
        if (this.node.style.height !== minsizePX) {
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
    if (innerHeight === 0) {
      innerWidth = innerHeight;
    }
    if (innerWidth === 0) {
      innerHeight = innerWidth;
      if (innerHeight === 0) {
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
    if (
      this.props.showKinematicSliderMove &&
      this.props.showKinematicSliderAnimate &&
      this.calculateInverseKinematicMovementInCalculation === false &&
      this.calculateInverseKinematicMovementArray.length > 0
    ) {
      if (this.calculateInverseKinematicMovementDirection === true) {
        this.calculateInverseKinematicMovementIndex += 1;
        if (
          this.calculateInverseKinematicMovementIndex >=
          this.calculateInverseKinematicMovementArray.length
        ) {
          this.calculateInverseKinematicMovementDirection = false;
          this.calculateInverseKinematicMovementIndex =
            this.calculateInverseKinematicMovementArray.length - 2;
        }
        if (this.calculateInverseKinematicMovementIndex < 0) {
          this.calculateInverseKinematicMovementDirection = true;
          this.calculateInverseKinematicMovementIndex = 0;
        }
      } else {
        this.calculateInverseKinematicMovementIndex -= 1;
        if (this.calculateInverseKinematicMovementIndex < 0) {
          this.calculateInverseKinematicMovementDirection = true;
          this.calculateInverseKinematicMovementIndex = 1;
        }
        if (
          this.calculateInverseKinematicMovementIndex >=
          this.calculateInverseKinematicMovementArray.length
        ) {
          this.calculateInverseKinematicMovementDirection = false;
          this.calculateInverseKinematicMovementIndex = 0;
        }
      }
      // this.animateResultKinematicList = this.cloneChainInfoBackward(
      //   this.calculateInverseKinematicMovementArray[
      //     this.calculateInverseKinematicMovementIndex
      //   ],
      //   this.props.kinematicItemList,
      //   this.state.indexedKinematicParsedInfo
      // );
      this.cloneChainInfoToKinematicList();
      console.log(
        'Executing',
        this.calculateInverseKinematicMovementIndex,
        this.calculateInverseKinematicMovementArray[
          this.calculateInverseKinematicMovementIndex
        ],
        this.animateResultKinematicList
      );
      this.ApplyForwardKinematicMovementFromPoint();
    }
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
                node.frustumCulled = false;
                if (node.material) {
                  node.material.transparent = false;
                }
                for (var i = 0; i < this.state_selectedObjects.length; i++) {
                  if (node.name === this.state_selectedObjects[i].name) {
                    this.setSelectionColor(node);
                    this.state_selectedObjects[i] = node;
                    break;
                  }
                }
                if (this.firstshell) {
                  if (node.name === this.firstshell.name) {
                    this.setSelectionColor(node);
                    this.firstshell = node;
                  }
                }
                if (this.secondshell) {
                  if (node.name === this.secondshell.name) {
                    this.setSelectionColor(node);
                    this.secondshell = node;
                  }
                }
                const visibility = this.visibllity(node, true, option);
                if (this.props.materialtype !== 'Basic') {
                  const materials = Array.isArray(node.material)
                    ? node.material
                    : [node.material];
                  materials.forEach((material) => {
                    material.visible = visibility;
                    var prevMaterial = material;
                    if (this.props.materialtype === 'Standard') {
                      material = new MeshStandardMaterial();
                    } else {
                      if (this.props.materialtype === 'Lambert') {
                        material = new MeshLambertMaterial();
                      } else {
                        if (this.props.materialtype === 'Phong') {
                          material = new MeshPhongMaterial();
                        } else {
                          if (this.props.materialtype === 'Physical') {
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
                  this.state.castshadow,
                  this.state.transparency
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
    if (
      this.props.fileGDT &&
      !this.props.showKinematicMove /*&& this.props.fileAnimation === false*/
    ) {
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
        gdttable = arrayCopy([defaultGDTTable]);
      } else {
        gdttable = state_gltfobj.gdttable || [defaultGDTTable];
      }
      if (this.props.activeDataTable < gdttable.length) {
        await this.updateGDTTable(gdttable[this.props.activeDataTable]);
      }

      //console.log(this.props);
    }
  };

  assignPositionToNode = (
    element,
    revisedPosition,
    revisedQuaternion,
    //originalPosition,
    shiftingPosition,
    diffPosition
  ) => {
    if (element.geometry && element.centre) {
      // if (
      //   (element.centre.x === 0 &&
      //     element.centre.y === 0 &&
      //     element.centre.z === 0) ||
      //   true
      // ) {
      //element.position.sub(originalPosition);
      //const centerFactor = originalPosition.clone();
      /*console.log(
          'element.position1',
          element.name,
          element.position,
          element.localPosition,
          element.localQuaternion,
          //element.centre,
          //centerFactor,
          element.shiftingPosition,
          revisedPosition,
          revisedQuaternion,
          shiftingPosition
        );*/
      element.position.sub(element.shiftingPosition);
      /*console.log(
          'element.position2',
          element.name,
          element.position,
          element.localPosition,
          element.localQuaternion,
          //element.centre,
          //centerFactor,
          element.shiftingPosition,
          revisedPosition,
          revisedQuaternion,
          shiftingPosition
        );*/
      element.updateMatrix();
      element.updateMatrixWorld();
      element.applyQuaternion(element.localQuaternion.clone().invert());
      element.updateMatrix();
      element.updateMatrixWorld();
      /*console.log(
          'element.position3',
          element.name,
          element.position,
          element.localPosition,
          element.localQuaternion,
          //element.centre,
          //centerFactor,
          element.shiftingPosition,
          revisedPosition,
          revisedQuaternion,
          shiftingPosition
        );*/
      //console.log('Got vector as', addedVector, centre, element.centre);
      //element.position.add(addedVector);
      //revisedPosition.clone(); //originalPosition; //revisedPosition; //new Vector3(0, 0, 0);
      /*  for (let index = 0; index < element.localArrays.length; index++) {
          const elementArray = element.localArrays[index];
          element.position.add(elementArray);
        } */

      // console.log(
      //   'element.position4',
      //   element.name,
      //   element.position,
      //   element.localPosition,
      //   centerFactor,
      //   element.localArrays
      // );
      //element.position.add(centerFactor);
      element.updateMatrix();
      element.updateMatrixWorld();
      //const elementLocalPosition = element.localPosition.clone(); //originalPosition; //element.localPosition; //element.position.clone();
      /* let elementLocalPosition = new Vector3(
          -element.centre.x,
          -element.centre.y,
          -element.centre.z
        ); */
      //         let elementLocalPosition = element.centre.clone();
      //         const addedVector = new Vector3(0, 0, 0);
      //         //const centerFactor = revisedPosition.clone(); //originalPosition.clone();//revisedPosition.clone(); //originalPosition; //revisedPosition; //new Vector3(0, 0, 0);
      //         elementLocalPosition.sub(centerFactor);

      //         //addedVector.subVectors(centerFactor, elementLocalPosition);
      //         element.geometry.applyMatrix(
      //           new Matrix4().makeTranslation(
      //             elementLocalPosition.x,
      //             elementLocalPosition.y,
      //             elementLocalPosition.z
      //           )
      //         );
      //         /* console.log(
      //           'element local1',
      //           element.localPosition,
      //           originalPosition,
      //           element.position,
      //           elementLocalPosition,
      //           element.localQuaternion,
      //           element.localQuaternion.clone().invert(),
      //           addedVector
      //         ); */
      //         console.log(
      //           'element.position4',
      //           element.name,
      //           element.position,
      //           element.localPosition,
      //           element.centre,
      //           centerFactor,
      //           elementLocalPosition
      //         );
      //         //element.position.add(addedVector);
      //         // console.log(
      //         //   'element.position6',
      //         //   element.name,
      //         //   element.position,
      //         //   element.localPosition,
      //         //   centerFactor
      //         // );
      //         //element.position.sub(centerFactor);
      //         // console.log(
      //         //   'element.position7',
      //         //   element.name,
      //         //   element.position,
      //         //   element.localPosition,
      //         //   centerFactor
      //         // );
      //         element.updateMatrix();
      //         element.updateMatrixWorld();
      //         /* console.log(
      //           'element local2',
      //           element.localPosition,
      //           element.position,
      //           element.localQuaternion,
      //           element.localQuaternion.clone().invert()
      //         );
      //  */
      element.applyQuaternion(revisedQuaternion);
      element.updateMatrix();
      element.updateMatrixWorld();
      /*console.log(
          'element.position5',
          element.name,
          element.position,
          element.localPosition,
          element.localQuaternion,
          //element.centre,
          //centerFactor,
          element.shiftingPosition,
          revisedPosition,
          revisedQuaternion,
          shiftingPosition
        );*/
      // console.log(
      //   'element local3',
      //   element.localPosition,
      //   element.position,
      //   element.localQuaternion,
      //   revisedQuaternion,
      //   revisedPosition,
      //   elementLocalPosition
      // );
      let shiftablePosition = new Vector3(0, 0, 0);
      //shiftablePosition.subVectors(beginPosition, element.basePosition);
      shiftablePosition.addVectors(shiftingPosition, diffPosition);
      element.position.add(shiftablePosition);
      // console.log(
      //   'Element base position from assign position to node',
      //   diffPosition,
      //   element.basePosition,
      //   shiftingPosition,
      //   shiftablePosition
      // );
      /* console.log(
          'element.position6',
          element.name,
          element.position,
          element.localPosition,
          element.localQuaternion,
          //element.centre,
          //centerFactor,
          element.shiftingPosition,
          revisedPosition,
          revisedQuaternion,
          shiftingPosition
        );*/
      //element.position.add(originalPosition);
      element.updateMatrix();
      element.updateMatrixWorld(true);
      /* console.log(
          'element.position7',
          element,
          element.name,
          element.position,
          element.localPosition,
          element.localQuaternion,
          //element.centre,
          //centerFactor,
          element.shiftingPosition,
          revisedPosition,
          revisedQuaternion,
          shiftingPosition
        );*/
      element.localPosition = revisedPosition.clone();
      element.localQuaternion = revisedQuaternion.clone();
      //element.centre = centerFactor.clone();
      //element.localArrays.push(element.centre.clone());
      element.shiftingPosition = shiftablePosition.clone();
      //element.basePosition = beginPosition.clone();
      // console.log(
      //   'element local5',
      //   element.localPosition,
      //   element.position,
      //   element.localQuaternion,
      //   revisedQuaternion,
      //   revisedPosition
      // );
      // console.log('element', element, revisedPosition, revisedQuaternion);
    }
    // }
  };
  shiftPositionToNode = (element, diffPosition) => {
    if (element && element.geometry && element.centre) {
      //let shiftablePosition = new Vector3(0, 0, 0);
      //shiftablePosition.subVectors(shiftingPosition, element.basePosition);
      element.position.add(diffPosition);
      element.shiftingPosition.add(diffPosition);
      // console.log(
      //   'Shifting the positionnode original',
      //   element.shiftingPosition,
      //   'diff',
      //   diffPosition,
      //   'diff'
      // );

      element.updateMatrix();
      element.updateMatrixWorld();
    } else {
      console.log('No element', element);
    }
  };
  assignPositions = (byFactor, dimension) => {
    if (this.partsMeshes && this.partsMeshes.length > 0) {
      this.partsMeshes.forEach((element) => {
        //console.log('element', element, element.geometry);
        this.AssignPositionToSingleNode(element, byFactor, dimension);
        element.axisLine = null;
      });
    }
  };
  /*
   *
   * @param {THREE.Object3D} object
   * @param {Array<THREE.AnimationClip} clips
   *
   */
  setContent = async (object, clips) => {
    this.clear();
    //console.log('Cleared the contents');
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
      this.state.grid,
      this.state.transparency
    );

    if (this.props.drawAxisLines) {
      for (
        let indexLines = 0;
        indexLines < this.props.drawAxisLines.length;
        indexLines++
      ) {
        const element = this.props.drawAxisLines[indexLines];
        //console.log('Getting an element to draw axis', element);
        this.drawAxisLine(element.axis, element.position, element.name);
      }
    }
    if (this.props.showKinematicSliderMove) {
      const dimension = this.findKinematicDimension();
      this.assignPositions(0, dimension); //1 means position at centriod, 0 means position at origin
      console.log('Getting from initialization routine, setcontent');
      const parsedInfo = extractKinematicInformation(
        this.props.kinematicItemList
      );
      const parsedIndexInfo = this.getIndexedItemsFromParsedInfo(parsedInfo);
      console.log('Entering setting state');
      this.setStateWithoutError({
        //parsedKinematicInfo: parsedInfo,
        indexedKinematicParsedInfo: parsedIndexInfo,
        kinematicDimension: dimension
      });
      this.raycastObjects = this.rayCastObjectFilters(this.raycastObjects);
      console.log(
        'Completed Entering setting state and started setting setXYZBeginPosition'
      );
      const derviedDimension = this.getVectorFromDimension(dimension);
      this.animateResultKinematicList = this.cloneList(
        this.props.kinematicItemList
      );
      if (this.props.setXYZBeginPosition) {
        this.props.setXYZBeginPosition({
          X: derviedDimension.x,
          Y: derviedDimension.y,
          Z: derviedDimension.z
        });
      }
      console.log(
        'Completed Entering setXYZBeginPosition and started setting setXYZShiftPosition'
      );

      if (this.props.setXYZShiftPosition) {
        this.props.setXYZShiftPosition({
          X: derviedDimension.x,
          Y: derviedDimension.y,
          Z: derviedDimension.z
        });
      }
      console.log(
        'Completed setting setXYZShiftPosition and Started kinematic movement from initialization routine',
        dimension,
        parsedIndexInfo
      );
      const XYZShiftPosition = {
        X: derviedDimension.x,
        Y: derviedDimension.y,
        Z: derviedDimension.z
      };
      this.ApplyForwardKinematicMovement(
        null,
        parsedIndexInfo,
        XYZShiftPosition,
        dimension
      );
      console.log('Completed kinematic movement from initialization routine');
    } else {
      this.setStateWithoutError({
        //parsedKinematicInfo: [],
        indexedKinematicParsedInfo: [],
        kinematicDimension: [0, 0, 0, 0, 0, 0]
      });
      await this.loadAdditionalFeatures();
    }

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
      if (gdttableEdges.edges.length === 0) {
        let event = {};
        event['ctrlKey'] = false;
        if (Array.isArray(gdttableEdges.selectedObjects)) {
          gdttableEdges.selectedObjects.forEach(async (element) => {
            element.selectedshell = true;
            //console.log('setting selections to clear all selections');
            await this.doOneSelection(element, event, false);
          });
          if (gdttableEdges.selectedObjects.length === 0) {
            //console.log('Resetting blank selections to clear all selections');
            await this.changeStateOfSelection(null, event, false);
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
        if (
          state_gltfobj.treeLength &&
          myStateTree.length &&
          state_gltfobj.treeLength < myStateTree.length
        ) {
          myStateTree.length = state_gltfobj.treeLength;
        }

        var gltfobj = { ...state_gltfobj };
        gltfobj.tree = myStateTree;
        this.this_state_gltf = { ...gltfobj };
        console.log(
          'Resetting treelength and this_state_gltf',
          myStateTree.length,
          state_gltfobj.treeLength,
          myStateTree,
          state_gltfobj,
          this.this_state_gltf
        );
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
        if (Array.isArray(gltfobj.gdttable) === false) {
          gltfobj.gdttable = arrayCopy([defaultGDTTable]);
        }
        let gdttable = gltfobj.gdttable || [defaultGDTTable];
        const gdttableCopy = arrayCopy(gdttable);
        gltfobj.gdttable = gdttableCopy;
        //console.log("AddGDTTABLE", gltfobj.gdttable, gdttable,this.props.activeDataTable);
        console.log(
          'BEfore Changing gdtable in loading edges',
          gltfobj,
          this.props.activeDataTable
        );
        if (Array.isArray(gltfobj.gdttable) === false) {
          gltfobj.gdttable = arrayCopy([defaultGDTTable]);
        }
        while (gltfobj.gdttable.length <= this.props.activeDataTable) {
          gltfobj.gdttable.push(arrayCopy(defaultGDTTable));
        }
        if (
          Array.isArray(gltfobj.gdttable[this.props.activeDataTable].edges) ===
          false
        ) {
          gltfobj.gdttable[this.props.activeDataTable].edges = arrayCopy(
            defaultGDTTable.edges
          );
        }
        gltfobj.gdttable[this.props.activeDataTable].edges.push({
          parent: parent,
          start: start,
          finish: finish,
          name: node ? elementCopy(node.name) : null
        });
        if (
          !this.props.showKinematicMove &&
          gdttableCopy &&
          this.props.fileGDT &&
          this.props.fileUUId
        ) {
          await saveGDTInfo(
            gdttableCopy,
            this.props.fileGDT,
            this.props.fileUUId,
            this.props.showKinematicSliderMove
          );
          this.this_state_gltf = { ...gltfobj };
          console.log(
            'After Changing gdtable in loading edges',
            gltfobj,
            this.this_state_gltf
          );
        } else {
          console.log(
            'I am not Changing gdtable in loading edges',
            gltfobj,
            this.this_state_gltf
          );
        }
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
          if (pauseAnimation === 'Continue') {
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
    if (this.mixer && animationSpeed !== 0) {
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
        action.paused = pauseAnimation === 'Pause';
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
        if (actiontime !== 0) {
          this.mixer.setTime(actiontime);
        }
        //console.log(this.state.pauseAnimation);
        action.paused = this.state.pauseAnimation === 'Pause';
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
    myGrid,
    myTransparancy
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
                myCastShadow,
                myTransparancy
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
    if (myView === 'Orthographic') {
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
        this.state.grid,
        this.state.transparency
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
        this.state.grid,
        this.state.transparency
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
        this.state.grid,
        this.state.transparency
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
        this.state.grid,
        this.state.transparency
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
        this.state.grid,
        this.state.transparency
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
        gridCtrl.object.grid,
        this.state.transparency
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

            if (this.partsMeshes[i].type === "Mesh") {
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
      if (this.ListBoxes[i] === name) {
        if (this.SELECTED) {
          this.SELECTED.material.emissive.setHex(this.SELECTED.currentEmissive);
          this.SELECTED.partSelected = false;
        }
        if (this.ListValues[i] === this.partsMeshes.length) {
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
    if (this.content) {
      this.content.forEach((element) => {
        this.removeFromScreenObjects(element);
        /* if (element) {
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
        } */

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
    }
    this.removeDrawnAxisLines();
    this.removeSphere();
    this.removeDragger();
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
    //console.log('On Movuse Move', event);
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

  onMouseClick = async (event) => {
    if (this.INTERSECTED !== null) {
      //console.log("Before",this.INTERSECTED.material.color);
      this.setStateWithoutError({ lastClickedNode: { ...this.INTERSECTED } });
      //console.log("Before", this.INTERSECTED.name,this.INTERSECTED.selectedshell, event.ctrlKey );
      if (this.selectedoption === SELECTMEASURE || event.ctrlKey) {
        this.INTERSECTED.selectedshell = !this.INTERSECTED.selectedshell;
      } else {
        this.INTERSECTED.selectedshell = true;
      }
      //console.log("After", this.INTERSECTED.name,this.INTERSECTED.selectedshell, event.ctrlKey );
      this.setOriginalColor(this.INTERSECTED);
      //this.INTERSECTED.material.color.setHex(this.INTERSECTED.currentHex);
      if (
        this.INTERSECTED.type === 'Line' ||
        (this.INTERSECTED.type === 'MeshLine' &&
          this.INTERSECTED.curveCode === '') ||
        this.INTERSECTED.type === 'Sphere'
      ) {
        return;
      }

      await this.changeStateOfSelection(this.INTERSECTED, event);
      if (
        this.INTERSECTED.type === 'MeshLine' &&
        this.INTERSECTED.curveCode !== ''
      ) {
        console.log(
          'Selecte edges are',
          this.state_selectedObjects,
          'Points',
          this.INTERSECTED.geometry.points,
          'Store',
          this.INTERSECTED.curvePoints
        );
        this.state_calculatedKinematicItemChainChanged = true;
      }

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
        await this.changeStateOfSelection(this.INTERSECTED, event);
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
    //console.log('Down', event);
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
    //console.log('Up', event);
    if (this.controls) {
      this.controls.enabled = false;
      if (this.controls.onMouseUp) {
        this.controls.onMouseUp(event);
      }
    }
    this.raycast();
  };

  onKeyDown = async (event) => {
    //console.log("Onkey down",event,this.props.fileGDT,this.INTERSECTED,this.state.lastClickedNode);
    if (
      this.props.fileGDT &&
      (event.ctrlKey || event.altKey) &&
      event.key === 'b' &&
      (this.INTERSECTED !== null || this.state.lastClickedNode !== null)
    ) {
      event.preventDefault();

      console.log(
        'Reaching here to load edges',
        'Node',
        this.state.lastClickedNode,
        'intersect',
        this.INTERSECTED
      );
      await this.findSingleNode(
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
    if (first.name === second.name) return true;
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
      if (first.name === secondArray[i].name) {
        valToRet = true;
        break;
      }
    }
    return valToRet;
  };

  visibllity = (mynode, display, option, consolelog = false) => {
    if (mynode?.kinematicNode === true) {
      return display;
    }
    if (
      mynode?.type === 'Line' ||
      mynode?.type === 'MeshLine' ||
      mynode?.type === 'Sphere'
    ) {
      //console.log('Returning true', mynode);
      if (display) {
        // console.log(
        //   'Returning in display',
        //   mynode,
        //   this.state.showedges ||
        //     option === SELECTEDGE ||
        //     option === SELECTLINEAR ||
        //     option === SELECTCIRCULAR
        // );
        return (
          this.state.showedges ||
          option === SELECTEDGE ||
          option === SELECTLINEAR ||
          option === SELECTCIRCULAR
        );
      }
    }

    const first4chars = mynode?.name?.slice(0, 4);
    const curvechar = mynode?.name?.slice(4, 5);
    const first6chars = mynode?.name?.slice(0, 6);
    var visible = option === SELECTMEASURE || option === SELECTFEATURE;
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
    //console.log(this.partsMeshes[i].name,data.name,(this.partsMeshes[i].name===data.name))
    if (
      first4chars !== 'PART' &&
      first4chars !== 'AXIS' &&
      first4chars !== 'ENDE' &&
      first4chars !== 'BEGI'
    ) {
      if (first4chars === 'FACE') {
        if (display) {
          visible =
            visible ||
            option === SELECTFACE ||
            option === SELECTEDGE ||
            option === SELECTCORNER ||
            (option === SELECTLINEAR &&
              (curvechar === 'L' || curvechar === 'C' || curvechar === 'N')) ||
            (option === SELECTCIRCULAR &&
              (curvechar === 'C' || curvechar === 'N'));
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
            option === SELECTFACE ||
            (option === SELECTLINEAR &&
              (curvechar === 'L' || curvechar === 'C' || curvechar === 'N')) ||
            (option === SELECTCIRCULAR &&
              (curvechar === 'C' || curvechar === 'N')); //||
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
          //((this.props.selectedoption === SELECTLINEAR) && (curvechar==="L")) ||
          //(this.props.selectedoption === SELECTCIRCULAR &&
          //(curvechar === 'C' || curvechar === 'N'));
        }
      } else if (first4chars === 'EDGE') {
        if (display) {
          //console.log("What i got in side display",this.props.selectedoption, SELECTLINEAR,curvechar);
          visible =
            visible ||
            option === SELECTEDGE ||
            option === SELECTCORNER ||
            (option === SELECTLINEAR &&
              (curvechar === 'L' || curvechar === 'C' || curvechar === 'N')) ||
            (option === SELECTCIRCULAR &&
              (curvechar === 'C' || curvechar === 'E'));
        } else {
          //console.log("What i got in side intersection",this.props.selectedoption, SELECTLINEAR,curvechar);
          visible =
            visible ||
            option === SELECTEDGE ||
            (option === SELECTLINEAR &&
              (curvechar === 'L' || curvechar === 'C' || curvechar === 'N')) ||
            (option === SELECTCIRCULAR &&
              (curvechar === 'C' || curvechar === 'E'));
        }
      } else if (first6chars === 'VERTEX') {
        if (display) {
          visible = visible || option === SELECTCORNER;
        } else {
          visible = visible || option === SELECTCORNER;
        }
      }
    } else {
      if (display) {
        visible = true;
      } else {
        if (option === SELECTFACE) {
          visible = !mynode.facesLoaded;
        } else if (option === SELECTEDGE) {
          visible = !mynode.edgesLoaded;
        } else if (option === SELECTCORNER) {
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
        if (first4chars === "EDGE") {
            visible = (this.props.selectedoption === SELECTEDGE) || ((this.props.selectedoption === SELECTCORNER) && (display))
                || (this.props.selectedoption === SELECTMEASURE) || (this.props.selectedoption === SELECTFEATURE) 
                || (this.props.selectedoption===SELECTLOADEDGES);
        } else {
            if (first6chars === "VERTEX") {
                visible = (this.props.selectedoption === SELECTCORNER)
                    || (this.props.selectedoption === SELECTMEASURE) || (this.props.selectedoption === SELECTFEATURE);
            } else {
                visible = ((this.props.selectedoption !== SELECTEDGE) && (this.props.selectedoption !== SELECTCORNER))
                    || (this.props.selectedoption === SELECTMEASURE) || (this.props.selectedoption === SELECTFEATURE);
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

    if (intersects.length === 0) {
      this.resetSelection();
    } else {
      //console.log(intersects);
      var myObject = intersects.length;
      for (var i = 0; i < intersects.length; i++) {
        //console.log("First",intersects[ i ].object);
        if (
          intersects[i].object.type === 'Line' ||
          intersects[i].object.type === 'MeshLine' ||
          intersects[i].object.type === 'Sphere'
        ) {
          myObject = i;
          //console.log("I found a face",intersects[i].object.name);
          break;
        }
        if (intersects[i].object.type === 'Mesh') {
          //console.log("name found",intersects[ i ].object.name);
          if (!this.onlyparts(intersects[i].object.name)) {
            myObject = i;
            //console.log("I found a face",intersects[i].object.name);
            break;
          }
        }
      }
      /*
            if (myObject === intersects.length) {
                for (var i = 0; i < intersects.length; i++) {
                    //console.log("First",intersects[ i ].object);
                   
                    if (intersects[i].object.type === "Mesh" ) {
                        //console.log("name found",intersects[ i ].object.name);
                        
                            myObject = i;
                            //console.log("I found a face",intersects[i].object.name);
                            break;
                        
                       
                    }
                }
            }; */
      //console.log("Got",myObject);
      if (myObject === intersects.length) {
        //console.log("Entered here");
        for (var i = 0; i < intersects.length; i++) {
          //console.log("Second",intersects[ i ].object);
          if (
            intersects[i].object.type === 'Mesh' ||
            intersects[i].object.type === 'Line' ||
            intersects[i].object.type === 'MeshLine' ||
            intersects[i].object.type === 'Sphere'
          ) {
            //console.log(intersects[ i ].object);
            myObject = i;
            break;
          }
        }
      }
      if (myObject !== intersects.length) {
        if (this.INTERSECTED !== intersects[myObject].object) {
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
          /* if (this.selectedoption === SELECTASSEMBLY) {
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

  alter = async (myGltfJson) => {
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
    if (this.gltfJSON !== null) {
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

      const onload = async (gltf) => {
        this.object = gltf.scene || gltf.scenes[0];
        this.clips = gltf.animations || [];
        //console.log('gltf', gltf, 'Objects', this.object, 'Clips', this.clips);
        await this.setContent(this.object, this.clips);
        this.alterEntered = false;
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

    const myStateTree = state_gltfobj
      ? state_gltfobj.tree
        ? state_gltfobj.tree
        : []
      : [];
    myStateTree.forEach((element) => {
      if (element[gltf_Dict['parentId']] === myId) {
        if (element[gltf_Dict['leaf']]) {
          if (element[gltf_Dict['name']]) {
            //console.log('Coming from hre 3');
            const mymesh = this.findMyMaterial(element, false);
            if (mymesh) {
              if (whatchanged === SELECTCOLOR) {
                //console.log(this.partsMeshes[element.binId-1]);
                //const mymaterial = this.partsMeshes[element.binId-1].material;

                //console.log(mymesh);
                const mymaterial = mymesh.material;
                if (mymaterial) {
                  mymaterial.color = myColor;
                }
              }
              if (whatchanged === SELECTTEXTURE) {
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
              if (whatchanged === SELECTMETAL) {
                //console.log(this.partsMeshes[element.binId-1]);
                //const mymaterial = this.partsMeshes[element.binId-1].material;
                const mymaterial = mymesh.material;
                if (mymaterial) {
                  mymaterial[gltf_Dict['metallicFactor']] = myMetal;
                  mymaterial.metalness = myMetal;
                }
              }
              if (whatchanged === SELECTROUGH) {
                //console.log(this.partsMeshes[element.binId-1]);
                //const mymaterial = this.partsMeshes[element.binId-1].material;
                const mymaterial = mymesh.material;
                if (mymaterial) {
                  mymaterial[gltf_Dict['roughnessFactor']] = myRough;
                  mymaterial.roughness = myRough;
                }
              }
              if (whatchanged === SELECTOPAQUE) {
                //console.log(this.partsMeshes[element.binId-1]);
                //const mymaterial = this.partsMeshes[element.binId-1].material;
                const mymaterial = mymesh.material;
                if (mymaterial) {
                  mymaterial.transparent = myOpaque !== 1;
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
      first4chars === 'PART' ||
      first4chars === 'EDGE' ||
      first6chars === 'VERTEX'
    ) {
      return false;
    }
    return true;
  };

  onlyparts = (name) => {
    const first4chars = name.slice(0, 4);
    return first4chars === 'PART';
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
                if(!data || data.begin!==data.end) {
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
    //console.log(this.props, this.props.fileGDT, addToGDTTable);
    if (this.props.fileGDT && addToGDTTable && clickKey !== null) {
      var myParentID = -1;
      var findEdges = 0;
      //const myStateTree = state.gltfobj.tree || this.props.gltfobj.tree;
      const state_gltfobj = this.this_state_gltf || this.props.gltfobj;

      const myStateTree = state_gltfobj
        ? state_gltfobj.tree
          ? state_gltfobj.tree
          : []
        : [];
      //console.log('State tree', myStateTree, this.props.gltfobj);
      for (var i = 0; i < myStateTree.length; i++) {
        if (myStateTree[i][gltf_Dict['name']] === mynode.name) {
          myParentID = myStateTree[i][gltf_Dict['id']];
          //myParentID = this.props.gltfobj.tree[i][gltf_Dict["parentId"]];
          findEdges = myStateTree[i][gltf_Dict['subfeatures']];
          if (!findEdges || findEdges === 'f') {
            const myParentPart = this.findMyParentPart(mynode);
            if (myParentPart) {
              myParentID = myParentPart[gltf_Dict['id']];
            } else {
              if (myStateTree[i][gltf_Dict['element']] === 'F') {
                myParentID = myStateTree[i][gltf_Dict['parentId']];
                console.log('Find Parent Edges', myStateTree[i]);
              } else {
                console.log('Find Not Parent Edges', myStateTree[i]);
              }
            }
          } else {
            console.log('Find Edges', myStateTree[i]);
          }
          break;
        }
      }
      if (myParentID === -1) {
        //alert("Unable to find a parent for this!");
        console.log(
          'Unable to find a parent for this!',
          mynode,
          myStateTree,
          this.this_state_gltf,
          this.props.gltfobj
        );
      }
      console.log('My ID', myParentID, findEdges);
      if (myParentID !== -1) {
        let featureSetStart = 0;
        if (!findEdges) {
          for (var i = 0; i < myStateTree.length; i++) {
            if (myStateTree[i][gltf_Dict['parentId']] === myParentID) {
              findEdges = myStateTree[i][gltf_Dict['subfeatures']];
              if (findEdges === 'v') {
                featureSetStart = 3;
                break;
              }
            }
          }
        }
        if (!findEdges || findEdges !== 'v') {
          for (var i = 0; i < myStateTree.length; i++) {
            if (myStateTree[i][gltf_Dict['parentId']] === myParentID) {
              findEdges = myStateTree[i][gltf_Dict['subfeatures']];
              if (findEdges === 'e') {
                featureSetStart = 2;
                break;
              }
            }
          }
        }
        // if (findEdges === 'e') {
        //   featureSetStart = 2;
        // }
        if (!findEdges || (findEdges !== 'e' && findEdges !== 'v')) {
          for (var i = 0; i < myStateTree.length; i++) {
            if (myStateTree[i][gltf_Dict['parentId']] === myParentID) {
              findEdges = myStateTree[i][gltf_Dict['subfeatures']];
              if (findEdges === 'f') {
                //findEdges = 'e';
                featureSetStart = 1;
                //console.log("Finds already edges",i,this.props.gltfobj.tree[i],this.props.gltfobj.tree[i][gltf_Dict["parentId"]],myParentID,this.props.gltfobj.tree[i][gltf_Dict["subfeatures"]]);
                break;
              }
            }
          }
        }
        if (findEdges === 'v') {
          featureSetStart = 3;
        }
        if (findEdges === 'e') {
          featureSetStart = 2;
        }
        if (findEdges === 'f') {
          featureSetStart = 1;
        }
        // if (findEdges !== 'f' && findEdges !== 'e' && findEdges !== 'v') {
        //   for (var i = 0; i < myStateTree.length; i++) {
        //     if (myStateTree[i][gltf_Dict['parentId']] === myParentID) {
        //       if (myStateTree[i][gltf_Dict['subfeatures']] === 'f') {
        //         findEdges = 'f';
        //         featureSetStart = 1;
        //         //console.log("Finds already edges",i,this.props.gltfobj.tree[i],this.props.gltfobj.tree[i][gltf_Dict["parentId"]],myParentID,this.props.gltfobj.tree[i][gltf_Dict["subfeatures"]]);
        //         break;
        //       }
        //     }
        //   }
        // }
        console.log(
          'Load Features bef',
          findEdges,
          !findEdges,
          featureSetStart
        );
        if (
          !findEdges ||
          (findEdges !== 'f' && findEdges !== 'e' && findEdges !== 'v')
        ) {
          featureSetStart = 0;
        }

        let featureSetFinish = 3;
        if (this.selectedoption === SELECTFACE || clickKey.ctrlKey) {
          featureSetFinish = 1;
        } else if (this.selectedoption === SELECTEDGE || clickKey.altKey) {
          featureSetFinish = 2;
        } else if (
          this.selectedoption === SELECTASSEMBLY ||
          this.selectedoption === SELECTSOLID
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
            selectHere = first4chars !== 'PART';
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
                        if(!data || data.begin!==data.end) {
                            console.log(data);
                            alert("Edges are still under construction. Please try after sometime");
                        } else {
                            let howManyFiles = data.files?data.files[myParentID]:1;
                            if(howManyFiles===0) {
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
      console.log('Unable to find a GDT for this!');
    }
    return { node: [mynode], select: selectHere };
  };

  findMyParentPart = (mynode) => {
    var myParentID = -1;
    //const myStateTree = state.gltfobj.tree || this.props.gltfobj.tree;
    const state_gltfobj = this.this_state_gltf || this.props.gltfobj;

    const myStateTree = state_gltfobj
      ? state_gltfobj.tree
        ? state_gltfobj.tree
        : []
      : [];
    for (var i = 0; i < myStateTree.length; i++) {
      if (myStateTree[i][gltf_Dict['name']] === mynode.name) {
        myParentID = myStateTree[i][gltf_Dict['parentId']];
        if (myStateTree[i][gltf_Dict['element']] === 'P') {
          return myStateTree[i];
        } else {
          break;
        }
      }
    }

    if (myParentID === -1) {
      return null;
    } else {
      var myParentsParentID = -1;
      for (var i = 0; i < myStateTree.length; i++) {
        if (myStateTree[i][gltf_Dict['id']] === myParentID) {
          myParentsParentID = myStateTree[i][gltf_Dict['parentId']];
          if (myStateTree[i][gltf_Dict['element']] === 'P') {
            return myStateTree[i];
          } else {
            break;
          }
        }
      }
      //console.log("Parent", myParentsParentID, myParentID, mynode);
      if (myParentsParentID === -1) {
        //RootNode
        //console.log("Pushing", myParentsParentID, myParentID, myID);
        return null;
      } else {
        for (var i = 0; i < myStateTree.length; i++) {
          if (myStateTree[i][gltf_Dict['id']] === myParentsParentID) {
            if (myStateTree[i][gltf_Dict['element']] === 'P') {
              return myStateTree[i];
            }
          }
        }
      }
      return null;
    }
  };

  findSiblingNodes = (mynode, addToGDTTable = true) => {
    //console.log(this.props.selectedoption,SELECTSOLID,this.props.selectedoption !== SELECTSOLID);
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
            if (this.props.gltfobj.tree[i][gltf_Dict["name"]] === mynode.name) {
                myParentID = this.props.gltfobj.tree[i][gltf_Dict["parentId"]];
                break;
            }
        } 
        var myMaterials = [];
        if (myParentID !== -1) {
            for (var i = 0; i < this.props.gltfobj.tree.length; i++) {
                if (this.props.gltfobj.tree[i][gltf_Dict["parentId"]] === myParentID) {
                    var myChild = this.findMyMaterial(this.props.gltfobj.tree[i]);
                    if (myChild) {
                        if ((this.props.gltfobj.tree[i][gltf_Dict["element"]]==="F") ||
                             (this.onlyfaces(myChild.name)) ) {
                            myMaterials.push(myChild);
                        }
                    }
                }
            }
        }
        */
    if (myMaterials.length !== 0) {
      return myMaterials;
    }
    return [mynode];
  };

  findMyMaterial = (data, byname = true) => {
    //console.log(this.partsMeshes);
    if (this.partsMeshes) {
      for (var i = 0; i < this.partsMeshes.length; i++) {
        //console.log(this.partsMeshes[i].name,data.name,(this.partsMeshes[i].name===data.name))

        if (byname) {
          if (this.partsMeshes[i].name === data.name) {
            return this.partsMeshes[i];
          }
        } else {
          if (this.partsMeshes[i].name === data[gltf_Dict['name']]) {
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
    const myStateTree = state_gltfobj
      ? state_gltfobj.tree
        ? state_gltfobj.tree
        : []
      : [];
    const getTopParentNode = (node) => {
      let nodeParentID = node[gltf_Dict['parentId']];
      if (nodeParentID === null || nodeParentID === 1) {
        return node;
      } else {
        if (myStateTree) {
          for (var i = 0; i < myStateTree.length; i++) {
            if (myStateTree[i][gltf_Dict['id']] === nodeParentID) {
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
      if (node[gltf_Dict['element']] === 'P') {
        childNodes = [node];
      }
      if (myStateTree) {
        for (var i = 0; i < myStateTree.length; i++) {
          const curNode = myStateTree[i];
          if (curNode[gltf_Dict['parentId']] === nodeID) {
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
        if (myStateTree[i][gltf_Dict['name']] === mynode['name']) {
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
    if (myParentID !== -1) {
      if (myParentID !== 1) {
        var myParentsParentID = -1;
        if (myStateTree) {
          for (var i = 0; i < myStateTree.length; i++) {
            if (myStateTree[i][gltf_Dict['id']] === myParentID) {
              myParentsParentID = myStateTree[i][gltf_Dict['parentId']];
              if (myParentsParentID !== 1) {
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
        myTopParent[gltf_Dict['id']] !== 1 &&
        myTopParent[gltf_Dict['parentId']] !== 1
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
      if (myParentID === 1) {
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
      if (myParents.length !== 0) {
        var myMaterials = [];
        myParents.forEach((elementNode) => {
          var myChild = this.findMyMaterial(elementNode, false);
          if (myChild) {
            myMaterials.push(myChild);
          }
        });
        if (myMaterials.length !== 0) {
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
      if (myStateTree[i][gltf_Dict['name']] === mynode.name) {
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
    if (myParentID !== -1) {
      var myParentsParentID = -1;
      for (var i = 0; i < myStateTree.length; i++) {
        if (myStateTree[i][gltf_Dict['id']] === myParentID) {
          myParentsParentID = myStateTree[i][gltf_Dict['parentId']];
          break;
        }
      }
      //console.log("Parent", myParentsParentID, myParentID, myID);
      var myParents = [];
      if (myParentID === 1) {
        myParents.push(myID);
      } else {
        if (myParentsParentID === -1 || myParentsParentID === 1) {
          //RootNode
          //console.log("Pushing", myParentsParentID, myParentID, myID);
          myParents.push(myParentID);
        } else {
          for (var i = 0; i < myStateTree.length; i++) {
            if (myStateTree[i][gltf_Dict['parentId']] === myParentsParentID) {
              myParents.push(myStateTree[i][gltf_Dict['id']]);
            }
          }
        }
      }

      //console.log("MyParents",myParents);
      for (var j = 0; j < myParents.length; j++) {
        myParentID = myParents[j];
        for (var i = 0; i < myStateTree.length; i++) {
          if (myStateTree[i][gltf_Dict['id']] === myParentID) {
            //console.log('Coming from hre 1');
            var myChild = this.findMyMaterial(myStateTree[i], false);
            if (myChild) {
              if (
                myStateTree[i][gltf_Dict['element']] === 'P' ||
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
    if (myMaterials.length !== 0) {
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
    const myStateTree = state_gltfobj
      ? state_gltfobj.tree
        ? state_gltfobj.tree
        : []
      : [];
    const getTopParentNode = (node) => {
      let nodeParentID = node[gltf_Dict['parentId']];
      if (nodeParentID === null || nodeParentID === 1) {
        return node;
      } else {
        if (myStateTree) {
          for (var i = 0; i < myStateTree.length; i++) {
            if (myStateTree[i][gltf_Dict['id']] === nodeParentID) {
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
        if (myStateTree[i][gltf_Dict['name']] === mynode[['name']]) {
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
    if (myParentID !== -1) {
      if (myParentID !== 1) {
        var myParentsParentID = -1;
        if (myStateTree) {
          for (var i = 0; i < myStateTree.length; i++) {
            if (myStateTree[i][gltf_Dict['id']] === myParentID) {
              myParentsParentID = myStateTree[i][gltf_Dict['parentId']];
              if (myParentsParentID !== 1) {
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
        myTopParent[gltf_Dict['id']] !== 1 &&
        myTopParent[gltf_Dict['parentId']] !== 1
      ) {
        myTopParent = getTopParentNode(myTopParent);
      }
      // console.log(
      //   'GOt parentnode for selctions2',
      //   myParentPart,
      //   myParentID,
      //   myTopParent
      // );

      if (myParentID === 1 || !myTopParent) {
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
            this.props.selectedoption !== SELECTSOLID,this.props.selectedoption,SELECTASSEMBLY,
            this.props.splitmethod,SELECTDISECTPARTS); 
        */
    if (
      (this.selectedoption !== SELECTSOLID &&
        this.selectedoption !== SELECTASSEMBLY) ||
      this.props.splitmethod !== SELECTDISECTPARTS
    ) {
      //console.log("I am finding single node");
      return await this.findSingleNode(mynode, addToGDTTable);
    }
    if (this.selectedoption === SELECTASSEMBLY) {
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
      this.databackcolor !== this.props.backcolor &&
      this.props.dataselection === SELECTBACKCOLOR
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
      this.dataselectcolor !== this.props.selectcolor &&
      this.props.dataselection === SELECTSELECTCOLOR
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
      this.datatouchcolor !== this.props.touchcolor &&
      this.props.dataselection === SELECTTOUCHCOLOR
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
      this.data2texture !== this.props.data2texture &&
      this.props.dataselection === SELECT2DTEXTURE
    ) {
      this.data2texture = this.props.data2texture;
      var myTexture = null;
      if (this.scene) {
        if (this.data2texture === 'None' || this.data2texture === null) {
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
      this.data3texture !== this.props.data3texture &&
      this.props.dataselection === SELECT3DTEXTURE
    ) {
      this.data3texture = this.props.data3texture;
      var myTexture = null;
      if (this.scene) {
        if (this.data3texture === 'None' || this.data3texture === null) {
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
    if (this.databackcolor !== this.props.backcolor) {
      this.databackcolor = this.props.backcolor;
      console.log('Backcolor change', this.databackcolor);
      if (this.renderer) {
        if (this.scene) {
          this.scene.background = null;
        }
        this.renderer.setClearColor(this.databackcolor || DEFAULTBACKCOLOR());
      }
    }
    if (this.dataselectcolor !== this.props.selectcolor) {
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
    if (this.datatouchcolor !== this.props.touchcolor) {
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
      meshmaterial.material.opacity = 1.0 - this.state.transparency;
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
      meshmaterial.material.opacity = 1.0 - this.state.transparency;
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
    if (meshmaterial && this.selectedoption === SELECTMEASURE) {
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
        if (this.firstshell && this.firstshell.name === meshmaterial.name) {
          this.setOriginalColor(this.firstshell);
          //this.firstshell.material.color.setHex(this.firstshell.currentHex);
          this.firstshell.selectedshell = false;
          this.firstshell = this.secondshell;
          this.secondshell = null;
          //console.log("First and second making null",this.firstshell,this.secondshell)
        } else {
          if (this.secondshell && this.secondshell.name === meshmaterial.name) {
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
            if (meshmaterial.name !== elementobject.name) {
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
          myAllChilds.select === false &&
          this.selectedoption !== SELECTFEATURE &&
          this.selectedoption !== SELECTASSEMBLY &&
          this.selectedoption !== SELECTSOLID
        ) {
          meshmaterial.selectedshell = myAllChilds.select;
          this.setOriginalColor(meshmaterial);
          //meshmaterial.material.color.setHex(meshmaterial.currentHex);
          this.state_selectedObjects.forEach((elementobject) => {
            if (meshmaterial.name === elementobject.name) {
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
                if (element.name === this.state_selectedObjects[i].name) {
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
        aShape === 'FACE' ||
        aShape === 'EDGE' ||
        aShape === 'PART' ||
        aShape === 'VERTEX'
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

  changeparts = async () => {
    const changedata = this.props.changedata;
    this.changedctrlkey = this.props.ctrlKey;
    /* console.log(
      this.props.whatchanged,
      this.whatchanged,
      JSON.stringify(changedata),
      JSON.stringify(this.changeddataarray)
    ); */
    if (
      (this.props.whatchanged === SELECTANITEM &&
        stringify(changedata || {}) !==
          stringify(this.changeddataarray || {})) ||
      this.props.whatchanged !== this.whatchanged ||
      (changedata ? changedata[gltf_Dict['name']] : '') !== this.activeId ||
      (this.props.whatchanged === SELECTCOLOR &&
        (this[gltf_Dict['R']] !== changedata[gltf_Dict['R']] ||
          this[gltf_Dict['G']] !== changedata[gltf_Dict['G']] ||
          this[gltf_Dict['B']] !== changedata[gltf_Dict['B']])) ||
      (this.props.whatchanged === SELECTTEXTURE &&
        changedata[gltf_Dict['texture']] &&
        this[gltf_Dict['texture']] !== changedata[gltf_Dict['texture']].name) ||
      (this.props.whatchanged === SELECTMETAL &&
        this.datametal !== changedata[gltf_Dict['metallicFactor']]) ||
      (this.props.whatchanged === SELECTROUGH &&
        this.datarough !== changedata[gltf_Dict['roughnessFactor']]) ||
      (this.props.whatchanged === SELECTOPAQUE &&
        this.dataopaque !== changedata[gltf_Dict['A']])
      /* ||
            ((this.props.whatchanged === SELECTDISTANCE) &&
                (this.selectedshell !== changedata)) */
    ) {
      //console.log("BEFore",changedata,this.whatchanged,this.props.whatchanged,this.changeddataarray,this.changedctrlkey,this.props.ctrlKey);
      this.whatchanged = this.props.whatchanged;
      this.changeddataarray = changedata;
      this.changedctrlkey = this.props.ctrlKey;
      this.activeId = changedata ? changedata[gltf_Dict['name']] : '';
      //console.log("AFTer",changedata,this.whatchanged,this.props.whatchanged,this.changeddataarray,this.changedctrlkey,this.props.ctrlKey);

      if (this.props.whatchanged === SELECTCOLOR) {
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
        this.props.whatchanged === SELECTTEXTURE &&
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
                if (this[gltf_Dict['texture']] === 'None') {
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
          if (this[gltf_Dict['texture']] === 'None') {
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
      if (this.props.whatchanged === SELECTMETAL) {
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
      if (this.props.whatchanged === SELECTROUGH) {
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
      if (this.props.whatchanged === SELECTOPAQUE) {
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
                mymaterial.transparent = changedata[gltf_Dict['A']] !== 1;
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
      if (this.props.whatchanged === SELECTANITEM) {
        //console.log("Ok Here?",changedata);
        let event = {};
        event['ctrlKey'] = this.changedctrlkey;
        if (changedata.length === 0) {
          await this.changeStateOfSelection(null, event);
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
                        if( (first4chars==="FACE") || (first4chars==="EDGE") || 
                        (first4chars==="PART") || (first6chars==="VERTEX") ) {               
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
  getSequencedItem = (parsedItem, getSequence, getChain = 1) => {
    let kinematicInformation, maxChain, maxSequence;
    [kinematicInformation, maxChain, maxSequence] = parsedItem;
    // console.log(
    //   'Parsed Item',
    //   parsedItem,
    //   'Kinematic Information',
    //   kinematicInformation,
    //   'maxChain',
    //   maxChain,
    //   'maxSequence',
    //   maxSequence
    // );
    const lengthOfKinematicInfo = kinematicInformation.length;
    for (
      var kinematicInfo = 0, _pj_a = lengthOfKinematicInfo;
      kinematicInfo < _pj_a;
      kinematicInfo += 1
    ) {
      let partName,
        displayName,
        partType,
        sequence,
        chains,
        axis,
        nextAxis,
        axisAngle,
        axisDistance,
        angle,
        distance,
        machineLimit,
        isLinear,
        isEndEffector,
        position,
        axisPosition;
      [
        partName,
        displayName,
        partType,
        sequence,
        chains,
        axis,
        nextAxis,
        axisAngle,
        axisDistance,
        angle,
        distance,
        machineLimit,
        isLinear,
        isEndEffector,
        position,
        axisPosition
      ] = kinematicInformation[kinematicInfo];
      if (chains.includes(getChain) && sequence === getSequence) {
        return kinematicInformation[kinematicInfo];
      }
    }
    return null;
  };
  getSequencedItemIndex = (parsedItem, getSequence, getChain = 1) => {
    let kinematicInformation, maxChain, maxSequence;
    [kinematicInformation, maxChain, maxSequence] = parsedItem;
    const lengthOfKinematicInfo = kinematicInformation.length;
    for (
      var kinematicInfo = 0, _pj_a = lengthOfKinematicInfo;
      kinematicInfo < _pj_a;
      kinematicInfo += 1
    ) {
      let [
        partName,
        displayName,
        partType,
        sequence,
        chains,
        axis,
        nextAxis,
        axisAngle,
        axisDistance,
        angle,
        distance,
        machineLimit,
        isLinear,
        isEndEffector,
        position,
        axisPosition
      ] = kinematicInformation[kinematicInfo];
      if (chains.includes(getChain) && sequence === getSequence) {
        return [kinematicInfo, kinematicInformation[kinematicInfo]];
      }
    }
    return [-1, null];
  };
  getKinematicItem = (kinematicItemList, kinematicInformation) => {
    let partName,
      displayName,
      partType,
      sequence,
      chains,
      axis,
      nextAxis,
      axisAngle,
      axisDistance,
      angle,
      distance,
      machineLimit,
      isLinear,
      isEndEffector,
      position,
      axisPosition;
    [
      partName,
      displayName,
      partType,
      sequence,
      chains,
      axis,
      nextAxis,
      axisAngle,
      axisDistance,
      angle,
      distance,
      machineLimit,
      isLinear,
      isEndEffector,
      position,
      axisPosition
    ] = kinematicInformation;
    //console.log('Info', kinematicInformation, 'partname', partName);
    const uniqueName = partName ? this.findUniqueName(partName, 'PART') : null;
    if (uniqueName) {
      for (let index = 0; index < kinematicItemList.length; index++) {
        const element = kinematicItemList[index];
        const thisUniqueName = element
          ? element.filePartName
            ? this.findUniqueName(element.filePartName, 'PART')
            : null
          : null;
        if (thisUniqueName === uniqueName) {
          return element;
        }
      }
    }
    return null;
  };
  getKinematicIndex = (kinematicItemList, kinematicInformation) => {
    let partName,
      displayName,
      partType,
      sequence,
      chains,
      axis,
      nextAxis,
      axisAngle,
      axisDistance,
      angle,
      distance,
      machineLimit,
      isLinear,
      isEndEffector,
      position,
      axisPosition;
    [
      partName,
      displayName,
      partType,
      sequence,
      chains,
      axis,
      nextAxis,
      axisAngle,
      axisDistance,
      angle,
      distance,
      machineLimit,
      isLinear,
      isEndEffector,
      position,
      axisPosition
    ] = kinematicInformation;

    const uniqueName = partName ? this.findUniqueName(partName, 'PART') : null;
    if (uniqueName) {
      for (let index = 0; index < kinematicItemList.length; index++) {
        const element = kinematicItemList[index];
        const thisUniqueName = element
          ? element.filePartName
            ? this.findUniqueName(element.filePartName, 'PART')
            : null
          : null;
        if (thisUniqueName === uniqueName) {
          return index;
        }
      }
    }
    return -1;
  };
  getPrevPropsItem = (prevProps, kinematicItem) => {
    for (let index = 0; index < prevProps.kinematicItemList.length; index++) {
      const element = prevProps.kinematicItemList[index];
      this.findUniqueName(kinematicItem.filePartName, 'PART');
      if (element.filePartName === kinematicItem.filePartName) {
        return element;
      }
    }
    return null;
  };
  findUniqueName = (fromName, fromIndex) => {
    const lastI0 = fromName ? fromName.lastIndexOf('I0') : -1;
    if (lastI0 === -1) {
      console.log('FromName does not contain I0', fromName);
      return null;
    }
    if (fromName.substring(0, fromIndex.length) === fromIndex) {
      return fromName.substring(fromIndex.length, lastI0);
    }
    //console.log('From Name length is not greater', fromName, fromIndex);
    return fromName.substring(0, lastI0);
  };
  findNodeFrom = (kinematicItem) => {
    const uniqueName = kinematicItem.filePartName
      ? this.findUniqueName(kinematicItem.filePartName, 'PART')
      : null; // Index is changed because we are only getting parts and not faces or edges..
    if (uniqueName) {
      for (let index = 0; index < this.partsMeshes.length; index++) {
        const element = this.partsMeshes[index];
        if (element && element.name) {
          let thisName = this.findUniqueName(element.name, 'PART'); // "PART" is the beginning of the name.
          // console.log(
          //   thisName,
          //   uniqueName,
          //   kinematicItem.filePartName,
          //   element.name
          // );
          if (thisName === uniqueName) {
            return element;
          }
        } else {
          /* console.log(
            'No name or element is null in the loop',
            element,
            uniqueName,
            kinematicItem
          ); */
        }
      }
    }
    /* console.log(
      'No name or element is null outside',

      kinematicItem.filePartName,
      kinematicItem
    ); */
    return null;
  };
  findNodeIndexFrom = (kinematicItem) => {
    const uniqueName = kinematicItem.filePartName
      ? this.findUniqueName(kinematicItem.filePartName, 'PART')
      : null;
    if (uniqueName) {
      for (let index = 0; index < this.partsMeshes.length; index++) {
        const element = this.partsMeshes[index];
        if (element && element.name) {
          let thisName = this.findUniqueName(element.name, 'PART');
          if (thisName === uniqueName) {
            return index;
          }
        } else {
        }
      }
    }
    return -1;
  };
  drawAxisLineToKinematic = (propsElement) => {
    if (
      propsElement &&
      propsElement.actuator_motion_control &&
      propsElement.actuator_motion_control.cylindrical_axis_of_rotation
    ) {
      const axis =
        propsElement.actuator_motion_control.cylindrical_axis_of_rotation.axis;
      if (axis) {
        const position =
          propsElement.actuator_motion_control.cylindrical_axis_of_rotation
            .position !== undefined
            ? propsElement.actuator_motion_control.cylindrical_axis_of_rotation
                .position
            : [0, 0, 0];
        return this.drawAxisLine(axis, position, propsElement.name);
      }
    }
    return null;
  };
  getMyTreeNode = (mynode) => {
    const state_gltfobj = this.this_state_gltf || this.props.gltfobj;

    const myStateTree = state_gltfobj
      ? state_gltfobj.tree
        ? state_gltfobj.tree
        : []
      : [];
    //console.log('State tree', myStateTree, this.props.gltfobj);
    for (var i = 0; i < myStateTree.length; i++) {
      if (myStateTree[i][gltf_Dict['name']] === mynode.name) {
        return myStateTree[i];
      }
    }
    return null;
  };

  animateKinematicChain_withoutIndex = (
    //differenceElement,
    propsElement,
    //currentNode,
    //nextNode,
    //prevProps,
    sequence,
    parsedInfo,
    localQuaternion,
    localPosition,
    //originaPosition,
    shiftingPosition
  ) => {
    if (
      propsElement.actuator_motion_control &&
      propsElement.actuator_motion_control.cylindrical_axis_of_rotation
    ) {
      let axis =
        propsElement.actuator_motion_control.cylindrical_axis_of_rotation.axis;
      //console.log('Got axis as ', axis, currentNode);
      //axis = [0, 0, 1];
      if (axis) {
        /* let axisline = this.drawAxisLine(
          propsElement.actuator_motion_control.cylindrical_axis_of_rotation
            .axis,
          propsElement.actuator_motion_control.cylindrical_axis_of_rotation
            .position,
          propsElement.name
        ); */
        // const nextNodeTree = this.getMyTreeNode(nextNode);
        // let meshCentroid = nextNodeTree
        //   ? nextNodeTree[gltf_Dict['topLeft']]
        //     ? nextNodeTree[gltf_Dict['topLeft']]
        //     : [0, 0, 0]
        //   : [0, 0, 0];
        // //meshCentroid = [0, 0, 0];
        // let geometryCentroid = nextNode.centroid
        //   ? nextNode.centroid.clone()
        //   : new Vector3(-meshCentroid[0], -meshCentroid[1], -meshCentroid[2]);

        // geometryCentroid.multiplyScalar(1.0);

        //console.log('Mesh Centroid', meshCentroid, geometryCentroid, nextNode);
        for (
          let index = sequence + 1;
          index < this.props.kinematicItemList.length;
          index++
        ) {
          const sequencedElement = this.getSequencedItem(
            parsedInfo,
            index + 1,
            1
          );

          const element = sequencedElement
            ? this.getKinematicItem(
                this.props.kinematicItemList,
                sequencedElement
              )
            : this.props.kinematicItemList[index];
          //const element = this.props.kinematicItemList[index];
          if (
            element &&
            element.actuator_motion_control &&
            ((!sequencedElement &&
              element.actuator_motion_control.axis_number >
                propsElement.actuator_motion_control.axis_number) ||
              sequencedElement)
          ) {
            let node = this.findNodeFrom(element);
            if (node) {
              //console.log('Found node for', element, node);
              if (
                propsElement.actuator_motion_control
                  .cylindrical_axis_of_rotation
              ) {
                if (axis) {
                  // const position =
                  //   propsElement.actuator_motion_control
                  //     .cylindrical_axis_of_rotation.position;
                  // let axisVector = new Vector3(axis[0], axis[1], axis[2]);
                  // let centre = new Vector3(
                  //   position[0],
                  //   position[1],
                  //   position[2]
                  // );
                  // centre = localPosition;
                  //if (prevProps === null) {
                  this.assignPositionToNode(
                    node,
                    localPosition,
                    localQuaternion,
                    //originaPosition,
                    shiftingPosition
                  );
                  if (node.axisLine) {
                    // this.assignPositionToElement(
                    //   node.axisLine,
                    //   localPosition,
                    //   localQuaternion,
                    //   originaPosition,
                    //   shiftingPosition
                    // );
                  }
                  //this.assignPositionToElement(node, localPosition);
                  //}
                  //var nodeQuaternion = currentNode.quaternion;
                  //var nodeconjugate = nodeQuaternion.conjugate();
                  //axisVector = axisVector.applyQuaternion(nodeQuaternion);
                  // console.log(
                  //   'Applying quaternion',
                  //   axis,
                  //   axisVector,
                  //   nodeQuaternion,
                  //   nodeconjugate
                  // );
                  /* var axisQuaternion = new Quaternion();
                  axisQuaternion.setFromAxisAngle(
                    axisVector,
                    differenceElement
                  );
                  axisQuaternion.normalize(); */
                  /* console.log(
                    'Node.position before applying quaternion',
                    node.position
                  );
                  node.applyQuaternion(q);
                  console.log(
                    'Node.position after applying quaternion',
                    node.position
                  ); */
                  //node.matrixWorldNeedsUpdate = true;
                  /* let targetPosition = new Vector3();
                  const sourcePosition = node.getWorldPosition(targetPosition);
                  console.log(
                    node,
                    'Before translation',
                    node.position,
                    //this.shiftposition,
                    position,
                    differenceElement,
                    //sourcePosition,
                    //targetPosition,
                    meshCentroid,
                    geometryCentroid
                  ); */
                  /* node.position.x -= this.shiftposition.x + position[0] * 0.001;
                  node.position.y -= this.shiftposition.y + position[2] * 0.001;
                  node.position.z -= this.shiftposition.z - position[1] * 0.001; */
                  // const positionObject = node.position.clone();

                  /* const shiftablePosition = new Vector3(
                    +(geometryCentroid.x + position[0]),
                    +(geometryCentroid.y + position[1]),
                    +(geometryCentroid.z + position[2])
                  );
                  const shiftablePositionAxis = shiftablePosition
                    .clone()
                    .normalize();
                  let shiftableDistance = Math.sqrt(
                    shiftablePosition.x * shiftablePosition.x +
                      shiftablePosition.y * shiftablePosition.y +
                      shiftablePosition.z * shiftablePosition.z
                  ); */
                  //shiftableDistance = 0;
                  /* node.position.x -= +(topLeft[0] + position[0]) * 0.001;
                  node.position.y -= +(topLeft[2] + position[2]) * 0.001;
                  node.position.z -= -(topLeft[0] + position[1]) * 0.001; */

                  /*node.translateOnAxis(
                    shiftablePositionAxis,
                    -shiftableDistance * 0.001
                  );*/

                  // node.position.sub(centre);
                  // node.updateMatrix();
                  // node.updateMatrixWorld(true);

                  /* node.position.x = 0;
                  node.position.y = 0;
                  node.position.z = 0; */
                  // console.log(
                  //   node,
                  //   'After translation',
                  //   node.position,
                  //   //this.shiftposition,
                  //   position,
                  //   differenceElement,
                  //   centre,
                  //   localPosition
                  //   /* ,
                  //   //sourcePosition,
                  //   //targetPosition,
                  //   meshCentroid,
                  //   geometryCentroid,
                  //   shiftableDistance,
                  //   shiftablePosition,
                  //   shiftablePositionAxis */
                  // );
                  //node.applyQuaternion(nodeconjugate);
                  //node.applyQuaternion(nodeQuaternion);
                  //node.applyQuaternion(axisQuaternion);

                  //node.position.applyQuaternion(axisQuaternion);

                  //node.position.applyAxisAngle(axisVector, differenceElement);
                  //node.rotateOnAxis(axisVector, differenceElement);
                  //node.rotateOnWorldAxis(axisVector, differenceElement);
                  //axisQuaternion = localQuaternion;
                  // node.applyQuaternion(axisQuaternion);
                  //node.setRotationFromAxisAngle(axisVector, differenceElement);

                  // console.log(
                  //   node,
                  //   'After rotation',
                  //   node.position,
                  //   //this.shiftposition,
                  //   position,
                  //   differenceElement,
                  //   centre,
                  //   axisVector
                  //   /*
                  //   //sourcePosition,
                  //   //targetPosition,
                  //   meshCentroid,
                  //   geometryCentroid,
                  //   shiftableDistance,
                  //   shiftablePosition,
                  //   shiftablePositionAxis,
                  //   axisVector*/
                  // );
                  /*   node.position.x += this.shiftposition.x + position[0] * 0.001;
                  node.position.y += this.shiftposition.y + position[2] * 0.001;
                  node.position.z += this.shiftposition.z - position[1] * 0.001; */
                  /* node.position.x += +(topLeft[0] + position[0]) * 0.001;
                  node.position.y += +(topLeft[2] + position[2]) * 0.001;
                  node.position.z += -(topLeft[0] + position[1]) * 0.001; */
                  // node.updateMatrix();
                  // node.updateMatrixWorld(true);
                  /*node.translateOnAxis(
                    shiftablePositionAxis,
                    shiftableDistance * 0.001
                  );*/
                  // node.position.add(centre);
                  // //this.assignPositionToElement(node, centre.multiplyScalar(1));
                  // node.updateMatrix();
                  // node.updateMatrixWorld(true);

                  /*   node.position.x += positionObject.x;
                  node.position.y += positionObject.y;
                  node.position.z += positionObject.z; */
                  // console.log(
                  //   node,
                  //   'After rotation transalation',
                  //   node.position,
                  //   //this.shiftposition,
                  //   position,
                  //   differenceElement,
                  //   centre,
                  //   axisVector
                  //   /* //sourcePosition,
                  //   //targetPosition,
                  //   meshCentroid,
                  //   geometryCentroid,
                  //   shiftableDistance,
                  //   shiftablePosition,
                  //   shiftablePositionAxis,
                  //   axisVector */
                  // );
                  //node.matrixWorldNeedsUpdate = false;
                  // console.log(
                  //   'Done movement for',
                  //   node,
                  //   axisVector,
                  //   differenceElement
                  // );
                }
              }
            } else {
              console.log('No node found for', element, this.partsMeshes);
            }
          } else {
            /*  console.log(
              'Some elements are missing in structure or axis number is lesser',
              element,
              propsElement
            ); */
          }
        }
      } else {
        console.log(
          'No axis found at cylindrical_axis_of_rotation',
          propsElement.actuator_motion_control.cylindrical_axis_of_rotation
        );
      }
    } else {
      console.log(
        'No actuator_motion_control or actuator_motion_control.cylindrical_axis_of_rotation',
        propsElement
      );
    }
  };

  animateKinematicChain = (
    sequence,
    parsedIndexInfo,
    localQuaternion,
    localPosition,
    shiftingPosition,
    diffPosition
  ) => {
    for (
      let index = sequence + 1;
      index < this.props.kinematicItemList.length;
      index++
    ) {
      let [
        sequenced,
        sequenceItem,
        propsElementIndex,
        currentNodeIndex,
        isActuatorNode,
        isLinearNode,
        isEndEffectorNode,
        currentAxisNode,
        currentPositionNode
      ] = parsedIndexInfo[index];

      const node =
        currentNodeIndex === -1 ? null : this.partsMeshes[currentNodeIndex];

      if (node) {
        this.assignPositionToNode(
          node,
          localPosition,
          localQuaternion,
          shiftingPosition,
          diffPosition
        );
      } else {
        console.log(
          'No node found for',
          index,
          parsedIndexInfo[index],
          this.partsMeshes
        );
      }
    }
  };

  findNextChain = (propsElement) => {
    if (
      propsElement.actuator_motion_control &&
      propsElement.actuator_motion_control.cylindrical_axis_of_rotation
    ) {
      for (
        let index = 0;
        index < this.props.kinematicItemList.length;
        index++
      ) {
        const element = this.props.kinematicItemList[index];
        if (
          element &&
          element.actuator_motion_control &&
          element.actuator_motion_control.axis_number ===
            propsElement.actuator_motion_control.axis_number + 1
        ) {
          return element;
        }
      }
    }
    console.log(
      'I Could not get next part',
      propsElement,
      this.props.kinematicItemList
    );
    return null;
  };
  getAxisFromQuaternion = (quaternion) => {
    const axis = [0, 0, 0];
    const angle = 2 * Math.acos(quaternion.w);
    if (1 - quaternion.w * quaternion.w < 0.000001) {
      // test to avoid divide by zero, s is always positive due to sqrt
      // if s close to zero then direction of axis not important
      axis[0] = quaternion.x;
      axis[1] = quaternion.y;
      axis[2] = quaternion.z;
    } else {
      // http://www.euclideanspace.com/maths/geometry/rotations/conversions/quaternionToAngle/
      const s = Math.sqrt(1 - quaternion.w * quaternion.w);
      axis[0] = quaternion.x / s;
      axis[1] = quaternion.y / s;
      axis[2] = quaternion.z / s;
    }
    return axis;
  };
  cloneList = (nodesArray) => {
    return arrayCopy(nodesArray);
  };
  cloneChainForward = (nodesArray) => {
    let clonedChain = [];
    if (nodesArray) {
      for (let index = 0; index < nodesArray.length; index++) {
        const propsElement = nodesArray[index];
        clonedChain.push(propsElement.actuator_motion_control.chain_number);
      }
    }
    return clonedChain;
  };
  cloneChainBackward = (nodesArray, kinematicArray) => {
    let clonedChain = this.cloneList(kinematicArray);
    if (nodesArray) {
      for (let index = 0; index < nodesArray.length; index++) {
        clonedChain[index].actuator_motion_control.chain_number =
          nodesArray[index];
      }
    }
    return clonedChain;
  };
  cloneChainInfoForward = (nodesArray, toDisplay) => {
    let localKinematicValues = [];
    if (nodesArray) {
      for (let index = 0; index < nodesArray.length; index++) {
        const propsElement = nodesArray[index];
        localKinematicValues.push({
          A: propsElement.A,
          L: propsElement.L.clone(),
          Q: propsElement.Q.clone(),
          S: propsElement.S.clone(),
          T: propsElement.T.clone(),
          K: propsElement.K
        });
        if (toDisplay) {
          console.log(
            'Inner Loop values',
            propsElement.A,
            propsElement.L,
            propsElement.Q,
            propsElement.S,
            propsElement.T,
            propsElement.K
          );
        }
      }
    }
    return localKinematicValues;
  };
  cloneChainInfoOnlyMovement = (nodesArray, toDisplay) => {
    let localKinematicValues = [];
    if (nodesArray) {
      for (let index = 0; index < nodesArray.length; index++) {
        const propsElement = nodesArray[index];
        localKinematicValues.push({
          A: propsElement.A
        });
        if (toDisplay) {
          console.log('Inner Loop values', propsElement.A);
        }
      }
    }
    return localKinematicValues;
  };
  cloneChainInfoBackward = (nodesArray, kinematicArray, parsedIndexInfo) => {
    let clonedChain = this.cloneList(kinematicArray);
    if (nodesArray) {
      for (let index = 0; index < nodesArray.length - 1; index++) {
        let [
          sequence,
          sequenceItem,
          propsElementIndex,
          currentNodeIndex,
          isActuatorNode,
          isLinearNode,
          isEndEffectorNode,
          currentAxisNode,
          currentPositionNode
        ] = parsedIndexInfo[index];
        let propsElement =
          clonedChain[propsElementIndex === -1 ? index : propsElementIndex];
        propsElement.actuator_motion_control.chain_number =
          nodesArray[index + 1].A;
      }
    }
    return clonedChain;
  };
  cloneChainInfoToKinematicList = () => {
    let clonedChain = this.animateResultKinematicList;
    const nodesArray =
      this.calculateInverseKinematicMovementArray[
        this.calculateInverseKinematicMovementIndex
      ];
    const parsedIndexInfo = this.state.indexedKinematicParsedInfo;
    if (nodesArray) {
      for (let index = 0; index < nodesArray.length - 1; index++) {
        let [
          sequence,
          sequenceItem,
          propsElementIndex,
          currentNodeIndex,
          isActuatorNode,
          isLinearNode,
          isEndEffectorNode,
          currentAxisNode,
          currentPositionNode
        ] = parsedIndexInfo[index];
        let propsElement =
          clonedChain[propsElementIndex === -1 ? index : propsElementIndex];
        propsElement.actuator_motion_control.chain_number =
          nodesArray[index + 1].A;
      }
    }
  };
  getPerpendicularDirection = (axis, point) => {
    const dotLength = point.x * axis.x + point.y * axis.y + point.z * axis.z;
    const direction = new Vector3().subVectors(
      point,
      new Vector3(axis.x * dotLength, axis.y * dotLength, axis.z * dotLength)
    );
    return direction;
  };
  angleToMoveToTarget = (axis, endEffector, target) => {
    // let targetPos = target.clone();
    // let axisNorm = axis.clone().normalize();
    // //console.log('normal axis', axisNorm);
    // let endEffectorPos = endEffector.clone();
    // let targetDir = targetPos
    //   .clone()
    //   .sub(axisNorm.clone().multiplyScalar(targetPos.dot(axisNorm)))
    //   .normalize();
    // let currentDir = endEffectorPos
    //   .clone()
    //   .sub(axisNorm.clone().multiplyScalar(endEffectorPos.dot(axisNorm)))
    //   .normalize();
    const currentDir = this.getPerpendicularDirection(axis, endEffector);
    const targetDir = this.getPerpendicularDirection(axis, target);
    const angleBetween = this.getAngleBetweenVectorsFromAxis(
      axis,
      currentDir,
      targetDir
    );
    // console.log('target dir', targetDir);
    // console.log('current dir', currentDir);
    console.log(
      'target, end effector, axis, currentDir, targetDir, angleBetween',
      target,
      endEffector,
      axis,
      currentDir,
      targetDir,
      angleBetween
    );
    // console.log('angle change', Math.acos(targetDir.dot(currentDir)));
    return angleBetween;
  };
  getAngleBetweenVectorsFromAxis = (
    currentPositionAxis,
    currentEndEffectorposition,
    currentTargetPosition
  ) => {
    let crossProduct = new Vector3().crossVectors(
      currentEndEffectorposition,
      currentTargetPosition
    );
    let endEffectorDot = currentEndEffectorposition.dot(currentTargetPosition);
    let targetDot = crossProduct.dot(currentPositionAxis);
    return Math.atan2(targetDot, endEffectorDot);
  };
  calculateKinematicMovement_old = (prevProps, parsedInfo) => {
    if (
      JSON.stringify(prevProps ? prevProps.xyzControlPosition || [] : []) !==
        JSON.stringify(this.props.xyzControlPosition || []) &&
      JSON.stringify(parsedInfo || []) !== JSON.stringify([])
    ) {
      if (
        this.props.showKinematicSliderMove &&
        this.props.kinematicItemList &&
        this.partsMeshes &&
        this.partsMeshes.length > 0 &&
        this.props.kinematicItemList.length > 0 &&
        this.props.xyzEndEffectorPosition
      ) {
        // console.log(
        //   'My Object KinematicItelList',
        //   this.props.kinematicItemList
        // );
        let calculatedKinematicItemList = this.cloneList(
          this.props.kinematicItemList
        );
        let currentMountPosition = new Vector3(
          this.props.xyzEndEffectorPosition.X,
          this.props.xyzEndEffectorPosition.Y,
          this.props.xyzEndEffectorPosition.Z
        );
        let targetEndEffectorPosition = new Vector3(
          this.props.xyzControlPosition.X,
          this.props.xyzControlPosition.Y,
          this.props.xyzControlPosition.Z
        );
        const differenceBetweenTargetAndEndEffector = new Vector3().subVectors(
          targetEndEffectorPosition,
          currentMountPosition
        );
        let lengthBetweenTargetAndEndEffector =
          differenceBetweenTargetAndEndEffector.x *
            differenceBetweenTargetAndEndEffector.x +
          differenceBetweenTargetAndEndEffector.y *
            differenceBetweenTargetAndEndEffector.y +
          differenceBetweenTargetAndEndEffector.z *
            differenceBetweenTargetAndEndEffector.z;
        if (lengthBetweenTargetAndEndEffector === 0) {
          return;
        }
        let originalEndEffectorPosition =
          this.props.xyzEndEffectorPosition.M.clone();
        let originalLocalPosition = this.props.xyzEndEffectorPosition.L.clone();

        let originalLocalQuaternion =
          this.props.xyzEndEffectorPosition.Q.clone().invert();
        let originalTargetPosition = targetEndEffectorPosition.clone();
        originalTargetPosition.sub(originalLocalPosition);
        originalTargetPosition.applyQuaternion(originalLocalQuaternion);
        originalTargetPosition.add(originalLocalPosition);

        let calculatedMountPosition = currentMountPosition.clone();
        // let noOfSteps = this.props.steps||5;
        // for (let steppedIndex = 0; steppedIndex < noOfSteps; steppedIndex++) {
        //   const element = array[steppedIndex];

        // }

        let direction = -1;
        let directionMultiplier = -1;
        let foundThePosition = false;
        let changeMade = false;
        let directionIndex = 0;
        // let globalQuaternionArray = this.cloneList(
        //   this.props.xyzEndEffectorPosition.CQ
        // );
        // let globalPositionArray = this.cloneList(
        //   this.props.xyzEndEffectorPosition.LA
        // );
        // let globalIndexArray = this.cloneList(
        //   this.props.xyzEndEffectorPosition.IA
        // );
        const howManyIterations = this.props.kinematicParameters
          ? this.props.kinematicParameters.iterations || 21
          : 21;
        for (let iteration = 0; iteration < howManyIterations; iteration++) {
          direction *= directionMultiplier;
          let couldFindTheta = false;
          for (
            ;
            directionIndex < calculatedKinematicItemList.length - 1;
            directionIndex++
          ) {
            const positionalIndex =
              direction === 1
                ? directionIndex
                : calculatedKinematicItemList.length - directionIndex - 2;

            let previousCalculatedKinematicItemList = this.cloneList(
              calculatedKinematicItemList
            );
            let leastTheta = 6.28;
            let mostTheta = -6.28;
            const howManyMethods = this.props.kinematicParameters
              ? this.props.kinematicParameters.methods || 1
              : 1;
            for (
              let methodIndex = 0;
              methodIndex < howManyMethods;
              methodIndex++
            ) {
              let localQuaternion = new Quaternion(0, 0, 0, 1);
              let localPosition = new Vector3(0, 0, 0);
              //let localPreviousPosition = new Vector3(0, 0, 0);
              let localTranslation = new Vector3(0, 0, 0);
              let localShiftedPosition = new Vector3(0, 0, 0);
              // let localQuaternionArray = [];
              // localQuaternionArray.push(localQuaternion.clone());
              // let currentQuaternionArray = [];
              // currentQuaternionArray.push(localQuaternion.clone());
              // let localPositionArray = [];
              // localPositionArray.push(localPosition.clone());
              // //let localPreviousPosition = new Vector3(0, 0, 0);
              // let localTranslationArray = [];
              // localTranslationArray.push(localTranslation.clone());
              // let localShiftedPositionArray = [];
              // localShiftedPositionArray.push(localShiftedPosition.clone());
              // let indexArray = [];
              // indexArray.push(0);
              let changeMadeInInnerLoop = false;
              let positionalIndexFound = false;
              for (
                let index = 0;
                index < calculatedKinematicItemList.length;
                index++
              ) {
                const sequencedElement = this.getSequencedItem(
                  parsedInfo,
                  index + 1,
                  1
                );

                const propsElement = sequencedElement
                  ? this.getKinematicItem(
                      calculatedKinematicItemList,
                      sequencedElement
                    )
                  : calculatedKinematicItemList[index];

                const currentNode = this.findNodeFrom(propsElement);
                // console.log(
                //   'Comparing stringingfication',
                //   parsedInfo,
                //   propsElement,
                //   sequencedElement,
                //   currentNode
                // );
                if (
                  currentNode &&
                  propsElement &&
                  propsElement.actuator_motion_control &&
                  !propsElement.actuator_motion_control.is_end_effector &&
                  propsElement.actuator_motion_control.child_part_type ===
                    'ACTUATOR'
                ) {
                  let currentAxis = propsElement.actuator_motion_control
                    .cylindrical_axis_of_rotation
                    ? propsElement.actuator_motion_control
                        .cylindrical_axis_of_rotation.axis
                      ? new Vector3(
                          propsElement.actuator_motion_control.cylindrical_axis_of_rotation.axis[0],
                          propsElement.actuator_motion_control.cylindrical_axis_of_rotation.axis[1],
                          propsElement.actuator_motion_control.cylindrical_axis_of_rotation.axis[2]
                        )
                      : new Vector3()
                    : new Vector3();
                  let currentPosition = propsElement.actuator_motion_control
                    .cylindrical_axis_of_rotation
                    ? propsElement.actuator_motion_control
                        .cylindrical_axis_of_rotation.position
                      ? new Vector3(
                          propsElement.actuator_motion_control.cylindrical_axis_of_rotation.position[0],
                          propsElement.actuator_motion_control.cylindrical_axis_of_rotation.position[1],
                          propsElement.actuator_motion_control.cylindrical_axis_of_rotation.position[2]
                        )
                      : new Vector3()
                    : new Vector3();

                  //let mydummyquaternion = localQuaternion; //new Quaternion();
                  //mydummyquaternion.setFromAxisAngle(new Vector3(0.19, 1, 0), 0);
                  let localCurrentQuaternion = localQuaternion.clone();
                  let currentOriginalPosition = currentPosition.clone();
                  let localCurrentTranslation = localTranslation.clone();
                  currentPosition.sub(localPosition);
                  currentPosition.applyQuaternion(localCurrentQuaternion);
                  //currentPosition.applyQuaternion(currentQuaternion);
                  currentPosition.add(localPosition);
                  //let currentAnotherAxis = currentAxis.clone();
                  let currentPositionAxis = currentAxis.clone();
                  currentPositionAxis.add(currentOriginalPosition);
                  currentPositionAxis.sub(localPosition);
                  currentPositionAxis.applyQuaternion(localCurrentQuaternion);
                  currentPositionAxis.add(localPosition);
                  currentPositionAxis.sub(currentPosition);
                  currentPositionAxis.normalize();

                  const isLinear =
                    propsElement.actuator_motion_control
                      .is_linear_or_rotational;
                  console.log(
                    'Positional Index',
                    positionalIndex,
                    index,
                    isLinear
                  );
                  if (positionalIndex === index) {
                    positionalIndexFound = true;
                    let differenceBetween = 0;
                    if (isLinear) {
                      let currentOriginalEndEffectorPosition,
                        currentOriginalTargetPosition,
                        currentEndEffectorposition,
                        currentTargetPosition,
                        differencePosition;
                      if (
                        methodIndex === 0 ||
                        methodIndex === 3 ||
                        methodIndex === 4
                      ) {
                        currentOriginalEndEffectorPosition =
                          calculatedMountPosition.clone();

                        currentOriginalTargetPosition =
                          targetEndEffectorPosition.clone();
                      }
                      if (methodIndex === 1 || methodIndex === 2) {
                        currentOriginalEndEffectorPosition =
                          originalEndEffectorPosition.clone();
                        currentOriginalEndEffectorPosition.sub(localPosition);
                        currentOriginalEndEffectorPosition.applyQuaternion(
                          localCurrentQuaternion
                        );
                        currentOriginalEndEffectorPosition.add(localPosition);
                        currentOriginalTargetPosition =
                          originalTargetPosition.clone();
                        currentOriginalTargetPosition.sub(localPosition);
                        currentOriginalTargetPosition.applyQuaternion(
                          localCurrentQuaternion
                        );
                        currentOriginalTargetPosition.add(localPosition);
                      }

                      currentEndEffectorposition =
                        currentOriginalEndEffectorPosition.clone();
                      currentTargetPosition =
                        currentOriginalTargetPosition.clone();
                      differencePosition = new Vector3().subVectors(
                        currentTargetPosition,
                        currentEndEffectorposition
                      );

                      if (methodIndex === 3) {
                        differenceBetween = leastTheta / 2;
                      }
                      if (methodIndex === 4) {
                        differenceBetween = mostTheta / 2;
                      }
                      if (
                        methodIndex === 0 ||
                        methodIndex === 1 ||
                        methodIndex === 2
                      ) {
                        differenceBetween = Math.sqrt(
                          differencePosition.x * differencePosition.x +
                            differencePosition.y * differencePosition.y +
                            differencePosition.z * differencePosition.z
                        );
                        if (methodIndex === 0) {
                          leastTheta = differenceBetween;
                          mostTheta = differenceBetween;
                        }
                      }
                    } else {
                      let currentBeforeLocalQuaternion,
                        currentBeforeLocalQuaternionApplied,
                        currentOriginalEndEffectorPosition,
                        currentOriginalTargetPosition =
                          targetEndEffectorPosition.clone();
                      if (
                        methodIndex === 0 ||
                        methodIndex === 2 ||
                        methodIndex === 3 ||
                        methodIndex === 4
                      ) {
                        currentOriginalEndEffectorPosition =
                          calculatedMountPosition.clone();
                        currentOriginalTargetPosition =
                          targetEndEffectorPosition.clone();
                      }
                      if (methodIndex === 1) {
                        currentBeforeLocalQuaternion = new Quaternion();

                        currentBeforeLocalQuaternion
                          .setFromAxisAngle(
                            currentPositionAxis,
                            propsElement.actuator_motion_control.chain_number
                          )
                          .normalize();
                        currentBeforeLocalQuaternionApplied =
                          localCurrentQuaternion.clone();
                        currentBeforeLocalQuaternionApplied
                          .premultiply(currentBeforeLocalQuaternion)
                          .normalize();
                        currentOriginalEndEffectorPosition =
                          originalEndEffectorPosition.clone();
                        currentOriginalEndEffectorPosition.sub(currentPosition);
                        currentOriginalEndEffectorPosition.applyQuaternion(
                          currentBeforeLocalQuaternionApplied
                        );
                        currentOriginalEndEffectorPosition.add(currentPosition);
                        currentOriginalTargetPosition =
                          originalTargetPosition.clone();
                        currentOriginalTargetPosition.sub(currentPosition);
                        currentOriginalTargetPosition.applyQuaternion(
                          currentBeforeLocalQuaternionApplied
                        );
                        currentOriginalTargetPosition.add(currentPosition);
                      }

                      // let localInverseQuaternion = new Quaternion();
                      // console.log(
                      //   'indexes',
                      //   globalIndexArray,
                      //   globalPositionArray,
                      //   globalQuaternionArray
                      // );
                      // for (
                      //   let globalIndex = 0;
                      //   globalIndex < globalIndexArray.length;
                      //   globalIndex++
                      // ) {
                      //   const refIndex =
                      //     globalIndexArray.length - globalIndex - 1;
                      //   const myIndex = globalIndexArray[refIndex];
                      //   if (myIndex >= index + 2) {
                      //     localInverseQuaternion
                      //       .premultiply(
                      //         globalQuaternionArray[refIndex].clone().invert()
                      //       )
                      //       .normalize();
                      //     console.log(
                      //       'Got the inverse multiplier',
                      //       localInverseQuaternion,
                      //       globalIndex,
                      //       refIndex,
                      //       myIndex
                      //     );
                      //   }
                      //   if (myIndex === index + 2) {
                      //     const globalPosition = globalPositionArray[refIndex];
                      //     currentOriginalTargetPosition.sub(globalPosition);
                      //     currentOriginalTargetPosition.applyQuaternion(
                      //       localInverseQuaternion
                      //     );
                      //     currentOriginalTargetPosition.add(globalPosition);
                      //     console.log(
                      //       'Got the global Position',
                      //       globalPosition,
                      //       localInverseQuaternion,
                      //       globalIndex,
                      //       refIndex,
                      //       myIndex,
                      //       originalTargetPosition,
                      //       originalEndEffectorPosition,
                      //       currentOriginalFalseTargetPosition,
                      //       currentOriginalEndEffectorPosition,
                      //       currentOriginalTargetPosition
                      //     );
                      //     break;
                      //   }
                      //   if (myIndex < index) {
                      //     break;
                      //   }
                      // }

                      // let currentBeforeTargetQuaternion = new Quaternion();
                      // currentBeforeTargetQuaternion
                      //   .setFromAxisAngle(
                      //     currentPositionAxis,
                      //     /* index >= 2 && false
                      //         ? 0
                      //         : */
                      //     propsElement.actuator_motion_control.chain_number
                      //   )
                      //   .normalize();
                      // let localBeforeTargetQuaternion =
                      //   localCurrentQuaternion.clone();
                      // localBeforeTargetQuaternion
                      //   .premultiply(currentBeforeTargetQuaternion)
                      //   .normalize();
                      // localBeforeTargetQuaternion =
                      //   localBeforeTargetQuaternion.invert();
                      let currentEndEffectorposition =
                        currentOriginalEndEffectorPosition.clone();
                      let currentTargetPosition =
                        currentOriginalTargetPosition.clone();
                      currentEndEffectorposition.sub(currentPosition);
                      // currentEndEffectorposition.applyQuaternion(
                      //   localBeforeTargetQuaternion
                      // );
                      currentTargetPosition.sub(currentPosition);
                      // currentTargetPosition.applyQuaternion(
                      //   localBeforeTargetQuaternion
                      // );
                      // let crossProduct = new Vector3().crossVectors(
                      //   currentEndEffectorposition,
                      //   currentTargetPosition
                      // );
                      // let endEffectorDot = currentEndEffectorposition.dot(
                      //   currentTargetPosition
                      // );
                      // let targetDot = crossProduct.dot(currentPositionAxis);
                      // differenceBetween = Math.atan2(targetDot, endEffectorDot);
                      // differenceBetween = this.getAngleBetweenVectorsFromAxis(
                      //   currentPositionAxis,
                      //   currentEndEffectorposition,
                      //   currentTargetPosition
                      // );
                      if (methodIndex === 2) {
                        differenceBetween = this.getAngleBetweenVectorsFromAxis(
                          currentPositionAxis,
                          currentEndEffectorposition,
                          currentTargetPosition
                        );
                      }
                      if (methodIndex === 0 || methodIndex === 1) {
                        differenceBetween = this.angleToMoveToTarget(
                          currentPositionAxis,
                          currentEndEffectorposition,
                          currentTargetPosition
                        );
                      }
                      if (methodIndex === 3) {
                        differenceBetween = leastTheta / 2;
                        console.log('Least method theta', leastTheta);
                      }
                      if (methodIndex === 4) {
                        differenceBetween = mostTheta / 2;
                        console.log('Most method theta', mostTheta);
                      }
                      // let testCurrentPostionAxis = currentPositionAxis.clone();
                      // //testCurrentPostionAxis = new Vector3(0, 0, 1);
                      // let testMountPosition =
                      //   currentEndEffectorposition.clone();
                      // //testMountPosition = new Vector3(3, 4, 0);
                      // let currentTestTargetPosition =
                      //   currentTargetPosition.clone();
                      // // currentTestTargetPosition = new Vector3(
                      // //   4,
                      // //   3,
                      // //   12
                      // // );
                      // let testDifferenceBetween = differenceBetween;

                      // let currentTestQuaternion = new Quaternion();
                      // currentTestQuaternion
                      //   .setFromAxisAngle(
                      //     testCurrentPostionAxis,
                      //     testDifferenceBetween
                      //   )
                      //   .normalize();
                      // let localTestCurrentQuaternion = new Quaternion();

                      // localTestCurrentQuaternion
                      //   .premultiply(currentTestQuaternion)
                      //   .normalize();

                      // let testdifferenceCalcuatedPosition =
                      //   new Vector3().subVectors(
                      //     currentTestTargetPosition,
                      //     testMountPosition
                      //   );
                      // let testdifferenceCalculatedBetweenBefore =
                      //   testdifferenceCalcuatedPosition.x *
                      //     testdifferenceCalcuatedPosition.x +
                      //   testdifferenceCalcuatedPosition.y *
                      //     testdifferenceCalcuatedPosition.y +
                      //   testdifferenceCalcuatedPosition.z *
                      //     testdifferenceCalcuatedPosition.z;
                      // //const testLocalPosition = currentPosition.clone();
                      // //testLocalPosition = new Vector3(0, 0, 0);
                      // //testMountPosition.sub(testLocalPosition);
                      // testMountPosition.applyQuaternion(
                      //   localTestCurrentQuaternion
                      // );
                      // //currentPosition.applyQuaternion(currentQuaternion);
                      // //testMountPosition.add(testLocalPosition);
                      // testdifferenceCalcuatedPosition =
                      //   new Vector3().subVectors(
                      //     currentTestTargetPosition,
                      //     testMountPosition
                      //   );
                      // let testdifferenceCalculatedBetweenAfter =
                      //   testdifferenceCalcuatedPosition.x *
                      //     testdifferenceCalcuatedPosition.x +
                      //   testdifferenceCalcuatedPosition.y *
                      //     testdifferenceCalcuatedPosition.y +
                      //   testdifferenceCalcuatedPosition.z *
                      //     testdifferenceCalcuatedPosition.z;
                      // console.log(
                      //   'After applying quaternion',
                      //   testdifferenceCalculatedBetweenAfter,
                      //   testdifferenceCalculatedBetweenBefore,
                      //   testMountPosition,
                      //   currentTestTargetPosition,
                      //   calculatedMountPosition,
                      //   targetEndEffectorPosition,
                      //   testDifferenceBetween,
                      //   differenceBetween,
                      //   originalEndEffectorPosition,
                      //   originalTargetPosition,
                      //   currentOriginalEndEffectorPosition,
                      //   currentOriginalTargetPosition,
                      //   propsElement.actuator_motion_control.chain_number
                      // );
                      // const constAngle = this.angleToMoveToTarget(
                      //   new Vector3(0, 1, 0),
                      //   new Vector3(2, 0.8, 1),
                      //   new Vector3(1.5, 0.5, 1)
                      // );
                      //console.log('Const Anlge', constAngle);
                      /* let endEffectorDot = currentEndEffectorposition
                        .normalize()
                        .dot(currentPositionAxis);
                      let targetDot = currentTargetPosition
                        .normalize()
                        .dot(currentPositionAxis); 
                      differenceBetween =
                        Math.acos(targetDot) - Math.acos(endEffectorDot); */
                      /*console.log(
                        'Found difference',
                        differenceBetween,
                        targetEndEffectorPosition,
                        calculatedMountPosition,
                        //endEffectorDot,
                        //targetDot,
                        currentEndEffectorposition,
                        currentTargetPosition,
                        propsElement.actuator_motion_control.chain_number
                      );*/
                    }
                    if (differenceBetween !== 0) {
                      propsElement.actuator_motion_control.chain_number +=
                        differenceBetween;
                      console.log(
                        'Applying difference',
                        differenceBetween,
                        propsElement.actuator_motion_control.chain_number,
                        propsElement.actuator_motion_control.minimum_limit,
                        propsElement.actuator_motion_control.maximum_limit,
                        propsElement
                      );
                      if (
                        propsElement.actuator_motion_control.chain_number >
                        propsElement.actuator_motion_control.maximum_limit
                      ) {
                        let previousDifferenceBetween = differenceBetween;
                        differenceBetween =
                          propsElement.actuator_motion_control.maximum_limit -
                          propsElement.actuator_motion_control.chain_number -
                          differenceBetween;
                        propsElement.actuator_motion_control.chain_number =
                          propsElement.actuator_motion_control.maximum_limit;
                        console.log(
                          'Applied Limit difference',
                          differenceBetween,
                          previousDifferenceBetween,
                          propsElement.actuator_motion_control.chain_number,
                          propsElement.actuator_motion_control.minimum_limit,
                          propsElement.actuator_motion_control.maximum_limit
                        );
                      }
                      if (
                        propsElement.actuator_motion_control.chain_number <
                        propsElement.actuator_motion_control.minimum_limit
                      ) {
                        let previousDifferenceBetween = differenceBetween;
                        differenceBetween =
                          propsElement.actuator_motion_control.minimum_limit -
                          propsElement.actuator_motion_control.chain_number -
                          differenceBetween;
                        propsElement.actuator_motion_control.chain_number =
                          propsElement.actuator_motion_control.minimum_limit;
                        console.log(
                          'Applied Limit difference',
                          differenceBetween,
                          previousDifferenceBetween,
                          propsElement.actuator_motion_control.chain_number,
                          propsElement.actuator_motion_control.minimum_limit,
                          propsElement.actuator_motion_control.maximum_limit
                        );
                      }
                      if (leastTheta > differenceBetween) {
                        leastTheta = differenceBetween;
                      }
                      if (mostTheta < differenceBetween) {
                        mostTheta = differenceBetween;
                      }
                    }
                  }

                  let currentAxisQuaternion = new Quaternion();

                  if (isLinear) {
                    const currentLength = Math.sqrt(
                      currentPositionAxis.x * currentPositionAxis.x +
                        currentPositionAxis.y * currentPositionAxis.y +
                        currentPositionAxis.z * currentPositionAxis.z
                    );
                    if (currentLength !== 0) {
                      localCurrentTranslation.add(
                        new Vector3(
                          (currentPositionAxis.x *
                            propsElement.actuator_motion_control.chain_number) /
                            currentLength,
                          (currentPositionAxis.y *
                            propsElement.actuator_motion_control.chain_number) /
                            currentLength,
                          (currentPositionAxis.z *
                            propsElement.actuator_motion_control.chain_number) /
                            currentLength
                        )
                      );
                    }
                  } else {
                    currentAxisQuaternion
                      .setFromAxisAngle(
                        currentPositionAxis,
                        /* index >= 2 && false
                              ? 0
                              : */
                        propsElement.actuator_motion_control.chain_number
                      )
                      .normalize();
                    localCurrentQuaternion
                      .premultiply(currentAxisQuaternion)
                      .normalize();
                  }

                  let shiftedPosition = currentOriginalPosition.clone();
                  shiftedPosition.applyQuaternion(localQuaternion);
                  shiftedPosition.add(localShiftedPosition);
                  let shiftingPosition = currentOriginalPosition.clone();
                  shiftingPosition.applyQuaternion(localCurrentQuaternion);
                  shiftedPosition.sub(shiftingPosition);
                  shiftedPosition.add(localCurrentTranslation);
                  //shiftingPosition.sub(shiftedPosition);

                  localPosition = currentPosition.clone();
                  localQuaternion = localCurrentQuaternion.clone();
                  localShiftedPosition = shiftedPosition.clone();
                  localTranslation = localCurrentTranslation.clone();
                  // localQuaternionArray.push(localQuaternion.clone());
                  // localPositionArray.push(localPosition.clone());
                  // //let localPreviousPosition = new Vector3(0, 0, 0);
                  // localTranslationArray.push(localTranslation.clone());
                  // localShiftedPositionArray.push(localShiftedPosition.clone());
                  // currentQuaternionArray.push(currentAxisQuaternion.clone());
                  // indexArray.push(index + 1);
                } else {
                  // console.log(
                  //   'Not an actuator',
                  //   propsElement,
                  //   index,
                  //   localPosition,
                  //   localQuaternion,
                  //   calculatedMountPosition
                  // );
                }
                if (
                  currentNode &&
                  propsElement &&
                  propsElement.actuator_motion_control &&
                  propsElement.actuator_motion_control.is_end_effector &&
                  propsElement.actuator_motion_control.child_part_type ===
                    'ACTUATOR'
                ) {
                  if (this.props.itemProperties) {
                    const itemProperties = this.props.itemProperties;
                    //console.log('Got itemproperties as', itemProperties);
                    if (
                      itemProperties.actuator_motion_control &&
                      itemProperties.actuator_motion_control
                        .cylindrical_axis_of_rotation &&
                      itemProperties.actuator_motion_control
                        .cylindrical_axis_of_rotation.mountobb
                    ) {
                      const mountSurface =
                        itemProperties.actuator_motion_control
                          .cylindrical_axis_of_rotation.mountobb;
                      let mountPosition = new Vector3(
                        mountSurface.cx,
                        mountSurface.cy,
                        mountSurface.cz
                      );
                      mountPosition.sub(localPosition);
                      mountPosition.applyQuaternion(localQuaternion);
                      //currentPosition.applyQuaternion(currentQuaternion);
                      mountPosition.add(localPosition);
                      let currentTargetPosition =
                        targetEndEffectorPosition.clone();
                      let differenceCalcuatedPosition =
                        new Vector3().subVectors(
                          currentTargetPosition,
                          mountPosition
                        );
                      let differenceCalculatedBetween =
                        differenceCalcuatedPosition.x *
                          differenceCalcuatedPosition.x +
                        differenceCalcuatedPosition.y *
                          differenceCalcuatedPosition.y +
                        differenceCalcuatedPosition.z *
                          differenceCalcuatedPosition.z;
                      if (
                        differenceCalculatedBetween <
                        lengthBetweenTargetAndEndEffector
                      ) {
                        changeMadeInInnerLoop = true;
                        couldFindTheta = true;
                        changeMade = true;
                        if (
                          differenceCalculatedBetween <=
                          (this.state.kinematicPrecision || 0.00000001)
                        ) {
                          foundThePosition = true;
                          console.log(
                            'Reached after ',
                            iteration + 1,
                            'iterations',
                            'error rate',
                            differenceCalculatedBetween
                          );
                        } else {
                          console.log(
                            'Difference Length',
                            differenceCalculatedBetween,
                            lengthBetweenTargetAndEndEffector,
                            calculatedMountPosition,
                            targetEndEffectorPosition,
                            mountPosition,
                            'iteration no',
                            iteration + 1
                          );
                        }
                        lengthBetweenTargetAndEndEffector =
                          differenceCalculatedBetween;
                        calculatedMountPosition = mountPosition.clone();
                        originalTargetPosition =
                          targetEndEffectorPosition.clone();
                        originalTargetPosition.sub(localPosition);
                        originalTargetPosition.applyQuaternion(
                          localQuaternion.clone().invert()
                        );
                        originalTargetPosition.add(localPosition);
                        console.log(
                          'Got original target pos',
                          originalTargetPosition,
                          new Vector3(
                            mountSurface.cx,
                            mountSurface.cy,
                            mountSurface.cz
                          )
                        );
                        // globalQuaternionArray = this.cloneList(
                        //   currentQuaternionArray
                        // );
                        // globalPositionArray = this.cloneList(localPositionArray);
                        // globalIndexArray = this.cloneList(indexArray);
                      } else {
                        console.log(
                          'Difference Length Exceeds',
                          differenceCalculatedBetween,
                          lengthBetweenTargetAndEndEffector,
                          calculatedMountPosition,
                          targetEndEffectorPosition,
                          mountPosition,
                          localPosition,
                          localQuaternion
                        );
                        // for (
                        //   let chainPrintIndex = 0;
                        //   chainPrintIndex < calculatedKinematicItemList.length;
                        //   chainPrintIndex++
                        // ) {
                        //   console.log(
                        //     calculatedKinematicItemList[chainPrintIndex]
                        //       .actuator_motion_control,
                        //     previousCalculatedKinematicItemList[chainPrintIndex]
                        //       .actuator_motion_control
                        //   );
                        // }
                        calculatedKinematicItemList = this.cloneList(
                          previousCalculatedKinematicItemList
                        );
                      }
                    }
                  }
                }
                if (foundThePosition) {
                  break;
                }
              }
              if (foundThePosition) {
                break;
              }
              if (changeMadeInInnerLoop) {
                break;
              }
              if (!positionalIndexFound) {
                console.log('end effector or not an actuator');
                break;
              }
            }

            if (foundThePosition) {
              break;
            }
          }
          if (foundThePosition) {
            break;
          }
          directionIndex = 1;
          if (!couldFindTheta) {
            console.log(
              'Not reachable beyond this',
              iteration + 1,
              'iterations',
              lengthBetweenTargetAndEndEffector,
              'error rate'
            );
            break;
          }
        }
        if (this.props.setKinematicItemList && changeMade) {
          /*console.log(
            'Setting from',
            this.props.kinematicItemList,
            'To',
            calculatedKinematicItemList
          );*/
          for (
            let displayIndex = 0;
            displayIndex < this.props.kinematicItemList.length;
            displayIndex++
          ) {
            const propsElement = this.props.kinematicItemList[displayIndex];
            const calcElement = calculatedKinematicItemList[displayIndex];
            console.log(
              'My values',
              displayIndex,
              propsElement.actuator_motion_control.chain_number,
              calcElement.actuator_motion_control.chain_number
            );
          }
          this.props.setKinematicItemList(
            this.cloneList(calculatedKinematicItemList)
          );
        }

        //To do set kinematic item list with newly found values...
      }
    }
  };
  calculateInverseKinematicMovement_withoutIndex = (prevProps, parsedInfo) => {
    if (
      JSON.stringify(prevProps ? prevProps.xyzControlPosition || [] : []) !==
        JSON.stringify(this.props.xyzControlPosition || []) &&
      JSON.stringify(parsedInfo || []) !== JSON.stringify([])
    ) {
      if (
        this.props.showKinematicSliderMove &&
        this.props.kinematicItemList &&
        this.partsMeshes &&
        this.partsMeshes.length > 0 &&
        this.props.kinematicItemList.length > 0 &&
        this.props.xyzEndEffectorPosition
      ) {
        let calculatedKinematicItemList = this.cloneList(
          this.props.kinematicItemList
        );
        let currentMountPosition = new Vector3(
          this.props.xyzEndEffectorPosition.X,
          this.props.xyzEndEffectorPosition.Y,
          this.props.xyzEndEffectorPosition.Z
        );
        let targetEndEffectorPosition = new Vector3(
          this.props.xyzControlPosition.X,
          this.props.xyzControlPosition.Y,
          this.props.xyzControlPosition.Z
        );
        const differenceBetweenTargetAndEndEffector = new Vector3().subVectors(
          targetEndEffectorPosition,
          currentMountPosition
        );
        let lengthBetweenTargetAndEndEffector =
          differenceBetweenTargetAndEndEffector.x *
            differenceBetweenTargetAndEndEffector.x +
          differenceBetweenTargetAndEndEffector.y *
            differenceBetweenTargetAndEndEffector.y +
          differenceBetweenTargetAndEndEffector.z *
            differenceBetweenTargetAndEndEffector.z;
        if (lengthBetweenTargetAndEndEffector === 0) {
          return;
        }
        let originalEndEffectorPosition =
          this.props.xyzEndEffectorPosition.M.clone();
        let originalLocalPosition = this.props.xyzEndEffectorPosition.L.clone();
        let originalLocalShiftedPosition =
          this.props.xyzEndEffectorPosition.S.clone();
        let originalLocalQuaternion =
          this.props.xyzEndEffectorPosition.Q.clone().invert();
        let originalTargetPosition = targetEndEffectorPosition.clone();
        originalTargetPosition.sub(originalLocalShiftedPosition);
        originalTargetPosition.applyQuaternion(originalLocalQuaternion);
        originalTargetPosition.add(originalLocalPosition);

        let calculatedMountPosition = currentMountPosition.clone();

        let direction = -1;
        let directionMultiplier = -1;
        let foundThePosition = false;
        let changeMade = false;
        let directionIndex = 0;

        const howManyIterations = this.props.kinematicParameters
          ? this.props.kinematicParameters.iterations || 21
          : 21;
        for (let iteration = 0; iteration < howManyIterations; iteration++) {
          direction *= directionMultiplier;
          let couldFindTheta = false;
          for (
            ;
            directionIndex < calculatedKinematicItemList.length - 1;
            directionIndex++
          ) {
            const positionalIndex =
              direction === 1
                ? directionIndex
                : calculatedKinematicItemList.length - directionIndex - 2;

            let previousCalculatedKinematicItemList = this.cloneList(
              calculatedKinematicItemList
            );
            let leastTheta = 6.28;
            let mostTheta = -6.28;
            const howManyMethods = this.props.kinematicParameters
              ? this.props.kinematicParameters.methods || 1
              : 1;
            for (
              let methodIndex = 0;
              methodIndex < howManyMethods;
              methodIndex++
            ) {
              let localQuaternion = new Quaternion(0, 0, 0, 1);
              let localPosition = new Vector3(0, 0, 0);
              //let localPreviousPosition = new Vector3(0, 0, 0);
              let localTranslation = new Vector3(0, 0, 0);
              let localShiftedPosition = new Vector3(0, 0, 0);
              let globalShiftedPosition = new Vector3(0, 0, 0);
              let changeMadeInInnerLoop = false;
              let positionalIndexFound = false;
              for (
                let index = 0;
                index < calculatedKinematicItemList.length;
                index++
              ) {
                const sequencedElement = this.getSequencedItem(
                  parsedInfo,
                  index + 1,
                  1
                );

                const propsElement = sequencedElement
                  ? this.getKinematicItem(
                      calculatedKinematicItemList,
                      sequencedElement
                    )
                  : calculatedKinematicItemList[index];

                const currentNode = this.findNodeFrom(propsElement);

                if (
                  currentNode &&
                  propsElement &&
                  propsElement.actuator_motion_control &&
                  !propsElement.actuator_motion_control.is_end_effector &&
                  propsElement.actuator_motion_control.child_part_type ===
                    'ACTUATOR'
                ) {
                  let currentAxis = propsElement.actuator_motion_control
                    .cylindrical_axis_of_rotation
                    ? propsElement.actuator_motion_control
                        .cylindrical_axis_of_rotation.axis
                      ? new Vector3(
                          propsElement.actuator_motion_control.cylindrical_axis_of_rotation.axis[0],
                          propsElement.actuator_motion_control.cylindrical_axis_of_rotation.axis[1],
                          propsElement.actuator_motion_control.cylindrical_axis_of_rotation.axis[2]
                        )
                      : new Vector3()
                    : new Vector3();
                  let currentPosition = propsElement.actuator_motion_control
                    .cylindrical_axis_of_rotation
                    ? propsElement.actuator_motion_control
                        .cylindrical_axis_of_rotation.position
                      ? new Vector3(
                          propsElement.actuator_motion_control.cylindrical_axis_of_rotation.position[0],
                          propsElement.actuator_motion_control.cylindrical_axis_of_rotation.position[1],
                          propsElement.actuator_motion_control.cylindrical_axis_of_rotation.position[2]
                        )
                      : new Vector3()
                    : new Vector3();

                  let localCurrentQuaternion = localQuaternion.clone();
                  let localCurrentTranslation = localTranslation.clone();
                  let currentShiftedPosition = currentPosition.clone();
                  currentShiftedPosition.sub(localPosition);
                  currentShiftedPosition.applyQuaternion(
                    localCurrentQuaternion
                  );
                  currentShiftedPosition.add(localShiftedPosition);
                  let currentPositionAxis = currentAxis.clone();
                  currentPositionAxis.applyQuaternion(localCurrentQuaternion);
                  currentPositionAxis.normalize();

                  const isLinear =
                    propsElement.actuator_motion_control
                      .is_linear_or_rotational;
                  console.log(
                    'Positional Index',
                    positionalIndex,
                    index,
                    isLinear
                  );
                  if (positionalIndex === index) {
                    positionalIndexFound = true;
                    let differenceBetween = 0;
                    if (isLinear) {
                      let currentOriginalEndEffectorPosition,
                        currentOriginalTargetPosition,
                        currentEndEffectorposition,
                        currentTargetPosition,
                        differencePosition;
                      if (
                        methodIndex === 0 ||
                        methodIndex === 3 ||
                        methodIndex === 4
                      ) {
                        currentOriginalEndEffectorPosition =
                          calculatedMountPosition.clone();

                        currentOriginalTargetPosition =
                          targetEndEffectorPosition.clone();
                      }
                      if (methodIndex === 1 || methodIndex === 2) {
                        currentOriginalEndEffectorPosition =
                          originalEndEffectorPosition.clone();
                        currentOriginalEndEffectorPosition.sub(currentPosition);
                        currentOriginalEndEffectorPosition.applyQuaternion(
                          localCurrentQuaternion
                        );
                        currentOriginalEndEffectorPosition.add(
                          currentShiftedPosition
                        );
                        currentOriginalTargetPosition =
                          originalTargetPosition.clone();
                        currentOriginalTargetPosition.sub(currentPosition);
                        currentOriginalTargetPosition.applyQuaternion(
                          localCurrentQuaternion
                        );
                        currentOriginalTargetPosition.add(
                          currentShiftedPosition
                        );
                      }

                      currentEndEffectorposition =
                        currentOriginalEndEffectorPosition.clone();
                      currentTargetPosition =
                        currentOriginalTargetPosition.clone();
                      differencePosition = new Vector3().subVectors(
                        currentTargetPosition,
                        currentEndEffectorposition
                      );
                      if (methodIndex === 0 || methodIndex === 1) {
                        differenceBetween =
                          differencePosition.x * currentPositionAxis.x +
                          differencePosition.y * currentPositionAxis.y +
                          differencePosition.z * currentPositionAxis.z;

                        if (methodIndex === 0) {
                          leastTheta = differenceBetween;
                          mostTheta = differenceBetween;
                        }
                      }
                      if (methodIndex === 2) {
                        differenceBetween =
                          differencePosition.x * currentPositionAxis.x +
                          differencePosition.y * currentPositionAxis.y +
                          differencePosition.z * currentPositionAxis.z;
                        if (differenceBetween > 0) {
                          differenceBetween = Math.sqrt(
                            differencePosition.x * differencePosition.x +
                              differencePosition.y * differencePosition.y +
                              differencePosition.z * differencePosition.z
                          );
                        } else {
                          differenceBetween = -Math.sqrt(
                            differencePosition.x * differencePosition.x +
                              differencePosition.y * differencePosition.y +
                              differencePosition.z * differencePosition.z
                          );
                        }
                      }
                      if (methodIndex === 3) {
                        differenceBetween = leastTheta / 2;
                      }
                      if (methodIndex === 4) {
                        differenceBetween = mostTheta / 2;
                      }
                    } else {
                      let currentBeforeLocalQuaternion,
                        currentBeforeLocalQuaternionApplied,
                        currentOriginalEndEffectorPosition,
                        currentOriginalTargetPosition =
                          targetEndEffectorPosition.clone();
                      if (
                        methodIndex === 0 ||
                        methodIndex === 2 ||
                        methodIndex === 3 ||
                        methodIndex === 4
                      ) {
                        currentOriginalEndEffectorPosition =
                          calculatedMountPosition.clone();
                        currentOriginalTargetPosition =
                          targetEndEffectorPosition.clone();
                      }
                      if (methodIndex === 1) {
                        currentBeforeLocalQuaternion = new Quaternion();

                        currentBeforeLocalQuaternion
                          .setFromAxisAngle(
                            currentPositionAxis,
                            propsElement.actuator_motion_control.chain_number
                          )
                          .normalize();
                        currentBeforeLocalQuaternionApplied =
                          localCurrentQuaternion.clone();
                        currentBeforeLocalQuaternionApplied
                          .premultiply(currentBeforeLocalQuaternion)
                          .normalize();
                        currentOriginalEndEffectorPosition =
                          originalEndEffectorPosition.clone();
                        currentOriginalEndEffectorPosition.sub(currentPosition);
                        currentOriginalEndEffectorPosition.applyQuaternion(
                          currentBeforeLocalQuaternionApplied
                        );
                        currentOriginalEndEffectorPosition.add(
                          currentShiftedPosition
                        );
                        currentOriginalTargetPosition =
                          originalTargetPosition.clone();
                        currentOriginalTargetPosition.sub(currentPosition);
                        currentOriginalTargetPosition.applyQuaternion(
                          currentBeforeLocalQuaternionApplied
                        );
                        currentOriginalTargetPosition.add(
                          currentShiftedPosition
                        );
                      }

                      let currentEndEffectorposition =
                        currentOriginalEndEffectorPosition.clone();
                      let currentTargetPosition =
                        currentOriginalTargetPosition.clone();
                      currentEndEffectorposition.sub(currentShiftedPosition);

                      currentTargetPosition.sub(currentShiftedPosition);

                      if (methodIndex === 0 || methodIndex === 1) {
                        differenceBetween = this.angleToMoveToTarget(
                          currentPositionAxis,
                          currentEndEffectorposition,
                          currentTargetPosition
                        );
                      }
                      if (methodIndex === 2) {
                        differenceBetween = this.getAngleBetweenVectorsFromAxis(
                          currentPositionAxis,
                          currentEndEffectorposition,
                          currentTargetPosition
                        );
                      }
                      if (methodIndex === 3) {
                        differenceBetween = leastTheta / 2;
                        console.log('Least method theta', leastTheta);
                      }
                      if (methodIndex === 4) {
                        differenceBetween = mostTheta / 2;
                        console.log('Most method theta', mostTheta);
                      }
                    }
                    if (differenceBetween !== 0) {
                      propsElement.actuator_motion_control.chain_number +=
                        differenceBetween;
                      console.log(
                        'Applying difference',
                        differenceBetween,
                        propsElement.actuator_motion_control.chain_number,
                        propsElement.actuator_motion_control.minimum_limit,
                        propsElement.actuator_motion_control.maximum_limit
                      );
                      if (
                        propsElement.actuator_motion_control.chain_number >
                        propsElement.actuator_motion_control.maximum_limit
                      ) {
                        let previousDifferenceBetween = differenceBetween;
                        differenceBetween =
                          propsElement.actuator_motion_control.maximum_limit -
                          propsElement.actuator_motion_control.chain_number +
                          differenceBetween;
                        propsElement.actuator_motion_control.chain_number =
                          propsElement.actuator_motion_control.maximum_limit;
                        console.log(
                          'Applied maximum Limit difference',
                          differenceBetween,
                          previousDifferenceBetween,
                          propsElement.actuator_motion_control.chain_number,
                          propsElement.actuator_motion_control.minimum_limit,
                          propsElement.actuator_motion_control.maximum_limit
                        );
                      }
                      if (
                        propsElement.actuator_motion_control.chain_number <
                        propsElement.actuator_motion_control.minimum_limit
                      ) {
                        let previousDifferenceBetween = differenceBetween;
                        differenceBetween =
                          propsElement.actuator_motion_control.minimum_limit -
                          propsElement.actuator_motion_control.chain_number +
                          differenceBetween;
                        propsElement.actuator_motion_control.chain_number =
                          propsElement.actuator_motion_control.minimum_limit;
                        console.log(
                          'Applied Minimum Limit difference',
                          differenceBetween,
                          previousDifferenceBetween,
                          propsElement.actuator_motion_control.chain_number,
                          propsElement.actuator_motion_control.minimum_limit,
                          propsElement.actuator_motion_control.maximum_limit
                        );
                      }
                      if (leastTheta > differenceBetween) {
                        leastTheta = differenceBetween;
                      }
                      if (mostTheta < differenceBetween) {
                        mostTheta = differenceBetween;
                      }
                    }
                  }

                  let currentAxisQuaternion = new Quaternion();

                  if (isLinear) {
                    const currentLength = Math.sqrt(
                      currentPositionAxis.x * currentPositionAxis.x +
                        currentPositionAxis.y * currentPositionAxis.y +
                        currentPositionAxis.z * currentPositionAxis.z
                    );
                    if (currentLength !== 0) {
                      localCurrentTranslation.add(
                        new Vector3(
                          (currentPositionAxis.x *
                            propsElement.actuator_motion_control.chain_number) /
                            currentLength,
                          (currentPositionAxis.y *
                            propsElement.actuator_motion_control.chain_number) /
                            currentLength,
                          (currentPositionAxis.z *
                            propsElement.actuator_motion_control.chain_number) /
                            currentLength
                        )
                      );
                    }
                  } else {
                    currentAxisQuaternion
                      .setFromAxisAngle(
                        currentPositionAxis,
                        propsElement.actuator_motion_control.chain_number
                      )
                      .normalize();
                    localCurrentQuaternion
                      .premultiply(currentAxisQuaternion)
                      .normalize();
                  }

                  let shiftedPosition = currentPosition.clone();
                  shiftedPosition.applyQuaternion(localQuaternion);
                  shiftedPosition.add(globalShiftedPosition);
                  let shiftingPosition = currentPosition.clone();
                  shiftingPosition.applyQuaternion(localCurrentQuaternion);
                  shiftedPosition.sub(shiftingPosition);
                  shiftedPosition.sub(localTranslation);
                  shiftedPosition.add(localCurrentTranslation);

                  localPosition = currentPosition.clone();
                  localQuaternion = localCurrentQuaternion.clone();
                  localShiftedPosition = currentShiftedPosition.clone();
                  localTranslation = localCurrentTranslation.clone();
                  globalShiftedPosition = shiftedPosition.clone();
                } else {
                  // console.log(
                  //   'Not an actuator',
                  //   propsElement,
                  //   index,
                  //   localPosition,
                  //   localQuaternion,
                  //   calculatedMountPosition
                  // );
                }
                if (
                  currentNode &&
                  propsElement &&
                  propsElement.actuator_motion_control &&
                  propsElement.actuator_motion_control.is_end_effector &&
                  propsElement.actuator_motion_control.child_part_type ===
                    'ACTUATOR'
                ) {
                  if (this.props.itemProperties) {
                    const itemProperties = this.props.itemProperties;
                    //console.log('Got itemproperties as', itemProperties);
                    if (
                      itemProperties.actuator_motion_control &&
                      itemProperties.actuator_motion_control
                        .cylindrical_axis_of_rotation &&
                      itemProperties.actuator_motion_control
                        .cylindrical_axis_of_rotation.mountobb
                    ) {
                      const mountSurface =
                        itemProperties.actuator_motion_control
                          .cylindrical_axis_of_rotation.mountobb;
                      let mountPosition = new Vector3(
                        mountSurface.cx,
                        mountSurface.cy,
                        mountSurface.cz
                      );
                      mountPosition.sub(localPosition);
                      mountPosition.applyQuaternion(localQuaternion);
                      mountPosition.add(localShiftedPosition);
                      let currentTargetPosition =
                        targetEndEffectorPosition.clone();
                      let differenceCalcuatedPosition =
                        new Vector3().subVectors(
                          currentTargetPosition,
                          mountPosition
                        );
                      let differenceCalculatedBetween =
                        differenceCalcuatedPosition.x *
                          differenceCalcuatedPosition.x +
                        differenceCalcuatedPosition.y *
                          differenceCalcuatedPosition.y +
                        differenceCalcuatedPosition.z *
                          differenceCalcuatedPosition.z;
                      if (
                        differenceCalculatedBetween <
                        lengthBetweenTargetAndEndEffector
                      ) {
                        changeMadeInInnerLoop = true;
                        couldFindTheta = true;
                        changeMade = true;
                        if (
                          differenceCalculatedBetween <=
                          (this.state.kinematicPrecision || 0.00000001)
                        ) {
                          foundThePosition = true;
                          console.log(
                            'Reached after ',
                            iteration + 1,
                            'iterations',
                            'error rate',
                            differenceCalculatedBetween
                          );
                        } else {
                          console.log(
                            'Difference Length',
                            differenceCalculatedBetween,
                            lengthBetweenTargetAndEndEffector,
                            calculatedMountPosition,
                            targetEndEffectorPosition,
                            mountPosition,
                            'iteration no',
                            iteration + 1
                          );
                        }
                        lengthBetweenTargetAndEndEffector =
                          differenceCalculatedBetween;
                        calculatedMountPosition = mountPosition.clone();
                        originalTargetPosition =
                          targetEndEffectorPosition.clone();
                        originalTargetPosition.sub(localShiftedPosition);
                        originalTargetPosition.applyQuaternion(
                          localQuaternion.clone().invert()
                        );
                        originalTargetPosition.add(localPosition);
                        console.log(
                          'Got original target pos',
                          originalTargetPosition,
                          new Vector3(
                            mountSurface.cx,
                            mountSurface.cy,
                            mountSurface.cz
                          )
                        );
                      } else {
                        console.log(
                          'Difference Length Exceeds',
                          differenceCalculatedBetween,
                          lengthBetweenTargetAndEndEffector,
                          calculatedMountPosition,
                          targetEndEffectorPosition,
                          mountPosition,
                          localPosition,
                          localQuaternion,
                          'iteration',
                          iteration + 1
                        );
                        // for (
                        //   let chainPrintIndex = 0;
                        //   chainPrintIndex < calculatedKinematicItemList.length;
                        //   chainPrintIndex++
                        // ) {
                        //   console.log(
                        //     calculatedKinematicItemList[chainPrintIndex]
                        //       .actuator_motion_control,
                        //     previousCalculatedKinematicItemList[chainPrintIndex]
                        //       .actuator_motion_control
                        //   );
                        // }
                        calculatedKinematicItemList = this.cloneList(
                          previousCalculatedKinematicItemList
                        );
                      }
                    }
                  }
                }
                if (foundThePosition) {
                  break;
                }
              }
              if (foundThePosition) {
                break;
              }
              if (changeMadeInInnerLoop) {
                break;
              }
              if (!positionalIndexFound) {
                console.log('end effector or not an actuator');
                break;
              }
            }

            if (foundThePosition) {
              break;
            }
          }
          if (foundThePosition) {
            break;
          }
          directionIndex = 1;
          if (!couldFindTheta) {
            console.log(
              'Not reachable beyond this',
              iteration + 1,
              'iterations',
              lengthBetweenTargetAndEndEffector,
              'error rate'
            );
            break;
          }
        }
        if (this.props.setKinematicItemList && changeMade) {
          for (
            let displayIndex = 0;
            displayIndex < this.props.kinematicItemList.length;
            displayIndex++
          ) {
            const propsElement = this.props.kinematicItemList[displayIndex];
            const calcElement = calculatedKinematicItemList[displayIndex];
            console.log(
              'My values',
              displayIndex,
              propsElement.actuator_motion_control.chain_number,
              calcElement.actuator_motion_control.chain_number
            );
          }
          this.props.setKinematicItemList(
            this.cloneList(calculatedKinematicItemList)
          );
        }

        //To do set kinematic item list with newly found values...
      }
    }
  };
  displayForDebug = (calculatedKinematicItemList, flag, parsedIndexInfo) => {
    const maxLengthItem = calculatedKinematicItemList.length;
    const chainOrList = flag === 'My Values';
    for (
      let displayIndex = 0;
      displayIndex < this.props.kinematicItemList.length;
      displayIndex++
    ) {
      let propsElement = this.props.kinematicItemList[displayIndex];
      if (chainOrList && parsedIndexInfo) {
        let [
          sequence,
          sequenceItem,
          propsElementIndex,
          currentNodeIndex,
          isActuatorNode,
          isLinearNode,
          isEndEffectorNode,
          currentAxisNode,
          currentPositionNode
        ] = parsedIndexInfo[displayIndex];
        propsElement =
          this.props.kinematicItemList[
            propsElementIndex === -1 ? index : propsElementIndex
          ];
      }
      const calcElement =
        calculatedKinematicItemList[
          (parsedIndexInfo ? displayIndex + 1 : displayIndex) < maxLengthItem
            ? parsedIndexInfo
              ? displayIndex + 1
              : displayIndex
            : maxLengthItem
        ];
      console.log(
        flag,
        displayIndex,
        propsElement.actuator_motion_control.chain_number,
        calcElement
          ? chainOrList
            ? parsedIndexInfo
              ? calcElement.A
              : calcElement
            : calcElement.actuator_motion_control.chain_number
          : ''
      );
    }
  };
  calculateInverseKinematicMovement_unOptimized = (
    prevProps,
    parsedIndexInfo
  ) => {
    if (
      JSON.stringify(prevProps ? prevProps.xyzControlPosition || [] : []) !==
        JSON.stringify(this.props.xyzControlPosition || []) &&
      JSON.stringify(parsedIndexInfo || []) !== JSON.stringify([])
    ) {
      if (
        this.props.showKinematicSliderMove &&
        this.props.kinematicItemList &&
        this.partsMeshes &&
        this.partsMeshes.length > 0 &&
        this.props.kinematicItemList.length > 0 &&
        this.props.xyzEndEffectorPosition
      ) {
        let calculatedKinematicItemChain = this.cloneChainForward(
          this.props.kinematicItemList
        );
        let currentMountPosition = new Vector3(
          this.props.xyzEndEffectorPosition.X,
          this.props.xyzEndEffectorPosition.Y,
          this.props.xyzEndEffectorPosition.Z
        );
        let targetEndEffectorPosition = new Vector3(
          this.props.xyzControlPosition.X,
          this.props.xyzControlPosition.Y,
          this.props.xyzControlPosition.Z
        );
        const differenceBetweenTargetAndEndEffector = new Vector3().subVectors(
          targetEndEffectorPosition,
          currentMountPosition
        );
        let lengthBetweenTargetAndEndEffector =
          differenceBetweenTargetAndEndEffector.x *
            differenceBetweenTargetAndEndEffector.x +
          differenceBetweenTargetAndEndEffector.y *
            differenceBetweenTargetAndEndEffector.y +
          differenceBetweenTargetAndEndEffector.z *
            differenceBetweenTargetAndEndEffector.z;
        if (lengthBetweenTargetAndEndEffector === 0) {
          return;
        }
        let originalEndEffectorPosition =
          this.props.xyzEndEffectorPosition.M.clone();
        let originalLocalPosition = this.props.xyzEndEffectorPosition.L.clone();
        let originalLocalShiftedPosition =
          this.props.xyzEndEffectorPosition.S.clone();
        let originallocalTranslation =
          this.props.xyzEndEffectorPosition.T.clone();
        let originalLocalQuaternion =
          this.props.xyzEndEffectorPosition.Q.clone().invert();
        let originalTargetPosition = targetEndEffectorPosition.clone();
        originalTargetPosition.sub(originallocalTranslation);
        originalTargetPosition.sub(originalLocalShiftedPosition);
        originalTargetPosition.applyQuaternion(originalLocalQuaternion);
        originalTargetPosition.add(originalLocalPosition);

        let calculatedMountPosition = currentMountPosition.clone();

        let direction = -1;
        let directionMultiplier = -1;
        let foundThePosition = false;
        let changeMade = false;
        let directionIndex = 0;

        const howManyIterations = this.props.kinematicParameters
          ? this.props.kinematicParameters.iterations || 21
          : 21;
        for (let iteration = 0; iteration < howManyIterations; iteration++) {
          direction *= directionMultiplier;
          let couldFindTheta = false;
          for (
            ;
            directionIndex < calculatedKinematicItemChain.length - 1;
            directionIndex++
          ) {
            const positionalIndex =
              direction === 1
                ? directionIndex
                : calculatedKinematicItemChain.length - directionIndex - 2;

            let previousCalculatedKinematicItemChain = this.cloneList(
              calculatedKinematicItemChain
            );
            let leastTheta = 6.28;
            let mostTheta = -6.28;
            const howManyMethods = this.props.kinematicParameters
              ? this.props.kinematicParameters.methods || 1
              : 1;
            for (
              let methodIndex = 0;
              methodIndex < howManyMethods;
              methodIndex++
            ) {
              let localQuaternion = new Quaternion(0, 0, 0, 1);
              let localPosition = new Vector3(0, 0, 0);
              //let localPreviousPosition = new Vector3(0, 0, 0);
              let localTranslation = new Vector3(0, 0, 0);
              let localShiftedPosition = new Vector3(0, 0, 0);
              let globalShiftedPosition = new Vector3(0, 0, 0);
              let changeMadeInInnerLoop = false;
              let positionalIndexFound = false;
              for (
                let index = 0;
                index < calculatedKinematicItemChain.length;
                index++
              ) {
                let [
                  sequence,
                  sequenceItem,
                  propsElementIndex,
                  currentNodeIndex,
                  isActuatorNode,
                  isLinearNode,
                  isEndEffectorNode,
                  currentAxisNode,
                  currentPositionNode
                ] = parsedIndexInfo[index];
                let propsElement =
                  this.props.kinematicItemList[
                    propsElementIndex === -1 ? index : propsElementIndex
                  ];
                let currentChainValue =
                  calculatedKinematicItemChain[
                    propsElementIndex === -1 ? index : propsElementIndex
                  ];

                if (isActuatorNode) {
                  const currentAxis = currentAxisNode;
                  const currentPosition = currentPositionNode;

                  let localCurrentQuaternion = localQuaternion.clone();
                  let localCurrentTranslation = localTranslation.clone();
                  let currentShiftedPosition = currentPosition.clone();
                  currentShiftedPosition.sub(localPosition);
                  currentShiftedPosition.applyQuaternion(
                    localCurrentQuaternion
                  );
                  currentShiftedPosition.add(localShiftedPosition);
                  let currentPositionAxis = currentAxis.clone();
                  currentPositionAxis.applyQuaternion(localCurrentQuaternion);
                  currentPositionAxis.normalize();

                  const isLinear = isLinearNode;
                  if (positionalIndex === index) {
                    positionalIndexFound = true;
                    let differenceBetween = 0;
                    if (isLinear) {
                      let currentOriginalEndEffectorPosition,
                        currentOriginalTargetPosition,
                        currentEndEffectorposition,
                        currentTargetPosition,
                        differencePosition;
                      if (
                        methodIndex === 0 ||
                        methodIndex === 3 ||
                        methodIndex === 4
                      ) {
                        currentOriginalEndEffectorPosition =
                          calculatedMountPosition.clone();

                        currentOriginalTargetPosition =
                          targetEndEffectorPosition.clone();
                      }
                      if (methodIndex === 1 || methodIndex === 2) {
                        currentOriginalEndEffectorPosition =
                          originalEndEffectorPosition.clone();
                        currentOriginalEndEffectorPosition.sub(currentPosition);
                        currentOriginalEndEffectorPosition.applyQuaternion(
                          localCurrentQuaternion
                        );
                        currentOriginalEndEffectorPosition.add(
                          currentShiftedPosition
                        );
                        currentOriginalTargetPosition =
                          originalTargetPosition.clone();
                        currentOriginalTargetPosition.sub(currentPosition);
                        currentOriginalTargetPosition.applyQuaternion(
                          localCurrentQuaternion
                        );
                        currentOriginalTargetPosition.add(
                          currentShiftedPosition
                        );
                      }

                      currentEndEffectorposition =
                        currentOriginalEndEffectorPosition.clone();
                      currentTargetPosition =
                        currentOriginalTargetPosition.clone();
                      differencePosition = new Vector3().subVectors(
                        currentTargetPosition,
                        currentEndEffectorposition
                      );
                      if (methodIndex === 0 || methodIndex === 1) {
                        differenceBetween =
                          differencePosition.x * currentPositionAxis.x +
                          differencePosition.y * currentPositionAxis.y +
                          differencePosition.z * currentPositionAxis.z;

                        if (methodIndex === 0) {
                          leastTheta = differenceBetween;
                          mostTheta = differenceBetween;
                        }
                      }
                      if (methodIndex === 2) {
                        differenceBetween =
                          differencePosition.x * currentPositionAxis.x +
                          differencePosition.y * currentPositionAxis.y +
                          differencePosition.z * currentPositionAxis.z;
                        if (differenceBetween > 0) {
                          differenceBetween = Math.sqrt(
                            differencePosition.x * differencePosition.x +
                              differencePosition.y * differencePosition.y +
                              differencePosition.z * differencePosition.z
                          );
                        } else {
                          differenceBetween = -Math.sqrt(
                            differencePosition.x * differencePosition.x +
                              differencePosition.y * differencePosition.y +
                              differencePosition.z * differencePosition.z
                          );
                        }
                      }
                      if (methodIndex === 3) {
                        differenceBetween = leastTheta / 2;
                      }
                      if (methodIndex === 4) {
                        differenceBetween = mostTheta / 2;
                      }
                    } else {
                      let currentBeforeLocalQuaternion,
                        currentBeforeLocalQuaternionApplied,
                        currentOriginalEndEffectorPosition,
                        currentOriginalTargetPosition =
                          targetEndEffectorPosition.clone();
                      if (
                        methodIndex === 0 ||
                        methodIndex === 2 ||
                        methodIndex === 3 ||
                        methodIndex === 4
                      ) {
                        currentOriginalEndEffectorPosition =
                          calculatedMountPosition.clone();
                        currentOriginalTargetPosition =
                          targetEndEffectorPosition.clone();
                      }
                      if (methodIndex === 1) {
                        currentBeforeLocalQuaternion = new Quaternion();

                        currentBeforeLocalQuaternion
                          .setFromAxisAngle(
                            currentPositionAxis,
                            currentChainValue
                          )
                          .normalize();
                        currentBeforeLocalQuaternionApplied =
                          localCurrentQuaternion.clone();
                        currentBeforeLocalQuaternionApplied
                          .premultiply(currentBeforeLocalQuaternion)
                          .normalize();
                        currentOriginalEndEffectorPosition =
                          originalEndEffectorPosition.clone();
                        currentOriginalEndEffectorPosition.sub(currentPosition);
                        currentOriginalEndEffectorPosition.applyQuaternion(
                          currentBeforeLocalQuaternionApplied
                        );
                        currentOriginalEndEffectorPosition.add(
                          currentShiftedPosition
                        );
                        currentOriginalTargetPosition =
                          originalTargetPosition.clone();
                        currentOriginalTargetPosition.sub(currentPosition);
                        currentOriginalTargetPosition.applyQuaternion(
                          currentBeforeLocalQuaternionApplied
                        );
                        currentOriginalTargetPosition.add(
                          currentShiftedPosition
                        );
                      }

                      let currentEndEffectorposition =
                        currentOriginalEndEffectorPosition.clone();
                      let currentTargetPosition =
                        currentOriginalTargetPosition.clone();
                      currentEndEffectorposition.sub(currentShiftedPosition);

                      currentTargetPosition.sub(currentShiftedPosition);

                      if (methodIndex === 0 || methodIndex === 1) {
                        differenceBetween = this.angleToMoveToTarget(
                          currentPositionAxis,
                          currentEndEffectorposition,
                          currentTargetPosition
                        );
                      }
                      if (methodIndex === 2) {
                        differenceBetween = this.getAngleBetweenVectorsFromAxis(
                          currentPositionAxis,
                          currentEndEffectorposition,
                          currentTargetPosition
                        );
                      }
                      if (methodIndex === 3) {
                        differenceBetween = leastTheta / 2;
                        //console.log('Least method theta', leastTheta);
                      }
                      if (methodIndex === 4) {
                        differenceBetween = mostTheta / 2;
                        //console.log('Most method theta', mostTheta);
                      }
                    }
                    if (differenceBetween !== 0) {
                      currentChainValue += differenceBetween;
                      console.log(
                        'Applying difference',
                        differenceBetween,
                        currentChainValue,
                        propsElement.actuator_motion_control.minimum_limit,
                        propsElement.actuator_motion_control.maximum_limit
                      );
                      if (
                        currentChainValue >
                        propsElement.actuator_motion_control.maximum_limit
                      ) {
                        let previousDifferenceBetween = differenceBetween;
                        differenceBetween =
                          propsElement.actuator_motion_control.maximum_limit -
                          currentChainValue +
                          differenceBetween;
                        currentChainValue =
                          propsElement.actuator_motion_control.maximum_limit;
                        console.log(
                          'Applied maximum Limit difference',
                          differenceBetween,
                          previousDifferenceBetween,
                          currentChainValue,
                          propsElement.actuator_motion_control.minimum_limit,
                          propsElement.actuator_motion_control.maximum_limit
                        );
                      }
                      if (
                        currentChainValue <
                        propsElement.actuator_motion_control.minimum_limit
                      ) {
                        let previousDifferenceBetween = differenceBetween;
                        differenceBetween =
                          propsElement.actuator_motion_control.minimum_limit -
                          currentChainValue +
                          differenceBetween;
                        currentChainValue =
                          propsElement.actuator_motion_control.minimum_limit;
                        console.log(
                          'Applied Minimum Limit difference',
                          differenceBetween,
                          previousDifferenceBetween,
                          currentChainValue,
                          propsElement.actuator_motion_control.minimum_limit,
                          propsElement.actuator_motion_control.maximum_limit
                        );
                      }
                      if (leastTheta > differenceBetween) {
                        leastTheta = differenceBetween;
                      }
                      if (mostTheta < differenceBetween) {
                        mostTheta = differenceBetween;
                      }
                      calculatedKinematicItemChain[
                        propsElementIndex === -1 ? index : propsElementIndex
                      ] = currentChainValue;
                    }
                  }

                  let currentAxisQuaternion = new Quaternion();

                  if (isLinear) {
                    const currentLength = Math.sqrt(
                      currentPositionAxis.x * currentPositionAxis.x +
                        currentPositionAxis.y * currentPositionAxis.y +
                        currentPositionAxis.z * currentPositionAxis.z
                    );
                    if (currentLength !== 0) {
                      localCurrentTranslation.add(
                        new Vector3(
                          (currentPositionAxis.x * currentChainValue) /
                            currentLength,
                          (currentPositionAxis.y * currentChainValue) /
                            currentLength,
                          (currentPositionAxis.z * currentChainValue) /
                            currentLength
                        )
                      );
                    }
                  } else {
                    currentAxisQuaternion
                      .setFromAxisAngle(currentPositionAxis, currentChainValue)
                      .normalize();
                    localCurrentQuaternion
                      .premultiply(currentAxisQuaternion)
                      .normalize();
                    // console.log(
                    //   'Quaternions',
                    //   currentPositionAxis,
                    //   propsElement.actuator_motion_control.chain_number,
                    //   localCurrentQuaternion
                    // );
                  }

                  let shiftedPosition = currentPosition.clone();
                  shiftedPosition.applyQuaternion(localQuaternion);
                  shiftedPosition.add(globalShiftedPosition);
                  let shiftingPosition = currentPosition.clone();
                  shiftingPosition.applyQuaternion(localCurrentQuaternion);
                  shiftedPosition.sub(shiftingPosition);
                  shiftedPosition.sub(localTranslation);
                  shiftedPosition.add(localCurrentTranslation);

                  localPosition = currentPosition.clone();
                  localQuaternion = localCurrentQuaternion.clone();
                  localShiftedPosition = currentShiftedPosition.clone();
                  localTranslation = localCurrentTranslation.clone();
                  globalShiftedPosition = shiftedPosition.clone();
                } else {
                  // console.log(
                  //   'Not an actuator',
                  //   propsElement,
                  //   index,
                  //   localPosition,
                  //   localQuaternion,
                  //   calculatedMountPosition
                  // );
                }
                if (isEndEffectorNode) {
                  if (this.props.itemProperties) {
                    const itemProperties = this.props.itemProperties;
                    //console.log('Got itemproperties as', itemProperties);
                    if (
                      itemProperties.actuator_motion_control &&
                      itemProperties.actuator_motion_control
                        .cylindrical_axis_of_rotation &&
                      itemProperties.actuator_motion_control
                        .cylindrical_axis_of_rotation.mountobb
                    ) {
                      const mountSurface =
                        itemProperties.actuator_motion_control
                          .cylindrical_axis_of_rotation.mountobb;
                      let mountPosition = new Vector3(
                        mountSurface.cx,
                        mountSurface.cy,
                        mountSurface.cz
                      );
                      mountPosition.sub(localPosition);
                      mountPosition.applyQuaternion(localQuaternion);
                      mountPosition.add(localShiftedPosition);
                      mountPosition.add(localTranslation);
                      let currentTargetPosition =
                        targetEndEffectorPosition.clone();
                      let differenceCalcuatedPosition =
                        new Vector3().subVectors(
                          currentTargetPosition,
                          mountPosition
                        );
                      let differenceCalculatedBetween =
                        differenceCalcuatedPosition.x *
                          differenceCalcuatedPosition.x +
                        differenceCalcuatedPosition.y *
                          differenceCalcuatedPosition.y +
                        differenceCalcuatedPosition.z *
                          differenceCalcuatedPosition.z;
                      if (
                        differenceCalculatedBetween <
                        lengthBetweenTargetAndEndEffector
                      ) {
                        changeMadeInInnerLoop = true;
                        couldFindTheta = true;
                        changeMade = true;
                        if (
                          differenceCalculatedBetween <=
                          (this.state.kinematicPrecision || 0.00000001)
                        ) {
                          foundThePosition = true;
                          console.log(
                            'Reached after ',
                            iteration + 1,
                            'iterations',
                            'error rate',
                            differenceCalculatedBetween,
                            lengthBetweenTargetAndEndEffector,
                            calculatedMountPosition,
                            targetEndEffectorPosition,
                            mountPosition,
                            localPosition,
                            localQuaternion
                          );
                        } else {
                          console.log(
                            'Difference Length',
                            differenceCalculatedBetween,
                            lengthBetweenTargetAndEndEffector,
                            calculatedMountPosition,
                            targetEndEffectorPosition,
                            mountPosition,
                            localPosition,
                            localQuaternion,
                            'iteration no',
                            iteration + 1
                          );
                        }
                        lengthBetweenTargetAndEndEffector =
                          differenceCalculatedBetween;
                        calculatedMountPosition = mountPosition.clone();
                        originalTargetPosition =
                          targetEndEffectorPosition.clone();
                        originalTargetPosition.sub(localTranslation);
                        originalTargetPosition.sub(localShiftedPosition);
                        originalTargetPosition.applyQuaternion(
                          localQuaternion.clone().invert()
                        );
                        originalTargetPosition.add(localPosition);
                        console.log(
                          'Got original target pos',
                          originalTargetPosition,
                          new Vector3(
                            mountSurface.cx,
                            mountSurface.cy,
                            mountSurface.cz
                          )
                        );
                      } else {
                        console.log(
                          'Difference Length Exceeds',
                          differenceCalculatedBetween,
                          lengthBetweenTargetAndEndEffector,
                          calculatedMountPosition,
                          targetEndEffectorPosition,
                          mountPosition,
                          localPosition,
                          localQuaternion,
                          'iteration',
                          iteration + 1
                        );
                        // for (
                        //   let chainPrintIndex = 0;
                        //   chainPrintIndex < calculatedKinematicItemList.length;
                        //   chainPrintIndex++
                        // ) {
                        //   console.log(
                        //     calculatedKinematicItemList[chainPrintIndex]
                        //       .actuator_motion_control,
                        //     previousCalculatedKinematicItemList[chainPrintIndex]
                        //       .actuator_motion_control
                        //   );
                        // }
                        calculatedKinematicItemChain = this.cloneList(
                          previousCalculatedKinematicItemChain
                        );
                      }
                    }
                  }
                }
                if (foundThePosition) {
                  break;
                }
              }
              if (foundThePosition) {
                break;
              }
              if (changeMadeInInnerLoop) {
                break;
              }
              if (!positionalIndexFound) {
                console.log('end effector or not an actuator');
                break;
              }
            }

            if (foundThePosition) {
              break;
            }
          }
          if (foundThePosition) {
            break;
          }
          directionIndex = 1;
          if (!couldFindTheta) {
            console.log(
              'Not reachable beyond this',
              iteration + 1,
              'iterations',
              lengthBetweenTargetAndEndEffector,
              'error rate'
            );
            break;
          }
        }
        if (this.props.setKinematicItemList && changeMade) {
          this.displayForDebug(calculatedKinematicItemChain, 'My Values');
          console.log(
            'Current and Target',
            currentMountPosition,
            targetEndEffectorPosition
          );
          this.props.setKinematicItemList(
            this.cloneChainBackward(
              calculatedKinematicItemChain,
              this.props.kinematicItemList
            )
          );
        }

        //To do set kinematic item list with newly found values...
      }
    }
  };
  calculateInverseKinematicMovement = (
    prevProps,
    parsedIndexInfo,
    kinematicDimension,
    beginDimension
  ) => {
    if (
      JSON.stringify(prevProps ? prevProps.xyzControlPosition || [] : []) !==
        JSON.stringify(this.props.xyzControlPosition || []) &&
      JSON.stringify(parsedIndexInfo || []) !== JSON.stringify([])
    ) {
      if (
        this.props.showKinematicSliderMove &&
        this.props.kinematicItemList &&
        this.partsMeshes &&
        this.partsMeshes.length > 0 &&
        this.props.kinematicItemList.length > 0 &&
        this.props.xyzEndEffectorPosition
      ) {
        let currentMountPosition = new Vector3(
          this.props.xyzEndEffectorPosition.X,
          this.props.xyzEndEffectorPosition.Y,
          this.props.xyzEndEffectorPosition.Z
        );
        let targetEndEffectorPosition = new Vector3(
          this.props.xyzControlPosition.X,
          this.props.xyzControlPosition.Y,
          this.props.xyzControlPosition.Z
        );
        const differenceBetweenTargetAndEndEffector = new Vector3().subVectors(
          targetEndEffectorPosition,
          currentMountPosition
        );
        let lengthBetweenTargetAndEndEffector =
          differenceBetweenTargetAndEndEffector.x *
            differenceBetweenTargetAndEndEffector.x +
          differenceBetweenTargetAndEndEffector.y *
            differenceBetweenTargetAndEndEffector.y +
          differenceBetweenTargetAndEndEffector.z *
            differenceBetweenTargetAndEndEffector.z;
        if (lengthBetweenTargetAndEndEffector === 0) {
          return;
        }
        let beginPosition = new Vector3(
          kinematicDimension.X,
          kinematicDimension.Y,
          kinematicDimension.Z
        );
        let originBeginPosition = this.getVectorFromDimension(beginDimension);
        let originalXYZShiftablePosition = new Vector3(0, 0, 0);
        originalXYZShiftablePosition.subVectors(
          beginPosition,
          originBeginPosition
        );
        console.log(
          'begin from calculate inverse',
          beginPosition,
          'origin begin',
          originBeginPosition,
          'diff',
          originalXYZShiftablePosition
        );
        let calculatedKinematicItemChain = this.cloneChainInfoForward(
          this.props.xyzEndEffectorPosition.K
        );
        const beginOfActuator = this.props.xyzEndEffectorPosition.B;
        const endOfActuator = this.props.xyzEndEffectorPosition.E;
        let originalEndEffectorPosition =
          this.props.xyzEndEffectorPosition.M.clone();
        let originalLocalPosition = this.props.xyzEndEffectorPosition.L.clone();
        let originalLocalShiftedPosition =
          this.props.xyzEndEffectorPosition.S.clone();
        let originallocalTranslation =
          this.props.xyzEndEffectorPosition.T.clone();
        let originalLocalQuaternion =
          this.props.xyzEndEffectorPosition.Q.clone().invert();

        let originalTargetPosition = targetEndEffectorPosition.clone();
        originalTargetPosition.sub(originalXYZShiftablePosition);
        originalTargetPosition.sub(originallocalTranslation);
        originalTargetPosition.sub(originalLocalShiftedPosition);
        originalTargetPosition.applyQuaternion(originalLocalQuaternion);
        originalTargetPosition.add(originalLocalPosition);

        let calculatedMountPosition = currentMountPosition.clone();

        //mountposition, targetendeffector positition changes..

        let direction = false;
        //let directionMultiplier = -1;
        let foundThePosition = false;
        let changeMade = false;
        let directionIndex = 0;

        // console.log(
        //   'GOt inititally',
        //   currentMountPosition,
        //   originalEndEffectorPosition,
        //   originalTargetPosition,
        //   targetEndEffectorPosition
        // );
        const howManyIterations = this.props.kinematicParameters
          ? this.props.kinematicParameters.iterations +
              ((this.props.kinematicParameters.iterations + 1) % 2) || 21
          : 21;
        for (let iteration = 0; iteration < howManyIterations; iteration++) {
          direction = !direction;
          let couldFindTheta = false;
          //let lastPositionalIndex = 0;
          //let startPositionalIndex = 0;
          directionIndex = beginOfActuator;
          for (; directionIndex < endOfActuator; directionIndex++) {
            const positionalIndex =
              direction === true
                ? directionIndex
                : endOfActuator - directionIndex + beginOfActuator - 1;
            const isActuatorOrEndEffector =
              calculatedKinematicItemChain[positionalIndex + 1].K;
            if (isActuatorOrEndEffector) {
              let previousCalculatedKinematicItemChain =
                this.cloneChainInfoForward(calculatedKinematicItemChain);
              let leastTheta = 6.28;
              let mostTheta = -6.28;
              const howManyMethods = this.props.kinematicParameters
                ? this.props.kinematicParameters.methods || 1
                : 1;
              for (
                let methodIndex = 0;
                methodIndex < howManyMethods;
                methodIndex++
              ) {
                let localQuaternion =
                  calculatedKinematicItemChain[positionalIndex].Q;
                let localPosition =
                  calculatedKinematicItemChain[positionalIndex].L;
                let localTranslation =
                  calculatedKinematicItemChain[positionalIndex].T;
                let localShiftedPosition =
                  calculatedKinematicItemChain[positionalIndex].S;
                //let globalShiftedPosition = new Vector3(0, 0, 0);
                let changeMadeInInnerLoop = false;
                let positionalIndexFound = false;
                for (
                  let index = positionalIndex;
                  index < calculatedKinematicItemChain.length - 1;
                  index++
                ) {
                  // console.log(
                  //   'Parsed Index info',
                  //   index,
                  //   positionalIndex,
                  //   beginOfActuator,
                  //   endOfActuator,
                  //   directionIndex
                  // );
                  let [
                    sequence,
                    sequenceItem,
                    propsElementIndex,
                    currentNodeIndex,
                    isActuatorNode,
                    isLinearNode,
                    isEndEffectorNode,
                    currentAxisNode,
                    currentPositionNode
                  ] = parsedIndexInfo[index];

                  let currentChainValue =
                    calculatedKinematicItemChain[index + 1];

                  if (isActuatorNode) {
                    let propsElement =
                      this.props.kinematicItemList[
                        propsElementIndex === -1 ? index : propsElementIndex
                      ];
                    const currentAxis = currentAxisNode;
                    const currentPosition = currentPositionNode;
                    // localQuaternion = calculatedKinematicItemChain[index].Q;
                    // localPosition = calculatedKinematicItemChain[index].L;
                    // localTranslation = calculatedKinematicItemChain[index].T;
                    // localShiftedPosition = calculatedKinematicItemChain[index].S;
                    let localCurrentQuaternion = localQuaternion.clone();
                    let localCurrentTranslation = localTranslation.clone();
                    let currentShiftedPosition = currentPosition.clone();
                    currentShiftedPosition.sub(localPosition);
                    currentShiftedPosition.applyQuaternion(
                      localCurrentQuaternion
                    );
                    currentShiftedPosition.add(localShiftedPosition);
                    let currentPositionAxis = currentAxis.clone();
                    currentPositionAxis.applyQuaternion(localCurrentQuaternion);
                    currentPositionAxis.normalize();

                    const isLinear = isLinearNode;
                    if (positionalIndex === index) {
                      positionalIndexFound = true;
                      let differenceBetween = 0;
                      if (isLinear) {
                        let currentOriginalEndEffectorPosition,
                          currentOriginalTargetPosition,
                          currentEndEffectorposition,
                          currentTargetPosition,
                          differencePosition;
                        if (
                          methodIndex === 0 ||
                          methodIndex === 4 ||
                          methodIndex === 5
                        ) {
                          currentOriginalEndEffectorPosition =
                            calculatedMountPosition.clone();

                          currentOriginalTargetPosition =
                            targetEndEffectorPosition.clone();
                        }
                        if (methodIndex === 1 || methodIndex === 3) {
                          currentOriginalEndEffectorPosition =
                            originalEndEffectorPosition.clone();
                          currentOriginalEndEffectorPosition.sub(
                            currentPosition
                          );
                          currentOriginalEndEffectorPosition.applyQuaternion(
                            localCurrentQuaternion
                          );
                          currentOriginalEndEffectorPosition.add(
                            currentShiftedPosition
                          );
                          currentOriginalTargetPosition =
                            originalTargetPosition.clone();
                          currentOriginalTargetPosition.sub(currentPosition);
                          currentOriginalTargetPosition.applyQuaternion(
                            localCurrentQuaternion
                          );
                          currentOriginalTargetPosition.add(
                            currentShiftedPosition
                          );
                        }
                        if (methodIndex === 2) {
                          currentOriginalEndEffectorPosition =
                            originalEndEffectorPosition.clone();
                          currentOriginalTargetPosition =
                            originalTargetPosition.clone();
                        }
                        // console.log(
                        //   'Method Index',
                        //   methodIndex,
                        //   currentOriginalEndEffectorPosition,
                        //   this.props.kinematicParameters,
                        //   this.props.kinematicParameters
                        //     ? this.props.kinematicParameters.methods || 5
                        //     : 5
                        // );
                        currentEndEffectorposition =
                          currentOriginalEndEffectorPosition.clone();
                        currentTargetPosition =
                          currentOriginalTargetPosition.clone();
                        differencePosition = new Vector3().subVectors(
                          currentTargetPosition,
                          currentEndEffectorposition
                        );
                        if (methodIndex === 0 || methodIndex === 1) {
                          differenceBetween =
                            differencePosition.x * currentPositionAxis.x +
                            differencePosition.y * currentPositionAxis.y +
                            differencePosition.z * currentPositionAxis.z;

                          if (methodIndex === 0) {
                            leastTheta = differenceBetween;
                            mostTheta = differenceBetween;
                          }
                        }
                        if (methodIndex === 2) {
                          differenceBetween =
                            differencePosition.x * currentAxis.x +
                            differencePosition.y * currentAxis.y +
                            differencePosition.z * currentAxis.z;
                        }
                        if (methodIndex === 3) {
                          differenceBetween =
                            differencePosition.x * currentPositionAxis.x +
                            differencePosition.y * currentPositionAxis.y +
                            differencePosition.z * currentPositionAxis.z;
                          if (differenceBetween > 0) {
                            differenceBetween = Math.sqrt(
                              differencePosition.x * differencePosition.x +
                                differencePosition.y * differencePosition.y +
                                differencePosition.z * differencePosition.z
                            );
                          } else {
                            differenceBetween = -Math.sqrt(
                              differencePosition.x * differencePosition.x +
                                differencePosition.y * differencePosition.y +
                                differencePosition.z * differencePosition.z
                            );
                          }
                        }
                        if (methodIndex === 4) {
                          differenceBetween = leastTheta / 2;
                        }
                        if (methodIndex === 5) {
                          differenceBetween = mostTheta / 2;
                        }
                      } else {
                        let currentBeforeLocalQuaternion,
                          currentBeforeLocalQuaternionApplied,
                          currentOriginalEndEffectorPosition,
                          currentOriginalTargetPosition =
                            targetEndEffectorPosition.clone();
                        if (
                          methodIndex === 0 ||
                          methodIndex === 3 ||
                          methodIndex === 4 ||
                          methodIndex === 5
                        ) {
                          currentOriginalEndEffectorPosition =
                            calculatedMountPosition.clone();
                          currentOriginalTargetPosition =
                            targetEndEffectorPosition.clone();
                        }
                        if (methodIndex === 1) {
                          currentBeforeLocalQuaternion = new Quaternion();

                          currentBeforeLocalQuaternion
                            .setFromAxisAngle(
                              currentPositionAxis,
                              currentChainValue.A
                            )
                            .normalize();
                          currentBeforeLocalQuaternionApplied =
                            localCurrentQuaternion.clone();
                          currentBeforeLocalQuaternionApplied
                            .premultiply(currentBeforeLocalQuaternion)
                            .normalize();
                          currentOriginalEndEffectorPosition =
                            originalEndEffectorPosition.clone();
                          currentOriginalEndEffectorPosition.sub(
                            currentPosition
                          );
                          currentOriginalEndEffectorPosition.applyQuaternion(
                            currentBeforeLocalQuaternionApplied
                          );
                          currentOriginalEndEffectorPosition.add(
                            currentShiftedPosition
                          );
                          currentOriginalTargetPosition =
                            originalTargetPosition.clone();
                          currentOriginalTargetPosition.sub(currentPosition);
                          currentOriginalTargetPosition.applyQuaternion(
                            currentBeforeLocalQuaternionApplied
                          );
                          currentOriginalTargetPosition.add(
                            currentShiftedPosition
                          );
                        }
                        if (methodIndex === 2) {
                          currentOriginalEndEffectorPosition =
                            originalEndEffectorPosition.clone();
                          currentOriginalTargetPosition =
                            originalTargetPosition.clone();
                        }

                        let currentEndEffectorposition =
                          currentOriginalEndEffectorPosition.clone();
                        let currentTargetPosition =
                          currentOriginalTargetPosition.clone();

                        if (
                          methodIndex === 0 ||
                          methodIndex === 1 ||
                          methodIndex === 3 ||
                          methodIndex === 4 ||
                          methodIndex === 5
                        ) {
                          currentEndEffectorposition.sub(
                            currentShiftedPosition
                          );
                          currentTargetPosition.sub(currentShiftedPosition);
                        }
                        if (methodIndex === 2) {
                          currentEndEffectorposition.sub(currentPosition);
                          currentTargetPosition.sub(currentPosition);
                        }

                        if (methodIndex === 0 || methodIndex === 1) {
                          differenceBetween = this.angleToMoveToTarget(
                            currentPositionAxis,
                            currentEndEffectorposition,
                            currentTargetPosition
                          );
                        }
                        if (methodIndex === 2) {
                          differenceBetween = this.angleToMoveToTarget(
                            currentAxis,
                            currentEndEffectorposition,
                            currentTargetPosition
                          );
                        }
                        if (methodIndex === 3) {
                          differenceBetween =
                            this.getAngleBetweenVectorsFromAxis(
                              currentPositionAxis,
                              currentEndEffectorposition,
                              currentTargetPosition
                            );
                        }
                        if (methodIndex === 4) {
                          differenceBetween = leastTheta / 2;
                          //console.log('Least method theta', leastTheta);
                        }
                        if (methodIndex === 5) {
                          differenceBetween = mostTheta / 2;
                          //console.log('Most method theta', mostTheta);
                        }
                      }
                      if (differenceBetween !== 0) {
                        currentChainValue.A += differenceBetween;
                        console.log(
                          'Applying difference',
                          differenceBetween,
                          currentChainValue.A,
                          propsElement.actuator_motion_control.minimum_limit,
                          propsElement.actuator_motion_control.maximum_limit
                        );
                        if (
                          currentChainValue.A >
                          propsElement.actuator_motion_control.maximum_limit
                        ) {
                          let previousDifferenceBetween = differenceBetween;
                          differenceBetween =
                            propsElement.actuator_motion_control.maximum_limit -
                            currentChainValue.A +
                            differenceBetween;
                          currentChainValue.A =
                            propsElement.actuator_motion_control.maximum_limit;
                          console.log(
                            'Applied maximum Limit difference',
                            differenceBetween,
                            previousDifferenceBetween,
                            currentChainValue.A,
                            propsElement.actuator_motion_control.minimum_limit,
                            propsElement.actuator_motion_control.maximum_limit
                          );
                        }
                        if (
                          currentChainValue.A <
                          propsElement.actuator_motion_control.minimum_limit
                        ) {
                          let previousDifferenceBetween = differenceBetween;
                          differenceBetween =
                            propsElement.actuator_motion_control.minimum_limit -
                            currentChainValue.A +
                            differenceBetween;
                          currentChainValue.A =
                            propsElement.actuator_motion_control.minimum_limit;
                          console.log(
                            'Applied Minimum Limit difference',
                            differenceBetween,
                            previousDifferenceBetween,
                            currentChainValue.A,
                            propsElement.actuator_motion_control.minimum_limit,
                            propsElement.actuator_motion_control.maximum_limit
                          );
                        }
                        if (leastTheta > differenceBetween) {
                          leastTheta = differenceBetween;
                        }
                        if (mostTheta < differenceBetween) {
                          mostTheta = differenceBetween;
                        }
                      } else {
                        console.log(
                          'Applying 0 diffference',
                          positionalIndex,
                          index,
                          propsElement.actuator_motion_control
                        );
                      }
                    } else {
                      // console.log(
                      //   'Positional Index does not match',
                      //   positionalIndex,
                      //   index,
                      //   isActuatorNode,
                      //   isLinearNode
                      // );
                    }

                    if (isLinear) {
                      // const currentLength = Math.sqrt(
                      //   currentPositionAxis.x * currentPositionAxis.x +
                      //     currentPositionAxis.y * currentPositionAxis.y +
                      //     currentPositionAxis.z * currentPositionAxis.z
                      // );
                      // console.log(
                      //   'Before Adding values to the translation',
                      //   localCurrentTranslation,
                      //   localTranslation,
                      //   currentLength,
                      //   currentChainValue.A
                      // );
                      // if (currentLength !== 0) {
                      localCurrentTranslation.add(
                        new Vector3(
                          currentPositionAxis.x * currentChainValue.A,
                          currentPositionAxis.y * currentChainValue.A,
                          currentPositionAxis.z * currentChainValue.A
                        )
                      );
                      // }
                      // console.log(
                      //   'Adding values to the translation',
                      //   localCurrentTranslation,
                      //   localTranslation,
                      //   currentChainValue.A
                      // );
                    } else {
                      let currentAxisQuaternion = new Quaternion();
                      currentAxisQuaternion
                        .setFromAxisAngle(
                          currentPositionAxis,
                          currentChainValue.A
                        )
                        .normalize();
                      localCurrentQuaternion
                        .premultiply(currentAxisQuaternion)
                        .normalize();
                    }

                    // let shiftedPosition = currentPosition.clone();
                    // shiftedPosition.applyQuaternion(localQuaternion);
                    // shiftedPosition.add(globalShiftedPosition);
                    // let shiftingPosition = currentPosition.clone();
                    // shiftingPosition.applyQuaternion(localCurrentQuaternion);
                    // shiftedPosition.sub(shiftingPosition);
                    // shiftedPosition.sub(localTranslation);
                    // shiftedPosition.add(localCurrentTranslation);
                    // console.log(
                    //   'Chain Values before',
                    //   currentChainValue.A,
                    //   currentChainValue.L,
                    //   currentChainValue.Q,
                    //   currentChainValue.S,
                    //   currentChainValue.T,
                    //   calculatedKinematicItemChain[index + 1].A,
                    //   calculatedKinematicItemChain[index + 1].L,
                    //   calculatedKinematicItemChain[index + 1].Q,
                    //   calculatedKinematicItemChain[index + 1].S,
                    //   calculatedKinematicItemChain[index + 1].T,
                    //   index
                    // );
                    localPosition = currentPosition.clone();
                    localQuaternion = localCurrentQuaternion.clone();
                    localShiftedPosition = currentShiftedPosition.clone();
                    localTranslation = localCurrentTranslation.clone();
                    currentChainValue.L = currentPosition.clone();
                    currentChainValue.Q = localCurrentQuaternion.clone();
                    currentChainValue.S = currentShiftedPosition.clone();
                    currentChainValue.T = localCurrentTranslation.clone();
                    // console.log(
                    //   'Chain Values after',
                    //   currentChainValue.A,
                    //   currentChainValue.L,
                    //   currentChainValue.Q,
                    //   currentChainValue.S,
                    //   currentChainValue.T,
                    //   calculatedKinematicItemChain[index + 1].A,
                    //   calculatedKinematicItemChain[index + 1].L,
                    //   calculatedKinematicItemChain[index + 1].Q,
                    //   calculatedKinematicItemChain[index + 1].S,
                    //   calculatedKinematicItemChain[index + 1].T,
                    //   index
                    // );
                    //globalShiftedPosition = shiftedPosition.clone();
                  } else {
                    currentChainValue.L = localPosition.clone();
                    currentChainValue.Q = localQuaternion.clone();
                    currentChainValue.S = localShiftedPosition.clone();
                    currentChainValue.T = localTranslation.clone();
                    // console.log(
                    //   'Not an actuator',
                    //   propsElement,
                    //   index,
                    //   localPosition,
                    //   localQuaternion,
                    //   calculatedMountPosition
                    // );
                  }
                  if (isEndEffectorNode) {
                    // localQuaternion = calculatedKinematicItemChain[index].Q;
                    // localPosition = calculatedKinematicItemChain[index].L;
                    // localTranslation = calculatedKinematicItemChain[index].T;
                    // localShiftedPosition = calculatedKinematicItemChain[index].S;
                    // console.log(
                    //   'Adding values at endeffector to the translation',
                    //   localTranslation,
                    //   calculatedKinematicItemChain[index + 1].T
                    // );

                    if (this.props.itemProperties) {
                      const itemProperties = this.props.itemProperties;
                      //console.log('Got itemproperties as', itemProperties);
                      if (
                        itemProperties.actuator_motion_control &&
                        itemProperties.actuator_motion_control
                          .cylindrical_axis_of_rotation &&
                        itemProperties.actuator_motion_control
                          .cylindrical_axis_of_rotation.mountobb
                      ) {
                        const mountSurface =
                          itemProperties.actuator_motion_control
                            .cylindrical_axis_of_rotation.mountobb;
                        let mountPosition = new Vector3(
                          mountSurface.cx,
                          mountSurface.cy,
                          mountSurface.cz
                        );
                        mountPosition.sub(localPosition);
                        mountPosition.applyQuaternion(localQuaternion);
                        mountPosition.add(localShiftedPosition);
                        mountPosition.add(localTranslation);
                        mountPosition.add(originalXYZShiftablePosition);
                        let currentTargetPosition =
                          targetEndEffectorPosition.clone();
                        let differenceCalcuatedPosition =
                          new Vector3().subVectors(
                            currentTargetPosition,
                            mountPosition
                          );
                        let differenceCalculatedBetween =
                          differenceCalcuatedPosition.x *
                            differenceCalcuatedPosition.x +
                          differenceCalcuatedPosition.y *
                            differenceCalcuatedPosition.y +
                          differenceCalcuatedPosition.z *
                            differenceCalcuatedPosition.z;
                        if (
                          differenceCalculatedBetween <
                          lengthBetweenTargetAndEndEffector
                        ) {
                          changeMadeInInnerLoop = true;
                          couldFindTheta = true;
                          changeMade = true;
                          if (
                            differenceCalculatedBetween <=
                            (this.state.kinematicPrecision || 0.00000001)
                          ) {
                            foundThePosition = true;
                            console.log(
                              'Reached after ',
                              iteration + 1,
                              'iterations',
                              'error rate',
                              differenceCalculatedBetween,
                              lengthBetweenTargetAndEndEffector,
                              calculatedMountPosition,
                              targetEndEffectorPosition,
                              mountPosition,
                              localPosition,
                              localQuaternion,
                              index,
                              positionalIndex,
                              directionIndex
                            );
                          } else {
                            console.log(
                              'Difference Length',
                              differenceCalculatedBetween,
                              lengthBetweenTargetAndEndEffector,
                              calculatedMountPosition,
                              targetEndEffectorPosition,
                              mountPosition,
                              localPosition,
                              localQuaternion,
                              'iteration no',
                              iteration + 1,
                              index,
                              positionalIndex,
                              directionIndex
                            );
                          }
                          lengthBetweenTargetAndEndEffector =
                            differenceCalculatedBetween;
                          calculatedMountPosition = mountPosition.clone();
                          originalTargetPosition =
                            targetEndEffectorPosition.clone();
                          originalTargetPosition.sub(
                            originalXYZShiftablePosition
                          );
                          originalTargetPosition.sub(localTranslation);
                          originalTargetPosition.sub(localShiftedPosition);
                          originalTargetPosition.applyQuaternion(
                            localQuaternion.clone().invert()
                          );
                          originalTargetPosition.add(localPosition);
                          console.log(
                            'Got original target pos',
                            originalTargetPosition,
                            new Vector3(
                              mountSurface.cx,
                              mountSurface.cy,
                              mountSurface.cz
                            )
                          );
                        } else {
                          console.log(
                            'Difference Length Exceeds',
                            differenceCalculatedBetween,
                            lengthBetweenTargetAndEndEffector,
                            calculatedMountPosition,
                            targetEndEffectorPosition,
                            mountPosition,
                            localPosition,
                            localQuaternion,
                            'iteration',
                            iteration + 1,
                            index,
                            positionalIndex,
                            directionIndex
                          );
                          // for (
                          //   let chainPrintIndex = 0;
                          //   chainPrintIndex < calculatedKinematicItemList.length;
                          //   chainPrintIndex++
                          // ) {
                          //   console.log(
                          //     calculatedKinematicItemList[chainPrintIndex]
                          //       .actuator_motion_control,
                          //     previousCalculatedKinematicItemList[chainPrintIndex]
                          //       .actuator_motion_control
                          //   );
                          // }
                          calculatedKinematicItemChain =
                            this.cloneChainInfoForward(
                              previousCalculatedKinematicItemChain
                            );
                        }
                      }
                    }
                  }
                  if (foundThePosition) {
                    break;
                  }
                }
                if (foundThePosition) {
                  break;
                }
                if (changeMadeInInnerLoop) {
                  break;
                }
                if (!positionalIndexFound) {
                  console.log('end effector or not an actuator');
                  break;
                }
              }
              //lastPositionalIndex = positionalIndex + 1;
              if (foundThePosition) {
                break;
              }
            }
            //startPositionalIndex = positionalIndex;
            //lastPositionalIndex = startPositionalIndex;
          }
          if (foundThePosition) {
            break;
          }

          if (!couldFindTheta) {
            console.log(
              'Not reachable beyond this',
              iteration + 1,
              'iterations',
              lengthBetweenTargetAndEndEffector,
              'error rate'
            );
            break;
          }
          directionIndex = beginOfActuator + 1;
        }
        if (this.props.setKinematicItemList && changeMade) {
          this.displayForDebug(
            calculatedKinematicItemChain,
            'My Values',
            parsedIndexInfo
          );
          console.log(
            'Current and Target',
            currentMountPosition,
            targetEndEffectorPosition
          );
          this.props.setKinematicItemList(
            this.cloneChainInfoBackward(
              calculatedKinematicItemChain,
              this.props.kinematicItemList,
              parsedIndexInfo
            )
          );
        }
      }
    }
  };
  getPointsFrom = (p0, p1) => {
    let points = [];
    const diffVector = new Vector3().subVectors(p1, p0);
    const gap = this.props.kinematicParameters
      ? this.props.kinematicParameters.gap
        ? this.props.kinematicParameters.gap
        : 0.001
      : 0.001;
    const distance = p1.distanceTo(p0);
    let iterations = Math.ceil(distance / gap);
    if (iterations === 0) {
      iterations = 1;
    }
    for (let index = 0; index < iterations; index++) {
      const aPoint = new Vector3(
        p0.x + (diffVector.x * index) / iterations,
        p0.y + (diffVector.y * index) / iterations,
        p0.z + (diffVector.z * index) / iterations
      );
      points.push(aPoint);
    }
    return points;
  };
  getPointsFromDirection = (pointElement, direction) => {
    let points = [];
    const gap = this.props.kinematicParameters
      ? this.props.kinematicParameters.gap
        ? this.props.kinematicParameters.gap
        : this.props.kinematicParameters.gap === 0 //Include all points
        ? this.props.kinematicParameters.gap
        : 0.001
      : 0.001;
    const gapSquare = gap * gap;
    let lastPoint = new Vector3();
    for (let index = 0; index < pointElement.curvePoints.length; index++) {
      const directionIndex =
        direction === true
          ? index
          : pointElement.curvePoints.length - 1 - index;
      if (index === 0 || index === pointElement.curvePoints.length - 1) {
        lastPoint = pointElement.curvePoints[directionIndex];
        points.push(lastPoint);
      } else {
        const currentPoint = pointElement.curvePoints[directionIndex];
        const distance = currentPoint.distanceToSquared(lastPoint);
        if (distance >= gapSquare) {
          lastPoint = currentPoint;
          points.push(lastPoint);
        }
      }
    }
    return points;
  };

  getPointsFromIndex = (pointObject, pointIndex, prevObject) => {
    const selectedObjectsElement = pointObject[pointIndex];
    if (
      selectedObjectsElement.curvePoints &&
      selectedObjectsElement.curvePoints.length > 0
    ) {
      const firstSelectedPoint = selectedObjectsElement.curvePoints[0];
      const lastSelectedPoint =
        selectedObjectsElement.curvePoints[
          selectedObjectsElement.curvePoints.length - 1
        ];
      if (
        selectedObjectsElement.curveCode === 'L' &&
        selectedObjectsElement.curvePoints.length === 2
      ) {
        if (pointObject.length === 1) {
          return this.getPointsFrom(firstSelectedPoint, lastSelectedPoint);
        }
      }
      let direction = pointObject.length === 1;
      if (!direction) {
        if (pointIndex === 0) {
          const nextElement = pointObject[pointIndex + 1];
          if (nextElement.curvePoints && nextElement.curvePoints.length > 0) {
            const firstNextPoint = nextElement.curvePoints[0];
            const lastNextPoint =
              nextElement.curvePoints[nextElement.curvePoints.length - 1];
            const firstSelectedMinusfirstNext =
              firstSelectedPoint.distanceToSquared(firstNextPoint);
            const firstSelectedMinuslastNext =
              firstSelectedPoint.distanceToSquared(lastNextPoint);
            const lastSelectedMinusfirstNext =
              lastSelectedPoint.distanceToSquared(firstNextPoint);
            const lastSelectedMinuslastNext =
              lastSelectedPoint.distanceToSquared(lastNextPoint);
            if (
              firstSelectedMinusfirstNext <= firstSelectedMinuslastNext &&
              firstSelectedMinusfirstNext <= lastSelectedMinusfirstNext &&
              firstSelectedMinusfirstNext <= lastSelectedMinuslastNext
            ) {
              direction = false;
            }
            if (
              firstSelectedMinuslastNext <= firstSelectedMinusfirstNext &&
              firstSelectedMinuslastNext <= lastSelectedMinusfirstNext &&
              firstSelectedMinuslastNext <= lastSelectedMinuslastNext
            ) {
              direction = false;
            }
            if (
              lastSelectedMinusfirstNext <= firstSelectedMinuslastNext &&
              lastSelectedMinusfirstNext <= firstSelectedMinusfirstNext &&
              lastSelectedMinusfirstNext <= lastSelectedMinuslastNext
            ) {
              direction = true;
            }
            if (
              lastSelectedMinuslastNext <= firstSelectedMinusfirstNext &&
              lastSelectedMinuslastNext <= lastSelectedMinusfirstNext &&
              lastSelectedMinuslastNext <= firstSelectedMinuslastNext
            ) {
              direction = true;
            }
          } else {
            direction = true;
          }
        } else {
          const prevElement = prevObject[prevObject.length - 1];
          const firstSelectedMinusprevElement =
            firstSelectedPoint.distanceToSquared(prevElement);
          const lastSelectedMinusprevElement =
            lastSelectedPoint.distanceToSquared(prevElement);
          direction =
            firstSelectedMinusprevElement <= lastSelectedMinusprevElement;
        }
      }

      if (
        selectedObjectsElement.curveCode === 'L' &&
        selectedObjectsElement.curvePoints.length === 2
      ) {
        if (direction) {
          return this.getPointsFrom(firstSelectedPoint, lastSelectedPoint);
        } else {
          return this.getPointsFrom(lastSelectedPoint, firstSelectedPoint);
        }
      } else {
        return this.getPointsFromDirection(selectedObjectsElement, direction);
      }
    }

    const diffVector = new Vector3().subVectors(p1, p0);
    for (let index = 0; index < 100; index++) {
      const aPoint = new Vector3(
        p0.x + (diffVector.x * index) / 100.0,
        p0.y + (diffVector.y * index) / 100.0,
        p0.z + (diffVector.z * index) / 100.0
      );
      points.push(aPoint);
    }
    return points;
  };
  calculateInverseKinematicMovementFromPoints = (
    parsedIndexInfo,
    kinematicDimension,
    beginDimension
  ) => {
    this.calculateInverseKinematicMovementInCalculation = true;
    this.calculateInverseKinematicMovementArray = [];
    this.calculateInverseKinematicMovementIndex = -1;
    this.calculateInverseKinematicMovementDirection = true;

    if (JSON.stringify(parsedIndexInfo || []) !== JSON.stringify([])) {
      if (
        this.props.showKinematicSliderMove &&
        this.props.kinematicItemList &&
        this.partsMeshes &&
        this.partsMeshes.length > 0 &&
        this.props.kinematicItemList.length > 0 &&
        this.props.xyzEndEffectorPosition
      ) {
        let currentMountPosition = new Vector3(
          this.props.xyzEndEffectorPosition.X,
          this.props.xyzEndEffectorPosition.Y,
          this.props.xyzEndEffectorPosition.Z
        );
        let targetEndEffectorPosition = new Vector3(
          this.props.xyzControlPosition.X,
          this.props.xyzControlPosition.Y,
          this.props.xyzControlPosition.Z
        );

        let beginPosition = new Vector3(
          kinematicDimension.X,
          kinematicDimension.Y,
          kinematicDimension.Z
        );
        let originBeginPosition = this.getVectorFromDimension(beginDimension);
        let originalXYZShiftablePosition = new Vector3(0, 0, 0);
        originalXYZShiftablePosition.subVectors(
          beginPosition,
          originBeginPosition
        );
        console.log(
          'begin from calculate inverse',
          beginPosition,
          'origin begin',
          originBeginPosition,
          'diff',
          originalXYZShiftablePosition
        );
        let calculatedKinematicItemChain = this.cloneChainInfoForward(
          this.props.xyzEndEffectorPosition.K
        );
        const beginOfActuator = this.props.xyzEndEffectorPosition.B;
        const endOfActuator = this.props.xyzEndEffectorPosition.E;
        let originalEndEffectorPosition =
          this.props.xyzEndEffectorPosition.M.clone();
        let originalLocalPosition = this.props.xyzEndEffectorPosition.L.clone();
        let originalLocalShiftedPosition =
          this.props.xyzEndEffectorPosition.S.clone();
        let originallocalTranslation =
          this.props.xyzEndEffectorPosition.T.clone();
        let originalLocalQuaternion =
          this.props.xyzEndEffectorPosition.Q.clone().invert();
        console.log(
          'Translation',
          originallocalTranslation,
          calculatedKinematicItemChain[endOfActuator].T
        );
        console.log(
          'Shift',
          originalLocalShiftedPosition,
          calculatedKinematicItemChain[endOfActuator].S
        );
        console.log(
          'Quaternion',
          originalLocalQuaternion,
          calculatedKinematicItemChain[endOfActuator].Q
        );
        console.log(
          'Local Pos',
          originalLocalPosition,
          calculatedKinematicItemChain[endOfActuator].L,
          this.state_selectedObjects
        );
        let calculatedMountPosition = currentMountPosition.clone();
        if (this.props.setProgressAnimate) {
          this.props.setProgressAnimate(0);
        }
        if (this.props.setProgressAnimateText) {
          this.props.setProgressAnimateText('Started');
        }
        //mountposition, targetendeffector positition changes.. for loop here..
        if (
          this.state_selectedObjects &&
          this.state_selectedObjects.length > 0
        ) {
          for (
            let selectedObjectsIndex = 0;
            selectedObjectsIndex < this.state_selectedObjects.length;
            selectedObjectsIndex++
          ) {
            if (this.props.setProgressAnimate) {
              const percentage =
                (selectedObjectsIndex * 100.0) /
                this.state_selectedObjects.length;
              this.props.setProgressAnimate(percentage);
              console.log('Percentage Selections', percentage);
            }
            if (this.props.setProgressAnimateText) {
              this.props.setProgressAnimateText(
                selectedObjectsIndex.toString() +
                  '/' +
                  this.state_selectedObjects.length.toString()
              );
            }
            const selectedObjectsElement =
              this.state_selectedObjects[selectedObjectsIndex];
            if (
              selectedObjectsElement.curvePoints &&
              selectedObjectsElement.curvePoints.length > 0
            ) {
              let curvePoints = selectedObjectsElement.curvePoints;
              if (
                selectedObjectsElement.curveCode === 'L' &&
                selectedObjectsElement.curvePoints.length === 2
              ) {
                curvePoints = this.getPointsFrom(
                  selectedObjectsElement.curvePoints[0],
                  selectedObjectsElement.curvePoints[1]
                );
              }
              for (
                let pointsIndex = 0;
                pointsIndex < curvePoints.length;
                pointsIndex++
              ) {
                if (this.props.setProgressAnimate) {
                  const percentage =
                    ((selectedObjectsIndex + pointsIndex / curvePoints.length) *
                      100.0) /
                    this.state_selectedObjects.length;
                  this.props.setProgressAnimate(percentage);
                  console.log('Percentage Points', percentage);
                }
                if (this.props.setProgressAnimateText) {
                  this.props.setProgressAnimateText(
                    selectedObjectsIndex.toString() +
                      '/' +
                      this.state_selectedObjects.length.toString() +
                      '-' +
                      pointsIndex.toString() +
                      '/' +
                      curvePoints.length.toString()
                  );
                }
                const pointsElement = curvePoints[pointsIndex];
                targetEndEffectorPosition = new Vector3(
                  pointsElement.x / 0.001,
                  -pointsElement.z / 0.001,
                  pointsElement.y / 0.001
                );
                let originalTargetPosition = targetEndEffectorPosition.clone();

                const differenceBetweenTargetAndEndEffector =
                  new Vector3().subVectors(
                    targetEndEffectorPosition,
                    calculatedMountPosition
                  );
                let lengthBetweenTargetAndEndEffector =
                  differenceBetweenTargetAndEndEffector.x *
                    differenceBetweenTargetAndEndEffector.x +
                  differenceBetweenTargetAndEndEffector.y *
                    differenceBetweenTargetAndEndEffector.y +
                  differenceBetweenTargetAndEndEffector.z *
                    differenceBetweenTargetAndEndEffector.z;
                if (lengthBetweenTargetAndEndEffector === 0) {
                  return;
                }

                originalTargetPosition.sub(originalXYZShiftablePosition);
                originalTargetPosition.sub(
                  calculatedKinematicItemChain[endOfActuator].T
                );
                originalTargetPosition.sub(
                  calculatedKinematicItemChain[endOfActuator].S
                );
                originalTargetPosition.applyQuaternion(
                  calculatedKinematicItemChain[endOfActuator].Q
                );
                originalTargetPosition.add(
                  calculatedKinematicItemChain[endOfActuator].L
                );

                let direction = false;
                //let directionMultiplier = -1;
                let foundThePosition = false;
                let changeMade = false;
                let directionIndex = 0;

                // console.log(
                //   'GOt inititally',
                //   currentMountPosition,
                //   originalEndEffectorPosition,
                //   originalTargetPosition,
                //   targetEndEffectorPosition
                // );
                const howManyIterations = this.props.kinematicParameters
                  ? this.props.kinematicParameters.iterations +
                      ((this.props.kinematicParameters.iterations + 1) % 2) ||
                    21
                  : 21;
                for (
                  let iteration = 0;
                  iteration < howManyIterations;
                  iteration++
                ) {
                  direction = !direction;
                  let couldFindTheta = false;
                  //let lastPositionalIndex = 0;
                  //let startPositionalIndex = 0;
                  directionIndex = beginOfActuator;
                  for (; directionIndex < endOfActuator; directionIndex++) {
                    const positionalIndex =
                      direction === true
                        ? directionIndex
                        : endOfActuator - directionIndex + beginOfActuator - 1;
                    const isActuatorOrEndEffector =
                      calculatedKinematicItemChain[positionalIndex + 1].K;
                    if (isActuatorOrEndEffector) {
                      let previousCalculatedKinematicItemChain =
                        this.cloneChainInfoForward(
                          calculatedKinematicItemChain
                        );
                      let leastTheta = 6.28;
                      let mostTheta = -6.28;
                      const howManyMethods = this.props.kinematicParameters
                        ? this.props.kinematicParameters.methods || 1
                        : 1;
                      for (
                        let methodIndex = 0;
                        methodIndex < howManyMethods;
                        methodIndex++
                      ) {
                        let localQuaternion =
                          calculatedKinematicItemChain[positionalIndex].Q;
                        let localPosition =
                          calculatedKinematicItemChain[positionalIndex].L;
                        let localTranslation =
                          calculatedKinematicItemChain[positionalIndex].T;
                        let localShiftedPosition =
                          calculatedKinematicItemChain[positionalIndex].S;
                        //let globalShiftedPosition = new Vector3(0, 0, 0);
                        let changeMadeInInnerLoop = false;
                        let positionalIndexFound = false;
                        for (
                          let index = positionalIndex;
                          index < calculatedKinematicItemChain.length - 1;
                          index++
                        ) {
                          // console.log(
                          //   'Parsed Index info',
                          //   index,
                          //   positionalIndex,
                          //   beginOfActuator,
                          //   endOfActuator,
                          //   directionIndex
                          // );
                          let [
                            sequence,
                            sequenceItem,
                            propsElementIndex,
                            currentNodeIndex,
                            isActuatorNode,
                            isLinearNode,
                            isEndEffectorNode,
                            currentAxisNode,
                            currentPositionNode
                          ] = parsedIndexInfo[index];

                          let currentChainValue =
                            calculatedKinematicItemChain[index + 1];

                          if (isActuatorNode) {
                            let propsElement =
                              this.props.kinematicItemList[
                                propsElementIndex === -1
                                  ? index
                                  : propsElementIndex
                              ];
                            const currentAxis = currentAxisNode;
                            const currentPosition = currentPositionNode;
                            // localQuaternion = calculatedKinematicItemChain[index].Q;
                            // localPosition = calculatedKinematicItemChain[index].L;
                            // localTranslation = calculatedKinematicItemChain[index].T;
                            // localShiftedPosition = calculatedKinematicItemChain[index].S;
                            let localCurrentQuaternion =
                              localQuaternion.clone();
                            let localCurrentTranslation =
                              localTranslation.clone();
                            let currentShiftedPosition =
                              currentPosition.clone();
                            currentShiftedPosition.sub(localPosition);
                            currentShiftedPosition.applyQuaternion(
                              localCurrentQuaternion
                            );
                            currentShiftedPosition.add(localShiftedPosition);
                            let currentPositionAxis = currentAxis.clone();
                            currentPositionAxis.applyQuaternion(
                              localCurrentQuaternion
                            );
                            currentPositionAxis.normalize();

                            const isLinear = isLinearNode;
                            if (positionalIndex === index) {
                              positionalIndexFound = true;
                              let differenceBetween = 0;
                              if (isLinear) {
                                let currentOriginalEndEffectorPosition,
                                  currentOriginalTargetPosition,
                                  currentEndEffectorposition,
                                  currentTargetPosition,
                                  differencePosition;
                                if (
                                  methodIndex === 0 ||
                                  methodIndex === 4 ||
                                  methodIndex === 5
                                ) {
                                  currentOriginalEndEffectorPosition =
                                    calculatedMountPosition.clone();

                                  currentOriginalTargetPosition =
                                    targetEndEffectorPosition.clone();
                                }
                                if (methodIndex === 1 || methodIndex === 3) {
                                  currentOriginalEndEffectorPosition =
                                    originalEndEffectorPosition.clone();
                                  currentOriginalEndEffectorPosition.sub(
                                    currentPosition
                                  );
                                  currentOriginalEndEffectorPosition.applyQuaternion(
                                    localCurrentQuaternion
                                  );
                                  currentOriginalEndEffectorPosition.add(
                                    currentShiftedPosition
                                  );
                                  currentOriginalTargetPosition =
                                    originalTargetPosition.clone();
                                  currentOriginalTargetPosition.sub(
                                    currentPosition
                                  );
                                  currentOriginalTargetPosition.applyQuaternion(
                                    localCurrentQuaternion
                                  );
                                  currentOriginalTargetPosition.add(
                                    currentShiftedPosition
                                  );
                                }
                                if (methodIndex === 2) {
                                  currentOriginalEndEffectorPosition =
                                    originalEndEffectorPosition.clone();
                                  currentOriginalTargetPosition =
                                    originalTargetPosition.clone();
                                }
                                // console.log(
                                //   'Method Index',
                                //   methodIndex,
                                //   currentOriginalEndEffectorPosition,
                                //   this.props.kinematicParameters,
                                //   this.props.kinematicParameters
                                //     ? this.props.kinematicParameters.methods || 5
                                //     : 5
                                // );
                                currentEndEffectorposition =
                                  currentOriginalEndEffectorPosition.clone();
                                currentTargetPosition =
                                  currentOriginalTargetPosition.clone();
                                differencePosition = new Vector3().subVectors(
                                  currentTargetPosition,
                                  currentEndEffectorposition
                                );
                                if (methodIndex === 0 || methodIndex === 1) {
                                  differenceBetween =
                                    differencePosition.x *
                                      currentPositionAxis.x +
                                    differencePosition.y *
                                      currentPositionAxis.y +
                                    differencePosition.z *
                                      currentPositionAxis.z;

                                  if (methodIndex === 0) {
                                    leastTheta = differenceBetween;
                                    mostTheta = differenceBetween;
                                  }
                                }
                                if (methodIndex === 2) {
                                  differenceBetween =
                                    differencePosition.x * currentAxis.x +
                                    differencePosition.y * currentAxis.y +
                                    differencePosition.z * currentAxis.z;
                                }
                                if (methodIndex === 3) {
                                  differenceBetween =
                                    differencePosition.x *
                                      currentPositionAxis.x +
                                    differencePosition.y *
                                      currentPositionAxis.y +
                                    differencePosition.z *
                                      currentPositionAxis.z;
                                  if (differenceBetween > 0) {
                                    differenceBetween = Math.sqrt(
                                      differencePosition.x *
                                        differencePosition.x +
                                        differencePosition.y *
                                          differencePosition.y +
                                        differencePosition.z *
                                          differencePosition.z
                                    );
                                  } else {
                                    differenceBetween = -Math.sqrt(
                                      differencePosition.x *
                                        differencePosition.x +
                                        differencePosition.y *
                                          differencePosition.y +
                                        differencePosition.z *
                                          differencePosition.z
                                    );
                                  }
                                }
                                if (methodIndex === 4) {
                                  differenceBetween = leastTheta / 2;
                                }
                                if (methodIndex === 5) {
                                  differenceBetween = mostTheta / 2;
                                }
                              } else {
                                let currentBeforeLocalQuaternion,
                                  currentBeforeLocalQuaternionApplied,
                                  currentOriginalEndEffectorPosition,
                                  currentOriginalTargetPosition =
                                    targetEndEffectorPosition.clone();
                                if (
                                  methodIndex === 0 ||
                                  methodIndex === 3 ||
                                  methodIndex === 4 ||
                                  methodIndex === 5
                                ) {
                                  currentOriginalEndEffectorPosition =
                                    calculatedMountPosition.clone();
                                  currentOriginalTargetPosition =
                                    targetEndEffectorPosition.clone();
                                }
                                if (methodIndex === 1) {
                                  currentBeforeLocalQuaternion =
                                    new Quaternion();

                                  currentBeforeLocalQuaternion
                                    .setFromAxisAngle(
                                      currentPositionAxis,
                                      currentChainValue.A
                                    )
                                    .normalize();
                                  currentBeforeLocalQuaternionApplied =
                                    localCurrentQuaternion.clone();
                                  currentBeforeLocalQuaternionApplied
                                    .premultiply(currentBeforeLocalQuaternion)
                                    .normalize();
                                  currentOriginalEndEffectorPosition =
                                    originalEndEffectorPosition.clone();
                                  currentOriginalEndEffectorPosition.sub(
                                    currentPosition
                                  );
                                  currentOriginalEndEffectorPosition.applyQuaternion(
                                    currentBeforeLocalQuaternionApplied
                                  );
                                  currentOriginalEndEffectorPosition.add(
                                    currentShiftedPosition
                                  );
                                  currentOriginalTargetPosition =
                                    originalTargetPosition.clone();
                                  currentOriginalTargetPosition.sub(
                                    currentPosition
                                  );
                                  currentOriginalTargetPosition.applyQuaternion(
                                    currentBeforeLocalQuaternionApplied
                                  );
                                  currentOriginalTargetPosition.add(
                                    currentShiftedPosition
                                  );
                                }
                                if (methodIndex === 2) {
                                  currentOriginalEndEffectorPosition =
                                    originalEndEffectorPosition.clone();
                                  currentOriginalTargetPosition =
                                    originalTargetPosition.clone();
                                }

                                let currentEndEffectorposition =
                                  currentOriginalEndEffectorPosition.clone();
                                let currentTargetPosition =
                                  currentOriginalTargetPosition.clone();

                                if (
                                  methodIndex === 0 ||
                                  methodIndex === 1 ||
                                  methodIndex === 3 ||
                                  methodIndex === 4 ||
                                  methodIndex === 5
                                ) {
                                  currentEndEffectorposition.sub(
                                    currentShiftedPosition
                                  );
                                  currentTargetPosition.sub(
                                    currentShiftedPosition
                                  );
                                }
                                if (methodIndex === 2) {
                                  currentEndEffectorposition.sub(
                                    currentPosition
                                  );
                                  currentTargetPosition.sub(currentPosition);
                                }

                                if (methodIndex === 0 || methodIndex === 1) {
                                  differenceBetween = this.angleToMoveToTarget(
                                    currentPositionAxis,
                                    currentEndEffectorposition,
                                    currentTargetPosition
                                  );
                                }
                                if (methodIndex === 2) {
                                  differenceBetween = this.angleToMoveToTarget(
                                    currentAxis,
                                    currentEndEffectorposition,
                                    currentTargetPosition
                                  );
                                }
                                if (methodIndex === 3) {
                                  differenceBetween =
                                    this.getAngleBetweenVectorsFromAxis(
                                      currentPositionAxis,
                                      currentEndEffectorposition,
                                      currentTargetPosition
                                    );
                                }
                                if (methodIndex === 4) {
                                  differenceBetween = leastTheta / 2;
                                  //console.log('Least method theta', leastTheta);
                                }
                                if (methodIndex === 5) {
                                  differenceBetween = mostTheta / 2;
                                  //console.log('Most method theta', mostTheta);
                                }
                              }
                              if (differenceBetween !== 0) {
                                currentChainValue.A += differenceBetween;
                                console.log(
                                  'Applying difference',
                                  differenceBetween,
                                  currentChainValue.A,
                                  propsElement.actuator_motion_control
                                    .minimum_limit,
                                  propsElement.actuator_motion_control
                                    .maximum_limit
                                );
                                if (
                                  currentChainValue.A >
                                  propsElement.actuator_motion_control
                                    .maximum_limit
                                ) {
                                  let previousDifferenceBetween =
                                    differenceBetween;
                                  differenceBetween =
                                    propsElement.actuator_motion_control
                                      .maximum_limit -
                                    currentChainValue.A +
                                    differenceBetween;
                                  currentChainValue.A =
                                    propsElement.actuator_motion_control.maximum_limit;
                                  console.log(
                                    'Applied maximum Limit difference',
                                    differenceBetween,
                                    previousDifferenceBetween,
                                    currentChainValue.A,
                                    propsElement.actuator_motion_control
                                      .minimum_limit,
                                    propsElement.actuator_motion_control
                                      .maximum_limit
                                  );
                                }
                                if (
                                  currentChainValue.A <
                                  propsElement.actuator_motion_control
                                    .minimum_limit
                                ) {
                                  let previousDifferenceBetween =
                                    differenceBetween;
                                  differenceBetween =
                                    propsElement.actuator_motion_control
                                      .minimum_limit -
                                    currentChainValue.A +
                                    differenceBetween;
                                  currentChainValue.A =
                                    propsElement.actuator_motion_control.minimum_limit;
                                  console.log(
                                    'Applied Minimum Limit difference',
                                    differenceBetween,
                                    previousDifferenceBetween,
                                    currentChainValue.A,
                                    propsElement.actuator_motion_control
                                      .minimum_limit,
                                    propsElement.actuator_motion_control
                                      .maximum_limit
                                  );
                                }
                                if (leastTheta > differenceBetween) {
                                  leastTheta = differenceBetween;
                                }
                                if (mostTheta < differenceBetween) {
                                  mostTheta = differenceBetween;
                                }
                              } else {
                                console.log(
                                  'Applying 0 diffference',
                                  positionalIndex,
                                  index,
                                  propsElement.actuator_motion_control
                                );
                              }
                            } else {
                              // console.log(
                              //   'Positional Index does not match',
                              //   positionalIndex,
                              //   index,
                              //   isActuatorNode,
                              //   isLinearNode
                              // );
                            }

                            if (isLinear) {
                              // const currentLength = Math.sqrt(
                              //   currentPositionAxis.x * currentPositionAxis.x +
                              //     currentPositionAxis.y * currentPositionAxis.y +
                              //     currentPositionAxis.z * currentPositionAxis.z
                              // );
                              // console.log(
                              //   'Before Adding values to the translation',
                              //   localCurrentTranslation,
                              //   localTranslation,
                              //   currentLength,
                              //   currentChainValue.A
                              // );
                              // if (currentLength !== 0) {
                              localCurrentTranslation.add(
                                new Vector3(
                                  currentPositionAxis.x * currentChainValue.A,
                                  currentPositionAxis.y * currentChainValue.A,
                                  currentPositionAxis.z * currentChainValue.A
                                )
                              );
                              // }
                              // console.log(
                              //   'Adding values to the translation',
                              //   localCurrentTranslation,
                              //   localTranslation,
                              //   currentChainValue.A
                              // );
                            } else {
                              let currentAxisQuaternion = new Quaternion();
                              currentAxisQuaternion
                                .setFromAxisAngle(
                                  currentPositionAxis,
                                  currentChainValue.A
                                )
                                .normalize();
                              localCurrentQuaternion
                                .premultiply(currentAxisQuaternion)
                                .normalize();
                            }

                            // let shiftedPosition = currentPosition.clone();
                            // shiftedPosition.applyQuaternion(localQuaternion);
                            // shiftedPosition.add(globalShiftedPosition);
                            // let shiftingPosition = currentPosition.clone();
                            // shiftingPosition.applyQuaternion(localCurrentQuaternion);
                            // shiftedPosition.sub(shiftingPosition);
                            // shiftedPosition.sub(localTranslation);
                            // shiftedPosition.add(localCurrentTranslation);
                            // console.log(
                            //   'Chain Values before',
                            //   currentChainValue.A,
                            //   currentChainValue.L,
                            //   currentChainValue.Q,
                            //   currentChainValue.S,
                            //   currentChainValue.T,
                            //   calculatedKinematicItemChain[index + 1].A,
                            //   calculatedKinematicItemChain[index + 1].L,
                            //   calculatedKinematicItemChain[index + 1].Q,
                            //   calculatedKinematicItemChain[index + 1].S,
                            //   calculatedKinematicItemChain[index + 1].T,
                            //   index
                            // );
                            localPosition = currentPosition.clone();
                            localQuaternion = localCurrentQuaternion.clone();
                            localShiftedPosition =
                              currentShiftedPosition.clone();
                            localTranslation = localCurrentTranslation.clone();
                            currentChainValue.L = currentPosition.clone();
                            currentChainValue.Q =
                              localCurrentQuaternion.clone();
                            currentChainValue.S =
                              currentShiftedPosition.clone();
                            currentChainValue.T =
                              localCurrentTranslation.clone();
                            // console.log(
                            //   'Chain Values after',
                            //   currentChainValue.A,
                            //   currentChainValue.L,
                            //   currentChainValue.Q,
                            //   currentChainValue.S,
                            //   currentChainValue.T,
                            //   calculatedKinematicItemChain[index + 1].A,
                            //   calculatedKinematicItemChain[index + 1].L,
                            //   calculatedKinematicItemChain[index + 1].Q,
                            //   calculatedKinematicItemChain[index + 1].S,
                            //   calculatedKinematicItemChain[index + 1].T,
                            //   index
                            // );
                            //globalShiftedPosition = shiftedPosition.clone();
                          } else {
                            currentChainValue.L = localPosition.clone();
                            currentChainValue.Q = localQuaternion.clone();
                            currentChainValue.S = localShiftedPosition.clone();
                            currentChainValue.T = localTranslation.clone();
                            // console.log(
                            //   'Not an actuator',
                            //   propsElement,
                            //   index,
                            //   localPosition,
                            //   localQuaternion,
                            //   calculatedMountPosition
                            // );
                          }
                          if (isEndEffectorNode) {
                            // localQuaternion = calculatedKinematicItemChain[index].Q;
                            // localPosition = calculatedKinematicItemChain[index].L;
                            // localTranslation = calculatedKinematicItemChain[index].T;
                            // localShiftedPosition = calculatedKinematicItemChain[index].S;
                            // console.log(
                            //   'Adding values at endeffector to the translation',
                            //   localTranslation,
                            //   calculatedKinematicItemChain[index + 1].T
                            // );

                            if (this.props.itemProperties) {
                              const itemProperties = this.props.itemProperties;
                              //console.log('Got itemproperties as', itemProperties);
                              if (
                                itemProperties.actuator_motion_control &&
                                itemProperties.actuator_motion_control
                                  .cylindrical_axis_of_rotation &&
                                itemProperties.actuator_motion_control
                                  .cylindrical_axis_of_rotation.mountobb
                              ) {
                                const mountSurface =
                                  itemProperties.actuator_motion_control
                                    .cylindrical_axis_of_rotation.mountobb;
                                let mountPosition = new Vector3(
                                  mountSurface.cx,
                                  mountSurface.cy,
                                  mountSurface.cz
                                );
                                mountPosition.sub(localPosition);
                                mountPosition.applyQuaternion(localQuaternion);
                                mountPosition.add(localShiftedPosition);
                                mountPosition.add(localTranslation);
                                mountPosition.add(originalXYZShiftablePosition);
                                let currentTargetPosition =
                                  targetEndEffectorPosition.clone();
                                let differenceCalcuatedPosition =
                                  new Vector3().subVectors(
                                    currentTargetPosition,
                                    mountPosition
                                  );
                                let differenceCalculatedBetween =
                                  differenceCalcuatedPosition.x *
                                    differenceCalcuatedPosition.x +
                                  differenceCalcuatedPosition.y *
                                    differenceCalcuatedPosition.y +
                                  differenceCalcuatedPosition.z *
                                    differenceCalcuatedPosition.z;
                                if (
                                  differenceCalculatedBetween <
                                  lengthBetweenTargetAndEndEffector
                                ) {
                                  changeMadeInInnerLoop = true;
                                  couldFindTheta = true;
                                  changeMade = true;
                                  if (
                                    differenceCalculatedBetween <=
                                    (this.state.kinematicPrecision ||
                                      0.00000001)
                                  ) {
                                    foundThePosition = true;
                                    console.log(
                                      'Reached after ',
                                      iteration + 1,
                                      'iterations',
                                      'error rate',
                                      differenceCalculatedBetween,
                                      lengthBetweenTargetAndEndEffector,
                                      calculatedMountPosition,
                                      targetEndEffectorPosition,
                                      mountPosition,
                                      localPosition,
                                      localQuaternion,
                                      index,
                                      positionalIndex,
                                      directionIndex
                                    );
                                  } else {
                                    console.log(
                                      'Difference Length',
                                      differenceCalculatedBetween,
                                      lengthBetweenTargetAndEndEffector,
                                      calculatedMountPosition,
                                      targetEndEffectorPosition,
                                      mountPosition,
                                      localPosition,
                                      localQuaternion,
                                      'iteration no',
                                      iteration + 1,
                                      index,
                                      positionalIndex,
                                      directionIndex
                                    );
                                  }
                                  lengthBetweenTargetAndEndEffector =
                                    differenceCalculatedBetween;
                                  calculatedMountPosition =
                                    mountPosition.clone();
                                  originalTargetPosition =
                                    targetEndEffectorPosition.clone();
                                  originalTargetPosition.sub(
                                    originalXYZShiftablePosition
                                  );
                                  originalTargetPosition.sub(localTranslation);
                                  originalTargetPosition.sub(
                                    localShiftedPosition
                                  );
                                  originalTargetPosition.applyQuaternion(
                                    localQuaternion.clone().invert()
                                  );
                                  originalTargetPosition.add(localPosition);
                                  console.log(
                                    'Got original target pos',
                                    originalTargetPosition,
                                    new Vector3(
                                      mountSurface.cx,
                                      mountSurface.cy,
                                      mountSurface.cz
                                    )
                                  );
                                } else {
                                  console.log(
                                    'Difference Length Exceeds',
                                    differenceCalculatedBetween,
                                    lengthBetweenTargetAndEndEffector,
                                    calculatedMountPosition,
                                    targetEndEffectorPosition,
                                    mountPosition,
                                    localPosition,
                                    localQuaternion,
                                    'iteration',
                                    iteration + 1,
                                    index,
                                    positionalIndex,
                                    directionIndex
                                  );
                                  // for (
                                  //   let chainPrintIndex = 0;
                                  //   chainPrintIndex < calculatedKinematicItemList.length;
                                  //   chainPrintIndex++
                                  // ) {
                                  //   console.log(
                                  //     calculatedKinematicItemList[chainPrintIndex]
                                  //       .actuator_motion_control,
                                  //     previousCalculatedKinematicItemList[chainPrintIndex]
                                  //       .actuator_motion_control
                                  //   );
                                  // }
                                  calculatedKinematicItemChain =
                                    this.cloneChainInfoForward(
                                      previousCalculatedKinematicItemChain
                                    );
                                }
                              }
                            }
                          }
                          if (foundThePosition) {
                            break;
                          }
                        }
                        if (foundThePosition) {
                          break;
                        }
                        if (changeMadeInInnerLoop) {
                          break;
                        }
                        if (!positionalIndexFound) {
                          console.log('end effector or not an actuator');
                          break;
                        }
                      }
                      //lastPositionalIndex = positionalIndex + 1;
                      if (foundThePosition) {
                        break;
                      }
                    }
                    //startPositionalIndex = positionalIndex;
                    //lastPositionalIndex = startPositionalIndex;
                  }
                  if (foundThePosition) {
                    break;
                  }

                  if (!couldFindTheta) {
                    console.log(
                      'Not reachable beyond this',
                      iteration + 1,
                      'iterations',
                      lengthBetweenTargetAndEndEffector,
                      'error rate'
                    );
                    break;
                  }
                  directionIndex = beginOfActuator + 1;
                }
                if (this.props.setKinematicItemList && changeMade) {
                  this.displayForDebug(
                    calculatedKinematicItemChain,
                    'My Values',
                    parsedIndexInfo
                  );
                  console.log(
                    'Current and Target',
                    currentMountPosition,
                    targetEndEffectorPosition
                  );
                  // const resultKinematicList = this.cloneChainInfoBackward(
                  //   calculatedKinematicItemChain,
                  //   this.props.kinematicItemList,
                  //   parsedIndexInfo
                  // );
                  const resultKinematicList = this.cloneChainInfoOnlyMovement(
                    this.state_calculatedKinematicItemChain,
                    false
                  );
                  this.calculateInverseKinematicMovementArray.push(
                    resultKinematicList
                  );
                }
              }
            }
          }
        }
        if (this.props.setProgressAnimateText) {
          this.props.setProgressAnimateText('Completed');
        }
        if (this.props.setProgressAnimate) {
          this.props.setProgressAnimate(100);
        }
      }
    }
    this.calculateInverseKinematicMovementInCalculation = false;
    console.log('Got array as', this.calculateInverseKinematicMovementArray);
  };

  calculateInverseKinematicMovementFromPointsWithoutLoop = (fromButton) => {
    const parsedIndexInfo = this.state.indexedKinematicParsedInfo;
    const kinematicDimension = this.props.xyzShiftPosition;
    const beginDimension = this.state.kinematicDimension;
    if (JSON.stringify(parsedIndexInfo || []) !== JSON.stringify([])) {
      if (
        this.props.showKinematicSliderMove &&
        this.props.kinematicItemList &&
        this.partsMeshes &&
        this.partsMeshes.length > 0 &&
        this.props.kinematicItemList.length > 0 &&
        this.props.xyzEndEffectorPosition
      ) {
        const beginOfActuator = this.props.xyzEndEffectorPosition.B;
        const endOfActuator = this.props.xyzEndEffectorPosition.E;
        const originalEndEffectorPosition =
          this.props.xyzEndEffectorPosition.M.clone();
        let targetEndEffectorPosition = new Vector3(
          this.props.xyzControlPosition.X,
          this.props.xyzControlPosition.Y,
          this.props.xyzControlPosition.Z
        );
        if (fromButton === true) {
          this.calculateInverseKinematicMovementInCalculation = true;
          this.calculateInverseKinematicMovementArray = [];
          this.calculateInverseKinematicMovementIndex = -1;
          this.calculateInverseKinematicMovementDirection = true;
          this.state_lastPoints = [];
          let currentMountPosition = new Vector3(
            this.props.xyzEndEffectorPosition.X,
            this.props.xyzEndEffectorPosition.Y,
            this.props.xyzEndEffectorPosition.Z
          );

          let beginPosition = new Vector3(
            kinematicDimension.X,
            kinematicDimension.Y,
            kinematicDimension.Z
          );
          let originBeginPosition = this.getVectorFromDimension(beginDimension);
          this.state_originalXYZShiftablePosition = new Vector3(0, 0, 0);
          this.state_originalXYZShiftablePosition.subVectors(
            beginPosition,
            originBeginPosition
          );
          console.log(
            'begin from calculate inverse',
            beginPosition,
            'origin begin',
            originBeginPosition,
            'diff',
            this.state_originalXYZShiftablePosition
          );
          this.state_calculatedKinematicItemChain = this.cloneChainInfoForward(
            this.props.xyzEndEffectorPosition.K
          );

          /* let originalLocalPosition = this.props.xyzEndEffectorPosition.L.clone();
          let originalLocalShiftedPosition =
            this.props.xyzEndEffectorPosition.S.clone();
          let originallocalTranslation =
            this.props.xyzEndEffectorPosition.T.clone();
          let originalLocalQuaternion =
            this.props.xyzEndEffectorPosition.Q.clone().invert();
          console.log(
            'Translation',
            originallocalTranslation,
            this.state_calculatedKinematicItemChain[endOfActuator].T
          );
          console.log(
            'Shift',
            originalLocalShiftedPosition,
            this.state_calculatedKinematicItemChain[endOfActuator].S
          );
          console.log(
            'Quaternion',
            originalLocalQuaternion,
            this.state_calculatedKinematicItemChain[endOfActuator].Q
          );
          console.log(
            'Local Pos',
            originalLocalPosition,
            this.state_calculatedKinematicItemChain[endOfActuator].L,
            this.state_selectedObjects
          ); */
          this.state_calculatedMountPosition = currentMountPosition.clone();
          this.state_selectedObjectsIndex = 0;
          this.state_pointsIndex = 0;
          if (this.props.setProgressAnimate) {
            this.props.setProgressAnimate(0);
          }
          if (this.props.setProgressAnimateText) {
            this.props.setProgressAnimateText('Started');
          }
        } else {
          // this.state_selectedObjectsIndex =
          //   this.state.state_selectedObjectsIndex;
          // this.state_pointsIndex = this.state.state_pointsIndex;
        }

        //mountposition, targetendeffector positition changes.. for loop here..
        if (
          this.state_selectedObjects &&
          this.state_selectedObjects.length > 0
        ) {
          // for (
          //   this.state_selectedObjectsIndex = 0;
          //   this.state_selectedObjectsIndex < this.state_selectedObjects.length;
          //   this.state_selectedObjectsIndex++
          // )
          {
            /* if (this.props.setProgressAnimate) {
              const percentage =
                (this.state_selectedObjectsIndex * 100.0) /
                this.state_selectedObjects.length;
              this.props.setProgressAnimate(percentage);
              console.log('Percentage Selections', percentage);
            } */
            const selectedObjectsElement =
              this.state_selectedObjects[this.state_selectedObjectsIndex];
            if (
              selectedObjectsElement.curvePoints &&
              selectedObjectsElement.curvePoints.length > 0
            ) {
              if (this.state_pointsIndex === 0) {
                this.calculateInverseKinematicMovementInCalculation = true;
                this.state_curvePoints = this.getPointsFromIndex(
                  this.state_selectedObjects,
                  this.state_selectedObjectsIndex,
                  this.state_lastPoints
                );
                this.state_lastPoints = this.state_curvePoints;
              }
              // for (
              //   this.state_pointsIndex = 0;
              //   this.state_pointsIndex < curvePoints.length;
              //   this.state_pointsIndex++
              // )
              {
                if (this.props.setProgressAnimate) {
                  const percentage =
                    ((this.state_selectedObjectsIndex +
                      this.state_pointsIndex / this.state_curvePoints.length) *
                      100.0) /
                    this.state_selectedObjects.length;
                  this.props.setProgressAnimate(percentage);
                  console.log('Percentage Points', percentage);
                }
                if (this.props.setProgressAnimateText) {
                  this.props.setProgressAnimateText(
                    this.state_selectedObjectsIndex.toString() +
                      '/' +
                      this.state_selectedObjects.length.toString() +
                      '-' +
                      this.state_pointsIndex.toString() +
                      '/' +
                      this.state_curvePoints.length.toString()
                  );
                }
                const pointsElement =
                  this.state_curvePoints[this.state_pointsIndex];
                targetEndEffectorPosition = new Vector3(
                  pointsElement.x / 0.001,
                  -pointsElement.z / 0.001,
                  pointsElement.y / 0.001
                );
                let originalTargetPosition = targetEndEffectorPosition.clone();

                const differenceBetweenTargetAndEndEffector =
                  new Vector3().subVectors(
                    targetEndEffectorPosition,
                    this.state_calculatedMountPosition
                  );
                let lengthBetweenTargetAndEndEffector =
                  differenceBetweenTargetAndEndEffector.x *
                    differenceBetweenTargetAndEndEffector.x +
                  differenceBetweenTargetAndEndEffector.y *
                    differenceBetweenTargetAndEndEffector.y +
                  differenceBetweenTargetAndEndEffector.z *
                    differenceBetweenTargetAndEndEffector.z;
                if (lengthBetweenTargetAndEndEffector === 0) {
                  return;
                }

                originalTargetPosition.sub(
                  this.state_originalXYZShiftablePosition
                );
                originalTargetPosition.sub(
                  this.state_calculatedKinematicItemChain[endOfActuator].T
                );
                originalTargetPosition.sub(
                  this.state_calculatedKinematicItemChain[endOfActuator].S
                );
                originalTargetPosition.applyQuaternion(
                  this.state_calculatedKinematicItemChain[
                    endOfActuator
                  ].Q.clone().invert()
                );
                originalTargetPosition.add(
                  this.state_calculatedKinematicItemChain[endOfActuator].L
                );

                let direction = false;
                //let directionMultiplier = -1;
                let foundThePosition = false;
                let changeMade = false;
                let directionIndex = 0;

                // console.log(
                //   'GOt inititally',
                //   currentMountPosition,
                //   originalEndEffectorPosition,
                //   originalTargetPosition,
                //   targetEndEffectorPosition
                // );
                const howManyIterations = this.props.kinematicParameters
                  ? this.props.kinematicParameters.iterations +
                      ((this.props.kinematicParameters.iterations + 1) % 2) ||
                    21
                  : 21;
                for (
                  let iteration = 0;
                  iteration < howManyIterations;
                  iteration++
                ) {
                  direction = !direction;
                  let couldFindTheta = false;
                  //let lastPositionalIndex = 0;
                  //let startPositionalIndex = 0;
                  directionIndex = beginOfActuator;
                  for (; directionIndex < endOfActuator; directionIndex++) {
                    const positionalIndex =
                      direction === true
                        ? directionIndex
                        : endOfActuator - directionIndex + beginOfActuator - 1;
                    const isActuatorOrEndEffector =
                      this.state_calculatedKinematicItemChain[
                        positionalIndex + 1
                      ].K;
                    if (isActuatorOrEndEffector) {
                      let previousCalculatedKinematicItemChain =
                        this.cloneChainInfoForward(
                          this.state_calculatedKinematicItemChain
                        );
                      let leastTheta = 6.28;
                      let mostTheta = -6.28;
                      const howManyMethods = this.props.kinematicParameters
                        ? this.props.kinematicParameters.methods || 1
                        : 1;
                      for (
                        let methodIndex = 0;
                        methodIndex < howManyMethods;
                        methodIndex++
                      ) {
                        let localQuaternion =
                          this.state_calculatedKinematicItemChain[
                            positionalIndex
                          ].Q;
                        let localPosition =
                          this.state_calculatedKinematicItemChain[
                            positionalIndex
                          ].L;
                        let localTranslation =
                          this.state_calculatedKinematicItemChain[
                            positionalIndex
                          ].T;
                        let localShiftedPosition =
                          this.state_calculatedKinematicItemChain[
                            positionalIndex
                          ].S;
                        //let globalShiftedPosition = new Vector3(0, 0, 0);
                        let changeMadeInInnerLoop = false;
                        let positionalIndexFound = false;
                        for (
                          let index = positionalIndex;
                          index <
                          this.state_calculatedKinematicItemChain.length - 1;
                          index++
                        ) {
                          // console.log(
                          //   'Parsed Index info',
                          //   index,
                          //   positionalIndex,
                          //   beginOfActuator,
                          //   endOfActuator,
                          //   directionIndex
                          // );
                          let [
                            sequence,
                            sequenceItem,
                            propsElementIndex,
                            currentNodeIndex,
                            isActuatorNode,
                            isLinearNode,
                            isEndEffectorNode,
                            currentAxisNode,
                            currentPositionNode
                          ] = parsedIndexInfo[index];

                          let currentChainValue =
                            this.state_calculatedKinematicItemChain[index + 1];

                          if (isActuatorNode) {
                            let propsElement =
                              this.props.kinematicItemList[
                                propsElementIndex === -1
                                  ? index
                                  : propsElementIndex
                              ];
                            const currentAxis = currentAxisNode;
                            const currentPosition = currentPositionNode;
                            // localQuaternion = calculatedKinematicItemChain[index].Q;
                            // localPosition = calculatedKinematicItemChain[index].L;
                            // localTranslation = calculatedKinematicItemChain[index].T;
                            // localShiftedPosition = calculatedKinematicItemChain[index].S;
                            let localCurrentQuaternion =
                              localQuaternion.clone();
                            let localCurrentTranslation =
                              localTranslation.clone();
                            let currentShiftedPosition =
                              currentPosition.clone();
                            currentShiftedPosition.sub(localPosition);
                            currentShiftedPosition.applyQuaternion(
                              localCurrentQuaternion
                            );
                            currentShiftedPosition.add(localShiftedPosition);
                            let currentPositionAxis = currentAxis.clone();
                            currentPositionAxis.applyQuaternion(
                              localCurrentQuaternion
                            );
                            currentPositionAxis.normalize();

                            const isLinear = isLinearNode;
                            if (positionalIndex === index) {
                              positionalIndexFound = true;
                              let differenceBetween = 0;
                              if (isLinear) {
                                let currentOriginalEndEffectorPosition,
                                  currentOriginalTargetPosition,
                                  currentEndEffectorposition,
                                  currentTargetPosition,
                                  differencePosition;
                                if (
                                  methodIndex === 0 ||
                                  methodIndex === 4 ||
                                  methodIndex === 5
                                ) {
                                  currentOriginalEndEffectorPosition =
                                    this.state_calculatedMountPosition.clone();

                                  currentOriginalTargetPosition =
                                    targetEndEffectorPosition.clone();
                                }
                                if (methodIndex === 1 || methodIndex === 3) {
                                  currentOriginalEndEffectorPosition =
                                    originalEndEffectorPosition.clone();
                                  currentOriginalEndEffectorPosition.sub(
                                    currentPosition
                                  );
                                  currentOriginalEndEffectorPosition.applyQuaternion(
                                    localCurrentQuaternion
                                  );
                                  currentOriginalEndEffectorPosition.add(
                                    currentShiftedPosition
                                  );
                                  currentOriginalTargetPosition =
                                    originalTargetPosition.clone();
                                  currentOriginalTargetPosition.sub(
                                    currentPosition
                                  );
                                  currentOriginalTargetPosition.applyQuaternion(
                                    localCurrentQuaternion
                                  );
                                  currentOriginalTargetPosition.add(
                                    currentShiftedPosition
                                  );
                                }
                                if (methodIndex === 2) {
                                  currentOriginalEndEffectorPosition =
                                    originalEndEffectorPosition.clone();
                                  currentOriginalTargetPosition =
                                    originalTargetPosition.clone();
                                }
                                // console.log(
                                //   'Method Index',
                                //   methodIndex,
                                //   currentOriginalEndEffectorPosition,
                                //   this.props.kinematicParameters,
                                //   this.props.kinematicParameters
                                //     ? this.props.kinematicParameters.methods || 5
                                //     : 5
                                // );
                                currentEndEffectorposition =
                                  currentOriginalEndEffectorPosition.clone();
                                currentTargetPosition =
                                  currentOriginalTargetPosition.clone();
                                differencePosition = new Vector3().subVectors(
                                  currentTargetPosition,
                                  currentEndEffectorposition
                                );
                                if (methodIndex === 0 || methodIndex === 1) {
                                  differenceBetween =
                                    differencePosition.x *
                                      currentPositionAxis.x +
                                    differencePosition.y *
                                      currentPositionAxis.y +
                                    differencePosition.z *
                                      currentPositionAxis.z;

                                  if (methodIndex === 0) {
                                    leastTheta = differenceBetween;
                                    mostTheta = differenceBetween;
                                  }
                                }
                                if (methodIndex === 2) {
                                  differenceBetween =
                                    differencePosition.x * currentAxis.x +
                                    differencePosition.y * currentAxis.y +
                                    differencePosition.z * currentAxis.z;
                                }
                                if (methodIndex === 3) {
                                  differenceBetween =
                                    differencePosition.x *
                                      currentPositionAxis.x +
                                    differencePosition.y *
                                      currentPositionAxis.y +
                                    differencePosition.z *
                                      currentPositionAxis.z;
                                  if (differenceBetween > 0) {
                                    differenceBetween = Math.sqrt(
                                      differencePosition.x *
                                        differencePosition.x +
                                        differencePosition.y *
                                          differencePosition.y +
                                        differencePosition.z *
                                          differencePosition.z
                                    );
                                  } else {
                                    differenceBetween = -Math.sqrt(
                                      differencePosition.x *
                                        differencePosition.x +
                                        differencePosition.y *
                                          differencePosition.y +
                                        differencePosition.z *
                                          differencePosition.z
                                    );
                                  }
                                }
                                if (methodIndex === 4) {
                                  differenceBetween = leastTheta / 2;
                                }
                                if (methodIndex === 5) {
                                  differenceBetween = mostTheta / 2;
                                }
                              } else {
                                let currentBeforeLocalQuaternion,
                                  currentBeforeLocalQuaternionApplied,
                                  currentOriginalEndEffectorPosition,
                                  currentOriginalTargetPosition =
                                    targetEndEffectorPosition.clone();
                                if (
                                  methodIndex === 0 ||
                                  methodIndex === 3 ||
                                  methodIndex === 4 ||
                                  methodIndex === 5
                                ) {
                                  currentOriginalEndEffectorPosition =
                                    this.state_calculatedMountPosition.clone();
                                  currentOriginalTargetPosition =
                                    targetEndEffectorPosition.clone();
                                }
                                if (methodIndex === 1) {
                                  currentBeforeLocalQuaternion =
                                    new Quaternion();

                                  currentBeforeLocalQuaternion
                                    .setFromAxisAngle(
                                      currentPositionAxis,
                                      currentChainValue.A
                                    )
                                    .normalize();
                                  currentBeforeLocalQuaternionApplied =
                                    localCurrentQuaternion.clone();
                                  currentBeforeLocalQuaternionApplied
                                    .premultiply(currentBeforeLocalQuaternion)
                                    .normalize();
                                  currentOriginalEndEffectorPosition =
                                    originalEndEffectorPosition.clone();
                                  currentOriginalEndEffectorPosition.sub(
                                    currentPosition
                                  );
                                  currentOriginalEndEffectorPosition.applyQuaternion(
                                    currentBeforeLocalQuaternionApplied
                                  );
                                  currentOriginalEndEffectorPosition.add(
                                    currentShiftedPosition
                                  );
                                  currentOriginalTargetPosition =
                                    originalTargetPosition.clone();
                                  currentOriginalTargetPosition.sub(
                                    currentPosition
                                  );
                                  currentOriginalTargetPosition.applyQuaternion(
                                    currentBeforeLocalQuaternionApplied
                                  );
                                  currentOriginalTargetPosition.add(
                                    currentShiftedPosition
                                  );
                                }
                                if (methodIndex === 2) {
                                  currentOriginalEndEffectorPosition =
                                    originalEndEffectorPosition.clone();
                                  currentOriginalTargetPosition =
                                    originalTargetPosition.clone();
                                }

                                let currentEndEffectorposition =
                                  currentOriginalEndEffectorPosition.clone();
                                let currentTargetPosition =
                                  currentOriginalTargetPosition.clone();

                                if (
                                  methodIndex === 0 ||
                                  methodIndex === 1 ||
                                  methodIndex === 3 ||
                                  methodIndex === 4 ||
                                  methodIndex === 5
                                ) {
                                  currentEndEffectorposition.sub(
                                    currentShiftedPosition
                                  );
                                  currentTargetPosition.sub(
                                    currentShiftedPosition
                                  );
                                }
                                if (methodIndex === 2) {
                                  currentEndEffectorposition.sub(
                                    currentPosition
                                  );
                                  currentTargetPosition.sub(currentPosition);
                                }

                                if (methodIndex === 0 || methodIndex === 1) {
                                  differenceBetween = this.angleToMoveToTarget(
                                    currentPositionAxis,
                                    currentEndEffectorposition,
                                    currentTargetPosition
                                  );
                                }
                                if (methodIndex === 2) {
                                  differenceBetween = this.angleToMoveToTarget(
                                    currentAxis,
                                    currentEndEffectorposition,
                                    currentTargetPosition
                                  );
                                }
                                if (methodIndex === 3) {
                                  differenceBetween =
                                    this.getAngleBetweenVectorsFromAxis(
                                      currentPositionAxis,
                                      currentEndEffectorposition,
                                      currentTargetPosition
                                    );
                                }
                                if (methodIndex === 4) {
                                  differenceBetween = leastTheta / 2;
                                  //console.log('Least method theta', leastTheta);
                                }
                                if (methodIndex === 5) {
                                  differenceBetween = mostTheta / 2;
                                  //console.log('Most method theta', mostTheta);
                                }
                              }
                              if (differenceBetween !== 0) {
                                currentChainValue.A += differenceBetween;
                                console.log(
                                  'Applying difference',
                                  differenceBetween,
                                  currentChainValue.A,
                                  propsElement.actuator_motion_control
                                    .minimum_limit,
                                  propsElement.actuator_motion_control
                                    .maximum_limit
                                );
                                if (
                                  currentChainValue.A >
                                  propsElement.actuator_motion_control
                                    .maximum_limit
                                ) {
                                  let previousDifferenceBetween =
                                    differenceBetween;
                                  differenceBetween =
                                    propsElement.actuator_motion_control
                                      .maximum_limit -
                                    currentChainValue.A +
                                    differenceBetween;
                                  currentChainValue.A =
                                    propsElement.actuator_motion_control.maximum_limit;
                                  console.log(
                                    'Applied maximum Limit difference',
                                    differenceBetween,
                                    previousDifferenceBetween,
                                    currentChainValue.A,
                                    propsElement.actuator_motion_control
                                      .minimum_limit,
                                    propsElement.actuator_motion_control
                                      .maximum_limit
                                  );
                                }
                                if (
                                  currentChainValue.A <
                                  propsElement.actuator_motion_control
                                    .minimum_limit
                                ) {
                                  let previousDifferenceBetween =
                                    differenceBetween;
                                  differenceBetween =
                                    propsElement.actuator_motion_control
                                      .minimum_limit -
                                    currentChainValue.A +
                                    differenceBetween;
                                  currentChainValue.A =
                                    propsElement.actuator_motion_control.minimum_limit;
                                  console.log(
                                    'Applied Minimum Limit difference',
                                    differenceBetween,
                                    previousDifferenceBetween,
                                    currentChainValue.A,
                                    propsElement.actuator_motion_control
                                      .minimum_limit,
                                    propsElement.actuator_motion_control
                                      .maximum_limit
                                  );
                                }
                                if (leastTheta > differenceBetween) {
                                  leastTheta = differenceBetween;
                                }
                                if (mostTheta < differenceBetween) {
                                  mostTheta = differenceBetween;
                                }
                              } else {
                                console.log(
                                  'Applying 0 diffference',
                                  positionalIndex,
                                  index,
                                  propsElement.actuator_motion_control
                                );
                              }
                            } else {
                              // console.log(
                              //   'Positional Index does not match',
                              //   positionalIndex,
                              //   index,
                              //   isActuatorNode,
                              //   isLinearNode
                              // );
                            }

                            if (isLinear) {
                              // const currentLength = Math.sqrt(
                              //   currentPositionAxis.x * currentPositionAxis.x +
                              //     currentPositionAxis.y * currentPositionAxis.y +
                              //     currentPositionAxis.z * currentPositionAxis.z
                              // );
                              // console.log(
                              //   'Before Adding values to the translation',
                              //   localCurrentTranslation,
                              //   localTranslation,
                              //   currentLength,
                              //   currentChainValue.A
                              // );
                              // if (currentLength !== 0) {
                              localCurrentTranslation.add(
                                new Vector3(
                                  currentPositionAxis.x * currentChainValue.A,
                                  currentPositionAxis.y * currentChainValue.A,
                                  currentPositionAxis.z * currentChainValue.A
                                )
                              );
                              // }
                              // console.log(
                              //   'Adding values to the translation',
                              //   localCurrentTranslation,
                              //   localTranslation,
                              //   currentChainValue.A
                              // );
                            } else {
                              let currentAxisQuaternion = new Quaternion();
                              currentAxisQuaternion
                                .setFromAxisAngle(
                                  currentPositionAxis,
                                  currentChainValue.A
                                )
                                .normalize();
                              localCurrentQuaternion
                                .premultiply(currentAxisQuaternion)
                                .normalize();
                            }

                            // let shiftedPosition = currentPosition.clone();
                            // shiftedPosition.applyQuaternion(localQuaternion);
                            // shiftedPosition.add(globalShiftedPosition);
                            // let shiftingPosition = currentPosition.clone();
                            // shiftingPosition.applyQuaternion(localCurrentQuaternion);
                            // shiftedPosition.sub(shiftingPosition);
                            // shiftedPosition.sub(localTranslation);
                            // shiftedPosition.add(localCurrentTranslation);
                            // console.log(
                            //   'Chain Values before',
                            //   currentChainValue.A,
                            //   currentChainValue.L,
                            //   currentChainValue.Q,
                            //   currentChainValue.S,
                            //   currentChainValue.T,
                            //   calculatedKinematicItemChain[index + 1].A,
                            //   calculatedKinematicItemChain[index + 1].L,
                            //   calculatedKinematicItemChain[index + 1].Q,
                            //   calculatedKinematicItemChain[index + 1].S,
                            //   calculatedKinematicItemChain[index + 1].T,
                            //   index
                            // );
                            localPosition = currentPosition.clone();
                            localQuaternion = localCurrentQuaternion.clone();
                            localShiftedPosition =
                              currentShiftedPosition.clone();
                            localTranslation = localCurrentTranslation.clone();
                            currentChainValue.L = currentPosition.clone();
                            currentChainValue.Q =
                              localCurrentQuaternion.clone();
                            currentChainValue.S =
                              currentShiftedPosition.clone();
                            currentChainValue.T =
                              localCurrentTranslation.clone();
                            // console.log(
                            //   'Chain Values after',
                            //   currentChainValue.A,
                            //   currentChainValue.L,
                            //   currentChainValue.Q,
                            //   currentChainValue.S,
                            //   currentChainValue.T,
                            //   calculatedKinematicItemChain[index + 1].A,
                            //   calculatedKinematicItemChain[index + 1].L,
                            //   calculatedKinematicItemChain[index + 1].Q,
                            //   calculatedKinematicItemChain[index + 1].S,
                            //   calculatedKinematicItemChain[index + 1].T,
                            //   index
                            // );
                            //globalShiftedPosition = shiftedPosition.clone();
                          } else {
                            currentChainValue.L = localPosition.clone();
                            currentChainValue.Q = localQuaternion.clone();
                            currentChainValue.S = localShiftedPosition.clone();
                            currentChainValue.T = localTranslation.clone();
                            // console.log(
                            //   'Not an actuator',
                            //   propsElement,
                            //   index,
                            //   localPosition,
                            //   localQuaternion,
                            //   calculatedMountPosition
                            // );
                          }
                          if (isEndEffectorNode) {
                            // localQuaternion = calculatedKinematicItemChain[index].Q;
                            // localPosition = calculatedKinematicItemChain[index].L;
                            // localTranslation = calculatedKinematicItemChain[index].T;
                            // localShiftedPosition = calculatedKinematicItemChain[index].S;
                            // console.log(
                            //   'Adding values at endeffector to the translation',
                            //   localTranslation,
                            //   calculatedKinematicItemChain[index + 1].T
                            // );

                            if (this.props.itemProperties) {
                              const itemProperties = this.props.itemProperties;
                              //console.log('Got itemproperties as', itemProperties);
                              if (
                                itemProperties.actuator_motion_control &&
                                itemProperties.actuator_motion_control
                                  .cylindrical_axis_of_rotation &&
                                itemProperties.actuator_motion_control
                                  .cylindrical_axis_of_rotation.mountobb
                              ) {
                                const mountSurface =
                                  itemProperties.actuator_motion_control
                                    .cylindrical_axis_of_rotation.mountobb;
                                let mountPosition = new Vector3(
                                  mountSurface.cx,
                                  mountSurface.cy,
                                  mountSurface.cz
                                );
                                mountPosition.sub(localPosition);
                                mountPosition.applyQuaternion(localQuaternion);
                                mountPosition.add(localShiftedPosition);
                                mountPosition.add(localTranslation);
                                mountPosition.add(
                                  this.state_originalXYZShiftablePosition
                                );
                                let currentTargetPosition =
                                  targetEndEffectorPosition.clone();
                                let differenceCalcuatedPosition =
                                  new Vector3().subVectors(
                                    currentTargetPosition,
                                    mountPosition
                                  );
                                let differenceCalculatedBetween =
                                  differenceCalcuatedPosition.x *
                                    differenceCalcuatedPosition.x +
                                  differenceCalcuatedPosition.y *
                                    differenceCalcuatedPosition.y +
                                  differenceCalcuatedPosition.z *
                                    differenceCalcuatedPosition.z;
                                if (
                                  differenceCalculatedBetween <
                                  lengthBetweenTargetAndEndEffector
                                ) {
                                  changeMadeInInnerLoop = true;
                                  couldFindTheta = true;
                                  changeMade = true;
                                  if (
                                    differenceCalculatedBetween <=
                                    (this.state.kinematicPrecision ||
                                      0.00000001)
                                  ) {
                                    foundThePosition = true;
                                    console.log(
                                      'Reached after ',
                                      iteration + 1,
                                      'iterations',
                                      'error rate',
                                      differenceCalculatedBetween,
                                      lengthBetweenTargetAndEndEffector,
                                      this.state_calculatedMountPosition,
                                      targetEndEffectorPosition,
                                      mountPosition,
                                      localPosition,
                                      localQuaternion,
                                      index,
                                      positionalIndex,
                                      directionIndex
                                    );
                                  } else {
                                    console.log(
                                      'Difference Length',
                                      differenceCalculatedBetween,
                                      lengthBetweenTargetAndEndEffector,
                                      this.state_calculatedMountPosition,
                                      targetEndEffectorPosition,
                                      mountPosition,
                                      localPosition,
                                      localQuaternion,
                                      'iteration no',
                                      iteration + 1,
                                      index,
                                      positionalIndex,
                                      directionIndex
                                    );
                                  }
                                  lengthBetweenTargetAndEndEffector =
                                    differenceCalculatedBetween;
                                  this.state_calculatedMountPosition =
                                    mountPosition.clone();
                                  originalTargetPosition =
                                    targetEndEffectorPosition.clone();
                                  originalTargetPosition.sub(
                                    this.state_originalXYZShiftablePosition
                                  );
                                  originalTargetPosition.sub(localTranslation);
                                  originalTargetPosition.sub(
                                    localShiftedPosition
                                  );
                                  originalTargetPosition.applyQuaternion(
                                    localQuaternion.clone().invert()
                                  );
                                  originalTargetPosition.add(localPosition);
                                  console.log(
                                    'Got original target pos',
                                    originalTargetPosition,
                                    new Vector3(
                                      mountSurface.cx,
                                      mountSurface.cy,
                                      mountSurface.cz
                                    )
                                  );
                                } else {
                                  console.log(
                                    'Difference Length Exceeds',
                                    differenceCalculatedBetween,
                                    lengthBetweenTargetAndEndEffector,
                                    this.state_calculatedMountPosition,
                                    targetEndEffectorPosition,
                                    mountPosition,
                                    localPosition,
                                    localQuaternion,
                                    'iteration',
                                    iteration + 1,
                                    index,
                                    positionalIndex,
                                    directionIndex
                                  );
                                  // for (
                                  //   let chainPrintIndex = 0;
                                  //   chainPrintIndex < calculatedKinematicItemList.length;
                                  //   chainPrintIndex++
                                  // ) {
                                  //   console.log(
                                  //     calculatedKinematicItemList[chainPrintIndex]
                                  //       .actuator_motion_control,
                                  //     previousCalculatedKinematicItemList[chainPrintIndex]
                                  //       .actuator_motion_control
                                  //   );
                                  // }
                                  this.state_calculatedKinematicItemChain =
                                    this.cloneChainInfoForward(
                                      previousCalculatedKinematicItemChain
                                    );
                                }
                              }
                            }
                          }
                          if (foundThePosition) {
                            break;
                          }
                        }
                        if (foundThePosition) {
                          break;
                        }
                        if (changeMadeInInnerLoop) {
                          break;
                        }
                        if (!positionalIndexFound) {
                          console.log('end effector or not an actuator');
                          break;
                        }
                      }
                      //lastPositionalIndex = positionalIndex + 1;
                      if (foundThePosition) {
                        break;
                      }
                    }
                    //startPositionalIndex = positionalIndex;
                    //lastPositionalIndex = startPositionalIndex;
                  }
                  if (foundThePosition) {
                    break;
                  }

                  if (!couldFindTheta) {
                    console.log(
                      'Not reachable beyond this',
                      iteration + 1,
                      'iterations',
                      lengthBetweenTargetAndEndEffector,
                      'error rate'
                    );
                    break;
                  }
                  directionIndex = beginOfActuator + 1;
                }
                if (this.props.setKinematicItemList && changeMade) {
                  this.displayForDebug(
                    this.state_calculatedKinematicItemChain,
                    'My Values',
                    parsedIndexInfo
                  );
                  console.log(
                    'Current and Target',
                    this.state_calculatedMountPosition,
                    targetEndEffectorPosition
                  );
                  // const resultKinematicList = this.cloneChainInfoBackward(
                  //   this.state_calculatedKinematicItemChain,
                  //   this.props.kinematicItemList,
                  //   parsedIndexInfo
                  // );

                  const resultKinematicList = this.cloneChainInfoOnlyMovement(
                    this.state_calculatedKinematicItemChain,
                    false
                  );
                  this.calculateInverseKinematicMovementArray.push(
                    resultKinematicList
                  );
                }
                this.state_pointsIndex += 1;
                if (this.state_pointsIndex >= this.state_curvePoints.length) {
                  this.calculateInverseKinematicMovementInCalculation = false;
                  this.state_pointsIndex = 0;
                  this.state_selectedObjectsIndex += 1;
                  if (
                    this.state_selectedObjectsIndex <
                    this.state_selectedObjects.length
                  ) {
                    setTimeout(() => {
                      this.calculateInverseKinematicMovementFromPointsWithoutLoop(
                        false
                      );
                      console.log(
                        'Executed',
                        this.state_selectedObjectsIndex,
                        this.state_selectedObjects.length,
                        this.state_pointsIndex,
                        this.state_curvePoints.length
                      );
                    }, 0);
                    console.log(
                      'Setting values Plus',
                      this.state_selectedObjectsIndex,
                      this.state_pointsIndex
                    );
                    this.setState({
                      state_selectedObjectsIndex:
                        this.state_selectedObjectsIndex,
                      state_pointsIndex: this.state_pointsIndex
                    });
                  } else {
                    if (this.props.setProgressAnimateText) {
                      this.props.setProgressAnimateText('Completed');
                    }
                    if (this.props.setProgressAnimate) {
                      this.props.setProgressAnimate(100);
                    }
                    this.calculateInverseKinematicMovementInCalculation = false;
                    this.state_calculatedKinematicItemChainChanged = false;
                  }
                } else {
                  setTimeout(() => {
                    this.calculateInverseKinematicMovementFromPointsWithoutLoop(
                      false
                    );
                    console.log(
                      'Executed',
                      this.state_selectedObjectsIndex,
                      this.state_selectedObjects.length,
                      this.state_pointsIndex,
                      this.state_curvePoints.length
                    );
                  }, 0);
                  console.log(
                    'Setting values Else',
                    this.state_selectedObjectsIndex,
                    this.state_pointsIndex
                  );
                  this.setState({
                    state_selectedObjectsIndex: this.state_selectedObjectsIndex,
                    state_pointsIndex: this.state_pointsIndex
                  });
                }
              }
            }
          }
        }
      }
    }

    console.log('Got array as', this.calculateInverseKinematicMovementArray);
  };
  performKinematicMovement_old = (prevProps, parsedInfo) => {
    if (this.props.kinematicItemList && this.props.showKinematicSliderMove) {
      if (
        JSON.stringify(prevProps ? prevProps.kinematicItemList || [] : []) !==
          JSON.stringify(this.props.kinematicItemList || []) &&
        JSON.stringify(parsedInfo || []) !== JSON.stringify([])
      ) {
        /*console.log(
          'Got in GltfRender',
          this.props.kinematicItemList,
          this.partsMeshes,
          this.props.gltfobj
        );*/

        if (
          this.partsMeshes &&
          this.partsMeshes.length > 0 &&
          this.props.kinematicItemList &&
          this.props.kinematicItemList.length > 0
        ) {
          const sameGLTF = prevProps
            ? prevProps.activeGLTFFile === this.props.activeGLTFFile
            : false;
          if (prevProps === null) {
            this.removeDrawnAxisLines();
            this.axisArray = [];
            this.removeSphere();
            this.removeDragger();
          }
          let localQuaternion = new Quaternion(0, 0, 0, 1);
          let localPosition = new Vector3(0, 0, 0);
          //let localPreviousPosition = new Vector3(0, 0, 0);
          let localTranslation = new Vector3(0, 0, 0);
          let localShiftedPosition = new Vector3(0, 0, 0);
          // let localQuaternionArray = [];
          // localQuaternionArray.push(localQuaternion.clone());
          // let currentQuaternionArray = [];
          // currentQuaternionArray.push(localQuaternion.clone());
          // let localPositionArray = [];
          // localPositionArray.push(localPosition.clone());
          // //let localPreviousPosition = new Vector3(0, 0, 0);
          // let localTranslationArray = [];
          // localTranslationArray.push(localTranslation.clone());
          // let localShiftedPositionArray = [];
          // localShiftedPositionArray.push(localShiftedPosition.clone());
          // let indexArray = [];
          // indexArray.push(0);
          for (
            let index = 0;
            index < this.props.kinematicItemList.length;
            index++
          ) {
            const sequencedElement = this.getSequencedItem(
              parsedInfo,
              index + 1,
              1
            );

            const propsElement = sequencedElement
              ? this.getKinematicItem(
                  this.props.kinematicItemList,
                  sequencedElement
                )
              : this.props.kinematicItemList[index];

            const currentNode = this.findNodeFrom(propsElement);
            /*console.log(
              'Comparing stringingfication',
              parsedInfo,
              propsElement,
              sequencedElement,
              currentNode
            );*/
            if (
              currentNode &&
              propsElement &&
              propsElement.actuator_motion_control &&
              !propsElement.actuator_motion_control.is_end_effector &&
              propsElement.actuator_motion_control.child_part_type ===
                'ACTUATOR'
            ) {
              // if (prevProps === null) {
              //  /*  const axisLine = this.drawAxisLineToKinematic(propsElement);
              //   if (currentNode) {
              //     currentNode.axisLine = axisLine
              //       ? axisLine.children
              //         ? axisLine.children.length > 0
              //           ? axisLine.children[0]
              //           : null
              //         : null
              //       : null;
              //     //this.AssignPositionToSingleNode(currentNode.axisLine, 0);
              //   } else {
              //     console.log('Current node is null for', propsElement);
              //   } */

              //   /* const axisline = this.drawAxisLineToKinematic(propsElement);
              //   if (axisline) {
              //     const meshLine = axisline.children[0];
              //     let targetDirection = new Vector3();
              //     const sourceDirection =
              //       meshLine.getWorldDirection(targetDirection);
              //     let targetPosition = new Vector3();
              //     const sourcePosition = meshLine.getWorldPosition(targetPosition);

              //     console.log(
              //       meshLine,
              //       sourceDirection,
              //       targetDirection,
              //       sourcePosition,
              //       targetPosition,
              //       propsElement.actuator_motion_control
              //         .cylindrical_axis_of_rotation.axis,
              //       propsElement.actuator_motion_control
              //         .cylindrical_axis_of_rotation.position,
              //       meshLine.geometry,
              //       meshLine.geometry.vertices
              //     );
              //   }
              //   if (currentNode) {
              //     console.log('Current Node', currentNode, axisline);
              //   }*/
              // }

              const prevPropsElement = sameGLTF
                ? prevProps.kinematicItemList
                  ? prevProps.kinematicItemList[index].filePartName ===
                    propsElement.filePartName
                    ? prevProps.kinematicItemList[index]
                    : this.getPrevPropsItem(prevProps, propsElement)
                  : null
                : null;
              let differenceElement =
                prevPropsElement && propsElement
                  ? prevPropsElement.actuator_motion_control &&
                    propsElement.actuator_motion_control
                    ? propsElement.actuator_motion_control.chain_number -
                      prevPropsElement.actuator_motion_control.chain_number
                    : 0
                  : 0;
              if (!sameGLTF || !prevPropsElement) {
                differenceElement = propsElement
                  ? propsElement.actuator_motion_control
                    ? propsElement.actuator_motion_control.chain_number
                    : 0
                  : 0;
              }
              if (
                differenceElement ||
                propsElement.actuator_motion_control.chain_number !==
                  0 /* || prevProps === null */
              ) {
                let currentAxis = propsElement.actuator_motion_control
                  .cylindrical_axis_of_rotation
                  ? propsElement.actuator_motion_control
                      .cylindrical_axis_of_rotation.axis
                    ? new Vector3(
                        propsElement.actuator_motion_control.cylindrical_axis_of_rotation.axis[0],
                        propsElement.actuator_motion_control.cylindrical_axis_of_rotation.axis[1],
                        propsElement.actuator_motion_control.cylindrical_axis_of_rotation.axis[2]
                      )
                    : new Vector3()
                  : new Vector3();
                let currentPosition = propsElement.actuator_motion_control
                  .cylindrical_axis_of_rotation
                  ? propsElement.actuator_motion_control
                      .cylindrical_axis_of_rotation.position
                    ? new Vector3(
                        propsElement.actuator_motion_control.cylindrical_axis_of_rotation.position[0],
                        propsElement.actuator_motion_control.cylindrical_axis_of_rotation.position[1],
                        propsElement.actuator_motion_control.cylindrical_axis_of_rotation.position[2]
                      )
                    : new Vector3()
                  : new Vector3();

                //let mydummyquaternion = localQuaternion; //new Quaternion();
                //mydummyquaternion.setFromAxisAngle(new Vector3(0.19, 1, 0), 0);
                let localCurrentQuaternion = localQuaternion.clone();
                let currentOriginalPosition = currentPosition.clone();
                let localCurrentTranslation = localTranslation.clone();
                currentPosition.sub(localPosition);
                currentPosition.applyQuaternion(localCurrentQuaternion);
                //currentPosition.applyQuaternion(currentQuaternion);
                currentPosition.add(localPosition);
                //let currentAnotherAxis = currentAxis.clone();
                let currentPositionAxis = currentAxis.clone();
                currentPositionAxis.add(currentOriginalPosition);
                currentPositionAxis.sub(localPosition);
                currentPositionAxis.applyQuaternion(localCurrentQuaternion);
                currentPositionAxis.add(localPosition);
                currentPositionAxis.sub(currentPosition);
                currentPositionAxis.normalize();
                //const localExtaPosition = currentOriginalPosition.clone();
                //localExtaPosition.sub(localPreviousPosition);

                // currentPosition = new Vector3(0, 0, 0);
                // currentPosition.sub(localPosition);
                // currentPosition.applyQuaternion(localQuaternionCopy);
                // //currentPosition.applyQuaternion(currentQuaternion);
                // currentPosition.add(localPosition);
                const isLinear =
                  propsElement.actuator_motion_control.is_linear_or_rotational;
                let currentAxisQuaternion = new Quaternion();
                if (isLinear) {
                  const currentLength = Math.sqrt(
                    currentPositionAxis.x * currentPositionAxis.x +
                      currentPositionAxis.y * currentPositionAxis.y +
                      currentPositionAxis.z * currentPositionAxis.z
                  );
                  if (currentLength !== 0) {
                    localCurrentTranslation.add(
                      new Vector3(
                        (currentPositionAxis.x *
                          propsElement.actuator_motion_control.chain_number) /
                          currentLength,
                        (currentPositionAxis.y *
                          propsElement.actuator_motion_control.chain_number) /
                          currentLength,
                        (currentPositionAxis.z *
                          propsElement.actuator_motion_control.chain_number) /
                          currentLength
                      )
                    );
                  }
                } else {
                  /* currentAxis.sub(localPosition);
                  currentAxis.applyQuaternion(mydummyquaternion);
                  currentAxis.add(localPosition);
                  currentAxis.normalize();
                  currentQuaternion
                    .setFromAxisAngle(currentAxis, differenceElement)
                    .normalize();
                  localQuaternion = currentQuaternion.clone(); */
                  currentAxisQuaternion
                    .setFromAxisAngle(
                      currentPositionAxis,
                      /* index >= 2 && false
                        ? 0
                        : */
                      propsElement.actuator_motion_control.chain_number
                    )
                    .normalize();
                  localCurrentQuaternion
                    .premultiply(currentAxisQuaternion)
                    .normalize();
                }

                // const multipliedAxis =
                //   this.getAxisFromQuaternion(localQuaternion);
                /*console.log(
                  'Quaternion inside loop',
                  currentQuaternion,
                  localQuaternion,
                  localCurrentQuaternion,
                  localCurrentTranslation,
                  //multipliedAxis,
                  currentAxis,
                  currentPositionAxis,
                  localTranslation
                );*/

                // let localPreviousCUrrentPosition =
                //   currentOriginalPosition.clone();

                /*  localPreviousCUrrentPosition.sub(localPreviousPosition);
                localPreviousCUrrentPosition.sub(localPosition);
                localPreviousCUrrentPosition.applyQuaternion(
                  localQuaternionCopy
                );

                localPreviousCUrrentPosition.add(localPosition);
                localPreviousCUrrentPosition.add(localPreviousPosition); */

                //localPreviousCUrrentPosition.add(new Vector3(-15, -16, 0));
                // let localPreviousStoredPosition =
                //   currentOriginalPosition.clone();
                // localPreviousStoredPosition.sub(localPreviousPosition);
                // localPreviousStoredPosition.applyQuaternion(
                //   localCurrentQuaternion //.clone().invert()
                // );
                // localPreviousStoredPosition.add(localPreviousPosition);
                // localPreviousStoredPosition.sub(localPosition);
                // localPreviousStoredPosition.applyQuaternion(
                //   localCurrentQuaternion //.clone().invert()
                // );
                // //currentPosition.applyQuaternion(currentQuaternion);
                // /*  localPreviousStoredPosition.add(localPosition);
                // localPreviousStoredPosition = currentOriginalPosition.clone();
                // localPreviousStoredPosition.applyMatrix4(currentNode.matrix); */
                // let localPerviousAssignedPosition = new Vector3(
                //   -localPreviousPosition.x,
                //   -localPreviousPosition.y,
                //   -localPreviousPosition.z
                // );
                // //localPreviousPosition.clone();
                // localPerviousAssignedPosition.applyMatrix4(currentNode.matrix);
                // let localZeroPosition = new Vector3(0, 0, 0);
                // localZeroPosition.applyMatrix4(currentNode.matrix);
                // console.log(
                //   'Difference between',
                //   localPreviousStoredPosition,
                //   currentPosition,
                //   localPosition,
                //   currentOriginalPosition,
                //   'Previous',
                //   localPerviousAssignedPosition,
                //   localPreviousPosition,
                //   'Zero',
                //   localZeroPosition,
                //   index,
                //   'Node',
                //   currentNode.position,
                //   currentNode.quaternion,
                //   currentNode.scale,
                //   localCurrentQuaternion,
                //   localQuaternion
                // );
                //localPreviousStoredPosition = currentPosition.clone();
                //localPreviousStoredPosition.sub(currentOriginalPosition);
                /* localPreviousStoredPosition = currentPosition.clone();
                if (index >= 2) {
                  localPreviousStoredPosition.add(localPosition);
                } */

                let shiftedPosition = currentOriginalPosition.clone();
                shiftedPosition.applyQuaternion(localQuaternion);
                shiftedPosition.add(localShiftedPosition);
                let shiftingPosition = currentOriginalPosition.clone();
                shiftingPosition.applyQuaternion(localCurrentQuaternion);
                shiftedPosition.sub(shiftingPosition);
                shiftedPosition.add(localCurrentTranslation);
                //shiftingPosition.sub(shiftedPosition);

                localPosition = currentPosition.clone();
                localQuaternion = localCurrentQuaternion.clone();
                localShiftedPosition = shiftedPosition.clone();
                localTranslation = localCurrentTranslation.clone();

                // localQuaternionArray.push(localQuaternion.clone());
                // localPositionArray.push(localPosition.clone());
                // //let localPreviousPosition = new Vector3(0, 0, 0);
                // localTranslationArray.push(localTranslation.clone());
                // localShiftedPositionArray.push(localShiftedPosition.clone());
                // currentQuaternionArray.push(currentAxisQuaternion.clone());
                // indexArray.push(index + 1);
                //localPosition = localPreviousCUrrentPosition.clone();
                //localPreviousPosition = currentOriginalPosition.clone();
                /*
                const multipliedAxis =
                  this.getAxisFromQuaternion(localQuaternion);

                var dotGeometry = new BufferGeometry();
                //dotGeometry.vertices.push(localPosition);
                dotGeometry.setAttribute(
                  'position',
                  new Float32BufferAttribute(
                    [
                      localPosition.x * 0.001,

                      localPosition.z * 0.001,
                      -localPosition.y * 0.001
                    ],
                    3
                  )
                );

                var dotMaterial = new PointsMaterial({
                  size: 100,
                  color: 0xffdd00,
                  sizeAttenuation: false
                });
                var dot = new Points(dotGeometry, dotMaterial);
                dot.name = propsElement.name;
                this.scene.add(dot);
                this.drawAxisLine(
                  [multipliedAxis.x, multipliedAxis.y, multipliedAxis.z],
                  [
                    currentPosition.x,
                    currentPosition.y,
                    currentPosition.z + 10
                  ],

                  'i am NEW' +
                    propsElement.name +
                    Number(currentPosition.x).toFixed(3).toString() +
                    ' ' +
                    Number(currentPosition.y).toFixed(3).toString() +
                    ' ' +
                    Number(currentPosition.z).toFixed(3).toString() +
                    ' ' //+
                  //propsElement.name
                );
                this.drawAxisLine(
                  [
                    currentAnotherAxis.x,
                    currentAnotherAxis.y,
                    currentAnotherAxis.z
                  ],
                  [
                    currentAnotherPosition.x,
                    currentAnotherPosition.y,
                    currentAnotherPosition.z + 10
                  ],
                  'Old one' +
                    propsElement.name +
                    Number(currentAnotherPosition.x).toFixed(3).toString() +
                    ' ' +
                    Number(currentAnotherPosition.y).toFixed(3).toString() +
                    ' ' +
                    Number(currentAnotherPosition.z).toFixed(3).toString() +
                    ' ' //+
                  // +propsElement.name
                );
                */
                //currentAnotherAxis.applyQuaternion(localQuaternion).normalize();
                //let currentAnotherQuaternion = new Quaternion();
                /* currentAnotherQuaternion
                  .setFromAxisAngle(currentAnotherAxis, differenceElement)
                  .normalize(); */
                //localQuaternion = currentAnotherQuaternion.clone();
                //currentAxis.applyQuaternion(localQuaternion);
                // const nextElement = this.findNextPart(propsElement);
                // const nextNode = nextElement
                //   ? this.findNodeFrom(nextElement)
                //   : null;
                /*console.log(
                  'Animating for',
                  propsElement,
                  differenceElement,
                  localQuaternion,
                  localPosition,
                  localTranslation,
                  //currentAnotherAxis,
                  //currentAnotherQuaternion,
                  currentAxis,
                  currentQuaternion,
                  currentPosition,
                  index,
                  
                  currentOriginalPosition
                );*/

                /* index >= 2 && false
                    ? localPreviousCUrrentPosition
                    :  */

                //if (nextNode) {
                this.animateKinematicChain(
                  //differenceElement,
                  propsElement,
                  //currentNode,
                  //nextNode,
                  //prevProps,
                  index,
                  parsedInfo,
                  localQuaternion.clone(),
                  /* index >= 2 && false
                      ? localPreviousStoredPosition.clone()
                      :  */
                  localPosition.clone(),
                  /* index >= 2 && false
                      ? localPreviousCUrrentPosition.clone()
                      :  */
                  //currentOriginalPosition.clone(),
                  shiftedPosition.clone()
                );
                // } else {
                //   console.log(
                //     'I Could not get next node',
                //     nextElement,
                //     currentNode,
                //     nextNode
                //   );
                // }

                /* console.log(index, differenceElement, this.partsMeshes[index + 1]);
            if (
              propsElement.actuator_motion_control.cylindrical_axis_of_rotation
            ) {
              const axis =
                propsElement.actuator_motion_control
                  .cylindrical_axis_of_rotation.axis;
              if (axis) {
                const axisVector = new Vector3(axis[0], axis[2], axis[1]);

                this.partsMeshes[index + 1].rotateOnWorldAxis(
                  axisVector,
                  differenceElement
                );
              }
            } */
              } else {
                console.log(index, propsElement, 'No difference found');
              }
            }
            if (
              currentNode &&
              propsElement &&
              propsElement.actuator_motion_control &&
              propsElement.actuator_motion_control.is_end_effector &&
              propsElement.actuator_motion_control.child_part_type ===
                'ACTUATOR'
            ) {
              if (this.props.itemProperties) {
                const itemProperties = this.props.itemProperties;
                console.log('Got itemproperties as', itemProperties);
                if (
                  itemProperties.actuator_motion_control &&
                  itemProperties.actuator_motion_control
                    .cylindrical_axis_of_rotation &&
                  itemProperties.actuator_motion_control
                    .cylindrical_axis_of_rotation.mountobb
                ) {
                  const mountSurface =
                    itemProperties.actuator_motion_control
                      .cylindrical_axis_of_rotation.mountobb;
                  let mountPosition = new Vector3(
                    mountSurface.cx,
                    mountSurface.cy,
                    mountSurface.cz
                  );
                  mountPosition.sub(localPosition);
                  mountPosition.applyQuaternion(localQuaternion);
                  //currentPosition.applyQuaternion(currentQuaternion);
                  mountPosition.add(localPosition);
                  //console.log('Mount Position', mountPosition);
                  if (this.props.setXYZEndEffectorPosition) {
                    this.props.setXYZEndEffectorPosition({
                      X: Number(mountPosition.x).toFixed(3),
                      Y: Number(mountPosition.y).toFixed(3),
                      Z: Number(mountPosition.z).toFixed(3),
                      Q: localQuaternion,
                      L: localPosition,
                      M: new Vector3(
                        mountSurface.cx,
                        mountSurface.cy,
                        mountSurface.cz
                      ) /* ,
                      QA: localQuaternionArray,
                      CQ: currentQuaternionArray,
                      LA: localPositionArray,
                      TA: localTranslationArray,
                      SA: localShiftedPositionArray,
                      IA: indexArray */
                    });
                  }
                  if (prevProps === null) {
                    this.createSphere(mountPosition, 0);
                  } else {
                    this.setSpherePosition(mountPosition, 0);
                  }
                }
              }
            }
          }
        }
      } else {
        // console.log(
        //   'Looks like both prev props and current props are same',
        //   prevProps,
        //   this.props
        // );
      }
    }
  };
  findKinematicDimension = () => {
    const state_gltfobj = this.this_state_gltf || this.props.gltfobj;
    const myStateTree = state_gltfobj
      ? state_gltfobj.tree
        ? state_gltfobj.tree
        : []
      : [];
    if (myStateTree.length > 0) {
      const kinematicDimension =
        myStateTree[0][gltf_Dict['kinematicdimension']];
      console.log('I got kinematic dimension as ', kinematicDimension);
      if (kinematicDimension) {
        return kinematicDimension;
      } else {
        console.log(
          'I could not get kinematic dimension',
          myStateTree[0],
          myStateTree
        );
        return [0, 0, 0, 0, 0, 0];
      }
    } else {
      console.log(
        'I could not get kinematic dimension since length 0',
        myStateTree
      );
      return [0, 0, 0, 0, 0, 0];
    }
  };
  getIndexedItemsFromParsedInfo = (parsedInfo) => {
    let IndexedKinematicItems = [];
    for (let index = 0; index < this.props.kinematicItemList.length; index++) {
      const sequencedElementIndex = this.getSequencedItemIndex(
        parsedInfo,
        index + 1,
        1
      );
      const [sequence, sequencedElement] = sequencedElementIndex;
      const propsElementIndex =
        sequence === -1 || sequencedElement === null
          ? index
          : this.getKinematicIndex(
              this.props.kinematicItemList,
              sequencedElement
            );
      const propsElement =
        propsElementIndex === -1
          ? this.props.kinematicItemList[index]
          : this.props.kinematicItemList[propsElementIndex];
      const currentNodeIndex = this.findNodeIndexFrom(propsElement);
      const currentNode =
        currentNodeIndex === -1 ? null : this.partsMeshes[currentNodeIndex];
      if (currentNode) {
        currentNode.kinematicNode = true;
      }
      const isActuator =
        currentNode &&
        propsElement &&
        propsElement.actuator_motion_control &&
        propsElement.actuator_motion_control.child_part_type === 'ACTUATOR';
      const currentAxis = isActuator
        ? propsElement.actuator_motion_control.cylindrical_axis_of_rotation
          ? propsElement.actuator_motion_control.cylindrical_axis_of_rotation
              .axis
            ? new Vector3(
                propsElement.actuator_motion_control.cylindrical_axis_of_rotation.axis[0],
                propsElement.actuator_motion_control.cylindrical_axis_of_rotation.axis[1],
                propsElement.actuator_motion_control.cylindrical_axis_of_rotation.axis[2]
              )
            : new Vector3()
          : new Vector3()
        : new Vector3();
      const currentPosition = isActuator
        ? propsElement.actuator_motion_control.cylindrical_axis_of_rotation
          ? propsElement.actuator_motion_control.cylindrical_axis_of_rotation
              .position
            ? new Vector3(
                propsElement.actuator_motion_control.cylindrical_axis_of_rotation.position[0],
                propsElement.actuator_motion_control.cylindrical_axis_of_rotation.position[1],
                propsElement.actuator_motion_control.cylindrical_axis_of_rotation.position[2]
              )
            : new Vector3()
          : new Vector3()
        : new Vector3();
      IndexedKinematicItems.push([
        sequence,
        sequencedElement,
        propsElementIndex,
        currentNodeIndex,
        isActuator && !propsElement.actuator_motion_control.is_end_effector,
        isActuator &&
          propsElement.actuator_motion_control.is_linear_or_rotational,
        isActuator && propsElement.actuator_motion_control.is_end_effector,
        currentAxis,
        currentPosition
      ]);
    }
    //console.log('Indexed Items', IndexedKinematicItems);
    return IndexedKinematicItems;
  };
  ApplyForwardKinematicMovement_WithoutIndex = (prevProps, parsedInfo) => {
    if (this.props.kinematicItemList && this.props.showKinematicSliderMove) {
      if (
        JSON.stringify(prevProps ? prevProps.kinematicItemList || [] : []) !==
          JSON.stringify(this.props.kinematicItemList || []) &&
        JSON.stringify(parsedInfo || []) !== JSON.stringify([])
      ) {
        if (
          this.partsMeshes &&
          this.partsMeshes.length > 0 &&
          this.props.kinematicItemList &&
          this.props.kinematicItemList.length > 0
        ) {
          const sameGLTF = prevProps
            ? prevProps.activeGLTFFile === this.props.activeGLTFFile
            : false;
          if (prevProps === null) {
            this.removeDrawnAxisLines();
            this.axisArray = [];
            this.removeSphere();
            this.removeDragger();
          }
          let localQuaternion = new Quaternion(0, 0, 0, 1);
          let localPosition = new Vector3(0, 0, 0);
          let localTranslation = new Vector3(0, 0, 0);
          let localShiftedPosition = new Vector3(0, 0, 0);
          let globalShiftedPosition = new Vector3(0, 0, 0);
          for (
            let index = 0;
            index < this.props.kinematicItemList.length;
            index++
          ) {
            const sequencedElement = this.getSequencedItem(
              parsedInfo,
              index + 1,
              1
            );

            const propsElement = sequencedElement
              ? this.getKinematicItem(
                  this.props.kinematicItemList,
                  sequencedElement
                )
              : this.props.kinematicItemList[index];

            const currentNode = this.findNodeFrom(propsElement);

            if (
              currentNode &&
              propsElement &&
              propsElement.actuator_motion_control &&
              !propsElement.actuator_motion_control.is_end_effector &&
              propsElement.actuator_motion_control.child_part_type ===
                'ACTUATOR'
            ) {
              if (prevProps === null) {
                const axisLine = this.drawAxisLineToKinematic(propsElement);
                if (currentNode) {
                  currentNode.axisLine = axisLine
                    ? axisLine.children
                      ? axisLine.children.length > 0
                        ? axisLine.children[0]
                        : null
                      : null
                    : null;
                  //this.AssignPositionToSingleNode(currentNode.axisLine, 0);
                } else {
                  console.log('Current node is null for', propsElement);
                }
              }

              const prevPropsElement = sameGLTF
                ? prevProps.kinematicItemList
                  ? prevProps.kinematicItemList[index].filePartName ===
                    propsElement.filePartName
                    ? prevProps.kinematicItemList[index]
                    : this.getPrevPropsItem(prevProps, propsElement)
                  : null
                : null;
              let differenceElement =
                prevPropsElement && propsElement
                  ? prevPropsElement.actuator_motion_control &&
                    propsElement.actuator_motion_control
                    ? propsElement.actuator_motion_control.chain_number -
                      prevPropsElement.actuator_motion_control.chain_number
                    : 0
                  : 0;
              if (!sameGLTF || !prevPropsElement) {
                differenceElement = propsElement
                  ? propsElement.actuator_motion_control
                    ? propsElement.actuator_motion_control.chain_number
                    : 0
                  : 0;
              }
              if (
                differenceElement ||
                propsElement.actuator_motion_control.chain_number !==
                  0 /* || prevProps === null */
              ) {
                let currentAxis = propsElement.actuator_motion_control
                  .cylindrical_axis_of_rotation
                  ? propsElement.actuator_motion_control
                      .cylindrical_axis_of_rotation.axis
                    ? new Vector3(
                        propsElement.actuator_motion_control.cylindrical_axis_of_rotation.axis[0],
                        propsElement.actuator_motion_control.cylindrical_axis_of_rotation.axis[1],
                        propsElement.actuator_motion_control.cylindrical_axis_of_rotation.axis[2]
                      )
                    : new Vector3()
                  : new Vector3();
                let currentPosition = propsElement.actuator_motion_control
                  .cylindrical_axis_of_rotation
                  ? propsElement.actuator_motion_control
                      .cylindrical_axis_of_rotation.position
                    ? new Vector3(
                        propsElement.actuator_motion_control.cylindrical_axis_of_rotation.position[0],
                        propsElement.actuator_motion_control.cylindrical_axis_of_rotation.position[1],
                        propsElement.actuator_motion_control.cylindrical_axis_of_rotation.position[2]
                      )
                    : new Vector3()
                  : new Vector3();

                let localCurrentQuaternion = localQuaternion.clone();
                let localCurrentTranslation = localTranslation.clone();
                let currentShiftedPosition = currentPosition.clone();
                currentShiftedPosition.sub(localPosition);
                currentShiftedPosition.applyQuaternion(localCurrentQuaternion);
                currentShiftedPosition.add(localShiftedPosition);
                let currentPositionAxis = currentAxis.clone();
                //currentPositionAxis.add(currentPosition);
                //currentPositionAxis.sub(localPosition);
                currentPositionAxis.applyQuaternion(localCurrentQuaternion);
                //currentPositionAxis.add(localShiftedPosition);
                //currentPositionAxis.sub(currentShiftedPosition);
                currentPositionAxis.normalize();

                const isLinear =
                  propsElement.actuator_motion_control.is_linear_or_rotational;
                let currentAxisQuaternion = new Quaternion();
                if (isLinear) {
                  // Since it is normalized, it will be always single unit.
                  // const currentLength = math.sqrt(
                  //   currentPositionAxis.x * currentPositionAxis.x +
                  //     currentPositionAxis.y * currentPositionAxis.y +
                  //     currentPositionAxis.z * currentPositionAxis.z
                  // );
                  // if (currentLength !== 0) {
                  localCurrentTranslation.add(
                    new Vector3(
                      currentPositionAxis.x *
                        propsElement.actuator_motion_control.chain_number /* /
                          currentLength */,
                      currentPositionAxis.y *
                        propsElement.actuator_motion_control.chain_number /* /
                          currentLength */,
                      currentPositionAxis.z *
                        propsElement.actuator_motion_control.chain_number /* /
                          currentLength */
                    )
                  );
                  // }
                } else {
                  currentAxisQuaternion
                    .setFromAxisAngle(
                      currentPositionAxis,
                      propsElement.actuator_motion_control.chain_number
                    )
                    .normalize();
                  localCurrentQuaternion
                    .premultiply(currentAxisQuaternion)
                    .normalize();
                }
                // console.log(
                //   'Previous Values',
                //   localPosition,
                //   localQuaternion,
                //   localShiftedPosition
                // );
                let shiftedPosition = currentPosition.clone();
                shiftedPosition.applyQuaternion(localQuaternion);
                shiftedPosition.add(globalShiftedPosition);
                let shiftingPosition = currentPosition.clone();
                shiftingPosition.applyQuaternion(localCurrentQuaternion);
                shiftedPosition.sub(shiftingPosition);
                shiftedPosition.sub(localTranslation);
                shiftedPosition.add(localCurrentTranslation);

                localPosition = currentPosition.clone();
                localQuaternion = localCurrentQuaternion.clone();
                localShiftedPosition = currentShiftedPosition.clone();
                localTranslation = localCurrentTranslation.clone();
                globalShiftedPosition = shiftedPosition.clone();
                // console.log(
                //   'Current Values',
                //   localPosition,
                //   localQuaternion,
                //   localShiftedPosition
                // );
                this.animateKinematicChain(
                  //differenceElement,
                  propsElement,
                  //currentNode,
                  //nextNode,
                  //prevProps,
                  index,
                  parsedInfo,
                  localQuaternion.clone(),
                  /* index >= 2 && false
                      ? localPreviousStoredPosition.clone()
                      :  */
                  localPosition.clone(),
                  /* index >= 2 && false
                      ? localPreviousCUrrentPosition.clone()
                      :  */
                  //currentOriginalPosition.clone(),
                  globalShiftedPosition.clone()
                );
              } else {
                console.log(index, propsElement, 'No difference found');
              }
            }
            if (
              currentNode &&
              propsElement &&
              propsElement.actuator_motion_control &&
              propsElement.actuator_motion_control.is_end_effector &&
              propsElement.actuator_motion_control.child_part_type ===
                'ACTUATOR'
            ) {
              if (this.props.itemProperties) {
                const itemProperties = this.props.itemProperties;
                console.log('Got itemproperties as', itemProperties);
                if (
                  itemProperties.actuator_motion_control &&
                  itemProperties.actuator_motion_control
                    .cylindrical_axis_of_rotation &&
                  itemProperties.actuator_motion_control
                    .cylindrical_axis_of_rotation.mountobb
                ) {
                  const mountSurface =
                    itemProperties.actuator_motion_control
                      .cylindrical_axis_of_rotation.mountobb;
                  let mountPosition = new Vector3(
                    mountSurface.cx,
                    mountSurface.cy,
                    mountSurface.cz
                  );
                  mountPosition.sub(localPosition);
                  mountPosition.applyQuaternion(localQuaternion);
                  mountPosition.add(localShiftedPosition);
                  if (this.props.setXYZEndEffectorPosition) {
                    this.props.setXYZEndEffectorPosition({
                      X: Number(mountPosition.x).toFixed(3),
                      Y: Number(mountPosition.y).toFixed(3),
                      Z: Number(mountPosition.z).toFixed(3),
                      Q: localQuaternion,
                      L: localPosition,
                      S: localShiftedPosition,
                      M: new Vector3(
                        mountSurface.cx,
                        mountSurface.cy,
                        mountSurface.cz
                      ) /* ,
                      QA: localQuaternionArray,
                      CQ: currentQuaternionArray,
                      LA: localPositionArray,
                      TA: localTranslationArray,
                      SA: localShiftedPositionArray,
                      IA: indexArray */
                    });
                  }
                  if (prevProps === null) {
                    this.createSphere(mountPosition, 0);
                    this.createDragger();
                  } else {
                    this.setSpherePosition(mountPosition, 0);
                  }
                }
              }
            }
          }
        }
      } else {
        // console.log(
        //   'Looks like both prev props and current props are same',
        //   prevProps,
        //   this.props
        // );
      }
    }
  };

  ApplyForwardKinematicMovement = (
    prevProps,
    parsedIndexInfo,
    kinematicDimension,
    beginDimension
  ) => {
    if (this.props.kinematicItemList && this.props.showKinematicSliderMove) {
      // console.log(
      //   'Reached here to apply forward kinematics',
      //   prevProps ? prevProps.kinematicItemList || [] : [],
      //   this.props.kinematicItemList,
      //   parsedIndexInfo
      // );
      // this.displayForDebug(
      //   prevProps ? prevProps.kinematicItemList || [] : [],
      //   'Recieved Values'
      // );
      if (
        (JSON.stringify(prevProps ? prevProps.kinematicItemList || [] : []) !==
          JSON.stringify(this.props.kinematicItemList || []) ||
          JSON.stringify(prevProps ? prevProps.xyzShiftPosition || [] : []) !==
            JSON.stringify(this.props.xyzShiftPosition || [])) &&
        JSON.stringify(parsedIndexInfo || []) !== JSON.stringify([])
      ) {
        if (
          this.partsMeshes &&
          this.partsMeshes.length > 0 &&
          this.props.kinematicItemList &&
          this.props.kinematicItemList.length > 0
        ) {
          const sameGLTF = prevProps
            ? prevProps.activeGLTFFile === this.props.activeGLTFFile
            : false;
          let beginPosition = new Vector3(
            kinematicDimension.X,
            kinematicDimension.Y,
            kinematicDimension.Z
          );
          let originBeginPosition = this.getVectorFromDimension(beginDimension);
          let originalXYZShiftablePosition = new Vector3(0, 0, 0);
          originalXYZShiftablePosition.subVectors(
            beginPosition,
            originBeginPosition
          );
          console.log(
            'begin from apply forward',
            beginPosition,
            'origin begin',
            originBeginPosition,
            'diff',
            originalXYZShiftablePosition
          );
          if (prevProps === null) {
            this.removeDrawnAxisLines();
            this.axisArray = [];
            this.removeSphere();
            this.removeDragger();
          }
          let localQuaternion = new Quaternion(0, 0, 0, 1);
          let localPosition = new Vector3(0, 0, 0);
          let localTranslation = new Vector3(0, 0, 0);
          let localShiftedPosition = new Vector3(0, 0, 0);
          let globalShiftedPosition = new Vector3(0, 0, 0);
          let localKinematicValues = [];
          localKinematicValues.push({
            A: 0,
            L: localPosition,
            Q: localQuaternion,
            S: localShiftedPosition,
            T: localTranslation,
            K: false
          });
          let beginOfActuator = -1;
          let endOfActuator = 0;
          for (
            let index = 0;
            index < this.props.kinematicItemList.length;
            index++
          ) {
            let [
              sequence,
              sequenceItem,
              propsElementIndex,
              currentNodeIndex,
              isActuatorNode,
              isLinearNode,
              isEndEffectorNode,
              currentAxisNode,
              currentPositionNode
            ] = parsedIndexInfo[index];
            let propsElement =
              this.props.kinematicItemList[
                propsElementIndex === -1 ? index : propsElementIndex
              ];
            let currentNode =
              this.partsMeshes[
                currentNodeIndex === -1 ? index : currentNodeIndex
              ];
            if (isActuatorNode) {
              if (beginOfActuator === -1) {
                beginOfActuator = index;
              }
              // if (prevProps === null) {
              //   const axisLine = this.drawAxisLineToKinematic(propsElement);
              //   if (currentNode) {
              //     currentNode.axisLine = axisLine
              //       ? axisLine.children
              //         ? axisLine.children.length > 0
              //           ? axisLine.children[0]
              //           : null
              //         : null
              //       : null;
              //     //this.AssignPositionToSingleNode(currentNode.axisLine, 0);
              //   } else {
              //     console.log('Current node is null for', propsElement);
              //   }
              // }

              // const prevPropsElement = sameGLTF
              //   ? prevProps.kinematicItemList
              //     ? prevProps.kinematicItemList[index].filePartName ===
              //       propsElement.filePartName
              //       ? prevProps.kinematicItemList[index]
              //       : this.getPrevPropsItem(prevProps, propsElement)
              //     : null
              //   : null;
              // let differenceElement =
              //   prevPropsElement && propsElement
              //     ? prevPropsElement.actuator_motion_control &&
              //       propsElement.actuator_motion_control
              //       ? propsElement.actuator_motion_control.chain_number -
              //         prevPropsElement.actuator_motion_control.chain_number
              //       : 0
              //     : 0;
              // if (!sameGLTF || !prevPropsElement) {
              //   differenceElement = propsElement
              //     ? propsElement.actuator_motion_control
              //       ? propsElement.actuator_motion_control.chain_number
              //       : 0
              //     : 0;
              // }
              // console.log('Got props element', propsElement);
              if (
                //differenceElement ||
                propsElement.actuator_motion_control.chain_number !==
                0 /* || prevProps === null */
              ) {
                const currentAxis = currentAxisNode;
                const currentPosition = currentPositionNode;

                let localCurrentQuaternion = localQuaternion.clone();
                let localCurrentTranslation = localTranslation.clone();
                let currentShiftedPosition = currentPosition.clone();
                currentShiftedPosition.sub(localPosition);
                currentShiftedPosition.applyQuaternion(localCurrentQuaternion);
                currentShiftedPosition.add(localShiftedPosition);
                let currentPositionAxis = currentAxis.clone();
                currentPositionAxis.applyQuaternion(localCurrentQuaternion);
                currentPositionAxis.normalize();

                const isLinear = isLinearNode;
                let currentAxisQuaternion = new Quaternion();
                if (isLinear) {
                  localCurrentTranslation.add(
                    new Vector3(
                      currentPositionAxis.x *
                        propsElement.actuator_motion_control.chain_number,
                      currentPositionAxis.y *
                        propsElement.actuator_motion_control.chain_number,
                      currentPositionAxis.z *
                        propsElement.actuator_motion_control.chain_number
                    )
                  );
                  // }
                } else {
                  currentAxisQuaternion
                    .setFromAxisAngle(
                      currentPositionAxis,
                      propsElement.actuator_motion_control.chain_number
                    )
                    .normalize();
                  localCurrentQuaternion
                    .premultiply(currentAxisQuaternion)
                    .normalize();
                  // console.log(
                  //   'Quaternions',
                  //   currentPositionAxis,
                  //   propsElement.actuator_motion_control.chain_number,
                  //   localCurrentQuaternion
                  // );
                }

                let shiftedPosition = currentPosition.clone();
                shiftedPosition.applyQuaternion(localQuaternion);
                shiftedPosition.add(globalShiftedPosition);
                let shiftingPosition = currentPosition.clone();
                shiftingPosition.applyQuaternion(localCurrentQuaternion);
                shiftedPosition.sub(shiftingPosition);
                shiftedPosition.sub(localTranslation);
                shiftedPosition.add(localCurrentTranslation);

                localPosition = currentPosition.clone();
                localQuaternion = localCurrentQuaternion.clone();
                localShiftedPosition = currentShiftedPosition.clone();
                localTranslation = localCurrentTranslation.clone();
                globalShiftedPosition = shiftedPosition.clone();

                this.animateKinematicChain(
                  index,
                  parsedIndexInfo,
                  localQuaternion,
                  localPosition,
                  globalShiftedPosition,
                  originalXYZShiftablePosition
                );
              } else {
                console.log(index, propsElement, 'No difference found');
              }
            }
            localKinematicValues.push({
              A: propsElement.actuator_motion_control
                ? propsElement.actuator_motion_control.chain_number
                : 0,
              L: localPosition,
              Q: localQuaternion,
              S: localShiftedPosition,
              T: localTranslation,
              K: isActuatorNode || isEndEffectorNode
            });
            // if (prevProps === null) {
            //   console.log(
            //     'What I Got',
            //     localKinematicValues,
            //     isActuatorNode,
            //     isEndEffectorNode
            //   );
            // }
            if (isEndEffectorNode) {
              // if (prevProps === null) {
              //   console.log(
              //     'What I Got for endeffector',
              //     localKinematicValues,
              //     isActuatorNode,
              //     isEndEffectorNode,
              //     this.props.itemProperties
              //   );
              // }
              endOfActuator = index;
              if (this.props.itemProperties) {
                const itemProperties = this.props.itemProperties;
                //console.log('Got itemproperties as', itemProperties);
                if (
                  itemProperties.actuator_motion_control &&
                  itemProperties.actuator_motion_control
                    .cylindrical_axis_of_rotation &&
                  itemProperties.actuator_motion_control
                    .cylindrical_axis_of_rotation.mountobb
                ) {
                  const mountSurface =
                    itemProperties.actuator_motion_control
                      .cylindrical_axis_of_rotation.mountobb;
                  let mountPosition = new Vector3(
                    mountSurface.cx,
                    mountSurface.cy,
                    mountSurface.cz
                  );
                  mountPosition.sub(localPosition);
                  mountPosition.applyQuaternion(localQuaternion);
                  mountPosition.add(localShiftedPosition);
                  mountPosition.add(localTranslation);
                  mountPosition.add(originalXYZShiftablePosition);
                  // console.log(
                  //   this.props.xyzEndEffectorPosition,
                  //   this.props.xyzControlPosition,
                  //   mountPosition,
                  //   localPosition,
                  //   localQuaternion
                  // );
                  if (this.props.setXYZEndEffectorPosition) {
                    this.props.setXYZEndEffectorPosition({
                      X: mountPosition.x,
                      Y: mountPosition.y,
                      Z: mountPosition.z,
                      Q: localQuaternion,
                      L: localPosition,
                      S: localShiftedPosition,
                      T: localTranslation,
                      M: new Vector3(
                        mountSurface.cx,
                        mountSurface.cy,
                        mountSurface.cz
                      ),
                      K: localKinematicValues,
                      B: beginOfActuator,
                      E: endOfActuator
                    });
                  }

                  if (prevProps === null) {
                    // console.log(
                    //   'Apply Initial Setting Sphere Position',
                    //   mountPosition
                    // );
                    this.createSphere(mountPosition, 1);
                    this.createSphere(beginPosition, 0);
                    this.createDragger();
                  } else {
                    //console.log('Apply Setting Sphere Position', mountPosition);
                    this.setSpherePosition(mountPosition, 1);
                    this.setSpherePosition(beginPosition, 0);
                    //console.log('Done Setting Sphere Position', mountPosition);
                  }
                  if (this.props.setXYZBeginPosition) {
                    this.props.setXYZBeginPosition({
                      X: beginPosition.x,
                      Y: beginPosition.y,
                      Z: beginPosition.z
                    });
                  }
                }
              }
            } else {
              // if (prevProps === null) {
              //   console.log(
              //     'What I Got for not endeffector',
              //     localKinematicValues,
              //     isActuatorNode,
              //     isEndEffectorNode
              //   );
              // }
            }
          }
        }
      } else {
        console.log(
          'Previous and Current are same',
          prevProps ? prevProps.kinematicItemList : '',
          this.props.kinematicItemList,
          'XYZShift Position',
          this.props.xyzShiftPosition,
          prevProps ? prevProps.xyzShiftPosition : '',
          'XYZBegin Position',
          this.props.xyzBeginPosition,
          prevProps ? prevProps.xyzBeginPosition : ''
        );
      }
    }
  };
  ApplyForwardKinematicMovementFromPoint = () => {
    const myKinematicItemList = this.animateResultKinematicList;
    const parsedIndexInfo = this.state.indexedKinematicParsedInfo;
    if (myKinematicItemList && this.props.showKinematicSliderMove) {
      if (JSON.stringify(parsedIndexInfo || []) !== JSON.stringify([])) {
        if (
          this.partsMeshes &&
          this.partsMeshes.length > 0 &&
          myKinematicItemList &&
          myKinematicItemList.length > 0
        ) {
          const originalXYZShiftablePosition =
            this.state_originalXYZShiftablePosition;

          //console.log('Setting', myKinematicItemList);

          let localQuaternion = new Quaternion(0, 0, 0, 1);
          let localPosition = new Vector3(0, 0, 0);
          let localTranslation = new Vector3(0, 0, 0);
          let localShiftedPosition = new Vector3(0, 0, 0);
          let globalShiftedPosition = new Vector3(0, 0, 0);

          for (let index = 0; index < myKinematicItemList.length; index++) {
            let [
              sequence,
              sequenceItem,
              propsElementIndex,
              currentNodeIndex,
              isActuatorNode,
              isLinearNode,
              isEndEffectorNode,
              currentAxisNode,
              currentPositionNode
            ] = parsedIndexInfo[index];
            let propsElement =
              myKinematicItemList[
                propsElementIndex === -1 ? index : propsElementIndex
              ];

            if (isActuatorNode) {
              if (
                //differenceElement ||
                propsElement.actuator_motion_control.chain_number !==
                0 /* || prevProps === null */
              ) {
                const currentAxis = currentAxisNode;
                const currentPosition = currentPositionNode;

                let localCurrentQuaternion = localQuaternion.clone();
                let localCurrentTranslation = localTranslation.clone();
                let currentShiftedPosition = currentPosition.clone();
                currentShiftedPosition.sub(localPosition);
                currentShiftedPosition.applyQuaternion(localCurrentQuaternion);
                currentShiftedPosition.add(localShiftedPosition);
                let currentPositionAxis = currentAxis.clone();
                currentPositionAxis.applyQuaternion(localCurrentQuaternion);
                currentPositionAxis.normalize();

                const isLinear = isLinearNode;
                let currentAxisQuaternion = new Quaternion();
                if (isLinear) {
                  localCurrentTranslation.add(
                    new Vector3(
                      currentPositionAxis.x *
                        propsElement.actuator_motion_control.chain_number,
                      currentPositionAxis.y *
                        propsElement.actuator_motion_control.chain_number,
                      currentPositionAxis.z *
                        propsElement.actuator_motion_control.chain_number
                    )
                  );
                  // }
                } else {
                  currentAxisQuaternion
                    .setFromAxisAngle(
                      currentPositionAxis,
                      propsElement.actuator_motion_control.chain_number
                    )
                    .normalize();
                  localCurrentQuaternion
                    .premultiply(currentAxisQuaternion)
                    .normalize();
                  // console.log(
                  //   'Quaternions',
                  //   currentPositionAxis,
                  //   propsElement.actuator_motion_control.chain_number,
                  //   localCurrentQuaternion
                  // );
                }

                let shiftedPosition = currentPosition.clone();
                shiftedPosition.applyQuaternion(localQuaternion);
                shiftedPosition.add(globalShiftedPosition);
                let shiftingPosition = currentPosition.clone();
                shiftingPosition.applyQuaternion(localCurrentQuaternion);
                shiftedPosition.sub(shiftingPosition);
                shiftedPosition.sub(localTranslation);
                shiftedPosition.add(localCurrentTranslation);

                localPosition = currentPosition.clone();
                localQuaternion = localCurrentQuaternion.clone();
                localShiftedPosition = currentShiftedPosition.clone();
                localTranslation = localCurrentTranslation.clone();
                globalShiftedPosition = shiftedPosition.clone();

                this.animateKinematicChain(
                  index,
                  parsedIndexInfo,
                  localQuaternion,
                  localPosition,
                  globalShiftedPosition,
                  originalXYZShiftablePosition
                );
              } else {
                console.log(index, propsElement, 'No difference found');
              }
            }

            if (isEndEffectorNode) {
              if (this.props.itemProperties) {
                const itemProperties = this.props.itemProperties;
                //console.log('Got itemproperties as', itemProperties);
                if (
                  itemProperties.actuator_motion_control &&
                  itemProperties.actuator_motion_control
                    .cylindrical_axis_of_rotation &&
                  itemProperties.actuator_motion_control
                    .cylindrical_axis_of_rotation.mountobb
                ) {
                  const mountSurface =
                    itemProperties.actuator_motion_control
                      .cylindrical_axis_of_rotation.mountobb;
                  let mountPosition = new Vector3(
                    mountSurface.cx,
                    mountSurface.cy,
                    mountSurface.cz
                  );
                  mountPosition.sub(localPosition);
                  mountPosition.applyQuaternion(localQuaternion);
                  mountPosition.add(localShiftedPosition);
                  mountPosition.add(localTranslation);
                  mountPosition.add(originalXYZShiftablePosition);
                  this.setSpherePosition(mountPosition, 1);
                }
              }
            } else {
            }
          }
        }
      } else {
      }
    }
  };
  ApplyShiftingKinematicMovement = (prevProps, parsedIndexInfo) => {
    if (this.props.kinematicItemList && this.props.showKinematicSliderMove) {
      // console.log(
      //   'Reached here to apply forward kinematics',
      //   prevProps ? prevProps.kinematicItemList || [] : [],
      //   this.props.kinematicItemList,
      //   parsedIndexInfo
      // );
      // this.displayForDebug(
      //   prevProps ? prevProps.kinematicItemList || [] : [],
      //   'Recieved Values'
      // );

      if (
        JSON.stringify(prevProps ? prevProps.xyzShiftPosition || [] : []) !==
          JSON.stringify(this.props.xyzShiftPosition || []) &&
        JSON.stringify(parsedIndexInfo || []) !== JSON.stringify([])
      ) {
        this.state_calculatedKinematicItemChainChanged = true;
        if (
          this.partsMeshes &&
          this.partsMeshes.length > 0 &&
          this.props.kinematicItemList &&
          this.props.kinematicItemList.length > 0
        ) {
          let beginPosition = new Vector3(
            this.props.xyzShiftPosition.X,
            this.props.xyzShiftPosition.Y,
            this.props.xyzShiftPosition.Z
          );
          let originBeginPosition = new Vector3(
            this.props.xyzBeginPosition.X,
            this.props.xyzBeginPosition.Y,
            this.props.xyzBeginPosition.Z
          );

          let originalXYZShiftablePosition = new Vector3(0, 0, 0);
          originalXYZShiftablePosition.subVectors(
            beginPosition,
            originBeginPosition
          );
          if (
            originalXYZShiftablePosition.x != 0 ||
            originalXYZShiftablePosition.y != 0 ||
            originalXYZShiftablePosition.z != 0
          ) {
            for (
              let index = 0;
              index < this.props.kinematicItemList.length;
              index++
            ) {
              let [
                sequence,
                sequenceItem,
                propsElementIndex,
                currentNodeIndex,
                isActuatorNode,
                isLinearNode,
                isEndEffectorNode,
                currentAxisNode,
                currentPositionNode
              ] = parsedIndexInfo[index];

              let currentNode =
                this.partsMeshes[
                  currentNodeIndex === -1 ? index : currentNodeIndex
                ];
              console.log(
                'index',
                index,
                parsedIndexInfo[index],
                this.partsMeshes.length,
                currentNodeIndex
              );
              this.shiftPositionToNode(
                currentNode,
                originalXYZShiftablePosition
              );
            }
            if (this.props.setXYZBeginPosition) {
              this.props.setXYZBeginPosition({
                X: beginPosition.x,
                Y: beginPosition.y,
                Z: beginPosition.z
              });
            }

            this.setSpherePosition(beginPosition, 0);
          }
        }
      } else {
        console.log(
          'Previous and Current are same',
          prevProps ? prevProps.kinematicItemList : '',
          this.props.kinematicItemList
        );
      }
    }
  };
  getVectorFromDimension = (dimension) => {
    if (dimension && dimension.length >= 3) {
      return new Vector3(dimension[0], dimension[1], dimension[2]);
    } else {
      return new Vector3(0, 0, 0);
    }
  };
  AssignPositionToSingleNode = (element, byFactor, dimension) => {
    if (element.geometry) {
      element.geometry.computeBoundingBox();
      var centroid = new Vector3();
      centroid.addVectors(
        element.geometry.boundingBox.min,
        element.geometry.boundingBox.max
      );

      centroid.multiplyScalar(byFactor * 0.5);
      //centroid = element.geometry.boundingBox.min;
      element.geometry.applyMatrix(
        new Matrix4().makeTranslation(-centroid.x, -centroid.y, -centroid.z)
      );
      //element.position.copy(centroid);
      element.position.set(centroid.x, centroid.y, centroid.z);
      element.centroid = centroid.clone();
      element.centre = new Vector3(centroid.x, centroid.y, centroid.z);
      element.updateMatrix();
      element.updateMatrixWorld();
      element.localPosition = new Vector3(0, 0, 0);
      element.localQuaternion = new Quaternion(0, 0, 0, 1);
      // element.localArrays = [];
      // element.localArrays.push(element.centre.clone());
      element.shiftingPosition = new Vector3(0, 0, 0);

      element.basePosition = this.getVectorFromDimension(dimension);
      console.log(
        'Element base position from assign position to single node',
        element.basePosition
      );
      //const position = element.geometry.attributes.position;
      //console.log('Got positiion in 3js', position, position.applyMatrix4);
      //console.log('element', element, element.geometry);
    }
  };
  createDragger = () => {
    this.mouseDragger = new DraggerControl(
      [...this.sphereNode[0].children, ...this.sphereNode[1].children],
      this.activeCamera,
      this.renderer.domElement
    );
    this.mouseDragger.addEventListener(
      'dragstart',
      this.dragStart.bind(this),
      false
    );
    this.mouseDragger.addEventListener(
      'drag',
      this.dragFunction.bind(this),
      false
    );
    this.mouseDragger.addEventListener(
      'dragend',
      this.dragEnd.bind(this),
      false
    );
  };
  removeDragger = () => {
    if (this.mouseDragger) {
      this.mouseDragger.removeEventListener('dragend', this.dragEnd);
      this.mouseDragger.removeEventListener('drag', this.dragFunction);
      this.mouseDragger.removeEventListener('dragstart', this.dragStart);
      this.mouseDragger.dispose();
      this.mouseDragger = null;
    }
  };
  createSphere = (showPosition, endOrBegin) => {
    if (this.scene) {
      this.sphereNode[endOrBegin] = new Group(); //new Object3D();
      this.sphereNode[endOrBegin].name = endOrBegin
        ? 'EndEffectorPosition'
        : 'BeginPosition';
      this.dotGeometry[endOrBegin] = new SphereBufferGeometry(0.01, 8, 8);
      var material = new MeshBasicMaterial({
        color: endOrBegin ? 0xffdd00 : 0xdd00ff
      });
      this.sphere[endOrBegin] = new Mesh(
        this.dotGeometry[endOrBegin],
        material
      );
      this.sphere[endOrBegin].name = endOrBegin
        ? 'ENDEFFECTORSphere'
        : 'BEGINPositionShpere';
      this.sphere[endOrBegin].endOrBegin = endOrBegin;
      this.sphere[endOrBegin].type = 'Sphere';
      this.sphereNode[endOrBegin].add(this.sphere[endOrBegin]);
      this.setSpherePosition(showPosition, endOrBegin);
      this.sphereNode[endOrBegin].position.x += this.shiftposition.x;
      this.sphereNode[endOrBegin].position.y += this.shiftposition.y;
      this.sphereNode[endOrBegin].position.z += this.shiftposition.z;
      this.sphereNode[endOrBegin].renderOrder = 60;
      this.sphere[endOrBegin].renderOrder = 60;
      this.scene.add(this.sphereNode[endOrBegin]);
      console.log('Sphere', showPosition, this.sphereNode[endOrBegin]);
      this.raycastObjects = [
        ...this.raycastObjects,
        ...this.rayCastObjectFilters(this.sphereNode[endOrBegin].children)
      ];
    }
  };
  removeSphere = () => {
    for (let endOrBegin = 0; endOrBegin < 2; endOrBegin++) {
      if (this.scene && this.sphereNode[endOrBegin]) {
        this.scene.remove(this.sphereNode[endOrBegin]);
        this.dotGeometry[endOrBegin].dispose();
      }
      this.sphereNode[endOrBegin] = null;
    }
  };
  setSpherePosition = (localPosition, endOrBegin) => {
    if (this.sphereNode[endOrBegin]) {
      // this.dotGeometry.setAttribute(
      //   'position',
      //   new Float32BufferAttribute(
      //     [
      //       localPosition.x * 0.001,
      //       localPosition.z * 0.001,
      //       -localPosition.y * 0.001
      //     ],
      //     3
      //   )
      // );
      this.sphere[endOrBegin].position.x = localPosition.x * 0.001;
      this.sphere[endOrBegin].position.y = localPosition.z * 0.001;
      this.sphere[endOrBegin].position.z = -localPosition.y * 0.001;
      this.sphere[endOrBegin].updateMatrix();
      this.sphere[endOrBegin].updateMatrixWorld(true);
    }
  };
  getSpherePosition = (endOrBegin) => {
    if (this.sphereNode[endOrBegin]) {
      // const localPosition = this.dotGeometry.getAttribute('position');
      // return new Vector3(
      //   localPosition[0] / 0.001,
      //   -localPosition[2] / 0.001,
      //   localPosition[1] / 0.001
      // );
      return new Vector3(
        this.sphere[endOrBegin].position.x / 0.001,
        -this.sphere[endOrBegin].position.z / 0.001,
        this.sphere[endOrBegin].position.y / 0.001
      );
    }
    return new Vector3();
  };

  dragStart = (data) => {
    this.controls.enabled = false;
  };
  dragEnd = (data) => {
    this.controls.enabled = true;
  };
  dragFunction = (data) => {
    const { target, object } = data;
    console.log('Got positiion as', object.position, target, data);
    if (object.endOrBegin === 1) {
      if (this.props.setXYZControlPosition) {
        this.props.setXYZControlPosition({
          X: object.position.x / 0.001,
          Y: -object.position.z / 0.001,
          Z: object.position.y / 0.001
        });
      }
    } else {
      if (this.props.setXYZShiftPosition) {
        this.props.setXYZShiftPosition({
          X: object.position.x / 0.001,
          Y: -object.position.z / 0.001,
          Z: object.position.y / 0.001
        });
      }
      this.state_calculatedKinematicItemChainChanged = true;
    }
  };

  removeDrawnAxisLines() {
    if (this.axisArray) {
      for (let index = 0; index < this.axisArray.length; index++) {
        this.removeFromScreenObjects(this.axisArray[index]);
      }
      this.axisArray = [];
    }
  }

  changeMaterialStats(
    material,
    mySide,
    myOpaque,
    myWiremesh,
    myCastShadow,
    myTransparancy
  ) {
    material.wireframe = myWiremesh;
    material.castShadow = myCastShadow;
    material.depthTest = true;
    material.transparent = myTransparancy !== 0.0;
    material.opaque = 1.0 - myTransparancy;
    material.opacity = 1.0 - myTransparancy;
    material.depthWrite =
      myOpaque === 'True'
        ? true
        : myOpaque === 'False'
        ? false
        : !material.transparent;
    material.side =
      mySide === 'Front'
        ? FrontSide
        : mySide === 'Back'
        ? BackSide
        : DoubleSide;

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
      if (myelement === 'F') {
        prefix = 'FACE';
      } else if (myelement === 'E') {
        prefix = 'EDGE';
      } else if (myelement === 'V') {
        prefix = 'VERTEX';
      } else if (myelement === 'P') {
        prefix = 'PART';
      } else if (
        myelement === 'f' ||
        myelement === 'e' ||
        myelement === 'v' ||
        myelement === ' '
      ) {
        prefix = 'ASSEMBLY';
      } else {
        prefix = 'ASSEMBLY';
      }
    } else if (myName) {
      prefix = myName.slice(0, 4);
      if (prefix !== 'FACE' && prefix !== 'EDGE' && prefix !== 'PART') {
        prefix = myName.slice(0, 6);
        if (prefix !== 'VERTEX') {
          prefix = 'ASSEMBLY';
        }
      }
    }
    return prefix;
  };

  getSubDepthPart = (item) => {
    const prefix = this.getPrefixItem(item);

    if (prefix !== 'ASSEMBLY') {
      return item;
    }
    const state_gltfobj = this.this_state_gltf || this.props.gltfobj;
    const myStateTree = state_gltfobj
      ? state_gltfobj.tree
        ? state_gltfobj.tree
        : []
      : [];
    const myID = item[gltf_Dict['id']];
    for (var i = 0; i < myStateTree.length; i++) {
      if (myStateTree[i][gltf_Dict['parentId']] === myID) {
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
    const myStateTree = state_gltfobj
      ? state_gltfobj.tree
        ? state_gltfobj.tree
        : []
      : [];
    if (
      this.selectedoption !== SELECTASSEMBLY ||
      this.props.splitmethod !== SELECTDISECTPARTS
    ) {
      for (var i = 0; i < myStateTree.length; i++) {
        if (myStateTree[i][gltf_Dict['name']] === myName) {
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
    //   if (myStateTree[i][gltf_Dict['name']] === name) {
    //     myParentID = myStateTree[i][gltf_Dict['parentId']];
    //     myParentTree = myStateTree[i];
    //     break;
    //   }
    // }
    // if (myParentID === 1) {
    //   //console.log(myParentTree);
    //   return this.getNameWithFeatures(myParentTree);
    // }
    // if (myParentID !== -1) {
    //   for (var i = 0; i < myStateTree.length; i++) {
    //     if (myStateTree[i][gltf_Dict['id']] === myParentID) {
    //       //console.log(myStateTree[i]);
    //       return this.getNameWithFeatures(myStateTree[i]);
    //     }
    //   }
    // }

    for (var i = 0; i < myStateTree.length; i++) {
      if (myStateTree[i][gltf_Dict['name']] === myName) {
        //console.log(myStateTree[i]);
        return this.getNameWithFeatures(myStateTree[i]);
      }
    }
    return myName;
  };

  getNameID = (name) => {
    if (
      this.selectedoption !== SELECTASSEMBLY ||
      this.props.splitmethod !== SELECTDISECTPARTS
    ) {
      return name;
    }
    //const myStateTree = state.gltfobj.tree || this.props.gltfobj.tree;
    const state_gltfobj = this.this_state_gltf || this.props.gltfobj;

    const myStateTree = state_gltfobj
      ? state_gltfobj.tree
        ? state_gltfobj.tree
        : []
      : [];
    var myParentID = -1;
    for (var i = 0; i < myStateTree.length; i++) {
      if (myStateTree[i][gltf_Dict['name']] === name) {
        myParentID = myStateTree[i][gltf_Dict['parentId']];
        break;
      }
    }
    var myParentName = '';
    if (myParentID !== -1) {
      for (var i = 0; i < myStateTree.length; i++) {
        if (myStateTree[i][gltf_Dict['id']] === myParentID) {
          myParentName = myStateTree[i][gltf_Dict['name']];
          break;
        }
      }
    }
    if (myParentName !== '') {
      return myParentName;
    }
    return name;
  };

  /* arrayRemove = (arr, value) => {

        return arr.filter(function (ele) {
            return ele.name !== value;
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
          if (elementdata.name === this.state_selectedObjects[i].name) {
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
            if(!progressRes.data || progressRes.data.begin!==progressRes.data.end) {
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

      let fetchStatus = () =>
        getAFileFromStore(
          progressFile,
          'progress',
          false,
          this.props.showKinematicSliderMove === true
        );
      let validateStatus = (result) => {
        //console.log(result.data,result.data.percent,result.data.percent!==100);
        return (
          !result ||
          !result.data ||
          !result.data.begin ||
          result.data.begin !== result.data.end ||
          JSON.stringify(result.data) === JSON.stringify({})
        );
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
        progressRes.data.begin === progressRes.data.end
      ) {
        this.this_progress_data = progressRes.data;
        //this.onCloseProgress("Loading Edges"+progressFile,"success","Loaded succesfully");
      } else {
        //this.onCloseProgress("Loading Edges"+progressFile,"error","not loaded properly");
      }
    }
    const data = this.this_progress_data;
    if (!data || data.begin !== data.end) {
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

      const updateSelectionFromGdtTable = async () => {
        if (
          gdttableEdges &&
          gdttableEdges.selectedObjects &&
          Array.isArray(gdttableEdges.selectedObjects)
        ) {
          //console.log("Inside load edges gdts",this.partsMeshes,gdttableEdges);
          let event = {};
          event['ctrlKey'] = false;
          gdttableEdges.selectedObjects.forEach(async (element) => {
            console.log('Setting inside the load all edges', element, event);
            element.selectedshell = true;
            await this.doOneSelection(element, event, false);
            //console.log(this.scene, this.partsMeshes, this.raycastObjects);
            //this.render();
          });
          if (gdttableEdges.selectedObjects.length === 0) {
            await this.changeStateOfSelection(null, event, false);
          }
        } else {
          //console.log("Inside load edges s",this.partsMeshes);
        }
      };
      const onload = async (gltf, url) => {
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
          // console.log(
          //   'PartsMeshes',
          //   partsMeshes,
          //   this.this_state_gltf.tree,
          //   this.partsMeshes
          // );
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
            if (gdttableEdges.edges.length === 0) {
              this.changeStateOfSelection(null, event, false);
            }
          } else {
            //console.log("Inside load edges s",this.partsMeshes);
          } */
          await updateSelectionFromGdtTable();
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
      if (allEdges === 0 && data.children) {
        myParentDic = data.children;
      }
      if (allEdges === 0 && data.files) {
        myParentDic = data.files;
      }
      const additionalExtension =
        this.props.showKinematicSliderMove === true ? 'P' : '';
      console.log('ParentDict', myParentDic, Object.entries(myParentDic), data);
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
            if (element === 'f' && mynode) {
              mynode.facesLoaded = true;
            } else if (element === 'e' && mynode) {
              mynode.edgesLoaded = true;
            } else if (element === 'v' && mynode) {
              mynode.verticesLoaded = true;
            }
            element = '-' + element;
          }

          /* if(howManyFiles===0) {
                        howManyFiles=1;
                    } */
          let fileStore =
            progressFile +
            additionalExtension +
            '-' +
            myParentID.toString() +
            element +
            '3';
          let gltfStore =
            progressGLTF +
            additionalExtension +
            '-' +
            myParentID.toString() +
            element +
            '3';
          //console.log("For Loop",fileStore,howManyFiles);
          if (howManyFiles > 0 && indexFiles > 0) {
            parentLineNodes = new Group(); //new Object3D();
            parentLineNodes.linetype = indexFiles;
          }
          for (let index = 0; index < howManyFiles; index++) {
            if (index > 0) {
              if (indexFiles === 0) {
                //await waitFunction(1000);
              }
              fileStore =
                progressFile +
                additionalExtension +
                '-' +
                myParentID.toString() +
                element +
                index.toString() +
                '3';
              gltfStore =
                progressGLTF +
                additionalExtension +
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
              let myStateTree = state_gltfobj
                ? state_gltfobj.tree
                  ? state_gltfobj.tree
                  : []
                : [];
              if (firstTime && addTree) {
                console.log(myStateTree, state_gltfobj);
                myStateTree.length = state_gltfobj
                  ? state_gltfobj.treeLength
                  : 0;
                addTree = false;
              }
              myStateTree = [...myStateTree, ...treeRes.data];
              //var gltfobj = { ...state.gltfobj } || { ...this.props.gltfobj }
              var gltfobj = { ...state_gltfobj };
              gltfobj.tree = myStateTree;
              //this.changeState = true;
              //this.setState({gltfobj:gltfobj});
              this.this_state_gltf = { ...gltfobj };
              /* console.log(
                'About to set upload edges',
                state_gltfobj,
                this.this_state_gltf,
                this.props.gltfobj,
                gltfobj
              ); */
              try {
                if (this.props.setStateOfgltf) {
                  this.props.setStateOfgltf(gltfobj);
                }
              } catch (error) {
                console.log('Error while setting gltf obj', error);
              }
              // console.log(
              //   'Got tree while loading edges',
              //   treeRes,
              //   gltfobj.tree.length
              // );
              if (indexFiles >= 1) {
                this.onInitProgress(fileStore + '.tree');
                treeRes.data.forEach((element) => {
                  let points = [];
                  let curveCode = 'L';
                  let elementNodeName = elementCopy(element[gltf_Dict['name']]);
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
                    //console.log('From Entitites', thisentity);

                    curveCode = thisentity[gltf_Dict['code']];
                    if (
                      curveCode === 'C' ||
                      curveCode === 'E' ||
                      curveCode === 'H' ||
                      curveCode === 'P'
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
                        curveCode === 'C' || curveCode === 'P'
                          ? major
                          : myBase64Floats[12];

                      // console.log(
                      //   'Parameters',
                      //   XDir,
                      //   YDir,
                      //   Center,
                      //   major,
                      //   minor,
                      //   firstU,
                      //   lastU
                      // );
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
                          curveCode === 'P'
                            ? 0
                            : major *
                              (curveCode === 'H'
                                ? Math.cosh(tindex)
                                : Math.cos(tindex));
                        let A2 =
                          curveCode === 'P'
                            ? 0
                            : minor *
                              (curveCode === 'H'
                                ? Math.sinh(tindex)
                                : Math.sin(tindex));
                        if (curveCode === 'P') {
                          const focal = major;
                          if (focal === 0) {
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
                        //console.log('Got point as', A1, A2, thisPoint);
                      }
                    } else {
                      if (curveCode === 'B' || curveCode === 'I') {
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
                            if (curveCode === 'I') {
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

                            if (curveCode === 'I') {
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
                          if (curveCode === 'I') {
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
                          if (curveCode === 'I') {
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
                          if (curveCode === 'I') {
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
                          // console.log(
                          //   'NURBSCurve',
                          //   degree,
                          //   knotswithmultiples,
                          //   poles,
                          //   weights,
                          //   start_index,
                          //   end_index
                          // );
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
                    name: elementNodeName
                  });
                  geometry.name = elementNodeName;
                  //geometry.setPositions(myBase64Points);
                  //console.log('Got after reading points are', points);
                  geometry.setFromPoints(points);

                  /*const geometry = new LineGeometry();
                    geometry.setPositions(positions);
                    geometry.setColors(colors);*/
                  //let geometry = this.extrudePath(extrudepoints,0.1);

                  //geometry.setAttribute( 'position', new Float32BufferAttribute( xyzpoints, 3 ) );

                  //let geometry = new BufferGeometry({name:element[gltf_Dict["name"]]}).setFromPoints( points );
                  //geometry.name=element[gltf_Dict["name"]];
                  if (indexFiles === 1) {
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
                    ourMesh.name = elementNodeName;
                    ourMesh.renderOrder += 20;
                    ourMesh.curveCode = curveCode;
                    ourMesh.curvePoints = points;
                    parentLineNodes.add(ourMesh);
                  } else {
                    let material = new PointsMaterial({
                      color: this.props.edgecolor
                        ? this.props.edgecolor
                        : DEFAULTEDGECOLOR,
                      name: elementNodeName,
                      size: 10
                    });
                    let point = new Points(geometry, material);
                    point.name = elementNodeName;
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
            console.log(parentLineNodes);
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
              console.log('After adding edges', this.partsMeshes);
              this.raycastObjects = [
                ...this.raycastObjects,
                ...this.rayCastObjectFilters(parentLineNodes.children)
              ];
              console.log(
                'After adding edges, the raycast objects',
                this.raycastObjects
              );
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
    const onload = async (gltf, url) => {
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
          gdttableEdges.selectedObjects.forEach(async (element) => {
            //console.log("Setting inside the load all edges",element,event);
            element.selectedshell = true;
            await this.doOneSelection(element, event, false);
          });
          if (gdttableEdges.edges.length === 0) {
            await this.changeStateOfSelection(null, event, false);
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
          if (!data || data.begin !== data.end) {
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
            if (allEdges === 0 && data.children) {
              myParentDic = data.children;
            }
            if (allEdges === 0 && data.files) {
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
                  if (element === 'f' && mynode) {
                    mynode.facesLoaded = true;
                  } else if (element === 'e' && mynode) {
                    mynode.edgesLoaded = true;
                  } else if (element === 'v' && mynode) {
                    mynode.verticesLoaded = true;
                  }
                  element = '-' + element;
                }

                /* if(howManyFiles===0) {
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
                      var myStateTree = state_gltfobj
                        ? state_gltfobj.tree
                          ? state_gltfobj.tree
                          : []
                        : [];
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
                                            if(gdttableEdges.edges.length===0){
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
        if (allEdges === 0 && data.children) {
          myParentDic = data.children;
        }
        if (allEdges === 0 && data.files) {
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
              if (element === 'f' && mynode) {
                mynode.facesLoaded = true;
              } else if (element === 'e' && mynode) {
                mynode.edgesLoaded = true;
              } else if (element === 'v' && mynode) {
                mynode.verticesLoaded = true;
              }
              element = '-' + element;
            }

            /* if(howManyFiles===0) {
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
                  var myStateTree = state_gltfobj
                    ? state_gltfobj.tree
                      ? state_gltfobj.tree
                      : []
                    : [];
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
                                        if(gdttableEdges.edges.length===0){
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
            if(!data || data.begin!==data.end) {
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
    if (value === 'Assemblies') return SELECTASSEMBLY;
    if (value === 'Parts') return SELECTSOLID;
    if (value === 'Edges') return SELECTEDGE;
    if (value === 'Specify Assembly Mates and GD&T') return SELECTFEATURE;
    if (value === 'Faces') return SELECTFACE;
    if (value === 'Corners') return SELECTCORNER;
    if (value === 'Circular') return SELECTCIRCULAR;
    if (value === 'Linear') return SELECTLINEAR;
    return SELECTFEATURE;
  };
  getValueOptionFromString = (value) => {
    if (value === SELECTASSEMBLY) return 'Assemblies';
    if (value === SELECTSOLID) return 'Parts';
    if (value === SELECTEDGE) return 'Edges';
    if (value === SELECTFEATURE) return 'Specify Assembly Mates and GD&T';
    if (value === SELECTFACE) return 'Faces';
    if (value === SELECTCORNER) return 'Corners';
    if (value === SELECTCIRCULAR) return 'Circular';
    if (value === SELECTLINEAR) return 'Linear';
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
            if (values.view !== this.state.view) {
              this.setStateWithoutError({ view: values.view });
              this.addCameraAndControls(values.view);
            }
            break;
          case 1:
            if (values.side !== this.state.side) {
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
                this.state.grid,
                this.state.transparency
              );
            }
            break;
          case 2:
            if (values.opaque !== this.state.opaque) {
              this.setStateWithoutError({ opaque: values.opaque });
              toSet = true;
            }
            if (values.transparency !== this.state.transparency) {
              this.setStateWithoutError({ transparency: values.transparency });
              toSet = true;
            }
            if (toSet) {
              this.updateDisplay(
                this.state.side,
                values.opaque,
                this.state.wiremesh,
                this.state.castshadow,
                this.state.skeleton,
                this.state.grid,
                values.transparency
              );
            }
            break;
          case 3:
            //console.log(values, this.state);
            if (values.wiremesh !== this.state.wiremesh) {
              this.setStateWithoutError({ wiremesh: values.wiremesh });
              toSet = true;
            }
            if (values.castshadow !== this.state.castshadow) {
              this.setStateWithoutError({ castshadow: values.castshadow });
              toSet = true;
            }
            if (values.skeleton !== this.state.skeleton) {
              this.setStateWithoutError({ skeleton: values.skeleton });
              toSet = true;
            }
            if (values.grid !== this.state.grid) {
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
                values.grid,
                this.state.transparency
              );
            }
            break;
          case 4:
            if (values.showedges !== this.state.showedges) {
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
            if (values.linewidth !== this.state.edgelinewidth) {
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
            if (values.showchosenaxis !== this.state.showchosenaxis) {
              this.setStateWithoutError({
                showchosenaxis: values.showchosenaxis
              });
              this.makeVisibilityToAxisArrays(values.showchosenaxis);
            }
            break;
          case 5:
            if (values.autoRotate !== this.controls.autoRotate) {
              //console.log(values.autoRotate);
              this.controls.autoRotate = values.autoRotate;
            }
            if (
              values.screenSpacePanning !== this.controls.screenSpacePanning
            ) {
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
            if (values.zoomSpeed !== this.state.zoomSpeed) {
              this.setStateWithoutError({ zoomSpeed: values.zoomSpeed });
              if (this.controls) {
                this.controls.zoomSpeed = values.zoomSpeed;
                this.controls.emSpeed = Math.pow(
                  this.controls.zoomSpeed,
                  1.0 / this.OrthographicInitialzoom
                );
              }
            }
            if (values.panSpeed !== this.state.panSpeed) {
              this.setStateWithoutError({ panSpeed: values.panSpeed });
              if (this.controls) {
                this.controls.panSpeed = values.panSpeed;
              }
            }
            if (values.rotateSpeed !== this.state.rotateSpeed) {
              this.setStateWithoutError({ rotateSpeed: values.rotateSpeed });
              if (this.controls) {
                this.controls.rotateSpeed = values.rotateSpeed;
              }
            }
            break;
          case 1:
            if (values.zoomToCursor !== this.state.zoomToCursor) {
              this.setStateWithoutError({ zoomToCursor: values.zoomToCursor });
              if (this.controls) {
                this.controls.noZoom = values.zoomToCursor;
              }
            }
            if (values.maxZoomIn !== this.state.maxZoomIn) {
              this.setStateWithoutError({ maxZoomIn: values.maxZoomIn });
            }
            if (values.maxZoomOut !== this.state.maxZoomOut) {
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
            if (values.textureEncoding !== this.state.textureEncoding) {
              this.setStateWithoutError({
                textureEncoding: values.textureEncoding
              });
              this.updateTextureEncoding(values.textureEncoding);
            }
            break;
          case 1:
            if (values.outputEncoding !== this.state.outputEncoding) {
              this.setStateWithoutError({
                outputEncoding: values.outputEncoding
              });
              if (this.renderer) {
                this.renderer.outputEncoding =
                  values.outputEncoding === 'sRGB'
                    ? sRGBEncoding
                    : LinearEncoding;
              }
              this.updateTextureEncoding(values.outputEncoding);
            }
            break;
          case 2:
            if (values.exposure !== this.state.exposure) {
              this.setStateWithoutError({ exposure: values.exposure });
              toSet = true;
            }
            if (values.addLights !== this.state.addLights) {
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
            if (values.ambientIntensity !== this.state.ambientIntensity) {
              this.setStateWithoutError({
                ambientIntensity: values.ambientIntensity
              });
              toSet = true;
            }
            if (values.ambientColor !== this.state.ambientColor) {
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
            if (values.directIntensity !== this.state.directIntensity) {
              this.setStateWithoutError({
                directIntensity: values.directIntensity
              });
              toSet = true;
            }
            if (values.directColor !== this.state.directColor) {
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
        if (mySelectedoption !== this.selectedoption) {
          if (values.ctrlKey !== this.props.ctrlKey) {
            try {
              if (this.props.setCtrlKey) {
                this.props.setCtrlKey(values.ctrlKey);
              }
            } catch (error) {
              console.log('Eror while setting ctrlkey', error);
            }
          }
          if (
            this.selectedoption === SELECTMEASURE ||
            mySelectedoption === SELECTMEASURE
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
            mySelectedoption === SELECTASSEMBLY ||
            mySelectedoption === SELECTSOLID
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
        if (values.animationSpeed !== this.state.animationSpeed) {
          this.setStateWithoutError({ animationSpeed: values.animationSpeed });
          this.updateAimationSpeed(values.animationSpeed);
        }

        if (values.pauseAnimation !== this.state.pauseAnimation) {
          this.setStateWithoutError({ pauseAnimation: values.pauseAnimation });
          this.updatePauseAnimation(values.pauseAnimation);
        }

        if (values.animationTime !== this.state.animationTime) {
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
          (this.props.fileGDT && index === 3) ||
          (this.props.fileAnimation && index === 4)) &&
        this.displayButton(index, myIndex, data)
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

  changeSelectedOption = async (option) => {
    if (this.selectedoption === SELECTMEASURE || option === SELECTMEASURE) {
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
      (option === SELECTSOLID && this.selectedoption !== SELECTASSEMBLY) ||
      option === SELECTASSEMBLY
    ) {
      //console.log("Got Here", this.props.selectedoption);
      await this.selectAllSelectedSolids();
    }
    if (this.selectedoption !== option) {
      if (
        option === SELECTLOADEDGES ||
        (option === SELECTEDGE && this.props.ctrlKey)
      ) {
        this.loadAllEdges(0);
      }
      this.changeVisibility(option);
      this.selectedoption = option;
    }
  };

  /* arrayFindIndex = (arr, value) => {

        return arr.findIndex(function (ele) {            
          return ele === value;
        });
    }
    
    arrayRemove = (arr, value) => {
    
        return arr.filter(function (ele) {
         
          return ele !== value;
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

    if (openFiles.length === 0) {
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

  displayButton(index, myIndex, data) {
    const selected = index === myIndex && this.openEl[index];
    return (
      <Button
        sx={{
          color: this.getThemeTextColor(selected),
          background: this.getThemeBackgroundColor(selected),
          backgroundColor: this.getThemeBackgroundColor(selected),
          '&:hover': {
            color: this.getHoverBackgroundColor(selected),
            backgroundColor: this.getHoverBackgroundColor(selected),
            background: this.getHoverTextColor(selected)
          }
        }}
        aria-describedby={this.idEl[index]}
        id={'pop' + index.toString()}
        variant="outlined"
        key={this.openEl[index] ? 'O' : 'I' + index.toString()}
        onClick={(event) => {
          this.handlePopperClick(event, index);
        }}
        /*  */
        startIcon={data.icon}
      >
        {data.folder}
      </Button>
    );
  }

  getThemeBackgroundColor(selected) {
    return selected ? DEFAULTBACKMENUCOLOR() : DEFAULTTEXTMENUCOLOR();
  }

  getThemeTextColor(selected) {
    return selected ? DEFAULTTEXTMENUCOLOR() : DEFAULTBACKMENUCOLOR();
  }

  getHoverBackgroundColor(selected) {
    return selected
      ? DEFAULTBUTTONHOVERBACKGROUND()
      : DEFAULTBUTTONHOVERCOLOR();
  }

  getHoverTextColor(selected) {
    return selected
      ? DEFAULTBUTTONHOVERCOLOR()
      : DEFAULTBUTTONHOVERBACKGROUND();
  }

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
    const edgeChange = this.gltfobjLen !== 0 && edgeLength === 0;
    // if (fromwhere === 1) {
    //   console.log(this.activeFile, this.props.activefile, this.initDone);
    // }

    if (
      this.activeFile !== this.props.activefile ||
      this.materialtype !== this.props.materialtype ||
      this.selectedoption !== this.props.selectedoption ||
      this.activeDataTable !== this.props.activeDataTable ||
      edgeChange
    ) {
      //  if (this.selectedoption === SELECTMEASURE || this.props.selectedoption === SELECTMEASURE) {
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
      //       if (((this.props.selectedoption === SELECTSOLID) && (this.selectedoption !== SELECTASSEMBLY))
      //           || (this.props.selectedoption === SELECTASSEMBLY)) {
      //           //console.log("Got Here", this.props.selectedoption);
      //           this.selectAllSelectedSolids();
      //       }
      //       if(this.selectedoption !==this.props.selectedoption) {
      //           if(this.props.selectedoption===SELECTLOADEDGES || (this.props.selectedoption===SELECTEDGE && this.props.ctrlKey)) {
      //               this.loadAllEdges(0);                    
      //           }
      //           this.changeVisibility();
      //           this.selectedoption = this.props.selectedoption;
      //       } 
      this.changeSelectedOption(this.props.selectedoption);
      if (
        this.activeFile !== this.props.activefile ||
        this.materialtype !== this.props.materialtype ||
        this.activeDataTable !== this.props.activeDataTable ||
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
          if (this.activeFile !== this.props.activefile) {
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
              sx={{
                color: this.getThemeTextColor(false),
                background: this.getThemeBackgroundColor(false),
                backgroundColor: this.getThemeBackgroundColor(false),
                '&:hover': {
                  color: this.getHoverBackgroundColor(false),
                  backgroundColor: this.getHoverBackgroundColor(false),
                  background: this.getHoverTextColor(false)
                }
              }}
              variant="outlined"
              onClick={(event) => {
                this.resetMyControls();
              }}
              startIcon={<RotateLeftSharpIcon />}
            >
              &nbsp;
            </Button>
            <Button
              sx={{
                color: this.getThemeTextColor(this.state.freezeNonSelection),
                background: this.getThemeBackgroundColor(
                  this.state.freezeNonSelection
                ),
                backgroundColor: this.getThemeBackgroundColor(
                  this.state.freezeNonSelection
                ),
                '&:hover': {
                  color: this.getHoverBackgroundColor(
                    this.state.freezeNonSelection
                  ),
                  backgroundColor: this.getHoverBackgroundColor(
                    this.state.freezeNonSelection
                  ),
                  background: this.getHoverTextColor(
                    this.state.freezeNonSelection
                  )
                }
              }}
              variant="outlined"
              onClick={async (event) => {
                // this.setState({
                //   freezeNonSelection: !this.state.freezeNonSelection
                // });
                await this.changeStateOfSelection(null, event);
                try {
                  if (this.props.onClick) {
                    this.props.onClick(null, SELECTANITEM, event);
                  }
                } catch (error) {
                  console.log('Error while doing onlcikc from menu', error);
                }
              }}
              startIcon={
                this.state.freezeNonSelection ? (
                  <AnimationOutlinedIcon />
                ) : (
                  <AcUnitSharpIcon />
                )
              }
            >
              &nbsp;
            </Button>
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
