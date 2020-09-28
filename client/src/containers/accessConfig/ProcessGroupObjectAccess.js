import React from 'react'
import MaterialTable from "material-table";
import InfoIcon from "@material-ui/icons/Info";
import { Checkbox } from "@material-ui/core";

export default function ProcessGroupObjectAccess({ access, updateAccessState }) {
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
                      Process Groups
            </div>
          ),
          edit: (
            <Checkbox
              //checked={true}
              disabled={!access.PGOA_1_V}
              color="primary"
              name="PGOA_1_E"
              checked={access.PGOA_1_E}
              onChange={updateAccessState}
            />
          ),
          view: (
            <Checkbox
              //checked={true}
              color="primary"
              name="PGOA_1_V"
              checked={access.PGOA_1_V}
              onChange={updateAccessState}
            />
          )
        },
        {
          desc: (
            <div title="Allows access to Process Group object details created by self and users">
              <InfoIcon />
                      Process Group Details
            </div>
          ),
          edit: (
            <Checkbox
              //checked={true}
              disabled={!access.PGOA_2_V}
              color="primary"
              name="PGOA_2_E"
              checked={access.PGOA_2_E}
              onChange={updateAccessState}
            />
          ),
          view: (
            <Checkbox
              //checked={true}
              color="primary"
              name="PGOA_2_V"
              checked={access.PGOA_2_V}
              onChange={updateAccessState}
            />
          )
        },
        {
          desc: (
            <div title="Allows access to Process Group objects and Process Group details if it is created by self regardless of above Process Group object and Process Group detail configurations">
              <InfoIcon />
                      Self Created Process Groups and Details
            </div>
          ),
          edit: (
            <Checkbox
              //checked={true}
              disabled={!access.PGOA_3_V}
              color="primary"
              name="PGOA_3_E"
              checked={access.PGOA_3_E}
              onChange={updateAccessState}
            />
          ),
          view: (
            <Checkbox
              //checked={true}
              color="primary"
              name="PGOA_3_V"
              checked={access.PGOA_3_V}
              onChange={updateAccessState}
            />
          )
        }
      ]}
      title={<h5>Process Group Object Access</h5>}
    />
  )
}
