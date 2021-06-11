import React, { useEffect, useState } from "react";
import {
    Snackbar,
    Button,
    Paper,
    Tab,
    Tabs,
    Box,
    Grid,
    Breadcrumbs,
    Link,
    IconButton
} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { NavLink, useParams } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { Spinner } from "reactstrap";

import FactoriesAPI from '@ravibasil/common/api/factories.api';
import { showErrorAlert, showSuccessAlert } from '../../actions/alert.action';

import BaseFactorySetup from './baseFactorySetup'
import ItemsInProduction from './itemsInProduction'
import Autoscaling from './autoscaling'
import FloorplanSetup from './floorplanSetup'

import get from 'lodash/get';

const FactoriesDetail = () => {
    let { id } = useParams();
    const dispatch = useDispatch()

    const [isLoading, setIsLoading] = useState(false);
    const [value, setValue] = useState(1);
    const [factoryValue, setFactoryValue] = useState({});

    useEffect(() => {
        setIsLoading(true)
        FactoriesAPI.fetchFactories(`factory_id=${id}`)
            .then(res => {
                setFactoryValue(get(res, 'data[0]', {}));

                setIsLoading(false)
            })
            .catch(error => {
                setIsLoading(false)
                dispatch(showErrorAlert({ message: 'Unable to get client' }))
                console.log('Error :', error)
            })
    }, [id]);

    const handleSave = () => {
        syncWithServer(factoryValue)
    }

    const syncWithServer = (data) => {

        FactoriesAPI.upsertFactoryApi(data)
            .then(res => {
                // setFactoryValue(res.data);
                dispatch(showSuccessAlert({ message: 'All data is saved' }));

            })
            .catch(error => {
                console.log('Error :', error)
                setIsLoading(false)
                dispatch(showErrorAlert({ message: 'Unable to save data' }));
            })
    }

    const renderPageSwitch = (index) => {
        if (!get(factoryValue, '_id')) {
            return null
        }
        switch (index) {
            case 1:
                return <BaseFactorySetup factoryId={id} setFactoryValue={setFactoryValue} factoryValue={factoryValue} />
            case 2:
                return <ItemsInProduction factoryId={id} setFactoryValue={setFactoryValue} factoryValue={factoryValue} />
            case 3:
                return <FloorplanSetup />
            case 4:
                return <Autoscaling />
            default:
                return "Undefined Tab Index";
        }
    }

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
        <>
            <Grid container>
                <Grid item sm sm={12}>
                    <Paper style={{ padding: 20, margin: 10,display: 'flex' }}>
                        <NavLink
                            to='/factories'>
                            <IconButton>
                                <ArrowBackIcon />
                            </IconButton>
                        </NavLink>
                        <Typography color="textPrimary" style={{display: 'flex',alignItems: 'center',fontWeight: 'bold', marginleft: 'inherit'}}>Factories Details</Typography>
                    </Paper>
                    <Paper style={{ display: 'flex', padding: 10, margin: 10 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <h4>Factory Name: {factoryValue.name}</h4>
                            <p>Factory ID:{id}</p>
                        </div>
                    </Paper>
                </Grid>
                <Grid item sm={2}>
                    <Paper style={{ padding: 20, margin: 10 }}>
                        <Tabs
                            orientation="vertical"
                            variant="scrollable"
                            value={value}
                            onChange={(event, newValue) => setValue(newValue)}>
                            <Tab label="Base Factory Setup" value={1} />
                            <Tab label="Items in Production" value={2} />
                            <Tab label="Floorplan Setup" value={3} />
                            <Tab label="Facility Capabilities" value={4} />
                            <Tab label="Autoscaling" value={4} />

                        </Tabs>
                    </Paper>
                </Grid>
                <Grid item sm sm={10}>
                    <Paper style={{ padding: 20, margin: 10 }}>
                        {renderPageSwitch(value)}
                    </Paper>
                </Grid>
            </Grid>
            <Snackbar
                style={{
                    left: '10%'
                }}
                open={true}
            >
                <Button
                    size="large"
                    variant="contained"
                    color="primary"
                    onClick={handleSave}>
                    Save
          </Button>
            </Snackbar>

        </>
    );
}

export default FactoriesDetail;
