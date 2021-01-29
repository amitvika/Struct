import React, { useEffect, useState } from 'react';
import Avatar from '@material-ui/core/Avatar';
import { makeStyles } from '@material-ui/core/styles';

import StructLogo from '../assets/images/struct_logo.png';
import EditIcon from '@material-ui/icons/Edit';
import ImageUploadModal from './LogoUploadModal';

const useStyles = makeStyles((theme) => ({
	root: {
		display: 'flex',
		'& > *': {
			margin: theme.spacing(1),
		},
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		marginLeft: '30px',
		position: 'relative'

	},
	large: {
		width: '96px',
		height: '96px',
		objectFit: 'contain'
	},
	editIconContainer: {
		position: 'absolute',
		zIndex: 1000,
		top: '-22px',
		right: '-25px',
		cursor: 'pointer'
	}
}));


export default function LogoView({
	logoUrl,
	handleLogoChange,
	name = "Sample"
}) {
	const classes = useStyles();

	const [logo, setLogo] = useState('')
	const [isModalOpened, setisModalOpened] = useState(false);

	const toggleModal = () => {
		setisModalOpened(!isModalOpened)
	}

	const onChange = (data) => {
		handleLogoChange(data);
		toggleModal();
	}

	useEffect(() => {
		setLogo(logoUrl)
	}, [logoUrl]);

	return (
		<>
			<ImageUploadModal
				isModalOpened={isModalOpened}
				toggleModal={toggleModal}
				handleLogoChange={onChange}
				logoUrl={logoUrl}
			/>
			<div className={classes.root}>
				<div className={classes.editIconContainer} onClick={() => setisModalOpened(true)}>
					<EditIcon />
				</div>
				{
					logo && logo.length > 0 ?
						<Avatar variant="square" alt={name} imgProps={{ style: { objectFit: 'contain' } }} src={logo} className={classes.large} /> :
						<Avatar variant="square" alt={name} src={StructLogo} className={classes.large} />
				}

			</div>
		</>
	)
}
