import React, { useState, useEffect } from 'react';

import Filter from '../../../components/Filter';
import GridView from '../../../components/GridView';
import Headding from '../../../components/atoms/Headding';
import Space from '../../../components/atoms/Space';

import {
	Grid,
	Paper, 
	Typography,
	Breadcrumbs
} from '@material-ui/core';
import { Spinner } from "reactstrap";

import { columnsFields } from '../../../constants/item'
import ItemAPI from '../../../api/items.api'

export default function Products({
	clientId
}) {
	const [isLoading, setIsLoading] = useState(false);
	const [itemList, setItemList] = useState([]);
	const [filteredItemList, setFilteredItemList] = useState([]);
	const [selectedItem, setSelectedItem] = useState({});

	useEffect(() => {
		fetchItems();
	}, [])

	const fetchItems = async (query) => {
		try {
			setIsLoading(true);

			const itemRes = await ItemAPI.filterItemsAPI(`client_id=${clientId}`)

			if (itemRes && itemRes.data) {
				const items = itemRes.data.map((item, index) => {
					return {
						id: item._id,
						name: item.name,
						source: item?.vendorId?.name || 'STRUCT',
						assemblyType: item.assemblyType
					}
				})

				setItemList(items)
				setFilteredItemList(items)
			}
			setIsLoading(false);

		} catch (error) {
			console.log('Error', error)
		}
	}

	const handleItemClick = (data) => {
		setSelectedItem(data);
	}

	const handleProductBreadcrumbSelect = () => {
		setSelectedItem({});
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
			{/* Breadcrum */}
			{Object.keys(selectedItem).length > 0 &&
				<Paper style={{ padding: '10px', marginTop: '10px', marginBottom: '10px', display: 'flex' }} >
					<Breadcrumbs aria-label="breadcrumb">
						<Typography color="inherit" onClick={handleProductBreadcrumbSelect}>Products</Typography>
						<Typography color="primary" aria-current="page">Product Options: {selectedItem.name}</Typography>
					</Breadcrumbs>
				</Paper>
			}

			<Space size={20} />

			{/* Filter section */}
			<Paper style={{ padding: '10px', marginTop: '10px', marginBottom: '10px' }} >
				<Grid container>
					<Filter
						list={itemList}
						filteredList={filteredItemList}
						setFilteredList={setFilteredItemList}
						columnsFields={columnsFields}
					/>
				</Grid>
			</Paper>
			<Space size={20} />

			<Headding fontSize={20} title={'Client used in following Items'} style={{ fontWeight: 'bold' }}></Headding>
			<GridView
				list={filteredItemList}
				handleHistoryToggle={() => false}
				columnsFields={columnsFields}
				handleTableRowClick={handleItemClick}
				isHistoryLinkVisible={false}
			/>
		</div>
	)

}
