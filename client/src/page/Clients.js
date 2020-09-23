import MaterialTable, { MTableToolbar } from "material-table";
import React, { Component } from "react";
import { connect } from "react-redux";
import { Spinner } from "reactstrap";
import { changePage } from "../actions/pageActions";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import API from '../api/clients.api';
import ShowHistoryModal from "../containers/ShowHistoryModal";
import Toolbar from '../components/Toolbar';

class Clients extends Component {
  state = {
    rowData: [],
    tableLoaded: false,
    isDeletedItemVisible: false,
    msg: "",
    snackBar: false,
    snackBarAlertType: "",
    columns: [
      { title: "ID", field: "id", editable: "never" },
      { title: "Name", field: "name" },
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
        render: rowData => <span style={{ cursor: 'pointer' }}
          onClick={(event) => {
            event.stopPropagation();
            this.handleHistoryToggle({ rowId: rowData.id })
          }}> Show History </span>
      },
    ],
    isHistoryModalOpened: false,
    selectedItemId: ''
  };

  componentDidMount() {
    this.retrieveFromDb();
  }

  retrieveFromDb = () => {

    this.setState(state => ({
      tableLoaded: false,
      rowData: state.rowData
    }));

    API.fetchClientsApi()
      .then(res => {
        var rowData;
        if (!this.state.showDeletes) {
          rowData = res.data
          // .filter((x, index) => {
          //   return x.deletedAt == null;
          // });
          // rowData = rowData.filter((x, index) => {
          //   return (
          //     this.props.auth.user.userAccess.access[x._id] ||
          //     (this.props.auth.user.userAccess.access.COA_3_V &&
          //       this.props.auth.user._id === x.createdByUserId._id)
          //   );
          // });

          rowData = rowData.map((x, index) => {
            return {
              id: x._id,
              name: x.name,
              created_by: x.createdByUserId.name,
              deleted_at: x.deletedAt
            };
          });
        } else {
          rowData = res.data
          // .filter((x, index) => {
          //   return this.props.auth.user.userAccess.access[x._id];
          // });
          rowData = rowData.map((x, index) => {
            return {
              id: x._id,
              name: x.name,
              created_by: x.createdByUserId.name,
              deleted_at: x.deletedAt
            };
          });
        }

        this.setState(state => ({
          tableLoaded: true,
          rowData
        }));
      })
      .catch(err => {
        console.log(err)
        this.alertForError(err);
      });
    // } else {
    //   this.setState(state => ({
    //     tableLoaded: true
    //   }));
    // }
  };

  onPageChangeClick = (navType, page, objId) => {
    const pageDetail = {
      navType,
      page,
      objId
    };
    this.props.changePage(pageDetail);
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
      // () => this.retrieveFromDb()
    );
  };

  alertForError = (err) => {
    if (err.response && err.response.data) {
      this.setState({
        msg: err.response.data.message,
        snackBarAlertType: "error",
        snackBar: true,
        tableLoaded: true
      });
    }
  }

  handleHistoryToggle = ({ rowId }) => {
    this.setState({
      isHistoryModalOpened: !this.state.isHistoryModalOpened,
      selectedItemId: rowId
    })
  }

  render() {
    const { user } = this.props.auth;
    return (
      <>
        <ShowHistoryModal
          isVisible={this.state.isHistoryModalOpened}
          pageName={'Client'}
          selectedItemId={this.state.selectedItemId}
          handleHistoryToggle={this.handleHistoryToggle} />

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
            title="Clients"
            options={{
              actionsColumnIndex: 4,
              addRowPosition: "first",
              exportButton: true,
              exportFileName: "Clients"
            }}
            onRowClick={(rowdata, event) => {
              const selection = window.getSelection();
              
              if (selection.type != "Range") {
                this.props.history.push(`/clients/${event.id}`);
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
                    handleHistoryToggle={this.handleHistoryToggle}
                  />
                </div>
              )
            }}
            editable={{
              onRowAdd: newData =>
                new Promise((resolve, reject) => {
                  setTimeout(() => {
                    {
                      const newClient = {
                        name: newData.name,
                        userId: this.props.auth.isAuthenticated
                          ? this.props.auth.user._id
                          : "Guest"
                      }; //

                      API.addClientApi(newClient)
                        .then(res => {
                          console.log(res.data);
                          this.retrieveFromDb();
                        })
                        .catch(err => {
                          console.log(err.data)
                          this.alertForError(err)
                        });


                    }
                    resolve();
                  }, 10);
                }),
              onRowUpdate: (newData, oldData) =>
                new Promise((resolve, reject) => {
                  setTimeout(() => {
                    {

                      API.updateClientApi(newData.id, { name: newData.name, user: user._id })
                        .then(res => {
                          console.log(res.data);
                          this.retrieveFromDb();
                        })
                        .catch(err => {
                          console.log(err.data)
                          this.alertForError(err)
                        });
                    }
                    resolve();
                  }, 1000);
                }),
              onRowDelete: oldData =>
                new Promise((resolve, reject) => {
                  setTimeout(() => {
                    {
                      API.deleteClientApi(oldData.id)
                        .then(res => {
                          console.log(res.data);
                          this.retrieveFromDb();
                        })
                        .catch(err => {
                          console.log(err.data)
                          this.alertForError(err);
                        });

                    }
                    resolve();
                  }, 1000);
                })
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
      </>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(mapStateToProps, { changePage })(Clients);
