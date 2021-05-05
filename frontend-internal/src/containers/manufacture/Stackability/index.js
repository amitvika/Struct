import React, { useState, useEffect } from 'react';
import { getPartsStackableInfo } from '../../../api/fileUpload.api';
import { useSelector } from 'react-redux'
import { Paper, Grid } from '@material-ui/core';
import { Headding } from '../../../components';


export default function Stackability() {
    const currentItem = useSelector(state => state.item.currentItem);
    const [splitfiles, setsplitfiles] = useState({});

    useEffect(() => {

        getPartsStackableInfo(currentItem.fileId)
            .then(res => {
                setsplitfiles(res.data);
            })
            .catch(err => {

            })
    }, []);

    return (
        <>
            {splitfiles.stackable && splitfiles.stackable.length > 0 && (
                
                <Paper  >
                    <Headding style={{ textAlign: 'center' }}>
                        Parts Stackable Info
                    </Headding>
                    <Grid>
                        <b style={{ margin: "7px" }}> Any Direction:</b> {prettyPrintArray(splitfiles.stackable[0].direction)}
                    </Grid>

                    <Grid><b style={{ margin: "7px" }}> Top:</b>{prettyPrintArray(splitfiles.stackable[0].top)}</Grid>
                    <Grid> <b style={{ margin: "7px" }}> Bottom:</b> {prettyPrintArray(splitfiles.stackable[0].bottom)}</Grid>
                    <Grid> <b style={{ margin: "7px" }}> Right:</b> {prettyPrintArray(splitfiles.stackable[0].right)}</Grid>
                    <Grid> <b style={{ margin: "7px" }}> Left: </b>{prettyPrintArray(splitfiles.stackable[0].left)}</Grid>
                    <Grid> <b style={{ margin: "7px" }}> Front:</b> {prettyPrintArray(splitfiles.stackable[0].front)}</Grid>
                    <Grid> <b style={{ margin: "7px" }}> Back: </b>{prettyPrintArray(splitfiles.stackable[0].back)}</Grid>

                </Paper>
            )}
        </>
    )
}


export const prettyPrintArray = (json, maxlength = 30) => {
    if (json) {
        return JSON.stringify(json)
    }
    return "No Info"
}