import React, { useState } from 'react';
import Grid from '@mui/material/Grid';
import makeStyles from '@mui/styles/makeStyles';
import { Button } from '@mui/material';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import FormControl from '@mui/material/FormControl';
import axios from 'axios';

import MuiAlert from '@mui/material/Alert';

import { red, blue } from '@mui/material/colors';
import MainModal from './Modal';

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    width: 500,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end'
  },
  icon: {
    margin: theme.spacing.unit * 2
  },
  iconHover: {
    margin: theme.spacing.unit * 2,
    '&:hover': {
      color: red[800]
    }
  },
  cardHeader: {
    textalign: 'center',
    align: 'center',
    backgroundColor: 'white'
  },
  input: {
    display: 'none'
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
    display: 'flex',
    height: '100%',
    alignItems: 'center',
    borderRadius: '15px',
    '&div': {
      borderRadius: '15px'
    }
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1
  },
  iconButton: {
    padding: 10
  }
}));

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
  const [snackbarOptions, setSnackbarOptions] = useState({
    isOpen: false,
    message: ''
  });

  const handleChange = (event) => {
    setLogoURL(URL.createObjectURL(event.target.files[0]));
    setfile(event.target.files[0]);
    setIsFileChanged(true);
  };

  const handleFileUpload = () => {
    if (!isFileChanged) {
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    axios
      .post(`${process.env.REACT_APP_API}/api/upload-logo`, formData)
      .then((res) => {
        if (res.data.logoUrl) {
          handleLogoChange(res.data);
          setSnackbarOptions({
            isOpen: true,
            message: 'Logo is upload successfully'
          });
        }
      })
      .catch((err) => {
        console.log(err);
        setSnackbarOptions({
          isOpen: true,
          message: 'Unable to process your request'
        });
      });
  };

  const handleSnackbarClose = () => {
    setSnackbarOptions({ isOpen: false });
  };

  return (
    <MainModal
      open={isModalOpened}
      toggleModal={toggleModal}
      className={classes.modalContainer}
      title={'Upload Logo'}
    >
      <Grid container spacing={1}>
        <Grid
          item
          xs={8}
          style={{
            display: 'flex',
            height: '50vh',
            justifyContent: 'center'
          }}
        >
          <img className={classes.imagePreview} src={logoURL} />
        </Grid>
        <Grid item xs={4}>
          <Grid item xs={12}>
            <FormControl>
              <label htmlFor="btn-upload">
                <input
                  id="btn-upload"
                  name="btn-upload"
                  style={{ display: 'none' }}
                  type="file"
                  onChange={handleChange}
                />
                <Button
                  className="btn-choose"
                  variant="outlined"
                  component="span"
                >
                  Choose Files
                </Button>
              </label>
            </FormControl>
          </Grid>
          <Grid
            item
            xs={12}
            style={{
              marginTop: '10px',
              display: isFileChanged ? 'block' : 'none'
            }}
          >
            <Button
              variant="contained"
              color="primary"
              type="button"
              onClick={handleFileUpload}
            >
              Upload Logo
            </Button>
          </Grid>
          <Paper component="form" style={{ display: 'flex' }}>
            <InputBase
              className={classes.input}
              placeholder="Search Google Image"
              inputProps={{ 'aria-label': 'search google maps' }}
            />
            <IconButton
              type="submit"
              className={classes.iconButton}
              aria-label="search"
              size="large"
            >
              <SearchIcon />
            </IconButton>
          </Paper>
        </Grid>
      </Grid>
    </MainModal>
  );
}
