import React /*, { useState, useEffect }*/ from 'react';
import { /*Grid,*/ Paper } from '@material-ui/core';
import {
  SELECTSOLID,
  SELECTEDGE,
  SELECTMEASURE,
  SELECTDISECTPARTS,
  SELECTASSEMBLY,
  SELECTFEATURE
} from '@monostruct/common/gltf/Tree/utils';

import Button from '@material-ui/core/Button';
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
import ShowLoadingProgressBar from './ShowLoadingProgressBar';
import { USESTYLES } from '@monostruct/common/gltf/Tree/utils';

import DynamicFeature from './DynamicFeature';

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
  setOffset,
  isProgressOpen,
  progressOpenedFiles,
  setIsProgressOpen,
  setProgressOpenedFiles,
  internalProductConfig
}) {
  const classes = USESTYLES();

  const renderButtons = () => {
    return (
      <div>
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
        >
          {' '}
          Save Selections
        </Button>
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
        >
          {' '}
          Reset Selections
        </Button>
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
        >
          {' '}
          Add a Grouper ID
        </Button>
      </div>
    );
  };

  const renderToolBarButtons = () => {
    if (toolbar && splitMethod != 0) {
      return (
        <Paper className={`${classes.flexpaper} ${classes.toolbarContainer}`}>
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

  const getFeatureListForGDT = () => {
    return selectedOption != SELECTASSEMBLY ? selectedObjects : parentObjects;
  };

  const getSelectedFeaturePosition = () => {
    const list = getFeatureListForGDT();

    const feature = list.find((row) => row.kind === 'Circle');
    return feature ? feature.fill : feature;
  };

  console.log('-----------selectedObjects------', selectedObjects);

  return (
    <>
      <Box style={{ flex: 1 }}>
        {/*renderToolBarButtons()*/}
        {isProgressOpen && (
          <SectionContainer>
            <ShowLoadingProgressBar
              isProgressOpen={isProgressOpen}
              progressOpenedFiles={progressOpenedFiles}
              setIsProgressOpen={setIsProgressOpen}
              setProgressOpenedFiles={setProgressOpenedFiles}
            />
          </SectionContainer>
        )}
        {selectedObjects && selectedObjects.length >= 1 && (
          <div align={'center'}>{renderButtons()}</div>
        )}
        <SectionContainer title={'Current Selection'}>
          <SelectedSummaryTable
            features={selectedOption != SELECTASSEMBLY}
            featureList={
              selectedOption != SELECTASSEMBLY ? selectedObjects : parentObjects
            }
            activeDataTable={activeDataTable}
            setActiveDataTable={setActiveDataTable}
            setCurrentDataTable={setCurrentDataTable}
            gltfjson={gltfjson}
            mateValues={mateValues}
          />
        </SectionContainer>

        {selectedObjects &&
          selectedObjects.length >= 2 &&
          selectedOption != SELECTSOLID &&
          selectedOption != SELECTASSEMBLY && (
            <SectionContainer title={'Assembly Mates'}>
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
            </SectionContainer>
          )}
        {selectedObjects && selectedObjects.length >= 1 && (
          <>
            <SectionContainer
              title={'GD&T and Features'}
              paperStyle={{ display: 'flex', flexDiraction: 'column' }}
            >
              <DynamicFeature selectedPosition={getSelectedFeaturePosition()} />
            </SectionContainer>
            {/* <SectionContainer
              title={'Geometric Dimensioning and Tolerance'}
              paperStyle={{ display: 'flex', flexDiraction: 'column' }}
            >
              <SelectedGDTMenu
                features={selectedOption != SELECTASSEMBLY}
                featureList={getFeatureListForGDT()}
                setRowKeyValue={setRowKeyValue}
              />
            </SectionContainer>

            <SectionContainer title={'Feature Identification'}>
              <SelectedFeatureMenu
                features={selectedOption != SELECTASSEMBLY}
                featureList={getFeatureListForGDT()}
                setRowKeyValue={setRowKeyValue}
              />
            </SectionContainer> */}
          </>
        )}
      </Box>
    </>
  );
}

const SectionContainer = (props) => {
  const classes = USESTYLES();
  return (
    <Box style={{ marginTop: 20 }}>
      <Paper
        className={classes.flexpaper}
        style={{ ...props.paperStyle, flexDirection: 'column' }}
      >
        {props.title && <SubSectionTitle>{props.title}</SubSectionTitle>}
        {props.children}
      </Paper>
    </Box>
  );
};

const SubSectionTitle = ({ children }) => {
  return (
    <div
      style={{
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 20,
        display: 'flex'
      }}
      align="center"
    >
      {children}
    </div>
  );
};
