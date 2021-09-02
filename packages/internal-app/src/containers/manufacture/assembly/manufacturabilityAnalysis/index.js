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

import '../../style.css';

const DEFAULTDISTANCEGAP = 0.1;
const DEFAULTANGLEGAP = 0.5;
const DEFAULTEXPLODEGAP = 10;
const DEFAULTFROMCENTER = true;
const DEFAULTDISECT = false;
const DEFAULTSHOWDISECT = false;
const DEFAULTSHOWINFOONSELECT = false;
const DEFAULTMATERIALNAME = "Basic";
const DEFAULTMATERIALTYPE = [{ "id": 1, "name": DEFAULTMATERIALNAME }];

const stateprops = {
  distancegap: DEFAULTDISTANCEGAP,
  anglegap: DEFAULTANGLEGAP,
  explodegap: DEFAULTEXPLODEGAP,
  disect: DEFAULTDISECT,
  showdisect: DEFAULTSHOWDISECT,
  showinfoonselect: DEFAULTSHOWINFOONSELECT,
  materialtype: DEFAULTMATERIALTYPE,
  fromcenter: DEFAULTFROMCENTER
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
  const { fileId, gltfjson, isLoading } = props;
  const [list, setList] = useState([]);
  const [isFileLoading, setIsLoading] = useState(isLoading);
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
  ]) */
  const [columns, setColumns] = useState([
    { label: 'Insertion Order', dataKey: 'order', numeric: true, align:"right",editable: "never", width: 90 },
    { label: 'Mate Name', dataKey: 'name', editable: "never", numeric: false, align:"left", width: 200, 'word-break': 'break-all' },
    { label: 'Insertion Direction', dataKey: 'direction', editable: "never", numeric: false, align:"right", width: 90 },   
    { label: 'Insertion Type', dataKey: 'insert', numeric: false, align:"left",  editable: "never", width: 90 },
    { label: 'Dispensing', dataKey: 'dispense', numeric: true,  align:"right", type: 'numeric', width: 90 },
    { label: 'Transfer Holding', dataKey: 'quantity', numeric: true, align:"right", type: 'numeric', width: 90 },
  ])

  const [state, _setState] = useState({});
  const [ctrlKey, setCtrlKey] = useState(false);
  const [filteredList, setFilteredList] = useState([]);


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
        getTable(myTree);
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
        element.selectedshell = (index == curData);
      }
      console.log("About to set", myTree);
      setState({ gltfjson: myTree });
      console.log("Setting", myTree, data, curData, state.gltfjson);
      getTable(myTree);
    } else {
      console.log("unable to find info", data, myID, curData, state.gltfjson.tree.length)
    }


  };
  const doOneSelection = (element, event) => {
    console.log("Starting", element);
    const aShape = element[gltf_Dict['name']];
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

  const addSelectionFromTree = async (selectedNodes, event) => {

    console.log("Selected Node", selectedNodes, "Event", event);
    if (selectedNodes?.index) {
      const myTree = { ...state.gltfjson.tree[selectedNodes.index + 1] };
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

      var copy_selectobjects = [];

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

    }
    //setResetMe(true);
    //getTable(state.gltfjson);
    console.log("Finally my state tree", state.gltfjson.tree, state_selectedObjects);
  }

  const handleModelClick = (data, what, event) => {
    console.log(data, what, event);
    if (what == SELECTDISTANCE) {
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

      if (event && (event.ctrlKey != ctrlKey)) {
        //console.log(event.ctrlKey);
        setCtrlKey(ctrlKey, event.ctrlKey);
      }
    }
    return null;
  }
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
    if(x==1) {
      return "Back";
    }
    if(x==-1) {
      return "Front";
    }
    if(y==1) {
      return "Right";
    }
    if(y==-1) {
      return "Left";
    }
    console.log("Direction",direction);
    return direction;
  }
  const getTable = (gltfjson) => {
    let currentData = [];
    if (gltfjson && gltfjson.tree && gltfjson.assemblyorder) {
      if (gltfjson.assemblyorder.order) {
        console.log("Setting table", gltfjson.tree, gltfjson.assemblyorder);
      } else {
        alert("Assembly order structure changed. Please reload the step file once again");
        return;
      }
     
      for (let index = 2; index < gltfjson.tree.length; index++) {
        const element = gltfjson.tree[index];
        //console.log(element);
        currentData.push({
          ...element,
          'index': index - 1,
          'name': element[gltf_Dict['name']],
          'order': null,
          'direction':null,
          'insert': "Sliding",
          'dispense': null,
          'quantity': null
        });

      }
      for (let index = 0; index < gltfjson.assemblyorder.order.length; index++) {
        currentData[index].direction = getDirection(gltfjson.assemblyorder.direction[index]);
        const element = gltfjson.assemblyorder.order[index];
        currentData[element].order = index + 1;        
        
      }
      console.log("About to set Featured List", currentData);
      setFilteredList(currentData);
      console.log("Setting Featured List", currentData, filteredList);

    } else {
      console.log("Going to set Featured List", currentData);
      setFilteredList(currentData);
      console.log("Final Setting Featured List", currentData, filteredList);
    }
    //return currentData;
  }
  useEffect(() => {
    setIsLoading(isLoading);
  }, [isLoading]);
  useEffect(() => {
    const includeParts = true;
    console.log("Reaching", gltfjson, fileId, isLoading);
    let gltfjsonlen = Object.keys(gltfjson).length;
    if (gltfjsonlen > 0) {
      gltfjsonlen += gltfjson?.gltf?.accessors?.length;
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
      getTable(gltfjson);
      //setResetMe(true);
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
  let gltfjsonlen = Object.keys(gltfjson).length;
  if (gltfjsonlen > 0) {
    gltfjsonlen += gltfjson?.gltf?.accessors?.length;
  }

  return (
    <Paper className={classes.mainContainer}>
      <Paper className={classes.viewerContainer} square={true}>
        {
          !isLoading && Object.keys(gltfjson).length > 0 && !isFileLoading &&
          <GLTFRenderer
            //gltfjson={JSON.stringify(gltfjson)}
            gltfobj={gltfjson}
            fileGDT={null}
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
        title={'Order of Assembly'}
        list={filteredList}
        columns={columns}
        setColumns={setColumns}
        handleDataRowClick={addSelectionFromTree}
        style={{ width: 720 }}
      >
      </TableOrderView>

    </Paper>

  );
}
