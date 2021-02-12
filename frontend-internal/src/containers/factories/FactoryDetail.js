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
    Link
} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import { NavLink, useParams } from "react-router-dom";
import API from '../../api/clients.api';
import Products from './products'
import LogoView from '../../components/LogoView';

import { useDispatch } from 'react-redux';
import { showErrorAlert, showSuccessAlert } from '../../actions/alert.action';
import { Spinner } from "reactstrap";
import Documentation from "./documentation";


const FactoriesDetail = () => {
    let { id } = useParams();
    const dispatch = useDispatch()

    const [isLoading, setIsLoading] = useState(false);
    const [value, setValue] = useState(1);
    const [clientData, setClientData] = useState({});
    const [isWebsiteNameAvailable, setIsWebsiteNameAvailable] = useState(true);

    useEffect(() => {
        setIsLoading(true)
        API.fetchClientApi(id)
            .then(res => {

                if (res.data) {
                    setClientData(res.data);
                }

                setIsLoading(false)
            })
            .catch(error => {
                setIsLoading(false)
                dispatch(showErrorAlert({ message: 'Unable to get client' }))
                console.log('Error :', error)
            })
    }, [id]);

    const handleSave = () => {
        syncWithServer(clientData)
    }


    const syncWithServer = (data) => {

        API.updateClientApi(id, data)
            .then(res => {
                if (res.data.success) {
                    setIsWebsiteNameAvailable(res.data.isWebsiteNameAvailable);
                }
                else {
                    setClientData(res.data);
                }
                dispatch(showSuccessAlert({ message: 'All data is saved' }));

            })
            .catch(error => {
                console.log('Error :', error)
                setIsLoading(false)
                dispatch(showErrorAlert({ message: 'Unable to save data' }));
            })
    }

    const handleLogoChange = ({ logoName, logoUrl }) => {
        const updatedValues = {
            ...clientData,
            logoName,
            logoUrl
        };

        setFactoriesData(updatedValues);
        syncWithServer(updatedValues);
    }

    const handleClientUpdate = (data) => {
        setFactoriesData(data);
        setIsWebsiteNameAvailable(true)
    }


    const renderPageSwitch = (index) => {
        switch (index) {
            case 1:
                return <Products />
            case 2:
                return <Documentation />
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
                    <Paper style={{ padding: 20, margin: 10 }}>
                        <Breadcrumbs
                            style={{
                                display: "flex",
                                justifyContent: "center"
                            }}>
                            <NavLink
                                to='/factories'>
                                Factories
								</NavLink>

                            <Typography color="textPrimary">Factories Details</Typography>
                        </Breadcrumbs>
                    </Paper>
                    <Paper style={{ display: 'flex', padding: 10, margin: 10 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            {/* <h4>Factory Name: {Data.name}</h4> */}
                            <p>Factory ID:{id}</p>
                        </div>
                        <LogoView
                            logoUrl={clientData.logoUrl}
                            handleLogoChange={handleLogoChange}
                            name={clientData.name} />
                    </Paper>
                </Grid>
                <Grid item sm={2}>
                    <Paper style={{ padding: 20, margin: 10 }}>
                        <Tabs
                            orientation="vertical"
                            variant="scrollable"
                            value={value}
                            onChange={(event, newValue) => setValue(newValue)}
                        >
                            <Tab label="Base Factory Setup" value={1} />

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
