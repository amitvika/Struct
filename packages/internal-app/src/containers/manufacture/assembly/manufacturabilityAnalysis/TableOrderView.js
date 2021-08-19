//import React, { useState, useEffect } from 'react'
//import MaterialTable from "material-table";

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
import Paper from '@material-ui/core/Paper';
import { AutoSizer, Column, CellMeasurer, CellMeasurerCache, Table, SortIndicator, SortDirection } from 'react-virtualized';

//import TableHead from '@material-ui/core/TableHead';
//let rowParent = null;
const styles = (theme) => ({
  flexContainer: {
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
    borderSpacing: 0
  },
  table: {
    // temporary right-to-left patch, waiting for
    // https://github.com/bvaughn/react-virtualized/issues/454
    '& .ReactVirtualized__Table__headerRow': {
      flip: false,
      paddingRight: theme.direction === 'rtl' ? '0 !important' : undefined,
    },
    borderSpacing: 0
  },
  tableRow: {
    cursor: 'pointer',
    borderSpacing: 0
  },
  tableRowHover: {
    '&:hover': {
      backgroundColor: theme.palette.grey[200],
    },
  },
  tableCell: {
    flex: 1,
    borderSpacing: 0
  },
  noClick: {
    cursor: 'initial',
  },
  mainContainer: { margin: 10, padding: 10, display: 'inline-flex', minWidth: '100%' },
  viewerContainer: {
    flex: 1,
    padding: '20px',
    margin: '0px 15px',
    display: 'inline-block',
    boxShadow: '0 0 10px rgb(0 0 0 / 20%)',
    borderSpacing: 0,
    minWidth: 720
  }
});
const useStyles = makeStyles(styles);
const GetSortOrder=(sortBy, sortDirection)=> {    
  return function(a, b) {    
      if (a[sortBy] > b[sortBy]) {    
          return (sortDirection==SortDirection.ASC?1:-1);    
      } else if (a[sortBy] < b[sortBy]) {    
          return (sortDirection==SortDirection.DESC?1:-1);    
      }    
      return 0;    
  }    
}    
class MuiVirtualizedTable extends React.PureComponent {
  static defaultProps = {
    headerHeight: 24,
    rowHeight: 12,
  };
  cache = new CellMeasurerCache({
    fixedWidth: true,
    height: this.props.rowHeight
  });
  
  state = {    
    sortBy: "index",
    sortDirection: SortDirection.ASC,
    sortedlist:this.props.list
  };

  getRowClassName = ({ index }) => {
    const { classes, onRowClick } = this.props;
    return clsx(classes.tableRow, classes.flexContainer, {
      [classes.tableRowHover]: index !== -1 && onRowClick != null,
    });

  };
  /*  rowRenderer=(params)=> {
     return (
       <CellMeasurer
         cache={this.props.cache}
         columnIndex={0}
         key={params.key}
         parent={rowParent}
         rowIndex={params.rowIndex}
       >
        {Table.defaultProps.rowRenderer(params)}
       </CellMeasurer>
     );
   } */
  cellRenderer = ({ cellData, columnIndex, dataKey, parent, rowIndex, style }) => {
    //rowParent = parent;
    const { columns, classes, rowHeight, onRowClick, cache } = this.props;
    return (
      <CellMeasurer
        cache={this.cache}
        columnIndex={columnIndex}
        key={dataKey}
        parent={parent}
        rowIndex={rowIndex}>
        <TableCell
          component="div"
          className={clsx(classes.tableCell, classes.flexContainer, {
            [classes.noClick]: onRowClick == null,
          })}
          variant="body"
          style={{
            borderSpacing: 0,
            height: this.cache.rowHeight,
            rowGap: 0,
            /*  paddingTop:0,
             paddingBottom:0, */
            whiteSpace: "normal",
            wordWrap: 'break-word',
            wordBreak: 'break-all'
          }}
          align={(columnIndex == null ? "left": columns[columnIndex].align ||  'right' )}
        >
          {cellData}
        </TableCell>
      </CellMeasurer>
    );
  };
 
  
  sort=({ sortBy, sortDirection }) =>{
    const {list,setData,setSortBy,setSortDirection} = this.props;
    console.log(list);
    let sortedList  = list;
    sortedList.sort(GetSortOrder(sortBy,sortDirection));  
    
    this.setState({ sortBy, sortDirection, sortedList });
    if(setData) {
      setData(sortedList);
    }
    if(setSortBy) {
      setSortBy(sortBy);      
    }
    if(setSortDirection) {
      setSortDirection(sortDirection)
    }
  }
  headerRenderer = ({ label, columnIndex }) => {
    const { headerHeight, columns, classes } = this.props;

    return (
      <TableCell
        component="div"
        className={clsx(classes.tableCell, classes.flexContainer, classes.noClick)}
        variant="head"
        style={{ height: headerHeight, 'font-weight': 'bold' }}
        align={columns[columnIndex].align || 'right' }
      >
        <span>{label}<SortIndicator SortDirection={this.state.sortDirection}/></span>
      </TableCell>
    );
  };
  getRowStyle = (row) => {
    const { list } = this.props;
    if (row.index < 0) return;
    if (list[row.index].selectedshell) {
      return {
        backgroundColor: '#0f0',
        borderSpacing: 0
      };
    }
    return {
      backgroundColor: '#fff',
      borderSpacing: 0
    };
  }

