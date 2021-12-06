import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
//import { withStyles, makeStyles } from "@mui/material/styles";
import {
  USESTYLES,
  StyledTableRow,
  StyledTableCell
} from '@monostruct/common/gltf/Tree/utils';
/*
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
    height: 30,
    '&:nth-of-type(odd)': {
      backgroundColor: "white",
    },
    '&:nth-of-type(even)': {
      backgroundColor: "#FAFAFA",
    },
  }
}))(TableRow);

const StyledTableCell = withStyles((theme) => ({
  root: {
    padding: "0px 8px"
  }
}))(TableCell);
*/

export default function SelectedGDTMenu({
  featureList = [],
  features = true,
  setRowKeyValue = (name, key, value) => {
    console.log(name, key, value);
  }
}) {
  /* const myStyle = {
      whiteSpace: "normal",
      wordWrap: "break-word",
      wordBreak: "break-all",
      width: "100px"
    } */
  const renderOptions = (options, defaulter) => {
    console.log(defaulter, options);
    return options.map((row, index) => (
      <option key={index.toString()} value={row} selected={row == defaulter}>
        {row}
      </option>
    ));
  };
  const Options3 = ['!1!', '!2!', '!3!', '!4!', '!5!', '!6!', '!7!'];
  const Options4 = ['@1@', '@2@', '@3@', '@4@', '@5@', '@6@', '@7@'];
  const classes = USESTYLES();
  const renderTable = () => {
    //console.log("FeaturList",featureList,features);
    return featureList.map(
      (row, index) =>
        row.kind == 'Circle' && (
          <StyledTableRow
            key={(features ? row.n : row.parent.n) + index.toString()}
          >
            <StyledTableCell component="th" scope="row">
              {features ? row.n : row.parent.n}
            </StyledTableCell>
            <StyledTableCell align="right">
              {row.fill == 'Hole' ? 'Hole' : 'Shaft'}
            </StyledTableCell>
            <StyledTableCell align="right">
              <select
                id={'id' + index.toString()}
                value={row.fill == 'Hole' ? row.option3 : row.option4}
                onChange={(e) =>
                  setRowKeyValue(
                    row.n,
                    row.fill == 'Hole' ? 'option3' : 'option4',
                    e.target.value
                  )
                }
              >
                {renderOptions(
                  row.fill == 'Hole' ? Options3 : Options4,
                  row.fill == 'Hole' ? row.option3 : row.option4
                )}
              </select>
            </StyledTableCell>
          </StyledTableRow>
        )
    );
  };

  return (
    <TableContainer component={Paper} style={{ minWidth: 400 }}>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow
            className={classes.tableRow}
            style={{ background: '#CCCCCC', fontWeight: 'bold' }}
          >
            <TableCell className={classes.tableCell}>ID</TableCell>
            <TableCell className={classes.tableCell} align="right" size="small">
              Position
            </TableCell>
            <TableCell className={classes.tableCell} align="right" size="small">
              Option
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{renderTable()}</TableBody>
      </Table>
    </TableContainer>
  );
}
