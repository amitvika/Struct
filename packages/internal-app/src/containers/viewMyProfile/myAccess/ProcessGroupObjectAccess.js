import React from 'react'
import MaterialTable from "material-table";
import Checkbox from "@material-ui/core/Checkbox";
import InfoIcon from "@material-ui/icons/Info";

export default function ProcessGroupObjectAccess({
    PGOA_1_E = false,
    PGOA_1_V = false,
    PGOA_2_E = false,
    PGOA_2_V = false,
    PGOA_3_E = false,
    PGOA_3_V = false,
}) {
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
                            color="primary"
                            name="PGOA_1_E"
                            checked={PGOA_1_E}
                        />
                    ),
                    view: (
                        <Checkbox
                            //checked={true}
                            color="primary"
                            name="PGOA_1_V"
                            checked={PGOA_1_V}
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
                            color="primary"
                            name="PGOA_2_E"
                            checked={PGOA_2_E}
                        />
                    ),
                    view: (
                        <Checkbox
                            //checked={true}
                            color="primary"
                            name="PGOA_2_V"
                            checked={PGOA_2_V}
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
                            color="primary"
                            name="PGOA_3_E"
                            checked={PGOA_3_E}
                        />
                    ),
                    view: (
                        <Checkbox
                            //checked={true}
                            color="primary"
                            name="PGOA_3_V"
                            checked={PGOA_3_V}
                        />
                    )
                }
            ]}
            title={<h5>Process Group Object Access</h5>}
        />
    )
}
