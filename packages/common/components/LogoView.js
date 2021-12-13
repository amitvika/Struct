import React, { useEffect, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import makeStyles from '@mui/styles/makeStyles';

import StructLogo from '../assets/images/struct_logo.png';
import EditIcon from '@mui/icons-material/Edit';
import ImageUploadModal from './LogoUploadModal';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    '& > *': {
      margin: theme.spacing(1)
    },
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: '30px',
    position: 'relative'
  },
  large: {
    width: '100px',
    height: '100px',
    objectFit: 'contain'
  },
  editIconContainer: {
    position: 'absolute',
    zIndex: 1000,
    top: '0px',
    right: '-25px',
    cursor: 'pointer'
  }
}));

export default function LogoView({
  logoUrl,
  handleLogoChange,
  name = 'Sample'
}) {
  const classes = useStyles();

  const [logo, setLogo] = useState('');
  const [isModalOpened, setisModalOpened] = useState(false);

  const toggleModal = () => {
    setisModalOpened(!isModalOpened);
  };

  const onChange = (data) => {
    handleLogoChange(data);
    toggleModal();
  };

  useEffect(() => {
    setLogo(logoUrl);
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
        <div
          className={classes.editIconContainer}
          onClick={() => setisModalOpened(true)}
        >
          <EditIcon />
        </div>
        {logo && logo.length > 0 ? (
          <Avatar
            variant="square"
            alt={name}
            imgProps={{ style: { objectFit: 'contain' } }}
            src={logo}
            sx={{ width: '120px', height: '120px' }}
            className={classes.large}
          />
        ) : (
          <Avatar
            variant="square"
            alt={name}
            src={StructLogo}
            sx={{ width: '100px', height: '100px' }}
            className={classes.large}
          />
        )}
      </div>
    </>
  );
}
