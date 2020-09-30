import React, { Component } from "react";
import MaterialTable from "material-table";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import ItemsAPI from '../api/items.api';
import ShowHistoryModal from "../containers/ShowHistoryModal";
import { withRouter } from 'react-router-dom';

class Items extends Component {
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
        editable: "never",
        render: rowData => rowData && <span style={{ cursor: 'pointer' }}
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

      ItemsAPI
        .getItemsAPI(`limit=${query.pageSize}&page=${query.page + 1}&vendorId=${this.props.vendorId}`)
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
    return (
      <div>
        <ShowHistoryModal
          isVisible={this.state.isHistoryModalOpened}
          pageName={'Item'}
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
          title={`Items Supplied by: ${this.props.vendorName}`}
          options={{
            actionsColumnIndex: 4,
            addRowPosition: "first",
            exportButton: true,
            exportFileName: "Items"
          }}
          detailPanel={rowData => {
            return (
              <div>
                {JSON.stringify(rowData)}
              </div>
            )
          }}
          onRowClick={(event, rowData, togglePanel) => togglePanel()}
          actions={[
            {
              icon: 'details',
              tooltip: 'View detail',
              onClick: (event, rowData) =>  this.props.history.push(`/items/${rowData.id}`)
            }
          ]}
          editable={{
            onRowAdd: newData => {
              return ItemsAPI
                .saveItemAPI({ name: newData.name, source: newData.source, vendorId: this.props.vendorId })
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
            onRowDelete: oldData => {
              return ItemsAPI.deleteItemAPI(oldData.id)
                .then(res => {
                  console.log(res.data);
                  this.retrieveFromDb();
                })
                .catch(err => console.log(err.data));
            }

          }}
        />
      </div>
    );
  }
}
export default withRouter(Items);
