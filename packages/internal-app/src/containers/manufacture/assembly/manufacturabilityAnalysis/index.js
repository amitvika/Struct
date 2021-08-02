import React, { useState, useEffect } from 'react';
import {   
    Paper,
    CircularProgress,
    makeStyles
} from "@material-ui/core";
import Link from '@material-ui/core/Link';
import { Spinner } from "reactstrap";
import TableView from '@ravibasil/common/components/TableGridView/TableView';
import GLTFRenderer from '../../../../gltf/GltfRenderer.js';
import { DEFAULTBACKCOLOR, DEFAULTSELECTCOLOR, DEFAULTTOUCHCOLOR, SELECTFEATURE, SELECTHIRERACHY } from "../../../../gltf/Tree/utils";

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
    fromcenter:DEFAULTFROMCENTER
}
const useStyles = makeStyles((theme) => ({
    mainContainer: { margin: 10, padding: 10, display: 'inline-flex', minWidth: '100%' },
    viewerContainer: {
        padding: '20px',
        margin: '0px 15px',
        display: 'inline-block',
        border: '1px solid rgba(0, 0, 0, 0.3)',
        boxShadow: '0 0 10px rgb(0 0 0 / 20%)'
    }
}));
export default function ManufacturabilityAnalysis(props) {
    const {fileId, gltfjson, isLoading}=props;
    const [list, setList] = useState([]);
    const [isFileLoading, setIsLoading] = useState(isLoading);
    const [filteredList, setFilteredList] = useState([]);
    const classes = useStyles();
    const [columns, setColumns] = useState([
        { title: 'Mates', field: 'id', editable: "never" },
        { title: 'Insertion Type', field: 'name' },
        { title: 'Dispensing', field: 'quantity', type: 'numeric' },
        { title: 'Transfer Holding', field: 'quantity', type: 'numeric' },
    ])
    
    const [state, _setState] = useState({});
   
    const setState = (data) => {
        _setState(prevState => {
            return {
                ...prevState,
                ...data
            }

        })
    }    
    useEffect(() => {
        setIsLoading(isLoading);
    }, [isLoading]);
    useEffect(() => {
        const includeParts = true;
        console.log("Reaching",gltfjson,fileId,isLoading);
        let gltfjsonlen =  Object.keys(gltfjson).length;
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
                selectedObjects: [],
                parentObjects: [],
                mates: [],
                renderdata: {},
                whatchange: 0,
            });
        }
    }, [gltfjson]);

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
    let gltfjsonlen =  Object.keys(gltfjson).length;
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
                        activefile={fileId+gltfjsonlen.toString()}
                        backcolor={DEFAULTBACKCOLOR}
                        selectcolor={DEFAULTSELECTCOLOR}
                        touchcolor={DEFAULTTOUCHCOLOR}
                        selectedoption={SELECTFEATURE}
                        splitmethod={SELECTHIRERACHY}
                        changedata={[]}
                        data2texture={null}
                        data3texture={null}
                        materialtype={DEFAULTMATERIALNAME}
                        whatchanged={0} dataselection={0}
                    />
                }
                {
                    (isLoading || isFileLoading) && <CircularProgress />
                }

            </Paper>
            <TableView
                title={'Order of Assembly'}
                list={filteredList}
                columns={columns}
                setColumns={setColumns}
                isAddEditActionsEnabled={true}
            >
            </TableView>

        </Paper>

    );
}
