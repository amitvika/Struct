import React, { Component } from "react";
import { connect } from "react-redux";
import { Spinner } from "reactstrap";
import { changePage } from "../actions/pageActions";
import {
  Checkbox,
  Snackbar,
  Paper,
  Tab,
  Tabs,
  Box,
  MenuItem,
  Breadcrumbs,
  Link,
  Select,
  Button,
  FormHelperText,
  FormControl,
  InputLabel,
  Grid,
  Typography
} from "@material-ui/core";
import MuiAlert from "@material-ui/lab/Alert";
import InfoIcon from "@material-ui/icons/Info";
import AddIcon from "@material-ui/icons/Add";
import BootstrapTable from "react-bootstrap-table-next";
import filterFactory, { textFilter } from "react-bootstrap-table2-filter";
import { NavLink } from "react-router-dom";
import NewProcessAdd from "../components/Processes/newProcessAdd";
import Machining from "../components/Processes/Machining";
import InjectionMolding from "../components/Processes/InjectionMolding";
import ProcessHelper from "../containers/ProcessHelper";
import Assembly from "../containers/Assembly";
import ProcessAPI from '../api/process.api';
import ProcessGroupAPI from '../api/processGroup.api';

class ProcessGroupDetail extends Component {
  state = {
    value: 0,
    columns: [
      {
        dataField: "record",
        text: "Processes",
        filter: textFilter()
      }
    ],
    products: [],
    allProcesses: [],
    allProcessesObject: {},
    processGroupDataLoaded: false
  };

  componentDidMount = () => {
    this.getProcesses();
  };

  printState = () => {
    console.log(this.state.allProcessesObject);
  };

  getProcesses = () => {
    ProcessAPI
      .getProcessApi()
      .then(res => {
        var allProcessesObject = {};
        res.data.forEach((x, index) => {
          allProcessesObject[x._id] = x.name;
        });

        this.setState(
          {
            allProcesses: res.data,
            allProcessesObject: allProcessesObject
          },
          () => {
            this.getProcessGroup();
          }
        );
      })

      .catch(err => {
        this.setState({
          msg: err,
          snackBarAlertType: "error",
          snackBar: true
        });
      });
  };

  getProcessGroup = () => {
    this.setState(state => ({
      processGroupDataLoaded: false
    }));
    ProcessGroupAPI
      .getProcessGroupsByIdApi(this.props.match.params.id)
      .then(res => {
        this.setState(state => ({
          processGroupName: res.data.name,
          processGroupClientName: res.data.client.name,
          processGroupClientId: res.data.client._id
        }));
        ///////////////////////
        ProcessGroupAPI
          .getProcessDataApi(this.props.match.params.id)
          .then(res => {
            var processData = res.data.map((x, index) => {
              return {
                id: x._id,
                record:
                  this.state.allProcessesObject[x.process] + "\nID:" + x._id,
                process: x.process,
                processName: this.state.allProcessesObject[x.process],
                createdBy: x.createdBy
                // record: "process name" + "\nID:" + x._id
              };
            });
            processData.unshift({
              id: 0,
              process: "n/a",
              createdBy: "Struct",
              processName: "Process Helper",
              record: <strong>Process Helper</strong>
            });

            this.setState(state => ({
              processGroupDataLoaded: true,
              products: processData
            }));
          })
          .catch(err => {
            this.setState({
              msg: err,
              snackBarAlertType: "error",
              snackBar: true
            });
          });
        //////////////////////////
      })
      .catch(err => {
        this.setState({
          msg: err,
          snackBarAlertType: "error",
          snackBar: true
        });
      });
  };

  handleChange = (event, newValue) => {
    this.setState({ value: newValue });
  };

  onNewProcessSelect = event => {
    this.setState({
      selectedProcess: event.target.value,
    });
  };

  processAddButton = () => {

    const newClient = {
      process: this.state.selectedProcess,
      user: this.props.auth.user._id,
      processGroup: this.props.match.params.id,
      client: this.state.processGroupClientId
    }; //

    ProcessGroupAPI.
      addProcessDataApi(newClient)
      .then(res => {
        //add the new process to state handling the
        var tempProcessList = this.state.products;
        var newProcess = {
          id: res.data._id,
          record:
            this.state.allProcessesObject[res.data.process] +
            "\nID:" +
            res.data._id,
          createdBy: this.props.auth.user,
          process: res.data.process,
          processName: this.state.allProcessesObject[res.data.process]
        };
        tempProcessList.push(newProcess);
        this.setState({
          msg: "Process Added",
          snackBarAlertType: "success",
          snackBar: true,
          products: tempProcessList
        });
      })
      .catch(err => {
        this.alertForError(err);
      });

  };

