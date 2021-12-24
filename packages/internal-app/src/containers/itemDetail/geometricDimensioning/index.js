import React, { useState, useEffect } from 'react';
import { Paper } from '@mui/material';
import Viewer from './Viewer';
import ViewerToolbar from './ViewerToolbar';
import {
  getShapeInfo,
  saveGDTInfo
} from '@monostruct/common/api/fileUpload.api';
import {
  SELECTANITEM,
  SELECTSOLID,
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
import { stringify } from '@monostruct/common/gltf/Flatted.js';
import Assembly from '../assembly';
import { buildParentChildTree } from './helper';
import { Box } from '@mui/system';

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
    centerActionText,
    drawLine,
    internalProductConfig,
    selectedOption,
    setSelectedOption,
    keyName = { name: '', option: SELECTFEATURE },
    handleChangeOfSelection = (selectedObjects) => {},
    additionalSaveFunction = (saveObjects) => {},
    fileAnimation = false,
    changingdata = [],
    whatchanger = 0,
    showKinematicMove = false,
    additionalModelClick = null
  } = props;
  const classes = USESTYLES();

  const [state, _setState] = useState({});
  const [resetOption, setResetOption] = useState(true);
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
  const [centerActionTexter, setCenterActionTexter] =
    useState(centerActionText);
  const [drawLiner, setDrawLiner] = useState(drawLine);
  const [fileUUIder, setfileUUIder] = useState(fileUUId);

  useEffect(() => {
    if (fileUUId) {
      setfileUUIder(fileUUId);
    }
  }, [fileUUId]);
  useEffect(() => {
    setProgressBarLoader(progressBarLoad);
  }, [progressBarLoad]);
  useEffect(() => {
    setCurrentProgressTexter(currentProgressText);
  }, [currentProgressText]);
  useEffect(() => {
    setCompletionProgressTexter(completionProgressText);
  }, [completionProgressText]);
  useEffect(() => {
    setCenterActionTexter(centerActionText);
  }, [centerActionText]);

  useEffect(() => {
    if (percentage) {
      setPercentager(percentage);
    }
  }, [percentage]);
  useEffect(() => {
    setDrawLiner(drawLine);
  }, [drawLine]);

  useEffect(() => {
    console.log('Use effect in changing data', changingdata, whatchanger);
    if (
      stringify(changingdata || {}) != stringify(state.renderdata || {}) &&
      (whatchanger != 0 || state.whatchange != whatchanger)
    ) {
      console.log(
        'setting Use effect in changing data',
        changingdata,
        state.renderdata,
        whatchanger,
        state.whatchange
      );
      setState({ renderdata: changingdata, whatchange: whatchanger });
    }
  }, [changingdata]);

  useEffect(() => {
    console.log('Use effect in whatchanger', changingdata, whatchanger);
    if (
      stringify(changingdata || {}) != stringify(state.renderdata || {}) &&
      (whatchanger != 0 || state.whatchange != whatchanger)
    ) {
      console.log(
        'setting Use effect in in whatchanger',
        changingdata,
        state.renderdata,
        whatchanger,
        state.whatchange
      );
      setState({ renderdata: changingdata, whatchange: whatchanger });
    }
  }, [whatchanger]);

  useEffect(() => {
    const includeParts = true;
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
            setSelectedShell({ ...element }, true);
          }
        );
      }
      additionalSaveFunction(saveGDTDataTable);
    }
  }, [gltfjson]);

  useEffect(() => {
    if (tabIndex != 'gdtac' || keyName.name != '') {
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

    myTree.gdttable.push({
      ...defaultGDTTable,
      key: key,
      option: selectedFeature
    });
    updateSelectionFromTree([], false, selectedFeature);
    setSelectedOption(selectedFeature);
    console.log('My Tree', myTree);
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
      myTree.gdttable[myGlobalActiveDataTable].mateValues = mystate.mateValues
        ? [...mystate.mateValues]
        : Array(6).fill(false);
      myTree.gdttable[myGlobalActiveDataTable].angle = mystate.angle;
      myTree.gdttable[myGlobalActiveDataTable].offset = mystate.offset;
    }
    setState({ gltfjson: myTree });
    saveGDTInfo(myTree.gdttable, fileGDT, fileUUIder)
      .then((res) => res.data)
      .then((data) => {
        console.log('Getting Resources', data);
      });
  };
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
    for (let meshmaterial of copy_selectobjects) {
      const myAllChildsAndParents = findMyParentChilds(
        meshmaterial,
        whichoption
      );
      const myAllChilds = myAllChildsAndParents[0];
      const myParentNode = myAllChildsAndParents[1];
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
          const mylocalelement = { ...elementdata };
          setSelectedShell(mylocalelement, true);
          tempSelectedObjects.push(mylocalelement);
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
    var structure = {
      objects: tempSelectedObjects,
      mates: tempMates,
      start: mystate.selectedObjects.length
    };
    structure = await getShapeInformation(structure);
    tempSelectedObjects = structure.objects;

    setState({
      selectedObjects: tempSelectedObjects,
      parentObjects: tempParentObjects,
      mates: structure.mates
    });
    setResetOption(true);
  };

  const findSingleNode = (mynode) => {
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
      return null;
    } else {
      if (mystate_gltfjson && mystate_gltfjson.tree) {
        for (var i = 0; i < mystate_gltfjson.tree.length; i++) {
          if (mystate_gltfjson.tree[i][gltf_Dict['id']] == myParentID) {
            return mystate_gltfjson.tree[i];
          }
        }
      }

      return null;
    }
  };

  const findMySiblingElements = (mynode) => {
    var myParentID = mynode[gltf_Dict['parentId']];
    if (myParentID == -1) {
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
      return null;
    } else {
      var mySiblingNodes = [];
      const nullArray = stringify([null, null, null]);
      if (mystate_gltfjson && mystate_gltfjson.tree) {
        for (var i = 0; i < mystate_gltfjson.tree.length; i++) {
          if (
            mystate_gltfjson.tree[i][gltf_Dict['parentId']] == myParentID &&
            mystate_gltfjson.tree[i][gltf_Dict['id']] != myID &&
            stringify(mystate_gltfjson.tree[i][gltf_Dict['topLeft']] || {}) !==
              nullArray
          ) {
            mySiblingNodes.push(mystate_gltfjson.tree[i]);
          }
        }
      }
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

      if (myParentsParentID == -1) {
        //RootNode
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

    const getTopParentNode = (node) => {
      let nodeParentID = node[gltf_Dict['parentId']];
      if (nodeParentID == null || nodeParentID == 1) {
        return node;
      } else {
        if (mystate_gltfjson && mystate_gltfjson.tree) {
          for (var i = 0; i < mystate_gltfjson.tree.length; i++) {
            if (mystate_gltfjson.tree[i][gltf_Dict['id']] == nodeParentID) {
              let myParentsParent = getTopParentNode(mystate_gltfjson.tree[i]);
              if (myParentsParent) {
                return myParentsParent;
              }
            }
          }
        }
        return null;
      }
    };

    const myParentPart = findMyParentPart(mynode);
    if (myParentPart) {
      parentNode = myParentPart;
      myParentID = parentNode[gltf_Dict['id']];
    }
    var myMaterials = [];
    if (myParentID != -1) {
      var myParentsParentID = -1;
      if (mystate_gltfjson && mystate_gltfjson.tree) {
        for (var i = 0; i < mystate_gltfjson.tree.length; i++) {
          if (mystate_gltfjson.tree[i][gltf_Dict['id']] == myParentID) {
            myParentsParentID = mystate_gltfjson.tree[i][gltf_Dict['parentId']];
            if (myParentID != 1) {
              parentNode = mystate_gltfjson.tree[i];
            }
            break;
          }
        }
      }
      var myParents = [];
      if (myParentID == 1) {
        myParents.push(myID);
      } else {
        if (myParentsParentID == -1 || myParentsParentID == 1) {
          //RootNode
          //console.log("Pushing", myParentsParentID, myParentID, myID);
          myParents.push(myParentID);
        } else {
          if (mystate_gltfjson && mystate_gltfjson.tree) {
            for (i = 0; i < mystate_gltfjson.tree.length; i++) {
              if (
                mystate_gltfjson.tree[i][gltf_Dict['parentId']] ===
                myParentsParentID
              ) {
                myParents.push(mystate_gltfjson.tree[i][gltf_Dict['id']]);
              } else {
                if (
                  mystate_gltfjson.tree[i][gltf_Dict['id']] ===
                  myParentsParentID
                ) {
                  parentNode = mystate_gltfjson.tree[i];
                }
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
    let myTopParent = parentNode ? parentNode : mynode;
    if (
      myTopParent &&
      myTopParent[gltf_Dict['id']] != 1 &&
      myTopParent[gltf_Dict['parentId']] != 1
    ) {
      myTopParent = getTopParentNode(myTopParent);
    }

    if (myMaterials.length != 0) {
      return [myMaterials, myTopParent];
    }
    return [[mynode], mynode];
  };

  const findMyParentChilds = (mynode, whichOption) => {
    const mystate = isEmptyObject(state) ? myGlobalState : state;
    if (
      ((whichOption != SELECTSOLID && whichOption != SELECTASSEMBLY) ||
        mystate.splitMethod != SELECTDISECTPARTS) &&
      resetOption
    ) {
      return findSingleNode(mynode);
    }
    if (whichOption == SELECTASSEMBLY) {
      return findFamilyNodes(mynode);
    } else {
      return findSiblingNodes(mynode);
    }
  };

  const findMyMaterial = (data) => {
    const mystate = isEmptyObject(state) ? myGlobalState : state;
    let mystate_gltfjson = mystate.gltfjson || gltfjson;
    if (!mystate_gltfjson || !mystate_gltfjson.tree) {
      setState({ gltfjson: gltfjson });
      mystate_gltfjson = gltfjson;
    }
    //console.log('Find my Material', data, mystate_gltfjson.tree);
    if (mystate_gltfjson.tree) {
      for (var i = 0; i < mystate_gltfjson.tree.length; i++) {
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
    try {
      _setState((prevState) => {
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
    var partArray = [];
    //var firstOne = null;

    structure.objects.forEach((element) => {
      if (element[gltf_Dict['step']]) {
        const stepFile = element[gltf_Dict['step']].slice(0, -5);
        //if(!firstOne) firstOne=stepFile;
        stepArray.push(stepFile);
        var siblings = [];
        if (element[gltf_Dict['element']] == 'E') {
          const myParentOfElement = findMySiblingElements(element);
          if (myParentOfElement) {
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
        siblingArray.push(siblings);
        const myparentpart = findMyParentPart(element);
        if (myparentpart) {
          const partfile = myparentpart[gltf_Dict['step']].slice(0, -5);
          partArray.push(partfile);
        } else {
          partArray.push(null);
        }
      }
    });

    return new Promise((resolve, reject) => {
      getShapeInfo(
        structure.start,
        stepArray,
        siblingArray,
        partArray,
        fileUUIder
      )
        .then((res) => res.data)
        .then((repos) => {
          if (!repos || repos.length == 0) {
            resolve(structure);
            return;
          }
          for (let index = 0; index < repos.length; index++) {
            structure.mates[structure.start + index] = repos[index][1];
            const element = repos[index][0];
            structure.objects[structure.start + index]['type'] =
              element[0].type;
            structure.objects[structure.start + index]['kind'] =
              element[0].Info['kind'];
            structure.objects[structure.start + index]['fill'] =
              element[0].fill;
            structure.objects[structure.start + index]['obb'] = element[0].obb;
            structure.objects[structure.start + index]['axis'] =
              element[0].direction;
            if (
              element[0].Info['kind'] === 'Circle' ||
              element[0].Info['kind'] === 'Cylinder'
            ) {
              structure.objects[structure.start + index]['diameter'] =
                2.0 *
                (element[0].Info['radius'] ? element[0].Info['radius'] : 0);
            }
          }
          resolve(structure);
        })
        .catch((error) => {
          resolve(structure);
        });
    });
  };
  let mapdata = {};
  const setSelectedShell = (data, setoption, insteadstate = null) => {
    const mystate = isEmptyObject(state) ? myGlobalState : state;
    const mystate_gltfjson = insteadstate ? insteadstate : mystate.gltfjson; //| gltfjson;
    if (!mystate_gltfjson) {
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
    const aShape = element[gltf_Dict['name']];
    const first4chars = aShape.slice(0, 4);
    const first6chars = aShape.slice(0, 6);
    if (
      first4chars == 'FACE' ||
      first4chars == 'EDGE' ||
      first4chars == 'PART' ||
      first6chars == 'VERTEX'
    ) {
      element.selectedshell = true;
      const mymesh = { ...element }; //findMyMaterial(element);
      if (mymesh) {
        mymesh.selectedshell = true;
        changeStateOfSelection(mymesh, event);
        event['ctrlKey'] = true;
      }
    }
  };

  const expandSelectionFromTree = (nodes) => {
    myGlobalTree = nodes;
  };

  const addSelectionFromTree = async (selectedNodes) => {
    selectedNodes.forEach((element) => {
      element.selectedshell = true;
    });
    if (ctrlKey != false) {
      setCtrlKey(false);
    }
    setState({ renderdata: selectedNodes, whatchange: SELECTANITEM });
    updateSelectionFromTree(selectedNodes, true, selectedOption);
  };

  const updateSelectionFromTree = async (
    selectedNodes,
    toGetShapeInfo,
    selectedFeature
  ) => {
    var whatIsNotThereToAdd = [];
    var whatIsAvailableToRemove = [];
    const mystate = isEmptyObject(state) ? myGlobalState : state;
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
      changeStateOfSelections(
        whatIsAvailableToRemove,
        whatIsNotThereToAdd,
        toGetShapeInfo,
        selectedFeature
      );
    } else {
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
    if (selectedOption == SELECTMEASURE) {
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
          }
        }
      }
    } else {
      var copy_selectobjects = [];
      var copy_parentobjects = [];
      var copy_mateobjects = [];
      const mystate = isEmptyObject(state) ? myGlobalState : state;
      if (data) {
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
        }
        const myAllChildsAndParents = findMyParentChilds(data, selectedOption);
        const myAllChilds = myAllChildsAndParents[0];
        const myParentNode = myAllChildsAndParents[1];

        for (let elementdata of myAllChilds) {
          //elementdata.selectedshell = data.selectedshell;
          let localelementdata = { ...elementdata };
          setSelectedShell(localelementdata, data.selectedshell);
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
                localelementdata['parentnode'] = { ...myParentNode };
                copy_selectobjects.push(localelementdata);
                copy_mateobjects.push([]);
                toGetInfo = true;
              }
            } else {
              //error here...
              const currentIndex = arrayFindIndex(
                copy_selectobjects,
                elementdata[gltf_Dict['name']]
              );
              if (currentIndex != -1) {
                copy_selectobjects = arrayRemove(
                  copy_selectobjects,
                  elementdata[gltf_Dict['name']]
                );
                copy_mateobjects.splice(currentIndex, 1);
                for (
                  let mateindex = currentIndex;
                  mateindex < copy_mateobjects.length;
                  mateindex++
                ) {
                  copy_mateobjects[mateindex].splice(currentIndex, 1);
                }
              }
            }
          } else {
            if (data.selectedshell) {
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
          structure = await getShapeInformation(structure);
          copy_selectobjects = structure.objects;
          copy_mateobjects = structure.mates;
        } else {
        }

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
            }
          } else {
            copy_parentobjects = arrayRemove(
              copy_parentobjects,
              myParentNode[gltf_Dict['name']],
              true
            );
            setState({ parentObjects: copy_parentobjects });
          }
        } else {
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
      handleChangeOfSelection(copy_selectobjects);
    } else {
      console.log(
        'No Call back for handlechangeofselction since it is from gdt',
        copy_selectobjects
      );
    }
  };

  const changeStateOfSelections = async (
    removeData,
    addData,
    toAddShapeInfo,
    selectedFeature
  ) => {
    mapdata = {};
    const mystate = isEmptyObject(state) ? myGlobalState : state;
    var copy_selectobjects = arrayCopy(mystate.selectedObjects);
    var copy_parentobjects = arrayCopy(mystate.parentObjects);
    var copy_mateobjects = arrayCopy(mystate.mates);

    removeData.forEach((data) => {
      if (data) {
        const myAllChildsAndParents = findMyParentChilds(data, selectedFeature);
        const myAllChilds = myAllChildsAndParents[0];
        const myParentNode = myAllChildsAndParents[1];

        for (let elementdata of myAllChilds) {
          setSelectedShell({ ...elementdata }, false);
          if (toAddShapeInfo) {
            const currentIndex = arrayFindIndex(
              copy_selectobjects,
              elementdata[gltf_Dict['name']]
            );
            if (currentIndex != -1) {
              copy_selectobjects = arrayRemove(
                copy_selectobjects,
                elementdata[gltf_Dict['name']]
              );
              copy_mateobjects.splice(currentIndex, 1);
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
        const myAllChilds = myAllChildsAndParents[0];
        const myParentNode = myAllChildsAndParents[1];
        for (let elementdata of myAllChilds) {
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
      structure = await getShapeInformation(structure);
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
      handleChangeOfSelection(copy_selectobjects);
    } else {
      console.log(
        'No Call back for handlechangeofselctions since it is from gdt',
        copy_selectobjects
      );
    }
  };

  const handleModelClick = (data, what, event) => {
    //console.log('Handling model click', data);

    if (what == SELECTANITEM) {
      if (data) {
        const mymesh = findMyMaterial(data);
        if (mymesh) {
          const mymeshcopy = { ...mymesh };
          if (additionalModelClick) {
            if (selectedOption == SELECTASSEMBLY) {
              const myAllChildsAndParents = findMyParentChilds(
                mymeshcopy,
                selectedOption
              );
              additionalModelClick(myAllChildsAndParents);
            }
          }
          //mymesh.selectedshell = data.selectedshell;
          setSelectedShell(mymeshcopy, data.selectedshell);
          return changeStateOfSelection(mymeshcopy, event);
        } else {
          console.log('No Mesh', mymesh, data);
        }
      } else {
        return changeStateOfSelection(data, event);
      }
      if (event && event.ctrlKey != ctrlKey) {
        setCtrlKey(ctrlKey, event.ctrlKey);
      }
    }
    return null;
  };

  /* if (isLoading) {
    return <CircularProgress />;
  } */

  return (
    <Box className={classes.mainContainer}>
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
          centerActionText={centerActionTexter}
          completionProgressText={completionProgressTexter}
          //setProgressBarRender={setProgressBarRender}
          setPercentage={setPercentager}
          setProgressBarLoad={setProgressBarLoader}
          setCurrentProgressText={setCurrentProgressTexter}
          setCompletionProgressText={setCompletionProgressTexter}
          setCenterActionText={setCenterActionTexter}
          drawLine={drawLiner}
          fileAnimation={fileAnimation}
          tabIndex={tabIndex}
          showKinematicMove={showKinematicMove}
        />
      </Paper>

      {optionForAssemblyTree == 'Configuration' && tabIndex == 'gdtac' && (
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
      )}
    </Box>
  );
}
