import React, { useState } from 'react'
import ThreejsViewer from '../3DViewer/ThreejsViewer';
import {
  Modal,
  ModalHeader,
  ModalBody
} from "reactstrap";
import {
  Button,
  Grid
} from "@material-ui/core";

export default function ConfigureItemAssembly({ toggleConfigureItemAssembly, isConfigureItemAssemblyModalOpen, toggleItemSelection }) {
  const [threejsObject, setThreejsObject] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Modal isOpen={isConfigureItemAssemblyModalOpen} toggle={toggleConfigureItemAssembly} style={{ width: '70%' }}>
      <ModalHeader toggle={toggleConfigureItemAssembly}>Configure Item Assembly</ModalHeader>
      <ModalBody>
        <Grid className="section-padding-left" container spacing={2}>
          <Grid item xs={10} >
            <ThreejsViewer data={threejsObject} isLoading={isLoading} />
          </Grid>

          <Grid item xs={2} >
            <Button
              size="large"
              variant="contained"
              color="primary"
              onClick={toggleItemSelection}>
              Select Item
            </Button>
          </Grid>

        </Grid>
      </ModalBody>
    </Modal>
  )
}
