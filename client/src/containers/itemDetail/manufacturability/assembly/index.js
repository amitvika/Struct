import React, { useState, useEffect } from "react";
import {
	Button
} from "@material-ui/core";

import ThreejsViewModal from './ThreejsViewModal'
import AddLineItem from './AddLineItem';
import AssemblySequenceNumber from './AssemblySequenceNumber';
import ConfigureItemAssembly from './ConfigureItemAssemblyModal';
import ItemSelectionModal from './ItemSelectionModal';
import ProcessAPI from '../../../../api/process.api';

export default function Assembly(props) {
	const [assemblyProcessData, setAssemblyProcessData] = useState('');
	const [isThreejsVisible, setIsThreejsVisible] = useState(false);

	const [assemblySequenceList, setAssemblySequenceList] = useState([]);
	const [selectedAssemblySequence, setSelectedAssemblySequence] = useState(null);
	const [isAssemblySequenceSynced, setIsAssemblySequenceSynced] = useState(true);

	useEffect(() => {
		ProcessAPI.getProcessData(props.processId)
			.then(res => {
				if (res.data) {
					setAssemblyProcessData(res.data)
				}

				if (res.data.assemblySequences) {
					setAssemblySequenceList(res.data.assemblySequences)
				}
			})
			.catch(error => {

			})

	}, [props.processId]);

	const addItemToAssembly = () => {

		let maxCount = 0;
		if (assemblySequenceList.length > 0) {
			maxCount = Math.max.apply(Math, assemblySequenceList.map(function (o) { return o.orderNumber; }))
		}

		const updateAssemblySequence = [...assemblySequenceList, { orderNumber: maxCount + 1 }]

		syncProcessData({ assemblySequences: updateAssemblySequence });
	}

	const deleteAssemblySequence = (sequenceId) => {
		const updateAssemblySequence = assemblySequenceList
			.filter(sequence => sequence._id !== sequenceId)
			.map((sequence, index) => ({ ...sequence, orderNumber: index + 1 }));

		syncProcessData({ assemblySequences: updateAssemblySequence });
	}


	const handleUpdateAssemblySequence = (updatedData) => {
		const updateAssemblySequence = assemblySequenceList
			.map(sequence => {
				if (sequence._id === selectedAssemblySequence._id) {
					return { ...sequence, ...updatedData };
				}
				else {
					return sequence
				}
			});


		setSelectedAssemblySequence(prevState => ({ ...prevState, ...updatedData }))
		setAssemblySequenceList(updateAssemblySequence)
		setIsAssemblySequenceSynced(false);
	}

	const syncProcessData = (updatedData) => {
		if (updatedData.assemblySequences) {
			updatedData.assemblySequences = updatedData?.assemblySequences
				.map(sequenceItem => ({ ...sequenceItem, itemId: sequenceItem?.itemId?._id }))
		}
		else {
			updatedData.assemblySequences = [];
		}
		ProcessAPI.updateProcessData(props.processId, updatedData)
			.then(res => {
				console.log('Response', res)
				if (res.data) {
					setAssemblyProcessData(res.data)
				}

				if (res.data.assemblySequences) {
					setAssemblySequenceList(res.data.assemblySequences)
					setIsAssemblySequenceSynced(true);
				}
			})
			.catch(error => {
				console.log('error', error)
			})
	}

	const [isConfigureItemAssemblyModalOpen, setIsConfigureItemAssemblyModalOpen] = useState(false);

	const toggleConfigureItemAssembly = (assemblySequence) => {

		if (!isAssemblySequenceSynced) {
			syncProcessData({ assemblySequences: assemblySequenceList })
		}

		if (isConfigureItemAssemblyModalOpen) {
			setSelectedAssemblySequence(null);
		}
		else {
			setSelectedAssemblySequence(assemblySequence);
		}
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

			<AddLineItem
				{...props}
				assemblyProcessData={assemblyProcessData} />

			{
				assemblySequenceList.map(asnItem => {
					return (
						<AssemblySequenceNumber
							data={asnItem}
							toggleConfigureItemAssembly={toggleConfigureItemAssembly}
							isConfigureItemAssemblyModalOpen={isConfigureItemAssemblyModalOpen}
							deleteAssemblySequence={deleteAssemblySequence}
							handleUpdateAssemblySequence={handleUpdateAssemblySequence}
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
