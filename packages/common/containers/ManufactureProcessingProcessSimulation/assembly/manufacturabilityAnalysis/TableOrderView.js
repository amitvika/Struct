//import React, { useState, useEffect } from 'react'
//import MaterialTable from "material-table";

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import withStyles from '@mui/styles/withStyles';
import makeStyles from '@mui/styles/makeStyles';
//import { Overlay } from 'react-overlays';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import RotateLeftSharpIcon from '@mui/icons-material/RotateLeftSharp';
import DynamicFeedOutlinedIcon from '@mui/icons-material/DynamicFeedOutlined';

import Paper from '@mui/material/Paper';
import {
  AutoResizer,
  BaseTable,
  DraggableTable,
  SortOrder
} from '@monostruct/common/gltf/GridTable';
import { DEFAULTROWSELECTCOLOR } from '@monostruct/common/gltf/Tree/utils';
import { createGlobalStyle } from 'styled-components/macro';
import styled from 'styled-components';
//import TableHead from '@mui/material/TableHead';
//let rowParent = null;
const styles = (theme) => ({
  flexContainer: {
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
    borderSpacing: 0
  },
  table: {
    '& .ReactVirtualized__Table__headerRow': {
      flip: false,
      paddingRight: theme.direction === 'rtl' ? '0 !important' : undefined
    },
    borderSpacing: 0,
    whiteSpace: 'normal',
    wordWrap: 'break-word',
    wordBreak: 'break-all'
  },
  tableRow: {
    cursor: 'pointer',
    borderSpacing: 0,
    backgroundColor: '#FFFFFF',
    whiteSpace: 'normal',
    wordWrap: 'break-word',
    wordBreak: 'break-all'
  },
  selectedTableRow: {
    cursor: 'pointer',
    borderSpacing: 0,
    backgroundColor: DEFAULTROWSELECTCOLOR(),
    whiteSpace: 'normal',
    wordWrap: 'break-word',
    wordBreak: 'break-all'
  },
  headerTableRow: {
    flex: 1,
    borderSpacing: 0,
    fontWeight: 'bold'
  },
  tableRowHover: {
    '&:hover': {
      backgroundColor: theme.palette.grey[200]
    }
  },
  tableCell: {
    flex: 1,
    borderSpacing: 0,
    whiteSpace: 'normal',
    wordWrap: 'break-word',
    wordBreak: 'break-all'
  },
  noClick: {
    cursor: 'initial'
  },
  'sticky-row': {
    '& .sticky-row.BaseTable__row': {
      backgroundColor: '#00FF00'
    }
  },
  backgroundColor: theme.palette.grey[255],
  mainContainer: {
    margin: 10,
    padding: 10,
    display: 'inline-flex',
    minWidth: '100%'
  },
  viewerContainer: {
    flex: 1,
    padding: '20px',
    margin: '0px 15px',
    display: 'inline-block',
    boxShadow: '0 0 10px rgb(0 0 0 / 20%)',
    borderSpacing: 0,
    minWidth: 700
  }
});
const CellContainer = styled.div`
  display: flex;
  flex: 1 0 100%;
  align-items: center;
  height: 100%;
  overflow: hidden;
  margin: 0 -5px;
  padding: 5px;
  border: 1px dashed transparent;
`;

const GlobalStyle = createGlobalStyle`
  .BaseTable__row:hover,
  .BaseTable__row--hover {
    ${CellContainer} {
      border: 1px dashed #ccc;
    }
  }
`;

