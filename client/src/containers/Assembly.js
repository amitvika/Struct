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
import AddComponent from './AddComponent';

export default function Assembly() {
  const [isAddComponentModalOpen, setIsAddComponentModalOpen] = useState(false);

  return (
    <div>
      <Button variant="contained" color="primary" onClick={() => setIsAddComponentModalOpen(true)}>
        Add Component
      </Button>
      <Paper>
        <Typography variant="h1" component="h2">Component 1</Typography>
      </Paper>
      <AddComponent
        isAddComponentModalOpen={isAddComponentModalOpen}
        setIsAddComponentModalOpen={setIsAddComponentModalOpen}
      />
    </div>
  );
}
