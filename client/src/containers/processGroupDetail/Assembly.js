import React, { useState, useEffect } from "react";
import {
  Button
} from "@material-ui/core";

import ThreejsViewModal from './ThreejsViewModal'
import AddLineItem from './AddLineItem';
import AssemblySequenceNumber from './AssemblySequenceNumber';
import ConfigureItemAssembly from './ConfigureItemAssemblyModal';
import ItemSelectionModal from './ItemSelectionModal';
import ProcessAPI from '../../api/process.api';

export default function Assembly(props) {
  const [assemblyProcessData, setAssemblyProcessData] = useState('');
  const [isThreejsVisible, setIsThreejsVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState({});
  const [assemblySequenceNumbers, setAssemblySequenceNumbers] = useState([]);
  const [assemblySequenceId, setAssemblySequenceId] = useState('');

  useEffect(() => {
    ProcessAPI.getProcessData(props.processId)
      .then(res => {
        if (res.data) {
          setAssemblyProcessData(res.data)
        }

        if (res.data.assemblySequenceNumber) {
          setAssemblySequenceNumbers(res.data.assemblySequenceNumber)
        }
      })
      .catch(error => {

      })

  }, [props.processId]);

  const addItemToAssembly = () => {

    let maxCount = 0;
    if (assemblySequenceNumbers.length > 0) {
      maxCount = Math.max.apply(Math, assemblySequenceNumbers.map(function (o) { return o.orderNumber; }))
    }

    const updateAssemblySequence = [...assemblySequenceNumbers, { orderNumber: maxCount + 1 }]

    ProcessAPI.updateProcessData(props.processId, { assemblySequenceNumber: updateAssemblySequence })
      .then(res => {
        console.log('Response', res)
        if (res.data) {
          setAssemblyProcessData(res.data)
        }

        if (res.data.assemblySequenceNumber) {
          setAssemblySequenceNumbers(res.data.assemblySequenceNumber)
        }
      })
      .catch(error => {
        console.log('error', error)
      })
  }

  const deleteAssemblySequence = (sequenceId) => {
    const updateAssemblySequence = assemblySequenceNumbers
      .filter(sequence => sequence._id !== sequenceId)
      .map((sequence, index) => ({ ...sequence, orderNumber: index+1 }));

    ProcessAPI.updateProcessData(props.processId, { assemblySequenceNumber: updateAssemblySequence })
      .then(res => {
        console.log('Response', res)
        if (res.data) {
          setAssemblyProcessData(res.data)
        }

        if (res.data.assemblySequenceNumber) {
          setAssemblySequenceNumbers(res.data.assemblySequenceNumber)
        }
      })
      .catch(error => {
        console.log('error', error)
      })
  }

  const [isConfigureItemAssemblyModalOpen, setIsConfigureItemAssemblyModalOpen] = useState(false);
  const toggleConfigureItemAssembly = (sequenceId) => {
    if (sequenceId !== assemblySequenceId) {
      setSelectedItem({});
    }

    setAssemblySequenceId(sequenceId);
    setIsConfigureItemAssemblyModalOpen(!isConfigureItemAssemblyModalOpen);

  }

  const [isItemSelectionModalOpen, setIsItemSelectionModalOpen] = useState(false);
  const toggleItemSelection = () => {
    setIsItemSelectionModalOpen(!isItemSelectionModalOpen)
  }

  useEffect(() => {

    if (assemblySequenceId) {
      setAssemblySequenceNumbers(assemblySequenceNumbers.map(item => {
        if (item._id === assemblySequenceId) {
          return { ...item, itemId: selectedItem }
        }
        return item;
      }))
    }

  }, [selectedItem])

  return (
    <div>
      <ThreejsViewModal
        isVisible={isThreejsVisible}
        setIsThreejsVisible={setIsThreejsVisible}
        assemblyProcessData={assemblyProcessData} />

      <ConfigureItemAssembly
        toggleConfigureItemAssembly={toggleConfigureItemAssembly}
        isConfigureItemAssemblyModalOpen={isConfigureItemAssemblyModalOpen}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        toggleItemSelection={toggleItemSelection}
      />

      <ItemSelectionModal
        toggleItemSelection={toggleItemSelection}
        isItemSelectionModalOpen={isItemSelectionModalOpen}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
      />

      <AddLineItem
        {...props}
        assemblyProcessData={assemblyProcessData} />

      {
        assemblySequenceNumbers.map(asnItem => {
          return (
            <AssemblySequenceNumber
              data={asnItem}
              toggleConfigureItemAssembly={toggleConfigureItemAssembly}
              isConfigureItemAssemblyModalOpen={isConfigureItemAssemblyModalOpen}
              deleteAssemblySequence={deleteAssemblySequence}
            />
          )
        })
      }
      <div style={{ margin: '10px' }}>

        <Button
          style={{ width: '100%' }}
          size="large"
          variant="contained"
          color="primary"
          onClick={() => addItemToAssembly()}>
          Add Item to Assembly
            </Button>
      </div>
    </div>
  );
}
