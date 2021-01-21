import React, { Component, useEffect, useState } from "react";
import { changePage } from "../../actions/pageActions";
import {
	Snackbar,
	Button,
	Paper,
	Tab,
	Tabs,
	Box,
	Grid,
	Breadcrumbs,
	Link
} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import { NavLink, useParams } from "react-router-dom";
import API from '../../api/clients.api';
import Products from './products'
import ClientPortal from './clientPortal';
import LogoView from '../../components/LogoView'
import MuiAlert from '@material-ui/lab/Alert';

function Alert(props) {
	return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const ClientDetail = () => {
	let { id } = useParams();

	const [value, setValue] = useState(1);
	const [clientData, setClientData] = useState({});
	const [isWebsiteNameAvailable, setIsWebsiteNameAvailable] = useState(true);
	const [snackbarOptions, setSnackbarOptions] = useState({ isOpen: false, message: '' });

	useEffect(() => {
		API.fetchClientApi(id)
			.then(res => {
				if (res.data) {
					setClientData(res.data);
				}
			})
			.catch(error => {
				console.log('Error :', error)
			})
	}, [id]);

	const handleSave = () => {
		API.updateClientApi(id, clientData)
			.then(res => {
				if (res.data.success) {
					setIsWebsiteNameAvailable(res.data.isWebsiteNameAvailable);
				}
				else {
					setClientData(res.data);
				}
				setSnackbarOptions({ isOpen: true, message: 'All data is saved' })
			})
			.catch(error => {
				console.log('Error :', error)
			})
	}

	const handleClientUpdate = (data) => {
		setClientData(data);
		setIsWebsiteNameAvailable(true)
	}

	const handleSnackbarClose = () => {
		setSnackbarOptions({ isOpen: false })
	}

	const renderPageSwitch = (index) => {
		switch (index) {
			case 1:
				return <Products clientId={id} />

			case 2:
				return <ClientPortal clientData={clientData} handleClientUpdate={handleClientUpdate} isWebsiteNameAvailable={isWebsiteNameAvailable} />;

			case -2:
				return "shows order claims via data file input or online store api.  Allows shipping configurations to be set as well. configure labelling as well";
			case -3:
				return "configure Notifications of manufacturing setup finishing, or specific components of setup such as molds and validations of molds, notifications of finishing of products, notifications of products being shipped.  Configured for email, text, and/or datafile notifications, account manager tools to pull information based on this client and selectable characteristics about items and process groups";
			case -1:
				return "configure warranty length by product, and associated pricing";
			case 0:
				return "Product questions/troubleshooting call center, manual writing, product design is free if they agree before hand to manfucature for us for atleast a year";

			case 3:
				return "signed service agreement with the current state of config.  IF there is changed configs, those changes will show up here and will indicate to reduline the contract with those new items.  Also feature of auto generate the contract will be included";
			case 4:
				return "stores all requirements documents tied with this client.  Potential tying ability with items created. Also autogenerate requirements documents based on the configs in the system";
			case 5:
				return "shows the total of things to be billed. Can configure the specific billing period. Based on bank account to send to, will check if vendors have same and show reconciliation and net total";
			case 6:
				return "lists all failed validations of respective process groups and items";
			case 7:
				return "Allows to link with a vendor in the system.  if it is linked, it will give show a billing and a payments table and a total net payment table below";

			default:
				return "Undefined Tab Index";
		}
	}

	const handleLogoChange = ({ logoName, logoUrl }) => {
		setClientData(prevState => {
			return {
				...prevState,
				logoName,
				logoUrl
			}
		});
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
								to='/clients'>
								Clients
								</NavLink>

							<Typography color="textPrimary">Client Details</Typography>
						</Breadcrumbs>
					</Paper>
					<Paper style={{ display: 'flex', padding: 10, margin: 10 }}>
						<div>

							<h4>Client Name: {clientData.name}</h4>
							<p>Client ID:{id}</p>
						</div>

						<LogoView
							logoUrl={clientData.logoUrl}
							handleLogoChange={handleLogoChange} />
					</Paper>
				</Grid>
				<Grid item sm={2}>
					<Paper style={{ padding: 20, margin: 10 }}>
						<Tabs
							orientation="vertical"
							variant="scrollable"
							value={value}
							onChange={(event, newValue) => setValue(newValue)}
						>
							<Tab label="Products" value={1} />
							<Tab label="Client Portal" value={2} />
							<Tab label="Orders and Fulfillment" value={-2} />
							<Tab label="Billing" value={5} />
							<Tab label="Notifications" value={-3} />
							{/* <Tab label="Reports" value={2} />*/}
							{/* <Tab label="Warranty Setup" value={-1} /> */}
							{/*<Tab label="End User Features" value={0} />*/}
							<Tab label="Requirements Documents" value={4} />
							<Tab label="Service Agreement" value={3} />
							<Tab label="Identified Issues" value={6} />
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

export default ClientDetail;
