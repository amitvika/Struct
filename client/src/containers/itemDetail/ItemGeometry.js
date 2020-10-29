import React, { useState, useEffect } from 'react'
import ThreeGeomView from '../3DViewer/GeomView';

import FileUpload from '../../components/FileUpload';

import Grid from '@material-ui/core/Grid';
import {
  Button,
  Snackbar,
  Paper,
  CircularProgress
} from "@material-ui/core";
import GeometryInput from './GeometryInput';

import ProcessGroupAPI from '../../api/processGroup.api'
import ItemAPI from '../../api/items.api';

export default function ItemGeometry({ itemId, itemDetail }) {

  const [isLoading, setIsLoading] = useState(false);
  const [isStepLoaded, setIsStepLoaded] = useState(false);
  const [itemData, setItemData] = useState({});

  useEffect(() => {
    console.log(itemDetail)
    if (itemDetail) {
      setItemData(itemDetail);
      if (itemDetail.step) {
        setIsStepLoaded(true);
      }
      setTimeout(() => {
        if (itemDetail.step) {
          loadViewer(itemDetail.step)
        }
      }, [1000])
    }
  }, [itemDetail])

  const loadViewer = (meshJson) => {
    try {
      const container = document.getElementById("graphical_view");

      if (container === null || container.length === 0) {
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
    // setIsLoading(true);
    ItemAPI
      .deleteItemGeomtery(itemId)
      .then(res => {
        loadViewer({})
        setIsStepLoaded(false);
      })
      .catch(error => {
        // setIsLoading(false);
      })
  }

  const handleSave = () => {
    // setIsLoading(true);
    ItemAPI
      .updateItemGeomtery(itemId, itemData)
      .then(res => {
        setItemData(res.data)
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
            <GeometryInput setItemData={setItemData} itemData={itemData} />
          </Grid>
        </Paper>

      }


      <div id="graphical_view"
        className="Viewer_Graphical"></div>

      <Snackbar
        open={true}
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
          onClick={handleSave}>
          Save
          </Button>
      </Snackbar>
    </div >
  )
}
