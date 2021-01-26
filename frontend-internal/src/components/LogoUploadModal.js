import React, { useState } from 'react';
import {
	Modal,
	ModalHeader,
	ModalBody,
	CustomInput
} from "reactstrap";
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import { Button } from "@material-ui/core";

import red from "@material-ui/core/colors/red";
import blue from "@material-ui/core/colors/blue";
import axios from "axios";

import MuiAlert from '@material-ui/lab/Alert';

function Alert(props) {
	return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const useStyles = makeStyles(theme => ({
	root: {
		backgroundColor: theme.palette.background.paper,
		width: 500,
		display: "flex",
		justifyContent: "center",
		alignItems: "flex-end"
	},
	icon: {
		margin: theme.spacing.unit * 2
	},
	iconHover: {
		margin: theme.spacing.unit * 2,
		"&:hover": {
			color: red[800]
		}
	},
	cardHeader: {
		textalign: "center",
		align: "center",
		backgroundColor: "white"
	},
	input: {
		display: "none"
	},
	button: {
		color: blue[900],
		margin: 10
	},
	imagePreview: {
		width: '100%',
		height: '100%',
		objectFit: 'contain'
	},
	modalContainer: {
		width: '50%',
		height: '50%'
	}
}))

export default function ImageUploadModal({
	isModalOpened,
	toggleModal,
	handleLogoChange,
	logoUrl
}) {

	const classes = useStyles();

	const [isFileChanged, setIsFileChanged] = useState(false);
	const [file, setfile] = useState('');
	const [logoURL, setLogoURL] = useState(logoUrl);
	const [snackbarOptions, setSnackbarOptions] = useState({ isOpen: false, message: '' });

	const handleChange = (event) => {
		setLogoURL(URL.createObjectURL(event.target.files[0]));
		setfile(event.target.files[0]);
		setIsFileChanged(true);
	}

	const handleFileUpload = () => {
		if (!isFileChanged) {
			return;
		}

		const formData = new FormData();
		formData.append("file", file);
		axios
			.post("/api/upload-logo", formData)
			.then(res => {
				if (res.data.logoUrl) {
					handleLogoChange(res.data)
					setSnackbarOptions({ isOpen: true, message: 'Logo is upload successfully' });
				}
			})
			.catch(err => {
				console.log(err);
				setSnackbarOptions({ isOpen: true, message: 'Unable to process your request' })
			});
	}

	const handleSnackbarClose = () => {
		setSnackbarOptions({ isOpen: false })
	}

	return (
		<>
			<Modal isOpen={isModalOpened} toggle={toggleModal} className={classes.modalContainer}>
				<ModalHeader toggle={toggleModal}>Upload Logo</ModalHeader>
				<ModalBody>
					<Grid container spacing={1}>
						<Grid item xs={8} style={{ display: 'flex', height: '50vh', justifyContent: 'center' }}>
							<img className={classes.imagePreview} src={logoURL} />

						</Grid>
						<Grid item xs={4}>
							<Grid item xs={12}>
								<CustomInput
									type="file"
									id="file"
									name="file"
									label={'Choose logo'}
									onChange={handleChange}
								/>
							</Grid>
							<Grid item xs={12} style={{ marginTop: '10px', display: isFileChanged ? 'block' : 'none' }}>
								<Button
									variant="contained"
									color="primary"
									type="button"
									onClick={handleFileUpload}>
									Upload Logo
									</Button>
							</Grid>
						</Grid>
					</Grid>
				</ModalBody>
			</Modal>
		</>
	)
}