/* const Select = styled.select`
  width: 100%;
  height: 30px;
  margin-top: 10px;
` */
const useStyles = makeStyles(styles);
const GetSortOrder = (sortBy, sortDirection) => {
  return function (a, b) {
    if (sortBy) {
      if (sortDirection) {
        if (a[sortBy] > b[sortBy]) {
          return sortDirection == SortOrder.ASC ? 1 : -1;
        } else if (a[sortBy] < b[sortBy]) {
          return sortDirection == SortOrder.DESC ? 1 : -1;
        }
      }
    }
    return 0;
  };
};
class MuiVirtualizedTable extends React.PureComponent {
  static defaultProps = {
    headerHeight: 24,
    rowHeight: 12
  };
  /* cache = new CellMeasurerCache({
    fixedWidth: true,
    height: this.props.rowHeight
  }); */
  constructor(props) {
    super(props);
    this.setState({
      sortedlist: this.props.list,
      sortState: this.props.defaultSort
    });
    //console.log("Getting SortedList",this.state.sortedlist);
  }
  state = {
    sortBy: 'order',
    sortDirection: SortOrder.ASC,
    sortedlist: this.props.list,
    sortState: this.props.defaultSort
  };
  static getDerivedStateFromProps(props, current_state) {
    //console.log("derivedstate",props, current_state);
    if (current_state.sortedlist !== props.list) {
      return {
        sortedlist: props.list
      };
    }
    return null;
  }
  componentDidUpdate(prevProps, prevState) {
    const { list } = this.props;
    //console.log("Reachibg here my set",list,prevProps,prevState,this.state.sortedlist);
    if (list !== prevProps.list) {
      this.setState({ sortedlist: this.props.list });
    }
  }
  getRowClassName = (gotHere) => {
    const { rowIndex } = gotHere;
    const { list } = this.props;
    //console.log("Reaching getRowClassName",gotHere,list,this.props);
    const { classes, onRowClick } = this.props;
    //console.log(classes.tableRow);
    const Megot = clsx(classes.tableRow, classes.flexContainer, {
      [classes.tableRowHover]: rowIndex !== -1 && onRowClick != null
    });
    const classHere =
      rowIndex >= 0
        ? list[rowIndex].selectedshell
          ? clsx(classes.selectedTableRow, classes.flexContainer, {
              [classes.tableRowHover]: rowIndex !== -1 && onRowClick != null
            })
          : Megot
        : Megot;
    //if((rowIndex >=0) && list[rowIndex].selectedshell)
    //  return 'sticky-row';
    //
    //console.log(classHere);
    return classHere;
  };

  getHeaderClassName = (gotHere) => {
    //const {rowIndex}=gotHere;
    //console.log("Reaching headerClassName",gotHere);
    const { classes } = this.props;
    return clsx(classes.headerTableRow, classes.flexContainer);
  };

  sortTableColumn = (whatIsGot) => {
    const { column, key, order } = whatIsGot;
    const { list, setData, setSortBy, setSortDirection } = this.props;
    //console.log(whatIsGot, list, this.props, key, order);
    let sortedlist = list;
    sortedlist.sort(GetSortOrder(key, order));

    this.setState({ key, order, sortedlist });
    if (setData) {
      setData(sortedlist);
    }
    if (setSortBy) {
      setSortBy(key);
    }
    if (setSortDirection) {
      setSortDirection(order);
    }
    if (key) {
      this.setState({
        sortState: {
          ...this.state.sortState,
          [key]:
            this.state.sortState[key] === SortOrder.DESC
              ? SortOrder.ASC
              : SortOrder.DESC
        }
      });
    }
  };

  rowEventHandlers = {
    onClick: this.props.onRowClick
  };

  render() {
    const {
      classes,
      columns,
      rowHeight,
      rowWidth,
      headerHeight,
      draggable,
      setSortBy,
      ...tableProps
    } = this.props;
    //console.log("ste",this.state.sortedlist,"myprops",this.props.list, this.props);
    return (
      <AutoResizer>
        {({ width, height }) => (
          <React.Fragment>
            {draggable && (
              <DraggableTable
                {...tableProps}
                height={height}
                width={width}
                data={this.state.sortedlist || this.props.list}
                rowWidth={rowWidth}
                //footerHeight={0}
                //headerHeight={[headerHeight]}
                //className={classes.table}

                rowClassName={this.getRowClassName}
                //headerClassName={this.getHeaderClassName}
                onColumnSort={this.sortTableColumn}
                sortBy={{
                  key: this.state.sortBy,
                  order: this.state.sortDirection
                }}
                sortDirection={this.state.sortDirection}
                columns={columns}
                ignoreFunctionInColumnCompare={false}
                estimatedRowHeight={40}
                sortState={this.state.sortState}
                rowEventHandlers={this.rowEventHandlers}
                setSortBy={setSortBy}
                /*cache={cache}
          rowRenderer={this.rowRenderer} */
              >
                {/* {columns.map(({ dataKey, ...other }, index) => {
              return (
                <Column
                  key={dataKey}
                  headerRenderer={(headerProps) =>
                    this.headerRenderer({
                      ...headerProps,
                      columnIndex: index,
                    })
                  }
                  className={classes.flexContainer}
                  cellRenderer={this.cellRenderer}
                  dataKey={dataKey}
                  {...other}
                />
              );
            })} */}
              </DraggableTable>
            )}
            {!draggable && (
              <BaseTable
                {...tableProps}
                height={height}
                width={width}
                data={this.state.sortedlist || this.props.list}
                rowWidth={rowWidth}
                //footerHeight={0}
                //headerHeight={[headerHeight]}
                //className={classes.table}

                rowClassName={this.getRowClassName}
                //headerClassName={this.getHeaderClassName}
                onColumnSort={this.sortTableColumn}
                sortBy={{
                  key: this.state.sortBy,
                  order: this.state.sortDirection
                }}
                sortDirection={this.state.sortDirection}
                columns={columns}
                ignoreFunctionInColumnCompare={false}
                estimatedRowHeight={40}
                sortState={this.state.sortState}
                rowEventHandlers={this.rowEventHandlers}
                setSortBy={setSortBy}
                /*cache={cache}
        rowRenderer={this.rowRenderer} */
              >
                {/* {columns.map(({ dataKey, ...other }, index) => {
            return (
              <Column
                key={dataKey}
                headerRenderer={(headerProps) =>
                  this.headerRenderer({
                    ...headerProps,
                    columnIndex: index,
                  })
                }
                className={classes.flexContainer}
                cellRenderer={this.cellRenderer}
                dataKey={dataKey}
                {...other}
              />
            );
          })} */}
              </BaseTable>
            )}
          </React.Fragment>
        )}
      </AutoResizer>
    );
  }
}

