import React, { useState, useEffect } from 'react';

import Filter from '@ravibasil/common/components/TableGridView/Filter';
import GridView from '@ravibasil/common/components/TableGridView/GridView';
import Headding from '@ravibasil/common/components/atoms/Headding'
import Space from '@ravibasil/common/components/atoms/Space';

import {
	Grid,
	Typography,
	makeStyles,
	Paper,
} from '@material-ui/core';
import { Spinner } from "reactstrap";

import { columnsFields } from '../../../constants/client'
import API from '@ravibasil/common/api/clients.api';


export default function ClientSetup({
	itemProperties,
	setItemProperties
}) {
	const [isLoading, setIsLoading] = useState(false);

	const [clientList, setClientList] = useState([]);
	const [selectedClient, setSelectedClient] = useState({});
	const [filteredClientList, setFilteredClientList] = useState([]);

	useEffect(() => {
		fetchClientList();
	}, []);

	const fetchClientList = async () => {
		try {
			setIsLoading(true);

			const clientRes = await API.fetchClientsApi();

			if (clientRes && clientRes.data) {
				const clients = clientRes.data.map((x, index) => {
					return {
						id: x._id,
						name: x.name,
						created_by: x.createdByUserId.name,
						deleted_at: x.deletedAt
					}
				})
				setClientList(clients)
				setFilteredClientList(clients)

				if (itemProperties.selectedClientId) {
					const selectedClient = clients.find(client => client.id === itemProperties.selectedClientId);
					setSelectedClient(selectedClient);

					setClientList(clients.filter(client => client.id !== itemProperties.selectedClientId))
					setFilteredClientList(clients.filter(client => client.id !== itemProperties.selectedClientId))
				}
				else {
					setClientList(clients)
					setFilteredClientList(clients)
				}
			}
			setIsLoading(false);

		} catch (error) {
			console.log(error)
		}
	};

	const handleClientSelect = (data) => {
		setFilteredClientList(prevState => {
			let updatedState = prevState.filter(client => client.id != data.id);
			return updatedState;
		});

		setSelectedClient(data)
		setItemProperties(prevState => ({ ...prevState, selectedClientId: data.id }))
	}

	const handleClientRemove = (data) => {
		setFilteredClientList(preMaterialList => {
			return [data, ...preMaterialList];
		});
		setSelectedClient({});
		setItemProperties(prevState => ({ ...prevState, selectedClientId: null }))
	}

	if (isLoading) {
		return (<div
			style={{
				display: "flex",
				justifyContent: "center"
			}}
		>
			<Spinner animation="border" />
		</div>)
	}

	return (
		<div>
			{/* Filter section */}
			<Paper style={{ padding: '10px', marginTop: '10px', marginBottom: '10px' }} >
				<Grid container>
					<Filter
						list={clientList}
						filteredList={filteredClientList}
						setFilteredList={setFilteredClientList}
						columnsFields={columnsFields}
					/>
				</Grid>
			</Paper>
			<Space size={20} />

			<Headding fontSize={20} title={'Selected Client'} style={{ fontWeight: 'bold' }}></Headding>
			<GridView
				list={Object.keys(selectedClient).length > 0 ? [selectedClient] : []}
				handleHistoryToggle={() => false}
				columnsFields={columnsFields}
				handleTableRowClick={handleClientRemove}
				isHistoryLinkVisible={false}
			/>

			<Space size={20} />
			<Headding fontSize={20} title={'Choose Client'} style={{ fontWeight: 'bold' }}></Headding>
			<GridView
				list={filteredClientList}
				handleHistoryToggle={() => false}
				columnsFields={columnsFields}
				handleTableRowClick={handleClientSelect}
				isHistoryLinkVisible={false}
			/>
		</div>
	)
}
