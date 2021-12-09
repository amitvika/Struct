import React from 'react'
import MaterialTable from "material-table";
import Checkbox from "@mui/material/Checkbox";
import InfoIcon from "@mui/icons-material/Info";

export default function ClientObjectAccess({ access }) {
  return (
    <MaterialTable
      columns={[
        { title: "Description", field: "desc" },
        { title: "Add/Edit/Delete Access", field: "edit" },
        { title: "View Access", field: "view" }
      ]}
      options={{
        search: false,
        pageSize: 2,
        paging: false
      }}
      data={[
        {
          desc: (
            <div title="Allows access to Client objects created by self and users">
              <InfoIcon />
            Clients
            </div>
          ),
          edit: (
            <Checkbox
              //checked={true}
              color="primary"
              name="COA_1_E"
              checked={access.COA_1_E}
            />
          ),
          view: (
            <Checkbox
              //checked={true}
              color="primary"
              name="COA_1_V"
              checked={access.COA_1_V}
            />
          )
        },
        {
          desc: (
            <div title="Allows access to Client object details created by self and users">
              <InfoIcon />
            Client Details
            </div>
          ),
          edit: (
            <Checkbox
              //checked={true}
              color="primary"
              name="COA_2_E"
              checked={access.COA_2_E}
            />
          ),
          view: (
            <Checkbox
              //checked={true}
              color="primary"
              name="COA_2_V"
              checked={access.COA_2_V}
            />
          )
        },
        {
          desc: (
            <div title="Allows access to Client objects and Client details if it is created by self regardless of above Client object and Client detail configurations">
              <InfoIcon />
            Self Created Clients and Details
            </div>
          ),
          edit: (
            <Checkbox
              //checked={true}
              color="primary"
              name="COA_3_E"
              checked={access.COA_3_E}
            />
          ),
          view: (
            <Checkbox
              //checked={true}
              color="primary"
              name="COA_3_V"
              checked={access.COA_3_V}
            />
          )
        }
      ]}
      title={<h5>Client Object Access</h5>}
    />
  )
}
