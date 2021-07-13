import React from 'react'
import MaterialTable from "material-table";
import Checkbox from "@material-ui/core/Checkbox";
import InfoIcon from "@material-ui/icons/Info";

export default function ItemObjectAccess({
    IOA_1_E = false,
    IOA_1_V = false,
    IOA_2_E = false,
    IOA_2_V = false,
    IOA_3_E = false,
    IOA_3_V = false,
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
                        <div title="Allows access to Item objects created by self and users">
                            <InfoIcon />
Items (Sourced Items)
                        </div>
                    ),
                    edit: (
                        <Checkbox
                            //checked={true}
                            color="primary"
                            name="IOA_1_E"
                            checked={IOA_1_E}
                        />
                    ),
                    view: (
                        <Checkbox
                            //checked={true}
                            color="primary"
                            name="IOA_1_V"
                            checked={IOA_1_V}
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
                            color="primary"
                            name="IOA_2_E"
                            checked={IOA_2_E}
                        />
                    ),
                    view: (
                        <Checkbox
                            //checked={true}
                            color="primary"
                            name="IOA_2_V"
                            checked={IOA_2_V}
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
                            color="primary"
                            name="IOA_3_E"
                            checked={IOA_3_E}
                        />
                    ),
                    view: (
                        <Checkbox
                            //checked={true}
                            color="primary"
                            name="IOA_3_V"
                            checked={IOA_3_V}
                        />
                    )
                }
            ]}
            title={<h5>Item Object Access</h5>}
        />
    )
}
