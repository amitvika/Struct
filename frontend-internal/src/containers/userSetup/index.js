import React, { useState, useEffect, Fragment } from "react";
import Paper from "@material-ui/core/Paper"
import Tab from "@material-ui/core/Tab"
import Tabs from "@material-ui/core/Tabs"
import Grid from "@material-ui/core/Grid"
import CircularProgress from "@material-ui/core/CircularProgress"

import { useHistory } from "react-router-dom";
import { useQuery } from '../../utils/customHooks'

import TeamSetup from '../teamSetup';
import TeamTaskSetup from '../teamTaskSetup'
import AccessSetup from '../accessSetup'

const UserSetup = () => {
	const history = useHistory();
	let query = useQuery();

	const [isLoading, setIsLoading] = useState(true);
	const [tabIndex, setTabIndex] = useState(0);

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
				return <TeamSetup />;
			case 1:
				return <TeamTaskSetup />;
			case 2:
				return <AccessSetup />
			default:
				return "Undefined Tab Index";
		}
	}

	const handleTabChange = (event, newTabIndex) => {
		setTabIndex(newTabIndex)

		history.push({
			pathname: `/user-setup`,
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
					<Paper style={{ display: 'flex', justifyContent: 'center', padding: 10, margin: 10 }}>
						<h4>User Setup</h4>
					</Paper>
				</Grid>

				<Grid item sm={2}>
					<Paper style={{ padding: 20, margin: 10 }}>
						<Tabs
							orientation="vertical"
							variant="scrollable"
							value={tabIndex}
							onChange={handleTabChange}>

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
