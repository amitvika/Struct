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
  const [selectedItems, setSelectedItems] = useState([]);
  const [assemblySequenceNumber, setAssemblySequenceNumber] = useState([]);
  const [selectedAssemblySequence, setSelectedAssemblySequence] = useState('');

  useEffect(() => {
    ProcessAPI.getProcessData(props.processId)
      .then(res => {
        if (res.data) {
          setAssemblyProcessData(res.data)
        }

        if (res.data.assemblySequenceNumber) {
          setAssemblySequenceNumber(res.data.assemblySequenceNumber)
        }
      })
      .catch(error => {

      })

  }, []);

  const addItemToAssembly = () => {
    const updateAssemblySequence = [...assemblySequenceNumber, { orderNumber: assemblySequenceNumber.length + 1 }]

    ProcessAPI.updateProcessData(props.processId, { assemblySequenceNumber: updateAssemblySequence })
      .then(res => {
        console.log('Response', res)
        if (res.data) {
          setAssemblyProcessData(res.data)
        }

        if (res.data.assemblySequenceNumber) {
          setAssemblySequenceNumber(res.data.assemblySequenceNumber)
        }
      })
      .catch(error => {
        console.log('error', error)
      })
  }

  const [isConfigureItemAssemblyModalOpen, setIsConfigureItemAssemblyModalOpen] = useState(false);
  const toggleConfigureItemAssembly = (assemblySequenceId) => {
    setSelectedAssemblySequence(assemblySequenceId)
    setIsConfigureItemAssemblyModalOpen(!isConfigureItemAssemblyModalOpen);
  }

  const [isItemSelectionModalOpen, setIsItemSelectionModalOpen] = useState(false);
  const toggleItemSelection = () => {
    setIsItemSelectionModalOpen(!isItemSelectionModalOpen)
  }

  return (
    <div>
      <ThreejsViewModal
        isVisible={isThreejsVisible}
        setIsThreejsVisible={setIsThreejsVisible}
        assemblyProcessData={assemblyProcessData} />

      <ConfigureItemAssembly
        toggleConfigureItemAssembly={toggleConfigureItemAssembly}
        isConfigureItemAssemblyModalOpen={isConfigureItemAssemblyModalOpen}
        selectedItems={selectedItems}
        setSelectedItems={setSelectedItems}
        toggleItemSelection={toggleItemSelection}
      />

      <ItemSelectionModal
        toggleItemSelection={toggleItemSelection}
        isItemSelectionModalOpen={isItemSelectionModalOpen}
        selectedItems={selectedItems}
        setSelectedItems={setSelectedItems}
      />

      <AddLineItem
        {...props}
        assemblyProcessData={assemblyProcessData} />

      {
        assemblySequenceNumber.map(asnItem => {
          return (
            <AssemblySequenceNumber
              data={asnItem}
              toggleConfigureItemAssembly={toggleConfigureItemAssembly}
              isConfigureItemAssemblyModalOpen={isConfigureItemAssemblyModalOpen}
              selectedItems={selectedItems}
            />
          )
        })
      }
      <Button
        style={{ margin: '10px' }}
        size="large"
        variant="contained"
        color="primary"
        onClick={() => addItemToAssembly()}>
        Add Item to Assembly
            </Button>


    </div>
  );
}
