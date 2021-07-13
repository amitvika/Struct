import React, { useState, useEffect } from 'react';
import Paper from '@material-ui/core/Paper';
import Link from '@material-ui/core/Link';
import { Spinner } from "reactstrap";
import TableView from '@ravibasil/common/components/TableGridView/TableView';

export default function ManufacturabilityAnalysis() {

    const [list, setList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filteredList, setFilteredList] = useState([]);

    const [columns, setColumns] = useState([
        { title: 'Mates', field: 'id', editable: "never" },
        { title: 'Insertion Type', field: 'name' },
        { title: 'Dispensing', field: 'quantity', type: 'numeric' },
        { title: 'Transfer Holding', field: 'quantity', type: 'numeric' },
    ])

    if (isLoading) {
        return (<div
            style={{
                display: "flex",
                justifyContent: "center"
            }}
        >
            <Spinner animation="border" />
        </div>)
    }

    return (
        <Paper>

            <TableView
                title={'Order of Assembly'}
                list={filteredList}
                columns={columns}
                setColumns={setColumns}
                isAddEditActionsEnabled={true}
            >
            </TableView>

        </Paper>

    );
}
