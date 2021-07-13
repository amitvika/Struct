import React, { useEffect, useState } from "react";
import { Spinner, } from "reactstrap";
import Card from "@material-ui/core/Card";
import {
    Button,
    Snackbar,
    Breadcrumbs,
    CardContent,
} from "@material-ui/core";

import UserAccessModal from "../containers/UserAccessModal";
import ClientBasedAccess from "../containers/accessConfig/ClientBasedAccess";
import ClientObjectAccess from "../containers/accessConfig/ClientObjectAccess";
import VendorObjectAccess from "../containers/accessConfig/VendorObjectAccess";
import ItemObjectAccess from "../containers/accessConfig/ItemObjectAccess";
import OperationAccess from "../containers/accessConfig/OperationAccess";
import ProcessGroupObjectAccess from '../containers/accessConfig/ProcessGroupObjectAccess';
import ProcessObjectAccess from '../containers/accessConfig/ProcessObjectAccess';
import { getUserAccessConfigurationAction } from '../actions/accessConfig.action';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from "react-router-dom";
import { NavLink } from 'react-router-dom'
import AccessConfigurationAPI from '@ravibasil/common/api/accessConfig.api'
import { showErrorAlert, showSuccessAlert } from '../actions/alert.action';
import SubHeaderWithArrow from '../components/SubHeaderWithArrow'

