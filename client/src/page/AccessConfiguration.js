import React, { useEffect, useState } from "react";
import axios from "axios";
import { Spinner, Alert } from "reactstrap";
import { tokenConfig } from "../actions/authActions";
import store from "../store";
import Card from "@material-ui/core/Card";
import {
  Button,
  Snackbar,
  Checkbox,
  Link,
  Breadcrumbs,
  Typography,
  Paper,
  CardContent
} from "@material-ui/core";
import MuiAlert from "@material-ui/lab/Alert";
import UserAccessModal from "../containers/UserAccessModal";
import ClientBasedAccess from "../containers/accessConfig/ClientBasedAccess";
import ClientObjectAccess from "../containers/accessConfig/ClientObjectAccess";
import ItemObjectAccess from "../containers/accessConfig/ItemObjectAccess";
import OperationAccess from "../containers/accessConfig/OperationAccess";
import ProcessGroupObjectAccess from '../containers/accessConfig/ProcessGroupObjectAccess';
import ProcessObjectAccess from '../containers/accessConfig/ProcessObjectAccess';
import { getUserAccessConfigurationAction } from '../actions/accessConfig.action';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from "react-router-dom";
import { NavLink } from 'react-router-dom'
import AccessConfigurationAPI from '../api/accessConfig.api'

const AccessConfiguration = (props) => {
  const dispatch = useDispatch();
  const history = useHistory();
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

  useEffect(() => {
    dispatch(getUserAccessConfigurationAction(id));
  }, []);

  useEffect(() => {
    console.log('-----', data)
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
            userAccessLoaded: true,
            userAccessName: data.name,
            userAccessId: data._id,
            ...data.access
          }
        });
      }
    }
  }, [isLoading, data]);

  const saveUserAccess = async () => {
    try {
      const saveAccessConfig = await AccessConfigurationAPI.saveUserAccessConfigurationAPI(localState.userAccessId, {
        state: localState,
        user: user,
        name: localState.userAccessName
      });

      if (!saveAccessConfig) {
        throw { message: 'Unable update info' }
      }
      console.log('--->>',props.userAccessUsers)
      const updateAccesConfigForUser = await AccessConfigurationAPI.updateUserAccessConfigurationForUserAPI(localState.userAccessId, {
        users: props.userAccessUsers,
        user: user,
        userAccessId: localState.userAccessId
      })

      if (!updateAccesConfigForUser) {
        throw { message: 'Unable update info' }
      }

      setLocalState(state => {
        return {
          ...state,
          msg: "Configurations Saved",
          snackBarAlertType: "success",
          snackBar: true
        }
      })


    } catch (error) {
      console.log('---', error)
      alertForError(error)
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
    console.log(localState);
  };

  const retrieveClientsFromDb = access => {
    this.setState(state => ({
      tableLoaded: false,
      rowData1: state.rowData1
    }));
    axios
      .get("/api/clients")
      .then(res => {
        /*
        var rowData = res.data.filter((x, index) => {
          return x.deletedAt == null;
        });*/

        var rowData = res.data;

        rowData.forEach(element => {
          this.setState({
            [element._id]: false
          });
        });
        var rowData1 = rowData.map((x, index) => {
          if (access == null) {
            return {
              clientId: x._id,
              client: x.name,
              allow: (
                <Checkbox
                  color="primary"
                  name={x._id}
                  onChange={updateAccessState}
                />
              )
            };
          } else if (access[x._id]) {
            this.setState({
              [x._id]: true
            });
            return {
              clientId: x._id,
              client: x.name,
              allow: (
                <Checkbox
                  color="primary"
                  name={x._id}
                  defaultChecked
                  onChange={updateAccessState}
                />
              )
            };
          } else {
            return {
              clientId: x._id,
              client: x.name,
              allow: (
                <Checkbox
                  color="primary"
                  name={x._id}
                  onChange={updateAccessState}
                />
              )
            };
          }
        });

        this.setState(state => ({
          tableLoaded: true,
          rowData1
        }));
      })
      .catch(err => console.log(err));
  };

  const updateClientAccessState = id => {
    setLocalState(state => {
      return {
        ...state,
        [id]: !state[id]
      }
    });
  };

  const handleClose = (event, reason) => {
    setLocalState(state => {
      return {
        ...state,
        snackBar: !state.snackBar
      }
    });
  };

  return (
    <div>
      <Snackbar
        open={localState.snackBar}
        autoHideDuration={10000}
        onClose={handleClose}
      >
        <MuiAlert
          severity={localState.snackBarAlertType}
          onClose={handleClose}
        >
          {localState.msg}
        </MuiAlert>
      </Snackbar>

      {localState.tableLoaded && localState.userAccessLoaded ? (
        <div>
          <Paper style={{ padding: 20, marginBottom: 10 }}>
            <Breadcrumbs
              style={{
                display: "flex",
                justifyContent: "center"
              }}
            >
              <NavLink
                to={`/access-setup`}
              >
                Access Setup
                </NavLink>

              <Typography color="textPrimary">
                User Access Configuration
                </Typography>
            </Breadcrumbs>
          </Paper>

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
  );
}

export default AccessConfiguration;
