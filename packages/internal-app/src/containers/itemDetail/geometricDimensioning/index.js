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

export default function GeometricDimensioning({ fileId, gltfjson, isLoading }) {
    const [state, _setState] = useState({});
    // const [isLoading, setIsLoading] = useState(false);
    const [selectedOption, setSelectedOption] = useState(SELECTFEATURE);
    //const [splitFiles, setSplitfiles] = useState({});
    const [resetOption, setResetOption] = useState(true);

    useEffect(() => {
        const includeParts = true;
        //console.log("Reaching",gltfjson,fileId,isLoading);
        const gltfjsonlen = Object.keys(gltfjson).length;
        if (gltfjsonlen > 0) {
            setState({
                selectedindex: 0,
                activefile: fileId.toString() + includeParts.toString() +
                    stateprops.distancegap.toString() + stateprops.anglegap.toString()+gltfjsonlen.toString(),
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
                mates: []
            });
        }
    }, [gltfjson]);

    // const getHierarchySplit = (id) => {
    //     const includeParts = true;

    //     setIsLoading(true);
    //     //console.log(stateprops.distancegap, stateprops.anglegap,stateprops.disect);
    //     getHierarchySplitFiles(id, true, stateprops.distancegap, stateprops.anglegap,
    //         stateprops.disect, 0, 0.3, 1.0)
    //         .then(res => res.data)
    //         .then((repos) => {
    //             //console.log(repos);					
    //             setState({
    //                 selectedindex: 0,
    //                 gltfjson: repos,
    //                 activefile: id.toString() + includeParts.toString() +
    //                     stateprops.distancegap.toString() + stateprops.anglegap.toString(),
    //                 dataselection: 0,
    //                 firstshell: null,
    //                 secondshell: null,
    //                 materialname: stateprops.materialtype[0].name,
    //                 disectstruct: stateprops.disect,
    //                 showdisect: stateprops.showdisect,
    //                 showinfoonselect: stateprops.showinfoonselect,
    //                 splitMethod: includeParts ? SELECTDISECTPARTS : SELECTHIRERACHY,
    //                 selectedObjects: [],
    //                 parentObjects: [],
    //                 mates:[]
    //             });

    //             /* if (repos) {
    //                 let gltfjson = repos;
    //                 let stackable = [];
    //                 //let tree = [];
    //                 let tree = state.gltfjson.tree.map(element => {
    //                     if (element[gltf_Dict["bin"]]) {
    //                         element[gltf_Dict["selected"]] = false;
    //                         //tree.push(element);
    //                     }
    //                     return element;
    //                 });

    //                 setSplitfiles({
    //                     ...gltfjson,
    //                     stackable,
    //                     tree
    //                 });
    //             } */

    //             setIsLoading(false);
    //         }).catch(err => {
    //             console.log('Error -->> ', err)
    //             setIsLoading(false);
    //         });

    // };

    const resetSelections = () => {
        // if (state.secondshell) {
        //     secondshell.selectedshell = false;
        // }
        // if (firstshell) {
        //     firstshell.selectedshell = false;
        // }
        // selectedObjects.forEach(element => {
        //     element.selectedshell = false;
        // });
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

    const findSingleNode = (mynode) => {
        return [[mynode], mynode];
    }
    const findSiblingNodes = (mynode) => {
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
                        if (onlyfaces(myChild[gltf_Dict["name"]])) {
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
                    if (state.gltfjson.tree[i][gltf_Dict["parentId"]] == myParentID) {
                        var myChild = state.gltfjson.tree[i];
                        if (myChild) {
                            if (onlyfaces(myChild[gltf_Dict["name"]])) {
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
        return [[mynode], mynode];
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
        if ((first4chars == "EDGE") || (first6chars == "VERTEX")) {
            return false;
        }
        return true;
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
            const stepFile = element[gltf_Dict["step"]].slice(0, -5);
            //if(!firstOne) firstOne=stepFile;
            stepArray.push(stepFile);
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


    const changeStateOfSelection = async (data, event) => {

        //console.log("Data for shapeinfo",data);

        if (selectedOption == SELECTMEASURE) {
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
                    const secondshell = state.secondshell;
                    setState({
                        firstshell: secondshell,
                        secondshell: null
                    });

                } else {
                    if (state.secondshell && (state.secondshell[gltf_Dict["name"]] == data[gltf_Dict["name"]])) {
                        state.secondshell.selectedshell = false;
                        setState({
                            secondshell: null
                        });
                    } else {
                        //console.log("This condition is not possible");
                    }
                }
            }
        } else {
            if (data) {
                var toAdd = true;
                var toGetInfo = false;
                if (event) {
                    toAdd = event.ctrlKey;
                }
                var copy_selectobjects = [];
                var copy_parentobjects = [];
                var copy_mateobjects = [];
                var stateLength = 0;
                if (!toAdd) {
                    state.selectedObjects.forEach(element => {
                        if (data[gltf_Dict["name"]] != element[gltf_Dict["name"]]) {
                            element.selectedshell = false;
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

                const myAllChildsAndParents = findMyParentChilds(data, selectedOption);
                //console.log(myAllChildsAndParents);
                const myAllChilds = myAllChildsAndParents[0];
                const myParentNode = myAllChildsAndParents[1];

                //console.log("Splitted",myAllChilds,myParentNode)
                for (let elementdata of myAllChilds) {
                    elementdata.selectedshell = data.selectedshell;
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
                    //console.log("before",structure);                
                    structure = await getShapeInformation(structure);
                    //console.log("after",structure);
                    copy_selectobjects = structure.objects;
                    copy_mateobjects = structure.mates;
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
    }

    const handleModelClick = (data, what, event) => {
        //console.log(data, what, event);
        if (what == SELECTDISTANCE) {
            //console.log(data);
            const mymesh = findMyMaterial(data);
            mymesh.selectedshell = data.selectedshell;
            if (mymesh) {
                changeStateOfSelection(mymesh, event);
            }
        }
    }

    if (isLoading) {
        return <CircularProgress />;
    }

    return (
        <Paper style={{ margin: 10, padding: 10 }}>

            <Grid container spacing={4}>
                <Grid item xs={6}>
                    <Paper square={true}>
                        <Viewer
                            {...state}
                            selectedOption={selectedOption}
                            handleModelClick={handleModelClick}                           
                            isLoading={isLoading}
                        ></Viewer>
                    </Paper>
                </Grid>

                <Grid item xs={6}>
                    <ViewerToolbar
                        {...state}
                        selectedOption={selectedOption}
                        setSelectedOption={setSelectedOption}
                        resetSelections={resetSelections}
                        selectAllSelectedSolids={selectAllSelectedSolids}
                    />
                </Grid>
            </Grid>
        </Paper>
    )
}