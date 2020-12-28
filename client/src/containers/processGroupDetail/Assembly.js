import React, { useState, useEffect } from "react";

import ThreejsViewModal from './ThreejsViewModal'
import AddLineItem from './AddLineItem';
import AddLineItemToAssembly from './AddLineItemToAssembly';
import ConfigureItemAssembly from './ConfigureItemAssemblyModal';
import ItemSelectionModal from './ItemSelectionModal';
import ProcessAPI from '../../api/process.api';

export default function Assembly(props) {
  const [assemblyProcessData, setAssemblyProcessData] = useState('');
  const [isThreejsVisible, setIsThreejsVisible] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    ProcessAPI.getProcessData(props.processId)
      .then(res => {

      })
      .catch(error => {

      })

  }, []);

  const addItemToAssembly = (itemId) => {
    console.log('addItemToAssembly', props.processId, itemId);

    if (!itemId) {
      return;
    }

    ProcessAPI.updateProcessData(props.processId, { itemId, assembly: 'Multi-Item Assembly' })
      .then(res => {
        console.log('Response', res)
      })
      .catch(error => {
        console.log('error', error)
      })
  }

  const [isConfigureItemAssemblyModalOpen, setIsConfigureItemAssemblyModalOpen] = useState(false);
  const toggleConfigureItemAssembly = () => {
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
        addItemToAssembly={addItemToAssembly} />

      <AddLineItemToAssembly
        toggleConfigureItemAssembly={toggleConfigureItemAssembly}
        isConfigureItemAssemblyModalOpen={isConfigureItemAssemblyModalOpen}
        selectedItems={selectedItems}
      />
      {/* <AssemblyTable */}
      {/* {...props} */}
      {/* // processId={processId} */}
      {/* setIsThreejsVisible={setIsThreejsVisible}
        setAssemblyProcessData={setAssemblyProcessData}
      /> */}
    </div>
  );
}
