import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

export default function SelectedFeatureMenu({ featureList = [] }) {

    const renderTable = () => {
        console.log("FeaturList",featureList);
        return featureList.map((row,index) => (
            <TableRow key={row.name+index.toString()}>
                <TableCell component="th" scope="row">
                    {row.name}
                </TableCell>
                <TableCell align="right">{row.location}</TableCell>
                <TableCell align="right">{row.cornerLocation}</TableCell>
                <TableCell align="right">{row.edgeList}</TableCell>
                <TableCell align="right">{row.surfaceArea}</TableCell>
            </TableRow>
        ))
    }

    return (
        <TableContainer component={Paper}>
            <Table aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell align="right">Location&nbsp;(for a corner)</TableCell>
                        <TableCell align="right">Corner locations&nbsp;(for an edges)</TableCell>
                        <TableCell align="right">Edge list&nbsp;(for faces)</TableCell>
                        <TableCell align="right">Surface Area&nbsp;(for faces)</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {renderTable()}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
