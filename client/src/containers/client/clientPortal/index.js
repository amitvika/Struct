import React, { useState } from 'react';
import {
	Grid,
	Link,
	Checkbox
} from '@material-ui/core';
import Headding from '../../../components/atoms/Headding';
import Input from '../../../components/atoms/Input';
import Space from '../../../components/atoms/Space';

export default function ClientPortal() {
	const [websiteName, setWebsiteName] = useState('');
	const [checked, setChecked] = useState(false);


	const handleSiteNameChange = (event) => {
		setWebsiteName(event.target.value);
	}

	const handleChange = (event) => {
		setChecked(event.target.checked);
	};

	return (
		<div>
			<Headding fontSize={30} title={'Configure Client Site'} />

			<Space size={20} />

			<Grid className="section-padding-left" container spacing={4}>
				<Grid item xs={4}>
					<Headding bold title={'Setup Client Site'} />
				</Grid>

				<Grid item xs={8}>
					<Checkbox
						inputProps={{ 'aria-label': 'uncontrolled-checkbox' }}
						checked={checked}
						onChange={handleChange} />
				</Grid>
				{
					checked &&
					<>
						<Grid item xs={4}>
							<Headding bold title={'Client Site URL'} />
						</Grid>
						<Grid item xs={8}>
							<Grid item xs={6}>
								<Input
									placeholder="Enter Name"
									type="text"
									onChange={handleSiteNameChange}
								/>
							</Grid>
							<Grid item xs={6}>

								{
									websiteName.length > 0 &&
									<Link color="inherit"
										onClick={() => window.open(`http://${websiteName}.struct.services`, "_blank")}>{`${websiteName}.struct.services`}</Link>
								}
							</Grid>
						</Grid>
					</>
				}
			</Grid>

		</div>
	)
}
