import axios from "axios";
import MaterialTable, { MTableToolbar } from "material-table";
import React, { Component } from "react";
import { connect } from "react-redux";
import { Spinner } from "reactstrap";
import { tokenConfig } from "../actions/authActions";
import store from "../store";
import { changePage } from "../actions/pageActions";
import Checkbox from "@material-ui/core/Checkbox";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";

class Clients extends Component {
  state = {
    rowData: [],
    tableLoaded: false,
    showDeletes: false,
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
      }
    ]
  };

  componentDidMount() {
    console.log('---------->>>>')
    this.retrieveFromDb();
  }

  retrieveFromDb = () => {
    // if (
    //   this.props.auth.user.userAccess.access.COA_1_V ||
    //   this.props.auth.user.userAccess.access.COA_3_V
    // ) {
      this.setState(state => ({
        tableLoaded: false,
        rowData: state.rowData
      }));
      axios
        .get("/api/clients")
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
        .catch(err => console.log(err));
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

  showDeletes = () => {
    const columns = this.state.columns;
    if (!this.state.showDeletes) {
      columns.push({ title: "Deleted At", field: "deleted_at" });
    } else {
      columns.pop();
    }
    this.setState(
      state => ({
        showDeletes: !state.showDeletes
      }),
      () => this.retrieveFromDb()
    );
  };

  render() {
    const { user } = this.props.auth;
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
              this.onPageChangeClick(
                "ClientsNav",
                "ClientsConfiguration",
                event.id
              );
              //console.log(rowdata);
            }}
            components={{
              Toolbar: props => (
                <div>
                  <MTableToolbar {...props} />
                  <div className="ml-3">
                    {this.state.showDeletes ? (
                      <Checkbox
                        checked
                        value="top"
                        onChange={this.showDeletes}
                      />
                    ) : (
                      <Checkbox value="top" onChange={this.showDeletes} />
                    )}
                    {""}
                    Show Deletions
                  </div>
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
                      if (
                        this.props.auth.user.userAccess.access.COA_1_E ||
                        this.props.auth.user.userAccess.access.COA_3_E
                      ) {
                        axios
                          .post(
                            "/api/clients",
                            newClient,
                            tokenConfig(store.getState),
                            { data: { user: this.props.auth.user._id } }
                          )
                          .then(res => {
                            console.log(res.data);
                            this.retrieveFromDb();
                          })
                          .catch(err => console.log(err.data));
                      } else {
                        this.setState({
                          msg:
                            "Edit Access Not Authorized for User. Configurations Not Saved",
                          snackBarAlertType: "error",
                          snackBar: true
                        });
                      }
                    }
                    resolve();
                  }, 10);
                }),
              onRowUpdate: (newData, oldData) =>
                new Promise((resolve, reject) => {
                  setTimeout(() => {
                    {
                      if (
                        this.props.auth.user.userAccess.access.COA_1_E ||
                        this.props.auth.user.userAccess.access.COA_3_E
                      ) {
                        axios
                          .put(
                            `/api/clients/${newData.id}`,
                            { name: newData.name, user: user._id },
                            tokenConfig(store.getState)
                          )
                          .then(res => {
                            console.log(res.data);
                            this.retrieveFromDb();
                          })
                          .catch(err => console.log(err.data));
                      } else {
                        this.setState({
                          msg:
                            "Edit Access Not Authorized for User. Configurations Not Saved",
                          snackBarAlertType: "error",
                          snackBar: true
                        });
                      }
                    }
                    resolve();
                  }, 1000);
                }),
              onRowDelete: oldData =>
                new Promise((resolve, reject) => {
                  setTimeout(() => {
                    {
                      if (
                        this.props.auth.user.userAccess.access.COA_1_E ||
                        this.props.auth.user.userAccess.access.COA_3_E
                      ) {
                        axios
                          .delete(
                            `/api/clients/${oldData.id}`,
                            tokenConfig(store.getState)
                          )
                          .then(res => {
                            console.log(res.data);
                            this.retrieveFromDb();
                          })
                          .catch(err => console.log(err.data));
                      } else {
                        this.setState({
                          msg:
                            "Edit Access Not Authorized for User. Configurations Not Saved",
                          snackBarAlertType: "error",
                          snackBar: true
                        });
                      }
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
      </div>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(mapStateToProps, { changePage })(Clients);
