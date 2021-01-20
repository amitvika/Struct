import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import { makeStyles } from '@material-ui/core/styles';

import StructLogo from '../assets/images/struct_logo.png';
import EditIcon from '@material-ui/icons/Edit';

const useStyles = makeStyles((theme) => ({
	root: {
		display: 'flex',
		'& > *': {
			margin: theme.spacing(1),
		},
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		marginLeft: '30px'

	},
	large: {
		width: theme.spacing(7),
		height: theme.spacing(7),
	}
}));


export default function LogoView() {
	const classes = useStyles();

	return (
		<div className={classes.root}>
			<EditIcon />
			<Avatar variant="square" alt="Remy Sharp" src={StructLogo} className={classes.large} />

		</div>
	)
}
