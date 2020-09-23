import MaterialTable, { MTableToolbar } from "material-table";
import React, { Component } from "react";
import { connect } from "react-redux";
import { Spinner } from "reactstrap";
import { changePage } from "../actions/pageActions";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import ProcessGroupAPI from '../api/processGroup.api';
import ClientAPI from '../api/clients.api';
import ShowHistoryModal from "../containers/ShowHistoryModal";
import Toolbar from '../components/Toolbar';

class ProcessGroups extends Component {
  state = {
    rowData: [],
    tableLoaded: false,
    isDeletedItemVisible: false,
    msg: "",
    snackBar: false,
    snackBarAlertType: "",
    clientDropDownData: {},
    columns: [
      { title: "ID", field: "id", editable: "never" },
      { title: "Name", field: "name" },
      {
        title: "Client",
        field: "client",
        lookup: { 34: "İstanbul", 63: "Şanlıurfa" }
      },
      {
        title: "Created By",
        field: "created_by",
        editable: "never",
        initialEditValue: this.props.auth.isAuthenticated
          ? this.props.auth.user.name
          : "Guest"
      },
      {
        title: 'History',
        field: "id",
        editable: "never",
        render: rowData => <span style={{ cursor: 'pointer' }}
          onClick={(event) => {
            event.stopPropagation();
            this.handleHistoryModal({ rowId: rowData.id })
          }}> Show History </span>
      },
    ],
    isHistoryModalOpened: false,
    selectedItemId: ''
  };

  componentDidMount() {
    this.retrieveClientDropDownFromDb();
    this.retrieveFromDb();
  }

  retrieveFromDb = () => {

    this.setState(state => ({
      tableLoaded: false,
      rowData: state.rowData
    }));
    ProcessGroupAPI.getProcessGroupsApi()
      .then(res => {
        var rowData;
        if (!this.state.showDeletes) {
          rowData = res.data
          console.log(rowData);
          rowData = rowData.map((x, index) => {
            return {
              id: x._id,
              name: x.name,
              client: x.client._id,
              created_by: x.createdBy.name,
              deleted_at: x.deletedAt
            };
          });
        } else {
          rowData = res.data
          rowData = rowData.map((x, index) => {
            return {
              id: x._id,
              name: x.name,
              client: x.client._id,
              created_by: x.createdBy.name,
              deleted_at: x.deletedAt
            };
          });
        }


        this.setState({ rowData },
          () => {
            this.setState(state => ({
              tableLoaded: true
            }));
          }
        );
      })
      .catch(err => console.log(err));

  };

  retrieveClientDropDownFromDb = () => {
    this.setState(state => ({
      tableLoaded: false
    }));
    ClientAPI.fetchClientsApi()
      .then(res => {
        var rowData = res.data

        var clientDropDownData = {};
        rowData.forEach(x => {
          clientDropDownData[x._id] = x.name;
        });

        var columns = this.state.columns;
        columns[2].lookup = clientDropDownData;
        //console.log(clientDropDownData);
        this.setState(state => ({
          tableLoaded: true,
          columns
        }));
      })
      .catch(err => console.log(err));
  };

  handleClose = (event, reason) => {
    this.setState({
      snackBar: !this.state.snackBar
    });
  };

  handleShowDelete = () => {
    const columns = this.state.columns;
    if (!this.state.isDeletedItemVisible) {
      columns.push({ title: "Deleted At", field: "deleted_at" });
    } else {
      columns.pop();
    }
    this.setState(
      state => ({
        isDeletedItemVisible: !state.isDeletedItemVisible
      }),
      () => this.retrieveFromDb()
    );
  };

  handleHistoryModal = ({ rowId }) => {
    this.setState({
      isHistoryModalOpened: !this.state.isHistoryModalOpened,
      selectedItemId: rowId
    })
  }

  render() {
    const { user } = this.props.auth;
    return (
      <div>
        <ShowHistoryModal isVisible={this.state.isHistoryModalOpened} pageName={'ProcessGroup'} selectedItemId={this.state.selectedItemId} />
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
        {this.state.tableLoaded ? (
          <MaterialTable
            columns={this.state.columns}
            data={this.state.rowData}
            title="Process Groups"
            options={{
              actionsColumnIndex: 5,
              addRowPosition: "first",
              exportButton: true,
              exportFileName: "ProcessGroups"
            }}
            onRowClick={(rowdata, event) => {
              const selection = window.getSelection();

              if (selection.type != "Range") {
                this.props.history.push(`/process-groups/${event.id}`);
              }
            }}
            components={{
              Toolbar: props => (
                <div>
                  <MTableToolbar {...props} />
                  <Toolbar
                    isDeletedItemVisible={this.state.isDeletedItemVisible}
                    handleDeletedToggle={this.handleShowDelete}
                    isHistoryModalOpened={this.state.isHistoryModalOpened}
                    handleHistoryToggle={this.handleHistoryModal}
                  />
                </div>
              )
            }}
            editable={{
              onRowAdd: newData => {
                const data = {
                  name: newData.name,
                  client: newData.client,
                  user: this.props.auth.isAuthenticated
                    ? this.props.auth.user._id
                    : "Guest"
                }; //
                return ProcessGroupAPI
                  .addProcessGroupsApi(data)
                  .then(res => {
                    console.log(res.data);
                    this.retrieveFromDb();
                  })
                  .catch(err => console.log(err.data));
              },
              onRowUpdate: (newData, oldData) => {
                const data = {
                  name: newData.name,
                  user: user._id,
                  client: newData.client
                }

                return ProcessGroupAPI
                  .updateProcessGroupsApi(newData.id, data)
                  .then(res => {
                    console.log(res.data);
                    this.retrieveFromDb();
                  })
                  .catch(err => console.log(err.data));
              },
              onRowDelete: oldData => {
                return ProcessGroupAPI
                  .deleteProcessGroupsApi(oldData.id)
                  .then(res => {
                    console.log(res.data);
                    this.retrieveFromDb();
                  })
                  .catch(err => console.log(err.data));
              }
            }}
          //////
          />
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
}

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(mapStateToProps, { changePage })(ProcessGroups);
