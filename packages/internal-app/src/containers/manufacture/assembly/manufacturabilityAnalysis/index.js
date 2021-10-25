import React, { useState, useEffect } from 'react';
import {
  Paper,
  /*CircularProgress,*/
  Box, LinearProgress,
  /*makeStyles*/
} from "@material-ui/core";
import { Spinner } from "reactstrap";
import TableOrderView from './TableOrderView';
import GLTFRenderer from '@monostruct/common/gltf/GltfRenderer.js';
import {
  DEFAULTBACKCOLOR, DEFAULTSELECTCOLOR, DEFAULTTOUCHCOLOR, USESTYLES,
  SELECTDISTANCE,SELECTSOLID, SELECTHIRERACHY, SELECTDISECTPARTS, STATEPROPS,
  SELECTASSEMBLY, SELECTFEATURE, arrayCopy, arrayFindIndex, arrayRemove, gltf_Dict
} from "@monostruct/common/gltf/Tree/utils";
import { getAFileFromStore,saveTreeInfo,getPartsAssemblyOrder,resourcePathURL } from '@monostruct/common/api/fileUpload.api';
import '../../style.css';

/*
const DEFAULTDISTANCEGAP = 0.1;
const DEFAULTANGLEGAP = 0.5;
const DEFAULTEXPLODEGAP = 10;
const DEFAULTFROMCENTER = true;
const DEFAULTHOLESCALE = 0.77;
const DEFAULTREMOVEGAP = 8;
const DEFAULTANIMATIONTIME=1.0;
const DEFAULTDISECT = false;
const DEFAULTSHOWDISECT = false;
const DEFAULTSHOWINFOONSELECT = false;
const DEFAULTMATERIALNAME = "Basic";
const DEFAULTMATERIALTYPE = [{ "id": 1, "name": "Basic" }];


const stateprops = {
    distancegap: DEFAULTDISTANCEGAP,
    anglegap: DEFAULTANGLEGAP,
    explodegap: DEFAULTEXPLODEGAP,
    disect: DEFAULTDISECT,
    showdisect: DEFAULTSHOWDISECT,
    showinfoonselect: DEFAULTSHOWINFOONSELECT,
    materialtype: DEFAULTMATERIALTYPE,
    fromcenter:DEFAULTFROMCENTER,
    holescale:DEFAULTHOLESCALE,
    removegap:DEFAULTREMOVEGAP,
    animationtime:DEFAULTANIMATIONTIME
}

const useStyles = makeStyles((theme) => ({
  mainContainer: { margin: 10, padding: 10, display: 'inline-flex', minWidth: '100%' },
  viewerContainer: {
    flex: 1,
    padding: '20px',
    margin: '0px 15px',
    display: 'inline-block',
    boxShadow: '0 0 10px rgb(0 0 0 / 20%)'
  }
}));
*/
let state_selectedObjects = [];
//let reSetMe = true;
//let filteredList = [];
export default function ManufacturabilityAnalysis(props) {
  const { 
    fileId, 
    gltfjson, 
    isLoading, 
    itemProperties, 
    additionalSaveFunction, 
    fileUUId,
    progressBarLoad,
    percentage, 
  } = props;
  //const [list, setList] = useState([]);
  const [isFileLoading, setIsFileLoading] = useState(isLoading);
  const [firstTimeLoading,setFirstTimeLoading]=useState(false);
  //const [filteredList, setFilteredList] = useState([]);
  const [selectedOption, setSelectedOption] = useState(SELECTFEATURE);
  const [resetOption, setResetOption] = useState(true);
  const classes = USESTYLES();
  /* const [columns, setColumns] = useState([
      { title: 'Mates', field: 'index', editable: "never" },
      { title: 'Mate Name', field:'name',editable:"never", width:'100px', 'word-break': 'break-all'},
      { title: 'Insertion Order', field:'order',editable:"never"},
      { title: 'Insertion Type', field: 'insert', editable: "never" },
      { title: 'Dispensing', field: 'dispense', type: 'numeric' },
      { title: 'Transfer Holding', field: 'quantity', type: 'numeric' },
  ]) 
  const [columns, setColumns] = useState([
    { label: 'Insertion Order', dataKey: 'order', numeric: true, align:"right",editable: "never", width: 90 },
    { label: 'Mate Name', dataKey: 'name', editable: "never", numeric: false, align:"left", width: 200, 'word-break': 'break-all' },
    { label: 'Insertion Direction', dataKey: 'direction', editable: "never", numeric: false, align:"right", width: 90 },   
    { label: 'Insertion Type', dataKey: 'insert', numeric: false, align:"left",  editable: "never", width: 90 },
    { label: 'Dispensing', dataKey: 'dispense', numeric: true,  align:"right", type: 'numeric', width: 90 },
    { label: 'Transfer Holding', dataKey: 'quantity', numeric: true, align:"right", type: 'numeric', width: 90 },
  ])
  */
  

  const [state, _setState] = useState({gltfjson:gltfjson,
                                        mycounter:0});
  const [ctrlKey, setCtrlKey] = useState(false);
  const [filteredList, setFilteredList] = useState([]);
  const [alerter,setAlerter]=useState("Initializing");

  const [columns, setColumns] = useState([
    { title:'Insertion Order', dataKey: 'order', type:"view", align:"right", sortable:true, resizable:true, width: 100 },
    { title:'Mate Name', dataKey: 'name',  type:"view", align:"left", sortable:true, resizable:true, width: 170 },   
    { title:'X', dataKey: 'AX', type: (alerter && alerter!="")? "view" : "number", align:"right", sortable:true, resizable:true, width: 50 },
    { title:'Y', dataKey: 'AY', type: (alerter && alerter!="")? "view" : "number", align:"right", sortable:true, resizable:true, width: 50 },
    { title:'Z', dataKey: 'AZ', type: (alerter && alerter!="")? "view" : "number", align:"right", sortable:true, resizable:true, width: 50 },
    { title:'Insertion Type', dataKey: 'insert', type:"view", align:"left", sortable:true, resizable:true, width: 100 },
    { title:'Dispensing', dataKey: 'dispense',  type:"view", align:"right", sortable:true, resizable:true, width: 120 },
    { title:'Transfer Holding', dataKey: 'quantity', type:"view",  align:"right", sortable:true, resizable:true, width: 100 }  
  ])
  const setState = (data) => {
    _setState(prevState => {
      return {
        ...prevState,
        ...data
      }

    })
  }

  /* const arrayFindIndex = (arr, value, parent = false) => {

    return arr.findIndex(function (ele) {
      if (parent) return ele.parent[gltf_Dict["name"]] === value;
      return ele[gltf_Dict["name"]] === value;
    });
  }

  const arrayRemove = (arr, value, parent = false) => {

    return arr.filter(function (ele) {
      if (parent) return ele.parent[gltf_Dict["name"]] !== value;
      return ele[gltf_Dict["name"]] !== value;
    });
  }
  const arrayCopy = (arr) => {
    var copy_selectobjects = [];

    arr.forEach(element => {
      copy_selectobjects.push(element);
    });
    return copy_selectobjects;
  } */
  const findSingleNode = (mynode) => {
    return [[mynode], mynode];
  }

  const findMyParentPart = (mynode) => {
    var myParentID = -1;
    let state_gltfjson = state.gltfjson || gltfjson;
    if (!state_gltfjson || !state_gltfjson.tree) {
      setState({ gltfjson: gltfjson });
      state_gltfjson=gltfjson;
    }
    if(state_gltfjson && state_gltfjson.tree){
      for (var i = 0; i < state_gltfjson.tree.length; i++) {
        if (state_gltfjson.tree[i][gltf_Dict["name"]] === mynode[gltf_Dict["name"]]) {
          myParentID = state_gltfjson.tree[i][gltf_Dict["parentId"]];
          if (state_gltfjson.tree[i][gltf_Dict["element"]] === "P") {
            return state_gltfjson.tree[i];
          } else {
            break;
          }
        }
      }
    }
    

    if (myParentID === -1) {
      return null;
    } else {
      var myParentsParentID = -1;
      if(state_gltfjson && state_gltfjson.tree) {
        for ( i = 0; i < state_gltfjson.tree.length; i++) {
          if (state_gltfjson.tree[i][gltf_Dict["id"]] === myParentID) {
            myParentsParentID = state_gltfjson.tree[i][gltf_Dict["parentId"]];
            if (state_gltfjson.tree[i][gltf_Dict["element"]] === "P") {
              return state_gltfjson.tree[i];
            } else {
              break;
            }
          }
        }
      }
      //console.log("Parent", myParentsParentID, myParentID, myID);          
      if (myParentsParentID === -1) { //RootNode
        //console.log("Pushing", myParentsParentID, myParentID, myID);
        return null;
      } else {
        if(state_gltfjson && state_gltfjson.tree) {
          for (i = 0; i < state_gltfjson.tree.length; i++) {
            if ((state_gltfjson.tree[i][gltf_Dict["id"]] === myParentsParentID)) {
              if (state_gltfjson.tree[i][gltf_Dict["element"]] === "P") {
                return state_gltfjson.tree[i];
              }
            }
          }
        }
      }
      return null;
    }
  };

  const findSiblingNodes = (mynode) => {
    const myParentPart = findMyParentPart(mynode);
    var myParentNode = null;
    var myMaterials = [];
    if (myParentPart) {
      myParentNode = myParentPart;
      const myChild = myParentPart;
      if (myChild) {
        myMaterials.push(myChild);
      }
    }

    if (myMaterials.length !== 0) {
      return [myMaterials, myParentNode];
    }
    return [[mynode], mynode];
  }


  const findFamilyNodes = (mynode) => {
    var myParentID = -1;
    var myID = -1;
    var parentNode = null;

    let state_gltfjson = state.gltfjson || gltfjson;
    if (!state_gltfjson || !state_gltfjson.tree) {
      setState({ gltfjson: gltfjson });
      state_gltfjson=gltfjson;
    }
    if(state_gltfjson && state_gltfjson.tree){
      for (var i = 0; i < state_gltfjson.tree.length; i++) {
        if (state_gltfjson.tree[i][gltf_Dict["name"]] === mynode[gltf_Dict["name"]]) {
          myParentID = state_gltfjson.tree[i][gltf_Dict["parentId"]];
          myID = state_gltfjson.tree[i][gltf_Dict["id"]];
          parentNode = state_gltfjson.tree[i];
          break;
        }
      }
    }
    
    const myParentPart = findMyParentPart(mynode);
    if (myParentPart) {
      parentNode = myParentPart;
      myParentID = parentNode[gltf_Dict["id"]];
    }
    //console.log(myParentID, parentNode);
    var myMaterials = [];
    if (myParentID !== -1) {
      var myParentsParentID = -1;
      if(state_gltfjson && state_gltfjson.tree) {
        for ( i = 0; i < state_gltfjson.tree.length; i++) {
          if (state_gltfjson.tree[i][gltf_Dict["id"]] === myParentID) {
            myParentsParentID = state_gltfjson.tree[i][gltf_Dict["parentId"]];
            parentNode = state_gltfjson.tree[i];
            break;
          }
        }
      }
      
      //console.log(myParentID, myParentsParentID, parentNode);
      var myParents = [];
      if (myParentsParentID === -1) { //RootNode
        myParents.push(myID);
      } else {
        if(state_gltfjson && state_gltfjson.tree){
          for ( i = 0; i < state_gltfjson.tree.length; i++) {
            if (state_gltfjson.tree[i][gltf_Dict["parentId"]] === myParentsParentID) {
              myParents.push(state_gltfjson.tree[i][gltf_Dict["id"]]);
            } else {
              if (state_gltfjson.tree[i][gltf_Dict["id"]] === myParentsParentID) {
                parentNode = state_gltfjson.tree[i];
              }
            }
          }
        }
        
      }
      for (var j = 0; j < myParents.length; j++) {
        myParentID = myParents[j];
        if(state_gltfjson && state_gltfjson.tree){
          for ( i = 0; i < state_gltfjson.tree.length; i++) {
            if (state_gltfjson.tree[i][gltf_Dict["id"]] === myParentID) {
              var myChild = state_gltfjson.tree[i];
              if (myChild) {
                if ((state_gltfjson.tree[i][gltf_Dict["element"]] === "P") ||
                  onlyparts(myChild[gltf_Dict["name"]])) {
                  myMaterials.push(myChild);
                }
              }
            }
          }
        }
      }

    }
    if (myMaterials.length !== 0) {

      return [myMaterials, parentNode];
    }

    return [[mynode], mynode]

  }

  const findMyParentChilds = (mynode, whichOption) => {
    //console.log(this.props.selectedoption,SELECTSOLID,this.props.selectedoption != SELECTSOLID);
    if ((((whichOption !== SELECTSOLID) && (whichOption !== SELECTASSEMBLY)) ||
      (state.splitMethod !== SELECTDISECTPARTS)) && resetOption) {
      //console.log("I got over Singles",whichOption,resetOption,state.splitMethod);
      return findSingleNode(mynode);
    }
    if (whichOption === SELECTASSEMBLY) {
      //console.log("I got over Family");
      return findFamilyNodes(mynode);
    } else {
      //console.log("I got over Sibling");
      return findSiblingNodes(mynode);
    }

  }

  const findMyMaterial = (data) => {
    //console.log(data);
    //console.log(state.gltfjson.tree);
    let state_gltfjson = state.gltfjson || gltfjson;
    if (!state_gltfjson || !state_gltfjson.tree) {
      setState({ gltfjson: gltfjson });
      state_gltfjson=gltfjson;
    }
    if (state_gltfjson.tree) {
      for (var i = 0; i < state_gltfjson.tree.length; i++) {
        //console.log(state.gltfjson.tree[i]);
        if (state_gltfjson.tree[i][gltf_Dict["name"]] === data["name"]) {
          return state_gltfjson.tree[i];
        }
      }
    };
    return null;
  }

  const findMyMaterialIndex = (data) => {
    //console.log(data);
    //console.log(state.gltfjson.tree);
    let state_gltfjson = state.gltfjson || gltfjson;
    if (!state_gltfjson || !state_gltfjson.tree) {
      setState({ gltfjson: gltfjson });
      state_gltfjson=gltfjson;
    }
    let myIndex = -1;
    if (state_gltfjson.tree) {
      for (var i = 0; i < state_gltfjson.tree.length; i++) {
        //console.log(state.gltfjson.tree[i]);
        if (state_gltfjson.tree[i][gltf_Dict["name"]] === data["name"]) {
          return i;
        }
      }
    };
    return myIndex;
  }


  const onlyfaces = (name) => {

    const first4chars = name.slice(0, 4);
    const first6chars = name.slice(0, 6);
    if ((first4chars === "PART") || (first4chars === "EDGE") || (first6chars === "VERTEX")) {
      return false;
    }
    return true;
  }

  const onlyparts = (name) => {

    const first4chars = name.slice(0, 4);
    return first4chars === "PART";

  }
  let mapdata = {}
  const setSelectedShell = (data, setoption) => {
   
    const myID = data[gltf_Dict['id']];
    let curData = mapdata[myID];
    let state_gltfjson = state.gltfjson || gltfjson;
    if (!state_gltfjson || !state_gltfjson.tree) {
      setState({ gltfjson: gltfjson });
      state_gltfjson=gltfjson;
    }
    if (typeof curData === 'undefined') {
      if(state_gltfjson && state_gltfjson.tree){
        for (let index = 0; index < state_gltfjson.tree.length; index++) {
          const element = state_gltfjson.tree[index];
          //console.log("compare",element,data);
          if (element[[gltf_Dict['id']]] === myID) {
            curData = index;
            mapdata[myID] = index;
            break;
          }
        }
      }
      
    }
    if (typeof curData !== 'undefined') {
      let myTree = { ...state_gltfjson };
      if(myTree.tree) {
        if(myTree.tree[curData].selectedshell!=setoption) {
          data.selectedshell=setoption;
          myTree.tree[curData] = data;
          console.log('Going to Set', myTree, data, curData, data.selectedshell,myTree.tree[curData].selectedshell);
          setState({ gltfjson: myTree });
          console.log('Finally Setting', myTree, data, curData, state.gltfjson,myTree.tree[curData].selectedshell);
          getTable(myTree, true);
        } else {
          if(data.selectedshell!=setoption){
            data.selectedshell=setoption;
          }
        }
      } else {
        if(data.selectedshell!=setoption){
          data.selectedshell=setoption;
        }
      }
      
      
    } else {
      if(state_gltfjson && state_gltfjson.tree) {
        console.log(
          'unable to find info',
          data,
          myID,
          curData,
          state_gltfjson.tree.length
        );
      } else {
        console.log(
          'unable to find info',
          data,
          myID,
          curData,
         "NO tree length"
        );
      }
      
    }
   
  };
  /* const setSelectedShellForce = (data, setoption) => {

    data.selectedshell = setoption;
    const myID = data[gltf_Dict['id']];
    let curData = mapdata[myID];
    if (typeof (curData) === "undefined") {
      for (let index = 0; index < state.gltfjson.tree.length; index++) {

        const element = state.gltfjson.tree[index];
        //console.log("compare",element,data);
        if (element[[gltf_Dict['id']]] === myID) {
          curData = index;
          mapdata[myID] = index;
          break;
        }

      }
    }
    if (typeof (curData) !== "undefined") {
      let myTree = { ...state.gltfjson };
      for (let index = 0; index < myTree.tree.length; index++) {
        const element = myTree.tree[index];
        element.selectedshell = (index === curData) && setoption;
      }
      console.log("About to set", myTree);
      setState({ gltfjson: myTree });
      console.log("Setting", myTree, data, curData, state.gltfjson);
      getTable(myTree,true);
    } else {
      console.log("unable to find info", data, myID, curData, state.gltfjson.tree.length)
    }


  }; */
  const doOneSelection = (element, event) => {
    if (element) {
      console.log('Starting', element, element.selectedshell);
      const aShape = element[gltf_Dict['name']];
      if (aShape) {
        const first4chars = aShape.slice(0, 4);
        const first6chars = aShape.slice(0, 6);
        if (
          first4chars === 'FACE' ||
          first4chars === 'EDGE' ||
          first4chars === 'PART' ||
          first6chars === 'VERTEX'
        ) {
          console.log('Setting..', element, element.selectedshell);
         
          setSelectedShell(element, element.selectedshell);
          //element.selectedshell = true;

          console.log('Setting..Done', element, element.selectedshell);
          var mymesh = element; //findMyMaterial(element);
          console.log('Before', mymesh);
          if (mymesh) {
            mymesh.selectedshell = element.selectedshell;
            //setSelectedShellForce(mymesh,true);
            changeStateOfSelection(mymesh, event);
            if (event) {
              event['ctrlKey'] = true;
            }
          }
          console.log('aftet', mymesh);
        }
      }
    }
  };
  const resetSelections = () => {
    
    state_selectedObjects.forEach(element => {    
      setSelectedShell(element, false);
      //element.selectedshell = false;
    });
    
    /* setState({
     
      selectedObjects: [],
      parentObjects: []
      
    }); */
    state_selectedObjects = [];
    console.log("I am emptying");
  }

  const addSelectionFromComponent = async (selectedNodes) => {
    let renderData = selectedNodes;
    if(!renderData) {
      renderData = [];
    }
    renderData.forEach(element => {
      element.selectedshell=true;
    });
    //setState({ renderdata: renderData, whatchange: SELECTDISTANCE });
    setRenderData(renderData);
    updateSelectionFromComponent(renderData);
  };

  const updateSelectionFromComponent = async (selectedNodes) => {
    
    var whatIsNotThereToAdd=[];
    var whatIsAvailableToRemove=[];
    selectedNodes.forEach(element => {
      var elementFound=false;
      for (let index = 0; index < state_selectedObjects.length; index++) {
        const stateElement = state_selectedObjects[index];
        if(element[gltf_Dict['name']]==stateElement[gltf_Dict['name']]){
          elementFound=true;
          break;
        }
      }
      if(!elementFound) {
        whatIsNotThereToAdd.push(element);
      }
    });
    state_selectedObjects.forEach(stateElement => {
      var elementFound=false;
      for (let index = 0; index < selectedNodes.length; index++) {
        const element = selectedNodes[index];
        if(element[gltf_Dict['name']]==stateElement[gltf_Dict['name']]){
          elementFound=true;
          break;
        }
      }
      if(!elementFound) {
        whatIsAvailableToRemove.push(stateElement);
      }
    });
    
    if (selectedNodes && selectedNodes.length != 0) {
     
      changeStateOfSelections(whatIsAvailableToRemove,whatIsNotThereToAdd);
    } else {
      resetSelections();
    }
  };


  const changeStateOfSelections = async (removeData, addData) => {
    mapdata = {}
    //console.log("Data for shapeinfo",data,selectedOption,event);
    console.log("Reaching here after clicking",removeData, addData);
    var copy_selectobjects = arrayCopy(state_selectedObjects);
    //var copy_parentobjects = arrayCopy(state.parentObjects);
    
   
    removeData.forEach(data => {
      
      if (data) {
        
        const myAllChildsAndParents = findMyParentChilds(data, selectedOption);
        //console.log(myAllChildsAndParents);
        const myAllChilds = myAllChildsAndParents[0];
        //const myParentNode = myAllChildsAndParents[1];

        //console.log("Splitted",myAllChilds,myParentNode)
        for (let elementdata of myAllChilds) {
          //console.log("Before",elementdata);
         
          setSelectedShell(elementdata, false);
          //elementdata.selectedshell = false;

          const currentIndex = arrayFindIndex(copy_selectobjects, elementdata[gltf_Dict["name"]]);
          if (currentIndex != -1) {
            //console.log(currentIndex,elementdata[gltf_Dict["name"]]);        
            copy_selectobjects = arrayRemove(copy_selectobjects, elementdata[gltf_Dict["name"]]);
            //console.log("Before Splicing",copy_mateobjects,currentIndex, copy_mateobjects.length);
            
          } 
         
          
        };
        //copy_parentobjects = arrayRemove(copy_parentobjects, myParentNode[gltf_Dict["name"]], true);
      
      } 
    
    });
    //var stateLength = copy_selectobjects.length;
    var toGetInfo = false;
    addData.forEach(data => {
      if (data) {
        const myAllChildsAndParents = findMyParentChilds(data, selectedOption);
        //console.log(myAllChildsAndParents);
        const myAllChilds = myAllChildsAndParents[0];
        const myParentNode = myAllChildsAndParents[1];
        //console.log("Splitted",myAllChilds,myParentNode)
        for (let elementdata of myAllChilds) {
          //console.log("Before",elementdata);
          
          setSelectedShell(elementdata, true);
          //elementdata.selectedshell = true;
          copy_selectobjects.push(elementdata);        
          toGetInfo=true;
        };
        /* const node = {
          'parent': myParentNode,
          'child': myAllChilds
        };
        copy_parentobjects.push(node); */       
      }
    });
    
   /*  setState({
      selectedObjects: copy_selectobjects,
      parentObjects:copy_parentobjects
    }); */
    state_selectedObjects = copy_selectobjects;
    console.log("Setting selcted",copy_selectobjects);
  }

  const addSelectionFromTable = async (selectedNodes, event) => {

    console.log("Selected Node", selectedNodes, "Event", event);
    setFirstTimeLoading(true);
    if (selectedNodes?.index) {
      const myTree = findMyMaterial(selectedNodes);
      console.log(myTree);
      if (myTree) {
        myTree.selectedshell = selectedNodes.selectedshell;
        if (event) {
          setCtrlKey(event.ctrlKey);
        }
        //const myselectedtree = {...myTree};
        console.log("ctrl key", event.ctrlKey);
        console.log("B Check state",myTree, selectedNodes, myTree.selectedshell,  selectedNodes.selectedshell);
        setRenderData([myTree]);
        console.log("C Check state",myTree, selectedNodes, myTree.selectedshell,  selectedNodes.selectedshell);
        doOneSelection(myTree, event);
        console.log("A Check state",myTree,  selectedNodes, myTree.selectedshell, selectedNodes.selectedshell);
        
        //setState({ renderdata: [myTree], whatchange: SELECTDISTANCE });

        //resetSelectionFromTree();
        /*  selectedNodes=[myTree];
         selectedNodes.reduce(
             (p, x) =>
                 p.then(_ => doOneSelection(x,event)),
                 Promise.resolve()
             
         );  */

      }
    }

  };
  /* const resetSelectionFromTree = async () => {
    if ((state.whatchange !== 0) || state.renderdata !== []) {
      setState({ whatchange: 0, renderdata: [] });
    }
  }; */

  
  const updateSelectionFromTable = async (rowIndex, columnIndex, dataRow, value) => {
    setFirstTimeLoading(true);
    console.log("Changed cell", rowIndex, columnIndex, dataRow, value);
    let state_gltfjson = state.gltfjson || gltfjson;
    if (!state_gltfjson || !state_gltfjson.tree) {
      setState({ gltfjson: gltfjson });
      state_gltfjson=gltfjson;
    } 
    //var myTree=null;
    if(state_gltfjson) {
      console.log("My json",state_gltfjson);
      if(dataRow) {
        console.log(dataRow);
        const myTreeIndex = findMyMaterialIndex(dataRow);
        if( myTreeIndex!=-1) {
          var myTree = {...state_gltfjson};
          if (myTree) {
            if(myTree.tree) {
              myTree.tree[myTreeIndex].selectedshell=true;
              myTree.tree[myTreeIndex][columns[columnIndex].dataKey]=value;
              setState({gltfjson:myTree});
              setRenderData([myTree[myTreeIndex]])
              let event={};
              event['ctrlKey']=false;
              doOneSelection(myTree.tree[myTreeIndex], event);
              getTable(myTree, true);
            }
          }
        } else {
          console.log("Problem in cell selected",dataRow,rowIndex,columnIndex,value);
        }
        
        
      } else {
        console.log("Problem in dataRow");
      }
    } else {
      console.log("Problem in state");
    }

  };

  const saveSelectionFromTable = async (mydata) => {
    console.log(mydata);
    var myJsonTree;
    setFirstTimeLoading(true);
    let state_gltfjson = state.gltfjson || gltfjson;
    if (!state_gltfjson || !state_gltfjson.tree) {
      setState({ gltfjson: gltfjson });
      state_gltfjson=gltfjson;
    } 
    if(state_gltfjson) {
      myJsonTree = state_gltfjson.tree;
    } else {
      myJsonTree = this?.props?.gltfjson?.tree;
    }
    if(myJsonTree) {
      var gltfjsonParam = {...state_gltfjson};
      if(gltfjsonParam && gltfjsonParam.tree) {
        for (let index = 2; index < gltfjsonParam.tree.length; index++) {
          gltfjsonParam.tree[index]=mydata[index-2];        
        }
      }
      console.log("Saving", gltfjsonParam.tree,itemProperties.fileMPPS);
      const filePath = itemProperties.fileUUId ? itemProperties.fileUUId+'/': '';
      saveTreeInfo( gltfjsonParam.tree,itemProperties.fileMPPS, itemProperties.fileUUId)
      .then(res => res.data)
      .then((data) => { 
        console.log("Getting Resources",data);
        getAFileFromStore(filePath+itemProperties.fileMPPS,"gltf")
        .then(res => res.data)
        .then((data) => {
          const gltfobj = data;
          getAFileFromStore(filePath+itemProperties.fileMPPS,"tree")
          .then(res => res.data)
          .then((data) => {
            const curTree = data;
            getAFileFromStore(filePath+itemProperties.fileMPPS,"order")
            .then(res => res.data)
            .then((data) => {
              const curOrder = data;
              var mygltfjson = gltfjsonParam;
              mygltfjson.gltf = gltfobj;
              mygltfjson.tree = curTree;
              mygltfjson.assemblyorder = curOrder;
              const mycounter = state.mycounter+1;
              setState({gltfjson:mygltfjson,
                        mycounter:mycounter});  
              let event = {};
              event['ctrlKey'] = false;
              let selectedRows = [];
              curTree.forEach((element) => {
                if (element.selectedshell) {
                  console.log('Setting to reset', element);
                  selectedRows.push(element);
                  /*  setState({
                    renderdata: [element],
                    whatchange: SELECTDISTANCE,
                  });
                  console.log('After Setting to reset', curTree); */
                  doOneSelection(element, event);
                  event['ctrlKey'] = true;
                  console.log('Finally Setting to reset', curTree);
                }
              });
              setRenderData(selectedRows);
              getTable(mygltfjson, true);     
            });              
          });
        });
      });
    }

  };
  const getItemFileOrderID =(item) => {
    if(item.fileUUId) {
      const fullpath = item.fileName;
      return fullpath.slice(6,fullpath.length);
    }
    return item.fileId;
  }
  const resetSelectionFromTable = async () => {
    var myJsonTree;
    setFirstTimeLoading(true);
    let state_gltfjson = state.gltfjson || gltfjson;
    if (!state_gltfjson || !state_gltfjson.tree) {
      setState({ gltfjson: gltfjson });
      state_gltfjson=gltfjson;
    } 
    if(state_gltfjson) {
      myJsonTree = state_gltfjson.tree;
    } else {
      myJsonTree = this?.props?.gltfjson?.tree;
    }
    if(myJsonTree) {
      
      console.log("Saving",myJsonTree,itemProperties.fileMPPS);
      const filePath = itemProperties.fileUUId ? itemProperties.fileUUId+'/': '';
      getPartsAssemblyOrder(getItemFileOrderID(itemProperties), STATEPROPS.distancegap, STATEPROPS.anglegap, STATEPROPS.explodegap, 
        STATEPROPS.fromcenter,STATEPROPS.holescale,STATEPROPS.removegap,STATEPROPS.animationtime)
        .then(res => res.data)
        .then((data) => {      
          console.log("Getting Resources",data);
          getAFileFromStore(filePath+itemProperties.fileMPPS,"gltf")
          .then(res => res.data)
          .then((data) => {
            const gltfobj = data;
            getAFileFromStore(filePath+itemProperties.fileMPPS,"tree")
            .then(res => res.data)
            .then((data) => {
              const curTree = data;              
              getAFileFromStore(filePath+itemProperties.fileMPPS,"order")
              .then(res => res.data)
              .then((data) => {
                const curOrder = data;
                var mygltfjson = {...state_gltfjson};
                mygltfjson.gltf = gltfobj;
                mygltfjson.tree = curTree;
                mygltfjson.assemblyorder = curOrder;
                const mycounter = state.mycounter+1;
                setState({gltfjson:mygltfjson,
                          mycounter:mycounter}); 
                getTable(mygltfjson,true);  
              });                     
            });
        });
      });
    }

  };

  const fetchSelectionFromTable = async () => {
    var myJsonTree;
    setFirstTimeLoading(true);
    let state_gltfjson = state.gltfjson || gltfjson;
    if (!state_gltfjson || !state_gltfjson.tree) {
      setState({ gltfjson: gltfjson });
      state_gltfjson=gltfjson;
    } 
    if(state_gltfjson) {
      myJsonTree = state_gltfjson.tree;
    } else {
      myJsonTree = this?.props?.gltfjson?.tree;
    }
    if(myJsonTree) {
      console.log("Saving",myJsonTree,itemProperties.fileMPPS);
      const filePath = itemProperties.fileUUId ? itemProperties.fileUUId+'/': '';
        getAFileFromStore(filePath+itemProperties.fileMPPS,"gltf")
        .then(res => res.data)
        .then((data) => {
          const gltfobj = data;
          getAFileFromStore(filePath+itemProperties.fileMPPS,"tree")
          .then(res => res.data)
          .then((data) => {
            const curTree = data;
            getAFileFromStore(filePath+itemProperties.fileMPPS,"order")
            .then(res => res.data)
            .then((data) => {
              const curOrder = data;
              var mygltfjson = {...state_gltfjson};
              mygltfjson.gltf = gltfobj;
              mygltfjson.tree = curTree;
              mygltfjson.assemblyorder=curOrder;           
              //getTable(mygltfjson,true);
              const mycounter = state.mycounter+1;
              setState({gltfjson:mygltfjson,
                        mycounter:mycounter});  
              getTable(mygltfjson,true);          
            });            
          });
        });
      
    }

  };

  const updateOrderFromTable = async (mydata,oldIndex,newIndex) => {
    var myJsonTree;
    console.log("Updating order change in the tree",mydata,oldIndex,newIndex);
    setFirstTimeLoading(true);
    let state_gltfjson = state.gltfjson || gltfjson;
    if (!state_gltfjson || !state_gltfjson.tree) {
      setState({ gltfjson: gltfjson });
      state_gltfjson=gltfjson;
    } 
    if(state_gltfjson) {
      myJsonTree = state_gltfjson.tree;
    } else {
      myJsonTree = this?.props?.gltfjson?.tree;
    }
    if(myJsonTree) {
      var gltfjsonParam = {...state_gltfjson};
      if(gltfjsonParam && gltfjsonParam.tree) {
        for (let index = 2; index < gltfjsonParam.tree.length; index++) {
          gltfjsonParam.tree[index]=mydata[index-2];
          gltfjsonParam.tree[index].selectedshell=((index-2)==newIndex);
        }
      }
      setState({gltfjson:gltfjsonParam});
    }

  };

  const setRenderData = (data) => {
    setState({
      renderdata: data,
      whatchange: SELECTDISTANCE,
    });
  }

  const changeStateOfSelection = async (data, event) => {
    mapdata = {}
    //console.log("Data for shapeinfo",data,selectedOption,event);
    console.log("Reaching here after clicking",event,data,data?.selectedshell);
    
    //console.log("outside SELECTMEASURE",data);
    var copy_selectobjects = [];
    //var copy_parentobjects = [];
     
    if (data) {
      console.log(data);
      var toAdd = true;
      var toGetInfo = false;
      if (event) {
        toAdd = event.ctrlKey;
      }
      if (event && (event.ctrlKey != ctrlKey)) {
        setCtrlKey(event.ctrlKey);
      }
      
      var stateLength = 0;
      if (!toAdd) {
        console.log(state_selectedObjects); 
        state_selectedObjects.forEach(element => {
          if (data[gltf_Dict["name"]] != element[gltf_Dict["name"]]) { 
            console.log("B",element);        
            setSelectedShell(element, false);
            console.log("A",element); 
            //element.selectedshell = false;
          }
        });
        stateLength = 0;
        copy_selectobjects = [];
       // copy_parentobjects = [];
       
      } else {
        console.log("I am adding instead of replacing");
        copy_selectobjects = arrayCopy(state_selectedObjects);
        //copy_parentobjects = arrayCopy(state.parentObjects);
        
        stateLength = state_selectedObjects.length;
        //console.log("MyMate",copy_mateobjects);
      }
      //console.log(data);
      const myAllChildsAndParents = findMyParentChilds(data, selectedOption);
      //console.log(myAllChildsAndParents);
      const myAllChilds = myAllChildsAndParents[0];
      //const myParentNode = myAllChildsAndParents[1];

      //console.log("Splitted",myAllChilds,myParentNode)
      for (let elementdata of myAllChilds) {
        //console.log("Before",elementdata);
        
        setSelectedShell(elementdata, data.selectedshell);
        //elementdata.selectedshell = data.selectedshell;
        //console.log("After",elementdata,state.gltfjson.tree);
        if (toAdd) {
          if (data.selectedshell) {
            var alreadyPresent = false;
            for (var i = 0; i < copy_selectobjects.length; i++) {
              if (elementdata[gltf_Dict["name"]] == copy_selectobjects[i][gltf_Dict["name"]]) {
                alreadyPresent = true;
                break;
              }
            }
            if (!alreadyPresent) {
              // const copydata = await getShapeInformation(elementdata);
              // console.log('awaiting',copydata);
              copy_selectobjects.push(elementdata);
              
              //console.log("MyMate2",copy_mateobjects);
              toGetInfo = true;
              /* setState({
                  selectedObjects: [...state.selectedObjects, copydata]
              }); */
            }

          } else {//error here... 
            const currentIndex = arrayFindIndex(copy_selectobjects, elementdata[gltf_Dict["name"]]);
            if (currentIndex != -1) {
              //console.log(currentIndex,elementdata[gltf_Dict["name"]]);        
              copy_selectobjects = arrayRemove(copy_selectobjects, elementdata[gltf_Dict["name"]]);
              //console.log("Before Splicing",copy_mateobjects,currentIndex, copy_mateobjects.length);
              
              //console.log('1 : ', copy_selectobjects, copy_mateobjects);
            }

            //setState({ selectedObjects: copy_selectobjects });
          }
        } else {
          if (data.selectedshell) {
            //const copydata = await getShapeInformation(elementdata);
            //console.log('awaiting',elementdata);
            copy_selectobjects.push(elementdata);
           
            toGetInfo = true;
            //setState({ selectedObjects: myAllChilds });
          } else {
            copy_selectobjects = [];
            //setState({ selectedObjects: [] });
          }

        }
      };
      

      console.log("Setting the state of selected objects",state_selectedObjects,"Copy",copy_selectobjects);
      /* setState({
        selectedObjects: copy_selectobjects       
      }); */
      state_selectedObjects = copy_selectobjects;
      /* if (toAdd) {
        if (data.selectedshell) {
          var alreadyPresent = false;
          for (var i = 0; i < state.parentObjects.length; i++) {
            if (myParentNode[gltf_Dict["name"]] == state.parentObjects[i].parent[gltf_Dict["name"]]) {
              alreadyPresent = true;
              break;
            }
          }
          if (!alreadyPresent) {
            const node = {
              'parent': myParentNode,
              'child': myAllChilds
            };
            setState({
              parentObjects: [...state.parentObjects, node]
            });

          } else {
            console.log("Not adding since already present");
          }

        } else {
          copy_parentobjects = arrayRemove(copy_parentobjects, myParentNode[gltf_Dict["name"]], true);
          //console.log('2 : ', copy_parentobjects);
          setState({ parentObjects: copy_parentobjects });
        }
      } else {
        //console.log("setting", "OneNode", myParentNode);
        if (data.selectedshell) {
          const node = {
            'parent': myParentNode,
            'child': myAllChilds
          };
          setState({ parentObjects: [node] });
        } else {
          setState({ parentObjects: [] });
        }
      } */


    } else {
      console.log("I am reaching here to reset selections");
      state_selectedObjects.forEach(element => {     
        setSelectedShell(element, false); 
        //element.selectedshell = false;      
      });
      /* setState({
        selectedObjects: copy_selectobjects
      }); */
      state_selectedObjects = copy_selectobjects;
      console.log("I am reaching here to reset selections",copy_selectobjects);
      //setState({ parentObjects: [] });
    }
    
    //console.log("Finally my state tree",state.gltfjson.tree);
  }
  const handleModelClick = (data, what, event) => {
    console.log(data, what, event);
    setFirstTimeLoading(true);
    if (what === SELECTDISTANCE) {
      if (data) {
        console.log(data);
        const mymesh = findMyMaterial(data);
        if (mymesh) {          
          setSelectedShell(mymesh, data.selectedshell);
          //mymesh.selectedshell = data.selectedshell;
          console.log('Doing mymesh', mymesh, state_selectedObjects);
          return changeStateOfSelection(mymesh, event);
        } else {
          console.log('No Mesh', mymesh, data);
        }
      } else {
        console.log('Resetting', data);
        return changeStateOfSelection(data, event);
      }
      if (event && event.ctrlKey !== ctrlKey) {
        //console.log(event.ctrlKey);
        setCtrlKey(ctrlKey, event.ctrlKey);
      }
    }
    return null;
  };


  const getDirection = (direction) => {
    const x=direction[0];
    const y=direction[1];
    const z=direction[2];
    if(z===1) {
      return "Top";
    }
    if(z===-1) {
      return "Bottom";
    }    
    if(y===1) {
      return "Right";
    }
    if(y===-1) {
      return "Left";
    }
    if(x===1) {
      return "Back";
    }
    if(x===-1) {
      return "Front";
    }
    console.log("Direction",direction);
    return "Any";
  }
  const getTable = (gltfjsonParam,doupdate) => {
    console.log(gltfjsonParam,gltfjson);
    let currentData = [];
    if (gltfjsonParam && gltfjsonParam.tree && gltfjsonParam.assemblyorder) {
      if (gltfjsonParam.assemblyorder.order && gltfjsonParam.assemblyorder.direction && gltfjsonParam.assemblyorder.direction[0].length==2 ) {
        console.log("Setting table", gltfjsonParam.tree, gltfjsonParam.assemblyorder);
      } else {
        alert("Assembly order structure changed. Please reload the step file once again ");
        return;
      }
     
      for (let index = 2; index < gltfjsonParam.tree.length; index++) {
        if(firstTimeLoading===false && doupdate===false) {
          gltfjsonParam.tree[index].selectedshell=false;
        }
        
        const element = gltfjsonParam.tree[index];
        //console.log(element);
        currentData.push({ 
          'id':index,         
          'index': index - 1,
          'name': element[gltf_Dict['name']],
          'order': null,
          'AX':0,
          'AY':0,
          'AZ':1,
          'CX':0,
          'CY':0,
          'CZ':1,
          'CW':0,
          'insert': "Sliding",
          'dispense': null,
          'quantity': null,
          ...element,
        });

      }
      var itemset=false;
      for (let index = 0; index < gltfjsonParam.assemblyorder.order.length; index++) {
        if(currentData[index].AX !== gltfjsonParam.assemblyorder.direction[index][0][0] || 
           currentData[index].AY !== gltfjsonParam.assemblyorder.direction[index][0][1] ||
           currentData[index].AZ !== gltfjsonParam.assemblyorder.direction[index][0][2] 
          ) {
          currentData[index].AX = gltfjsonParam.assemblyorder.direction[index][0][0];
          currentData[index].AY = gltfjsonParam.assemblyorder.direction[index][0][1];
          currentData[index].AZ = gltfjsonParam.assemblyorder.direction[index][0][2];
          currentData[index].CX = gltfjsonParam.assemblyorder.direction[index][1][0];
          currentData[index].CY = gltfjsonParam.assemblyorder.direction[index][1][1];
          currentData[index].CZ = gltfjsonParam.assemblyorder.direction[index][1][2];
          currentData[index].CW = gltfjsonParam.assemblyorder.direction[index][1][3];
          if (gltfjsonParam.assemblyorder.complete===gltfjsonParam.assemblyorder.order.length) {
            gltfjsonParam.tree[index+2].AX = currentData[index].AX;
            gltfjsonParam.tree[index+2].AY = currentData[index].AY;
            gltfjsonParam.tree[index+2].AZ = currentData[index].AZ;
            gltfjsonParam.tree[index+2].CX = currentData[index].CX;
            gltfjsonParam.tree[index+2].CY = currentData[index].CY;
            gltfjsonParam.tree[index+2].CZ = currentData[index].CZ;     
            gltfjsonParam.tree[index+2].CW = currentData[index].CW;       
          }
          itemset=true;
        }        
        const element = gltfjsonParam.assemblyorder.order[index];
        if(!currentData[element].order) {
          currentData[element].order = index + 1; 
          if (gltfjsonParam.assemblyorder.complete===gltfjsonParam.assemblyorder.order.length) {
            gltfjsonParam.tree[element+2].order = currentData[element].order;
          }
          itemset=true;
        }
      }
      
      console.log("About to set Featured List", currentData);
      setFilteredList(currentData);
      console.log("Setting Featured List", currentData, filteredList);
      console.log(gltfjsonParam.assemblyorder);
      if (gltfjsonParam.assemblyorder.current) {
        if (gltfjsonParam.assemblyorder.complete!==gltfjsonParam.assemblyorder.order.length) {
          const progressString="Completed "+gltfjsonParam.assemblyorder.complete.toString()+
            " Out of "+gltfjsonParam.assemblyorder.order.length.toString()+" At "+
            gltfjsonParam.assemblyorder.current+" From "+gltfjsonParam.assemblyorder.start+" \u00a0 "+
            " Please try atleast after a minute";
          setAlerter(progressString);  
               
        } else {
          if(alerter!="") {
            setAlerter("");
            var mycolumns=columns;
            mycolumns[2].type="number";
            mycolumns[3].type="number";
            mycolumns[4].type="number";
            setColumns(mycolumns);
          }
          if(itemset) {
            setState({gltfjson:gltfjsonParam});
          }
        }        
      } else {
        if(alerter!=="") {
          setAlerter("");
          var mycolumns=columns;
          mycolumns[2].type="number";
          mycolumns[3].type="number";
          mycolumns[4].type="number";
          setColumns(mycolumns);
        }
      }
    } else {
      console.log("Going to set Featured List", currentData);
      setFilteredList(currentData);
      if(alerter!=="") {
        setAlerter("");
        var mycolumns=columns;       
        mycolumns[2].type="number";
        mycolumns[3].type="number";
        mycolumns[4].type="number";
        setColumns(mycolumns);
      }
      console.log("Final Setting Featured List", currentData, filteredList);
    }
    
    //return currentData;
  }
  useEffect(() => {
    setIsFileLoading(isLoading);
  }, [isLoading]);
  useEffect(() => {
    const includeParts = true;
    console.log("Reaching in useeffect", gltfjson, fileId, isLoading, state.mycounter?state.mycounter:0);
    let gltfjsonlen = Object.keys(gltfjson).length +  (state.mycounter?state.mycounter:0);
    if (gltfjsonlen > 0) {
      gltfjsonlen += gltfjson?.gltf?.accessors?.length;
      if (gltfjson && gltfjson.assemblyorder && gltfjson.assemblyorder.complete) {
        gltfjsonlen += gltfjson.assemblyorder.complete;
      }     
      console.log("Setting gltflen",gltfjsonlen,gltfjson);
    }
    if (gltfjsonlen > 0) {
      setState({
        selectedindex: 0,
        activefile: (fileId || fileUUId || "").toString() + includeParts.toString() +
        STATEPROPS.distancegap.toString() + STATEPROPS.anglegap.toString() + gltfjsonlen.toString(),
        gltfjson: gltfjson,
        dataselection: 0,
        firstshell: null,
        secondshell: null,
        materialname: STATEPROPS.materialtype[0].name,
        disectstruct: STATEPROPS.disect,
        showdisect: STATEPROPS.showdisect,
        showinfoonselect: STATEPROPS.showinfoonselect,
        //splitMethod: includeParts ? SELECTDISECTPARTS : SELECTHIRERACHY,


        renderdata: [],
        whatchange: 0,
      });
      console.log("Reaching useEffect1");
      getTable(gltfjson,false);
      //setResetMe(true);
    } else {
      console.log("Not Setting gltflen",gltfjsonlen,gltfjson);
    }
    
  }, [gltfjson]);

  /* useEffect(() => {
      console.log("Reaching useEffect2"); // Not at all coming, here hence commented
      getTable(state.gltfjson);
  }, [state.gltfjson?.tree]); */

  if (isFileLoading) {
    return (<div
      style={{
        display: "flex",
        justifyContent: "center"
      }}
    >
      <Spinner animation="border" />
    </div>)
  }
  let gltfjsonlen = Object.keys(state.gltfjson).length+(state.mycounter?state.mycounter:0);
  if (gltfjsonlen > 0) {
    gltfjsonlen += gltfjson?.gltf?.accessors?.length;
    if (gltfjson && gltfjson.assemblyorder && gltfjson.assemblyorder.complete) {
      gltfjsonlen += gltfjson.assemblyorder.complete+1;
    }     
    console.log("Setting outside gltflen",gltfjsonlen,gltfjson);
  }

  return (
    <Paper className={classes.mainContainer}>
      <Paper className={classes.viewerContainer} >
        {progressBarLoad && (
          <Box sx={{ width: '100%' }}>
            <LinearProgress variant="determinate"  value={percentage.toFixed(3)} />
          </Box>
        )}
        {
          !isLoading && Object.keys(state.gltfjson).length > 0 && !isFileLoading &&
          <GLTFRenderer
            //gltfjson={JSON.stringify(gltfjson)}
            gltfobj={state.gltfjson}
            fileGDT={null}
            fileUUId={fileUUId}
            fileAnimation={true}
            //view="Perspective"
            activefile={fileId + gltfjsonlen.toString()}
            backcolor={DEFAULTBACKCOLOR()}
            selectcolor={DEFAULTSELECTCOLOR()}
            touchcolor={DEFAULTTOUCHCOLOR()}
            selectedoption={SELECTFEATURE}
            splitmethod={SELECTHIRERACHY}
            changedata={state.renderdata}
            data2texture={null}
            data3texture={null}
            materialtype={STATEPROPS.materialname}
            whatchanged={state.whatchange} dataselection={0}
            onClick={handleModelClick}
            activeDataTable={0}
            //resetSelectionFromTree={resetSelectionFromTree}
          />
        }
       {/*  {
          (isLoading || isFileLoading) && <CircularProgress />
        } */}

      </Paper>
      <TableOrderView
        title={alerter===""?'Order of Assembly':alerter}
        alerter={alerter}
        list={filteredList}
        columns={columns}
        setColumns={setColumns}
        additionalSaveFunction={additionalSaveFunction}
        handleDataRowClick={addSelectionFromTable}
        handleDataCellChange={updateSelectionFromTable}  
        saveDataTable={saveSelectionFromTable} 
        resetDataTable={resetSelectionFromTable} 
        fetchDataTable={fetchSelectionFromTable} 
        updateOrderChange={updateOrderFromTable}
        style={{ width: 750 }}
      >
      </TableOrderView>

    </Paper>

  );
}