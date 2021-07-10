export const fields = [
    { title: "ID", field: "id", editable: "never", align: 'center' },
    { title: "Name", field: "name", type: 'text' },
    {
        title: "Design Type",
        field: "design_type"
    },
    {
        title: "Type",
        field: "type",
        type: 'select'
    },
    // {
    //     title: "Updated By",
    //     field: "updated_by_name",
    // },
    {
        title: "Created By",
        field: "created_by_name",
        editable: "never"
    },
    {
        title: "File Loaded",
        field: "file_loaded",
    },
    // {
    //     title: 'History',
    //     field: "id",
    //     editable: "never",
    //     isFilterColumn: false,
    //     isGridViewVisible:false,
    //     render: rowData => rowData && <span style={{ cursor: 'pointer' }}
    //         onClick={(event) => {
    //             event.stopPropagation();
    //             // handleHistoryToggle({ rowId: rowData.id })
    //         }}> Show History </span>
    // },
]

export const typeOption = [
    { label: "Criteria", value: "criteria" },
    { label: 'Hierarchy', value: 'hierarchy' },
]

export const tableFields = [
    {
        title: "Loaded At",
        field: "loaded_At"
    },
    {
        title: "Cleared At",
        field: "cleared_At",
   },
    {
        title: "Loaded By",
        field: "loaded_By"
    },
    {
        title: "Cleared By",
        field: "cleared_By",
    },
]