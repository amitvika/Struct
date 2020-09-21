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
import ItemsAPI from '../api/items.api';

class Items extends Component {
  state = {
    rowData: [],
    tableLoaded: false,
    showDeletes: false,
    msg: "",
    snackBar: false,
    snackBarAlertType: "",
    clientDropDownData: {},
    columns: [
      { title: "ID", field: "id", editable: "never" },
      { title: "Name", field: "name" },
      {
        title: "Source", field: "source"
      },
    ]
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
      })
    );
  };

  dataQuery = (query) => {
    return new Promise(async (resolve, reject) => {

      ItemsAPI
        .getItemsAPI(`limit=${query.pageSize}&page=${query.page + 1}`)
        .then(result => result.data)
        .then(result => {
          let rowData = result.docs;

          rowData = rowData.map((item, index) => {
            return {
              id: item._id,
              name: item.name,
              source: item.source
            };
          });

          resolve({
            data: rowData,
            page: result.page - 1,
            totalCount: result.totalPages,
          })
        })
        .catch(err => console.log(err));
    })
  }

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

        <MaterialTable
          columns={this.state.columns}
          data={query => this.dataQuery(query)}
          title="Items"
          options={{
            actionsColumnIndex: 4,
            addRowPosition: "first",
            exportButton: true,
            exportFileName: "Items"
          }}
          onRowClick={(rowdata, event) => this.props.history.push(`/items/${event.id}`)}
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
            onRowAdd: newData => {
              return ItemsAPI
                .saveItemAPI({ name: newData.name, source: newData.source })
                .then(res => {
                  this.retrieveFromDb();
                })
                .catch(error => {
                  console.log(error.data)
                })
            },
            onRowUpdate: (newData, oldData) => {
              return ItemsAPI
                .updateItemsAPI(newData.id, { name: newData.name, source: newData.source })
                .then(res => {
                  console.log(res.data);
                  this.retrieveFromDb();
                })
                .catch(err => console.log(err.data));
            },
            onRowDelete: oldData =>
              new Promise((resolve, reject) => {
                setTimeout(() => {
                  {
                    if (
                      this.props.auth.user.userAccess.access.PGOA_1_E ||
                      this.props.auth.user.userAccess.access.PGOA_3_E
                    ) {
                      axios
                        .delete(
                          `/api/processgroups/${oldData.id}`,
                          tokenConfig(store.getState),
                          {
                            data: {
                              user: this.props.auth.user._id,
                              client: oldData.client
                            }
                          }
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

      </div>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(mapStateToProps, { changePage })(Items);
