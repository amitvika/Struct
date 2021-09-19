import React, { useState, useEffect } from 'react';
import {
  Paper,
  CircularProgress,
  makeStyles
} from "@material-ui/core";
//import Link from '@material-ui/core/Link';
import { Spinner } from "reactstrap";
import TableOrderView from './TableOrderView';
import GLTFRenderer from '@ravibasil/common/gltf/GltfRenderer.js';
import {
  SELECTBACKCOLOR, SELECTSELECTCOLOR, SELECTTOUCHCOLOR,
  DEFAULTBACKCOLOR, DEFAULTSELECTCOLOR, DEFAULTTOUCHCOLOR,
  getTexture, SELECT2DTEXTURE, SELECT3DTEXTURE,
  SELECTMATERIRAL, SELECTDISTANCE, SELECTSHOWINFO,
  SELECTSOLID, SELECTFACE, SELECTEDGE, SELECTCORNER, SELECTMEASURE,
  SELECTCONTINOUS, SELECTHIRERACHY, SELECTDISECTPARTS, SELECTSTACKABLE,
  SELECTORDER, SELECTASSEMBLY, SELECTFEATURE, prettyPrintArray, gltf_Dict
} from "@ravibasil/common/gltf/Tree/utils";
import { getAFileFromStore,saveTreeInfo,getPartsAssemblyOrder } from '@ravibasil/common/api/fileUpload.api';
import '../../style.css';


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
let state_selectedObjects = [];
//let reSetMe = true;
//let filteredList = [];
export default function ManufacturabilityAnalysis(props) {
  const { fileId, gltfjson, isLoading, itemProperties } = props;
  //const [list, setList] = useState([]);
  const [isFileLoading, setIsLoading] = useState(isLoading);
  const [firstTimeLoading,setFirstTimeLoading]=useState(false);
  //const [filteredList, setFilteredList] = useState([]);
  const [selectedOption, setSelectedOption] = useState(SELECTFEATURE);
  const [resetOption, setResetOption] = useState(true);
  const classes = useStyles();
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

  const arrayFindIndex = (arr, value, parent = false) => {

    return arr.findIndex(function (ele) {
      if (parent) return ele.parent[gltf_Dict["name"]] == value;
      return ele[gltf_Dict["name"]] == value;
    });
  }

  const arrayRemove = (arr, value, parent = false) => {

    return arr.filter(function (ele) {
      if (parent) return ele.parent[gltf_Dict["name"]] != value;
      return ele[gltf_Dict["name"]] != value;
    });
  }
  const arrayCopy = (arr) => {
    var copy_selectobjects = [];

    arr.forEach(element => {
      copy_selectobjects.push(element);
    });
    return copy_selectobjects;
  }
  const findSingleNode = (mynode) => {
    return [[mynode], mynode];
  }

  const findMyParentPart = (mynode) => {
    var myParentID = -1;

    for (var i = 0; i < state.gltfjson.tree.length; i++) {
      if (state.gltfjson.tree[i][gltf_Dict["name"]] == mynode[gltf_Dict["name"]]) {
        myParentID = state.gltfjson.tree[i][gltf_Dict["parentId"]];
        if (state.gltfjson.tree[i][gltf_Dict["element"]] == "P") {
          return state.gltfjson.tree[i];
        } else {
          break;
        }
      }
    }

    if (myParentID == -1) {
      return null;
    } else {
      var myParentsParentID = -1;
      for (var i = 0; i < state.gltfjson.tree.length; i++) {
        if (state.gltfjson.tree[i][gltf_Dict["id"]] == myParentID) {
          myParentsParentID = state.gltfjson.tree[i][gltf_Dict["parentId"]];
          if (state.gltfjson.tree[i][gltf_Dict["element"]] == "P") {
            return state.gltfjson.tree[i];
          } else {
            break;
          }
        }
      }
      //console.log("Parent", myParentsParentID, myParentID, myID);          
      if (myParentsParentID == -1) { //RootNode
        //console.log("Pushing", myParentsParentID, myParentID, myID);
        return null;
      } else {
        for (var i = 0; i < state.gltfjson.tree.length; i++) {
          if ((state.gltfjson.tree[i][gltf_Dict["id"]] == myParentsParentID)) {
            if (state.gltfjson.tree[i][gltf_Dict["element"]] == "P") {
              return state.gltfjson.tree[i];
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

    if (myMaterials.length != 0) {
      return [myMaterials, myParentNode];
    }
    return [[mynode], mynode];
  }


  const findFamilyNodes = (mynode) => {
    var myParentID = -1;
    var myID = -1;
    var parentNode = null;


    for (var i = 0; i < state.gltfjson.tree.length; i++) {
      if (state.gltfjson.tree[i][gltf_Dict["name"]] == mynode[gltf_Dict["name"]]) {
        myParentID = state.gltfjson.tree[i][gltf_Dict["parentId"]];
        myID = state.gltfjson.tree[i][gltf_Dict["id"]];
        parentNode = state.gltfjson.tree[i];
        break;
      }
    }
    const myParentPart = findMyParentPart(mynode);
    if (myParentPart) {
      parentNode = myParentPart;
      myParentID = parentNode[gltf_Dict["id"]];
    }
    //console.log(myParentID, parentNode);
    var myMaterials = [];
    if (myParentID != -1) {
      var myParentsParentID = -1;
      for (var i = 0; i < state.gltfjson.tree.length; i++) {
        if (state.gltfjson.tree[i][gltf_Dict["id"]] == myParentID) {
          myParentsParentID = state.gltfjson.tree[i][gltf_Dict["parentId"]];
          parentNode = state.gltfjson.tree[i];
          break;
        }
      }
      //console.log(myParentID, myParentsParentID, parentNode);
      var myParents = [];
      if (myParentsParentID == -1) { //RootNode
        myParents.push(myID);
      } else {
        for (var i = 0; i < state.gltfjson.tree.length; i++) {
          if (state.gltfjson.tree[i][gltf_Dict["parentId"]] == myParentsParentID) {
            myParents.push(state.gltfjson.tree[i][gltf_Dict["id"]]);
          } else {
            if (state.gltfjson.tree[i][gltf_Dict["id"]] == myParentsParentID) {
              parentNode = state.gltfjson.tree[i];
            }
          }
        }
      }
      for (var j = 0; j < myParents.length; j++) {
        myParentID = myParents[j];
        for (var i = 0; i < state.gltfjson.tree.length; i++) {
          if (state.gltfjson.tree[i][gltf_Dict["id"]] == myParentID) {
            var myChild = state.gltfjson.tree[i];
            if (myChild) {
              if ((state.gltfjson.tree[i][gltf_Dict["element"]] == "P") ||
                onlyparts(myChild[gltf_Dict["name"]])) {
                myMaterials.push(myChild);
              }
            }
          }
        }
      }

    }
    if (myMaterials.length != 0) {

      return [myMaterials, parentNode];
    }

    return [[mynode], mynode]

  }

  const findMyParentChilds = (mynode, whichOption) => {
    //console.log(this.props.selectedoption,SELECTSOLID,this.props.selectedoption != SELECTSOLID);
    if ((((whichOption != SELECTSOLID) && (whichOption != SELECTASSEMBLY)) ||
      (state.splitMethod != SELECTDISECTPARTS)) && resetOption) {
      //console.log("I got over Singles",whichOption,resetOption,state.splitMethod);
      return findSingleNode(mynode);
    }
    if (whichOption == SELECTASSEMBLY) {
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
    if (state.gltfjson.tree) {
      for (var i = 0; i < state.gltfjson.tree.length; i++) {
        //console.log(state.gltfjson.tree[i]);
        if (state.gltfjson.tree[i][gltf_Dict["name"]] == data["name"]) {
          return state.gltfjson.tree[i];
        }
      }
    };
    return null;
  }

  const onlyfaces = (name) => {

    const first4chars = name.slice(0, 4);
    const first6chars = name.slice(0, 6);
    if ((first4chars == "PART") || (first4chars == "EDGE") || (first6chars == "VERTEX")) {
      return false;
    }
    return true;
  }

  const onlyparts = (name) => {

    const first4chars = name.slice(0, 4);
    return first4chars == "PART";

  }
  let mapdata = {}
  const setSelectedShell = (data, setoption) => {
    if (data.selectedshell != setoption) {
      data.selectedshell = setoption;
      const myID = data[gltf_Dict['id']];
      let curData = mapdata[myID];
      if (typeof (curData) === "undefined") {
        for (let index = 0; index < state.gltfjson.tree.length; index++) {

          const element = state.gltfjson.tree[index];
          //console.log("compare",element,data);
          if (element[[gltf_Dict['id']]] == myID) {
            curData = index;
            mapdata[myID] = index;
            break;
          }

        }
      }
      if (typeof (curData) !== "undefined") {
        let myTree = { ...state.gltfjson };
        myTree.tree[curData] = data;
        console.log("Going to Set", myTree, data, curData);
        setState({ gltfjson: myTree });
        console.log("Finally Setting", myTree, data, curData, state.gltfjson);
        getTable(myTree,true);
      } else {
        console.log("unable to find info", data, myID, curData, state.gltfjson.tree.length)
      }
    }

  };
  const setSelectedShellForce = (data, setoption) => {

    data.selectedshell = setoption;
    const myID = data[gltf_Dict['id']];
    let curData = mapdata[myID];
    if (typeof (curData) === "undefined") {
      for (let index = 0; index < state.gltfjson.tree.length; index++) {

        const element = state.gltfjson.tree[index];
        //console.log("compare",element,data);
        if (element[[gltf_Dict['id']]] == myID) {
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
        element.selectedshell = (index == curData) && setoption;
      }
      console.log("About to set", myTree);
      setState({ gltfjson: myTree });
      console.log("Setting", myTree, data, curData, state.gltfjson);
      getTable(myTree,true);
    } else {
      console.log("unable to find info", data, myID, curData, state.gltfjson.tree.length)
    }


  };
  
  const doOneSelection = (element, event) => {
    console.log("Starting", element);
    if(element) {
      const aShape = element[gltf_Dict['name']];
      if(aShape) {
        const first4chars = aShape.slice(0, 4);
        const first6chars = aShape.slice(0, 6);
        if ((first4chars == "FACE") || (first4chars == "EDGE") ||
          (first4chars == "PART") || (first6chars == "VERTEX")) {
          console.log("Setting..", element);
          element.selectedshell = true;
          setSelectedShell(element, true);
    
          console.log("Setting..Done", element);
          const mymesh = element; //findMyMaterial(element);                       
          console.log("Before", mymesh);
          if (mymesh) {
            mymesh.selectedshell = true;
            //setSelectedShellForce(mymesh,true);                
            changeStateOfSelection(mymesh, event);
            if (event) {
              event['ctrlKey'] = true;
            }
          }
          console.log("aftet", mymesh);    
    
        }
      }
      
    }
    
  }

  const addSelectionFromTree = async (selectedNodes, event) => {

    console.log("Selected Node", selectedNodes, "Event", event);
    setFirstTimeLoading(true);
    if (selectedNodes?.index) {
      const myTree = findMyMaterial(selectedNodes);
      console.log(myTree);
      if (myTree) {
        //myTree.selectedshell = true;
        if (event && (event.ctrlKey != ctrlKey)) {
          setCtrlKey(event.ctrlKey);
        }
        setState({ renderdata: [myTree], whatchange: SELECTDISTANCE });
        doOneSelection(myTree, event);
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
  const resetSelectionFromTree = async () => {
    if ((state.whatchange != 0) || state.renderdata != []) {
      setState({ whatchange: 0, renderdata: [] });
    }
  };

  const changeStateOfSelection = async (data, event) => {
    mapdata = {}
    //console.log("Data for shapeinfo",data,selectedOption,event);


    //console.log("outside SELECTMEASURE",data);
    var copy_selectobjects = [];

    if (data) {
      console.log(data);
      var toAdd = true;
      var toGetInfo = false;
      if (event) {
        toAdd = event.ctrlKey;
      }
      if (event && (event.ctrlKey != ctrlKey)) {
        console.log("my Control key", event.ctrlKey, ctrlKey);
        setCtrlKey(event.ctrlKey);
        console.log("Set Ctrk Key");
      }

      
      var stateLength = 0;
      if (!toAdd) {
        console.log("Not to add", data, state_selectedObjects);
        state_selectedObjects.forEach(element => {
          if (data[gltf_Dict["name"]] != element[gltf_Dict["name"]]) {
            console.log("before set sel", element);
            element.selectedshell = false;
            setSelectedShell(element, false);
            console.log("after set sel", element);
          }
        });
        stateLength = 0;
        copy_selectobjects = [];
      } else {
        console.log("Add me here", state_selectedObjects);
        copy_selectobjects = arrayCopy(state_selectedObjects);
        stateLength = state_selectedObjects.length;
      }
      //console.log(data);
      const myAllChildsAndParents = findMyParentChilds(data, selectedOption);
      //console.log(myAllChildsAndParents);
      const myAllChilds = myAllChildsAndParents[0];
      const myParentNode = myAllChildsAndParents[1];

      //console.log("Splitted",myAllChilds,myParentNode)
      for (let elementdata of myAllChilds) {
        console.log("Before", elementdata);
        elementdata.selectedshell = data.selectedshell;
        setSelectedShell(elementdata, data.selectedshell);
        console.log("After", elementdata, state.gltfjson.tree);
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
              //copy_mateobjects.push([]);
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
              //copy_mateobjects.splice(currentIndex, 1);
              //console.log("After Splicing",copy_mateobjects,currentIndex, copy_mateobjects.length);
              /* for (let mateindex = currentIndex; mateindex < copy_mateobjects.length; mateindex++) {
                  copy_mateobjects[mateindex].splice(currentIndex, 1);
              } */
              //console.log('1 : ', copy_selectobjects, copy_mateobjects);
            }

            //setState({ selectedObjects: copy_selectobjects });
          }
        } else {
          if (data.selectedshell) {
            //const copydata = await getShapeInformation(elementdata);
            console.log('awaiting', elementdata);
            copy_selectobjects.push(elementdata);
            setSelectedShellForce(elementdata, data.selectedshell);
            //copy_mateobjects.push([]);
            toGetInfo = true;
            //setState({ selectedObjects: myAllChilds });
          } else {
            copy_selectobjects = [];
            //setState({ selectedObjects: [] });
          }

        }
      };
      console.log("Here setting table completed", copy_selectobjects);
      state_selectedObjects = arrayCopy(copy_selectobjects);
      //reSetMe = true;
      //resetSelectionFromTree();
      /*  setState({
           selectedObjects: copy_selectobjects,
           //mates: copy_mateobjects
       });  */

    } else {
      state_selectedObjects.forEach(element => {
        
        console.log("before set sel", element);
        element.selectedshell = false;
        setSelectedShellForce(element, false);
        console.log("after set sel", element);
       
      });
      state_selectedObjects = arrayCopy(copy_selectobjects);
    }
    //setResetMe(true);
    //getTable(state.gltfjson);
    console.log("Before my state tree", state.gltfjson.tree, state_selectedObjects);
    state_selectedObjects.forEach(element => {
      setSelectedShellForce(element, element.selectedshell);
    });
    console.log("Finally my state tree", state.gltfjson.tree, state_selectedObjects);
  }

  const handleModelClick = (data, what, event) => {
    console.log(data, what, event);
    setFirstTimeLoading(true);
    if (what == SELECTDISTANCE) {
      if(data) {
        console.log(data);
        const mymesh = findMyMaterial(data);
        if (mymesh) {
          mymesh.selectedshell = data.selectedshell;
          setSelectedShell(mymesh, data.selectedshell);
          console.log("Doing mymesh", mymesh, state_selectedObjects);
          return changeStateOfSelection(mymesh, event);
        } else {
          console.log("No Mesh", mymesh, data);
        }
      } else {
        console.log("Resetting",data);
        return changeStateOfSelection(data, event);
      }
      if (event && (event.ctrlKey != ctrlKey)) {
        //console.log(event.ctrlKey);
        setCtrlKey(ctrlKey, event.ctrlKey);
      }
    }
    return null;
  }
  const updateSelectionFromTable = async (rowIndex, columnIndex, dataRow, value) => {
    setFirstTimeLoading(true);
    console.log("Changed cell", rowIndex, columnIndex, dataRow, value);
    if (!state.gltfjson) {
      setState({gltfjson:this.props.gltfjson})
    }   
    var myTree=null;
    if(state.gltfjson) {
      console.log("My json",state.gltfjson);
      if(dataRow) {
        console.log(dataRow);
        const myTree = findMyMaterial(dataRow);
        if (myTree) {
          myTree.selectedshell = true;
          dataRow.selectedshell = true;
          myTree[columns[columnIndex].dataKey]=value;
          setSelectedShellForce(myTree, true);
          setState({ renderdata: [myTree], whatchange: SELECTDISTANCE });
          let event={};
          event['ctrlKey']=false;
          doOneSelection(myTree, event);
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
    if (!state.gltfjson) {
      setState({gltfjson:this.props.gltfjson})
    }
    if(state.gltfjson) {
      myJsonTree = state.gltfjson.tree;
    } else {
      myJsonTree = this?.props?.gltfjson?.tree;
    }
    if(myJsonTree) {
      var gltfjsonParam = state.gltfjson;
      for (let index = 2; index < gltfjsonParam.tree.length; index++) {
        gltfjsonParam.tree[index]=mydata[index-2];        
      }
      console.log("Saving", gltfjsonParam.tree,itemProperties.fileMPPS);
      saveTreeInfo( gltfjsonParam.tree,itemProperties.fileMPPS)
      .then(res => res.data)
      .then((data) => { 
        console.log("Getting Resources",data);
        getAFileFromStore(itemProperties.fileMPPS,"gltf")
        .then(res => res.data)
        .then((data) => {
          const gltfobj = data;
          getAFileFromStore(itemProperties.fileMPPS,"tree")
          .then(res => res.data)
          .then((data) => {
            const curTree = data;
            getAFileFromStore(itemProperties.fileMPPS,"order")
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
              getTable(mygltfjson,true);     
            });              
          });
        });
      });
    }

  };

  const resetSelectionFromTable = async () => {
    var myJsonTree;
    setFirstTimeLoading(true);
    if (!state.gltfjson) {
      setState({gltfjson:this.props.gltfjson})
    }
    if(state.gltfjson) {
      myJsonTree = state.gltfjson.tree;
    } else {
      myJsonTree = this?.props?.gltfjson?.tree;
    }
    if(myJsonTree) {
      console.log("Saving",myJsonTree,itemProperties.fileMPPS);
      getPartsAssemblyOrder(itemProperties.fileId, stateprops.distancegap, stateprops.anglegap, stateprops.explodegap, 
        stateprops.fromcenter,stateprops.holescale,stateprops.removegap,stateprops.animationtime)
        .then(res => res.data)
        .then((data) => {      
          console.log("Getting Resources",data);
          getAFileFromStore(itemProperties.fileMPPS,"gltf")
          .then(res => res.data)
          .then((data) => {
            const gltfobj = data;
            getAFileFromStore(itemProperties.fileMPPS,"tree")
            .then(res => res.data)
            .then((data) => {
              const curTree = data;              
              getAFileFromStore(itemProperties.fileMPPS,"order")
              .then(res => res.data)
              .then((data) => {
                const curOrder = data;
                var mygltfjson = state.gltfjson;
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
    if (!state.gltfjson) {
      setState({gltfjson:this.props.gltfjson})
    }
    if(state.gltfjson) {
      myJsonTree = state.gltfjson.tree;
    } else {
      myJsonTree = this?.props?.gltfjson?.tree;
    }
    if(myJsonTree) {
      console.log("Saving",myJsonTree,itemProperties.fileMPPS);
      
        getAFileFromStore(itemProperties.fileMPPS,"gltf")
        .then(res => res.data)
        .then((data) => {
          const gltfobj = data;
          getAFileFromStore(itemProperties.fileMPPS,"tree")
          .then(res => res.data)
          .then((data) => {
            const curTree = data;
            getAFileFromStore(itemProperties.fileMPPS,"order")
            .then(res => res.data)
            .then((data) => {
              const curOrder = data;
              var mygltfjson = state.gltfjson;
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
    if (!state.gltfjson) {
      setState({gltfjson:this.props.gltfjson})
    }
    if(state.gltfjson) {
      myJsonTree = state.gltfjson.tree;
    } else {
      myJsonTree = this?.props?.gltfjson?.tree;
    }
    if(myJsonTree) {
      var gltfjsonParam = state.gltfjson;
      for (let index = 2; index < gltfjsonParam.tree.length; index++) {
        gltfjsonParam.tree[index]=mydata[index-2];
        gltfjsonParam.tree[index].selectedshell=((index-2)==newIndex);
      }
      setState({gltfjson:gltfjsonParam});
      
      
    }

  };

  const getDirection = (direction) => {
    const x=direction[0];
    const y=direction[1];
    const z=direction[2];
    if(z==1) {
      return "Top";
    }
    if(z==-1) {
      return "Bottom";
    }    
    if(y==1) {
      return "Right";
    }
    if(y==-1) {
      return "Left";
    }
    if(x==1) {
      return "Back";
    }
    if(x==-1) {
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
        if(firstTimeLoading==false && doupdate==false) {
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
        if(currentData[index].AX != gltfjsonParam.assemblyorder.direction[index][0][0] || 
           currentData[index].AY != gltfjsonParam.assemblyorder.direction[index][0][1] ||
           currentData[index].AZ != gltfjsonParam.assemblyorder.direction[index][0][2] 
          ) {
          currentData[index].AX = gltfjsonParam.assemblyorder.direction[index][0][0];
          currentData[index].AY = gltfjsonParam.assemblyorder.direction[index][0][1];
          currentData[index].AZ = gltfjsonParam.assemblyorder.direction[index][0][2];
          currentData[index].CX = gltfjsonParam.assemblyorder.direction[index][1][0];
          currentData[index].CY = gltfjsonParam.assemblyorder.direction[index][1][1];
          currentData[index].CZ = gltfjsonParam.assemblyorder.direction[index][1][2];
          currentData[index].CW = gltfjsonParam.assemblyorder.direction[index][1][3];
          if (gltfjsonParam.assemblyorder.complete==gltfjsonParam.assemblyorder.order.length) {
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
          if (gltfjsonParam.assemblyorder.complete==gltfjsonParam.assemblyorder.order.length) {
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
        if (gltfjsonParam.assemblyorder.complete!=gltfjsonParam.assemblyorder.order.length) {
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
        if(alerter!="") {
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
      if(alerter!="") {
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
    setIsLoading(isLoading);
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
        activefile: fileId.toString() + includeParts.toString() +
          stateprops.distancegap.toString() + stateprops.anglegap.toString() + gltfjsonlen.toString(),
        gltfjson: gltfjson,
        dataselection: 0,
        firstshell: null,
        secondshell: null,
        materialname: stateprops.materialtype[0].name,
        disectstruct: stateprops.disect,
        showdisect: stateprops.showdisect,
        showinfoonselect: stateprops.showinfoonselect,
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

  if (isLoading) {
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
        {
          !isLoading && Object.keys(state.gltfjson).length > 0 && !isFileLoading &&
          <GLTFRenderer
            //gltfjson={JSON.stringify(gltfjson)}
            gltfobj={state.gltfjson}
            fileGDT={null}
            fileAnimation={true}
            //view="Perspective"
            activefile={fileId + gltfjsonlen.toString()}
            backcolor={DEFAULTBACKCOLOR}
            selectcolor={DEFAULTSELECTCOLOR}
            touchcolor={DEFAULTTOUCHCOLOR}
            selectedoption={SELECTFEATURE}
            splitmethod={SELECTHIRERACHY}
            changedata={state.renderdata}
            data2texture={null}
            data3texture={null}
            materialtype={DEFAULTMATERIALNAME}
            whatchanged={state.whatchange} dataselection={0}
            onClick={handleModelClick}
          //resetSelectionFromTree={resetSelectionFromTree}
          />
        }
        {
          (isLoading || isFileLoading) && <CircularProgress />
        }

      </Paper>
      <TableOrderView
        title={alerter==""?'Order of Assembly':alerter}
        alerter={alerter}
        list={filteredList}
        columns={columns}
        setColumns={setColumns}
        handleDataRowClick={addSelectionFromTree}
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
