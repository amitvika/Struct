import React from 'react'
import MaterialTable from "material-table";
import InfoIcon from "@mui/icons-material/Info";
import { Checkbox } from "@mui/material";

export default function ItemObjectAccess({ access, updateAccessState }) {
  return (
    <MaterialTable
      columns={[
        { title: "Description", field: "desc" },
        { title: "Add/Edit/Delete Access", field: "edit" },
        { title: "View Access", field: "view" }
      ]}
      options={{
        search: false,
        pageSize: 3,
        paging: false
      }}
      data={[
        {
          desc: (
            <div title="Allows access to Item objects created by self and users">
              <InfoIcon />
            Items (Sourced Items)
            </div>
          ),
          edit: (
            <Checkbox
              //checked={true}
              disabled={!access.IOA_1_V}
              color="primary"
              name="IOA_1_E"
              checked={access.IOA_1_E}
              onChange={updateAccessState}
            />
          ),
          view: (
            <Checkbox
              //checked={true}
              color="primary"
              name="IOA_1_V"
              checked={access.IOA_1_V}
              onChange={updateAccessState}
            />
          )
        },
        {
          desc: (
            <div title="Allows access to Item object details created by self and users">
              <InfoIcon />
            Items (Sourced Items) Details
            </div>
          ),
          edit: (
            <Checkbox
              //checked={true}
              disabled={!access.IOA_2_V}
              color="primary"
              name="IOA_2_E"
              checked={access.IOA_2_E}
              onChange={updateAccessState}
            />
          ),
          view: (
            <Checkbox
              //checked={true}
              color="primary"
              name="IOA_2_V"
              checked={access.IOA_2_V}
              onChange={updateAccessState}
            />
          )
        },
        {
          desc: (
            <div title="Allows access to Item objects and Item details if it is created by self regardless of above Item object and Item detail configurations">
              <InfoIcon />
            Self Created Items (Sourced Items) and Details
            </div>
          ),
          edit: (
            <Checkbox
              //checked={true}
              disabled={!access.IOA_3_V}
              color="primary"
              name="IOA_3_E"
              checked={access.IOA_3_E}
              onChange={updateAccessState}
            />
          ),
          view: (
            <Checkbox
              //checked={true}
              color="primary"
              name="IOA_3_V"
              checked={access.IOA_3_V}
              onChange={updateAccessState}
            />
          )
        }
      ]}
      title={<h5>Item Object Access</h5>}
    />
  )
}
