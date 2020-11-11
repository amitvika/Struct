import React, { useState, useEffect } from "react";
import Grid from '@material-ui/core/Grid';
import { Button } from "@material-ui/core";

import Select from '../../components/atoms/Select';
import ItemsAPI from '../../api/items.api';
import MeshJSON from '../../assets/mesh.json'
import ThreeGeomView from '../3DViewer/GeomViewMachining';

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
    loadViewer()
  }, []);

  const loadViewer = () => {
    try {

      const container = document.getElementById("graphical_view");

      if (container && container != null && container.length === 0) {
        throw Error("Cannot find graphical view div");
      }

      let view = new ThreeGeomView.GeomView(container);

      view.clearAll();
      view.updateShapeObject(MeshJSON, function () {
        view.zoomAll();
      });
    }
    catch (error) {
      console.log('00000', error)
    }
  }

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
        <div id="graphical_view" style={{ height: '80vh' }}
          className="Viewer_Graphical"></div>
      </Grid>
      <Grid item xs={4} >
        <Button color="primary">
          Generate toolpath
      </Button>
      </Grid>
    </Grid>
  );
}
