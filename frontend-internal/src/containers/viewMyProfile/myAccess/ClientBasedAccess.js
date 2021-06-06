import React from 'react';
import MaterialTable from "material-table";
import Checkbox from "@material-ui/core/Checkbox";
import InfoIcon from "@material-ui/icons/Info";
import { Spinner } from "reactstrap";
import {  useSelector } from 'react-redux';

export default function ClientBasedAccess({ userAccessLoaded = true, access = {}, clientList = [] }) {
  const isLoading = useSelector(state => state.access.isCBALoading);

  const refactorData = () => {
    return clientList.map((x, index) => {
      if (access[x._id]) {

        return {
          clientId: x._id,
          client: x.name,
          allow: <Checkbox color="primary" name={x._id} defaultChecked />
        };
      } else {
        return {
          clientId: x._id,
          client: x.name,
          allow: <Checkbox color="primary" name={x._id} />
        };
      }
    });
  }

  if (isLoading || !userAccessLoaded) {
    return (<div
      style={{
        display: "flex",
        justifyContent: "center"
      }}>
      <Spinner animation="border" />
    </div>)
  }
  return (
    <MaterialTable
      columns={[
        { title: "Client", field: "client" },
        { title: "Client Id", field: "clientId" },
        { title: "Allow Access", field: "allow" }
      ]}
      data={refactorData()}
      options={{
        search: false,
        pageSize: 15,
        pageSizeOptions: [15, 50, 100],
        paging: false
      }}
      title={
        <h5 title="This configuration determines user access to all the below configurations for each client in this table">
          <InfoIcon /> Client Based Access
                </h5>
      }
    />
  )
}
