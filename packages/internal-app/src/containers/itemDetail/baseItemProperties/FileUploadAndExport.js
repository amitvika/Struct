import React, { Fragment, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import makeStyles from '@mui/styles/makeStyles';
import { Typography } from '@mui/material';

import ExportLogo from '../../../assets/images/export.png';
import { download } from '@monostruct/common/api/fileUpload.api';

const useStyles = makeStyles((theme) => ({
  custom_file: {
    position: 'relative',
    width: '100%',
    height: 'calc(1.5em + .75rem + 2px)',
  },
  custom_file_input: {
    zIndex: 2,
    margin: 0,
    overflow: 'hidden',
    opacity: 0,
    position: 'relative',
    width: '100%',
    height: 'calc(1.5em + .75rem + 2px)',
  },
  custom_file_label: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: '.375rem .75rem',
    lineHeight: 1.5,
    color: '#495057',
    left: 0,
    zIndex: 1,
    height: 'calc(1.5em + .75rem + 2px)',
    overflow: 'hidden',
    fontWeight: 400,
    backgroundColor: '#fff',
    border: '1px solid #ced4da',
    borderRadius: '.25rem',
    '&::after': {
      bottom: 0,
      zIndex: 3,
      display: 'block',
      height: 'calc(1.5em + .75rem)',
      content: '"Browse"',
      backgroundColor: '#e9ecef',
      borderLeft: 'inherit',
      borderRadius: '0 .25rem .25rem 0',
      position: 'absolute',
      top: 0,
      right: 0,
      padding: '.375rem .75rem',
      lineHeight: 1.5,
      color: '#495057',
    },
  },
}));

export default function FileUploadAndExport({
  handleFileUpload,
  itemId,
  label = 'STEP, DXF, GERBER',
  itemProperties,
}) {
  const classes = useStyles();

  const onChange = (e) => {
    if (!e.target.files[0]) {
      return;
    }
    handleFileUpload(e.target.files[0]);
  };

  const handleExportButton = () => {
    download(itemProperties.fileName);
  };

  if (itemProperties.fileStore) {
    return (
      <div style={{ display: 'flex' }}>
        <Typography
          variant="h6"
          style={{
            display: 'flex',
            alignItems: 'center',
            color: 'blue',
          }}
        >
          {itemProperties.fileStore}
        </Typography>
        <IconButton margin="auto" onClick={handleExportButton} size="large">
          <img
            src={ExportLogo}
            style={{ width: '20px', paddingTop: '2px' }}
            alt="pictur"
          />
        </IconButton>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex' }}>
      <Typography variant="h6">Upload Cad</Typography>

      <Box component="div" className={classes.custom_file}>
        <input
          id="btn-upload"
          name="btn-upload"
          className={classes.custom_file_input}
          type="file"
          accept=".step,.stp,.igs,.iges,.stl,.brep"
          onChange={onChange}
        />

        <label className={classes.custom_file_label} htmlFor="file">
          {label}
        </label>
      </Box>
    </div>
  );
}
