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
import AddComponent from './AssemblyAddComponent';
import AssemblyComponent from './AssemblyComponent';

export default function Assembly() {
  const [isAddComponentModalOpen, setIsAddComponentModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState({});

  return (
    <div>
      {
        Object.keys(selectedItem).length > 0 ?
          <AssemblyComponent
            setIsAddComponentModalOpen={setIsAddComponentModalOpen}
            selectedItem={selectedItem}
          /> :
          <Button variant="contained" color="primary" onClick={() => setIsAddComponentModalOpen(true)}>
            Add Component
      </Button>
      }
      <AddComponent
        isAddComponentModalOpen={isAddComponentModalOpen}
        setIsAddComponentModalOpen={setIsAddComponentModalOpen}
        setSelectedItem={setSelectedItem}
      />
    </div>
  );
}
