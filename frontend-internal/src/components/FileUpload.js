import React, { Fragment, useState } from "react";
import {
  CustomInput
} from "reactstrap";
import { Button } from "@material-ui/core";
import Message from "./Message";
import ProgressBar from "./ProgressBar";
import STLConfirmationDialog from './STLConfirmationDialog';

export default function FileUpload({ handleFileUpload, itemId, label = "STEP, DXF, GERBER" }) {
  //State
  const [file, setFile] = useState("");
  const [fileName, setFileName] = useState("");
  const [uploadedFile, setUploadedFile] = useState({});
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState();
  const [uploadPercentage, setUploadPercentage] = useState();
  const [open, setOpen] = React.useState(false);

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
    const fileSize = file.size / 1024 / 1024;

    if (fileName.split('.').pop() === 'STL' && fileSize > 20) {
      setOpen(true)
      return;
    }

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
      <STLConfirmationDialog open={open} setOpen={setOpen} />
      {/* </Form> */}
    </Fragment>
  );
}
