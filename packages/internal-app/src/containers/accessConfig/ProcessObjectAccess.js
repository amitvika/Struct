import React from 'react'
import MaterialTable from "material-table";
import InfoIcon from "@material-ui/icons/Info";
import { Checkbox } from "@material-ui/core";

export default function ProcessObjectAccess({ access, updateAccessState }) {
  return (
    <MaterialTable
      columns={[
        { title: "Description", field: "desc" },
        { title: "Add/Edit/Delete Access", field: "edit" },
        { title: "View Access", field: "view" }
      ]}
      options={{
        search: false,
        pageSize: 6,
        paging: false
      }}
      data={[
        {
          desc: (
            <div title="Allows access to Process objects and Process details if it is created by self regardless of above Process object and Process detail configurations">
              <InfoIcon />
            Self Created Processes
            </div>
          ),
          edit: (
            <Checkbox
              //checked={true}
              disabled={!access.POA_1_V}
              color="primary"
              name="POA_1_E"
              checked={access.POA_1_E}
              onChange={updateAccessState}
            />
          ),
          view: (
            <Checkbox
              //checked={true}
              color="primary"
              name="POA_1_V"
              checked={access.POA_1_V}
              onChange={updateAccessState}
            />
          )
        },
        {
          desc: (
            <div title="Allows access to Process: Machining objects created by self and users">
              <InfoIcon />
            Process: Machining
            </div>
          ),
          edit: (
            <Checkbox
              disabled={!access.POA_2_V}
              //checked={true}
              color="primary"
              name="POA_2_E"
              checked={access.POA_2_E}
              onChange={updateAccessState}
            />
          ),
          view: (
            <Checkbox
              //checked={true}
              color="primary"
              name="POA_2_V"
              checked={access.POA_2_V}
              onChange={updateAccessState}
            />
          )
        },
        {
          desc: (
            <div title="Allows access to Process: Casting objects created by self and users">
              <InfoIcon />
            Process: Casting
            </div>
          ),
          edit: (
            <Checkbox
              //checked={true}
              disabled={!access.POA_3_V}
              color="primary"
              name="POA_3_E"
              checked={access.POA_3_E}
              onChange={updateAccessState}
            />
          ),
          view: (
            <Checkbox
              //checked={true}
              color="primary"
              name="POA_3_V"
              checked={access.POA_3_V}
              onChange={updateAccessState}
            />
          )
        },
        {
          desc: (
            <div title="Allows access to Process: Assembly objects created by self and users">
              <InfoIcon />
            Process: Assembly
            </div>
          ),
          edit: (
            <Checkbox
              //checked={true}
              disabled={!access.POA_4_V}
              color="primary"
              name="POA_4_E"
              checked={access.POA_4_E}
              onChange={updateAccessState}
            />
          ),
          view: (
            <Checkbox
              //checked={true}
              color="primary"
              name="POA_4_V"
              checked={access.POA_4_V}
              onChange={updateAccessState}
            />
          )
        },

        {
          desc: (
            <div title="Allows access to Process: PCBs objects created by self and users">
              <InfoIcon />
            Process: PCBs
            </div>
          ),
          edit: (
            <Checkbox
              //checked={true}
              disabled={!access.POA_5_V}
              color="primary"
              name="POA_5_E"
              checked={access.POA_5_E}
              onChange={updateAccessState}
            />
          ),
          view: (
            <Checkbox
              //checked={true}
              color="primary"
              name="POA_5_V"
              checked={access.POA_5_V}
              onChange={updateAccessState}
            />
          )
        },
        {
          desc: (
            <div title="Allows access to Process: ICs objects created by self and users">
              <InfoIcon />
            Process: ICs
            </div>
          ),
          edit: (
            <Checkbox
              //checked={true}
              disabled={!access.POA_6_V}
              color="primary"
              name="POA_6_E"
              checked={access.POA_6_E}
              onChange={updateAccessState}
            />
          ),
          view: (
            <Checkbox
              //checked={true}
              color="primary"
              name="POA_6_V"
              checked={access.POA_6_V}
              onChange={updateAccessState}
            />
          )
        }
      ]}
      title={<h5>Process Object Access</h5>}
    />
  )
}
