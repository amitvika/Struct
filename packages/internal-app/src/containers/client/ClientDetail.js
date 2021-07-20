import React, { useEffect, useState } from "react";
import {
    Snackbar,
    Button,
    Paper,
    Tab,
    Tabs,
    Grid,
    IconButton
} from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';
import SubHeaderWithArrow from '../../components/SubHeaderWithArrow'
import { NavLink, useParams, useHistory } from "react-router-dom";
import API from '@ravibasil/common/api/clients.api';
import Products from './products'
import ClientPortal from './clientPortal';
import LogoView from '@ravibasil/common/components/LogoView';

import { useDispatch } from 'react-redux';
import { showErrorAlert, showSuccessAlert } from '../../actions/alert.action';
import { Spinner } from "reactstrap";
import Documentation from "../documentation";
import get from 'lodash/get';
import { useQuery } from '../../utils/customHooks'

const useStyles = makeStyles((theme) => ({
	tab: {
        textAlign: 'left'
    },
    MuiTabWrapper: {
        width: '100%',
        display: 'inline-flex',
        alignItems: 'flex-start !important',
        flexDirection: 'column',
        justifyContent: 'center'
    }
}));

const ClientDetail = () => {
    const classes = useStyles();
    let { id } = useParams();
    let query = useQuery();
    const history = useHistory();
    const dispatch = useDispatch();

    const [isLoading, setIsLoading] = useState(false);
    const [value, setValue] = useState(1);
    const [clientData, setClientData] = useState({});
    const [isWebsiteNameAvailable, setIsWebsiteNameAvailable] = useState(true);
    const [tabIndex, setTabIndex] = useState(1);

    useEffect(() => {
        if (query.get('tab')) {
            setTabIndex(parseInt(query.get('tab')))
        }

        setIsLoading(true)
        API.fetchClientsApi(`id=${id}`)
            .then(res => {

                setClientData(get(res, 'data[0]', {}));

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

        API.upsertClient(data)
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
            logo_name: logoName,
            logo_url: logoUrl
        };

        setClientData(updatedValues);
        syncWithServer(updatedValues);
    }

    const handleClientUpdate = (data) => {
        setClientData(data);
        setIsWebsiteNameAvailable(true)
    }


    const renderPageSwitch = (index) => {
        if (!get(clientData, 'id')) {
            return null
        }

        switch (tabIndex) {
            case 1:
                return <Products clientData={clientData} clientId={id} handleClientUpdate={handleClientUpdate} />

            case 2:
                return <ClientPortal clientData={clientData} handleClientUpdate={handleClientUpdate} isWebsiteNameAvailable={isWebsiteNameAvailable} />;

            case -2:
                return "shows order claims via data file input or online store api.  Allows shipping configurations to be set as well. configure labelling as well";
            case -3:
                return "configure Notifications of manufacturing setup finishing, or specific components of setup such as molds and validations of molds, notifications of finishing of products, notifications of products being shipped.  Configured for email, text, and/or datafile notifications, account manager tools to pull information based on this client and selectable characteristics about items and process groups";
            case -1:
                return "configure warranty length by product, and associated pricing";
            case 0:
                return "Product questions/troubleshooting call center, manual writing, product design is free if they agree before hand to manfucature for us for atleast a year";

            case 3:
                return "signed service agreement with the current state of config.  IF there is changed configs, those changes will show up here and will indicate to reduline the contract with those new items.  Also feature of auto generate the contract will be included";
            case 4:
                return <Documentation />
            case 5:
                return "shows the total of things to be billed. Can configure the specific billing period. Based on bank account to send to, will check if vendors have same and show reconciliation and net total";
            case 6:
                return "lists all failed validations of respective process groups and items";
            case 7:
                return "Allows to link with a vendor in the system.  if it is linked, it will give show a billing and a payments table and a total net payment table below";

            default:
                return "Undefined Tab Index";
        }
    }

    const handleTabChange = (event, newTabIndex) => {
        setTabIndex(newTabIndex)

        history.push({
            pathname: `/clients/${id}`,
            search: `?tab=${newTabIndex}`
        })
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
                    <SubHeaderWithArrow
                        action={'/clients'}
                        title={'Client Details'}
                    />
                    <Paper style={{ display: 'flex', padding: 10, margin: 10 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <h4>Client Name: {clientData.name}</h4>
                            <p>Client ID:{id}</p>
                        </div>
                        <LogoView
                            logoUrl={clientData.logo_url}
                            handleLogoChange={handleLogoChange}
                            name={clientData.name} />
                    </Paper>
                </Grid>
                <Grid item sm={2}>
                    <Paper style={{ padding: 20, margin: 10 }}>
                        <Tabs
                            className='MuiTabWrapper'
                            orientation="vertical"
                            variant="scrollable"
                            value={tabIndex}
                            onChange={handleTabChange}
                        >
                            <Tab label="Contract Manufacturing Products" value={1} className={classes.tab}/>
                            <Tab label="Client Portal" value={2} className={classes.tab}/>
                            <Tab label="Orders and Fulfillment" value={-2} className={classes.tab} />
                            <Tab label="Billing" value={5} className={classes.tab}/>
                            <Tab label="Purchased Automation Product/Services" value={null} className={classes.tab}/>
                            {/* <Tab label="Notifications" value={-3} /> */}
                            {/* <Tab label="Reports" value={2} />*/}
                            {/* <Tab label="Warranty Setup" value={-1} /> */}
                            {/*<Tab label="End User Features" value={0} />*/}
                            <Tab label="Documentation" value={4} />
                            {/* <Tab label="Service Agreement" value={3} /> */}
                            {/* <Tab label="Identified Issues" value={6} /> */}
                        </Tabs>
                    </Paper>
                </Grid>
                <Grid item sm sm={10}>
                    <Paper style={{ padding: 10, margin: 10 }}>
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

export default ClientDetail;
