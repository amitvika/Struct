import React, { useState } from 'react';
import { Headding } from '@ravibasil/common/components';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

import { makeStyles } from '@material-ui/core/styles';
import DocViewer, { DocViewerRenderers } from 'react-doc-viewer';

const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(1),
  },
  fileLoadContainer: {
    display: 'flex',
    alignItems: 'center',
  },
}));

export default function FileUpload({
  value,
  handleOnChange,
  isDesignModalOpened = true,
  fileType = '.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel',
}) {
  const classes = useStyles();

  const [selectedFile, setSelectedFile] = useState(null);

  const handleOnFileChange = async (event) => {
    if (!event.target.files[0]) {
      return;
    }
    setSelectedFile(event.target.files[0]);
  };

  const handleLoadFile = async () => {
    setSelectedFile(null);
    handleOnChange(selectedFile);
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
