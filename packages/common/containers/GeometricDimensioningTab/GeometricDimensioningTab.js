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
  elementCopy,
  arrayFindIndex,
  arrayRemove,
  gltf_Dict,
  isEmptyObjectDictionary,
  SELECTCIRCULAR,
  SELECTLINEAR
  //assignDictionary,
  //assignArray
} from '@monostruct/common/gltf/Tree/utils';
import { stringify } from '@monostruct/common/gltf/Flatted.js';
import AssemblyTabWithTree from '@monostruct/common/containers/AssemblyTabWithTree';
import { buildParentChildTree } from './helper';
import { Box } from '@mui/system';

let myGlobalTree = null;
let myGlobalState = {};
let myGlobalActiveDataTable = 0;

export default function GeometricDimensioningTab(props) {
  const {
    tabIndex,
    fileId,
    fileUUId,
    fileGDT,
    gltfjson,
    setgltfjson,
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
    regenerateKinematicMove = 0,
    additionalModelClick = null,
    activeGLTFFile = '',
    setActiveGLTFile = () => {},
    activeGDTTable = 0,
    setActiveGDTTable = () => {},
    drawAxisLines = null,
    setDrawAxisLines = () => {}
  } = props;
  const classes = USESTYLES();

  const [state, _setState] = useState({});
  const [resetOption, setResetOption] = useState(true);
  const [ctrlKey, setCtrlKey] = useState(false);
  const [optionForAssemblyTree, setOptionForAssemblyTree] =
    useState('Configuration');
  const [activeDataTable, setActiveDataTable] = useState(activeGDTTable);
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
    setActiveDataTable(activeGDTTable);
  }, [activeGDTTable]);

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
    console.log(
      'Use effect in changing data',
      changingdata,
      whatchanger,
      gltfjson
    );
    if (tabIndex == 'iupc') {
      if (
        stringify(changingdata || {}) != stringify(state.renderdata || {}) &&
        whatchanger
      ) {
        console.log(
          'setting Use effect in changing data',
          changingdata,
          state.renderdata,
          whatchanger,
          state.whatchange,
          changingdata.length
        );
        if (changingdata.length > 0) {
          setState({
            renderdata: changingdata,
            whatchange: whatchanger,
            firstshell: null,
            secondshell: null,
            selectedObjects: [],
            parentObjects: [],
            mates: []
          });
        }
      }
    } else {
      /* console.log(
        'Not changing data in Use effect in whatchanger',
        changingdata,
        whatchanger,
        state.renderdata,
        state.whatchange,
        gltfjson
      );
      if (
        state.renderdata &&
        state.renderdata.length > 0 &&
        state.whatchange != SELECTANITEM
      ) {
        setState({
          renderdata: state.renderdata,
          whatchange: SELECTANITEM
        });
      } */
    }
  }, [changingdata]);

  useEffect(() => {
    console.log(
      'Use effect in whatchanger',
      changingdata,
      whatchanger,
      gltfjson
    );
    if (tabIndex == 'iupc') {
      if (
        stringify(changingdata || {}) != stringify(state.renderdata || {}) &&
        whatchanger != 0
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
    } else {
      console.log(
        'Not changing data in Use effect in whatchanger',
        changingdata,
        whatchanger,
        state.renderdata,
        gltfjson
      );
    }
  }, [whatchanger]);

  useEffect(() => {
    const includeParts = true;
    const gltfjsonlen = gltfjson ? Object.keys(gltfjson).length : 0;
    console.log('Changing gltfjson', gltfjson, state.gltfjson);
    if (gltfjsonlen > 0) {
      myGlobalTree = null;
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
              ? arrayCopy(
                  gltfjson.gdttable[myGlobalActiveDataTable].selectedObjects
                )
              : []
            : []
          : [],
        parentObjects: gltfjson
          ? gltfjson.gdttable
            ? gltfjson.gdttable[myGlobalActiveDataTable]
              ? arrayCopy(
                  gltfjson.gdttable[myGlobalActiveDataTable].parentObjects
                )
              : []
            : []
          : [],
        mates: gltfjson
          ? gltfjson.gdttable
            ? gltfjson.gdttable[myGlobalActiveDataTable]
              ? arrayCopy(gltfjson.gdttable[myGlobalActiveDataTable].mates)
              : []
            : []
          : [],
        mateValues: gltfjson
          ? gltfjson.gdttable
            ? gltfjson.gdttable[myGlobalActiveDataTable]
              ? arrayCopy(gltfjson.gdttable[myGlobalActiveDataTable].mateValues)
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
          : 0
        //renderdata: gltfjson.renderdata || {},
        //whatchange: 0
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
    if (tabIndex == 'iupc' || keyName.name != '') {
      console.log('before Setting the current active table', keyName, gltfjson);
      if (gltfjson && gltfjson.gdttable) {
        setCurrentDataTableFromKey(
          keyName.name,
          keyName.option,
          keyName.selectedNodes
        );
        console.log(
          'after Setting the current active table',
          keyName,
          gltfjson
        );
      } else {
        console.log(
          'Ignoring the inititalization routine of set keyname',
          keyName
        );
      }
    } else {
      console.log('Not Setting key as I am from gdt', keyName.name);
    }
  }, [keyName]);

  const globalSetGltfJSon = (json) => {
    try {
      setgltfjson(json);
    } catch (error) {
      console.log('While setting gltfjson', error);
    }
  };

  const resetSelections = async (
    activeTable,
    previousActivetable,
    myTree,
    selectedNodes
  ) => {
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
      mates: [],
      mateValues: Array(6).fill(false),
      angle: 0,
      offset: 0
    });
    if (myTree) {
      setState({ gltfjson: myTree });
      globalSetGltfJSon(myTree);
      globalSetActiveDataTable(activeTable);
      if (!showKinematicMove && myTree.gdttable && fileGDT && fileUUIder) {
        const savedData = await saveGDTInfo(
          myTree.gdttable,
          fileGDT,
          fileUUIder
        );
        console.log('Saved data from reset selections', savedData);
      } else {
        console.log(
          'I am not saving data from reset selections',
          myTree.gdttable
        );
      }

      // .then((res) => res.data)
      // .then((data) => {
      //   console.log(
      //     'Getting saved Resources from gdt',
      //     data,
      //     myTree.gdttable
      //   );
      // });
    }
  };

  const isEmptyObject = (obj) => {
    if (!obj) {
      return true;
    }
    return Object.keys(obj).length === 0;
  };

  const getMyTree = (option) => {
    const mystate = isEmptyObject(state) ? myGlobalState : state;
    let mystate_gltfjson = mystate.gltfjson || gltfjson;
    if (!mystate_gltfjson || !mystate_gltfjson.tree) {
      setState({ gltfjson: gltfjson });
      mystate_gltfjson = gltfjson;
    }
    let myTree = { ...mystate_gltfjson }; //elementCopy(mystate_gltfjson);

    let gdttable = myTree.gdttable || [{ ...defaultGDTTable, option: option }];
    myTree.gdttable = arrayCopy(gdttable);
    if (myTree.gdttable[myGlobalActiveDataTable]) {
      myTree.gdttable[myGlobalActiveDataTable].selectedObjects =
        mystate.selectedObjects ? arrayCopy(mystate.selectedObjects) : [];
      myTree.gdttable[myGlobalActiveDataTable].parentObjects =
        mystate.parentObjects ? arrayCopy(mystate.parentObjects) : [];
      myTree.gdttable[myGlobalActiveDataTable].mates = mystate.mates
        ? arrayCopy(mystate.mates)
        : [];
      myTree.gdttable[myGlobalActiveDataTable].option = selectedOption;
      myTree.gdttable[myGlobalActiveDataTable].mateValues = mystate.mateValues
        ? arrayCopy(mystate.mateValues)
        : Array(6).fill(false);
      myTree.gdttable[myGlobalActiveDataTable].angle = mystate.angle;
      myTree.gdttable[myGlobalActiveDataTable].offset = mystate.offset;
    } else {
      console.log('I am not assigning state option', selectedOption, option);
    }
    return myTree;
  };

  const incrementActiveDataTable = async (
    key = '',
    selectedFeature = SELECTFEATURE,
    selectedNodes = null
  ) => {
    /* const mystate = isEmptyObject(state) ? myGlobalState : state;
    let mystate_gltfjson = mystate.gltfjson || gltfjson;
    if (!mystate_gltfjson || !mystate_gltfjson.tree) {
      setState({ gltfjson: gltfjson });
      mystate_gltfjson = gltfjson;
    }
    let myTree = elementCopy(mystate_gltfjson); //{ ...mystate_gltfjson };
    let gdttable = [];
    if (isEmptyObjectDictionary(myTree.gdttable)) {
      gdttable = [defaultGDTTable];
    } else {
      gdttable = myTree.gdttable || [defaultGDTTable];
    }

    //console.log('My tree gdttable1', myTree.gdttable, gdttable);
    myTree.gdttable = arrayCopy(gdttable);
    if (myTree.gdttable[myGlobalActiveDataTable]) {
      myTree.gdttable[myGlobalActiveDataTable].selectedObjects =
        mystate.selectedObjects ? arrayCopy(mystate.selectedObjects) : [];
      myTree.gdttable[myGlobalActiveDataTable].parentObjects =
        mystate.parentObjects ? arrayCopy(mystate.parentObjects) : [];
      myTree.gdttable[myGlobalActiveDataTable].mates = mystate.mates
        ? arrayCopy(mystate.mates)
        : [];
      myTree.gdttable[myGlobalActiveDataTable].option = selectedOption;
    } */
    let myTree = getMyTree(selectedOption);
    let previousActivetable = myGlobalActiveDataTable;
    let activetable = myTree.gdttable.length;
    //console.log('My tree gdttable', myTree.gdttable, activetable);
    myTree.gdttable.push({
      ...elementCopy(defaultGDTTable),
      key: key,
      option: selectedFeature
    });
    console.log('Coming from here2', myTree);
    await updateSelectionFromTree(
      selectedNodes ? selectedNodes : [],
      false,
      selectedFeature,
      activetable,
      previousActivetable,
      myTree
    );
    /*  setSelectedOption(selectedFeature);
    console.log('My Tree', myTree);
    if (!selectedNodes) {
      setState({
        gltfjson: myTree,
        selectedObjects: [],
        parentObjects: [],
        mates: [],
        mateValues: Array(6).fill(false),
        angle: 0,
        offset: 0
      });
      setgltfjson(myTree);
    } */

    //globalSetActiveDataTable(activetable);
  };

  const globalSetActiveDataTable = (activetable) => {
    try {
      myGlobalActiveDataTable = activetable;
      setActiveDataTable(activetable);
      setActiveGDTTable(activetable);
    } catch (error) {
      console.log('Errir while assigning globalstate', error);
    }
  };
  const setCurrentDataTableFromKey = async (key, option, selectedNodes) => {
    const mystate = isEmptyObject(state) ? myGlobalState : state;
    let mystate_gltfjson = mystate.gltfjson || gltfjson;
    if (!mystate_gltfjson || !mystate_gltfjson.tree) {
      setState({ gltfjson: gltfjson });
      mystate_gltfjson = gltfjson;
    }
    let myTree = { ...mystate_gltfjson };
    let gdttable = myTree.gdttable || [{ ...defaultGDTTable, option: option }];
    //console.log('Before assigning', gdttable, key, option);
    for (let index = 0; index < gdttable.length; index++) {
      const element = gdttable[index];
      if (element.key == key) {
        await setCurrentDataTable(index, option, selectedNodes);
        return;
      }
    }
    await incrementActiveDataTable(key, option, selectedNodes);
  };
  const setCurrentDataTable = async (
    activetable,
    option = null,
    selectedNodes = null
  ) => {
    if (activetable != myGlobalActiveDataTable) {
      let previousActivetable = myGlobalActiveDataTable;
      let myoption = option ? option : selectedOption;
      let myTree = getMyTree(myoption);
      console.log(
        'Coming from here3',
        myGlobalActiveDataTable,
        activetable,
        selectedNodes
          ? selectedNodes
          : myTree.gdttable[activetable].selectedObjects,
        myTree.gdttable
      );
      if (!selectedNodes && myTree.gdttable[activetable].selectedObjects) {
        setState({
          renderdata: myTree.gdttable[activetable].selectedObjects,
          whatchange: SELECTANITEM
        });
      }
      await updateSelectionFromTree(
        selectedNodes
          ? selectedNodes
          : myTree.gdttable[activetable].selectedObjects,
        false,
        myoption,
        activetable,
        previousActivetable,
        myTree
      );

      /* setSelectedOption(myTree.gdttable[activetable].option);
      console.log('Setting states', myTree.gdttable[activetable]);
      setState({
        gltfjson: myTree,
        selectedObjects: [...myTree.gdttable[activetable].selectedObjects],
        parentObjects: myTree.gdttable[activetable].parentObjects,
        mates: myTree.gdttable[activetable].mates,
        mateValues: myTree.gdttable[activetable].mateValues,
        angle: myTree.gdttable[activetable].angle,
        offset: myTree.gdttable[activetable].offset
      });
      console.log('Setting activetable', activetable); */
      //globalSetActiveDataTable(activetable);
    } else {
      console.log(
        'Current itself is mine',
        activetable,
        myGlobalActiveDataTable
      );
    }
  };

  const saveGDTDataTable = () => {
    /* const mystate = isEmptyObject(state) ? myGlobalState : state;
    console.log('While saving gdt', myGlobalState, state, selectedOption);
    let mystate_gltfjson = mystate.gltfjson || gltfjson;
    if (!mystate_gltfjson || !mystate_gltfjson.tree) {
      setState({ gltfjson: gltfjson });
      mystate_gltfjson = gltfjson;
    } */
    if (showKinematicMove) {
      console.log(
        'I am not saving data because animation is ',
        showKinematicMove
      );

      return;
    }
    let myTree = getMyTree(selectedOption);
    /* let myTree = {...mystate_gltfjson};
    let gdttable = [];
    if (isEmptyObjectDictionary(myTree.gdttable)) {
      gdttable = [defaultGDTTable];
    } else {
      gdttable = myTree.gdttable || [defaultGDTTable];
    }
    myTree.gdttable = arrayCopy(gdttable);
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
    } */
    setState({ gltfjson: myTree });
    if (myTree.gdttable && fileGDT && fileUUIder) {
      saveGDTInfo(myTree.gdttable, fileGDT, fileUUIder)
        .then((res) => res.data)
        .then((data) => {
          console.log(
            'Getting saved Resources from gdt',
            data,
            myTree.gdttable
          );
        });
    }
  };
  const resetActiveDataTable = async () => {
    const mystate = isEmptyObject(state) ? myGlobalState : state;
    let mystate_gltfjson = mystate.gltfjson || gltfjson;
    if (!mystate_gltfjson || !mystate_gltfjson.tree) {
      setState({ gltfjson: gltfjson });
      mystate_gltfjson = gltfjson;
    }
    let myTree = { ...mystate_gltfjson }; //elementCopy(mystate_gltfjson);
    let gdttable = myTree.gdttable || [defaultGDTTable];
    myTree.gdttable = arrayCopy(gdttable);
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
    console.log('Coming from here4', myTree);
    await updateSelectionFromTree(
      [],
      false,
      selectedOption,
      myGlobalActiveDataTable,
      myGlobalActiveDataTable,
      myTree
    );
    /* if (myTree.tree) {
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
    setgltfjson(myTree);
    */
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
      let element = elementCopy(myobject[index]);
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
      ? arrayCopy(mystate.mateValues)
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
    globalSetGltfJSon(gltfjsonobj);
    console.log('After new set', gltfjson, gltfjsonobj);
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
          const mylocalelement = elementCopy(elementdata); //{ ...elementdata };
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
          parent: elementCopy(myParentNode),
          child: arrayCopy(myAllChilds)
        };
        tempParentObjects.push(node);
      }
    }
    var structure = {
      objects: [...tempSelectedObjects],
      mates: [...tempMates],
      start: mystate.selectedObjects.length
    };
    structure = await getShapeInformation(structure);
    tempSelectedObjects = structure.objects;
    tempMates = structure.mates;
    if (selectedOption == SELECTCIRCULAR || selectedOption == SELECTLINEAR) {
      let axisArray = [];
      for (
        let indexObject = mystate.selectedObjects.length;
        indexObject < tempSelectedObjects.length;
        indexObject++
      ) {
        const element = tempSelectedObjects[indexObject];
        console.log('Checking elements', element);
        if (element.axis) {
          axisArray.push({
            axis: element.axis,
            position: element.position ? element.position : [0, 0, 0],
            name: element[gltf_Dict['name']]
          });
        }
      }
      console.log('Getting', axisArray);
      setDrawAxisLines(axisArray);
    } else {
      console.log('Option is', selectedOption);
    }
    setState({
      selectedObjects: [...tempSelectedObjects],
      parentObjects: [...tempParentObjects],
      mates: [...tempMates]
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
        if (mystate_gltfjson.tree[i] && mynode) {
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
    }

    if (myParentID == -1) {
      return null;
    } else {
      var myParentsParentID = -1;
      if (mystate_gltfjson && mystate_gltfjson.tree) {
        for (var i = 0; i < mystate_gltfjson.tree.length; i++) {
          if (mystate_gltfjson.tree[i]) {
            if (mystate_gltfjson.tree[i][gltf_Dict['id']] == myParentID) {
              myParentsParentID =
                mystate_gltfjson.tree[i][gltf_Dict['parentId']];
              if (mystate_gltfjson.tree[i][gltf_Dict['element']] == 'P') {
                return mystate_gltfjson.tree[i];
              } else {
                break;
              }
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
            if (mystate_gltfjson.tree[i]) {
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
    var mySelectedNode = mynode;
    var parentNode = null;
    const mystate = isEmptyObject(state) ? myGlobalState : state;
    let mystate_gltfjson = mystate.gltfjson || gltfjson;
    if (!mystate_gltfjson || !mystate_gltfjson.tree) {
      setState({ gltfjson: gltfjson });
      mystate_gltfjson = gltfjson;
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
    const getAllChildNodes = (node) => {
      const nodeID = node[gltf_Dict['id']];
      let childNodes = [];
      if (node[gltf_Dict['element']] == 'P') {
        childNodes = [node];
      }
      if (mystate_gltfjson && mystate_gltfjson.tree) {
        for (var i = 0; i < mystate_gltfjson.tree.length; i++) {
          const curNode = mystate_gltfjson.tree[i];
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
    if (mystate_gltfjson && mystate_gltfjson.tree) {
      for (var i = 0; i < mystate_gltfjson.tree.length; i++) {
        if (
          mystate_gltfjson.tree[i][gltf_Dict['name']] ==
          mynode[gltf_Dict['name']]
        ) {
          mySelectedNode = mystate_gltfjson.tree[i];
          myParentID = mySelectedNode[gltf_Dict['parentId']];
          myID = mySelectedNode[gltf_Dict['id']];
          parentNode = mySelectedNode;
          break;
        }
      }
    }
    const myParentPart = findMyParentPart(mynode);
    if (myParentPart) {
      parentNode = myParentPart;
      myParentID = parentNode[gltf_Dict['id']];
    }

    if (myParentID != -1) {
      if (myParentID != 1) {
        var myParentsParentID = -1;
        if (mystate_gltfjson && mystate_gltfjson.tree) {
          for (var i = 0; i < mystate_gltfjson.tree.length; i++) {
            if (mystate_gltfjson.tree[i][gltf_Dict['id']] == myParentID) {
              myParentsParentID =
                mystate_gltfjson.tree[i][gltf_Dict['parentId']];
              if (myParentsParentID != 1) {
                parentNode = mystate_gltfjson.tree[i];
              }
              break;
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
      var myMaterials = [];
      if (myParentID == 1) {
        myMaterials = getAllChildNodes(
          mySelectedNode ? mySelectedNode : mynode
        );
      } else {
        myMaterials = getAllChildNodes(
          myTopParent ? myTopParent : mySelectedNode ? mySelectedNode : mynode
        );
      }
      if (myMaterials.length != 0) {
        return [myMaterials, myTopParent];
      }
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
    console.log('Find my Material', data, mystate_gltfjson.tree);
    if (mystate_gltfjson.tree) {
      for (var i = 0; i < mystate_gltfjson.tree.length; i++) {
        if (mystate_gltfjson.tree[i][gltf_Dict['name']] == data['name']) {
          return mystate_gltfjson.tree[i];
        }
      }
    }
    //console.log('Nomesh found', mystate_gltfjson.tree, data);
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
    //console.log('before setting', myGlobalState);
    myGlobalState = { ...myGlobalState, ...data };
    //console.log('after setting', myGlobalState);
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
            structure.objects[structure.start + index]['obb'] = elementCopy(
              element[0].obb
            );
            structure.objects[structure.start + index]['axis'] = element[0]
              .Info['direction']
              ? elementCopy(element[0].Info['direction'])
              : null;
            structure.objects[structure.start + index]['position'] = element[0]
              .Info['location']
              ? elementCopy(element[0].Info['location'])
              : null;
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
          if (element && element[[gltf_Dict['id']]] == myID) {
            curData = index;
            mapdata[myID] = index;
            break;
          }
        }
      }
    }
    if (typeof curData !== 'undefined') {
      let myTree = insteadstate ? insteadstate : { ...mystate_gltfjson };
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

  const doOneSelection = async (element, event) => {
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
      let mymesh = { ...element }; //findMyMaterial(element);
      if (mymesh) {
        mymesh.selectedshell = true;
        await changeStateOfSelection(mymesh, event);
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
    const mystate = isEmptyObject(state) ? myGlobalState : state;
    let mystate_gltfjson = mystate.gltfjson || gltfjson;
    if (!mystate_gltfjson || !mystate_gltfjson.tree) {
      setState({ gltfjson: gltfjson });
      mystate_gltfjson = gltfjson;
    }
    let myTree = { ...mystate_gltfjson }; //elementCopy(mystate_gltfjson);
    console.log('Coming from here1');
    await updateSelectionFromTree(
      selectedNodes,
      true,
      selectedOption,
      myGlobalActiveDataTable,
      myGlobalActiveDataTable,
      myTree
    );
  };

  const updateSelectionFromTree = async (
    selectedNodes,
    toGetShapeInfo,
    selectedFeature,
    activeTable,
    previousActivetable,
    myTree
  ) => {
    var whatIsNotThereToAdd = [];
    var whatIsAvailableToRemove = [];
    const mystate = isEmptyObject(state) ? myGlobalState : state;
    const state_selectedObjects = mystate.selectedObjects
      ? [...mystate.selectedObjects]
      : [];
    selectedNodes.forEach((myelement) => {
      const element = elementCopy(myelement);
      var elementFound = false;
      for (let index = 0; index < state_selectedObjects.length; index++) {
        const stateElement = state_selectedObjects[index];
        if (element[gltf_Dict['name']] == stateElement[gltf_Dict['name']]) {
          elementFound = true;
          break;
        }
      }
      if (!elementFound) {
        console.log('GOing to add', element, selectedNodes);
        whatIsNotThereToAdd.push(element);
      }
    });

    state_selectedObjects.forEach((mystateElement) => {
      const stateElement = elementCopy(mystateElement);
      var elementFound = false;
      for (let index = 0; index < selectedNodes.length; index++) {
        const element = selectedNodes[index];
        if (element[gltf_Dict['name']] == stateElement[gltf_Dict['name']]) {
          elementFound = true;
          break;
        }
      }
      if (!elementFound) {
        console.log('GOing to Remove', stateElement, selectedNodes);
        whatIsAvailableToRemove.push(stateElement);
      }
    });

    if (
      (selectedNodes && selectedNodes.length != 0) ||
      whatIsAvailableToRemove.length != 0 ||
      whatIsNotThereToAdd.length != 0
    ) {
      console.log(
        'changeStateOfSelections',
        selectedNodes,
        whatIsAvailableToRemove,
        whatIsNotThereToAdd,
        toGetShapeInfo,
        selectedFeature,
        activeTable,
        previousActivetable
      );
      await changeStateOfSelections(
        whatIsAvailableToRemove,
        whatIsNotThereToAdd,
        toGetShapeInfo,
        selectedFeature,
        activeTable,
        previousActivetable,
        myTree,
        selectedNodes
      );
    } else {
      await resetSelections(
        activeTable,
        previousActivetable,
        myTree,
        selectedNodes
      );
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
        const myAllChilds = arrayCopy(myAllChildsAndParents[0]);
        const myParentNode = elementCopy(myAllChildsAndParents[1]);

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
          console.log('Got results', structure);

          copy_selectobjects = structure.objects ? structure.objects : [];
          copy_mateobjects = structure.mates ? structure.mates : [];

          if (
            selectedOption == SELECTCIRCULAR ||
            selectedOption == SELECTLINEAR
          ) {
            let axisArray = [];
            for (
              let indexObject = stateLength;
              indexObject < copy_selectobjects.length;
              indexObject++
            ) {
              const element = copy_selectobjects[indexObject];
              console.log('Checking elements', element);
              if (element.axis) {
                axisArray.push({
                  axis: element.axis,
                  position: element.position ? element.position : [0, 0, 0],
                  name: element[gltf_Dict['name']]
                });
              }
            }
            console.log('Getting points to draw the selection', axisArray);
            setDrawAxisLines(axisArray);
          } else {
            console.log('Option is', selectedOption);
          }
        } else {
        }

        setState({
          selectedObjects: [...copy_selectobjects],
          mates: [...copy_mateobjects]
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
              const newParentObjects = [
                ...arrayCopy(
                  mystate.parentObjects ? mystate.parentObjects : []
                ),
                node
              ];
              setState({
                parentObjects: newParentObjects
              });
              let newgltfjson = { ...gltfjson };

              console.log(
                'Fomr1',
                newgltfjson,
                newgltfjson.gdttable,
                myGlobalActiveDataTable
              );
              if (newgltfjson.gdttable[myGlobalActiveDataTable]) {
                newgltfjson.gdttable[myGlobalActiveDataTable].selectedObjects =
                  [...copy_selectobjects];
                newgltfjson.gdttable[myGlobalActiveDataTable].parentObjects = [
                  ...newgltfjson.gdttable[myGlobalActiveDataTable]
                    .parentObjects,
                  node
                ];
                newgltfjson.gdttable[myGlobalActiveDataTable].mates = [
                  ...copy_mateobjects
                ];
                //const renderingdata = changingdata || state.renderdata;
                //newgltfjson.renderdata = renderingdata;
                globalSetGltfJSon(newgltfjson);
                console.log(
                  'adding parent object gltfjson.gdttable[myGlobalActiveDataTable]',
                  node,
                  newgltfjson,
                  myGlobalState
                );
              }
            } else {
            }
          } else {
            copy_parentobjects = arrayRemove(
              copy_parentobjects,
              myParentNode[gltf_Dict['name']],
              true
            );
            const newParentObjects = copy_parentobjects;
            setState({ parentObjects: newParentObjects });
            let newgltfjson = { ...gltfjson };
            console.log(
              'Fomr2',
              newgltfjson,
              newgltfjson.gdttable,
              myGlobalActiveDataTable
            );
            if (newgltfjson.gdttable[myGlobalActiveDataTable]) {
              newgltfjson.gdttable[myGlobalActiveDataTable].selectedObjects = [
                ...copy_selectobjects
              ];
              newgltfjson.gdttable[myGlobalActiveDataTable].parentObjects = [
                ...newParentObjects
              ];
              newgltfjson.gdttable[myGlobalActiveDataTable].mates = [
                ...copy_mateobjects
              ];
              //const renderingdata = changingdata || state.renderdata;
              //newgltfjson.renderdata = renderingdata;
              globalSetGltfJSon(newgltfjson);
              console.log(
                'setting parent object',
                copy_parentobjects,
                newgltfjson,
                myGlobalState
              );
            }
          }
        } else {
          if (data.selectedshell) {
            const node = {
              parent: myParentNode,
              child: myAllChilds
            };
            const newParentObjects = [node];
            setState({ parentObjects: newParentObjects });
            let newgltfjson = { ...gltfjson };
            console.log(
              'Fomr3',
              newgltfjson,
              newgltfjson.gdttable,
              myGlobalActiveDataTable
            );
            if (newgltfjson.gdttable[myGlobalActiveDataTable]) {
              newgltfjson.gdttable[myGlobalActiveDataTable].selectedObjects = [
                ...copy_selectobjects
              ];
              newgltfjson.gdttable[myGlobalActiveDataTable].parentObjects = [
                ...newParentObjects
              ];
              newgltfjson.gdttable[myGlobalActiveDataTable].mates = [
                ...copy_mateobjects
              ];
              //const renderingdata = changingdata || state.renderdata;
              //newgltfjson.renderdata = renderingdata;
              globalSetGltfJSon(newgltfjson);
              console.log(
                'Assigning parent object',
                node,
                newgltfjson,
                myGlobalState
              );
            }
          } else {
            const newParentObjects = [];
            setState({ parentObjects: newParentObjects });
            let newgltfjson = { ...gltfjson };
            console.log(
              'Fomr4',
              newgltfjson,
              newgltfjson.gdttable,
              myGlobalActiveDataTable
            );
            if (newgltfjson.gdttable[myGlobalActiveDataTable]) {
              newgltfjson.gdttable[myGlobalActiveDataTable].selectedObjects = [
                ...copy_selectobjects
              ];
              newgltfjson.gdttable[myGlobalActiveDataTable].parentObjects = [
                ...newParentObjects
              ];
              newgltfjson.gdttable[myGlobalActiveDataTable].mates = [
                ...copy_mateobjects
              ];
              //const renderingdata = changingdata || state.renderdata;
              //newgltfjson.renderdata = renderingdata;
              globalSetGltfJSon(newgltfjson);
              console.log('Emptying parent object', newgltfjson, myGlobalState);
            }
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
          selectedObjects: [...copy_selectobjects],
          mates: [...copy_mateobjects]
        });
        setState({ parentObjects: [] });
      }
    }
    if (handleChangeOfSelection) {
      // console.log(
      //   'I am going to do handleChangeOfSelection',
      //   copy_selectobjects
      // );
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
    selectedFeature,
    activeTable,
    previousActivetable,
    myTree,
    selectedNodes
  ) => {
    mapdata = {};
    const mystate = isEmptyObject(state) ? myGlobalState : state;
    var copy_selectobjects = arrayCopy(mystate.selectedObjects);
    var copy_parentobjects = arrayCopy(mystate.parentObjects);
    var copy_mateobjects = arrayCopy(mystate.mates);

    removeData.forEach((data) => {
      if (data) {
        const myAllChildsAndParents = findMyParentChilds(data, selectedFeature);
        const myAllChilds = arrayCopy(myAllChildsAndParents[0]);
        const myParentNode = elementCopy(myAllChildsAndParents[1]);
        //console.log('Removing', myAllChilds, myParentNode, data);
        for (let elementdata of myAllChilds) {
          setSelectedShell({ ...elementdata }, false, myTree);
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
          } else {
            const currentIndex = arrayFindIndex(
              copy_selectobjects,
              elementdata[gltf_Dict['name']]
            );
            if (currentIndex != -1) {
              copy_selectobjects = arrayRemove(
                copy_selectobjects,
                elementdata[gltf_Dict['name']]
              );
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
        const myAllChilds = arrayCopy(myAllChildsAndParents[0]);
        const myParentNode = elementCopy(myAllChildsAndParents[1]);
        //console.log('Adding', myAllChilds, myParentNode, data);
        for (let elementdata of myAllChilds) {
          const mycopydata = { ...elementdata };
          setSelectedShell(mycopydata, true, myTree);
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
      copy_selectobjects = structure.objects ? structure.objects : [];
      copy_mateobjects = structure.mates ? structure.mates : [];
      if (selectedOption == SELECTCIRCULAR || selectedOption == SELECTLINEAR) {
        let axisArray = [];
        for (
          let indexObject = stateLength;
          indexObject < copy_selectobjects.length;
          indexObject++
        ) {
          const element = copy_selectobjects[indexObject];
          console.log('Checking elements', element);
          if (element.axis) {
            axisArray.push({
              axis: element.axis,
              position: element.position ? element.position : [0, 0, 0],
              name: element[gltf_Dict['name']]
            });
          }
        }
        console.log('Getting points to draw axis', axisArray);
        setDrawAxisLines(axisArray);
      } else {
        console.log('Option is', selectedOption);
      }
    } else {
      console.log(
        'I could not get any togetinfo',
        toGetInfo,
        toAddShapeInfo,
        copy_selectobjects,
        copy_parentobjects,
        copy_mateobjects
      );
    }

    let newgltfjson = Object.assign({}, myTree, {});
    let gdtTableCopy = elementCopy(newgltfjson.gdttable);
    gdtTableCopy[activeTable] = {
      ...gdtTableCopy[activeTable],
      selectedObjects: [...copy_selectobjects],
      parentObjects: [...copy_parentobjects],
      mates: [...copy_mateobjects],
      option: selectedFeature
    };
    /* let oneArrayForActiveObjects = Object.assign(
      {},
      newgltfjson.gdttable[activeTable],
      {}
    );
    oneArrayForActiveObjects = {
      ...oneArrayForActiveObjects,
      selectedObjects: [...copy_selectobjects],
      parentObjects: [...copy_parentobjects],
      mates: [...copy_mateobjects],
      option: selectedFeature
    };
    if (
      newgltfjson.tree &&
      newgltfjson.tree.length != newgltfjson.treeLength &&
      newgltfjson.gdttable[previousActivetable] &&
      newgltfjson.gdttable[previousActivetable].edges
    ) {
      oneArrayForActiveObjects.edges = [
        ...newgltfjson.gdttable[previousActivetable].edges
      ];
    } */
    //{ ...myTree };
    console.log(
      'Fomr1',
      gltfjson,
      newgltfjson,
      newgltfjson.gdttable,
      myGlobalActiveDataTable,
      activeTable,
      previousActivetable,
      gdtTableCopy
    );
    if (newgltfjson.gdttable[activeTable]) {
      //newgltfjson.gdttable[activeTable] = { ...gltfjson.gdttable[activeTable] }; //recreating memory..
      //newgltfjson.gdttable[activeTable].selectedObjects = [
      //  ...copy_selectobjects
      //];
      // newgltfjson.gdttable[activeTable] = Object.assign(
      //   {},
      //   oneArrayForActiveObjects,
      //   {}
      // );
      newgltfjson.gdttable = [...gdtTableCopy];
      /* if (
        newgltfjson.tree &&
        newgltfjson.tree.length != newgltfjson.treeLength
      ) {
        newgltfjson.gdttable[activeTable].edges = [
          ...newgltfjson.gdttable[previousActivetable].edges
        ];
      } */
      //newgltfjson.gdttable[activeTable].parentObjects = [...copy_parentobjects];
      //newgltfjson.gdttable[activeTable].mates = [...copy_mateobjects];
      //const renderingdata = changingdata || state.renderdata;
      //newgltfjson.renderdata = renderingdata;
      console.log(
        'PreFinal gltfson',
        newgltfjson,
        newgltfjson.gdttable,
        newgltfjson.gdttable[activeTable],
        gdtTableCopy,
        newgltfjson.gdttable[activeTable].selectedObjects,
        copy_selectobjects,
        activeTable,
        myGlobalActiveDataTable
      );

      if (
        newgltfjson &&
        newgltfjson.gdttable &&
        newgltfjson.gdttable[activeTable]
      ) {
        setSelectedOption(newgltfjson.gdttable[activeTable].option);
      }
      globalSetGltfJSon(newgltfjson);
      globalSetActiveDataTable(activeTable);
      setState({
        gltfjson: newgltfjson,
        selectedObjects: [...copy_selectobjects],
        parentObjects: [...copy_parentobjects],
        mates: [...copy_mateobjects],
        mateValues: newgltfjson.gdttable[activeTable].mateValues,
        angle: newgltfjson.gdttable[activeTable].angle,
        offset: newgltfjson.gdttable[activeTable].offset,
        renderdata: [...(selectedNodes || [])],
        whatchange: SELECTANITEM
      });
      if (!showKinematicMove && myTree.gdttable && fileGDT && fileUUIder) {
        const savedData = await saveGDTInfo(gdtTableCopy, fileGDT, fileUUIder);
        console.log('Saved Data from Changed selections', savedData);
      } else {
        console.log(
          'I am not saving data from changed selections',
          myTree.gdttable
        );
      }
      /* .then((res) => res.data)
        .then((data) => {
          console.log(
            'Getting saved Resources from gdt',
            data,
            newgltfjson.gdttable,
            gdtTableCopy
          );
        }); */

      //let incrementedNodes = [...selectedNodes, { name: 'NoName' }];
      /* setState({
        gltfjson: newgltfjson,
        selectedObjects: [...copy_selectobjects],
        parentObjects: [...copy_parentobjects],
        mates: [...copy_mateobjects],
        mateValues: newgltfjson.gdttable[activeTable].mateValues,
        angle: newgltfjson.gdttable[activeTable].angle,
        offset: newgltfjson.gdttable[activeTable].offset,
        renderdata: [...(selectedNodes || [])],
        whatchange: SELECTANITEM
      }); */
    } else {
      console.log(
        'Final gltfson',
        newgltfjson,
        newgltfjson.gdttable,
        newgltfjson.gdttable[activeTable].selectedObjects,
        copy_selectobjects,
        activeTable,
        myGlobalActiveDataTable
      );
      if (myTree && myTree.gdttable && myTree.gdttable[activeTable]) {
        setSelectedOption(myTree.gdttable[activeTable].option);
      }
      //globalSetActiveDataTable(activeTable);
      setState({
        selectedObjects: [...copy_selectobjects],
        parentObjects: [...copy_parentobjects],
        mates: [...copy_mateobjects],
        renderdata: selectedNodes,
        whatchange: SELECTANITEM
      });
    }
    if (handleChangeOfSelection) {
      //console.log('changing selections', copy_selectobjects);
      handleChangeOfSelection(copy_selectobjects);
    } else {
      console.log(
        'No Call back for handlechangeofselctions since it is from gdt',
        copy_selectobjects
      );
    }
  };

  const handleModelClick = async (data, what, event) => {
    // console.log(
    //   'Handling model click',
    //   data,
    //   what,
    //   what == SELECTANITEM,
    //   selectedOption,
    //   selectedOption == SELECTASSEMBLY
    // );

    if (what == SELECTANITEM) {
      if (data) {
        const mymesh = findMyMaterial(data);
        if (mymesh) {
          const mymeshcopy = { ...mymesh };
          // console.log(
          //   'Additional Model Click',
          //   mymeshcopy,
          //   additionalModelClick
          // );
          if (additionalModelClick) {
            if (selectedOption == SELECTASSEMBLY) {
              const myAllChildsAndParents = findMyParentChilds(
                mymeshcopy,
                selectedOption
              );
              additionalModelClick(myAllChildsAndParents);
              //console.log('Additional Model Click', myAllChildsAndParents);
            }
          }
          //mymesh.selectedshell = data.selectedshell;
          setSelectedShell(mymeshcopy, data.selectedshell);
          return await changeStateOfSelection(mymeshcopy, event);
        } else {
          console.log('No Mesh', mymesh, data);
        }
      } else {
        return await changeStateOfSelection(data, event);
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
      {
        /*!isLoading && state.gltfjson?.tree &&*/ <div
          className={` ${classes.assemblyTreeContainer}`}
        >
          <AssemblyTabWithTree
            assemblyTree={buildParentChildTree(
              arrayCopy(state.gltfjson ? state.gltfjson.tree : []),
              selectedOption,
              myGlobalTree
            )}
            OnAddition={addSelectionFromTree}
            OnExpansion={expandSelectionFromTree}
            activeGLTFFile={activeGLTFFile}
            setActiveGLTFile={setActiveGLTFile}
          />
        </div>
      }
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
          regenerateKinematicMove={regenerateKinematicMove}
          activeGLTFFile={activeGLTFFile}
          setActiveGLTFile={setActiveGLTFile}
          drawAxisLines={drawAxisLines}
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
