import axios from "axios";
import MaterialTable from "material-table";
import React, { Component } from "react";

import { connect } from "react-redux";
import { Spinner } from "reactstrap";
import { tokenConfig } from "../../actions/authActions";
import store from "../../store";

class ConfigurationHistory extends Component {
  state = {
    rowData: [],
    tableLoaded: true
  };

  componentDidMount() {
    this.retrieveFromDb();
  }

  retrieveFromDb = () => {
    if (this.props.auth.user.userAccess.access.OA_2_V) {
      this.setState(state => ({
        tableLoaded: false,
        rowData: state.rowData
      }));
      axios
        .get("/api/changetracking")
        .then(res => {
          var rowData = res.data.filter((x, index) => {
            if (x.client !== null) {
              return (
                this.props.auth.user.userAccess.access[x.client._id] ||
                this.props.auth.user._id === x.updatedBy._id
              );
            } else {
              return (
                this.props.auth.user.userAccess.access[x._id] ||
                this.props.auth.user._id === x.updatedBy._id
              );
            }
          });

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
          this.setState(state => ({
            tableLoaded: true,
            rowData
          }));
        })
        .catch(err => console.log(err));
    } else {
      this.setState(state => ({
        tableLoaded: true
      }));
    }
  };
  render() {
    return (
      <div>
        {this.state.tableLoaded ? (
          <MaterialTable
            columns={[
              { title: "Changed By", field: "user" },
              { title: "Client", field: "client" },
              { title: "Table", field: "model" },
              { title: "Change Type", field: "type" },
              { title: "Updated Item Id", field: "updatedItem" },
              { title: "Change Date/Time", field: "time" }
            ]}
            data={this.state.rowData}
            title="Configuration History"
            detailPanel={rowData => {
              return "Update: " + JSON.stringify(rowData.update);
            }}
            onRowClick={(event, rowData, togglePanel) => togglePanel()}
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

export default connect(mapStateToProps, null)(ConfigurationHistory);
