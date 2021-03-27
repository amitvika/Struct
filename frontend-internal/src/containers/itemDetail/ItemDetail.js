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
import { NavLink, useParams, useHistory, useLocation } from "react-router-dom";
import { useDispatch } from 'react-redux';

import BaseItemProperties from './baseItemProperties';
import GeometricDimensioning from './geometricDimensioning';
import CurrentUsage from './currentUsage';
import VendorDetails from './VendorDetails';
import Manufacturing from '../manufacture/index2'
import ClientSetup from './clientSetup';
import Assembly from './assembly';
import Production from './production'

import ItemTypeConfigurations from './ItemTypeConfigurations';
import ItemAPI from '../../api/items.api';
import { showErrorAlert, showSuccessAlert } from '../../actions/alert.action';
import get from 'lodash/get';

function Alert(props) {
	return <MuiAlert elevation={6} variant="filled" {...props} />;
}


function useQuery() {
	return new URLSearchParams(useLocation().search);
}

const ItemDetail = () => {
	const dispatch = useDispatch();
	const history = useHistory();
	let { id } = useParams();
	let query = useQuery();

	const [tabIndex, setTabIndex] = useState(1);
	const [itemProperties, setItemProperties] = useState({});
	const [isLoading, setIsLoading] = useState(true);
	const [itemDetail, setItemDetail] = useState({});
	const [threejsData, setThreejsData] = useState({});
	const [snackbarOptions, setSnackbarOptions] = useState({ isOpen: false, message: '' });
	const [gltfjson, setgltfjson] = useState({});

	useEffect(() => {
		if (query.get('tab')) {
			setTabIndex(parseInt(query.get('tab')))
		}

		(async () => {
			setIsLoading(true);
			const itemDetailResponse = await ItemAPI.getItemsAPI(`id=${id}`)
			// setItemDetail(get(itemDetailResponse, 'data[0]', {}));

			// const itemGeometryResponse = await ItemAPI.getItemAPI(id)
			// if (itemGeometryResponse.data) {
			setItemProperties(get(itemDetailResponse, 'data[0]', {}));
			setgltfjson(get(itemDetailResponse, 'data[0].gltfjson', {}))

			setIsLoading(false);
		})()
	}, []);

	const renderPageSwitch = () => {
		if (!get(itemProperties, '_id')) {
			return null;
		}

		// let index = tabIndex;
		// if (query.get('tab')) {
		// 	index = query.get('tab')
		// }

		console.log(tabIndex)

		switch (tabIndex) {
			case 0:
				return "Add vendor items here";
			case 1:
				return <BaseItemProperties itemId={id} itemProperties={itemProperties}
					setItemProperties={setItemProperties}
					gltfjson={gltfjson} setgltfjson={setgltfjson} />;
			case 2:
				return <GeometricDimensioning gltfjson={gltfjson} />
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
			case 8:
				return <Assembly />;
			case 9:
				return <Production />;
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

	const handleTabChange = (event, newTabIndex) => {
		setTabIndex(newTabIndex)

		history.push({
			pathname: `/items/${id}`,
			search: `?tab=${newTabIndex}`
		})
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
							}}>
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
							value={tabIndex}
							onChange={handleTabChange}>
							<Tab label="Base Item Properties" value={1} />
							{
								// itemProperties?.itemGeometry?.isEndProductSelected &&
								// <Tab label="Client Setup" value={7} />
							}

							{
								itemProperties?.itemGeometry?.itemType &&
								<Tab label="Geometric Dimensioning and Tolerances" value={2} />
							}

							<Tab label="Assembly" value={8} />
							{
								// itemProperties.assemblyType === 'Multi-Item Assembly' && 
							}
							<Tab label="Current Usage" value={3} />
							<Tab label="Item Type Configurations" value={4} />
							{/* {
								itemProperties.vendorId && 
								<Tab label="Vendor Details" value={5} />
							} */}


							<Tab label="Manufacture & processing" value={6} />
							<Tab label="Production" value={9} />


						</Tabs>
					</Paper>
				</Grid>
				<Grid item sm sm={10}>
					<Paper style={{ padding: 20, margin: 10 }}>
						{renderPageSwitch()}
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
