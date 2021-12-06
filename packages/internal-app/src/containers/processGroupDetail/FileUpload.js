import React, { Fragment, useState } from "react";
import {
  Col,
  Form,
  FormGroup,
  Label,
  Input,
  FormText,
  CustomInput
} from "reactstrap";
import { Button } from "@mui/material";
import axios from "axios";
import Message from "../Message";
import ProgressBar from "../ProgressBar";

export default function FileUpload() {
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

  /*
        onUploadProgress: progressEvent => {
          setUploadPercentage(
            parseInt(
              Math.round((progressEvent.loaded * 100) / progressEvent.total)
            )
          );
          setTimeout(() => setUploadPercentage(0), 1000);
        }
      });
      const { fileName, filePath } = res.data;
      setUploadedFile({ fileName, filePath });
      setMessageType(1);
      setMessage("File Uploaded");
    } catch (err) {
      if (err.response.status === 500) {
        setMessageType(2);
        setMessage("There was a problem with the server");
      } else {
        setMessage(err.response.data.msg);
        setMessageType(2);
      }
    }
  };*/
  /*const onSubmit = async e => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post("/api/upload", formData, {
        /* headers: {
          "Content-Type": "multipart/form-data"
        },*/

  const onSubmit = e => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("file", file);
    axios
      .post("/api/upload", formData)
      .then(res => {
        console.log(res.data);
      })
      .catch(err => {
        console.log(err);
      });
  };
  const getFiles = () => {
    axios
      .get(`/api/upload`)
      .then(res => {
        console.log(res.data);
      })
      .catch(err => {
        console.log(err);
      });
  };

  return (
    <Fragment>
      {message ? <Message msg={message} type={messageType} /> : null}
      {uploadPercentage > 0 && uploadPercentage <= 100 ? (
        <ProgressBar percentage={uploadPercentage} />
      ) : null}

      <Form onSubmit={onSubmit} encType="multipart/form-data">
        <FormGroup row>
          <Button
            style={{ marginLeft: "1%" }}
            color="primary"
            variant="contained"
            onClick={getFiles}
          >
            Get All Uploaded Files
          </Button>

          <Button
            style={{ marginLeft: "1%" }}
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
