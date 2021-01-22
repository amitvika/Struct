import React, { useState, useEffect } from "react";
import {
    Button,
    Paper,
    Grid
} from "@material-ui/core";

import ItemsAPI from '../../../../api/items.api';
import ThreeDViewer from "../../../../components/sharedFunctionComponents/ThreeDViewer";
import FileUpload from "../../../../components/sharedFunctionComponents/FileUpload";
import CppTest from "../../../../components/sharedFunctionComponents/CppTest";

export default function Machining() {
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
        <Grid container spacing={4}>
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

    );
}
