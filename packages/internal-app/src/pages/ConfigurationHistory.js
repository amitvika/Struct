import React, { Component } from 'react';
import MaterialTable from 'material-table';
import { connect } from 'react-redux';
import CircularProgress from '@mui/material/CircularProgress';
import ConfigurationHistoryAPI from '@monostruct/common/api/configurationHistory.api';

class ConfigurationHistory extends Component {
  state = {
    rowData: [],
    tableLoaded: true
  };

  dataQueryPage = (query) => {
    return new Promise(async (resolve, reject) => {
      ConfigurationHistoryAPI.getConfigurationHistory(
        `limit=${query.pageSize}&page=${query.page + 1}`
      )
        .then((result) => result.data)
        .then((result) => {
          let rowData = result.docs;

          rowData = rowData.map((x, index) => {
            if (x.client !== null) {
              return {
                user: x.updatedBy.name,
                updatedItem: x.updatedObject,
                type: x.updateType,
                client: x.client.name,
                model: x.model,
                time: x.date,
                update: x.update
              };
            } else {
              return {
                user: x.updatedBy.name,
                updatedItem: x.updatedObject,
                type: x.updateType,
                client: x.client,
                model: x.model,
                time: x.date,
                update: x.update
              };
            }
          });

          resolve({
            data: rowData,
            page: result.page - 1,
            totalCount: result.totalPages
          });
        })
        .catch((err) => console.log(err));
    });
  };
  render() {
    return (
      <div>
        {this.state.tableLoaded ? (
          <MaterialTable
            columns={[
              { title: 'Changed By', field: 'user' },
              { title: 'Client', field: 'client' },
              { title: 'Table', field: 'model' },
              { title: 'Change Type', field: 'type' },
              { title: 'Updated Item Id', field: 'updatedItem' },
              { title: 'Change Date/Time', field: 'time' }
            ]}
            data={(query) => this.dataQueryPage(query)}
            title="Configuration History"
            detailPanel={(rowData) => {
              return 'Update: ' + JSON.stringify(rowData.update);
            }}
            onRowClick={(event, rowData, togglePanel) => togglePanel()}
          />
        ) : (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            <CircularProgress />
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth
});

export default connect(mapStateToProps, null)(ConfigurationHistory);
