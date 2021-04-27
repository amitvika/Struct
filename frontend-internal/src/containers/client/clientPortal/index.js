import React, { useState } from 'react';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';

import Headding from '../../../components/atoms/Headding';
import Input from '../../../components/atoms/Input';
import Space from '../../../components/atoms/Space';
import ClientAPI from '../../../api/clients.api';

export default function ClientPortal({ clientData, handleClientUpdate, isWebsiteNameAvailable }) {

	const [isClientSiteUpdated, setIsClientSiteUpdated] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const handleSiteNameChange = (event) => {
		event.persist();
		if (event.target !== null) {
			setIsClientSiteUpdated(true);
			handleClientUpdate({ ...clientData, websiteName: event.target.value });
		}
	}

	const handleChange = (event) => {
		handleClientUpdate({ ...clientData, isSiteVisible: event.target.checked });
	};

	const handleSubmit = () => {
		setIsClientSiteUpdated(false);

		setIsLoading(true);
		ClientAPI.configureSubdomain(clientData._id, { websiteName: clientData.websiteName, isSiteVisible: clientData.isSiteVisible })
			.then(res => {
				setIsLoading(false);
			})
			.catch(err => {
				setIsLoading(false);
				console.log('Error', err)
			})
	}

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
						checked={clientData.isSiteVisible}
						onChange={handleChange} />
				</Grid>
				{
					clientData.isSiteVisible &&
					<>
						<Grid item xs={4}>
							<Headding bold title={'Client Site URL'} />
						</Grid>
						<Grid item xs={8}>
							<Grid item xs={6}>
								<Input
									placeholder="Enter website name"
									type="text"
									onChange={handleSiteNameChange}
									value={clientData.websiteName}
								/>
							</Grid>
							<Grid item xs={6} style={{ color: isWebsiteNameAvailable ? 'green' : 'red' }}>
								{
									isWebsiteNameAvailable && clientData.websiteName && clientData.websiteName.length > 0 &&
									<Link color="inherit"
										onClick={() => window.open(`http://${clientData.websiteName}.struct.services`, "_blank")}>{`${clientData.websiteName}.struct.services`}</Link>
								}
								{
									!isWebsiteNameAvailable && <span>{`${clientData.websiteName}.struct.services `}***Website Name Already Taken***</span>
								}
							</Grid>
						</Grid>
					</>
				}

				{isLoading && <Grid item xs={12}>

					<LinearProgress />
				</Grid>}

				{
					isClientSiteUpdated &&
					<Grid item xs={12}>
						<Button variant="contained" color="primary" onClick={handleSubmit}>
							Configure Client site
						</Button>
					</Grid>
				}
			</Grid>

		</div>
	)
}
