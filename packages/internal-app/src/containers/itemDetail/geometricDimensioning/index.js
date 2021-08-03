import React, { useState, useEffect } from 'react';
import {
    Grid,
    CircularProgress,
    Paper
} from "@material-ui/core"
import Viewer from './Viewer';
import ViewerToolbar from './ViewerToolbar';
import { getHierarchySplitFiles, getShapeInfo } from '@ravibasil/common/api/fileUpload.api'
import {
    SELECTBACKCOLOR, SELECTSELECTCOLOR, SELECTTOUCHCOLOR,
    DEFAULTBACKCOLOR, DEFAULTSELECTCOLOR, DEFAULTTOUCHCOLOR,
    getTexture, SELECT2DTEXTURE, SELECT3DTEXTURE,
    SELECTMATERIRAL, SELECTDISTANCE, SELECTSHOWINFO,
    SELECTSOLID, SELECTFACE, SELECTEDGE, SELECTCORNER, SELECTMEASURE,
    SELECTCONTINOUS, SELECTHIRERACHY, SELECTDISECTPARTS, SELECTSTACKABLE,
    SELECTORDER, SELECTASSEMBLY, SELECTFEATURE, prettyPrintArray, gltf_Dict
} from "../../../gltf/Tree/utils";

import { makeStyles } from '@material-ui/core/styles';
import Assembly from '../assembly';

const DEFAULTDISTANCEGAP = 0.1;
const DEFAULTANGLEGAP = 0.5;
const DEFAULTDISECT = false;
const DEFAULTSHOWDISECT = false;
const DEFAULTSHOWINFOONSELECT = false;
const DEFAULTMATERIALTYPE = [{ "id": 1, "name": "Basic" }];

const stateprops = {
    distancegap: DEFAULTDISTANCEGAP,
    anglegap: DEFAULTANGLEGAP,
    disect: DEFAULTDISECT,
    showdisect: DEFAULTSHOWDISECT,
    showinfoonselect: DEFAULTSHOWINFOONSELECT,
    materialtype: DEFAULTMATERIALTYPE
}



const useStyles = makeStyles((theme) => ({
    mainContainer: { margin: 10, padding: 10, display: 'inline-flex', minWidth: '100%' },
    viewerContainer: {
        padding: '20px',
        width: '600px',
        margin: '0px 15px',
        display: 'inline-block',
        boxShadow: '0 0 10px rgb(0 0 0 / 20%)'
    }
}));

