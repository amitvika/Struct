import React, { useState, useEffect } from "react";
import {
  Button,
  Paper,
  Grid
} from "@material-ui/core";

import Select from '../../components/atoms/Select';
import ItemsAPI from '../../api/items.api';
import MeshJSON from '../../assets/mesh.json'
import ThreejsViewer from '../3DViewer/ThreejsViewer';
import ThreeDViewer from "../../components/sharedFunctionComponents/ThreeDViewer";
import FileUpload from "../../components/sharedFunctionComponents/FileUpload";
// import ThreeDViewer from "../../sharedFunctionComponents/ThreeDViewer";
import CppTest from "../../components/sharedFunctionComponents/CppTest";

export default function Machining() {
  const [itemListOption, setItemListOption] = useState([]);

  useEffect(() => {
    ItemsAPI.getItemsAllAPI()
      .then(res => {
        if (Array.isArray(res.data)) {
          setItemListOption(res.data.map(item => {
            return {
              label: item.name,
              value: item.name
            }
          }))
        }
      })
      .catch(error => {
        console.log('Error:-', error)
      })
  }, []);

  return (
    <Paper style={{ padding: 10, margin: 10 }}>
      <Grid className="section-padding-left" container spacing={4}>
        <Grid item xs={12} >
          <FileUpload />
          {/* <Select
          label="Item Type"
          placeholder="Select"
          options={itemListOption}
        /> */}
        </Grid>
        <Grid item xs={12} >
          <CppTest />
        </Grid>
        <Grid item xs={12} >
          <ThreeDViewer />
          {/* <ThreejsViewer data={{ step: MeshJSON }} /> */}
        </Grid>
        <Grid item xs={4} >
          <Button color="primary">
            Generate toolpath
      </Button>
        </Grid>
      </Grid>
    </Paper>
  );
}
