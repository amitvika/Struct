import React, { useState, useEffect } from 'react';

import ArrowBackIcon from '@material-ui/icons/ArrowBack';

import {
	Paper,
	Typography,
	IconButton,
} from '@material-ui/core';
import { Spinner } from "reactstrap";

import { columnsFields } from '../../../constants/item'
import ItemAPI from '../../../api/items.api';
import ProductOptions from './productOptions'
import { mapItems } from '../../../utils/mapper'
import SelectorView from '../../../components/SelectorView'
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


	// useEffect(() => {
	// 	fetchItems();
	// }, [])

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
					<ProductOptions
					/>
				</> :

				<>
					<SelectorView 
						title={'Product'}
						fetchList={ItemAPI.getItemsAPI}
						selectedListItems={get(clientData, 'linkedItems', [])}
						fields={columnsFields}
						mapValues={mapItems}
					// handleUpdate={(data) => handleClientUpdate({
					// 	...clientData,
					// 	linkedItems: [...clientData.linkedItems, data.id]
					// })} 
					/>
				</>
			}
		</div >
	)

}
