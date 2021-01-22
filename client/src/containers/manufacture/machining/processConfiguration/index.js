import React, { useState, useEffect } from "react";
import {
    Button,
    Paper,
    Grid,
    makeStyles
} from "@material-ui/core";

import ItemsAPI from '../../../../api/items.api';
import ThreeDViewer from "../../../../components/sharedFunctionComponents/ThreeDViewer";
import FileUpload from "../../../../components/sharedFunctionComponents/FileUpload";
import CppTest from "../../../../components/sharedFunctionComponents/CppTest";

const useStyles = makeStyles((theme) => ({
    paper: {
        padding: theme.spacing(1),
        textAlign: 'center',
        color: theme.palette.text.secondary,
        marginTop: 10,
        marginBottom: 10
    },
}));

export default function Machining() {

    const classes = useStyles();

    const [itemListOption, setItemListOption] = useState([]);

    useEffect(() => {
        ItemsAPI.getItemsAllAPI()
            .then(res => {
                if (Array.isArray(res.data)) {
                    setItemListOption(res.data.map(item => {
                        return {
                            label: item.name,
                            value: item.name
                        }
                    }))
                }
            })
            .catch(error => {
                console.log('Error:-', error)
            })
    }, []);

    return (
        <Paper elevation={3} className={classes.paper}>
            <Grid container spacing={1}>
                <Grid item xs={12} >
                    <FileUpload />

                </Grid>
                <Grid item xs={12} >
                    <CppTest />
                </Grid>
                <Grid item xs={12} >
                    <ThreeDViewer />
                </Grid>
                <Grid item xs={4} >
                    <Button color="primary"> Generate toolpath</Button>
                </Grid>
            </Grid>

        </Paper>

    );
}
