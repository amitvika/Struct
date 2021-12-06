import React, { useState, useEffect, Fragment } from "react";

import Paper from "@mui/material/Paper"
import Tab from "@mui/material/Tab"
import Tabs from "@mui/material/Tabs"
import Grid from "@mui/material/Grid"
import CircularProgress from "@mui/material/CircularProgress"
import { useSelector } from 'react-redux';
import { useHistory } from "react-router-dom";

import { useQuery } from '../../utils/customHooks'

import MyAccess from './myAccess'
import MyTeam from './myTeam';
import MyCreatedObjects from './myCreatedObjects'
import Tasks from './Tasks'
import './style.css'


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

							<Tab label="My Teams" value={0} className='tab'/>
							<Tab label="My Access" value={1} className='tab'/>
							<Tab label="My Created Objects" value={2} className='tab'/>
							<Tab label="Tasks" value={3} className='tab'/>
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
