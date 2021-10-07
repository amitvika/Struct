import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
//import { withStyles, makeStyles } from "@material-ui/core/styles";
import { Typography } from '@material-ui/core';
import { Box } from '@material-ui/core';
import {USESTYLES, StyledTableRow, StyledTableCell} from "@monostruct/common/gltf/Tree/utils";
/*
const useStyles = makeStyles({
  table: {
    minWidth: 400
  },
  tableRow: {
    height: 30    
  },
  tableCell: {
    padding: "0px 8px",
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
    padding: "0px 12px"
  }
}))(TableCell);
*/


export default function SelectedSummaryTable({ featureList = [], 
    features = true,  
    activeDataTable=0,
    setActiveDataTable=(data)=>{console.log(data)},
    setCurrentDataTable=(data)=>{console.log(data)},
    gltfjson={},
    mateValues=[] }) {
  /* const myStyle = {
    whiteSpace: "normal",
    wordWrap: "break-word",
    wordBreak: "break-all",
    width: "100px"
  } */
  const classes = USESTYLES();
  
  const renderOptions = (options) => {
    return options.map((row,index) => (
          <option key={index.toString()} value={row}>
            {row}
          </option>
    ) );
  }
  const Options1=['M1','M1.1','M1.2','M1.4','M1.6','M1.7','M1.8',
                  'M2','M2.2','M2.3','M2.5','M2.6',
                  'M3','M3.5','M4','M4.5',
                  'M5','M6','M7','M8','M9','M10','M11','M12',
                  'M14','M16','M18','M20','M22','M24','M26',
                  'M27','M28','M30','M32','M33','M36','M38','M39',
                  'M40','M42','M45','M48','M52'
                ];
  const Options2=['#1','#2','#3','#4','$5',
                  '#6','#8','#10','#12',
                  '1/4"','5/16"','3/8"','7/16"',
                  '1/2"','9/16"','5/8"',
                  '3/4"','7/8"','1"','1 1/8"','1 1/4"'                
              ]
  const myCheckBoxes = [" coplaner ", " parallel ", " normal ", " opposite ",
  " concentric ", " coradial ", " angle ", " offset "];
          
  const renderMateValues = (myMateValues) => {
    return myMateValues.map((row, index) => (
      row ? myCheckBoxes[index] : ""
      ))
  }
  const renderTable = (myData,groupid,myMateValues,active) => {
    //console.log("FeaturList",featureList,features);
    if (!myData || myData.length==0) {
      return <StyledTableRow key={"No Row Selected"+groupid.toString()} 
        onClick={()=>{setCurrentDataTable(groupid)}}
      >
        <StyledTableCell component="th" scope="row"  >
          <Box sx={ active ? { fontWeight: 'bold' }: {fontWeight:'normal'} } >
            {"No Features Selected"}
          </Box>
        </StyledTableCell>
        <StyledTableCell align="right"  >
            <Box sx={ active ? { fontWeight: 'bold' }: {fontWeight:'normal'} } >
              {""}
            </Box>
          </StyledTableCell>
          <StyledTableCell align="right" >
            <Box sx={ active ? { fontWeight: 'bold' }: {fontWeight:'normal'} } >
              {groupid}
            </Box>
          </StyledTableCell>        
          <StyledTableCell align="right"  >
            {""}
          </StyledTableCell>
          <StyledTableCell align="right"  >
            {""}
          </StyledTableCell>
      </StyledTableRow>
    } else {
      return myData.map((row, index) => ( 
      
        <StyledTableRow key={(features ? row.n : row.parent.n) + index.toString()} 
         onClick={()=>{setCurrentDataTable(groupid)}}
       >
          <StyledTableCell component="th" scope="row"  >
            <Box sx={ active ? { fontWeight: 'bold' }: {fontWeight:'normal'} } >
              {(features ? row.n : row.parent.n)}
            </Box>
          </StyledTableCell>
          <StyledTableCell align="right"  >
            <Box sx={ active ? { fontWeight: 'bold' }: {fontWeight:'normal'} } >
              {row.type}
            </Box>
          </StyledTableCell>
          <StyledTableCell align="right" >
            <Box sx={ active ? { fontWeight: 'bold' }: {fontWeight:'normal'} } >
              {groupid}
            </Box>
          </StyledTableCell>        
          <StyledTableCell align="right"  >
            {renderMateValues(myMateValues)}
          </StyledTableCell>
          <StyledTableCell align="right"  >
            {"Assembly Mates"}
          </StyledTableCell>
        </StyledTableRow>
      
    ))
    }
    
  }

  return (
    <Typography component="div">
    <TableContainer component={Paper} style={{ minWidth: 400 }}>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow className={classes.tableRow} style={{background:"#CCCCCC",fontWeight:"bold"}}>
            <TableCell className={classes.tableCell} >Part</TableCell>
            <TableCell className={classes.tableCell} align="right" size="small" >Feature<br/>Type</TableCell>
            <TableCell className={classes.tableCell} align="right" size="small">Grouper<br/>ID</TableCell>
            <TableCell className={classes.tableCell} align="right" size="small">Relation<br/>Type</TableCell>
            <TableCell className={classes.tableCell} align="right" size="small">Relation</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          { gltfjson?.gdttable?.map( (row, index) => (
            (!row.key || row.key=="") ?
            index==activeDataTable ? renderTable(featureList,index,mateValues,true) :
              renderTable(features?row.selectedObjects:row.parentObjects,index,row.mateValues,false)  :
              null
            ) ) 
          }
        </TableBody>
      </Table>
    </TableContainer>
    </Typography>
  );
}
