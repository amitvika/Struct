import React, { useState, useEffect } from "react";

import ThreejsViewModal from './ThreejsViewModal'
import AddLineItem from './AddLineItem';
import AddLineItemToAssembly from './AddLineItemToAssembly';
import ConfigureItemAssembly from './ConfigureItemAssemblyModal';
import ItemSelectionModal from './ItemSelectionModal';

export default function Assembly(props) {
  const [assemblyProcessData, setAssemblyProcessData] = useState('');
  const [isThreejsVisible, setIsThreejsVisible] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);


  const addItemToAssembly = () => {
    console.log('Hello World');
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
