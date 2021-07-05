export  const columnsFields = [
    { title: "ID", field: "id", editable: "never", align: 'center' },
    { title: "Estimated Delivery Date", field: "estimatedDeliveryDate", type: 'numeric' },
    {
        title: "Item Quantity",
        field: "itemQuantity",
        // editable: "never"
        type: 'numeric'
    },
    { title: "Unit Cost", field: "unitCost", type: 'numeric' },
    {
        title: 'Identification',
        field: "id",
        editable: "never",
        isFilterColumn: false,
        isGridViewVisible: false,
        render: rowData => rowData && <span style={{ cursor: 'pointer' }}
            onClick={(event) => {
                handleIdentificationClick(event, rowData)

                event.stopPropagation();
            }}> Identification </span>
    },
]