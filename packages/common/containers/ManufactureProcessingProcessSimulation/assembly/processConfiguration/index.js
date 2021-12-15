import React, { useState, useEffect } from 'react';
import { Button, Paper } from '@mui/material';

import makeStyles from '@mui/styles/makeStyles';

import ThreejsViewModal from './ThreejsViewModal';
import AddLineItem from './AddLineItem';
import AssemblySequenceNumber from './AssemblySequenceNumber';
import ConfigureItemAssembly from './ConfigureItemAssemblyModal';
import ItemSelectionModal from './ItemSelectionModal';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    marginTop: 10,
    marginBottom: 10
  }
}));

export default function Assembly({
  assemblyManufactureValues,
  handleAssemblyManufactureChange
}) {
  const classes = useStyles();

  const assemblyProcessData =
    assemblyManufactureValues.processConfiguration || {};

  const [isThreejsVisible, setIsThreejsVisible] = useState(false);

  const [assemblySequenceList, setAssemblySequenceList] = useState([]);
  const [selectedAssemblySequence, setSelectedAssemblySequence] =
    useState(null);
  const [isAssemblySequenceSynced, setIsAssemblySequenceSynced] =
    useState(true);

  useEffect(() => {
    if (assemblyManufactureValues?.processConfiguration?.assemblySequences) {
      setAssemblySequenceList(
        assemblyManufactureValues.processConfiguration.assemblySequences
      );
    }
  }, [assemblyManufactureValues]);

  const addItemToAssembly = () => {
    let maxCount = 0;
    if (assemblySequenceList.length > 0) {
      maxCount = Math.max.apply(
        Math,
        assemblySequenceList.map(function (o) {
          return o.orderNumber;
        })
      );
    }

    const updateAssemblySequence = [
      ...assemblySequenceList,
      { orderNumber: maxCount + 1 }
    ];

    syncProcessData({ assemblySequences: updateAssemblySequence });
  };

  const deleteAssemblySequence = (sequenceId) => {
    const updateAssemblySequence = assemblySequenceList
      .filter((sequence) => sequence._id !== sequenceId)
      .map((sequence, index) => ({ ...sequence, orderNumber: index + 1 }));

    syncProcessData({ assemblySequences: updateAssemblySequence });
  };

  const handleUpdateAssemblySequence = (updatedData) => {
    const updateAssemblySequence = assemblySequenceList.map((sequence) => {
      if (sequence._id === selectedAssemblySequence._id) {
        return { ...sequence, ...updatedData };
      } else {
        return sequence;
      }
    });

    setSelectedAssemblySequence((prevState) => ({
      ...prevState,
      ...updatedData
    }));
    setAssemblySequenceList(updateAssemblySequence);
    setIsAssemblySequenceSynced(false);
  };

  const syncProcessData = (updatedData) => {
    if (updatedData.assemblySequences) {
      updatedData.assemblySequences = updatedData?.assemblySequences.map(
        (sequenceItem) => ({
          ...sequenceItem,
          itemId: sequenceItem?.itemId?._id
        })
      );
    } else {
      updatedData.assemblySequences = [];
    }
    handleAssemblyManufactureChange({ processConfiguration: updatedData });
  };

  const [
    isConfigureItemAssemblyModalOpen,
    setIsConfigureItemAssemblyModalOpen
  ] = useState(false);

  const toggleConfigureItemAssembly = (assemblySequence) => {
    if (!isAssemblySequenceSynced) {
      syncProcessData({ assemblySequences: assemblySequenceList });
    }

    if (isConfigureItemAssemblyModalOpen) {
      setSelectedAssemblySequence(null);
    } else {
      setSelectedAssemblySequence(assemblySequence);
    }
    setIsConfigureItemAssemblyModalOpen(!isConfigureItemAssemblyModalOpen);
  };

  const [isItemSelectionModalOpen, setIsItemSelectionModalOpen] =
    useState(false);
  const toggleItemSelection = () => {
    setIsItemSelectionModalOpen(!isItemSelectionModalOpen);
  };

  return (
    <div>
      {/* <ThreejsViewModal
				isVisible={isThreejsVisible}
				setIsThreejsVisible={setIsThreejsVisible}
				assemblyProcessData={assemblyProcessData} /> */}

      <ConfigureItemAssembly
        toggleConfigureItemAssembly={toggleConfigureItemAssembly}
        isConfigureItemAssemblyModalOpen={isConfigureItemAssemblyModalOpen}
        toggleItemSelection={toggleItemSelection}
        handleUpdateAssemblySequence={handleUpdateAssemblySequence}
        selectedAssemblySequence={selectedAssemblySequence}
      />

      <ItemSelectionModal
        selectedAssemblySequence={selectedAssemblySequence}
        toggleItemSelection={toggleItemSelection}
        isItemSelectionModalOpen={isItemSelectionModalOpen}
        handleUpdateAssemblySequence={handleUpdateAssemblySequence}
      />
      {/* 
			<AddLineItem
				{...props}
				assemblyProcessData={assemblyProcessData} /> */}

      {assemblySequenceList.map((asnItem) => {
        return (
          <AssemblySequenceNumber
            data={asnItem}
            toggleConfigureItemAssembly={toggleConfigureItemAssembly}
            isConfigureItemAssemblyModalOpen={isConfigureItemAssemblyModalOpen}
            deleteAssemblySequence={deleteAssemblySequence}
            handleUpdateAssemblySequence={handleUpdateAssemblySequence}
          />
        );
      })}
      <Paper elevation={3} className={classes.paper}>
        <Button
          style={{ width: '100%' }}
          size="large"
          variant="contained"
          color="primary"
          onClick={() => addItemToAssembly()}
        >
          Add Item to Assembly
        </Button>
      </Paper>
    </div>
  );
}
