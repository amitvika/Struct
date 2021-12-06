import React from 'react'
import MaterialTable from "material-table";
import InfoIcon from "@mui/icons-material/Info";
import { Checkbox } from "@mui/material";

export default function VendorObjectAccess({ access, updateAccessState }) {
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
            <div title="Allows access to Vendor objects created by self and users">
              <InfoIcon />
                Vendor
            </div>
          ),
          edit: (
            <Checkbox
              //checked={true}
              disabled={!access.VOA_1_V}
              color="primary"
              name="VOA_1_E"
              checked={access.VOA_1_E}
              onChange={updateAccessState}
            />
          ),
          view: (
            <Checkbox
              //checked={true}
              color="primary"
              name="VOA_1_V"
              checked={access.VOA_1_V}
              onChange={updateAccessState}
            />
          )
        },
        {
          desc: (
            <div title="Allows access to Vendor object details created by self and users">
              <InfoIcon />
                      Vendor Details
            </div>
          ),
          edit: (
            <Checkbox
              //checked={true}
              disabled={!access.VOA_2_V}
              color="primary"
              name="VOA_2_E"
              checked={access.VOA_2_E}
              onChange={updateAccessState}
            />
          ),
          view: (
            <Checkbox
              //checked={true}
              color="primary"
              name="VOA_2_V"
              checked={access.VOA_2_V}
              onChange={updateAccessState}
            />
          )
        },
        {
          desc: (
            <div title="Allows access to Vendor objects and Vendor details if it is created by self regardless of above Client object and Client detail configurations">
              <InfoIcon />
                      Self Created Vendors and Details
            </div>
          ),
          edit: (
            <Checkbox
              //checked={true}
              disabled={!access.VOA_3_V}
              color="primary"
              name="VOA_3_E"
              checked={access.VOA_3_E}
              onChange={updateAccessState}
            />
          ),
          view: (
            <Checkbox
              //checked={true}
              color="primary"
              name="VOA_3_V"
              checked={access.VOA_3_V}
              onChange={updateAccessState}
            />
          )
        }
      ]}
      title={<h5>Vendor Object Access</h5>}
    />

  )
}
