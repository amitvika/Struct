import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { withStyles, makeStyles } from "@material-ui/core/styles";


const useStyles = makeStyles({
  table: {
    minWidth: 400
  },
  tableRow: {
    height: 30
  },
  tableCell: {
    padding: "0px 16px",
    whiteSpace: "normal",
    wordWrap: "break-word",
    wordBreak: "break-all"
  }
});

const StyledTableRow = withStyles((theme) => ({
  root: {
    height: 30
  }
}))(TableRow);

const StyledTableCell = withStyles((theme) => ({
  root: {
    padding: "0px 8px"
  }
}))(TableCell);



export default function SelectedGDTMenu({ featureList = [], features = true }) {
  /* const myStyle = {
    whiteSpace: "normal",
    wordWrap: "break-word",
    wordBreak: "break-all",
    width: "100px"
  } */
  const classes = useStyles();
  const renderTable = () => {
    //console.log("FeaturList",featureList,features);
    return featureList.map((row, index) => (
      row.kind=="Circle" &&
      <StyledTableRow key={(features ? row.n : row.parent.n) + index.toString()}>
        <StyledTableCell component="th" scope="row" >
          {(features ? row.n : row.parent.n)}
        </StyledTableCell>
        <StyledTableCell align="right"  >
          {index%2==0?"Hole":"Shaft"}
        </StyledTableCell>
        <StyledTableCell align="right"  >
          <select id={"id"+index.toString()}>
            <option value={"1"+index.toString()}>{"1"+index.toString()}</option>
            <option value={"2"+index.toString()}>{"2"+index.toString()}</option>
            <option value={"3"+index.toString()}>{"3"+index.toString()}</option>
            <option value={index.toString()} selected>{(index+1).toString()}</option>
          </select>
        </StyledTableCell>
      </StyledTableRow>
    ))
  }

  return (
    <TableContainer component={Paper} style={{ minWidth: 400 }}>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow className={classes.tableRow}>
            <TableCell className={classes.tableCell} >ID</TableCell>
            <TableCell className={classes.tableCell} align="right" size="small" >Position</TableCell>
            <TableCell className={classes.tableCell} align="right" size="small">Option</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {renderTable()}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
