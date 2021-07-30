import React, { useState, useEffect } from 'react';
import Paper from '@material-ui/core/Paper';
import Link from '@material-ui/core/Link';
import { Spinner } from "reactstrap";
import TableView from '@ravibasil/common/components/TableGridView/TableView';
import { getPartsAssemblyOrder } from '@ravibasil/common/api/fileUpload.api'
const DEFAULTDISTANCEGAP = 0.1;
const DEFAULTANGLEGAP = 0.5;
const DEFAULTEXPLODEGAP = 10;
const DEFAULTFROMCENTER = true;
const DEFAULTDISECT = false;
const DEFAULTSHOWDISECT = false;
const DEFAULTSHOWINFOONSELECT = false;
const DEFAULTMATERIALTYPE = [{ "id": 1, "name": "Basic" }];

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
export default function ManufacturabilityAnalysis(assemblyValues) {

    const [list, setList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filteredList, setFilteredList] = useState([]);
    const [assemblyManufactureValues, setassemblyManufactureValues] = useState(assemblyValues);
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
    const gltfjson = {};
    const fileId = 0;
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
                //splitMethod: includeParts ? SELECTDISECTPARTS : SELECTHIRERACHY,
                selectedObjects: [],
                parentObjects: [],
                mates: [],
                renderdata: {},
                whatchange: 0,
            });
        }
    }, [assemblyManufactureValues]);

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

    return (
        <Paper>

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
