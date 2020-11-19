import React, { useState, useEffect } from "react";
import Grid from '@material-ui/core/Grid';
import { Button } from "@material-ui/core";

import Select from '../../components/atoms/Select';
import ItemsAPI from '../../api/items.api';
import MeshJSON from '../../assets/mesh.json'
import ThreejsViewer from '../3DViewer/ThreejsViewer';

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
    <Grid className="section-padding-left" container spacing={4}>
      <Grid item xs={12} >
        <Select
          label="Item Type"
          placeholder="Select"
          options={itemListOption}
        />
      </Grid>
      <Grid item xs={12} >
        <ThreejsViewer data={{ step: MeshJSON }} />
      </Grid>
      <Grid item xs={4} >
        <Button color="primary">
          Generate toolpath
      </Button>
      </Grid>
    </Grid>
  );
}
