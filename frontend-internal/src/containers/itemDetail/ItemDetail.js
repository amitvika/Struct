import React, { useState, useEffect } from "react";
import {
	Snackbar,
	Button,
	Paper,
	Tab,
	Tabs,
	Box,
	Grid,
	Breadcrumbs,
	Typography,
	CircularProgress
} from "@material-ui/core";
import MuiAlert from '@material-ui/lab/Alert';
import { NavLink, useParams } from "react-router-dom";
import { useDispatch } from 'react-redux';

import BaseItemProperties from './baseItemProperties';
import GeometricDimensioning from './geometricDimensioning';
import CurrentUsage from './CurrentUsage';
import VendorDetails from './VendorDetails';
import Manufacturing from '../manufacture/index2'
import ClientSetup from './clientSetup';

import ItemTypeConfigurations from './ItemTypeConfigurations';
import ItemAPI from '../../api/items.api';
import { showErrorAlert, showSuccessAlert } from '../../actions/alert.action';
import get from 'lodash/get';

function Alert(props) {
	return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const ItemDetail = () => {
	const dispatch = useDispatch()

	const [value, setValue] = useState(1);
	let { id } = useParams();
	const [itemProperties, setItemProperties] = useState({});
	const [isLoading, setIsLoading] = useState(true);
	const [itemDetail, setItemDetail] = useState({});
	const [threejsData, setThreejsData] = useState({});
	const [snackbarOptions, setSnackbarOptions] = useState({ isOpen: false, message: '' });

	useEffect(() => {
		(async () => {
			setIsLoading(true);
			const itemDetailResponse = await ItemAPI.getItemsAPI(`id=${id}`)
			// setItemDetail(get(itemDetailResponse, 'data[0]', {}));

			// const itemGeometryResponse = await ItemAPI.getItemAPI(id)
			// if (itemGeometryResponse.data) {
			setItemProperties(get(itemDetailResponse, 'data[0]', {}));
			// setThreejsData(itemGeometryResponse.data)
			// }

			setIsLoading(false);
		})()
	}, []);

	const renderPageSwitch = (index) => {
		switch (index) {
			case 0:
				return "Add vendor items here";
			case 1:
				return <BaseItemProperties itemId={id} itemProperties={itemProperties} setItemProperties={setItemProperties} threejsData={threejsData} />;
			case 2:
				return <GeometricDimensioning />
			case 3:
				return <CurrentUsage itemId={id} />
			case 4:
				return <ItemTypeConfigurations itemId={id} itemProperties={itemProperties} setItemProperties={setItemProperties} />
			case 5:
				return <VendorDetails />
			case 6:
				return <Manufacturing itemId={id} />;
			case 7:
				return <ClientSetup itemProperties={itemProperties} setItemProperties={setItemProperties} />;
			default:
				return "Undefined Tab Index";
		}
	}

	const handleSave = () => {
		// setIsLoading(true);
		itemProperties.step = undefined;
		itemProperties.itemId = undefined;
		ItemAPI
			.updateItemAPI(id, { ...itemProperties })
			.then(res => {
				setItemProperties(res.data);
				dispatch(showSuccessAlert({ message: 'All data is saved' }));
			})
			.catch(error => {
				dispatch(showErrorAlert({ message: 'Unable to save info' }));
			})
	}

	const handleSnackbarClose = () => {
		setSnackbarOptions({ isOpen: false })
	}

	if (isLoading) {
		return <CircularProgress />;
	}

	return (
		<>
			<Grid container>
				<Grid item sm sm={12}>
					<Paper style={{ padding: 20, margin: 10 }}>
						<Breadcrumbs
							style={{
								display: "flex",
								justifyContent: "center"
							}}
						>
							<NavLink
								to='/items'>
								Items
              </NavLink>

							<Typography color="textPrimary">Item Details</Typography>
						</Breadcrumbs>
					</Paper>
					<Paper style={{ padding: 10, margin: 10 }}>
						<h4>Item Name: {itemProperties.name}</h4>
						<p>Item ID:{id}</p>
					</Paper>
				</Grid>
				<Grid item sm={2}>
					<Paper style={{ padding: 20, margin: 10 }}>
						<Tabs
							orientation="vertical"
							variant="scrollable"
							value={value}
							onChange={(event, newValue) => setValue(newValue)}>
							<Tab label="Base Item Properties" value={1} />
							{
								// itemProperties?.itemGeometry?.isEndProductSelected &&
								// <Tab label="Client Setup" value={7} />
							}

							{
								itemProperties?.itemGeometry?.itemType && <Tab label="Geometric Dimensioning and Tolerances" value={2} />
							}
							<Tab label="Current Usage" value={3} />
							<Tab label="Item Type Configurations" value={4} />
							{
								itemProperties.vendorId && <Tab label="Vendor Details" value={5} />
							}

							<Tab label="Manufacture & processing" value={6} />


						</Tabs>
					</Paper>
				</Grid>
				<Grid item sm sm={10}>
					<Paper style={{ padding: 20, margin: 10 }}>
						{renderPageSwitch(value)}
					</Paper>
				</Grid>
			</Grid>
			<Snackbar
				style={{
					left: '10%'
				}}
				open={true}
			>
				<Button
					size="large"
					variant="contained"
					color="primary"
					onClick={handleSave}>
					Save
          </Button>
			</Snackbar>
			<Snackbar open={snackbarOptions.isOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
				<Alert onClose={handleSnackbarClose} severity="success">
					{snackbarOptions.message}
				</Alert>
			</Snackbar>
		</>
	);
}

export default ItemDetail;
