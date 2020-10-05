import React, { Fragment, useState } from "react";
import {
  Col,
  Form,
  FormGroup,
  CustomInput
} from "reactstrap";
import { Button } from "@material-ui/core";
import Message from "./Message";
import ProgressBar from "./ProgressBar";

export default function FileUpload({ handleFileUpload }) {
  //State
  const [file, setFile] = useState("");
  const [fileName, setFileName] = useState("");
  const [uploadedFile, setUploadedFile] = useState({});
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState();
  const [uploadPercentage, setUploadPercentage] = useState();

  //Methods
  const onChange = e => {
    //e.preventDefault();
    setFile(e.target.files[0]);
    setFileName(e.target.files[0].name);
  };

  const onSubmit = e => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("file", file);
    handleFileUpload(formData)
  };

  return (
    <Fragment>
      {message ? <Message msg={message} type={messageType} /> : null}
      {uploadPercentage > 0 && uploadPercentage <= 100 ? (
        <ProgressBar percentage={uploadPercentage} />
      ) : null}

      <Form onSubmit={onSubmit} encType="multipart/form-data">
        <FormGroup row>
          <Col>
            <CustomInput
              type="file"
              id="file"
              name="file"
              label="Upload Goal Geometry File - STEP Files Only"
              onChange={onChange}
            />
          </Col>

          <Button
            style={{ marginLeft: "1%" }}
            variant="contained"
            color="primary"
            type="submit"
            value="upload"
          >
            Load File
          </Button>
        </FormGroup>
      </Form>
    </Fragment>
  );
}
