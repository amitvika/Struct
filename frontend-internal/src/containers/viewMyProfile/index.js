import React, { useState, useEffect, Fragment } from "react";

import Button from "@material-ui/core/Button"
import Paper from "@material-ui/core/Paper"
import Tab from "@material-ui/core/Tab"
import Tabs from "@material-ui/core/Tabs"
import Box from "@material-ui/core/Box"
import Grid from "@material-ui/core/Grid"
import Breadcrumbs from "@material-ui/core/Breadcrumbs"
import Typography from "@material-ui/core/Typography"
import CircularProgress from "@material-ui/core/CircularProgress"
import MuiAlert from '@material-ui/lab/Alert';
import { useSelector } from 'react-redux';
import { useParams } from "react-router-dom";



import { useDispatch } from 'react-redux';
import get from 'lodash/get';
import ViewAccess from '../../page/ViewAccess'
import MyTeam from './myTeam';
import MyCreatedObjects from './myCreatedObjects'
import Tasks from './Tasks'

import { showErrorAlert, showSuccessAlert } from '../../actions/alert.action';

function Alert(props) {
	return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const ViewMyProfile = () => {
	const { isAuthenticated, user } = useSelector(state => state.auth);
	let { id } = useParams();


	const dispatch = useDispatch()

	const [selectedTab, setSelectedTab] = useState(0);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		(async () => {
			setIsLoading(true);

			setIsLoading(false);
		})()
	}, []);

	const renderPageSwitch = () => {
		switch (selectedTab) {
			case 0:
				return <MyTeam />;
			case 1:
				return <ViewAccess />;
			case 2:
				return <MyCreatedObjects />
			case 3:
				return <Tasks />
			default:
				return "Undefined Tab Index";
		}
	}

	const handleSave = () => {

	}

	const tabList = { "My Teams": 0, "My Access": 1, "My Created Objects": 2, "Tasks": 3 }

	if (isLoading) {
		return <CircularProgress />;
	}

	return (
		<>
			<Grid container>
				<Grid item sm sm={12}>
					<Paper style={{ display: 'flex', justifyContent: 'center', padding: 10, margin: 10 }}>
						<h4>View My Profile</h4>
					</Paper>
					<Paper style={{ display: 'flex', padding: 10, margin: 10 }}>
						<div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
							<h4>User: </h4>
							<p> ID:{id}</p>
						</div>
					</Paper>
				</Grid>



				<Grid item sm={2}>
					<Paper style={{ padding: 20, margin: 10 }}>
						<Tabs
							orientation="vertical"
							variant="scrollable"
							value={selectedTab}
							onChange={(event, newValue) => setSelectedTab(newValue)}>

							<Tab label="My Teams" value={0} />
							<Tab label="My Access" value={1} />
							<Tab label="My Created Objects" value={2} />
							<Tab label="Tasks" value={3} />
						</Tabs>
					</Paper>
				</Grid>
				<Grid item sm sm={10}>
					<Paper style={{ padding: 20, margin: 10 }}>
						{renderPageSwitch()}
					</Paper>
				</Grid>
			</Grid>

		</>
	);
}

export default ViewMyProfile;
