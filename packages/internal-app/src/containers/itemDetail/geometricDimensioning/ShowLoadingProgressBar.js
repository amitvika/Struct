import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { Typography, CircularProgress } from '@material-ui/core';
import { withStyles, makeStyles } from "@material-ui/core/styles";
import ModelessDialog from '@monostruct/common/gltf/ModelessDialog';

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



export default function ShowLoadingProgressBar(
  { isProgressOpen=false,
    progressOpenedFiles=[]},
    setIsProgressOpen=(value)=>{console.log("Set Is Progress Open",value);},
    setProgressOpenedFiles=(value)=>{console.log("Set Progres sOpened Files",value);}) {
  /* const myStyle = {
    whiteSpace: "normal",
    wordWrap: "break-word",
    wordBreak: "break-all",
    width: "100px"
  } */
  
  const classes = useStyles();
  
  const onCloseProgress = (aFile) => {
    let openFiles = [...progressOpenedFiles];
    openFiles = this.arrayRemove(openFiles,aFile);
    setProgressOpenedFiles({ progressOpenedFiles: openFiles });
    if(progressOpenedFiles.length==0) {        
        setIsProgressOpen(false);
        console.log("Setting is progress closing",isProgressOpen,openFiles);
    }  else {
        console.log("Setting is progress Opening",isProgressOpen,openFiles);
    }         
  }

  

  const progressStyle = {
    width: '500px',
    boxShadow: 'rgba(0,0,0,.3) 0 0.3rem 1rem',
    background: 'red'
  }

  const renderProgress=()=>{
    const classes = {tableWow:'tableRow',tableCell:'tableCell'};
    const stateProgressOpenFiles =  progressOpenedFiles ? progressOpenedFiles : [] ;
    console.log("Reach under RenderProgress",stateProgressOpenFiles,isProgressOpen); 
    return  <Typography component="div">
      <TableContainer component={Paper} style={{ minWidth: 500 }}>
          <Table className={classes.table} aria-label="simple table">
              <TableHead>
                  <TableRow className={classes.tableRow} style={{background:"#CCCCCC",fontWeight:"bold"}}>
                      <TableCell className={classes.tableCell} align="left" size="small" >No</TableCell>
                      <TableCell className={classes.tableCell} align="left" size="small" >Feature</TableCell>
                      <TableCell className={classes.tableCell} align="left" size="small">Progress</TableCell>             
                  </TableRow>
              </TableHead>
              <TableBody>
                  {/* {this.state.progressOpenedFiles} */}
                  {stateProgressOpenFiles.map( 
                      (row,index) => 
                        (<StyledTableRow>
                            <StyledTableCell align="left" size="small">
                                {index+1}
                            </StyledTableCell>
                            <StyledTableCell align="left" size="small" >
                                {row}
                            </StyledTableCell>
                            <StyledTableCell align="left" size="small">
                                <CircularProgress />
                            </StyledTableCell>
                        </StyledTableRow> ) 
                      ) 
                  } 
              </TableBody>
          </Table>
      </TableContainer>
    </Typography>
  }


  return (
    <ModelessDialog
      isOpen={isProgressOpen}
      onClose={onCloseProgress}
      style={progressStyle}
      containerClassName={'container'}
      noBackdrop={true}
      clickBackdropToClose={false}>
      {renderProgress()}
    </ModelessDialog> 
  );
}
