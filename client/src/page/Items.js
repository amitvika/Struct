import React, { Component } from "react";
import MaterialTable, { MTableToolbar } from "material-table";
import { connect } from "react-redux";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import ItemsAPI from '../api/items.api';
import ShowHistoryModal from "../containers/ShowHistoryModal";
import Toolbar from '../components/Toolbar';

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
        title: "Source", field: "source"
      },
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
        .getItemsAPI(`limit=${query.pageSize}&page=${query.page + 1}`)
        .then(result => result.data)
        .then(result => {
          let rowData = result.docs;

          rowData = rowData.map((item, index) => {
            return {
              id: item._id,
              name: item.name,
              source: item?.vendorId?.name
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
          title="Items"
          options={{
            addRowPosition: "first",
            exportButton: true,
            exportFileName: "Items"
          }}
          onRowClick={(rowdata, event) => {
            const selection = window.getSelection();

            if (selection.type != "Range") {
              this.props.history.push(`/items/${event.id}`)
            }
          }
          }
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
        />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(mapStateToProps, {})(Items);
