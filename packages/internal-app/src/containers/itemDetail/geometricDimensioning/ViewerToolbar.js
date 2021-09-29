import React, { useState, useEffect } from 'react';
import { Grid, Paper } from '@material-ui/core';
import {
  SELECTSOLID,
  SELECTEDGE,
  SELECTMEASURE,
  SELECTDISECTPARTS,
  SELECTASSEMBLY,
  SELECTFEATURE,
} from '@monostruct/common/gltf/Tree/utils';

import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';

import ApartmentOutlinedIcon from '@material-ui/icons/ApartmentOutlined';
import DashboardOutlinedIcon from '@material-ui/icons/DashboardOutlined';
import ExtensionOutlinedIcon from '@material-ui/icons/ExtensionOutlined';
import FilterDramaOutlinedIcon from '@material-ui/icons/FilterDramaOutlined';
import SaveOutlinedIcon from '@material-ui/icons/SaveOutlined';
import RotateLeftSharpIcon from '@material-ui/icons/RotateLeftSharp';
import AddCircleOutlineOutlinedIcon from '@material-ui/icons/AddCircleOutlineOutlined';

import Box from '@material-ui/core/Box';

import SelectedFeatureMenu from './SelectedFeatureMenu';
import SelectedMatesRelation from './SelectedMatesRelation';
import SelectedGDTMenu from './SelectedGDTMenu';
import SelectedSummaryTable from './SelectedSummaryTable';

const useStyles = makeStyles((theme) => ({
  paper: {
    flex: 1,
    display: 'flex',
    padding: '20px',
    margin: '0px 15px',
    boxShadow: '0 0 10px rgb(0 0 0 / 20%)',
  },
  container: {
    display: 'inline-block',
  },
  toolbarContainer: {
    display: 'flex',
    justifyContent: 'space-around',
  },
  tableContainer: {
    display: 'flex',
    margin: '10px 0px 0px 0px',
    flexDirection: 'row',
    flex: 1,
  },
  button: {
    flex: 1,
  },
}));

