import React, { Fragment, useState } from 'react';
import { Col, Form, FormGroup, CustomInput } from 'reactstrap';
import { Button } from '@material-ui/core';

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
      <Form onSubmit={onSubmit} encType="multipart/form-data">
        <FormGroup row>
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

          <Col>
            <CustomInput
              type="file"
              id="file"
              name="file"
              label="Upload Goal Geometry File - STEP Files Only"
              onChange={onChange}
            />
          </Col>
        </FormGroup>
      </Form>
    </Fragment>
  );
}
