//import React, { useState, useEffect } from 'react'
//import MaterialTable from "material-table";

import React , { useState, useEffect  } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
import Paper from '@material-ui/core/Paper';
import { AutoSizer, Column, CellMeasurer, CellMeasurerCache, Table } from 'react-virtualized';

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
    borderSpacing:0
  },
  noClick: {
    cursor: 'initial',
  },
  mainContainer: { margin: 10, padding: 10, display: 'inline-flex', minWidth: '100%' },
  viewerContainer: {         
      height: '600px',
      padding: '20px',
      margin: '0px 15px',
      display: 'inline-block',
      border: '1px solid rgba(0, 0, 0, 0.3)',
      boxShadow: '0 0 10px rgb(0 0 0 / 20%)',
      borderSpacing: 0
  }
});
const useStyles = makeStyles(styles);

class MuiVirtualizedTable extends React.PureComponent {
  static defaultProps = {
    headerHeight: 24,
    rowHeight: 12,
  };
  cache = new CellMeasurerCache({
    fixedWidth: true,
    height:this.props.rowHeight
  });

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
                  borderSpacing:0,
                  height:0, 
                  rowGap:0,
                 /*  paddingTop:0,
                  paddingBottom:0, */
                  whiteSpace: "normal", 
                  wordWrap:'break-word',
                  wordBreak:'break-all' }}
                align={(columnIndex != null && columns[columnIndex].numeric) || false ? 'right' : 'left'}
              >
            {cellData}
          </TableCell>
  
    </CellMeasurer> 

      
    );
  };

  headerRenderer = ({ label, columnIndex }) => {
    const { headerHeight, columns, classes } = this.props;

    return (
      <TableCell
        component="div"
        className={clsx(classes.tableCell, classes.flexContainer, classes.noClick)}
        variant="head"
        style={{ height: headerHeight, 'font-weight': 'bold' }}
        align={columns[columnIndex].numeric || false ? 'right' : 'left'}
      >
        <span>{label}</span>
      </TableCell>
    );
  };
  getRowStyle= (row) => {
    const {list} = this.props;
    if (row.index < 0) return;
    if (list[row.index].selectedshell) {
      return {
        backgroundColor: '#0f0'
      };
    }
    return {
      backgroundColor: '#fff'
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
            rowHeight={this.cache.rowHeight}
            gridStyle={{
              direction: 'inherit',
            }}
            headerHeight={headerHeight}
            className={classes.table}
            {...tableProps}
            rowClassName={this.getRowClassName}
            rowStyle={this.getRowStyle}
            deferredMeasurementCache={this.cache}
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
      width: PropTypes.number.isRequired,
    }),
  ).isRequired,
  headerHeight: PropTypes.number,
  onRowClick: PropTypes.func,
  rowHeight: PropTypes.number,
};

const VirtualizedTable = withStyles(styles)(MuiVirtualizedTable);

export default function TableOrderView({
  handleDataRowClick = () => {},
  list,
  columns,
  setColumns,
  title
}) {
  
  const classes = useStyles();
  const resetMySelection=(data)=>{
    let mydata = [...list];
    for (let index = 0; index < mydata.length; index++) {
      mydata[index].selectedshell = index == data.index;    
    }
    setData(mydata);
  }

  useEffect(() => {   
    setData(list);   
  }, [list]);

  const [data, setData] = useState(list);

  return (
    <Paper className={classes.viewerContainer} style={{ height: 600, width: 700 }}>

      <div style={{        
         'fontWeight':'bold' ,        
         'textAlign':'center',
         'fontSize':20,
         'width':700}} align='center'>{title}</div>
      <VirtualizedTable
        rowCount={data?data.length:0}
        rowGetter={({ index }) => data[index]}
        columns={columns}
        onRowClick={(data)=>{
          console.log(data);
          resetMySelection(data);
          handleDataRowClick(data.rowData,data.event);
        }}
        headerHeight={50}
        rowHeight={12}
        list={data}
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
