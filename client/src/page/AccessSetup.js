import axios from "axios";
import MaterialTable, { MTableToolbar } from "material-table";
import React, { Component } from "react";
import { connect } from "react-redux";
import { Spinner } from "reactstrap";
import { tokenConfig } from "../actions/authActions";
import store from "../store";
import { changePage } from "../actions/pageActions";
import Checkbox from "@material-ui/core/Checkbox";
import PropTypes from "prop-types";

class AccessSetup extends Component {
  state = {
    rowData: [],
    tableLoaded: true,
    showDeletes: false,
    columns: [
      { title: "ID", field: "id", editable: "never" },
      { title: "Name", field: "name" }
    ]
  };
  static propTypes = {
    auth: PropTypes.object.isRequired,
    changePage: PropTypes.func.isRequired
  };

  componentDidMount() {
    this.retrieveFromDb();
  }

  retrieveFromDb = () => {
    this.setState(state => ({
      tableLoaded: false,
      rowData: state.rowData
    }));
    axios
      .get("/api/userAccessTypes")
      .then(res => {
        var rowData;
        if (!this.state.showDeletes) {
          rowData = res.data.filter((x, index) => {
            return x.deletedAt == null;
          });
          rowData = rowData.map((x, index) => {
            return {
              id: x._id,
              name: x.name,
              deleted_at: x.deletedAt
            };
          });
        } else {
          rowData = res.data.map((x, index) => {
            return {
              id: x._id,
              name: x.name,
              deleted_at: x.deletedAt
            };
          });
        }
        /*var rowData = res.data.filter((x, index) => {
          return x.deletedAt == null;
        });*/

        this.setState(state => ({
          tableLoaded: true,
          rowData
        }));
      })
      .catch(err => console.log(err));
  };

  onPageChangeClick = (navType, page, objId) => {
    const pageDetail = {
      navType,
      page,
      objId
    };
    this.props.changePage(pageDetail);
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
        {this.state.tableLoaded ? (
          <MaterialTable
            columns={this.state.columns}
            data={this.state.rowData}
            title="Create New User Access"
            options={{
              actionsColumnIndex: 3,
              addRowPosition: "first",
              exportButton: true,
              exportFileName: "UserAccessTypes"
            }}
            onRowClick={(rowdata, event) => this.props.history.push(`/access-configuration/${event.id}`)}
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
                      this.setState(state => ({
                        tableLoaded: false,
                        rowData: state.rowData
                      }));
                      const newClient = {
                        name: newData.name,
                        user: user._id

                        /*this.props.auth.isAuthenticated
                          ? this.props.auth.user._id
                          : "Guest"*/
                      };
                      axios
                        .post(
                          "/api/userAccessTypes",
                          newClient,
                          tokenConfig(store.getState)
                        )
                        .then(res => {
                          this.retrieveFromDb();
                          this.setState(state => ({
                            tableLoaded: true,
                            rowData: state.rowData
                          }));
                        })
                        .catch(err => console.log(err.data));
                    }
                    resolve();
                  }, 10);
                }),
              onRowUpdate: (newData, oldData) =>
                new Promise((resolve, reject) => {
                  setTimeout(() => {
                    {
                      this.setState(state => ({
                        tableLoaded: false,
                        rowData: state.rowData
                      }));
                      axios
                        .put(
                          `/api/userAccessTypes/${newData.id}`,
                          { name: newData.name, user: user._id },
                          tokenConfig(store.getState)
                        )
                        .then(res => {
                          this.retrieveFromDb();
                          this.setState(state => ({
                            tableLoaded: true,
                            rowData: state.rowData
                          }));
                        })
                        .catch(err => console.log(err.data));
                    }
                    resolve();
                  }, 1000);
                }),
              onRowDelete: oldData =>
                new Promise((resolve, reject) => {
                  setTimeout(() => {
                    {
                      this.setState(state => ({
                        tableLoaded: false,
                        rowData: state.rowData
                      }));
                      axios
                        .delete(
                          `/api/userAccessTypes/${oldData.id}`,
                          tokenConfig(store.getState),
                          { data: { user: this.props.auth.user._id } }
                        )
                        .then(res => {
                          this.retrieveFromDb();
                          this.setState(state => ({
                            tableLoaded: true,
                            rowData: state.rowData
                          }));
                        })
                        .catch(err => console.log(err.data));
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

export default connect(mapStateToProps, { changePage })(AccessSetup);
