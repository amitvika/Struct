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
import Box from '@material-ui/core/Box';

import SelectedFeatureMenu from './SelectedFeatureMenu';
import SelectedMatesRelation from './SelectedMatesRelation';

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
  setCtrlKey,
  toolbar,
}) {
  const classes = useStyles();

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
      <Box style={{ flex: 1 }}>
        {renderToolBarButtons()}

        <Box className={classes.tableContainer}>
          <Paper className={classes.paper}>
            <SelectedFeatureMenu
              features={selectedOption != SELECTASSEMBLY}
              featureList={
                selectedOption != SELECTASSEMBLY
                  ? selectedObjects
                  : parentObjects
              }
            />
          </Paper>
          {selectedObjects?.length >= 2 &&
            selectedOption != SELECTSOLID &&
            selectedOption != SELECTASSEMBLY && (
              <Paper className={classes.paper}>
                <SelectedMatesRelation
                  mates={mates}
                  featureList={selectedObjects}
                />
              </Paper>
            )}
        </Box>
      </Box>
    </>
  );
}