  alertForError = (err) => {
    if (err.response && err.response.data) {
      this.setState({
        msg: err.response.data.message,
        snackBarAlertType: "error",
        snackBar: true
      });
    }
  }
  handleClose = (event, reason) => {
    this.setState({
      snackBar: !this.state.snackBar
    });
  };
  selectRow = {
    mode: "radio",
    clickToSelect: true,
    style: { backgroundColor: "#ededed" },
    onSelect: (row, isSelect, rowIndex, e) => {
      console.log(row)
      this.setState({
        value: row.process,
        selectedProcessId: row.id,
        selectedProcessName: row.processName,
        selectedProcessCreator: row.createdBy.name
      });
    }
  };

  renderPageSwitch = (index) => {
    switch (index) {
      case 0:
        return <ProcessHelper />;
      case 1:
        return <NewProcessAdd />;
      case "5eaeee3f8986281884691dd7":
        return <Machining />;
      case "5eaeef468986281884691dd9":
        return <Assembly processId={this.state.selectedProcessId} />;
      case "5eaeef0a8986281884691dd8":
        return <InjectionMolding />;

      default:
        return "Undefined Tab Index";
    }
  }

  render() {

    return (
      <div>
        <Snackbar
          open={this.state.snackBar}
          autoHideDuration={10000}
          onClose={this.handleClose}
        >
          <MuiAlert
            severity={this.state.snackBarAlertType}
            onClose={this.handleClose}
          >
            {this.state.msg}
          </MuiAlert>
        </Snackbar>

        {this.state.processGroupDataLoaded ? (
          <Grid container>
            <Grid item sm sm={12}>
              <Paper style={{ padding: 20, margin: 10 }}>
                <Breadcrumbs
                  style={{
                    display: "flex",
                    justifyContent: "center"
                  }}
                >
                  <NavLink
                    to='/process-groups'                  >
                    Process Groups
                  </NavLink>

                  <Typography color="textPrimary">
                    Process Group:{" "}
                    <strong>{this.state.processGroupName}</strong>
                  </Typography>
                </Breadcrumbs>
              </Paper>
              <Paper style={{ padding: 10, margin: 10 }}>
                <Grid container>
                  <Grid item sm sm={4}>
                    <div title="Process groups are 1 or more processes.  Each processes uses item(s) and outputs item(s). Use process groups to group processes in any way you want. Some recommended ways of grouping are the following: 1. group processes that sequentially use the output item of the last process 2. Group proceses that are for one product 3. Place assembly processes in a standalone process group 4. place any process in a process group by itself if you like.  Really this tool is made for your own organization such as a file structure.">
                      <h4>
                        {""}
                        <InfoIcon />{" "}
                        <strong>{this.state.processGroupName}</strong>
                      </h4>
                      Client: {this.state.processGroupClientName}
                      {" | "}Process Group ID: {this.props?.match?.params?.id}
                    </div>
                  </Grid>

                  <Grid item sm sm={4}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center"
                      }}
                    >
                      <div title="Please select processes to add to the below process group.  This will add the process to this group for organization purposes.  Each process utilizes item(s) and generates item(s)">
                        <InfoIcon />{" "}
                        <FormControl style={{ minWidth: 200 }}>
                          <InputLabel id="demo-simple-select-helper-label">
                            Choose Process
                          </InputLabel>
                          <Select
                            labelId="demo-simple-select-helper-label"
                            onChange={this.onNewProcessSelect}
                          >
                            {this.state.allProcesses.map(({ _id, name }) => (
                              <MenuItem key={_id} value={_id}>{name}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>{" "}
                        <Button onClick={this.processAddButton}>
                          <AddIcon />
                        </Button>
                      </div>
                    </div>
                  </Grid>

                  <Grid item sm sm={4}></Grid>
                </Grid>
              </Paper>
            </Grid>
            <Grid item sm={2}>
              <div style={{ padding: 0, margin: 10 }}>
                <BootstrapTable
                  keyField="record"
                  data={this.state.products}
                  columns={this.state.columns}
                  filter={filterFactory()}
                  hover
                  condensed
                  selectRow={this.selectRow}
                />
              </div>
            </Grid>
            <Grid item sm sm={10}>
              {this.state.value !== 1 ? (
                <div>
                  <Paper style={{ padding: 20, margin: 10 }}>
                    <h4>{this.state.selectedProcessName}</h4>
                    Created by: {this.state.selectedProcessCreator} | Process
                    ID: {this.state.selectedProcessId}
                    {/*<Button onClick={this.printState}>Test State</Button>*/}
                  </Paper>
                  <Paper style={{ padding: 20, margin: 10 }}>
                    {this.renderPageSwitch(this.state.value)}
                  </Paper>
                </div>
              ) : (
                  <Paper style={{ padding: 20, margin: 10 }}>
                    <h5>Please Select Process to Edit</h5>
                  </Paper>
                )}
            </Grid>
          </Grid>
        ) : (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "7%"
              }}
            >
              <Spinner animation="border" />
            </div>
          )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(mapStateToProps, { changePage })(ProcessGroupDetail);
