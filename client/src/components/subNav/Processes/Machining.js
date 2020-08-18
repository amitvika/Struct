import axios from "axios";
import React, { Component, useState, useEffect } from "react";
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
import FileUpload from "../../sharedFunctionComponents/FileUpload";
import ThreeDViewer from "../../sharedFunctionComponents/ThreeDViewer";
import CppTest from "../../sharedFunctionComponents/CppTest";
export default function Machining() {
  return (
    <div>
      <FileUpload />
      <CppTest />
      <ThreeDViewer />
    </div>
  );
}
