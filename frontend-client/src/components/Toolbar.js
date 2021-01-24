import React from 'react'
import { Grid, Paper } from '@material-ui/core';
import Checkbox from './atoms/Checkbox';
import Headding from './atoms/Headding';
import Space from './atoms/Space';
import Filter from './Filter';

export default function Toolbar({
	title,
	isGridViewSelected,
	setIsGridViewSelected,
	isDeletedItemVisible,
	handleShowDelete,
	isHistoryModalOpened,
	handleHistoryToggle,
	...restProps
}) {
	return (
		<Paper style={{ padding: '10px', marginTop: '10px', marginBottom: '10px' }} >
			<Grid container>

				<Grid item sm sm={2}>
					<Grid item sm sm={12}>
						<Checkbox
							checked={isGridViewSelected}
							size="large"
							label="View GridView"
							onClick={() => setIsGridViewSelected(!isGridViewSelected)}
						/>
					</Grid>

					<Grid item sm sm={12}>
						<Checkbox
							checked={isDeletedItemVisible}
							label="Show Deletions"
							onChange={handleShowDelete}
						/>
					</Grid>

					<Grid item sm sm={12}>
						<Checkbox
							checked={isHistoryModalOpened}
							label="Show History"
							onChange={handleHistoryToggle}
						/>
					</Grid>
				</Grid>
				<Grid item sm sm={10}>
					<Grid item sm sm={12} style={{ display: 'flex' }}>
						<Filter
							{...restProps} />
					</Grid>
					<Space size={30} />
					<Grid item sm sm={10} style={{ display: 'flex', justifyContent: 'center' }}>
						<Headding fontSize={30} title={title} style={{ fontWeight: 'bold' }}></Headding>
					</Grid>
				</Grid>

				{/* {
						isGridViewSelected &&
						<div style={{ display: 'flex', width: '100%', justifyContent: 'flex-end' }}>
							<AddCircleIcon style={{ color: '#3f51b5' }} />
						</div>
					} */}
			</Grid>
		</Paper >
	)
}
