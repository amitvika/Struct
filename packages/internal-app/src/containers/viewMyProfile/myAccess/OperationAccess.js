import React from 'react'
import MaterialTable from "material-table";
import Checkbox from "@material-ui/core/Checkbox";
import InfoIcon from "@material-ui/icons/Info";

export default function OperationAccess({ OA_1_E = false, OA_1_V = false, OA_2_E = false, OA_2_V = false }) {
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
                            color="primary"
                            name="OA_1_E"
                            checked={OA_1_E}
                        />
                    ),
                    view: (
                        <Checkbox
                            color="primary"
                            name="OA_1_V"
                            checked={OA_1_V}
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
                          checked={OA_2_E}
                          
                        />*/
                    ),
                    view: (
                        <Checkbox
                            color="primary"
                            name="OA_2_V"
                            checked={OA_2_V}
                        />
                    )
                }
            ]}
            title={<h5>Operations Access</h5>}
        />
    )
}
