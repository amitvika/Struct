import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

export default function SelectedFeatureMenu({ featureList = [], features=true }) {
    const myStyle = {whiteSpace: "normal",
                     wordWrap: "break-word", 
                     wordBreak:"break-all", 
                     width:"100px" }
    const renderTable = () => {
        //console.log("FeaturList",featureList,features);
        return featureList.map((row,index) => (
            <TableRow key={(features?row.n:row.parent.n)+index.toString()}>
                <TableCell component="th" scope="row" style={myStyle} >
                    {(features?row.n:row.parent.n)}
                </TableCell>
                <TableCell align="right" style={myStyle} >{row.type}</TableCell>
                <TableCell align="right" style={myStyle} >{row.kind}</TableCell>               
            </TableRow>
        ))
    }

    return (
        <TableContainer component={Paper}>
            <Table aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell style={myStyle} >ID</TableCell>
                        <TableCell align="right" size="small" style={myStyle} >Type</TableCell>
                        <TableCell align="right" size="small" style={myStyle} >Kind</TableCell>                       
                    </TableRow>
                </TableHead>
                <TableBody>
                    {renderTable()}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
