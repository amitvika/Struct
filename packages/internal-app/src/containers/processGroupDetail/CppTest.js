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
import { Button } from "@material-ui/core";
import axios from "axios";

export default function CppTest() {
  //State
  const [file, setFile] = useState("");

  //Methods

  const getFiles = () => {
    axios
      .get(`/api/cpp`)
      .then(res => {
        console.log(res.data);
      })
      .catch(err => {
        console.log(err);
      });

    console.log("get files");
  };

  return (
    <Fragment>
      <Form encType="multipart/form-data">
        <FormGroup row>
          <Button
            style={{ marginLeft: "1%" }}
            color="primary"
            variant="contained"
            onClick={getFiles}
          >
            Get C++ Output
          </Button>
        </FormGroup>
      </Form>
    </Fragment>
  );
}
