import React, { useState, useEffect } from "react";
import {
    Snackbar,
    Button,
    Paper,
    Tab,
    Tabs,
    Box,
    Grid,
    Breadcrumbs,
    Typography,
    CircularProgress
} from "@material-ui/core";
import { NavLink, useParams, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';

import BaseItemProperties from './baseItemProperties';
import GeometricDimensioning from './geometricDimensioning';
import CurrentUsage from './currentUsage';
import VendorDetails from './VendorDetails';
import Manufacturing from '../manufacture/index2'
import ClientSetup from './clientSetup';
import Assembly from './assembly';
import Production from './production'
import SurfaceFinishAndTreatment from './SurfaceFinishAndTreatment';
import ComplianceAndCertifications from './ComplianceAndCertifications';

import ItemTypeConfigurations from './itemTypeConfigurations';
import ItemAPI from '../../api/items.api';
import { showErrorAlert, showSuccessAlert } from '../../actions/alert.action';
import { setCurrentItemAction } from '../../actions/itemActions'
import get from 'lodash/get';
import { useQuery } from '../../utils/customHooks'

const ItemDetail = () => {
    const dispatch = useDispatch();
    const history = useHistory();
    let { id } = useParams();
    let query = useQuery();

    const currentItem = useSelector(state => state.item.currentItem);
    const [dispensing, setDispensing] = useState({});
    const [tabIndex, setTabIndex] = useState(1);
    const [itemProperties, setItemProperties] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [gltfjson, setgltfjson] = useState({});

    useEffect(() => {
        if (query.get('tab')) {
            setTabIndex(parseInt(query.get('tab')))
        }

        (async () => {
            setIsLoading(true);
            const itemDetailResponse = await ItemAPI.getItemsAPI(`id=${id}`)

            const _currentItem = get(itemDetailResponse, 'data[0]', {});
            // setItemProperties(_currentItem);

            dispatch(setCurrentItemAction(_currentItem));

            const tempGLTFJSon = get(itemDetailResponse, 'data[0].gltfjson', {});

            if (tempGLTFJSon !== null && tempGLTFJSon !== undefined) {
                setgltfjson(tempGLTFJSon)

            }

            setIsLoading(false);
        })()
    }, []);

    useEffect(() => {
        if (currentItem) {
            setItemProperties(currentItem);
        }
    }, [currentItem])

    const renderPageSwitch = () => {
        if (!get(itemProperties, '_id')) {
            return null;
        }

        switch (tabIndex) {
            case 0:
                return "Add vendor items here";
            case 1:
                return <BaseItemProperties
                    itemId={id}
                    itemProperties={itemProperties}
                    setItemProperties={setItemProperties}
                    gltfjson={gltfjson} setgltfjson={setgltfjson} />;
            case 2:
                return <GeometricDimensioning fileId={itemProperties.fileId} />
            case 3:
                return <CurrentUsage itemId={id} />
            case 4:
                return <ItemTypeConfigurations itemId={id} itemProperties={itemProperties} setItemProperties={setItemProperties} />
            case 5:
                return <VendorDetails />
            case 6:
                return <Manufacturing />;
            case 7:
                return <ClientSetup itemProperties={itemProperties} setItemProperties={setItemProperties} />;
            case 8:
                return <Assembly
                    assemblyTree={get(gltfjson, 'tree', [])} />;
            case 9:
                return <Production />;
            case 10:
                return <SurfaceFinishAndTreatment />
            case 11:
                return <ComplianceAndCertifications
                    itemValue={itemProperties}
                    setItemValue={setItemProperties} />
            case 12:
                return "Functional Load and Simulation"
            case 13:
                return "Design Modifications"
            case 14:
                return "Software Loading for PCBs, ICs"
            case 15:
                return "Production Validations"
            case 16:
                return "Process Sharing"
            case 17:
                return "Warranty & Maintenance Management"
            case 18:
                return "Product Documentation"
            case 19:
                return "Recycling & Sustainability"
            case 20:
                return "Design Product Design"
            default:
                return "Undefined Tab Index";
        }
    }

    const handleSave = () => {
        // setIsLoading(true);
        itemProperties.step = undefined;
        itemProperties.itemId = undefined;
        ItemAPI
            .updateItemAPI(id, { ...itemProperties })
            .then(res => {
                setItemProperties(res.data);
                dispatch(showSuccessAlert({ message: 'All data is saved' }));
            })
            .catch(error => {
                dispatch(showErrorAlert({ message: 'Unable to save info' }));
            })
    }

    const handleTabChange = (event, newTabIndex) => {
        setTabIndex(newTabIndex)

        history.push({
            pathname: `/items/${id}`,
            search: `?tab=${newTabIndex}`
        })
    }

    if (isLoading) {
        return <CircularProgress />;
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
                                to='/items'>
                                Items
								</NavLink>

                            <Typography color="textPrimary">Item Details</Typography>
                        </Breadcrumbs>
                    </Paper>
                    <Paper style={{ padding: 10, margin: 10 }}>
                        <h4>Item Name: {itemProperties.name}</h4>
                        <p>Item ID:{id}</p>
                    </Paper>
                </Grid>
                <Grid item sm={2}>
                    <Paper style={{ padding: 20, margin: 10 ,marginBottom: "70px"}}>
                        <Tabs
                            orientation="vertical"
                            variant="scrollable"
                            value={tabIndex}
                            onChange={handleTabChange}>
                            {/* <Tab label="Base Item Properties" value={1} /> */}
                            <Tab label="Product Design or CAD Upload" value={1} />
                            <Tab label="Compliance and Certifications" value={11} />
                            {
                                // itemProperties?.itemGeometry?.isEndProductSelected &&
                                // <Tab label="Client Setup" value={7} />
                            }

                            {/* { */}
                            {/* itemProperties?.itemGeometry?.itemType && */}
                            <Tab label="GD&T and Assembly Constraints" value={2} />
                            <Tab label="Surface Finish and Treatment" value={10} />
                            <Tab label="Functional Load and Simulation" value={12} />
                            <Tab label="Design Modifications" value={13} />
                            <Tab label="Software Loading for PCBs, ICs" value={14} />



                            {/* } */}

                            <Tab label="Assembly" value={8} />
                            {
                                // itemProperties.assemblyType === 'Multi-Item Assembly' && 
                            }
                            <Tab label="Current Usage" value={3} />

                            {/* {
								itemProperties.vendorId && 
								<Tab label="Vendor Details" value={5} />
							} */}


                            <Tab label="Manufacture, Processing, & Process Simulation" value={6} />
                            <Tab label="Production Validations" value={15} />
                            <Tab label="Process Sharing" value={16} />
                            <Tab label="Warranty & Maintenance Management" value={17} />
                            <Tab label="Product Documentation" value={18} />
                            <Tab label="Recycling & Sustainability" value={19} />
                            <Tab label="Product Design Setup" value={20} />
                            {/* <Tab label="Item Type Configurations" value={4} /> */}
                            <Tab label ="Internal Use Product Configurations" value={4} />
                            <Tab label="Production" value={9} />


                        </Tabs>
                    </Paper>
                </Grid>
                <Grid item sm sm={10}>
                    <Paper style={{ padding: 20, margin: 10 }}>
                        {renderPageSwitch()}
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

export default ItemDetail;
