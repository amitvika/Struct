import React, { useState, useEffect } from 'react';
import { Paper } from '@material-ui/core';
import Viewer from './Viewer';
import ViewerToolbar from './ViewerToolbar';
import {
  getShapeInfo,
  saveGDTInfo
} from '@monostruct/common/api/fileUpload.api';
import {
  SELECTDISTANCE,
  SELECTSOLID,
  SELECTFACE,
  SELECTEDGE,
  SELECTCORNER,
  SELECTMEASURE,
  SELECTASSEMBLY,
  SELECTFEATURE,
  SELECTHIRERACHY,
  SELECTDISECTPARTS,
  STATEPROPS,
  USESTYLES,
  defaultGDTTable,
  arrayCopy,
  arrayFindIndex,
  arrayRemove,
  gltf_Dict
} from '@monostruct/common/gltf/Tree/utils';
import Assembly from '../assembly';

let myGlobalTree = null;
let myGlobalState = {};
let myGlobalActiveDataTable = 0;

export default function GeometricDimensioning(props) {
  const {
    tabIndex,
    fileId,
    fileUUId,
    fileGDT,
    gltfjson,
    isLoading,
    progressBarLoad,
    percentage,
    currentProgressText,
    completionProgressText,
    drawLine,
    internalProductConfig,
    keyName = { name: '', option: SELECTFEATURE },
    handleChangeOfSelection = (selectedObjects) => {
      console.log('handleChangeOfSelection', selectedObjects);
    },
    additionalSaveFunction = (saveObjects) => {
      console.log('additionalSaveFunction', saveObjects);
    }
  } = props;
  const classes = USESTYLES();

  const [state, _setState] = useState({});
  // const [isLoading, setIsLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState(SELECTFEATURE);
  //const [splitFiles, setSplitfiles] = useState({});
  const [resetOption, setResetOption] = useState(true);
  const [value, setValue] = React.useState('female');
  const [ctrlKey, setCtrlKey] = useState(false);
  const [optionForAssemblyTree, setOptionForAssemblyTree] =
    useState('Configuration');
  const [activeDataTable, setActiveDataTable] = useState(0);
  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const [progressOpenedFiles, setProgressOpenedFiles] = useState([]);
  const [percentager, setPercentager] = useState(percentage || 0);
  const [progressBarLoader, setProgressBarLoader] = useState(progressBarLoad);
  const [currentProgressTexter, setCurrentProgressTexter] =
    useState(currentProgressText);
  const [completionProgressTexter, setCompletionProgressTexter] = useState(
    completionProgressText
  );
  const [drawLiner, setDrawLiner] = useState(drawLine);
  const [fileUUIder, setfileUUIder] = useState(fileUUId);
  useEffect(() => {
    if (fileUUId) {
      setfileUUIder(fileUUId);
      console.log(
        'Changing fileUUId from Geometric Dimensioning',
        fileUUIder,
        fileUUId
      );
    }
  }, [fileUUId]);
  useEffect(() => {
    setProgressBarLoader(progressBarLoad);
    console.log(
      'Changing progress bar from Geometric Dimensioning',
      progressBarLoad,
      fileUUIder,
      fileUUId,
      fileId,
      fileGDT,
      props
    );
  }, [progressBarLoad]);
  useEffect(() => {
    setCurrentProgressTexter(currentProgressText);
    console.log(
      'Changing currentProgressText bar from Geometric Dimensioning',
      progressBarLoad,
      fileUUIder,
      fileUUId,
      fileId,
      fileGDT,
      props
    );
  }, [currentProgressText]);
  useEffect(() => {
    setCompletionProgressTexter(completionProgressText);
    console.log(
      'Changing completionProgressText bar from Geometric Dimensioning',
      progressBarLoad,
      fileUUIder,
      fileUUId,
      fileId,
      fileGDT,
      props
    );
  }, [completionProgressText]);
  useEffect(() => {
    if (percentage) {
      setPercentager(percentage);
      console.log(
        'Changing percentage from Geometric Dimensioning',
        percentage,
        fileUUIder,
        fileUUId,
        fileId,
        fileGDT,
        props
      );
    }
  }, [percentage]);
  useEffect(() => {
    setDrawLiner(drawLine);
  }, [drawLine]);
  useEffect(() => {
    const includeParts = true;
    //console.log("Reaching",gltfjson,fileId,isLoading);
    const gltfjsonlen = Object.keys(gltfjson).length;
    if (gltfjsonlen > 0) {
      setState({
        selectedindex: 0,
        activefile:
          (fileId || fileUUIder || '').toString() +
          includeParts.toString() +
          STATEPROPS.distancegap.toString() +
          STATEPROPS.anglegap.toString() +
          gltfjsonlen.toString(),
        gltfjson: gltfjson,
        dataselection: 0,
        firstshell: null,
        secondshell: null,
        materialname: STATEPROPS.materialtype[0].name,
        materialtype: STATEPROPS.materialname,
        disectstruct: STATEPROPS.disect,
        showdisect: STATEPROPS.showdisect,
        showinfoonselect: STATEPROPS.showinfoonselect,
        splitMethod: includeParts ? SELECTDISECTPARTS : SELECTHIRERACHY,
        selectedObjects: gltfjson
          ? gltfjson.gdttable
            ? gltfjson.gdttable[myGlobalActiveDataTable]
              ? gltfjson.gdttable[myGlobalActiveDataTable].selectedObjects
              : []
            : []
          : [],
        parentObjects: gltfjson
          ? gltfjson.gdttable
            ? gltfjson.gdttable[myGlobalActiveDataTable]
              ? gltfjson.gdttable[myGlobalActiveDataTable].parentObjects
              : []
            : []
          : [],
        mates: gltfjson
          ? gltfjson.gdttable
            ? gltfjson.gdttable[myGlobalActiveDataTable]
              ? gltfjson.gdttable[myGlobalActiveDataTable].mates
              : []
            : []
          : [],
        mateValues: gltfjson
          ? gltfjson.gdttable
            ? gltfjson.gdttable[myGlobalActiveDataTable]
              ? gltfjson.gdttable[myGlobalActiveDataTable].mateValues
              : Array(6).fill(false)
            : Array(6).fill(false)
          : Array(6).fill(false),
        angle: gltfjson
          ? gltfjson.gdttable
            ? gltfjson.gdttable[myGlobalActiveDataTable]
              ? gltfjson.gdttable[myGlobalActiveDataTable].angle
              : 0
            : 0
          : 0,
        offset: gltfjson
          ? gltfjson.gdttable
            ? gltfjson.gdttable[myGlobalActiveDataTable]
              ? gltfjson.gdttable[myGlobalActiveDataTable].offset
              : 0
            : 0
          : 0,
        renderdata: {},
        whatchange: 0
      });
      setSelectedOption(
        gltfjson
          ? gltfjson.gdttable
            ? gltfjson.gdttable[myGlobalActiveDataTable]
              ? gltfjson.gdttable[myGlobalActiveDataTable].option
              : SELECTFEATURE
            : SELECTFEATURE
          : SELECTFEATURE
      );
      myGlobalTree = null;
      let event = {};
      event['ctrlKey'] = false;
      if (
        gltfjson &&
        gltfjson.gdttable &&
        gltfjson.gdttable[myGlobalActiveDataTable] &&
        gltfjson.gdttable[myGlobalActiveDataTable].selectedObjects
      ) {
        gltfjson.gdttable[myGlobalActiveDataTable].selectedObjects.forEach(
          (element) => {
            console.log('What i got before reading', element);
            setSelectedShell({ ...element }, true);
            console.log('What i got after reading', element);
          }
        );
        console.log(gltfjson.gdttable);
        //setTreeLength(gltfjson.tree.length);
      }
      additionalSaveFunction(saveGDTDataTable);
    }
  }, [gltfjson]);

  useEffect(() => {
    if (tabIndex != 'gdtac' || keyName.name != '') {
      console.log('Setting key', keyName.name, keyName.option);
      setCurrentDataTableFromKey(keyName.name, keyName.option);
    } else {
      console.log('Not Setting key as I am from gdt', keyName.name);
    }
  }, [keyName]);

  const resetSelections = () => {
    if (state.secondshell) {
      setSelectedShell(state.secondshell, false);
    }
    if (state.firstshell) {
      setSelectedShell(state.firstshell, false);
    }
    const mystate = isEmptyObject(state) ? myGlobalState : state;
    const state_selectedObjects = mystate.selectedObjects
      ? [...mystate.selectedObjects]
      : [];
    state_selectedObjects.forEach((element) => {
      //element.selectedshell = false;
      setSelectedShell({ ...element }, false);
    });

    setState({
      firstshell: null,
      secondshell: null,
      selectedObjects: [],
      parentObjects: [],
      mates: []
    });
  };

  /*
  const defaultGDTTable = {
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
  const isEmptyObject = (obj) => {
    if (!obj) {
      return true;
    }
    return Object.keys(obj).length === 0;
  };

  const incrementActiveDataTable = (
    key = '',
    selectedFeature = SELECTFEATURE
  ) => {
    const mystate = isEmptyObject(state) ? myGlobalState : state;
    let mystate_gltfjson = mystate.gltfjson || gltfjson;
    if (!mystate_gltfjson || !mystate_gltfjson.tree) {
      setState({ gltfjson: gltfjson });
      mystate_gltfjson = gltfjson;
    }
    let myTree = { ...mystate_gltfjson };

    let gdttable = myTree.gdttable || [defaultGDTTable];

    myTree.gdttable = gdttable;
    if (myTree.gdttable[myGlobalActiveDataTable]) {
      myTree.gdttable[myGlobalActiveDataTable].selectedObjects =
        mystate.selectedObjects ? [...mystate.selectedObjects] : [];
      myTree.gdttable[myGlobalActiveDataTable].parentObjects =
        mystate.parentObjects ? [...mystate.parentObjects] : [];
      myTree.gdttable[myGlobalActiveDataTable].mates = mystate.mates
        ? [...mystate.mates]
        : [];
      myTree.gdttable[myGlobalActiveDataTable].option = selectedOption;
    }

    let activetable = myTree.gdttable.length;
    /* myTree.gdttable.push({  "edges":[],
                            "selectedObjects":[],
                            "parentObjects":[],
                            "mates":[],
                            "mateValues": Array(6).fill(false),
                            "angle":0,
                            "offset":0,
                            "option":SELECTFEATURE }); */
    myTree.gdttable.push({
      ...defaultGDTTable,
      key: key,
      option: selectedFeature
    });
    updateSelectionFromTree([], false, selectedFeature);
    setSelectedOption(selectedFeature);
    if (myTree.tree) {
      myTree.tree.length = myTree.treeLength;
    }
    setState({
      gltfjson: myTree,
      selectedObjects: [],
      parentObjects: [],
      mates: [],
      mateValues: Array(6).fill(false),
      angle: 0,
      offset: 0
    });
    console.log('Setting active table', activetable, 'with key', key);
    globalSetActiveDataTable(activetable);
  };
  const globalSetActiveDataTable = (activetable) => {
    setActiveDataTable(activetable);
    myGlobalActiveDataTable = activetable;
  };
  const setCurrentDataTableFromKey = (key, option) => {
    const mystate = isEmptyObject(state) ? myGlobalState : state;
    let mystate_gltfjson = mystate.gltfjson || gltfjson;
    if (!mystate_gltfjson || !mystate_gltfjson.tree) {
      setState({ gltfjson: gltfjson });
      mystate_gltfjson = gltfjson;
    }
    let myTree = { ...mystate_gltfjson };
    let gdttable = myTree.gdttable || [{ ...defaultGDTTable, option: option }];
    for (let index = 0; index < gdttable.length; index++) {
      const element = gdttable[index];
      if (element.key == key) {
        setCurrentDataTable(index, option);
        return;
      }
    }
    console.log('I am going to add from gdt', key);
    incrementActiveDataTable(key, option);
  };
  const setCurrentDataTable = (activetable, option = null) => {
    if (activetable != myGlobalActiveDataTable) {
      const mystate = isEmptyObject(state) ? myGlobalState : state;
      let mystate_gltfjson = mystate.gltfjson || gltfjson;
      if (!mystate_gltfjson || !mystate_gltfjson.tree) {
        setState({ gltfjson: gltfjson });
        mystate_gltfjson = gltfjson;
      }
      let myTree = { ...mystate_gltfjson };
      let myoption = option ? option : selectedOption;
      let gdttable = myTree.gdttable || [
        { ...defaultGDTTable, option: myoption }
      ];
      myTree.gdttable = gdttable;
      if (myTree.gdttable[myGlobalActiveDataTable]) {
        myTree.gdttable[myGlobalActiveDataTable].selectedObjects =
          mystate.selectedObjects ? [...mystate.selectedObjects] : [];
        myTree.gdttable[myGlobalActiveDataTable].parentObjects =
          mystate.parentObjects ? [...mystate.parentObjects] : [];
        myTree.gdttable[myGlobalActiveDataTable].mates = mystate.mates
          ? [...mystate.mates]
          : [];
        myTree.gdttable[myGlobalActiveDataTable].option = selectedOption;
        console.log('I am assigning state option', selectedOption, option);
        myTree.gdttable[myGlobalActiveDataTable].mateValues = mystate.mateValues
          ? [...mystate.mateValues]
          : Array(6).fill(false);
        myTree.gdttable[myGlobalActiveDataTable].angle = mystate.angle;
        myTree.gdttable[myGlobalActiveDataTable].offset = mystate.offset;
      } else {
        console.log('I am not assigning state option', selectedOption, option);
      }
      updateSelectionFromTree(
        myTree.gdttable[activetable].selectedObjects,
        false,
        myTree.gdttable[activetable].option
      );
      console.log(
        'Finally I am  assigning state option',
        myTree.gdttable[activetable].option,
        option,
        selectedOption
      );
      setSelectedOption(myTree.gdttable[activetable].option);
      setState({
        gltfjson: myTree,
        selectedObjects: myTree.gdttable[activetable].selectedObjects,
        parentObjects: myTree.gdttable[activetable].parentObjects,
        mates: myTree.gdttable[activetable].mates,
        mateValues: myTree.gdttable[activetable].mateValues,
        angle: myTree.gdttable[activetable].angle,
        offset: myTree.gdttable[activetable].offset
      });

      globalSetActiveDataTable(activetable);
    } else {
      console.log(
        'Current itself is mine',
        activetable,
        myGlobalActiveDataTable
      );
    }
  };

  const saveGDTDataTable = () => {
    console.log(
      'In saveGDTTable',
      myGlobalActiveDataTable,
      activeDataTable,
      state,
      state.selectedObjects,
      myGlobalState
    );
    const mystate = isEmptyObject(state) ? myGlobalState : state;
    let mystate_gltfjson = mystate.gltfjson || gltfjson;
    if (!mystate_gltfjson || !mystate_gltfjson.tree) {
      setState({ gltfjson: gltfjson });
      mystate_gltfjson = gltfjson;
    }
    let myTree = { ...mystate_gltfjson };
    let gdttable = myTree.gdttable || [defaultGDTTable];
    myTree.gdttable = gdttable;
    if(myTree.gdttable[myGlobalActiveDataTable]) {
      myTree.gdttable[myGlobalActiveDataTable].selectedObjects=mystate.selectedObjects?[...mystate.selectedObjects]:[];
      myTree.gdttable[myGlobalActiveDataTable].parentObjects=mystate.parentObjects?[...mystate.parentObjects]:[];
      myTree.gdttable[myGlobalActiveDataTable].mates=mystate.mates?[...mystate.mates]:[];
      myTree.gdttable[myGlobalActiveDataTable].option=selectedOption;  
      myTree.gdttable[myGlobalActiveDataTable].mateValues=mystate.mateValues?[...mystate.mateValues]:Array(6).fill(false);;
      myTree.gdttable[myGlobalActiveDataTable].angle=mystate.angle;
      myTree.gdttable[myGlobalActiveDataTable].offset=mystate.offset;  
    }
    setState({ gltfjson: myTree});  
    console.log("saving gdt info","tableg",gltfjson.gdttable,"tablet",myTree.gdttable,"filegdt",fileGDT);
    saveGDTInfo(myTree.gdttable,fileGDT,fileUUIder)
    .then(res => res.data)
    .then((data) => { 
      console.log("Getting Resources",data);
    });
  }
  const resetActiveDataTable = () => {
    const mystate = isEmptyObject(state) ? myGlobalState : state;
    let mystate_gltfjson = mystate.gltfjson || gltfjson;
    if (!mystate_gltfjson || !mystate_gltfjson.tree) {
      setState({ gltfjson: gltfjson });
      mystate_gltfjson = gltfjson;
    }
    let myTree = { ...mystate_gltfjson };
    let gdttable = myTree.gdttable || [defaultGDTTable];
    myTree.gdttable = gdttable;
    if (myTree.gdttable[myGlobalActiveDataTable]) {
      myTree.gdttable[myGlobalActiveDataTable].selectedObjects = [];
      myTree.gdttable[myGlobalActiveDataTable].parentObjects = [];
      myTree.gdttable[myGlobalActiveDataTable].mates = [];
      myTree.gdttable[myGlobalActiveDataTable].option = selectedOption;
      myTree.gdttable[myGlobalActiveDataTable].edges = [];
      myTree.gdttable[myGlobalActiveDataTable].mateValues =
        Array(6).fill(false);
      myTree.gdttable[myGlobalActiveDataTable].angle = 0;
      myTree.gdttable[myGlobalActiveDataTable].offset = 0;
    }
    updateSelectionFromTree([], false, selectedOption);
    if (myTree.tree) {
      myTree.tree.length = myTree.treeLength;
    }
    setState({
      gltfjson: myTree,
      selectedObjects: [],
      parentObjects: [],
      mates: [],
      mateValues: Array(6).fill(false),
      angle: 0,
      offset: 0
    });
    console.log('Resetting', myTree);
  };

  const setRowKeyValue = (name, key, value) => {
    const mystate = isEmptyObject(state) ? myGlobalState : state;
    //let mystate_gltfjson = mystate.gltfjson || gltfjson ;

    let myobject =
      selectedOption != SELECTASSEMBLY
        ? mystate.selectedObjects
          ? [...mystate.selectedObjects]
          : []
        : mystate.parentObjects
        ? [...mystate.parentObjects]
        : [];
    for (let index = 0; index < myobject.length; index++) {
      let element = myobject[index];
      if (element[gltf_Dict['name']] == name) {
        element[key] = value;
        if (selectedOption != SELECTASSEMBLY) {
          setState({ selectedObjects: myobject });
        } else {
          setState({ parentObjects: myobject });
        }
      }
    }
  };
  const setMateValues = (index, value) => {
    const mystate = isEmptyObject(state) ? myGlobalState : state;
    let myValues = mystate.mateValues
      ? [...mystate.mateValues]
      : Array(6).fill(false);
    myValues[index] = value;
    setState({ mateValues: myValues });
  };

  const setAngle = (value) => {
    setState({ angle: value });
  };

  const setOffset = (value) => {
    setState({ offset: value });
  };

  const setStateOfgltf = (gltfjsonobj) => {
    console.log('setting gltf json', gltfjsonobj);
    setState({ gltfjson: gltfjsonobj });
    //const mystate = isEmptyObject(state)? myGlobalState : state;
    let state_selectedObjects = gltfjsonobj.selectedObjects
      ? [...gltfjsonobj.selectedObjects]
      : [];
    state_selectedObjects.forEach((element) => {
      //element.selectedshell = true;
      setSelectedShell(element, true, gltfjsonobj);
    });
  };
  const setStateOfTree = (gltftree) => {
    const mystate = isEmptyObject(state) ? myGlobalState : state;
    let mystate_gltfjson = mystate.gltfjson || gltfjson;
    if (!mystate_gltfjson || !mystate_gltfjson.tree) {
      setState({ gltfjson: gltfjson });
      mystate_gltfjson = gltfjson;
    }
    let myTree = { ...mystate_gltfjson };
    myTree.tree = gltftree;
    setState({ gltfjson: myTree });
  };
  /* const arrayFindIndex = (arr, value, parent = false) => {

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
  } */
  const selectAllSelectedSolids = async (whichoption) => {
    const mystate = isEmptyObject(state) ? myGlobalState : state;
    var copy_selectobjects = arrayCopy(mystate.selectedObjects);
    if (whichoption == 0) {
      whichoption = selectedOption;
    }
    setResetOption(false);
    let tempSelectedObjects = arrayCopy(mystate.selectedObjects);
    let tempMates = arrayCopy(mystate.mates);
    let tempParentObjects = [];
    //console.log("Ha Ha Ha!",state.selectedObjects)
    for (let meshmaterial of copy_selectobjects) {
      const myAllChildsAndParents = findMyParentChilds(
        meshmaterial,
        whichoption
      );
      //console.log(myAllChildsAndParents, whichoption);
      const myAllChilds = myAllChildsAndParents[0];
      const myParentNode = myAllChildsAndParents[1];
      //console.log(myAllChilds);
      for (let elementdata of myAllChilds) {
        var alreadyPresent = false;
        for (var i = 0; i < tempSelectedObjects.length; i++) {
          if (
            elementdata[gltf_Dict['name']] ==
            tempSelectedObjects[i][gltf_Dict['name']]
          ) {
            alreadyPresent = true;
            break;
          }
        }
        if (!alreadyPresent) {
          //const copydata = await getShapeInfo(elementdata)
          //console.log('Awaiting',copydata)
          const mylocalelement = { ...elementdata };
          setSelectedShell(mylocalelement, true);
          tempSelectedObjects.push(mylocalelement);
          //elementdata.selectedshell = true;
          tempMates.push([]);
        }
      }

      var alreadyPresent = false;
      for (var i = 0; i < tempParentObjects.length; i++) {
        if (
          myParentNode[gltf_Dict['name']] ==
          tempParentObjects[i].parent[gltf_Dict['name']]
        ) {
          alreadyPresent = true;
          break;
        }
      }
      if (!alreadyPresent) {
        const node = {
          parent: myParentNode,
          child: myAllChilds
        };
        tempParentObjects.push(node);
      }
    }
    //console.log("State before awaiting",state.selectedObjects);
    //console.log("Tenpobject before awaiting",tempSelectedObjects);
    var structure = {
      objects: tempSelectedObjects,
      mates: tempMates,
      start: mystate.selectedObjects.length
    };
    //console.log("before",structure);
    structure = await getShapeInformation(structure);
    tempSelectedObjects = structure.objects;
    //console.log("after",structure);
    /*  for (let index = state.selectedObjects.length; index < tempSelectedObjects.length; index++) {
          
         tempSelectedObjects[index] = await getShapeInformation(tempSelectedObjects[index])
         console.log('Awaiting',tempSelectedObjects[index]);          
     } */

    setState({
      selectedObjects: tempSelectedObjects,
      parentObjects: tempParentObjects,
      mates: structure.mates
    });
    //console.log("SelectedObjects",state.selectedObjects);
    setResetOption(true);
  };

  const buildParentChildTree = (
    data = [],
    mySelectedOption = 0,
    {
      idKey = gltf_Dict['id'],
      parentKey = gltf_Dict['parentId'],
      childrenKey = 'children'
    } = {}
  ) => {
    console.log('I am going to build tree', state.gltfjson, data);
    const tree = [];
    const childrenOf = {};
    data.forEach((item) => {
      item[childrenKey] = [];
    });
    data.forEach((item) => {
      let visible = false;
      if (item[gltf_Dict['topLeft']]) {
        visible = item[gltf_Dict['topLeft']][0] !== null;
        if (visible) {
          let myelement = item[gltf_Dict['element']];
          let myName = item[gltf_Dict['name']];
          let first4chars = myName.slice(0, 4);
          let first6chars = myName.slice(0, 6);
          if (myelement) {
            first4chars = myelement;
            first6chars = myelement;
            if (myelement == 'F') {
              first4chars = 'FACE';
            } else if (myelement == 'E') {
              first4chars = 'EDGE';
            } else if (myelement == 'V') {
              first6chars = 'VERTEX';
            } else if (myelement == 'P') {
              first4chars = 'PART';
            } else if (
              myelement == 'f' ||
              myelement == 'e' ||
              myelement == 'v'
            ) {
              first6chars = 'SLICER';
            }
          }
          //console.log("1",myName,first4chars,selectedOption,visible);
          if (first4chars != 'PART') {
            visible =
              mySelectedOption == SELECTMEASURE ||
              mySelectedOption == SELECTFEATURE;
            if (first4chars == 'FACE') {
              visible =
                visible ||
                mySelectedOption == SELECTFACE ||
                mySelectedOption == SELECTEDGE ||
                mySelectedOption == SELECTCORNER;
            } else if (first4chars == 'EDGE') {
              visible =
                visible ||
                mySelectedOption == SELECTEDGE ||
                mySelectedOption == SELECTCORNER;
            } else if (first6chars == 'VERTEX') {
              visible = visible || mySelectedOption == SELECTCORNER;
            } else if (first6chars == 'SLICER') {
              console.log(
                myelement,
                mySelectedOption,
                SELECTSOLID,
                SELECTASSEMBLY
              );
              visible =
                mySelectedOption != SELECTSOLID &&
                mySelectedOption != SELECTASSEMBLY;
            } else {
              console.log(
                '0',
                myName,
                first4chars,
                mySelectedOption,
                visible,
                myelement
              );
              visible = true;
            }
          }
          //console.log("2",myName,first4chars,selectedOption,visible);
          /*  if ( (first4chars=="FACE") || (first4chars=="EDGE") 
              || (first6chars=="VERTEX") || (first6chars=="SLICER") ) {
              visible = false;
           } */
        }
      }
      if (visible) {
        if (!item['id']) {
          item['id'] = item[gltf_Dict['id']];
        }
        if (!item['name']) {
          item['name'] = item[gltf_Dict['name']];
        }
        if (!item['state']) {
          item['state'] = {
            expanded: item[gltf_Dict['id']] == '1',
            selected: item.selectedshell
          };
          //console.log("Setting states here1",item['state']);
        } else {
          //console.log("Item to be assigned",item);
          item['state'].selected = item.selectedshell;
          const currentNode = findMyTreeNode(item);
          if (currentNode) {
            item['state'].expanded = currentNode['state'].expanded;
          }
          //console.log("Setting states here2",item, item['state'],"Current Node",currentNode);
        }
        const { [idKey]: id, [parentKey]: parentId = 0 } = item;
        childrenOf[id] = childrenOf[id] || [];
        item[childrenKey] = childrenOf[id];
        parentId !== null
          ? (childrenOf[parentId] = childrenOf[parentId] || []).push(item)
          : tree.push(item);
      }
    });
    myGlobalTree = tree;
    return tree;
  };

  const findSingleNode = (mynode) => {
    /* const mydata=[];
    mydata.push(mynode);
    const myarray=[];
    myarray.push(mydata);
    myarray.push(mynode);
    //console.log("MyArray",myarray);
    return myarray; //To return Same memory! */
    let myParentPart = mynode;
    if (tabIndex == 'iupc') {
      myParentPart = findMyParentPart(mynode);
      if (!myParentPart) {
        myParentPart = mynode;
      }
    }
    return [[mynode], myParentPart];
  };

  const findMyParentElement = (mynode) => {
    var myParentID = mynode[gltf_Dict['parentId']];
    const mystate = isEmptyObject(state) ? myGlobalState : state;
    let mystate_gltfjson = mystate.gltfjson || gltfjson;
    if (!mystate_gltfjson || !mystate_gltfjson.tree) {
      setState({ gltfjson: gltfjson });
      mystate_gltfjson = gltfjson;
    }
    if (!myParentID) {
      console.log('Unable to get parentid', mynode);
      myParentID = -1;
      if (mystate_gltfjson && mystate_gltfjson.tree) {
        for (var i = 0; i < mystate_gltfjson.tree.length; i++) {
          if (
            mystate_gltfjson.tree[i][gltf_Dict['name']] ==
            mynode[gltf_Dict['name']]
          ) {
            myParentID = mystate_gltfjson.tree[i][gltf_Dict['parentId']];
            break;
          }
        }
      }
    }
    if (myParentID == -1) {
      console.log(
        'Unable to get parentid after searching all tree nodes',
        mynode
      );
      return null;
    } else {
      if (mystate_gltfjson && mystate_gltfjson.tree) {
        for (var i = 0; i < mystate_gltfjson.tree.length; i++) {
          if (mystate_gltfjson.tree[i][gltf_Dict['id']] == myParentID) {
            return mystate_gltfjson.tree[i];
          }
        }
      }
      console.log(
        'Unable to get parentid after searching all tree nodes for the parent',
        mynode
      );
      return null;
    }
  };

  const findMySiblingElements = (mynode) => {
    var myParentID = mynode[gltf_Dict['parentId']];
    if (myParentID == -1) {
      console.log(
        'Unable to get parentid since it is the root element',
        mynode
      );
      return null;
    }
    var myID = mynode[gltf_Dict['id']];
    const mystate = isEmptyObject(state) ? myGlobalState : state;
    let mystate_gltfjson = mystate.gltfjson || gltfjson;
    if (!mystate_gltfjson || !mystate_gltfjson.tree) {
      setState({ gltfjson: gltfjson });
      mystate_gltfjson = gltfjson;
    }
    if (!myParentID) {
      console.log('Unable to get parentid', mynode);
      myParentID = -1;
      if (mystate_gltfjson && mystate_gltfjson.tree) {
        for (var i = 0; i < mystate_gltfjson.tree.length; i++) {
          if (
            mystate_gltfjson.tree[i][gltf_Dict['name']] ==
            mynode[gltf_Dict['name']]
          ) {
            myParentID = mystate_gltfjson.tree[i][gltf_Dict['parentId']];
            myID = mystate_gltfjson.tree[i][gltf_Dict['id']];
            break;
          }
        }
      }
    }
    if (myParentID == -1) {
      console.log(
        'Unable to get parentid after searching all tree nodes',
        mynode
      );
      return null;
    } else {
      var mySiblingNodes = [];
      const nullArray = JSON.stringify([null, null, null]);
      if (mystate_gltfjson && mystate_gltfjson.tree) {
        for (var i = 0; i < mystate_gltfjson.tree.length; i++) {
          if (
            mystate_gltfjson.tree[i][gltf_Dict['parentId']] == myParentID &&
            mystate_gltfjson.tree[i][gltf_Dict['id']] != myID &&
            JSON.stringify(mystate_gltfjson.tree[i][gltf_Dict['topLeft']]) !==
              nullArray
          ) {
            mySiblingNodes.push(mystate_gltfjson.tree[i]);
          }
        }
      }
      console.log('Finally added sibling nodes', mySiblingNodes);
      return mySiblingNodes;
    }
  };

  const findMyParentPart = (mynode) => {
    var myParentID = -1;
    const mystate = isEmptyObject(state) ? myGlobalState : state;
    let mystate_gltfjson = mystate.gltfjson || gltfjson;
    if (!mystate_gltfjson || !mystate_gltfjson.tree) {
      setState({ gltfjson: gltfjson });
      mystate_gltfjson = gltfjson;
    }
    if (mystate_gltfjson && mystate_gltfjson.tree) {
      for (var i = 0; i < mystate_gltfjson.tree.length; i++) {
        if (
          mystate_gltfjson.tree[i][gltf_Dict['name']] ==
          mynode[gltf_Dict['name']]
        ) {
          myParentID = mystate_gltfjson.tree[i][gltf_Dict['parentId']];
          if (mystate_gltfjson.tree[i][gltf_Dict['element']] == 'P') {
            return mystate_gltfjson.tree[i];
          } else {
            break;
          }
        }
      }
    }

    if (myParentID == -1) {
      return null;
    } else {
      var myParentsParentID = -1;
      if (mystate_gltfjson && mystate_gltfjson.tree) {
        for (var i = 0; i < mystate_gltfjson.tree.length; i++) {
          if (mystate_gltfjson.tree[i][gltf_Dict['id']] == myParentID) {
            myParentsParentID = mystate_gltfjson.tree[i][gltf_Dict['parentId']];
            if (mystate_gltfjson.tree[i][gltf_Dict['element']] == 'P') {
              return mystate_gltfjson.tree[i];
            } else {
              break;
            }
          }
        }
      }

      //console.log("Parent", myParentsParentID, myParentID, myID);
      if (myParentsParentID == -1) {
        //RootNode
        //console.log("Pushing", myParentsParentID, myParentID, myID);
        return null;
      } else {
        if (mystate_gltfjson && mystate_gltfjson.tree) {
          for (var i = 0; i < mystate_gltfjson.tree.length; i++) {
            if (
              mystate_gltfjson.tree[i][gltf_Dict['id']] == myParentsParentID
            ) {
              if (mystate_gltfjson.tree[i][gltf_Dict['element']] == 'P') {
                return mystate_gltfjson.tree[i];
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
      const myChild = myParentPart; //findMyMaterial(myParentPart);
      if (myChild) {
        myMaterials.push(myChild);
      }
    }
    /*
    var myParentID = -1;
    var myParentNode = null;
    for (var i = 0; i < state.gltfjson.tree.length; i++) {
        if (state.gltfjson.tree[i][gltf_Dict["name"]] == mynode[gltf_Dict["name"]]) {
            myParentID = state.gltfjson.tree[i][gltf_Dict["parentId"]];
            myParentNode = state.gltfjson.tree[i];
            break;
        }
    }
    var myMaterials = [];
    if (myParentID != -1) {
        for (var i = 0; i < state.gltfjson.tree.length; i++) {
            if (state.gltfjson.tree[i][gltf_Dict["parentId"]] == myParentID) {
                var myChild = state.gltfjson.tree[i];
                if (myChild) {
                    if ((state.gltfjson.tree[i][gltf_Dict["element"]]=="F") ||
                        onlyfaces(myChild[gltf_Dict["name"]])) {
                        myMaterials.push(myChild);
                    }
                }
            } else {
                if (state.gltfjson.tree[i][gltf_Dict["id"]] == myParentID) {
                    myParentNode = state.gltfjson.tree[i];
                }
            }
        }
    }
    */
    if (myMaterials.length != 0) {
      return [myMaterials, myParentNode];
    }
    return [[mynode], mynode];
  };

  const findFamilyNodes = (mynode) => {
    var myParentID = -1;
    var myID = -1;
    var parentNode = null;
    const mystate = isEmptyObject(state) ? myGlobalState : state;
    let mystate_gltfjson = mystate.gltfjson || gltfjson;
    if (!mystate_gltfjson || !mystate_gltfjson.tree) {
      setState({ gltfjson: gltfjson });
      mystate_gltfjson = gltfjson;
    }
    if (mystate_gltfjson && mystate_gltfjson.tree) {
      for (var i = 0; i < mystate_gltfjson.tree.length; i++) {
        if (
          mystate_gltfjson.tree[i][gltf_Dict['name']] ==
          mynode[gltf_Dict['name']]
        ) {
          myParentID = mystate_gltfjson.tree[i][gltf_Dict['parentId']];
          myID = mystate_gltfjson.tree[i][gltf_Dict['id']];
          parentNode = mystate_gltfjson.tree[i];
          break;
        }
      }
    }

    const myParentPart = findMyParentPart(mynode);
    if (myParentPart) {
      parentNode = myParentPart;
      myParentID = parentNode[gltf_Dict['id']];
    }
    //console.log(myParentID, parentNode);
    var myMaterials = [];
    if (myParentID != -1) {
      var myParentsParentID = -1;
      if (mystate_gltfjson && mystate_gltfjson.tree) {
        for (var i = 0; i < mystate_gltfjson.tree.length; i++) {
          if (mystate_gltfjson.tree[i][gltf_Dict['id']] == myParentID) {
            myParentsParentID = mystate_gltfjson.tree[i][gltf_Dict['parentId']];
            parentNode = mystate_gltfjson.tree[i];
            break;
          }
        }
      }

      //console.log(myParentID, myParentsParentID, parentNode);
      var myParents = [];
      if (myParentsParentID == -1) {
        //RootNode
        myParents.push(myID);
      } else {
        if (mystate_gltfjson && mystate_gltfjson.tree) {
          for (var i = 0; i < mystate_gltfjson.tree.length; i++) {
            if (
              mystate_gltfjson.tree[i][gltf_Dict['parentId']] ==
              myParentsParentID
            ) {
              myParents.push(mystate_gltfjson.tree[i][gltf_Dict['id']]);
            } else {
              if (
                mystate_gltfjson.tree[i][gltf_Dict['id']] == myParentsParentID
              ) {
                parentNode = mystate_gltfjson.tree[i];
              }
            }
          }
        }
      }
      for (var j = 0; j < myParents.length; j++) {
        myParentID = myParents[j];
        if (mystate_gltfjson && mystate_gltfjson.tree) {
          for (var i = 0; i < mystate_gltfjson.tree.length; i++) {
            if (mystate_gltfjson.tree[i][gltf_Dict['id']] == myParentID) {
              var myChild = mystate_gltfjson.tree[i];
              if (myChild) {
                if (
                  mystate_gltfjson.tree[i][gltf_Dict['element']] == 'P' ||
                  onlyparts(myChild[gltf_Dict['name']])
                ) {
                  myMaterials.push(myChild);
                }
              }
            }
          }
        }
      }
    }
    if (myMaterials.length != 0) {
      /*  let mydata=[];
       mydata.push(myMaterials);
       mydata.push(parentNode);
       return mydata; */
      return [myMaterials, parentNode];
    }
    /* let mydata=[];
    mydata.push(mynode);
    let myarray=[];
    myarray.push(mydata);
    myarray.push(mynode);
    console.log("MyArray",myarray);
    return myarray; */
    return [[mynode], mynode];
  };

  const findMyParentChilds = (mynode, whichOption) => {
    //console.log(this.props.selectedoption,SELECTSOLID,this.props.selectedoption != SELECTSOLID);
    const mystate = isEmptyObject(state) ? myGlobalState : state;
    if (
      ((whichOption != SELECTSOLID && whichOption != SELECTASSEMBLY) ||
        mystate.splitMethod != SELECTDISECTPARTS) &&
      resetOption
    ) {
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
  };

  const findrecursiveTreeNode = (node, myParent) => {
    //console.log("Checking",myParent,myParent[gltf_Dict["name"]],"For Checking",node,node[gltf_Dict["name"]]);
    if (myParent[gltf_Dict['name']] == node[gltf_Dict['name']]) {
      //console.log("Checking",myParent,"Found Checking",node);
      return myParent;
    }
    if (myParent.children && myParent.children.length > 0) {
      for (let index = 0; index < myParent.children.length; index++) {
        const element = myParent.children[index];
        const gotAnswer = findrecursiveTreeNode(node, element);
        if (gotAnswer) {
          //console.log("Checking",myParent,"Inside Found Checking",node);
          return gotAnswer;
        }
      }
    }
    //console.log("Checking",myParent,"Outside Checking",node);
    return null;
  };
  const findMyTreeNode = (node) => {
    //console.log("FInding my treenode",myGlobalTree);
    if (myGlobalTree) {
      return findrecursiveTreeNode(node, myGlobalTree[0]);
    } else {
      return null;
    }
  };

  const findMyMaterial = (data) => {
    //console.log(data);
    //console.log(state.gltfjson.tree);
    const mystate = isEmptyObject(state) ? myGlobalState : state;
    let mystate_gltfjson = mystate.gltfjson || gltfjson;
    if (!mystate_gltfjson || !mystate_gltfjson.tree) {
      setState({ gltfjson: gltfjson });
      mystate_gltfjson = gltfjson;
    }
    if (mystate_gltfjson.tree) {
      for (var i = 0; i < mystate_gltfjson.tree.length; i++) {
        //console.log(state.gltfjson.tree[i]);
        if (mystate_gltfjson.tree[i][gltf_Dict['name']] == data['name']) {
          return mystate_gltfjson.tree[i];
        }
      }
    }
    return null;
  };

  const onlyfaces = (name) => {
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

  const onlyparts = (name) => {
    const first4chars = name.slice(0, 4);
    return first4chars == 'PART';
  };

  const setState = (data) => {
    myGlobalState = { ...myGlobalState, ...data };
    console.log('Setting global state', myGlobalState);
    try {
      _setState((prevState) => {
        //console.log(prevState,data);
        return {
          ...prevState,
          ...data
        };
      });
    } catch (error) {
      console.log('Error while setting state,', error);
    }
  };

  const getShapeInformation = (structure = {}) => {
    var stepArray = [];
    var siblingArray = [];
    var partArray=[];
    //var firstOne = null;

    structure.objects.forEach((element) => {
      //console.log(element);
      if (element[gltf_Dict['step']]) {
        const stepFile = element[gltf_Dict['step']].slice(0, -5);
        //if(!firstOne) firstOne=stepFile;
        stepArray.push(stepFile);
        var siblings = [];
        if (element[gltf_Dict['element']] == 'E') {
          const myParentOfElement = findMySiblingElements(element);
          if (myParentOfElement) {
            console.log('shape info', myParentOfElement, element);
            myParentOfElement.forEach((sibling) => {
              const parentFile = sibling[gltf_Dict['step']].slice(0, -5);
              siblings.push(parentFile);
            });
          } else {
            siblings.push(null);
          }
        } else {
          siblings.push(null);
        }
        console.log('Added in the loop', siblings);
        siblingArray.push(siblings);
        const myparentpart = findMyParentPart(element);
        if(myparentpart) {
          const partfile = myparentpart[gltf_Dict['step']].slice(0, -5);
          partArray.push(partfile);
        } else {
          partArray.push(null);
        }
      }
    });

    console.log('getShapeInfo', structure, stepArray, siblingArray);
    return new Promise((resolve, reject) => {
      getShapeInfo(structure.start, stepArray, siblingArray, partArray, fileUUIder)
        .then((res) => res.data)
        .then((repos) => {
          //console.log("FromShapeInfo",repos);
          //structure.repos=repos;
          if (!repos || repos.length == 0) {
            resolve(structure);
            console.log('Unable to get', structure.start, stepArray);
            return;
          }
          for (let index = 0; index < repos.length; index++) {
            structure.mates[structure.start + index] = repos[index][1];
            const element = repos[index][0];
            console.log('Mates element', element);
            structure.objects[structure.start + index]['type'] =
              element[0].type;
            structure.objects[structure.start + index]['kind'] =
              element[0].Info['kind'];
            structure.objects[structure.start + index]['fill'] =
              element[0].fill;
            structure.objects[structure.start + index]['obb'] = element[0].obb;
            if(element[0].Info['kind'] ==='Circle'){
              structure.objects[structure.start + index]['diameter'] = 2.0 * (element[0].Info['radius'] ? element[0].Info['radius']:0) ;
            }

            //console.log(structure.objects[structure.start+index]);
            /*console.log(element);
             if (element[0].type === 'Edge') {
                structure.objects[structure.start+index].cornerLocation = `${JSON.stringify(element[1].Info)}  ${JSON.stringify(element[2].Info)}`;
            }
            else if (element[0].type === 'Vertex') {
                structure.objects[structure.start+index].location = `${JSON.stringify(element[0].Info)}`;
            }
            else if (element[0].type === 'Face') {
                // data.location = `${repos[0].Info}`;
                let edgeList = [];
                element.map(item => {
                    edgeList.push(item.id);
                });
                //console.log("Index ok?",structure.objects,structure.start+index,repos.length);
                
                structure.objects[structure.start+index]['edgeList'] = edgeList;
            } */
          }
          console.log('-------latest------',structure )
          resolve(structure);
        })
        .catch((error) => {
          console.log('Error', error);
          resolve(structure);
        });
    });
  };
  let mapdata = {};
  const setSelectedShell = (data, setoption, insteadstate = null) => {
    const mystate = isEmptyObject(state) ? myGlobalState : state;
    const mystate_gltfjson = insteadstate ? insteadstate : mystate.gltfjson; //| gltfjson;
    if (!mystate_gltfjson) {
      console.log('I could not get any state');
      return;
    }
    if (data.selectedshell != setoption) {
      data.selectedshell = setoption;
    }
    const myID = data[gltf_Dict['id']];
    let curData = mapdata[myID];
    if (typeof curData === 'undefined') {
      if (mystate_gltfjson && mystate_gltfjson.tree) {
        for (let index = 0; index < mystate_gltfjson.tree.length; index++) {
          const element = mystate_gltfjson.tree[index];
          //console.log("compare",element,data);
          if (element[[gltf_Dict['id']]] == myID) {
            curData = index;
            mapdata[myID] = index;
            break;
          }
        }
      }
    }
    if (typeof curData !== 'undefined') {
      let myTree = { ...mystate_gltfjson };
      if (myTree.tree) {
        if (
          insteadstate == null ||
          myTree.tree[curData].selectedshell != setoption
        ) {
          myTree.tree[curData] = { ...data };
          setState({ gltfjson: myTree });
          console.log('Setting', myTree, data, curData, setoption);
        } else {
          console.log(
            'Not Setting since already set',
            myTree,
            data,
            curData,
            setoption
          );
        }
      }
    } else {
      console.log(
        'unable to find info',
        data,
        myID,
        curData,
        mystate_gltfjson.tree?.length
      );
    }
  };

  const doOneSelection = (element, event) => {
    console.log('Starting', element);
    const aShape = element[gltf_Dict['name']];
    const first4chars = aShape.slice(0, 4);
    const first6chars = aShape.slice(0, 6);
    if (
      first4chars == 'FACE' ||
      first4chars == 'EDGE' ||
      first4chars == 'PART' ||
      first6chars == 'VERTEX'
    ) {
      console.log('Setting..', element);
      element.selectedshell = true;
      console.log('Setting..Done', element);
      const mymesh = { ...element }; //findMyMaterial(element);
      console.log('Before', mymesh);
      if (mymesh) {
        mymesh.selectedshell = true;
        changeStateOfSelection(mymesh, event);
        event['ctrlKey'] = true;
      }
      console.log('aftet', mymesh);
    }
  };

  const expandSelectionFromTree = (nodes) => {
    myGlobalTree = nodes;
    console.log('Expansion', myGlobalTree);
  };

  const addSelectionFromTree = async (selectedNodes) => {
    console.log('Add Selection From Tree', selectedNodes);
    selectedNodes.forEach((element) => {
      element.selectedshell = true;
    });
    if (ctrlKey != false) {
      setCtrlKey(false);
    }
    setState({ renderdata: selectedNodes, whatchange: SELECTDISTANCE });
    updateSelectionFromTree(selectedNodes, true, selectedOption);
  };

  const updateSelectionFromTree = async (
    selectedNodes,
    toGetShapeInfo,
    selectedFeature
  ) => {
    var whatIsNotThereToAdd = [];
    var whatIsAvailableToRemove = [];
    console.log('UpdateSelection:', myGlobalState, state);
    const mystate = isEmptyObject(state) ? myGlobalState : state;
    console.log('UpdateSelection:', myGlobalState, state, mystate);
    const state_selectedObjects = mystate.selectedObjects
      ? [...mystate.selectedObjects]
      : [];
    selectedNodes.forEach((element) => {
      var elementFound = false;
      for (let index = 0; index < state_selectedObjects.length; index++) {
        const stateElement = state_selectedObjects[index];
        if (element[gltf_Dict['name']] == stateElement[gltf_Dict['name']]) {
          elementFound = true;
          break;
        }
      }
      if (!elementFound) {
        whatIsNotThereToAdd.push(element);
      }
    });

    state_selectedObjects.forEach((stateElement) => {
      var elementFound = false;
      for (let index = 0; index < selectedNodes.length; index++) {
        const element = selectedNodes[index];
        if (element[gltf_Dict['name']] == stateElement[gltf_Dict['name']]) {
          elementFound = true;
          break;
        }
      }
      if (!elementFound) {
        whatIsAvailableToRemove.push(stateElement);
      }
    });

    if (selectedNodes && selectedNodes.length != 0) {
      console.log(
        'Update Selection From Tree',
        selectedNodes,
        selectedNodes.length,
        state_selectedObjects
      );
      /*  let event = {};
      event['ctrlKey'] = false;
      console.log("Reducing", event, selectedNodes);
      selectedNodes.reduce(
        (p, x) =>
          p.then(_ => doOneSelection(x, event)),
        Promise.resolve()

      );
      //resetSelectionFromTree(); */
      changeStateOfSelections(
        whatIsAvailableToRemove,
        whatIsNotThereToAdd,
        toGetShapeInfo,
        selectedFeature
      );
    } else {
      console.log(
        'Going to reset selections',
        selectedNodes,
        selectedNodes.length,
        state_selectedObjects
      );
      resetSelections();
    }
  };

  /* const resetSelectionFromTree = async () => {
    if ((state.whatchange != 0) || state.renderdata != []) {
      setState({ whatchange: 0, renderdata: [] });
    }
  }; */
  const changeStateOfSelection = async (data, event) => {
    mapdata = {};
    //console.log("Data for shapeinfo",data,selectedOption,event);
    console.log('Reaching here after clicking', event);
    if (selectedOption == SELECTMEASURE) {
      //console.log("Inside SELECTMEASURE",data);
      if (data.selectedshell) {
        if (!state.firstshell) {
          var structure = {
            objects: [data],
            mates: null,
            start: 0
          };
          structure = await getShapeInformation(structure);
          data = structure.objects[0];
          const firstshell = data;
          setState({
            firstshell: firstshell
          });
          //console.log("FirstShell",firstshell,this.state.firstshell);
        } else {
          if (!state.secondshell) {
            var structure = {
              objects: [data],
              mates: null,
              start: 0
            };
            structure = await getShapeInformation(structure);
            data = structure.objects[0];
            const secondshell = data;
            setState({
              secondshell: secondshell
            });
            //console.log("SecondShell",secondshell,this.state.secondshell);
          } else {
            //state.firstshell.selectedshell = false;
            setSelectedShell(state.firstshell, false);
            const secondshell = state.secondshell;
            var structure = {
              objects: [data],
              mates: null,
              start: 0
            };
            structure = await getShapeInformation(structure);
            data = structure.objects[0];
            setState({
              firstshell: secondshell,
              secondshell: data
            });
            //console.log("First and second",this.state.firstshell,this.state.secondshell,data)
          }
        }
      } else {
        if (
          state.firstshell &&
          state.firstshell[gltf_Dict['name']] == data[gltf_Dict['name']]
        ) {
          //state.firstshell.selectedshell = false;
          setSelectedShell(state.firstshell, false);
          const secondshell = state.secondshell;
          setState({
            firstshell: secondshell,
            secondshell: null
          });
        } else {
          if (
            state.secondshell &&
            state.secondshell[gltf_Dict['name']] == data[gltf_Dict['name']]
          ) {
            //state.secondshell.selectedshell = false;
            setSelectedShell(state.secondshell, false);
            setState({
              secondshell: null
            });
          } else {
            //console.log("This condition is not possible");
          }
        }
      }
    } else {
      //console.log("outside SELECTMEASURE",data);
      var copy_selectobjects = [];
      var copy_parentobjects = [];
      var copy_mateobjects = [];
      const mystate = isEmptyObject(state) ? myGlobalState : state;
      if (data) {
        //console.log(data);
        var toAdd = true;
        var toGetInfo = false;
        if (event) {
          toAdd = event.ctrlKey;
        }
        if (event && event.ctrlKey != ctrlKey) {
          setCtrlKey(event.ctrlKey);
        }

        var stateLength = 0;

        copy_selectobjects = arrayCopy(mystate.selectedObjects);
        if (!toAdd) {
          copy_selectobjects.forEach((element) => {
            if (data[gltf_Dict['name']] != element[gltf_Dict['name']]) {
              //element.selectedshell = false;
              setSelectedShell(element, false);
            }
          });
          stateLength = 0;
          copy_selectobjects = [];
          copy_parentobjects = [];
          copy_mateobjects = [];
        } else {
          //copy_selectobjects = arrayCopy(state.selectedObjects);
          copy_parentobjects = arrayCopy(mystate.parentObjects);
          copy_mateobjects = arrayCopy(mystate.mates);
          stateLength = mystate.selectedObjects.length;
          //console.log("MyMate",copy_mateobjects);
        }
        //console.log(data);
        const myAllChildsAndParents = findMyParentChilds(data, selectedOption);
        //console.log(myAllChildsAndParents);
        const myAllChilds = myAllChildsAndParents[0];
        const myParentNode = myAllChildsAndParents[1];

        //console.log("Splitted",myAllChilds,myParentNode)
        for (let elementdata of myAllChilds) {
          //console.log("Before",elementdata);
          //elementdata.selectedshell = data.selectedshell;
          let localelementdata = { ...elementdata };
          setSelectedShell(localelementdata, data.selectedshell);
          //console.log("After",elementdata,state.gltfjson.tree);
          if (toAdd) {
            if (data.selectedshell) {
              var alreadyPresent = false;
              for (var i = 0; i < copy_selectobjects.length; i++) {
                if (
                  elementdata[gltf_Dict['name']] ==
                  copy_selectobjects[i][gltf_Dict['name']]
                ) {
                  alreadyPresent = true;
                  break;
                }
              }
              if (!alreadyPresent) {
                // const copydata = await getShapeInformation(elementdata);
                // console.log('awaiting',copydata);
                localelementdata['parentnode'] = { ...myParentNode };
                copy_selectobjects.push(localelementdata);
                copy_mateobjects.push([]);
                //console.log("MyMate2",copy_mateobjects);
                toGetInfo = true;
                /* setState({
                    selectedObjects: [...state.selectedObjects, copydata]
                }); */
              }
            } else {
              //error here...
              const currentIndex = arrayFindIndex(
                copy_selectobjects,
                elementdata[gltf_Dict['name']]
              );
              if (currentIndex != -1) {
                //console.log(currentIndex,elementdata[gltf_Dict["name"]]);
                copy_selectobjects = arrayRemove(
                  copy_selectobjects,
                  elementdata[gltf_Dict['name']]
                );
                //console.log("Before Splicing",copy_mateobjects,currentIndex, copy_mateobjects.length);
                copy_mateobjects.splice(currentIndex, 1);
                //console.log("After Splicing",copy_mateobjects,currentIndex, copy_mateobjects.length);
                for (
                  let mateindex = currentIndex;
                  mateindex < copy_mateobjects.length;
                  mateindex++
                ) {
                  copy_mateobjects[mateindex].splice(currentIndex, 1);
                }
                //console.log('1 : ', copy_selectobjects, copy_mateobjects);
              }

              //setState({ selectedObjects: copy_selectobjects });
            }
          } else {
            if (data.selectedshell) {
              //const copydata = await getShapeInformation(elementdata);
              //console.log('awaiting',elementdata);
              localelementdata['parentnode'] = { ...myParentNode };
              copy_selectobjects.push(localelementdata);
              copy_mateobjects.push([]);
              toGetInfo = true;
              //setState({ selectedObjects: myAllChilds });
            } else {
              copy_selectobjects = [];
              //setState({ selectedObjects: [] });
            }
          }
        }
        if (toGetInfo && (tabIndex == 'gdtac' || tabIndex == 'iupc')) {
          var structure = {
            objects: copy_selectobjects,
            mates: copy_mateobjects,
            start: stateLength
          };
          console.log('before mystruct', structure);
          structure = await getShapeInformation(structure);
          console.log('after mystruct', structure);
          copy_selectobjects = structure.objects;
          copy_mateobjects = structure.mates;
        } else {
          console.log('I need not get any togetinfo', tabIndex);
        }

        /* for (let index = stateLength; index < copy_selectobjects.length; index++) {
            console.log("Before Awaiting",copy_selectobjects[index],stateLength,copy_selectobjects.length);
            copy_selectobjects[index] = await getShapeInformation(copy_selectobjects[index])
            console.log('Awaiting',copy_selectobjects[index]);          
        } */
        console.log(
          'Setting the state of selected objects',
          mystate.selectedObjects,
          'Copy',
          copy_selectobjects,
          'mates',
          mystate.mates,
          'copy mates',
          copy_mateobjects
        );
        setState({
          selectedObjects: copy_selectobjects,
          mates: copy_mateobjects
        });
        if (toAdd) {
          if (data.selectedshell) {
            var alreadyPresent = false;
            for (var i = 0; i < mystate.parentObjects.length; i++) {
              if (
                myParentNode[gltf_Dict['name']] ==
                mystate.parentObjects[i].parent[gltf_Dict['name']]
              ) {
                alreadyPresent = true;
                break;
              }
            }
            if (!alreadyPresent) {
              const node = {
                parent: myParentNode,
                child: myAllChilds
              };
              setState({
                parentObjects: [...mystate.parentObjects, node]
              });
            } else {
              console.log('Not adding since already present');
            }
          } else {
            copy_parentobjects = arrayRemove(
              copy_parentobjects,
              myParentNode[gltf_Dict['name']],
              true
            );
            //console.log('2 : ', copy_parentobjects);
            setState({ parentObjects: copy_parentobjects });
          }
        } else {
          //console.log("setting", "OneNode", myParentNode);
          if (data.selectedshell) {
            const node = {
              parent: myParentNode,
              child: myAllChilds
            };
            setState({ parentObjects: [node] });
          } else {
            setState({ parentObjects: [] });
          }
        }
      } else {
        console.log('I am reaching here to reset selections');
        let state_selectedObjects = mystate.selectedObjects
          ? [...mystate.selectedObjects]
          : [];
        state_selectedObjects.forEach((element) => {
          //element.selectedshell = false;
          setSelectedShell(element, false);
        });
        setState({
          selectedObjects: copy_selectobjects,
          mates: copy_mateobjects
        });
        setState({ parentObjects: [] });
      }
    }
    if (handleChangeOfSelection) {
      console.log('Call back for handlechangeofselction', copy_selectobjects);
      handleChangeOfSelection(copy_selectobjects);
    } else {
      console.log(
        'No Call back for handlechangeofselction since it is from gdt',
        copy_selectobjects
      );
    }

    //console.log("Finally my state tree",state.gltfjson.tree);
  };
  const changeStateOfSelections = async (
    removeData,
    addData,
    toAddShapeInfo,
    selectedFeature
  ) => {
    mapdata = {};
    //console.log("Data for shapeinfo",data,selectedOption,event);
    const mystate = isEmptyObject(state) ? myGlobalState : state;
    console.log('Reaching here after clicking', removeData, addData);
    var copy_selectobjects = arrayCopy(mystate.selectedObjects);
    var copy_parentobjects = arrayCopy(mystate.parentObjects);
    var copy_mateobjects = arrayCopy(mystate.mates);

    removeData.forEach((data) => {
      if (data) {
        const myAllChildsAndParents = findMyParentChilds(data, selectedFeature);
        //console.log(myAllChildsAndParents);
        const myAllChilds = myAllChildsAndParents[0];
        const myParentNode = myAllChildsAndParents[1];

        //console.log("Splitted",myAllChilds,myParentNode)
        for (let elementdata of myAllChilds) {
          //console.log("Before",elementdata);
          //elementdata.selectedshell = false;
          setSelectedShell({ ...elementdata }, false);
          if (toAddShapeInfo) {
            const currentIndex = arrayFindIndex(
              copy_selectobjects,
              elementdata[gltf_Dict['name']]
            );
            if (currentIndex != -1) {
              //console.log(currentIndex,elementdata[gltf_Dict["name"]]);
              copy_selectobjects = arrayRemove(
                copy_selectobjects,
                elementdata[gltf_Dict['name']]
              );
              //console.log("Before Splicing",copy_mateobjects,currentIndex, copy_mateobjects.length);
              copy_mateobjects.splice(currentIndex, 1);
              //console.log("After Splicing",copy_mateobjects,currentIndex, copy_mateobjects.length);
              for (
                let mateindex = currentIndex;
                mateindex < copy_mateobjects.length;
                mateindex++
              ) {
                copy_mateobjects[mateindex].splice(currentIndex, 1);
              }
            }
          }
        }
        copy_parentobjects = arrayRemove(
          copy_parentobjects,
          myParentNode[gltf_Dict['name']],
          true
        );
      }
    });
    var stateLength = copy_selectobjects.length;
    var toGetInfo = false;
    addData.forEach((data) => {
      if (data) {
        const myAllChildsAndParents = findMyParentChilds(data, selectedFeature);
        //console.log(myAllChildsAndParents);
        const myAllChilds = myAllChildsAndParents[0];
        const myParentNode = myAllChildsAndParents[1];
        //console.log("Splitted",myAllChilds,myParentNode)
        for (let elementdata of myAllChilds) {
          //console.log("Before",elementdata);
          //elementdata.selectedshell = true;
          const mycopydata = { ...elementdata };
          setSelectedShell(mycopydata, true);
          copy_selectobjects.push(mycopydata);
          copy_mateobjects.push([]);
          toGetInfo = true;
        }
        const node = {
          parent: myParentNode,
          child: myAllChilds
        };
        copy_parentobjects.push(node);
      }
    });
    if (toGetInfo && toAddShapeInfo) {
      var structure = {
        objects: copy_selectobjects,
        mates: copy_mateobjects,
        start: stateLength
      };
      console.log('before mystruct', structure);
      structure = await getShapeInformation(structure);
      console.log('after mystruct', structure);
      copy_selectobjects = structure.objects;
      copy_mateobjects = structure.mates;
    } else {
      console.log('I could not get any togetinfo');
    }
    setState({
      selectedObjects: copy_selectobjects,
      parentObjects: copy_parentobjects,
      mates: copy_mateobjects
    });
    if (handleChangeOfSelection) {
      console.log('Call back for handlechangeofselctions', copy_selectobjects);
      handleChangeOfSelection(copy_selectobjects);
    } else {
      console.log(
        'No Call back for handlechangeofselctions since it is from gdt',
        copy_selectobjects
      );
    }
  };

  const setOptionForAssemblyTreeOptions = (event) => {
    setOptionForAssemblyTree(event.target.value);
  };
  const handleModelClick = (data, what, event) => {
    console.log('From Handle Model Click', data, what, event);
    if (what == SELECTDISTANCE) {
      if (data) {
        console.log(data);
        const mymesh = findMyMaterial(data);
        if (mymesh) {
          const mymeshcopy = { ...mymesh };
          //mymesh.selectedshell = data.selectedshell;
          setSelectedShell(mymeshcopy, data.selectedshell);
          return changeStateOfSelection(mymeshcopy, event);
        } else {
          console.log('No Mesh', mymesh, data);
        }
      } else {
        console.log('Resetting', data);
        return changeStateOfSelection(data, event);
      }
      if (event && event.ctrlKey != ctrlKey) {
        //console.log(event.ctrlKey);
        setCtrlKey(ctrlKey, event.ctrlKey);
      }
    }
    return null;
  };

  /* if (isLoading) {
    return <CircularProgress />;
  } */

  return (
    <Paper className={classes.mainContainer}>
      {!isLoading && state.gltfjson?.tree && (
        <div className={` ${classes.assemblyTreeContainer}`}>
          <Assembly
            assemblyTree={buildParentChildTree(
              state.gltfjson.tree,
              selectedOption
            )}
            OnAddition={addSelectionFromTree}
            OnExpansion={expandSelectionFromTree}
          />
        </div>
      )}
      <Paper className={`${classes.paper} ${classes.viewerContainer}`}>
        <Viewer
          {...state}
          fileGDT={fileGDT}
          fileUUId={fileUUIder}
          selectedOption={selectedOption}
          handleModelClick={handleModelClick}
          isLoading={isLoading}
          ctrlKey={ctrlKey}
          setSelectedOption={setSelectedOption}
          setCtrlKey={setCtrlKey}
          resetSelections={resetSelections}
          selectAllSelectedSolids={selectAllSelectedSolids}
          //resetSelectionFromTree={resetSelectionFromTree}
          setStateOfTree={setStateOfTree}
          setStateOfgltf={setStateOfgltf}
          activeDataTable={activeDataTable}
          setIsProgressOpen={setIsProgressOpen}
          setProgressOpenedFiles={setProgressOpenedFiles}
          progressBarLoad={progressBarLoader}
          percentage={percentager}
          currentProgressText={currentProgressTexter}
          completionProgressText={completionProgressTexter}
          drawLine={drawLiner}          
        />
      </Paper>

      {optionForAssemblyTree == 'Configuration' && tabIndex == 'gdtac' && (
        <Paper className={`${classes.paper} ${classes.assemblyTableContainer}`}>
          <ViewerToolbar
            {...state}
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
            resetSelections={resetSelections}
            selectAllSelectedSolids={selectAllSelectedSolids}
            setCtrlKey={setCtrlKey}
            toolbar={true}
            activeDataTable={activeDataTable}
            setActiveDataTable={globalSetActiveDataTable}
            incrementActiveDataTable={incrementActiveDataTable}
            saveGDTDataTable={saveGDTDataTable}
            resetActiveDataTable={resetActiveDataTable}
            setCurrentDataTable={setCurrentDataTable}
            setRowKeyValue={setRowKeyValue}
            setMateValues={setMateValues}
            setAngle={setAngle}
            setOffset={setOffset}
            isProgressOpen={isProgressOpen}
            progressOpenedFiles={progressOpenedFiles}
            setIsProgressOpen={setIsProgressOpen}
            setProgressOpenedFiles={setProgressOpenedFiles}
            {...{ internalProductConfig }}
          />
        </Paper>
      )}
    </Paper>
  );
}
