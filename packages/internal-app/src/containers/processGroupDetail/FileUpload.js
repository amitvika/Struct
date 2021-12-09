import React, { Fragment, useState } from 'react';

import { Button, FormControl } from '@mui/material';
import axios from 'axios';
import Message from '../Message';
import ProgressBar from '../ProgressBar';

export default function FileUpload() {
  //State
  const [file, setFile] = useState('');
  const [fileName, setFileName] = useState('');
  const [uploadedFile, setUploadedFile] = useState({});
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState();
  const [uploadPercentage, setUploadPercentage] = useState();

  //Methods
  const onChange = (e) => {
    //e.preventDefault();
    setFile(e.target.files[0]);
    setFileName(e.target.files[0].name);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);
    axios
      .post('/api/upload', formData)
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const getFiles = () => {
    axios
      .get(`/api/upload`)
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <Fragment>
      {message ? <Message msg={message} type={messageType} /> : null}
      {uploadPercentage > 0 && uploadPercentage <= 100 ? (
        <ProgressBar percentage={uploadPercentage} />
      ) : null}

      <form onSubmit={onSubmit} encType="multipart/form-data">
        <FormControl row>
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
