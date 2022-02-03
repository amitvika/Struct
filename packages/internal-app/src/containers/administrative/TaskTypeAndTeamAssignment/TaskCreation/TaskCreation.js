import React, { useState } from 'react';
import Grid from '@mui/material/Grid';
import Headding from '@monostruct/common/components/atoms/Headding';
import Select from '@monostruct/common/components/atoms/Select';
import Button from '@mui/material/Button';
import FileHistory from '@monostruct/common/containers/FileHistory';
import ImageAnnotationExcelUI from './ImageAnnotationExcelUI';
import InteractiveTaskExcelUI from './InteractiveTaskExcelUI';

export default function TaskCreation() {
  const [state, _setState] = useState({
    task_type: ''
  });
  const setState = (value) =>
    _setState((prevState) => ({ ...prevState, ...value }));

  const handleTaskTypeChange = ({ value, label }) => {
    setState({ task_type: value });
  };

  return (
    <Grid container spacing={1} sx={{ width: '80%' }}>
      <Grid item xs={2}>
        <Headding bold title={`Task Type`} />
      </Grid>
      <Grid item xs={10}>
        <Select
          placeholder="Select"
          options={['Classification', 'Segmentation', 'Interactive Task'].map(
            (option) => ({
              label: option,
              value: option
            })
          )}
          onChange={handleTaskTypeChange}
          value={state.task_type}
        />
      </Grid>
      {state.task_type === 'Classification' ? <ClassificationForm /> : null}
      {state.task_type === 'Interactive Task' ? <InteractiveTask /> : null}
    </Grid>
  );
}

const ClassificationForm = () => {
  return (
    <>
      <ZipFileImageUpload />
      <ImageAnnotationExcelUI />
    </>
  );
};
const InteractiveTask = () => {
  return (
    <>
      <InteractiveTaskExcelUI />
    </>
  );
};

const ZipFileImageUpload = () => {
  const handleOnFileChange = () => {};
  const fileType = 'zip';

  return (
    <>
      <Grid item xs={2}>
        <Headding bold title={`Zip file of images`} />
      </Grid>
      <Grid item xs={10}>
        <Button variant="contained" component="label">
          Select File
          <input
            onChange={handleOnFileChange}
            type="file"
            hidden
            accept={fileType}
          />
        </Button>
        <FileHistory
          selectedFileName={''}
          // link_id={documentValue.id}
        />
      </Grid>
    </>
  );
};
