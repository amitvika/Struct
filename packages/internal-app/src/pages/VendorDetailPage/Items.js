import React, { Component } from 'react';
import MaterialTable from 'material-table';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import ItemsAPI from '@monostruct/common/api/items.api';
import ShowHistoryModal from '../ShowHistoryModal';
import { withRouter } from 'react-router-dom';
import ItemDetailView from './ItemDetailView';
import get from 'lodash/get';

class Items extends Component {
  state = {
    rowData: [],
    tableLoaded: false,
    isDeletedItemVisible: false,
    msg: '',
    snackBar: false,
    snackBarAlertType: '',
    clientDropDownData: {},
    columns: [
      { title: 'ID', field: 'id', editable: 'never' },
      { title: 'Name', field: 'name' },
      {
        title: 'Assembly',
        field: 'assemblyType',
        lookup: {
          'Single Item Part': 'Single Item Part',
          'Multi-Item Assembly': 'Multi-Item Assembly'
        }
      },
      {
        title: 'History',
        field: 'id',
        editable: 'never',
        render: (rowData) =>
          rowData && (
            <span
              style={{ cursor: 'pointer' }}
              onClick={(event) => {
                event.stopPropagation();
                this.handleHistoryToggle({ rowId: rowData.id });
              }}
            >
              {' '}
              Show History{' '}
            </span>
          )
      }
    ],
    isHistoryModalOpened: false,
    selectedItemId: '',
    isThreejsModalOpened: false,
    selectedId: '',
    itemList: []
  };

  componentDidMount() {
    this.fetchItems();
  }

  handleHistoryToggle = ({ rowId }) => {
    this.setState({
      isHistoryModalOpened: !this.state.isHistoryModalOpened,
      selectedItemId: rowId
    });
  };

  handleClose = (event, reason) => {
    this.setState({
      snackBar: !this.state.snackBar
    });
  };

  handleShowDelete = () => {
    const columns = this.state.columns;
    if (!this.state.isDeletedItemVisible) {
      columns.push({ title: 'Deleted At', field: 'deleted_at' });
    } else {
      columns.pop();
    }
    this.setState((state) => ({
      isDeletedItemVisible: !state.isDeletedItemVisible
    }));
  };

  fetchItems = () => {
    ItemsAPI.getItemsAPI(`vendorId=${this.props.vendorId}`)
      .then((result) => result.data)
      .then((items) => {
        this.setState({
          itemList: items
        });
      })
      .catch((err) => console.log(err));
  };

  render() {
    const { itemList } = this.state;

    return (
      <>
        <ShowHistoryModal
          isVisible={this.state.isHistoryModalOpened}
          pageName={'Item'}
          selectedItemId={this.state.selectedItemId}
          handleHistoryToggle={this.handleHistoryToggle}
        />

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
          data={this.state.itemList}
          title={`Items Supplied by: ${this.props.vendorName}`}
          options={{
            actionsColumnIndex: 5,
            addRowPosition: 'first',
            exportButton: true,
            exportFileName: 'Items'
          }}
          detailPanel={(rowData) => {
            return <div>{JSON.stringify(rowData)}</div>;
          }}
          detailPanel={(rowData) => {
            return <ItemDetailView itemId={rowData.id} />;
          }}
          onRowClick={(event, rowData, togglePanel) => togglePanel()}
          actions={[
            {
              icon: 'settings-outline',
              tooltip: 'View detail',
              onClick: (event, rowData) =>
                this.props.history.push(`/items/${rowData.id}`)
            }
          ]}
        />
      </>
    );
  }
}
export default withRouter(Items);
