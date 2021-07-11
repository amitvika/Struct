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

export default function FileHistory({ file_history_list = [] }) {
    return (
        <Grid item xs={12}>
            <Headding bold title={'File History'} />
            <TableContainer component={Paper}>

                <Table aria-label="simple table">

                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Loaded At</TableCell>
                            <TableCell>Cleared At</TableCell>
                            <TableCell>Loaded By</TableCell>
                            <TableCell>Cleared By</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            file_history_list.map((item, index) => {
                                return (<TableRow key={index}>
                                    <TableCell>
                                        <a href={item.file_url}
                                            target="_blank">
                                            {item.name}
                                        </a></TableCell>
                                    <TableCell>{item.loaded_at}</TableCell>
                                    <TableCell>{item.cleared_at}</TableCell>
                                    <TableCell>{item.loaded_by}</TableCell>
                                    <TableCell>{item.cleared_by}</TableCell>
                                </TableRow>)
                            })
                        }

                    </TableBody>
                </Table>
            </TableContainer>
        </Grid>
    )
}
