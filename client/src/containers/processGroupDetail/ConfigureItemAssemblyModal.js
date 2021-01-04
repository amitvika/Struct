import React, { useState } from 'react'
import ThreejsViewer from '../3DViewer/ThreejsViewer';
import {
  Modal,
  ModalHeader,
  ModalBody
} from "reactstrap";
import {
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@material-ui/core";
import Headding from '../../components/atoms/Headding';
import { Link } from 'react-router-dom';

export default function ConfigureItemAssembly({ toggleConfigureItemAssembly,
  isConfigureItemAssemblyModalOpen,
  toggleItemSelection,
  selectedItem }) {
  const [threejsObject, setThreejsObject] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Modal isOpen={isConfigureItemAssemblyModalOpen} toggle={toggleConfigureItemAssembly} style={{ width: '70%' }}>
      <ModalHeader toggle={toggleConfigureItemAssembly}>Configure Item Assembly</ModalHeader>
      <ModalBody>
        <Grid className="section-padding-left" container spacing={2}>
          <Grid item xs={8} >
            <ThreejsViewer data={threejsObject} isLoading={isLoading} />
          </Grid>

          <Grid item xs={4} >
            <Button
              size="large"
              variant="contained"
              color="primary"
              onClick={toggleItemSelection}>
              Select Item
            </Button>
          </Grid>
          <Grid item xs={8} ></Grid>
          <Grid item xs={4}>
            {
              Object.keys(selectedItem).length > 0 &&
              (
                <Grid item xs={12} style={{ display: 'flex' }}>
                  <Headding title={'Selected Item: '} />
                  <Link to={`/items/${selectedItem._id}`}>{selectedItem.name}</Link>
                </Grid>
              )
            }
          </Grid>

        </Grid>
      </ModalBody>
    </Modal>
  )
}
