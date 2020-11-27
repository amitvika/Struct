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

export default function FileUpload({ handleFileUpload, itemId, label = "Upload CAD File - STEP and STL files only" }) {
  //State
  const [file, setFile] = useState("");
  const [fileName, setFileName] = useState("");
  const [uploadedFile, setUploadedFile] = useState({});
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState();
  const [uploadPercentage, setUploadPercentage] = useState();

  //Methods
  const onChange = e => {
    if (!e.target.files[0]) {
      return;
    }
    //e.preventDefault();
    setFile(e.target.files[0]);
    setFileName(e.target.files[0].name);
  };

  const onSubmit = e => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("itemId", itemId);
    handleFileUpload(formData)
  };

  return (
    <Fragment>
      {message ? <Message msg={message} type={messageType} /> : null}
      {uploadPercentage > 0 && uploadPercentage <= 100 ? (
        <ProgressBar percentage={uploadPercentage} />
      ) : null}

      {/* <Form> */}
      <div style={{ display: 'flex' }}>
        {/* <Col> */}
        <CustomInput
          type="file"
          id="file"
          name="file"
          label={label}
          onChange={onChange}
        />
        {/* </Col> */}

        <Button
          style={{ marginLeft: "1%", width: '25%' }}
          variant="contained"
          color="primary"
          type="button"
          onClick={onSubmit}
        >
          Load File
          </Button>
      </div>
      {/* </Form> */}
    </Fragment>
  );
}
