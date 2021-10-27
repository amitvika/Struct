import React, { useState, useEffect } from 'react';
import get from 'lodash/get';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Select from '@monostruct/common/components/atoms/Select';
import Headding from '@monostruct/common/components/atoms/Headding';
import {
  USESTYLES,
  StyledTableRow,
  StyledTableCell
} from '@monostruct/common/gltf/Tree/utils';
import Paper from '@material-ui/core/Paper';

export default function LookUpTableSelection({ internalProductConfig }) {
  const classes = USESTYLES();

  const [holeValueList, setHoleValueList] = useState([]);
  const [holeSizeList, setHoleSizeList] = useState([]);
  const [selectedHoleValue, setSelectedHoleValue] = useState('');
  const [selectedHoleSize, setSelectedHoleSize] = useState('');

  const lookUpTableSchema = get(internalProductConfig, 'lookUpTableSchema');

  useEffect(() => {
    parser();
  }, []);

  const parser = () => {
    let holeValueArr = [];
    let holeSizeArr = [];

    for (let key in lookUpTableSchema) {
      if (lookUpTableSchema.hasOwnProperty(key)) {
        // console.log(`${key} : ${obj[key]}`)
        let holeSizeValue = key.split('_');
        holeValueArr = [...holeValueArr, holeSizeValue[0]];
        holeSizeArr = [...holeSizeArr, holeSizeValue[1]];
      }
    }

    setHoleValueList([...new Set(holeValueArr)]);
    setHoleSizeList([...new Set(holeSizeArr)]);
  };

  if (!lookUpTableSchema) {
    return null;
  }

  let selectedParsedObj =
    lookUpTableSchema[`${selectedHoleValue}_${selectedHoleSize}`];

  return (
    <TableContainer component={Paper} style={{ minWidth: 400 }}>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow
            className={classes.tableRow}
            style={{ background: '#CCCCCC', fontWeight: 'bold' }}
          >
            <TableCell className={classes.tableCell}>Hole Value</TableCell>
            <TableCell className={classes.tableCell}>Hole Size</TableCell>
            <TableCell className={classes.tableCell} size="small">
              Upper Bound
            </TableCell>
            <TableCell className={classes.tableCell} size="small">
              Lower Bound
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <StyledTableRow>
            <StyledTableCell component="th" scope="row">
              <Select
                placeholder="Select Hole Value"
                options={holeValueList.map((item) => ({
                  label: item,
                  value: item
                }))}
                onChange={(data) => setSelectedHoleValue(data.value)}
                value={selectedHoleValue}
              />
            </StyledTableCell>
            <StyledTableCell align="right">
              {selectedHoleValue && (
                <Select
                  placeholder="Select Hole Size"
                  options={holeSizeList.map((item) => ({
                    label: item,
                    value: item
                  }))}
                  onChange={(data) => setSelectedHoleSize(data.value)}
                  value={selectedHoleSize}
                />
              )}
            </StyledTableCell>
            <StyledTableCell>
              {selectedParsedObj && (
                <Headding title={` ${selectedParsedObj[`Upper Bound`]}`} />
              )}
            </StyledTableCell>
            <StyledTableCell>
              {selectedParsedObj && (
                <Headding title={`${selectedParsedObj[`Lower Bound`]}`} />
              )}
            </StyledTableCell>
          </StyledTableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
