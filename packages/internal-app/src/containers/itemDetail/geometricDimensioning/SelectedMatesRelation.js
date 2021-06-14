import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

export default function SelectedMatesRelation({ featureList = [] }) {
    const myCheckBoxes=[ "coplaner", "parallel", "normal", "opposite",  
                         "concentric", "coradial", "offset","angle"];
    const renderTable = () => {

        return myCheckBoxes.map((row,index) => (
            <React.Fragment>
            <TableRow key={index}>
                <TableCell component="th" scope="row">
                    {row}
                </TableCell>
                <TableCell align="right">{row}</TableCell>  
                <TableCell align="right">{row}</TableCell>                
            </TableRow>
            {(index>myCheckBoxes.length-3) && (
                <TableRow key={index+5}>
                    <TableCell component="th" scope="row">
                        {row}{index}
                    </TableCell>
                    <TableCell align="right">{row}{index}</TableCell>  
                    <TableCell align="right">{row}{index}</TableCell>                
                </TableRow>
            )}
            </React.Fragment>

            
        ))
    }

    return (
        <TableContainer component={Paper}>
            <Table aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell align="right">Mate</TableCell>
                        <TableCell align="right">Estimated Mate</TableCell>                        
                    </TableRow>
                </TableHead>
                <TableBody>
                    {renderTable()}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
