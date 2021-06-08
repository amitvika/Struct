import React, { useState, useEffect } from 'react';

import ArrowBackIcon from '@material-ui/icons/ArrowBack';

import {
	Paper,
	Typography,
	IconButton,
} from '@material-ui/core';
import { Spinner } from "reactstrap";

import SelectorView from '@ravibasil/common/components/SelectorView';
import ItemAPI from '@ravibasil/common/api/items.api';
import { columnsFields } from '../../../constants/item'
import ProductOptions from './productOptions'
import { mapItems } from '../../../utils/mapper'
import get from 'lodash/get';

export default function Products({
	clientId,
	handleClientUpdate,
	clientData
}) {
	const [isLoading, setIsLoading] = useState(false);

	const [selectedProduct, setSelectedProduct] = useState({});

	const [isItemSelectionVisible, setIsItemSelectionVisible] = useState(false);

	// const onClick = () => setIsItemSelectionVisible(!isItemSelectionVisible);
	const [state, setState] = useState({
		checkedA: true,
	});
	const handleChange = (event) => {
		setState({ ...state, [event.target.name]: event.target.checked });
	};

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

	const fetchSelectedList = () => {
		return new Promise((resole, reject) => {
			resole(get(clientData, 'linked_items', []));
		})
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
						fetchSelectedList={fetchSelectedList}
						fields={columnsFields}
						mapValues={mapItems}
						handleUpdate={(data) => handleClientUpdate({
							...clientData,
							linked_items: data
						})}
						handleSelection={(data) => setSelectedProduct(data)}
					/>
				</>
			}
		</div >
	)

}
