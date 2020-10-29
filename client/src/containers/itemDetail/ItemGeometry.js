import React, { useState, useEffect } from 'react'
import ThreeGeomView from '../3DViewer/GeomView';

import Space from '../../components/atoms/Space';
import Select from '../../components/atoms/Select';
import Input from '../../components/atoms/Input';
import FileUpload from '../../components/FileUpload';

import Grid from '@material-ui/core/Grid';
import {
  Button,
  Snackbar,
  Paper,
  CircularProgress
} from "@material-ui/core";
import ProcessGroupAPI from '../../api/processGroup.api'
import ItemAPI from '../../api/items.api';

export default function ItemGeometry({ itemId }) {

  const [isLoading, setIsLoading] = useState(false);
  const [isStepLoaded, setIsStepLoaded] = useState(false);

  useEffect(() => {
    setIsLoading(true);

    ItemAPI
      .getItemGeomtery(itemId)
      .then(res => {
        setIsLoading(false);

        if (res.data.step) {
          setIsStepLoaded(true);
          setTimeout(() => {
            loadViewer(res.data.step)
          }, 1000);
        }

      })
      .catch(error => {
        setIsStepLoaded(false);
        setIsLoading(false);
      })
  }, [])

  const loadViewer = (meshJson) => {
    try {
      const container = document.getElementById("graphical_view");

      if (container && container != null && container.length === 0) {
        throw Error("Cannot find graphical view div");
      }

      if (container) {
        container.innerHTML = '';
      }

      let view = new ThreeGeomView.GeomView(container);

      view.clearAll();
      view.updateShapeObject(meshJson, function () {
        view.zoomAll();
      });
    }
    catch (error) {
      console.log('00000', error)
    }
  }

  const handleFileUpload = (data) => {
    setIsLoading(true);
    ProcessGroupAPI
      .uploadStepfile(data)
      .then(res => {
        setIsStepLoaded(false);
        setIsLoading(false);
      })
      .catch(error => {
        // console.log('----->>>>', error)
        setIsLoading(false);
      })
  }

  const removeFile = (data) => {
    setIsLoading(true);
    ItemAPI
      .deleteItemGeomtery(itemId)
      .then(res => {
        loadViewer({})
        setIsLoading(false);
      })
      .catch(error => {
        setIsLoading(false);
      })
  }

  if (isLoading) {
    return <CircularProgress />
  }
  return (
    <div>
      {
        !isStepLoaded && <>
          <Paper elevation={0} className="ItemGeometry--Choose">
            <Grid className="section-padding-left" container spacing={4}>

              <Grid item xs={12}>
                {isStepLoaded ?
                  <Button
                    className="mt-2 mb-3"
                    variant="contained"
                    color="primary"
                    onClick={removeFile}>
                    Clear File
                    </Button>
                  :
                  <FileUpload handleFileUpload={handleFileUpload} itemId={itemId} />

                }
              </Grid>
              <Grid item xs={4} >
                <Select
                  label="Geometry"
                  placeholder="Select"
                  options={[
                    { label: "1 Dimensional", value: "1 Dimensional" },
                    { label: "2 Dimensional", value: "2 Dimensional" },
                    { label: "3 Dimensional", value: "3 Dimensional" }]}
                />
              </Grid>
              <Grid item xs={4} >
                <Select
                  label="Material"
                  placeholder="Select"
                  options={[
                    { label: "Polymer", value: "Polymer" },
                    { label: "Metal", value: "Metal" },
                    { label: "Ceramic", value: "Ceramic" }]}
                />
              </Grid>
              <Grid item xs={4}>
                <Select
                  label="Item Type"
                  placeholder="Select"
                  options={[
                    { label: "Single Material Part", value: "Single Material Part" },
                    { label: "Metal", value: "Metal" }]}
                />
              </Grid>
              <Grid item xs={4}>
                <Input
                  label="Mass (g)"
                  placeholder="Enter"
                  type="number"
                />
              </Grid>
              <Grid item xs={4}>
                <Input
                  label="Volume (mm^3)"
                  placeholder="Enter"
                  type="number"
                />
              </Grid>
              <Grid item xs={4}></Grid>
              <Grid item xs={4}>
                <Input
                  label="Bounding Box x (mm)"
                  placeholder="Enter"
                  type="number"
                />
              </Grid>
              <Grid item xs={4}>
                <Input
                  label="Bounding Box y (mm)"
                  placeholder="Enter"
                  type="number"
                />
              </Grid>
              <Grid item xs={4}>
                <Input
                  label="Bounding Box z (mm)"
                  placeholder="Enter"
                  type="number"
                />
              </Grid>
              <Grid item xs={4}>
                <Input
                  label="Number of Faces"
                  placeholder="Enter"
                  type="number"
                />
              </Grid>
              <Grid item xs={4}>
                <Input
                  label="Number of Edges"
                  placeholder="Enter"
                  type="number"
                />
              </Grid>
              <Grid item xs={4}>
                <Input
                  label="Number of Corners"
                  placeholder="Enter"
                  type="number"
                />
              </Grid>
            </Grid>
          </Paper>

          <Snackbar
            open={true}
            //autoHideDuration={10000}
            //onClose={this.handleClose}
            style={{
              marginRight: "17%"
            }}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right"
            }}
          >
            <Button
              className="mt-2 mb-3"
              variant="contained"
              color="primary"
              onClick={() => { }}>
              Save
          </Button>
          </Snackbar>
        </>
      }

      <div id="graphical_view"
        className="Viewer_Graphical"></div>
    </div >
  )
}
