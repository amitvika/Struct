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
// import ProductOptions from './productOptions'
import ProductOptions from './productOptions'

import { mapItems } from '../../../utils/mapper'
import SelectorView from '../../../components/SelectorView'
import get from 'lodash/get';





export default function IncomingVendorProducts({
	clientId,
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
						>Orders</Typography>
					</Paper>
					<ProductOptions
					/>
				</> :
				<>
					<SelectorView
						title={'Product'}
						fetchList={ItemAPI.getItemsAPI}
						alreadySelected={get(clientData, 'linkedItems', [])}
						fields={columnsFields}
						mapValues={mapItems}
						handleUpdate={(data) => false}
						handleSelection={(data) => setSelectedProduct(data)}
					/>
				</>
			}
		</div >
	)

}
