import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Grid
} from "@material-ui/core";
import {
    Headding
} from '../../components';

export default function FileHistory({ file_history = [] }) {
    return (
        <Grid item xs={12}>
            <Headding bold title={'File History'} />
            <TableContainer component={Paper}>

                <Table aria-label="simple table">

                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Loaded By</TableCell>
                            <TableCell>Loaded At</TableCell>
                            <TableCell>Cleared By</TableCell>
                            <TableCell>Cleared At</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            file_history.map((item, index) => {
                                return (<TableRow key={index}>
                                    <TableCell>
                                        <a href={item.file_url}
                                            target="_blank">
                                            {item.file_name}
                                        </a></TableCell>
                                    <TableCell>{item.loaded_by_name}</TableCell>
                                    <TableCell>{item.loaded_at}</TableCell>
                                    <TableCell>{item.cleared_by}</TableCell>
                                    <TableCell>{item.cleared_at}</TableCell>
                                </TableRow>)
                            })
                        }

                    </TableBody>
                </Table>
            </TableContainer>
        </Grid>
    )
}
