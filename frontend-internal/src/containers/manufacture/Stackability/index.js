import React, { useState, useEffect } from 'react';
import { getPartsStackableInfo } from '../../../api/fileUpload.api';
import { useSelector } from 'react-redux'
import { Paper, Grid } from '@material-ui/core';
// import { Headding } from '../../../components';
import Heading from '../../../components/atoms/Headding';



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
                <Paper style={{ padding: 10 }}>

                    <Grid container spacing={4}>
                        <Grid item xs={12}>
                            <Heading bold>Parts Stackable Info</Heading>
                        </Grid>

                        <Grid item xs={4}> Any Direction:</Grid>
                        <Grid item xs={8}>{prettyPrintArray(splitfiles.stackable[0].direction)}</Grid>

                        <Grid item xs={4}>
                            Top:
                     </Grid>
                        <Grid item xs={8}>{prettyPrintArray(splitfiles.stackable[0].top)}</Grid>

                        <Grid item xs={4}>
                            Bottom:
                     </Grid>
                        <Grid item xs={8}>{prettyPrintArray(splitfiles.stackable[0].bottom)}</Grid>

                        <Grid item xs={4}>
                            Right:
                     </Grid>
                        <Grid item xs={8}>{prettyPrintArray(splitfiles.stackable[0].right)}</Grid>


                        <Grid item xs={4}>
                            Left:
                     </Grid>
                        <Grid item xs={8}>{prettyPrintArray(splitfiles.stackable[0].left)}</Grid>

                        <Grid item xs={4}>
                            Front:
                     </Grid>
                        <Grid item xs={8}>{prettyPrintArray(splitfiles.stackable[0].front)}</Grid>
                        <Grid item xs={4}>
                            Back:
                     </Grid>
                        <Grid item xs={8}>{prettyPrintArray(splitfiles.stackable[0].back)}</Grid>


                    </Grid>
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