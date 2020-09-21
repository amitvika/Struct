import React, { Component } from "react";
import MaterialTable, { MTableToolbar } from "material-table";
import { connect } from "react-redux";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import VendorAPI from '../api/vendor.api';
import ShowHistoryModal from "../containers/ShowHistoryModal";
import Toolbar from '../components/Toolbar';

class Vendors extends Component {
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
        title: 'History',
        field: "id",
        editable: false,
        render: rowData => <span style={{ cursor: 'pointer' }}
          onClick={(event) => {
            event.stopPropagation();
            this.handleHistoryToggle({ rowId: rowData.id })
          }}> Show History </span>
      }
    ],
    isHistoryModalOpened: false,
    selectedItemId: ''
  };

  handleHistoryToggle = ({ rowId }) => {
    this.setState({
      isHistoryModalOpened: !this.state.isHistoryModalOpened,
      selectedItemId: rowId
    })
  }

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
      })
    );
  };

  dataQuery = (query) => {
    return new Promise(async (resolve, reject) => {
      VendorAPI
        .getVendorApi(`limit=${query.pageSize}&page=${query.page + 1}`)
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
        <ShowHistoryModal
          isVisible={this.state.isHistoryModalOpened}
          pageName={'Vendor'}
          selectedItemId={this.state.selectedItemId}
          handleHistoryToggle={this.handleHistoryToggle} />
        <Snackbar
          open={this.state.snackBar}
          autoHideDuration={10000}
          onClose={this.handleClose}>
          <MuiAlert
            severity={this.state.snackBarAlertType}
            onClose={this.handleClose}>
            {this.state.msg}
          </MuiAlert>
        </Snackbar>

        <MaterialTable
          columns={this.state.columns}
          data={query => this.dataQuery(query)}
          title="Vendor"
          options={{
            actionsColumnIndex: 4,
            addRowPosition: "first",
            exportButton: true,
            exportFileName: "Vendors"
          }}
          onRowClick={(rowdata, event) => this.props.history.push(`/vendor/${event.id}`)}
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
            onRowAdd: newData => {
              return VendorAPI
                .addVendorApi({ name: newData.name, source: newData.source })
                .then(res => {
                  // this.retrieveFromDb();
                })
                .catch(error => {
                  console.log(error.data)
                })
            },
            onRowUpdate: (newData, oldData) => {
              return VendorAPI
                .updateVendorApi(newData.id, { name: newData.name, source: newData.source })
                .then(res => {
                  console.log(res.data);
                  // this.retrieveFromDb();
                })
                .catch(err => console.log(err.data));
            },
            onRowDelete: oldData => {
              return VendorAPI
                .deleteVendorApi(oldData.id)
                .then(res => {
                  console.log(res.data);
                  // this.retrieveFromDb();
                })
                .catch(err => console.log(err.data));
            }

          }}
        />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(mapStateToProps, {})(Vendors);
