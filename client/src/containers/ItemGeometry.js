import React, { useState, useEffect } from 'react'
import ThreeGeomView from './3DViewer/GeomView';
import FileUpload from '../components/FileUpload';
import ProcessGroupAPI from '../api/processGroup.api'
import ChooseGeometry from './ChooseGeometry';
import ChooseMaterial from './ChooseMaterial';
import ChooseItemType from './ChooseItemType';
import {
  Button,
  Snackbar,
  Paper,
  CircularProgress
} from "@material-ui/core";
import ItemAPI from '../api/items.api';

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

      <div id="graphical_view"
        className="Viewer_Graphical"></div>

      {
        !isStepLoaded && <>


          <Paper elevation={0} className="ItemGeometry--Choose">
            <ChooseGeometry />
            <ChooseMaterial />
            <ChooseItemType />
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
    </div >
  )
}
