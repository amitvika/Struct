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
    SELECTCONTINOUS, SELECTHIRERACHY, SELECTDISECTPARTS, SELECTSTACKABLE, prettyPrintArray
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

export default function GeometricDimensioning({ fileId }) {
    const [state, _setState] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [selectedOption, setSelectedOption] = useState(SELECTMEASURE);
    const [splitfiles, setSplitfiles] = useState({});
    const [resetOption, setResetOption] = useState(true);

    useEffect(() => {
        if (fileId) {
            getHierarchySplit(fileId)
        }
    }, []);

    const getHierarchySplit = (id) => {
        const includeParts = true;

        setIsLoading(true);
        getHierarchySplitFiles(id, true, stateprops.distancegap, stateprops.anglegap,
            stateprops.disect, 0, 0.3, 1.0)
            .then(res => res.data)
            .then((repos) => {
                //console.log(repos);					
                setState({
                    selectedindex: 0,
                    gltfjson: repos,
                    activefile: id.toString() + includeParts.toString() +
                        stateprops.distancegap.toString() + stateprops.anglegap.toString(),
                    dataselection: 0,
                    firstshell: null,
                    secondshell: null,
                    materialname: stateprops.materialtype[0].name,
                    disectstruct: stateprops.disect,
                    showdisect: stateprops.showdisect,
                    showinfoonselect: stateprops.showinfoonselect,
                    splitMethod: includeParts ? SELECTDISECTPARTS : SELECTHIRERACHY,
                    selectedObjects: []
                });

                if (repos) {
                    let splitfiles = repos;
                    let stackable = [];
                    let btree = [];
                    let tree = splitfiles.tree.map(element => {
                        if (element.bin) {
                            element["selected"] = false;
                            btree.push(element);
                        }
                        return element;
                    });

                    setSplitfiles({
                        ...splitfiles,
                        stackable,
                        btree,
                        tree
                    });
                }

                setIsLoading(false);
            }).catch(err => {
                console.log('Error -->> ', err)
                setIsLoading(false);
            });

    };

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
            selectedObjects: []
        });
    }

    const selectAllSelectedSolids = () => {
        var copy_selectobjects = [];

        state.selectedObjects.forEach(element => {
            copy_selectobjects.push(element);
        });

        setResetOption(false);
        let tempSelectedObjects = state.selectedObjects;

        copy_selectobjects.forEach(meshmaterial => {
            const myAllChilds = findMyParentChilds(meshmaterial);
            //console.log(myAllChilds);
            myAllChilds.forEach(elementdata => {
                var alreadyPresent = false;
                for (var i = 0; i < state.selectedObjects.length; i++) {
                    if (elementdata.name == state.selectedObjects[i].name) {
                        alreadyPresent = true;
                        break;
                    }
                }
                if (!alreadyPresent) {
                    tempSelectedObjects.push(elementdata);
                    elementdata.selectedshell = true;
                }
            });
        });

        setState({ selectedObjects: tempSelectedObjects });
        setResetOption(true);
    }

    const findMyParentChilds = (mynode) => {
        if (((selectedOption != SELECTSOLID) ||
            (state.splitMethod != SELECTDISECTPARTS)) && resetOption) {
            return [mynode];
        }
        var myParentID = -1;
        for (var i = 0; i < splitfiles.btree.length; i++) {
            if (splitfiles.btree[i].name == mynode.name) {
                myParentID = splitfiles.btree[i].parentId;
                break;
            }
        }
        var myMaterials = [];
        if (myParentID != -1) {
            for (var i = 0; i < splitfiles.btree.length; i++) {
                if (splitfiles.btree[i].parentId == myParentID) {
                    var myChild = findMyMaterial(splitfiles.btree[i]);
                    if (myChild) {
                        if (onlyfaces(myChild.name)) {
                            myMaterials.push(myChild);
                        }
                    }
                }
            }
        }
        if (myMaterials.length != 0) {
            return myMaterials;
        }
        return [mynode];
    }

    const findMyMaterial = (data) => {
        if (splitfiles.btree) {

            for (var i = 0; i < splitfiles.btree.length; i++) {
                if (splitfiles.btree[i].name == data.name) {
                    return splitfiles.btree[i];
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

    const getShapeInformation = (data) => {
        return new Promise((resolve, reject) => {
            getShapeInfo(data.step.slice(0, -5))
                .then(res => res.data)
                .then((repos) => {
                    if (!repos[0]) {
                        resolve(data);
                        return;
                    }

                    if (repos[0].type === 'Edge') {
                        data.cornerLocation = `${JSON.stringify(repos[1].Info)}  ${JSON.stringify(repos[2].Info)}`;
                    }
                    else if (repos[0].type === 'Vertex') {
                        data.location = `${JSON.stringify(repos[0].Info)}`;
                    }
                    else if (repos[0].type === 'Face') {
                        // data.location = `${repos[0].Info}`;
                        let edgeList = [];
                        repos.map(item => {
                            edgeList.push(item.id);
                        });
                        data.edgeList = edgeList;
                    }
                    resolve(data);
                })
                .catch(error => {
                    console.log('Error', error);
                    resolve(data)
                });
        })
    }

    const changeStateOfSelection = async (data, event) => {

        data = await getShapeInformation(data);

        if (selectedOption == SELECTMEASURE) {
            if (data.selectedshell) {
                if (!state.firstshell) {
                    const firstshell = data;
                    setState({
                        firstshell: firstshell
                    })
                    //console.log("FirstShell",firstshell,this.state.firstshell);
                } else {
                    if (!state.secondshell) {
                        const secondshell = data;
                        setState({
                            secondshell: secondshell
                        });
                        //console.log("SecondShell",secondshell,this.state.secondshell);					
                    } else {
                        state.firstshell.selectedshell = false;
                        const secondshell = state.secondshell;
                        setState({
                            firstshell: secondshell,
                            secondshell: data
                        });
                        //console.log("First and second",this.state.firstshell,this.state.secondshell,data)
                    }
                }
            } else {
                if (state.firstshell && (state.firstshell.name == data.name)) {
                    state.firstshell.selectedshell = false;
                    const secondshell = state.secondshell;
                    setState({
                        firstshell: secondshell,
                        secondshell: null
                    });

                } else {
                    if (state.secondshell && (state.secondshell.name == data.name)) {
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
                if (event) {
                    toAdd = event.ctrlKey;
                }
                if (!toAdd) {
                    state.selectedObjects.forEach(element => {
                        if (data.name != element.name) {
                            element.selectedshell = false;
                        }
                    });
                }

                const myAllChilds = findMyParentChilds(data);
                myAllChilds.forEach(elementdata => {
                    elementdata.selectedshell = data.selectedshell;
                    if (toAdd) {
                        if (data.selectedshell) {
                            var alreadyPresent = false;
                            for (var i = 0; i < state.selectedObjects.length; i++) {
                                if (elementdata.name == state.selectedObjects[i].name) {
                                    alreadyPresent = true;
                                    break;
                                }
                            }
                            if (!alreadyPresent) {
                                setState({
                                    selectedObjects: [...state.selectedObjects, elementdata]
                                });

                            }
                        } else {

                            var tempSelectedObjects = [];
                            state.selectedObjects.forEach(element => {
                                if (elementdata.name != element.name) {
                                    tempSelectedObjects.push(element);
                                }
                            });
                            console.log('1 : ', tempSelectedObjects);
                            setState({ selectedObjects: tempSelectedObjects });
                        }
                    } else {
                        if (data.selectedshell) {
                            setState({ selectedObjects: myAllChilds });
                        } else {
                            setState({ selectedObjects: [] });
                        }

                    }
                });

            }
        }
    }

    const handleModelClick = (data, what, event) => {
        if (what == SELECTDISTANCE) {
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
                    <Viewer
                        {...state}
                        selectedOption={selectedOption}
                        handleModelClick={handleModelClick}
                    ></Viewer>
                </Grid>

                <Grid item xs={6}>
                    <ViewerToolbar
                        {...state}
                        selectedOption={selectedOption}
                        setSelectedOption={setSelectedOption}
                        resetSelections={resetSelections}
                        selectAllSelectedSolids={selectAllSelectedSolids} />
                </Grid>
            </Grid>
        </Paper>
    )
}
