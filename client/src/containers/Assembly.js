import React, { useState, useEffect } from "react";
import {
  Button,
  Snackbar,
  Checkbox,
  Link,
  Breadcrumbs,
  Typography,
  Paper,
  CardContent
} from "@material-ui/core";
import AssemblyTable from './AssemblyTable';
import AssemblyThreejsView from './AssemblyThreejsView'

export default function Assembly() {

  return (
    <div>
      <AssemblyThreejsView />
      <AssemblyTable />
    </div>
  );
}