export default function ViewerToolbar({
  splitMethod = 0,
  selectedOption,
  setSelectedOption,
  resetSelections,
  selectAllSelectedSolids,
  selectedObjects,
  parentObjects,
  mates,
  mateValues,
  angle,
  offset,
  gltfjson,
  setCtrlKey,
  toolbar,
  activeDataTable,
  setActiveDataTable,
  incrementActiveDataTable,
  saveGDTDataTable,
  resetActiveDataTable, 
  setCurrentDataTable,
  setRowKeyValue,
  setMateValues,
  setAngle,
  setOffset
}) {
  const classes = useStyles();
  
  const renderTitle = (title,extras) => {
    return <div style={{
                        'fontWeight': 'bold',
                        'textAlign': 'center',
                        'fontSize': 20
                      }} align='center'>
            {title}
            
          </div> 
  }
  const renderButtons = () => {
   return <div>
       &nbsp;
      <Button
        aria-describedby={'Save Controls'}
        id={'popsave'}
        type="button"
        variant="contained"
        color="primary"
        onClick={(event) => {                 
          saveGDTDataTable();                 
        }}
        startIcon={<SaveOutlinedIcon />}
      > Save Selections</Button>
      &nbsp;
      <Button
        aria-describedby={'Reset Controls'}
        id={'popreset'}
        type="button"
        variant="contained"
        color="primary"
        onClick={(event) => {
          resetActiveDataTable();
        }}
        startIcon={<RotateLeftSharpIcon />}
      > Reset Selections</Button>
      &nbsp;
      <Button
        aria-describedby={'Add Controls'}
        id={'popreset'}
        type="button"
        variant="contained"
        color="primary"
        onClick={(event) => {
          incrementActiveDataTable();
        }}
        startIcon={<AddCircleOutlineOutlinedIcon />}
      > Add a Grouper ID</Button>
      </div>    
  }

  const renderToolBarButtons = () => {
    if (toolbar && splitMethod != 0) {
      return (
        <Paper className={`${classes.paper} ${classes.toolbarContainer}`}>
          <Button
            value={'Assembly'}
            variant="contained"
            color={selectedOption == SELECTASSEMBLY ? 'primary' : 'default'}
            type="button"
            className={classes.button}
            onClick={(event) => {
              const previousSelectedOption = selectedOption;
              setSelectedOption(SELECTASSEMBLY);
              if (event) {
                setCtrlKey(event.ctrlKey);
              }
              if (previousSelectedOption == SELECTMEASURE) {
                resetSelections();
              }
              selectAllSelectedSolids(SELECTASSEMBLY);
            }}
            startIcon={<ApartmentOutlinedIcon />}
          >
            Select<br></br>Assemblies
          </Button>
          &nbsp;
          <Button
            value={'Solid'}
            style={{ marginLeft: '1%' }}
            variant="contained"
            color={selectedOption == SELECTSOLID ? 'primary' : 'default'}
            type="button"
            className={classes.button}
            onClick={(event) => {
              const previousSelectedOption = selectedOption;
              setSelectedOption(SELECTSOLID);
              if (event) {
                setCtrlKey(event.ctrlKey);
              }
              if (previousSelectedOption == SELECTMEASURE) {
                resetSelections();
              }
              selectAllSelectedSolids(SELECTSOLID);
              //console.log(this.state.selectedOption);
            }}
            startIcon={<DashboardOutlinedIcon />}
          >
            Select<br></br>Parts
          </Button>
          &nbsp;
          {splitMethod == SELECTDISECTPARTS && (
            <React.Fragment>
              <Button
                value={'Edge'}
                style={{ marginLeft: '1%' }}
                variant="contained"
                color={selectedOption == SELECTEDGE ? 'primary' : 'default'}
                type="button"
                className={classes.button}
                onClick={(event) => {
                  const previousSelectedOption = selectedOption;
                  setSelectedOption(SELECTEDGE);
                  if (event) {
                    setCtrlKey(event.ctrlKey);
                  }
                  if (previousSelectedOption == SELECTMEASURE) {
                    resetSelections();
                  }
                  //console.log(this.state.selectedOption);
                }}
                startIcon={<FilterDramaOutlinedIcon />}
              >
                Select<br></br>Edges
              </Button>
              &nbsp;
              <Button
                value={'Features'}
                style={{ marginLeft: '1%' }}
                variant="contained"
                color={selectedOption == SELECTFEATURE ? 'primary' : 'default'}
                type="button"
                className={classes.button}
                onClick={(event) => {
                  const previousSelectedOption = selectedOption;
                  setSelectedOption(SELECTFEATURE);
                  if (event) {
                    setCtrlKey(event.ctrlKey);
                  }
                  if (previousSelectedOption == SELECTMEASURE) {
                    resetSelections();
                  }
                  //console.log(this.state.selectedOption);
                }}
                startIcon={<ExtensionOutlinedIcon />}
              >
                Specify<br></br> Assembly Mates
              </Button>
            </React.Fragment>
          )}
        </Paper>
      );
    }
    return null;
  };

  return (
    <>
      <Box style={{ flex: 1 }} >
       {/*renderToolBarButtons()*/}
         
          {
            (selectedObjects) && (selectedObjects.length >= 1) && (
              <div align={"center"}>
              {renderButtons()}
              </div>
            )
          }
          {
            (selectedObjects) && (selectedObjects.length >= 2) && (selectedOption != SELECTSOLID) && (selectedOption != SELECTASSEMBLY) && (
              <Box>
              {renderTitle("Assembly Mates")} 
              <Paper className={classes.paper}>
                <SelectedMatesRelation
                  mates={mates}
                  featureList={selectedObjects}
                  mateValues={mateValues}
                  angleMate={angle}
                  offsetMate={offset}
                  setMateValues={setMateValues}
                  setAngle={setAngle}
                  setOffset={setOffset}
                />
              </Paper>
              </Box>
            )
           
          }
          {(selectedObjects) && (selectedObjects.length >= 1) && (
            <>
          <Box>
            {renderTitle("Geometric Dimensioning and Tolerancing")}             
            <Paper className={classes.paper}>
              <SelectedGDTMenu
                features={(selectedOption != SELECTASSEMBLY)}
                featureList={(selectedOption != SELECTASSEMBLY) ? selectedObjects : parentObjects}
                setRowKeyValue={setRowKeyValue}
              />
            </Paper >
          </Box>
          <Box>
            {renderTitle("Feature Identification")}
            <Paper className={classes.paper}>
              <SelectedFeatureMenu
                features={(selectedOption != SELECTASSEMBLY)}
                featureList={(selectedOption != SELECTASSEMBLY) ? selectedObjects : parentObjects}
                setRowKeyValue={setRowKeyValue}
              />
            </Paper >
          </Box>
          </>
          )}
          <Box>
            {renderTitle("Summary Table",true)}
            <Paper className={classes.paper}>
              <SelectedSummaryTable
                features={(selectedOption != SELECTASSEMBLY)}
                featureList={(selectedOption != SELECTASSEMBLY) ? selectedObjects : parentObjects}
                activeDataTable={activeDataTable}
                setActiveDataTable={setActiveDataTable}
                setCurrentDataTable={setCurrentDataTable}
                gltfjson={gltfjson}
                mateValues={mateValues}
              />
            </Paper >
          </Box>
      </Box>
    </>
  );
}