export default function GeometricDimensioning({ tabIndex, fileId, fileGDT, gltfjson, isLoading }) {
    const classes = useStyles();

    const [state, _setState] = useState({});
    // const [isLoading, setIsLoading] = useState(false);
    const [selectedOption, setSelectedOption] = useState(SELECTFEATURE);
    //const [splitFiles, setSplitfiles] = useState({});
    const [resetOption, setResetOption] = useState(true);
    const [value, setValue] = React.useState('female');
    const [ctrlKey, setCtrlKey] = useState(false);

    const handleChange = (event) => {
        setValue(event.target.value);
    };
    /*
    const renderLeafElements = () => {

        //console.log(assemblyTree)
        return assemblyTree
            // .filter(item => !item.leaf)
            .map(item => {
                const noOfChildren = renderChildElements({ parentId: item.i });
                return (
                    { ...item, name: item.n, item: '', assembly: noOfChildren.length > 0 ? 'Multi-Item Assembly' : 'Single-Item Assembly', children: noOfChildren }
                )
            })
    }

    const renderChildElements = ({ parentId }) => {
        return assemblyTree
            .filter(item => item.d === parentId)
            .map(item => {
                return (
                    <div>
                        {item.name}
                    </div>
                )
            })
    }
    */

    useEffect(() => {
        const includeParts = true;
        //console.log("Reaching",gltfjson,fileId,isLoading);
        const gltfjsonlen = Object.keys(gltfjson).length;
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
                splitMethod: includeParts ? SELECTDISECTPARTS : SELECTHIRERACHY,
                selectedObjects: [],
                parentObjects: [],
                mates: [],
                renderdata: {},
                whatchange: 0,
            });
        }
    }, [gltfjson]);


    const resetSelections = () => {
        if (state.secondshell) {           
            setSelectedShell(state.secondshell,false);
        }
        if (state.firstshell) {            
            setSelectedShell(state.firstshell,false);
        }
        state.selectedObjects.forEach(element => {
            element.selectedshell = false;
            setSelectedShell(element,false);
        });
        
        setState({
            firstshell: null,
            secondshell: null,
            selectedObjects: [],
            parentObjects: [],
            mates: []
        });
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
    const selectAllSelectedSolids = async (whichoption) => {
        var copy_selectobjects = arrayCopy(state.selectedObjects);
        if (whichoption == 0) {
            whichoption = state.selectedOption;
        }
        setResetOption(false);
        let tempSelectedObjects = arrayCopy(state.selectedObjects);
        let tempMates = arrayCopy(state.mates);
        let tempParentObjects = [];
        //console.log("Ha Ha Ha!",state.selectedObjects)
        for (let meshmaterial of copy_selectobjects) {
            const myAllChildsAndParents = findMyParentChilds(meshmaterial, whichoption);
            //console.log(myAllChildsAndParents, whichoption);
            const myAllChilds = myAllChildsAndParents[0];
            const myParentNode = myAllChildsAndParents[1];
            //console.log(myAllChilds);
            for (let elementdata of myAllChilds) {
                var alreadyPresent = false;
                for (var i = 0; i < tempSelectedObjects.length; i++) {
                    if (elementdata[gltf_Dict["name"]] == tempSelectedObjects[i][gltf_Dict["name"]]) {
                        alreadyPresent = true;
                        break;
                    }
                }
                if (!alreadyPresent) {
                    //const copydata = await getShapeInfo(elementdata)
                    //console.log('Awaiting',copydata)
                    tempSelectedObjects.push(elementdata);
                    elementdata.selectedshell = true;
                    setSelectedShell(elementdata, true);
                    tempMates.push([]);
                }
            };

            var alreadyPresent = false;
            for (var i = 0; i < tempParentObjects.length; i++) {
                if (myParentNode[gltf_Dict["name"]] == tempParentObjects[i].parent[gltf_Dict["name"]]) {
                    alreadyPresent = true;
                    break;
                }
            }
            if (!alreadyPresent) {
                const node = {
                    'parent': myParentNode,
                    'child': myAllChilds
                };
                tempParentObjects.push(node);
            }

        };
        //console.log("State before awaiting",state.selectedObjects);
        //console.log("Tenpobject before awaiting",tempSelectedObjects);
        var structure = {
            'objects': tempSelectedObjects,
            'mates': tempMates,
            'start': state.selectedObjects.length
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
    }

    const buildParentChildTree=(
		data = [],
        mySelectedOption=0,
		{ idKey = gltf_Dict['id'], parentKey = gltf_Dict['parentId'], childrenKey = 'children' } = {}
	) => {
		const tree = [];
		const childrenOf = {};
        data.forEach((item) => {
            item[childrenKey] = [];
        });
        data.forEach((item) => {
            let visible = false;
            if(item[gltf_Dict['topLeft']]) {
                visible = item[gltf_Dict['topLeft']][0] !==null;
                if(visible) {
                    let myelement = item[gltf_Dict['element']];  
                    let myName = item[gltf_Dict['name']];
                    let first4chars = myName.slice(0, 4);
                    let first6chars = myName.slice(0, 6);
                    if (myelement) {
                        first4chars = myelement;
                        first6chars = myelement;
                        if(myelement=="F") {
                            first4chars="FACE";                            
                        } else if(myelement=="E") {
                            first4chars="EDGE";                            
                        } else if(myelement=="V") {
                            first6chars="VERTEX";                            
                        } else if(myelement=="P") {
                            first4chars="PART";                            
                        } else if(myelement=="S") {
                            first6chars="SLICER";                            
                        }                       
                    }
                    //console.log("1",myName,first4chars,selectedOption,visible);
                    if (first4chars != "PART") {
                        visible = (mySelectedOption == SELECTMEASURE) || 
                                (mySelectedOption == SELECTFEATURE);
                        if (first4chars == "FACE") {                              
                            visible = visible || (mySelectedOption==SELECTFACE) || 
                                (mySelectedOption==SELECTEDGE) ||
                                (mySelectedOption==SELECTCORNER);                              
                        } else if (first4chars == "EDGE") {                             
                            visible = visible || 
                                (mySelectedOption==SELECTEDGE) ||
                                (mySelectedOption==SELECTCORNER);
                        } else if (first6chars == "VERTEX") {                             
                            visible = visible || 
                                (mySelectedOption==SELECTCORNER);                             
                        } else {
                            console.log("0",myName,first4chars,mySelectedOption,visible);
                            visible= true;
                        }
                    }
                    //console.log("2",myName,first4chars,selectedOption,visible);                    
                    /*  if ( (first4chars=="FACE") || (first4chars=="EDGE") 
                        || (first6chars=="VERTEX") || (first6chars=="SLICER") ) {
                        visible = false;
                     } */
                }
            }
            if(visible) {
                if(!item['id'] ) {
                    item['id']= item[gltf_Dict['id']];
                }
                if (!item['name']) {
                    item['name'] = item[gltf_Dict['name']];
                }
                if (!item['state']) {
                    item['state'] = {
                        'expanded': true,
                        'selected': item.selectedshell
                    }
                } else {
                    item['state'].selected = item.selectedshell;
                }
                const { [idKey]: id, [parentKey]: parentId = 0 } = item;
                childrenOf[id] = childrenOf[id] || [];
                item[childrenKey] = childrenOf[id];
                parentId !== null
                    ? (
                        childrenOf[parentId] = childrenOf[parentId] || []
                    ).push(item)
                    : tree.push(item);
            }
        });
        return tree;
    }

    const findSingleNode = (mynode) => {
        /* const mydata=[];
        mydata.push(mynode);
        const myarray=[];
        myarray.push(mydata);
        myarray.push(mynode);
        //console.log("MyArray",myarray);
        return myarray; //To return Same memory! */
        return [[mynode], mynode];
    }

    const findMyParentPart = (mynode) => {
        var myParentID = -1;
        
        for (var i = 0; i < state.gltfjson.tree.length; i++) {
            if (state.gltfjson.tree[i][gltf_Dict["name"]] == mynode[gltf_Dict["name"]]) {
                myParentID = state.gltfjson.tree[i][gltf_Dict["parentId"]];              
                if(state.gltfjson.tree[i][gltf_Dict["element"]]=="P") {
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
                    if(state.gltfjson.tree[i][gltf_Dict["element"]]=="P") {
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
                        if(state.gltfjson.tree[i][gltf_Dict["element"]]=="P") {
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
        if(myParentPart) {
            myParentNode = myParentPart;
            const myChild = findMyMaterial(myParentPart);
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
        if(myParentPart) {
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
                            if ((state.gltfjson.tree[i][gltf_Dict["element"]]=="P")||
                                onlyparts(myChild[gltf_Dict["name"]])) {
                                myMaterials.push(myChild);
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
        return [[mynode], mynode]

    }

    const findMyParentChilds = (mynode, whichOption) => {
        //console.log(this.props.selectedoption,SELECTSOLID,this.props.selectedoption != SELECTSOLID);
        if (( ((whichOption != SELECTSOLID) && (whichOption != SELECTASSEMBLY)) ||
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
        if ( (first4chars == "PART") || (first4chars == "EDGE") || (first6chars == "VERTEX") ) {
            return false;
        }
        return true;
    }

    const onlyparts = (name) => {

        const first4chars = name.slice(0, 4);
        return first4chars=="PART";
       
    }

    const setState = (data) => {
        _setState(prevState => {
            return {
                ...prevState,
                ...data
            }

        })
    }

    const getShapeInformation = (structure = {}) => {
        var stepArray = [];
        var firstOne = null;

        structure.objects.forEach(element => {
            //console.log(element);
            if(element[gltf_Dict["step"]]) {
                const stepFile = element[gltf_Dict["step"]].slice(0, -5);
                //if(!firstOne) firstOne=stepFile;
                stepArray.push(stepFile);
            }
            
        });

        //console.log("getShapeInfo",structure);
        return new Promise((resolve, reject) => {
            getShapeInfo(structure.start, stepArray)
                .then(res => res.data)
                .then((repos) => {
                    //console.log("FromShapeInfo",repos);
                    //structure.repos=repos;
                    if (!repos || repos.length == 0) {
                        resolve(structure);
                        console.log("Unable to get", structure.start, stepArray);
                        return;
                    }
                    for (let index = 0; index < repos.length; index++) {
                        structure.mates[structure.start + index] = repos[index][1];
                        const element = repos[index][0];
                        structure.objects[structure.start + index]['type'] = element[0].type;
                        structure.objects[structure.start + index]['kind'] = element[0].Info['kind'];
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
                    resolve(structure);
                })
                .catch(error => {
                    console.log('Error', error);
                    resolve(structure)
                });
        })
    }
    let mapdata = {}
    const setSelectedShell = (data, setoption) => {
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
            let myTree = state.gltfjson;
            myTree.tree[curData] = data;
            setState({ gltfjson: myTree });
            console.log("Setting", myTree, data, curData);
        } else {
            console.log("unable to find info", data, myID, curData, state.gltfjson.tree.length)
        }
    }
    const addSelectionFromTree = (selectedNodes) => {
        setState({ renderdata: selectedNodes, whatchange: SELECTDISTANCE });
    };
    const resetSelectionFromTree = () => {
        setState({ whatchange: 0, renderdata: {} });
    };
    const changeStateOfSelection = async (data, event) => {
        mapdata = {}
        //console.log("Data for shapeinfo",data,selectedOption,event);

        if (selectedOption == SELECTMEASURE) {
            //console.log("Inside SELECTMEASURE",data);
            if (data.selectedshell) {
                if (!state.firstshell) {
                    var structure = {
                        'objects': [data],
                        'mates': null,
                        'start': 0
                    };
                    structure = await getShapeInformation(structure);
                    data = structure.objects[0];
                    const firstshell = data;
                    setState({
                        firstshell: firstshell
                    })
                    //console.log("FirstShell",firstshell,this.state.firstshell);
                } else {
                    if (!state.secondshell) {
                        var structure = {
                            'objects': [data],
                            'mates': null,
                            'start': 0
                        };
                        structure = await getShapeInformation(structure);
                        data = structure.objects[0];
                        const secondshell = data;
                        setState({
                            secondshell: secondshell
                        });
                        //console.log("SecondShell",secondshell,this.state.secondshell);					
                    } else {
                        state.firstshell.selectedshell = false;
                        setSelectedShell(state.firstshell, false);
                        const secondshell = state.secondshell;
                        var structure = {
                            'objects': [data],
                            'mates': null,
                            'start': 0
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
                if (state.firstshell && (state.firstshell[gltf_Dict["name"]] == data[gltf_Dict["name"]])) {
                    state.firstshell.selectedshell = false;
                    setSelectedShell(state.firstshell, false);
                    const secondshell = state.secondshell;
                    setState({
                        firstshell: secondshell,
                        secondshell: null
                    });

                } else {
                    if (state.secondshell && (state.secondshell[gltf_Dict["name"]] == data[gltf_Dict["name"]])) {
                        state.secondshell.selectedshell = false;
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
            if (data) {
                //console.log(data);
                var toAdd = true;
                var toGetInfo = false;
                if (event) {
                    toAdd = event.ctrlKey;
                }
                setCtrlKey(event.ctrlKey);
                var copy_selectobjects = [];
                var copy_parentobjects = [];
                var copy_mateobjects = [];
                var stateLength = 0;
                if (!toAdd) {
                    state.selectedObjects.forEach(element => {
                        if (data[gltf_Dict["name"]] != element[gltf_Dict["name"]]) {
                            element.selectedshell = false;
                            setSelectedShell(element, false);
                        }
                    });
                    stateLength = 0;
                    copy_selectobjects = [];
                    copy_parentobjects = [];
                    copy_mateobjects = [];
                } else {
                    copy_selectobjects = arrayCopy(state.selectedObjects);
                    copy_parentobjects = arrayCopy(state.parentObjects);
                    copy_mateobjects = arrayCopy(state.mates);
                    stateLength = state.selectedObjects.length;
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
                    elementdata.selectedshell = data.selectedshell;
                    setSelectedShell(elementdata, data.selectedshell);
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
                                copy_mateobjects.push([]);
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
                                copy_mateobjects.splice(currentIndex, 1);
                                //console.log("After Splicing",copy_mateobjects,currentIndex, copy_mateobjects.length);
                                for (let mateindex = currentIndex; mateindex < copy_mateobjects.length; mateindex++) {
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
                            copy_selectobjects.push(elementdata);
                            copy_mateobjects.push([]);
                            toGetInfo = true;
                            //setState({ selectedObjects: myAllChilds });
                        } else {
                            copy_selectobjects = [];
                            //setState({ selectedObjects: [] });
                        }

                    }
                };
                if (toGetInfo) {
                    var structure = {
                        'objects': copy_selectobjects,
                        'mates': copy_mateobjects,
                        'start': stateLength
                    };
                    console.log("before mystruct", structure);
                    structure = await getShapeInformation(structure);
                    console.log("after mystruct", structure);
                    copy_selectobjects = structure.objects;
                    copy_mateobjects = structure.mates;
                } else {
                    console.log("I could not get any togetinfo");
                }


                /* for (let index = stateLength; index < copy_selectobjects.length; index++) {
                    console.log("Before Awaiting",copy_selectobjects[index],stateLength,copy_selectobjects.length);
                    copy_selectobjects[index] = await getShapeInformation(copy_selectobjects[index])
                    console.log('Awaiting',copy_selectobjects[index]);          
                } */
                setState({
                    selectedObjects: copy_selectobjects,
                    mates: copy_mateobjects
                });
                if (toAdd) {
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
                }


            }
        }
        //console.log("Finally my state tree",state.gltfjson.tree);
    }

    const handleModelClick = (data, what, event) => {
        console.log(data, what, event);
        if (what == SELECTDISTANCE) {
            console.log(data);
            const mymesh = findMyMaterial(data);
            if (mymesh) {
                mymesh.selectedshell = data.selectedshell;
                setSelectedShell(mymesh, data.selectedshell);
                return changeStateOfSelection(mymesh, event);
            } else {
                console.log("No Mesh", mymesh, data);
            }

            if (event) {
                //console.log(event.ctrlKey);
                setCtrlKey(ctrlKey, event.ctrlKey);
            }
        }
        return null;
    }

    if (isLoading) {
        return <CircularProgress />;
    }

    return (
        <>
            <Paper className={classes.mainContainer}>

                <Paper className={classes.viewerContainer} square={true}>
                    <Viewer
                        {...state}
                        fileGDT={fileGDT}
                        selectedOption={selectedOption}
                        handleModelClick={handleModelClick}
                        isLoading={isLoading}
                        ctrlKey={ctrlKey}
                        setSelectedOption={setSelectedOption}
                        setCtrlKey={setCtrlKey}
                        resetSelections={resetSelections}
                        selectAllSelectedSolids={selectAllSelectedSolids}
                        resetSelectionFromTree={resetSelectionFromTree}
                    ></Viewer>
                </Paper>

                <div style={{ width: 300 }}>

                    {(state.gltfjson?.tree) && (
                        <Assembly
                            assemblyTree={buildParentChildTree(state.gltfjson.tree,selectedOption)}
                            OnAddition={addSelectionFromTree}                            
                        />
                    )}
                </div>
                <div style={{ display: 'inline-block',width: 400 }}>

                    <ViewerToolbar
                        {...state}
                        selectedOption={selectedOption}
                        setSelectedOption={setSelectedOption}
                        resetSelections={resetSelections}
                        selectAllSelectedSolids={selectAllSelectedSolids}
                        setCtrlKey={setCtrlKey}
                        toolbar={false}
                    />
                </div>
            </Paper>

        </>
    )
}