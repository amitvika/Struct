import React, { useState } from 'react';
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
import { Typography } from '@mui/material';

export default function SelectedFeatureMenu({
  featureList = [],
  features = true,
  setRowKeyValue = (name, key, value) => {
    console.log(name, key, value);
  },
  title
}) {
  const classes = USESTYLES();

  const renderOptions = (options, defaulter) => {
    console.log(defaulter, options);
    return options.map((row, index) => (
      <option key={index.toString()} value={row} selected={row == defaulter}>
        {row}
      </option>
    ));
  };
  const Options1 = [
    'M1',
    'M1.1',
    'M1.2',
    'M1.4',
    'M1.6',
    'M1.7',
    'M1.8',
    'M2',
    'M2.2',
    'M2.3',
    'M2.5',
    'M2.6',
    'M3',
    'M3.5',
    'M4',
    'M4.5',
    'M5',
    'M6',
    'M7',
    'M8',
    'M9',
    'M10',
    'M11',
    'M12',
    'M14',
    'M16',
    'M18',
    'M20',
    'M22',
    'M24',
    'M26',
    'M27',
    'M28',
    'M30',
    'M32',
    'M33',
    'M36',
    'M38',
    'M39',
    'M40',
    'M42',
    'M45',
    'M48',
    'M52'
  ];
  const Options2 = [
    '#1',
    '#2',
    '#3',
    '#4',
    '$5',
    '#6',
    '#8',
    '#10',
    '#12',
    '1/4"',
    '5/16"',
    '3/8"',
    '7/16"',
    '1/2"',
    '9/16"',
    '5/8"',
    '3/4"',
    '7/8"',
    '1"',
    '1 1/8"',
    '1 1/4"'
  ];
  const renderTable = () => {
    console.log('FeaturList', featureList, features);
    return featureList.map((row, index) => (
      <StyledTableRow
        key={(features ? row.n : row.parent.n) + index.toString()}
      >
        <StyledTableCell component="th" scope="row">
          {features ? row.n : row.parent.n}
        </StyledTableCell>
        <StyledTableCell align="right">{row.type}</StyledTableCell>
        <StyledTableCell align="right">{row.kind}</StyledTableCell>
        <StyledTableCell align="right">
          {row.kind == 'Circle' && (
            <select
              id={'i1d' + index.toString()}
              value={row.option1}
              onChange={(e) => setRowKeyValue(row.n, 'option1', e.target.value)}
            >
              {renderOptions(Options1, row.option1)}
            </select>
          )}
        </StyledTableCell>
        <StyledTableCell align="right">
          {row.kind == 'Circle' && (
            <select
              id={'i2d' + index.toString()}
              value={row.option2}
              onChange={(e) => setRowKeyValue(row.n, 'option2', e.target.value)}
            >
              {renderOptions(Options2, row.option2)}
            </select>
          )}
        </StyledTableCell>
      </StyledTableRow>
    ));
  };

  return (
    <Paper style={{ minWidth: 400 }}>
      <Typography
        sx={{ flex: '1 1 100%', fontWeight: 'bold' }}
        variant="h6"
        id="tableTitle"
        component="div"
      >
        {title}
      </Typography>
      <TableContainer>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow
              className={classes.tableRow}
              style={{ background: '#CCCCCC', fontWeight: 'bold' }}
            >
              <TableCell className={classes.tableCell}>ID</TableCell>
              <TableCell
                className={classes.tableCell}
                align="right"
                size="small"
              >
                Type
              </TableCell>
              <TableCell
                className={classes.tableCell}
                align="right"
                size="small"
              >
                Kind
              </TableCell>
              <TableCell
                colSpan={2}
                className={classes.tableCell}
                align="right"
                size="small"
              >
                Threaded Feature
              </TableCell>
              {/* <TableCell className={classes.tableCell} align="left" size="small">Feature</TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>{renderTable()}</TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
