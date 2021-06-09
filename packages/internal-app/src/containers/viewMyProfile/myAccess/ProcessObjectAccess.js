import React from 'react'
import MaterialTable from "material-table";
import Checkbox from "@material-ui/core/Checkbox";
import InfoIcon from "@material-ui/icons/Info";

export default function ProcessObjectAccess({
    POA_1_E = false,
    POA_1_V = false,
    POA_2_E = false,
    POA_2_V = false,
    POA_3_E = false,
    POA_3_V = false,
    POA_4_E = false,
    POA_4_V = false,
    POA_5_E = false,
    POA_5_V = false,
    POA_6_E = false,
    POA_6_V = false,
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
                            color="primary"
                            name="POA_1_E"
                            checked={POA_1_E}
                        />
                    ),
                    view: (
                        <Checkbox
                            //checked={true}
                            color="primary"
                            name="POA_1_V"
                            checked={POA_1_V}
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
                            //checked={true}
                            color="primary"
                            name="POA_2_E"
                            checked={POA_2_E}
                        />
                    ),
                    view: (
                        <Checkbox
                            //checked={true}
                            color="primary"
                            name="POA_2_V"
                            checked={POA_2_V}
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
                            color="primary"
                            name="POA_3_E"
                            checked={POA_3_E}
                        />
                    ),
                    view: (
                        <Checkbox
                            //checked={true}
                            color="primary"
                            name="POA_3_V"
                            checked={POA_3_V}
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
                            color="primary"
                            name="POA_4_E"
                            checked={POA_4_E}
                        />
                    ),
                    view: (
                        <Checkbox
                            //checked={true}
                            color="primary"
                            name="POA_4_V"
                            checked={POA_4_V}
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
                            color="primary"
                            name="POA_5_E"
                            checked={POA_5_E}
                        />
                    ),
                    view: (
                        <Checkbox
                            //checked={true}
                            color="primary"
                            name="POA_5_V"
                            checked={POA_5_V}
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
                            color="primary"
                            name="POA_6_E"
                            checked={POA_6_E}
                        />
                    ),
                    view: (
                        <Checkbox
                            //checked={true}
                            color="primary"
                            name="POA_6_V"
                            checked={POA_6_V}
                        />
                    )
                }
            ]}
            title={<h5>Process Object Access</h5>}
        />
    )
}