MuiVirtualizedTable.propTypes = {
  classes: PropTypes.object.isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      dataKey: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      numeric: PropTypes.bool,
      align: PropTypes.string.isRequired,
      width: PropTypes.number.isRequired
    })
  ).isRequired,
  headerHeight: PropTypes.number,
  onRowClick: PropTypes.func,
  rowHeight: PropTypes.number
};
class EditableCell extends React.PureComponent {
  state = {
    value: this.props.cellData
  };

  render() {
    const { container, rowIndex, columnIndex, columns, rowData } = this.props;
    //console.log("Cell Rendering",this.props);
    const { value } = this.state;
    const currentColumn = columns[columnIndex];
    const onChange = (event) => {
      //console.log(event);
      //console.log('GOt here', event, rowIndex, columnIndex, rowData);
      this.setState({
        value: event.target.value
      });
      columns[columnIndex].onCellChange(
        rowIndex,
        columnIndex,
        rowData,
        event.target.value
      );
    };
    const onClick = (event) => {
      //console.log('GOT here', event, rowIndex, columnIndex, rowData);
      columns[columnIndex].resetMySelection(rowData, event);
      columns[columnIndex].onRowClick(rowData, event);
    };
    //console.log(currentColumn);
    const myAlerter = currentColumn.alerter();
    if (!myAlerter || myAlerter == '') {
      if (currentColumn.type == 'select') {
        const optionTags = currentColumn.options.map((aOption, aIndex) => (
          <option key={aOption} value={aOption}>
            {aOption}
          </option>
        ));
        return (
          <CellContainer key={currentColumn.dataKey}>
            <Select value={value} onChange={onChange}>
              {optionTags}
            </Select>
          </CellContainer>
        );
      }
      if (currentColumn.type == 'number' || currentColumn.type == 'text') {
        return (
          <CellContainer key={currentColumn.dataKey}>
            <TextField
              onChange={onChange}
              value={value}
              type={currentColumn.type}
            />
          </CellContainer>
        );
      }
    }

    //console.log("myColChange",onClick,currentColumn.dataKey,value);

    return (
      <CellContainer onClick={onClick} key={currentColumn.dataKey}>
        {value}
      </CellContainer>
    );
  }
}

const VirtualizedTable = withStyles(styles)(MuiVirtualizedTable);

