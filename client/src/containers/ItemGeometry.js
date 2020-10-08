import React, { useState, useEffect } from 'react'
import ThreeGeomView from './3DViewer/GeomView';
import MeshJSON from '../assets/mesh.json'
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

export default function ItemGeometry() {

  const [isFileUploading, setIsFileUploading] = useState(false);
  const [meshJson, setMeshJson] = useState(MeshJSON);

  useEffect(() => {
    setTimeout(() => {
      loadViewer()
    }, 0);
  })

  const loadViewer = () => {
    try {
      const container = document.getElementById("graphical_view");

      if (container && container != null && container.length === 0) {
        throw Error("Cannot find graphical view div");
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
    setIsFileUploading(true);
    ProcessGroupAPI
      .uploadStepfile(data)
      .then(res => {
        setMeshJson(res.data);
        setIsFileUploading(false);
      })
      .catch(error => {
        console.log('----->>>>', error)
        setIsFileUploading(false);
      })
  }

  return (
    <div>
      {isFileUploading && <CircularProgress />}
      <FileUpload handleFileUpload={handleFileUpload} />
      <div id="graphical_view"
        className="Viewer_Graphical"></div>

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
    </div >
  )
}
