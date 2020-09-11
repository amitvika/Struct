import React from 'react';
import MaterialTable from "material-table";
import InfoIcon from "@material-ui/icons/Info";

export default function ClientBasedAccess() {
  return (
    <MaterialTable
      columns={[
        { title: "Client", field: "client" },
        { title: "Client Id", field: "clientId" },
        { title: "Allow Access", field: "allow" }
      ]}
      data={[]}
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
