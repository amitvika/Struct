import React, { useState, useEffect } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Orders from '../order/index'

const useStyles = makeStyles((theme) => ({
	root: {
		flexGrow: 1,
	},
	paper: {
		padding: theme.spacing(1),
		textAlign: 'center',
		color: theme.palette.text.secondary,
		marginTop: '10px',
		marginBottom: '10px'
	},
	tabPaper: {
		padding: theme.spacing(1),
		textAlign: 'center',
		color: theme.palette.text.secondary,
		cursor: 'pointer',
		transition: '0.3s',
		"&:hover, &:focus": {
			backgroundColor: '#DCDCDC'
		}
	},
	selectedTab: {
		backgroundColor: "blue",

	},
	dividerStyle: {
		marginTop: '20px',
		marginBottom: '20px'
	},
	verticalDivider: {
		margin: '5px',
		width: '1px'
	}
}));

export default function ProductOption(props) {
	const classes = useStyles();

	const [selectedTab, setSelectedTab] = useState("");

	const [value, setValue] = React.useState(0);


	const tabArray = ['Orders', 'Injection Casting',]

	const handleTabChange = (tabName) => {
		setSelectedTab(tabName);
	}


	const renderDetailPanel = () => {

		if (selectedTab === 'Orders') {
			return <Orders />
		}
		else {

			return 'not Found Page'

		}

	}


	return (
		<>
			<Paper elevation={3} className={classes.paper}>
				<Grid container spacing={1}>
					{
						tabArray.map(tabName =>
						(
							<Grid item xs={2.5}>
								<Paper onClick={() => handleTabChange(tabName)}
									style={{
										backgroundColor: selectedTab === tabName ? "#343a40" : "",
										color: selectedTab === tabName ? "white" : ""
									}}
									className={classes.tabPaper}>{tabName}</Paper>

							</Grid>
						)
						)
					}
				</Grid>

			</Paper>
			{renderDetailPanel()}
		</>
	)
}
