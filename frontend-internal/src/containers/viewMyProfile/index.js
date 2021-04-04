import React, { useState, useEffect, Fragment } from "react";

import Paper from "@material-ui/core/Paper"
import Tab from "@material-ui/core/Tab"
import Tabs from "@material-ui/core/Tabs"
import Grid from "@material-ui/core/Grid"
import CircularProgress from "@material-ui/core/CircularProgress"
import MuiAlert from '@material-ui/lab/Alert';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useHistory } from "react-router-dom";

import { useQuery } from '../../utils/customHooks'

import MyAccess from './myAccess'
import MyTeam from './myTeam';
import MyCreatedObjects from './myCreatedObjects'
import Tasks from './Tasks'

import { showErrorAlert, showSuccessAlert } from '../../actions/alert.action';

function Alert(props) {
	return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const ViewMyProfile = () => {
	const user = useSelector(state => state.auth.user);

	const history = useHistory();
	let query = useQuery();

	const [tabIndex, setTabIndex] = useState(0);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (query.get('tab')) {
			setTabIndex(parseInt(query.get('tab')))
		}

		(async () => {
			setIsLoading(true);

			setIsLoading(false);
		})()
	}, []);

	const renderPageSwitch = () => {
		switch (tabIndex) {
			case 0:
				return <MyTeam />;
			case 1:
				return <MyAccess />;
			case 2:
				return <MyCreatedObjects />
			case 3:
				return <Tasks />
			default:
				return "Undefined Tab Index";
		}
	}

	const handleTabChange = (event, newTabIndex) => {
		setTabIndex(newTabIndex)

		history.push({
			pathname: `/viewMyProfile`,
			search: `?tab=${newTabIndex}`
		})
	}

	const tabList = { "My Teams": 0, "My Access": 1, "My Created Objects": 2, "Tasks": 3 }

	if (isLoading) {
		return <CircularProgress />;
	}

	return (
		<>
			<Grid container>
				<Grid item sm sm={12}>
					{/* <Paper style={{ display: 'flex', justifyContent: 'center', padding: 10, margin: 10 }}>
						<h4>View My Profile</h4>
					</Paper> */}
					<Paper style={{ display: 'flex', padding: 10, margin: 10 }}>
						<div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
							<h4>User: {user && user.name}</h4>
							<p> ID:{user && user._id}</p>
						</div>
					</Paper>
				</Grid>

				<Grid item sm={2}>
					<Paper style={{ padding: 20, margin: 10 }}>
						<Tabs
							orientation="vertical"
							variant="scrollable"
							value={tabIndex}
							onChange={handleTabChange}>

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
