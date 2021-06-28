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
    CircularProgress,
    IconButton
} from "@material-ui/core";
import AddBoxIcon from '@material-ui/icons/AddBox';
import EditIcon from '@material-ui/icons/Edit';
import SubHeaderWithArrow from '../../components/SubHeaderWithArrow'
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
import ItemAPI from '@ravibasil/common/api/items.api';
import { showErrorAlert, showSuccessAlert } from '../../actions/alert.action';
import { setCurrentItemAction } from '../../actions/itemActions'
import get from 'lodash/get';
import { useQuery } from '../../utils/customHooks'
import { getHierarchySplitFiles } from '@ravibasil/common/api/fileUpload.api'

const DEFAULTDISTANCEGAP = 0.1;
const DEFAULTANGLEGAP = 0.5;
const DEFAULTDISECT = false;
const DEFAULTSHOWDISECT = false;
const DEFAULTSHOWINFOONSELECT = false;
const DEFAULTMATERIALTYPE = [{ "id": 1, "name": "Basic" }];

const stateprops = {
    distancegap: DEFAULTDISTANCEGAP,
    anglegap: DEFAULTANGLEGAP,
    disect: DEFAULTDISECT,
    showdisect: DEFAULTSHOWDISECT,
    showinfoonselect: DEFAULTSHOWINFOONSELECT,
    materialtype: DEFAULTMATERIALTYPE
}

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

            dispatch(setCurrentItemAction(_currentItem));

            if (_currentItem.fileId) {
                getHierarchySplit(_currentItem.fileId);
            }
            // const tempGLTFJSon = get(itemDetailResponse, 'data[0].gltfjson', {});

            // if (tempGLTFJSon !== null && tempGLTFJSon !== undefined) {
            //     setgltfjson(tempGLTFJSon)

            // }

            setIsLoading(false);
        })()
    }, []);

    useEffect(() => {
        if (currentItem) {
            setItemProperties(currentItem);
        }
    }, [currentItem])

    const getHierarchySplit = (id) => {

        getHierarchySplitFiles(id, true, stateprops.distancegap, stateprops.anglegap,
            stateprops.disect, 0, 0.3, 1.0)
            .then(res => res.data)
            .then((repos) => {
                setgltfjson(repos);

            }).catch(err => {
            });

    };

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
                return <GeometricDimensioning
                    fileId={itemProperties.fileId}
                    gltfjson={gltfjson}
                    isLoading={isLoading}
                />
            case 3:
                return <CurrentUsage itemId={id} />
            case 4:
                return <ItemTypeConfigurations
                    itemId={id}
                    itemProperties={itemProperties}
                    setItemProperties={setItemProperties}
                    gltfjson={gltfjson}
                    setgltfjson={setgltfjson} />
            case 5:
                return <VendorDetails />
            case 6:
                return <Manufacturing
                    itemId={id}
                    itemProperties={itemProperties}
                    setItemProperties={setItemProperties}
                    fetchList={ItemAPI.getItemsAPI} />;
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
        itemProperties.gltfjson = undefined;
        itemProperties.itemId = undefined;
        //const myfile = gltfjson['thumbnail'];
        //console.log(myfile);
        //var file_url = resourcePathURL+myfile;
        /*  if(myfile) {
             const File={'name':file_url,
                         'type':'image/png'};
             uploadFileS3Bucket(File).then(res=>{
                 console.log(res);
                 file_url = res;
             });
             gltfjson['file_url'] = file_url;
             console.log(file_url);
         }  else {
             //gltfjson['file_url'] = file_url;
         }   */

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
                    <SubHeaderWithArrow
                        action={'/items'}
                        title={'Items Details'}
                    />
                    <Paper style={{ padding: 10, margin: 10, display: "flex" }}>
                        <Grid>
                            <h4>Item Name: {itemProperties.name}</h4>
                            <p>Item ID:{id}</p>
                        </Grid>

                        <Grid style={{ marginLeft: 'auto' }}>
                            <Button>
                                <AddBoxIcon />
                            </Button>
                            <Button>
                                <EditIcon />
                            </Button>

                        </Grid>
                    </Paper>
                </Grid>
                <Grid item sm={2}>
                    <Paper style={{ margin: 10, marginBottom: "70px" }}>

                        <Tabs
                            orientation="vertical"
                            variant="scrollable"
                            value={tabIndex}
                            onChange={handleTabChange}>
                            <Tab label="1. Product Design or CAD Upload" value={1} />
                            <Tab label="2. Compliance and Certifications" value={11} />

                            <Tab label="3. GD&T and Assembly Constraints" value={2} />
                            <Tab label="4. Surface Finish and Treatment" value={10} />
                            <Tab label="5. Functional Load and Simulation" value={12} />
                            <Tab label="6. Design Modifications" value={13} />
                            <Tab label="7. Software Loading for PCBs, ICs" value={14} />
                            <Tab label="8. Assembly" value={8} />

                            <Tab label="9. Current Usage" value={3} />
                            <Tab label="10. Manufacture, Processing, & Process Simulation" value={6} />
                            <Tab label="11. Production Validations" value={15} />
                            <Tab label="12. Process Sharing" value={16} />
                            <Tab label="13. Warranty & Maintenance Management" value={17} />
                            <Tab label="14. Product Documentation" value={18} />
                            <Tab label="15. Recycling & Sustainability" value={19} />
                            <Tab label="16. Product Design Setup" value={20} />
                            <Tab label="17.Internal Use Product Configurations" value={4} />
                            <Tab label="18. Production" value={9} />


                        </Tabs>
                    </Paper>
                </Grid>
                <Grid item sm sm={10}>
                    {/* <Paper style={{ margin: 10 }}> */}
                    {renderPageSwitch()}
                    {/* </Paper> */}
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
