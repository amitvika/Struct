import React, { useState, useEffect } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Orders from '../order/index'
import SubHeaderWithArrow from '../../../components/SubHeaderWithArrow'
import { useParams } from "react-router-dom";
import ItemAPI from '@ravibasil/common/api/items.api';
import get from 'lodash/get';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    paper: {
        padding: theme.spacing(1),
        textAlign: 'center',
        color: theme.palette.text.secondary,
        marginTop: '10px',
        marginBottom: '10px'
    },
    tabPaper: {
        padding: theme.spacing(1),
        textAlign: 'center',
        color: theme.palette.text.secondary,
        cursor: 'pointer',
        transition: '0.3s',
        "&:hover, &:focus": {
            backgroundColor: '#DCDCDC'
        }
    },
    selectedTab: {
        backgroundColor: "blue",

    },
    dividerStyle: {
        marginTop: '20px',
        marginBottom: '20px'
    },
    verticalDivider: {
        margin: '5px',
        width: '1px'
    }
}));

export default function ProductOption({
    productId,
    productName
}) {
    let { id: vendorId } = useParams();
    const classes = useStyles();
    const [product, setProduct] = useState({});

    const [selectedTab, setSelectedTab] = useState("Orders");

    const tabArray = ['Orders', 'Injection Casting'];


    // useEffect(() => {

    //     ItemAPI.getItemsAPI(`id=${productId}`)
    //         .then(res => {
    //             setProduct(get(res, 'data[0]', {}))
    //         })
    //         .catch(data => {

    //         })

    //     return () => {
    //     }
    // }, [])

    const handleTabChange = (tabName) => {
        setSelectedTab(tabName);
    }

    const renderDetailPanel = () => {

        if (selectedTab === 'Orders') {
            return <Orders />
        }
        else {
            return 'not Found Page'
        }

    }


    return (
        <>
            <SubHeaderWithArrow
                action={`/vendors/${vendorId}?tab=1`}
                title={`Configure Product: ${productName}`}
            />

            <Paper elevation={3} className={classes.paper}>
                <Grid container spacing={1}>
                    {
                        tabArray.map(tabName =>
                        (
                            <Grid item xs={2.5}>
                                <Paper onClick={() => handleTabChange(tabName)}
                                    style={{
                                        backgroundColor: selectedTab === tabName ? "#343a40" : "",
                                        color: selectedTab === tabName ? "white" : ""
                                    }}
                                    className={classes.tabPaper}>{tabName}</Paper>

                            </Grid>
                        )
                        )
                    }
                </Grid>

            </Paper>
            {renderDetailPanel()}
        </>
    )
}
