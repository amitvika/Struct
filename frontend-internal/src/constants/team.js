export const teamSetupFields = [
    { title: "ID", field: "id", editable: "never", align: 'center' },
    { title: "Team Name", field: "name", type: 'text' },
    {
        title: "Number of Team Members",
        field: "number_of_members",
        editable: "never"
    },
]


export const teamTaskSetupFields = [
    { title: "ID", field: "id", editable: "never", align: 'center' },
    { title: "Name", field: "name", type: 'text' },
    { title: "Description", field: "description", type: 'text' },
    { title: "Team", field: "teamId", type: 'select' },
]