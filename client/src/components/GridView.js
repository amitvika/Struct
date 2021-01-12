import React from 'react'
import {
	Grid,
	Typography,
	Table,
	TableBody,
	TableRow,
	TableCell,
	makeStyles,
	Paper,
	GridListTile,
	ButtonBase
} from '@material-ui/core';

import GridList from './GridList';
import StructLogo from '../assets/images/struct_logo.png';

const useStyles = makeStyles((theme) => ({
	tableCell: {
		borderBottom: "none"
	},
	boldtablecell: {
		borderBottom: "none",
		fontWeight: 'bold'
	},
	paper: {
		height: '100%',
		width: '100%',
		cursor: 'pointer',
		transition: '0.3s',
		"&:hover, &:focus": {
			backgroundColor: '#DCDCDC'
		}
	},

	image: {
		width: '100%',
		height: '100%',
	},
	img: {
		margin: 'auto',
		display: 'block',
		maxWidth: '100%',
		maxHeight: '100%',
	},
}));

export default function GridView({ list, handleHistoryToggle, columnsFields, handleTableRowClick }) {
	const classes = useStyles();

	const renderItem = (data) => {
		let item = [];

		Object.keys(columnsFields).forEach(fieldItem => {
			item.push(
				<div style={{ display: 'flex', padding: '10px 0 0 0' }}>
					<Typography className={classes.boldtablecell}>{columnsFields[fieldItem]}: </Typography>
					<Typography className={classes.tableCell}>{` ${data[fieldItem]}`}</Typography>
				</div>
			)
		})
		return item;
	}

	return (
		// <GridList>
		<Grid container spacing={3}>
			{list.map(product => {
				return (
					<Grid item xs={12} sm={4}>
						<Paper className={classes.paper} onClick={() => handleTableRowClick(product)}>
							<Grid container style={{ padding: '5px 10px' }}>
								<Grid item sm sm={4}>
									<ButtonBase className={classes.image}>
										<img className={classes.img} alt="complex" src={StructLogo} />
									</ButtonBase>
								</Grid>
								<Grid item sm sm={8}>
									{renderItem(product)}
								</Grid>
								<Grid item sm sm={12} style={{ margin: '10px', justifyContent: 'center', color: '#0b79c7' }}>
									<Typography variant="body2" style={{ cursor: 'pointer', textAlign: 'center' }} onClick={(event) => {
										event.stopPropagation();
										handleHistoryToggle({ rowId: product.id })
									}}>
										View History
                </Typography>
								</Grid>
							</Grid>
						</Paper>
					</Grid>
				)
			})
			}
		</Grid>

	)
}