  render() {
    const { classes, columns, rowHeight, rowWidth, headerHeight, ...tableProps } = this.props;

    return (
      <AutoSizer>
        {({ height, width }) => (
          <Table
            height={height}
            width={width}
            rowWidth={rowWidth}
            rowHeight={rowHeight} //this.cache.rowheight will do efffective height
            gridStyle={{
              direction: 'inherit',
            }}
            headerHeight={headerHeight}
            className={classes.table}
            {...tableProps}
            rowClassName={this.getRowClassName}
            rowStyle={this.getRowStyle}
            deferredMeasurementCache={this.cache}
            sort={this.sort}
            sortBy={this.state.sortBy}
            sortDirection={this.state.sortDirection}           
          /*cache={cache}
          rowRenderer={this.rowRenderer} */
          >
            {columns.map(({ dataKey, ...other }, index) => {
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
            })}
          </Table>
        )}
      </AutoSizer>
    );
  }
}

MuiVirtualizedTable.propTypes = {
  classes: PropTypes.object.isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      dataKey: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      numeric: PropTypes.bool,
      align:PropTypes.string.isRequired,
      width: PropTypes.number.isRequired,
    }),
  ).isRequired,
  headerHeight: PropTypes.number,
  onRowClick: PropTypes.func,
  rowHeight: PropTypes.number,
};

const VirtualizedTable = withStyles(styles)(MuiVirtualizedTable);

export default function TableOrderView({
  handleDataRowClick = () => { },
  list,
  columns,
  setColumns,
  title
}) {

  const classes = useStyles();
  const resetMySelection = (thisdata) => {
    let mydata = [...data];
    for (let index = 0; index < mydata.length; index++) {
      mydata[index].selectedshell = index == thisdata.index;
    }
    setData(mydata);
  }

  useEffect(() => {
    console.log("UseEffect",list,sortBy,sortDirection);
    let sortedList  = list;
    sortedList.sort(GetSortOrder(sortBy,sortDirection));  
    setData(sortedList);
  }, [list]);

  const [data, setData] = useState(list);
  const [sortBy,setSortBy] = useState("index");
  const [sortDirection,setSortDirection] = useState(SortDirection.ASC);
  return (
    <Paper className={classes.viewerContainer}>

      <div style={{
        'fontWeight': 'bold',
        'textAlign': 'center',
        'fontSize': 20
      }} align='center'>{title}</div>
      <VirtualizedTable
        rowCount={data ? data.length : 0}
        rowGetter={({ index }) => data[index]}
        columns={columns}
        onRowClick={(thisdata) => {
          console.log(thisdata);
          resetMySelection(thisdata);
          console.log("BeforeDataRowClock",data,sortBy,sortDirection);
          handleDataRowClick(thisdata.rowData, thisdata.event);
          console.log("AfterDataRowClock",data,sortBy,sortDirection);
        }}
        headerHeight={50}
        rowHeight={50}
        list={data}
        setData={setData}
        setSortBy={setSortBy}
        setSortDirection={setSortDirection}
      />
    </Paper>
  );
  /*  return (
     <MaterialTable
       columns={columns}
       data={list}
       title={title}
       options={{
         actionsColumnIndex: 6,
         addRowPosition: "first",
         exportButton: false,
         exportFileName: "Client",
         cellStyle: {
           textAlign: 'center'
         },
         headerStyle: {
           textAlign: 'center',
           fontWeight: 'bold'
         },
         rowStyle:  rowData => ({
           backgroundColor: rowData.selectedshell ?   "#0f0" : "#fff" 
         }),
         selection: false,
         search: true,
         
       }}
 
 
       onRowClick={(event, rowdata) => {
         
         if(handleDataRowClick) {          
          
           handleDataRowClick(rowdata,event);
         }
       }} 
       
     />
   )*/
}
