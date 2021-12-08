import React, { Fragment, useState } from 'react';
import { Button } from '@mui/material';
import FormControl from '@mui/material/FormControl';
export default function FileUpload({ handleFileUpload, getFiles }) {
  //State
  const [file, setFile] = useState('');

  const onChange = (e) => {
    e.preventDefault();
    setFile(e.target.files[0]);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);
    handleFileUpload(formData);
  };

  return (
    <Fragment>
      <form onSubmit={onSubmit} encType="multipart/form-data">
        <FormControl>
          <Button
            style={{ marginLeft: '1%' }}
            color="primary"
            variant="contained"
            onClick={getFiles}
          >
            Get All Uploaded Files
          </Button>

          <Button
            style={{ marginLeft: '1%' }}
            variant="contained"
            color="primary"
            type="submit"
            value="upload"
          >
            Load File
          </Button>

          <label htmlFor="btn-upload">
            <input
              id="btn-upload"
              name="btn-upload"
              style={{ display: 'none' }}
              type="file"
              onChange={onChange}
            />
            <Button className="btn-choose" variant="outlined" component="span">
              Upload Goal Geometry File - STEP Files Only
            </Button>
          </label>
        </FormControl>
      </form>
    </Fragment>
  );
}
