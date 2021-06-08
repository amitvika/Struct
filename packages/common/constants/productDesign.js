export const fields = [
    { title: "ID", field: "id", editable: "never", align: 'center' },
    { title: "Name", field: "name", type: 'text' },
    {
        title: "Design Type",
        field: "design_type"
    },
    {
        title: "Updated By",
        field: "updated_by_name",
    },
    {
        title: "Created By",
        field: "created_by_name",
        editable: "never"
    },
    {
        title: 'History',
        field: "id",
        editable: "never",
        isFilterColumn: false,
        isGridViewVisible:false,
        render: rowData => rowData && <span style={{ cursor: 'pointer' }}
            onClick={(event) => {
                event.stopPropagation();
                // handleHistoryToggle({ rowId: rowData.id })
            }}> Show History </span>
    },
]