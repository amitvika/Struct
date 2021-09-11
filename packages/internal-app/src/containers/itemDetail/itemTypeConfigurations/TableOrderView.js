//import React, { useState, useEffect } from 'react'
//import MaterialTable from "material-table";

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { withStyles, makeStyles } from '@material-ui/core/styles';
//import { Overlay } from 'react-overlays';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import SaveOutlinedIcon from '@material-ui/icons/SaveOutlined';

import Paper from '@material-ui/core/Paper';
import { AutoResizer, BaseTable, SortOrder } from '@ravibasil/common/gltf/GridTable';
import { createGlobalStyle } from 'styled-components/macro';
import styled  from 'styled-components';
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
    '& .ReactVirtualized__Table__headerRow': {
      flip: false,
      paddingRight: theme.direction === 'rtl' ? '0 !important' : undefined,
    },
    borderSpacing: 0,
    whiteSpace: "normal",
    wordWrap: 'break-word',
    wordBreak: 'break-all'
    
  },
  tableRow: {
    cursor: 'pointer',
    borderSpacing: 0,
    backgroundColor: '#FFFFFF',
    whiteSpace: "normal",
    wordWrap: 'break-word',
    wordBreak: 'break-all'
  },
  selectedTableRow: {
    cursor: 'pointer',
    borderSpacing: 0,
    backgroundColor: '#00FF00',
    whiteSpace: "normal",
    wordWrap: 'break-word',
    wordBreak: 'break-all'
  },
  headerTableRow: {
    flex: 1,
    borderSpacing: 0,
    fontWeight:'bold'
   
  },
  tableRowHover: {
    '&:hover': {
      backgroundColor: theme.palette.grey[200],
    },
  },
  tableCell: {
    flex: 1,
    borderSpacing: 0,
    whiteSpace: "normal",
    wordWrap: 'break-word',
    wordBreak: 'break-all'
  },
  noClick: {
    cursor: 'initial',
  },
  'sticky-row': {
    '& .sticky-row.BaseTable__row': {
      backgroundColor: '#00FF00'
    }
  },
  backgroundColor:theme.palette.grey[255],
  mainContainer: { margin: 10, padding: 10, display: 'inline-flex', minWidth: '100%' },
  viewerContainer: {
    flex: 1,
    padding: '20px',
    margin: '0px 15px',
    display: 'inline-block',
    boxShadow: '0 0 10px rgb(0 0 0 / 20%)',
    borderSpacing: 0,
    minWidth: 500
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
  `

const GlobalStyle = createGlobalStyle`
  .BaseTable__row:hover,
  .BaseTable__row--hover {
    ${CellContainer} {
      border: 1px dashed #ccc;
    }
  }
`

/* const Select = styled.select`
  width: 100%;
  height: 30px;
  margin-top: 10px;
` */
const useStyles = makeStyles(styles);
const GetSortOrder=(sortBy, sortDirection)=> {    
  return function(a, b) {  
      if (sortDirection) {
        if (a[sortBy] > b[sortBy]) {    
          return (sortDirection==SortOrder.ASC?1:-1);    
        } else if (a[sortBy] < b[sortBy]) {    
            return (sortDirection==SortOrder.DESC?1:-1);    
        }  
      }  
       
      return 0;    
  }    
}    
class MuiVirtualizedTable extends React.PureComponent {
  static defaultProps = {
    headerHeight: 24,
    rowHeight: 12,
  };
  /* cache = new CellMeasurerCache({
    fixedWidth: true,
    height: this.props.rowHeight
  }); */
  
  state = {    
    sortBy: "name",
    sortDirection: SortOrder.ASC,
    sortedlist:this.props.list,
    sortState: this.props.defaultSort,
  };

  getRowClassName = (gotHere) => {
    const {rowIndex}=gotHere;
    const {list}=this.props;
    //console.log("Reaching getRowClassName",gotHere,list,this.props);
    const { classes, onRowClick } = this.props;
    //console.log(classes.tableRow);
    const Megot = clsx(classes.tableRow, classes.flexContainer, {
      [classes.tableRowHover]: rowIndex !== -1 && onRowClick != null
     }
  );
    const classHere = rowIndex >=0 ? list[rowIndex].selectedshell ? 
    clsx(classes.selectedTableRow, classes.flexContainer, {
      [classes.tableRowHover]: rowIndex !== -1 && onRowClick != null
     }
  ): Megot : Megot;
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
  
  
  sortTableColumn=(whatIsGot) =>{
    const {column,key,order}=whatIsGot;
    const {list,setData,setSortBy,setSortDirection} = this.props;
    //console.log(whatIsGot,list,this.props,key,order);
    let sortedList  = list;
    sortedList.sort(GetSortOrder(key,order));  
    
    this.setState({ key, order, sortedList });
    if(setData) {
      setData(sortedList);
    }
    if(setSortBy) {
      setSortBy(key);      
    }
    if(setSortDirection) {
      setSortDirection(order)
    }
    
    this.setState( { sortState: {
      ...this.state.sortState,
      [key]: this.state.sortState[key] === SortOrder.DESC  ?  SortOrder.ASC: SortOrder.DESC,
    } } );
  }
  
  
  rowEventHandlers = {
    onClick: this.props.onRowClick
  }

  render() {
    const { classes, columns, rowHeight, rowWidth, headerHeight,  list, ...tableProps } = this.props;
    //console.log("My Props",this.props);
    return (
      <AutoResizer>
      {({ width, height }) => (
          <BaseTable
            
            height={height}
            width={width}
            data={list}
            rowWidth={rowWidth}
            
            //footerHeight={0}       
            //headerHeight={[headerHeight]}
            //className={classes.table}
            
            rowClassName={this.getRowClassName}
            //headerClassName={this.getHeaderClassName}
            onColumnSort={this.sortTableColumn}
            sortBy={{'key':this.state.sortBy,
                     'order':this.state.sortDirection
                    }}
            sortDirection={this.state.sortDirection}  
            columns={columns}    
            ignoreFunctionInColumnCompare={false} 
            estimatedRowHeight={40}  
            sortState={this.state.sortState}            
            rowEventHandlers={this.rowEventHandlers}  
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
      align:PropTypes.string.isRequired,
      width: PropTypes.number.isRequired,
    }),
  ).isRequired,
  headerHeight: PropTypes.number,
  onRowClick: PropTypes.func,
  rowHeight: PropTypes.number,
};
class EditableCell extends React.PureComponent {
  state = {
    value: this.props.cellData
  }

  
  render() {
    const { container, rowIndex, columnIndex, columns,rowData } = this.props
    //console.log("Cell Rendering",this.props);
    const { value } = this.state;
    const currentColumn = columns[columnIndex];
    const onChange=(event) => {
      console.log(event);
      console.log("GOt here",event,rowIndex,columnIndex,currentColumn.onCellChange);
      this.setState({
        value: event.target.value
      })
      columns[columnIndex].onCellChange(rowIndex,columnIndex,rowData,event.target.value);
    } 
    if (currentColumn.type=="select") {
      const optionTags = currentColumn.options.map((aOption, aIndex) => (
        <option value={aOption}>{aOption}</option>
      ));
      return (
        <CellContainer>              
              <Select value={value} onChange={onChange}>
                {optionTags}                  
              </Select>              
        </CellContainer>
      ) 
    }
    if (currentColumn.type=="number" || currentColumn.type=="text" ) {     
      return (
        <CellContainer>              
            <TextField onChange={onChange} value={value}/>             
        </CellContainer>
      ) 
    }
    //console.log("myColChange",myColChange);
    return (
      <CellContainer>              
            {value}             
      </CellContainer>
    )
  }
}

const VirtualizedTable = withStyles(styles)(MuiVirtualizedTable);

export default function TableOrderView({
  handleDataRowClick = () => { },
  handleDataCellChange = () => { },
  saveDataTable = () => {},
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

  const [data, setData] = useState(list);
  const [sortBy,setSortBy] = useState("name");
  const [sortDirection,setSortDirection] = useState(SortOrder.ASC);
  
  useEffect(() => {
    console.log("UseEffect",list,sortBy,sortDirection);
    let sortedList  = list;
    sortedList.sort(GetSortOrder(sortBy,sortDirection));  
    setData(sortedList);
  }, [list]);
  
  const onCellChange=(rowIndex,columnIndex,dataRow,value)=>{
    console.log(rowIndex,columnIndex,dataRow,value);  
    console.log("BeforeCellChange",data,sortBy,sortDirection);
    handleDataCellChange(rowIndex,columnIndex,dataRow,value);
    console.log("AfterCellChange",data,sortBy,sortDirection);
  };
  
  const defaultSort={};
  var mycolumns = [];
  columns.forEach(element => {
    var editable = element;
    if(element.type && element.type!="view"){      
      editable.cellRenderer=EditableCell;
      editable.onCellChange=onCellChange;
    } 
    element.key = element.dataKey;
    mycolumns.push(editable);
    defaultSort[element.dataKey]=element.inititalsort?element.inititalsort:SortOrder.ASC;    
  });
  

  return (
    <Paper className={classes.viewerContainer}>

      <div style={{
        'fontWeight': 'bold',
        'textAlign': 'center',
        'fontSize': 20
      }} align='center'>
        {title}
        <Button aria-describedby={"Save Controls"} 
            id={'popsave'} type="button" 
            variant="contained" 
            color="primary"
            onClick={(event)=>{saveDataTable()}}                        
            startIcon={<SaveOutlinedIcon/>} 
        >
        </Button>                
      </div>
      <VirtualizedTable
        rowCount={data ? data.length : 0}
        rowGetter={({ index }) => data[index]}
        columns={mycolumns}
        onRowClick={(thisdata) => {
          console.log(thisdata);
          resetMySelection(thisdata);
          console.log("BeforeDataRowClock",data,sortBy,sortDirection);
          handleDataRowClick(thisdata.rowData, thisdata.event);
          console.log("AfterDataRowClock",data,sortBy,sortDirection);
        }}
        //headerHeight={50}
        //rowHeight={50}
        list={data}
        setData={setData}
        setSortBy={setSortBy}
        setSortDirection={setSortDirection}
        defaultSort={defaultSort}
      />
    </Paper>
  ); 
}