export default function TableOrderView({
  handleDataRowClick = () => {},
  handleDataCellChange = () => {},
  saveDataTable = () => {},
  resetDataTable = () => {},
  fetchDataTable = () => {},
  updateOrderChange = () => {},
  list,
  columns,
  setColumns,
  additionalSaveFunction = (abc) => {
    console.log(abc);
  },
  title,
  alerter
}) {
  const classes = useStyles();
  const resetMySelection = (thisdata, event) => {
    let mydata = [...data];
    let selectedRows = [];
    //console.log("Mydata",mydata,"statedata",data, "thisdata",thisdata);
    for (let index = 0; index < mydata.length; index++) {
      //console.log(index, mydata[index], thisdata);
      if (mydata[index].index == thisdata.index) {
        if (event && event.ctrlKey) {
          mydata[index].selectedshell = !mydata[index].selectedshell;
        } else {
          mydata[index].selectedshell = true;
        }
      } else {
        if (!event || !event.ctrlKey) {
          mydata[index].selectedshell = false;
        }
      }
      if (mydata[index].selectedshell) {
        selectedRows.push(mydata[index]);
      }
    }
    /* console.log(
      'Mydata',
      mydata,
      'statedata',
      data,
      'thisdata',
      thisdata,
      'selected rows',
      selectedRows
    ); */
    setData(mydata);
    return selectedRows;
  };

  const [data, setData] = useState(list);
  const [sortBy, setSortBy] = useState('order');
  const [sortDirection, setSortDirection] = useState(SortOrder.ASC);

  useEffect(() => {
    //console.log('UseEffect', list, sortBy, sortDirection);
    let sortedList = list;
    sortedList.sort(GetSortOrder(sortBy, sortDirection));
    setData(sortedList);
    if (additionalSaveFunction) {
      additionalSaveFunction(saveData);
    }
  }, [list]);

  const saveData = () => {
    saveDataTable(data);
  };

  const onRowClick = (dataRow, event) => {
    console.log('BeforeDataRowClock', dataRow);
    handleDataRowClick(dataRow, event);
    //console.log('AfterDataRowClock', data, sortBy, sortDirection);
  };

  const onCellChange = (rowIndex, columnIndex, dataRow, value) => {
    //console.log(rowIndex, columnIndex, dataRow, value);
    //console.log('BeforeCellChange', data, sortBy, sortDirection);
    handleDataCellChange(rowIndex, columnIndex, dataRow, value);
    //console.log('AfterCellChange', data, sortBy, sortDirection);
  };

  const getAlerter = () => {
    return alerter;
  };
  const defaultSort = {};
  var mycolumns = [];
  columns.forEach((element) => {
    var editable = element;
    if (element.type && element.type != 'view') {
      editable.cellRenderer = EditableCell;
      editable.onCellChange = onCellChange;
      editable.onRowClick = onRowClick;
      editable.resetMySelection = resetMySelection;
    } else {
      //console.log('Setting', element);
      editable.cellRenderer = EditableCell;
      editable.onRowClick = onRowClick;
      editable.onCellChange = onCellChange;
      editable.resetMySelection = resetMySelection;
    }
    editable.key = element.dataKey;
    editable.alerter = getAlerter;
    mycolumns.push(editable);
    defaultSort[element.dataKey] = element.inititalsort
      ? element.inititalsort
      : SortOrder.ASC;
  });

  return (
    <Paper className={classes.viewerContainer}>
      <div
        style={{
          fontWeight: 'bold',
          textAlign: 'center',
          fontSize: 20
        }}
        align="center"
      >
        {title}
        &nbsp;
        {(!alerter || alerter == '') && (
          <>
            <Button
              aria-describedby={'Save Controls'}
              id={'popsave'}
              type="button"
              variant="contained"
              color="primary"
              onClick={(event) => {
                saveDataTable(data);
              }}
              startIcon={<SaveOutlinedIcon />}
            ></Button>
            &nbsp;
            <Button
              aria-describedby={'Reset Controls'}
              id={'popreset'}
              type="button"
              variant="contained"
              color="primary"
              onClick={(event) => {
                resetDataTable();
              }}
              startIcon={<RotateLeftSharpIcon />}
            ></Button>
          </>
        )}
        {alerter && alerter != '' && (
          <Button
            aria-describedby={'Fetch Controls'}
            id={'popfetch'}
            type="button"
            variant="contained"
            color="primary"
            onClick={(event) => {
              fetchDataTable();
            }}
            startIcon={<DynamicFeedOutlinedIcon />}
          ></Button>
        )}
      </div>
      <VirtualizedTable
        rowCount={data ? data.length : 0}
        rowGetter={({ index }) => data[index]}
        columns={mycolumns}
        onRowClick={(thisdata) => {
          //          console.log('Resetbefore', thisdata);
          resetMySelection(thisdata.rowData, thisdata.event);
          //          console.log('BeforeDataRowClock', data, sortBy, sortDirection);
          handleDataRowClick(thisdata.rowData, thisdata.event);
          //          console.log('AfterDataRowClock', data, sortBy, sortDirection);
        }}
        updateOrderChange={(mydata, oldIndex, newIndex) => {
          //console.log('Before order change', mydata, data, oldIndex, newIndex);
          resetMySelection(mydata);
          updateOrderChange(mydata, oldIndex, newIndex);
          //console.log('After order change', mydata, data, oldIndex, newIndex);
        }}
        //headerHeight={50}
        //rowHeight={50}
        list={data}
        setData={setData}
        setSortBy={setSortBy}
        setSortDirection={setSortDirection}
        defaultSort={defaultSort}
        draggable={!alerter || alerter == ''}
      />
    </Paper>
  );
}
