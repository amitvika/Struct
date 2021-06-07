import React from 'react'
import MaterialTable from "material-table";
import InfoIcon from "@material-ui/icons/Info";
import { Checkbox } from "@material-ui/core";

export default function OperationAccess({ access, updateAccessState }) {
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
            <div title="Allows access to Process Group objects created by self and users">
              <InfoIcon />
                      User Access
            </div>
          ),
          edit: (
            <Checkbox
              //checked={true}
              disabled={!access.OA_1_V}
              color="primary"
              name="OA_1_E"
              checked={access.OA_1_E}
              onChange={updateAccessState}
            />
          ),
          view: (
            <Checkbox
              color="primary"
              name="OA_1_V"
              checked={access.OA_1_V}
              onChange={updateAccessState}
            />
          )
        },
        {
          desc: (
            <div title="Allows access to Process Group object details created by self and users">
              <InfoIcon />
                      Configuration History
            </div>
          ),
          edit: (
            <div></div>
            /*<Checkbox
              color="primary"
              name="OA_2_E"
              checked={access.OA_2_E}
              onChange={updateAccessState}
            />*/
          ),
          view: (
            <Checkbox
              color="primary"
              name="OA_2_V"
              checked={access.OA_2_V}
              onChange={updateAccessState}
            />
          )
        }
      ]}
      title={<h5>Operations Access</h5>}
    />
  )
}
