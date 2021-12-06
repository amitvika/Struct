import React, { useState } from 'react';
import { Headding } from '@monostruct/common/components';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';

import makeStyles from '@mui/styles/makeStyles';
import DocViewer, { DocViewerRenderers } from 'react-doc-viewer';
import { uploadFileS3Bucket } from '@monostruct/common/api/aws';

const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(1),
  },
  fileLoadContainer: {
    display: 'flex',
    alignItems: 'center',
  },
}));

export default function FileUploadOnAWS({
  value,
  handleOnChange,
  isDesignModalOpened = true,
  user,
  fileType = '.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel',
}) {
  const classes = useStyles();

  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setLoading] = useState(false);

  const handleOnFileChange = async (event) => {
    if (!event.target.files[0]) {
      return;
    }
    setSelectedFile(event.target.files[0]);
  };

  const handleLoadFile = async () => {
    setLoading(true);

    const file_url = await uploadFileS3Bucket(selectedFile);
    // loaded_by, cleared_by, loaded_at, cleared_at
    handleOnChange('new_file', {
      file_name: selectedFile.name,
      file_url,
      loaded_by_name: user.name,
      loaded_by: user.id,
    });
    setSelectedFile(null);

    setLoading(false);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
  };

  const renderButtonsView = () => {
    if (selectedFile === null) {
      return (
        <Grid item xs={8} className={classes.fileLoadContainer}>
          <Button variant="contained" component="label">
            Select File
            <input
              onChange={handleOnFileChange}
              type="file"
              hidden
              accept={fileType}
            />
          </Button>
          {isDesignModalOpened === true && <span>*Spreadsheets Only</span>}
        </Grid>
      );
    } else {
      return (
        <Grid item xs={8} className={classes.fileLoadContainer}>
          <Headding title={selectedFile.name} />
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={handleLoadFile}
          >
            Load
          </Button>
          <Button
            className={classes.button}
            variant="contained"
            color="secondary"
            onClick={handleClearFile}
          >
            Clear
          </Button>
        </Grid>
      );
    }
  };

  return (
    <>
      <Grid item xs={4}>
        <Headding bold title={'File Load'} />
      </Grid>
      {renderButtonsView()}
      {isLoading && <CircularProgress />}
      {value.file_url && (
        <Grid item xs={12}>
          <DocViewer
            pluginRenderers={DocViewerRenderers}
            documents={[{ uri: value.file_url }]}
          />
        </Grid>
      )}
    </>
  );
}
