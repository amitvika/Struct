import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { Button } from '@material-ui/core';
import MaterialTable from 'material-table'
import MainModal from '../../../../components/Modal'

const useStyles = makeStyles({
    table: {
        minWidth: 650,
    },
});

export default function DenseTable() {
    const classes = useStyles();

    const [isModalOpened, setIsModalOpened] = React.useState(false);
    const toggleModal = () => {
        setIsModalOpened(!isModalOpened)
    }

    return (
        <Paper>
            {/* <MainModal open={isModalOpened} toggleModal={toggleModal} /> */}
            <div
                style={{
                    textAlign: "center",
                    fontWeight: "600",
                    fontSize: "larger",
                    color: "grey",
                    height: "33px",
                    margin: "22px"
                }}>
                Add Production Setup
            </div>
            <MainModal open={isModalOpened} toggleModal={toggleModal} />
            <MaterialTable
                title="Multiple Actions Preview"
                columns={[
                    { title: 'ID', field: 'id' },
                    { title: 'Quantity', field: 'quantity' },
                    { title: 'Production Start Date', field: 'productionStartDate', type: 'numeric' },
                    { title: 'Production End Date', field: 'productionEndDate', type: 'numeric' },
                    

                ]}
                data={[
                    { id: 'Mehmet', quantity: 'Baran', productionStartDate: 1987, productionEndDate: 63 },
                ]}
                actions={[
                    {
                        icon: 'Select Factory',
                        tooltip: 'Select Factory',
                        onClick: () => toggleModal()
                    }
                ]}
                options={{
                    actionsColumnIndex: -1
                }}
            />
        </Paper>

    );
}
