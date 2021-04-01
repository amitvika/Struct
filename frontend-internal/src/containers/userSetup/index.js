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

import { useDispatch } from 'react-redux';
import get from 'lodash/get';
import TeamSetup from '../teamSetup';
import TeamTaskSetup from '../teamTaskSetup'
import AccessSetup from '../accessSetup'
import { showErrorAlert, showSuccessAlert } from '../../actions/alert.action';

function Alert(props) {
	return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const UserSetup = () => {
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
				return <TeamSetup />;
			case 1:
				return <TeamTaskSetup />;
				case 2:
					return <AccessSetup />
			default:
				return "Undefined Tab Index";
		}
	}

	const handleSave = () => {

	}

	const tabList = { "Team Setup": 0, "Team Tasks Setup": 1, "Access Setup": 2 }

	if (isLoading) {
		return <CircularProgress />;
	}

	return (
		<>
			<Grid container>
				<Grid item sm sm={12}>
					<Paper style={{ display: 'flex', justifyContent: 'center', padding: 10, margin: 10 }}>
						<h4>User Setup</h4>
					</Paper>
				</Grid>

				<Grid item sm={2}>
					<Paper style={{ padding: 20, margin: 10 }}>
						<Tabs
							orientation="vertical"
							variant="scrollable"
							value={selectedTab}
							onChange={(event, newValue) => setSelectedTab(newValue)}>

							<Tab label="Team Setup" value={0} />
							<Tab label="Team Tasks Setup" value={1} />
							<Tab label="Access Setup" value={2} />
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

export default UserSetup;
