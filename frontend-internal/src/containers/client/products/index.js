import React, { useState, useEffect } from 'react';

import Filter from '../../../components/Filter';
import GridView from '../../../components/GridView';
import Headding from '../../../components/atoms/Headding';
import Space from '../../../components/atoms/Space';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

import {
	Grid,
	Paper,
	Typography,
	IconButton,

} from '@material-ui/core';
import { Spinner } from "reactstrap";

import { columnsFields } from '../../../constants/item'
import ItemAPI from '../../../api/items.api';
import ProductOptions from './productOptions'
import { mapItems } from '../../../utils/mapper'
import get from 'lodash/get';

export default function Products({
	clientId,
	handleClientUpdate,
	clientData
}) {
	const [isLoading, setIsLoading] = useState(false);
	const [itemList, setItemList] = useState([]);
	const [filteredItemList, setFilteredItemList] = useState([]);
	const [selectedItems, setSelectedItems] = useState([]);

	const [selectedProduct, setSelectedProduct] = useState({});

	const [isItemSelectionVisible, setIsItemSelectionVisible] = useState(false);

	const onClick = () => setIsItemSelectionVisible(!isItemSelectionVisible);
	const [state, setState] = useState({
		checkedA: true,
	});
	const handleChange = (event) => {
		setState({ ...state, [event.target.name]: event.target.checked });
	};


	useEffect(() => {
		fetchItems();
	}, [])

	const fetchItems = async (query) => {
		try {
			setIsLoading(true);

			const itemRes = await ItemAPI.getItemsAPI()

			if (itemRes && itemRes.data) {
				const items = mapItems(itemRes.data.filter(item => {
					if (clientData.linkedItems) {
						return !clientData.linkedItems.includes(item._id)
					}
					else {
						return true
					}
				}))

				if (clientData.linkedItems) {
					setSelectedItems(mapItems(itemRes.data.filter(item => {
						const data = clientData.linkedItems.includes(item._id);
						if (data) {
							return true
						}
						else {
							return false
						}
					}
					)))
				}

				setItemList(items)
				setFilteredItemList(items)
			}
			setIsLoading(false);

		} catch (error) {
			console.log('Error', error)
		}
	}

	const handleItemClick = (data) => {

		if (isItemSelectionVisible) {
			setFilteredItemList(prevState => {
				let updatedState = prevState.filter(item => item.id != data.id);
				return updatedState;
			});

			setSelectedItems([...selectedItems, data]);
			handleClientUpdate({
				...clientData,
				linkedItems: [...clientData.linkedItems, data.id]
			})
		}
		else {
			setSelectedProduct(data);
		}
	}

	const handleItemRemove = (data) => {
		if (isItemSelectionVisible) {

			setFilteredItemList(prevState => {
				return [data, ...prevState];
			});

			setSelectedItems(prevState => {
				return prevState.filter(item => item.id != data.id);
			});

			handleClientUpdate({
				...clientData,
				linkedItems: clientData.linkedItems.filter(itemId => itemId !== data.id)
			})
		}
		else {
			setSelectedProduct(data);
		}
	}

	const handleProductBreadcrumbSelect = () => {
		setSelectedProduct({});
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
			{Object.keys(selectedProduct).length > 0 ?
				<>
					<Paper style={{ padding: '10px', marginTop: '10px', marginBottom: '10px', display: 'flex' }} >
						<IconButton color="primary" onClick={handleProductBreadcrumbSelect} component="span">
							<ArrowBackIcon />
						</IconButton>
						<Typography
							style={{
								display: 'flex',
								alignItems: 'center',
								fontSize: '20px'
							}}
						>Configure Product: {selectedProduct.name}</Typography>
					</Paper>
					<ProductOptions />
				</> :

				<>
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

					<div style={{ display: 'flex' }}>

						<Headding fontSize={20} title={'Configure Products'} style={{
							fontWeight: 'bold',
							alignItems: 'center',
							display: 'flex'
						}}></Headding>
						<FormGroup style={{ marginLeft: '20px' }}>
							<FormControlLabel
								control={
									<Checkbox
										onClick={onClick}
										checked={state.checkedB}
										onChange={handleChange}
										name="checkedB"
										color="primary"
									/>
								}
								label="Add/Remove Products"
							/>
						</FormGroup>
					</div>

					{
						selectedItems.length > 0 ?
							<>
								<Headding fontSize={20} title={'Selected Products'} style={{ fontWeight: 'bold' }}></Headding>
								<GridView
									list={selectedItems}
									handleHistoryToggle={() => false}
									columnsFields={columnsFields}
									handleTableRowClick={handleItemRemove}
									isHistoryLinkVisible={false}
									isInsideDetailPanel={true}
								/>
							</> :
							<Headding fontSize={20} title={'No product Selected'} style={{ fontWeight: 'bold' }}></Headding>
					}


					{ isItemSelectionVisible &&
						<>
							<Space size={20} />
							<Headding fontSize={20} title={'Choose Product'} style={{ fontWeight: 'bold' }}></Headding>
							<GridView
								list={filteredItemList}
								handleHistoryToggle={() => false}
								columnsFields={columnsFields}
								handleTableRowClick={handleItemClick}
								isHistoryLinkVisible={false}
								isInsideDetailPanel={true}
							/>
						</>}

				</>
			}
		</div >
	)

}
