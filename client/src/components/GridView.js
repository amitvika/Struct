import React from 'react'
import {
	Grid,
	Typography,
	makeStyles,
	Paper,
} from '@material-ui/core';
import './style.css'

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
	historyLink: {
		margin: '10px',
		justifyContent: 'center',
		color: '#0b79c7',
	},
	fieldItem: {
		display: 'flex',
		padding: '10px 0 0 0'
	}

}));

export default function GridView({
	list,
	handleHistoryToggle,
	columnsFields,
	handleTableRowClick,
	isHistoryLinkVisible = true
}) {
	const classes = useStyles();

	const renderItem = (data) => {
		let item = [];

		Object.keys(columnsFields).forEach(fieldItem => {
			item.push(
				<Grid item sm sm={12} className={classes.fieldItem}>
					<div >
						<span className={classes.boldtablecell}>{columnsFields[fieldItem]}</span>
						{`: `}
						<span className={classes.tableCell}>{` ${data[fieldItem] != undefined || data[fieldItem] != null ? data[fieldItem] : ''}`}</span>
					</div>
				</Grid>
			)
		})
		return item;
	}

	return (
		<div className={'fixed-grid--around'}>
			{list.map(product => {
				return (
					<div style={{ marginTop: '10px', marginBottom: '10px', width: '380px' }}>
						<Paper className={classes.paper} onClick={() => handleTableRowClick(product)}>
							<Grid container style={{
								height: '100%'
							}}>
								<Grid item sm sm={4} style={{ display: 'flex' }}>
									<img className={classes.img} alt="complex" src={StructLogo} />
								</Grid>
								<Grid item sm sm={8}>

									{renderItem(product)}

									{
										isHistoryLinkVisible &&
										<Grid item sm sm={12} className={classes.historyLink}>
											<Typography variant="body2" style={{ cursor: 'pointer', textAlign: 'center' }} onClick={(event) => {
												event.stopPropagation();
												handleHistoryToggle({ rowId: product.id })
											}}>
												View History
                		</Typography>
										</Grid>
									}
								</Grid>
							</Grid>
						</Paper>
					</div>
				)
			})
			}

		</div >

	)
}
