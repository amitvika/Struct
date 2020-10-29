import React, {  } from "react";

import FileUpload from "../../components/sharedFunctionComponents/FileUpload";
import ThreeDViewer from "../../components/sharedFunctionComponents/ThreeDViewer";
import CppTest from "../../components/sharedFunctionComponents/CppTest";

export default function Machining() {
  return (
    <div>
      <FileUpload />
      <CppTest />
      <ThreeDViewer />
    </div>
  );
}
