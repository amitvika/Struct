import React from 'react'
import MaterialTable from "material-table";
import Checkbox from "@material-ui/core/Checkbox";
import InfoIcon from "@material-ui/icons/Info";

export default function ClientObjectAccess({ COA_1_E = false, COA_1_V = false, COA_2_E = false,
  COA_2_V = false, COA_3_E = false, COA_3_V = false }) {
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
              checked={COA_1_E}
            />
          ),
          view: (
            <Checkbox
              //checked={true}
              color="primary"
              name="COA_1_V"
              checked={COA_1_V}
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
              checked={COA_2_E}
            />
          ),
          view: (
            <Checkbox
              //checked={true}
              color="primary"
              name="COA_2_V"
              checked={COA_2_V}
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
              checked={COA_3_E}
            />
          ),
          view: (
            <Checkbox
              //checked={true}
              color="primary"
              name="COA_3_V"
              checked={COA_3_V}
            />
          )
        }
      ]}
      title={<h5>Client Object Access</h5>}
    />
  )
}