const AccessConfiguration = (props) => {
    const dispatch = useDispatch();
    const { id } = useParams();

    const [localState, setLocalState] = useState({
        modal: false,
        tableLoaded: true,
        userAccessLoaded: true,
        userAccessName: "",
        userAccessId: 0,
        msg: "",
        snackBar: false,
        snackBarAlertType: "",

        //userAccessUsers: {},
        OA_1_E: false,
        OA_1_V: false,
        OA_2_E: false,
        OA_2_V: false,

        COA_1_E: false,
        COA_1_V: false,
        COA_2_E: false,
        COA_2_V: false,
        COA_3_E: false,
        COA_3_V: false,

        VOA_1_E: false,
        VOA_1_V: false,
        VOA_2_E: false,
        VOA_2_V: false,
        VOA_3_E: false,
        VOA_3_V: false,

        PGOA_1_E: false,
        PGOA_1_V: false,
        PGOA_2_E: false,
        PGOA_2_V: false,
        PGOA_3_E: false,
        PGOA_3_V: false,

        IOA_1_E: false,
        IOA_1_V: false,
        IOA_2_E: false,
        IOA_2_V: false,
        IOA_3_E: false,
        IOA_3_V: false,

        POA_1_E: false,
        POA_1_V: false,
        POA_2_E: false,
        POA_2_V: false,
        POA_3_E: false,
        POA_3_V: false,
        POA_4_E: false,
        POA_4_V: false,
        POA_5_E: false,
        POA_5_V: false,
        POA_6_E: false,
        POA_6_V: false
    });

    const { isLoading, data } = useSelector(state => state.accessConfig);
    const user = useSelector(state => state.auth.user);
    const userAccessUsers = useSelector(state => state.userAccessUsers.userAccessUsers)
    

    useEffect(() => {
        dispatch(getUserAccessConfigurationAction(id || props.accessSetupId));
    }, []);

    useEffect(() => {
        if (data && !isLoading) {
            if (data.access == null) {
                setLocalState(state => {
                    return {
                        ...state,
                        userAccessLoaded: true,
                        userAccessName: data.name,
                        userAccessId: data._id
                    }
                });
            } else {
                setLocalState(state => {
                    return {
                        ...state,
                        ...data.access,
                        userAccessLoaded: true,
                        userAccessName: data.name,
                        userAccessId: data._id,

                    }
                });
            }
        }
    }, [isLoading, data]);

    const saveUserAccess = async () => {
        try {
            const saveAccessConfig = await AccessConfigurationAPI
                .saveUserAccessConfigurationAPI(localState.userAccessId, {
                    state: localState,
                    user: user,
                    name: localState.userAccessName
                });

            if (!saveAccessConfig) {
                throw { message: 'Unable update info' }
            }
            await AccessConfigurationAPI
                .updateUserAccessConfigurationForUserAPI(localState.userAccessId, {
                    users: userAccessUsers,
                    user: user,
                    userAccessId: localState.userAccessId
                })
            dispatch(showSuccessAlert({ message: 'All data is saved' }));

        }
        catch (error) {
            dispatch(showErrorAlert({ message: 'Unable to save info' }));
        }


    }

    const alertForError = (err) => {
        let message = `It's not you , it's us`
        if (err.response && err.response.data) {
            message = err.response.data.message;
        }
        else if (err && err.message) {
            message = err.message;
        }

        setLocalState(state => {
            return {
                ...state,
                msg: message,
                snackBarAlertType: "error",
                snackBar: true,
                tableLoaded: true
            }
        });
    }

    const updateAccessState = e => {
        setLocalState(state => {
            return {
                ...state,
                [e.target.name]: !state[e.target.name]
            }
        });
    };


    if (isLoading) {
        return <div>Loading......</div>
    }
    const handleAccessConfig = () => {
        <NavLink
            to={`/administrative?tab=2`}
        >
            Access Setup
        </NavLink>
        
    }
    return (
        <>
            <div>

                {localState.tableLoaded && localState.userAccessLoaded ? (
                    <div>
                        {/* <Paper style={{ padding: 20, marginBottom: 10 }}>
                            <Breadcrumbs
                                style={{
                                    display: "flex",
                                    justifyContent: "center"
                                }}
                            > */}
                        <SubHeaderWithArrow
                            action={`/administrative?tab=3`}
                            title={`Access Setup/ User Access Configuration`}
                        />
                        
                        <Card className="mb-2">

                            <CardContent>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "center"
                                    }}
                                >
                                    <h4>{localState.userAccessName} </h4>
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "center"
                                    }}
                                >
                                    <p>Access Setup ID: {localState.userAccessId} </p>
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "center"
                                    }}
                                >
                                    <UserAccessModal userAccessState={localState} />
                                </div>
                            </CardContent>
                        </Card>

                        <OperationAccess
                            access={localState}
                            updateAccessState={updateAccessState}
                        />
                        <div className="mb-2"> </div>
                        <ClientBasedAccess
                            userAccessLoaded={localState.userAccessLoaded}
                            access={localState}
                            updateAccessState={updateAccessState}
                        />

                        <div className="mb-2"></div>
                        <ClientObjectAccess
                            access={localState}
                            updateAccessState={updateAccessState}
                        />

                        <div className="mb-2"></div>
                        <VendorObjectAccess
                            access={localState}
                            updateAccessState={updateAccessState}
                        />

                        <div className="mb-2"> </div>

                        <ProcessGroupObjectAccess
                            access={localState}
                            updateAccessState={updateAccessState}
                        />
                        <div className="mb-2"></div>
                        <ItemObjectAccess
                            access={localState}
                            updateAccessState={updateAccessState} />
                        <div className="mb-2"></div>
                        <ProcessObjectAccess
                            access={localState}
                            updateAccessState={updateAccessState} />

                        <Snackbar
                            open={true}
                            //autoHideDuration={10000}
                            //onClose={this.handleClose}
                            style={{
                                marginRight: "17%"
                            }}
                            anchorOrigin={{
                                vertical: "bottom",
                                horizontal: "right"
                            }}
                        >
                            <Button
                                className="mt-2 mb-3"
                                variant="contained"
                                color="primary"
                                onClick={saveUserAccess}
                            >
                                Save
                            </Button>
                        </Snackbar>
                    </div>
                ) : (
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center"
                        }}
                    >
                        <Spinner animation="border" />
                    </div>
                )}
            </div>
        </>
    );
}

export default AccessConfiguration;
