import React, { useEffect, useState } from 'react'
import CircularProgress from '@material-ui/core/CircularProgress';

import ThreeGeomView from './Geoms/GeomView';
import ThreeSTLView from './Geoms/STLView';
import Headding from '../atoms/Headding'
import './style.css';

export default function ThreejsViewer({ data = {}, isLoading = false }) {

  useEffect(() => {

    if (Object.keys(data).length > 0) {
      setTimeout(() => {
        loadViewer()
      }, [2000])
    }
  }, [data]);

  const loadViewer = () => {
    try {
      const container = document.getElementById("graphical_view");

      if (container === null || container.length === 0) {
        throw Error("Cannot find graphical view div");
      }

      if (container) {
        container.innerHTML = '';
      }
      let view;

      if (data.step !== null) {
        view = new ThreeGeomView.GeomView(container);
        view.clearAll();

        view.updateShapeObject(data.step, function () {
          view.zoomAll();
        });
      }
      else if (data.stl !== null) {
        view = new ThreeSTLView.GeomView(container);
        view.clearAll();

        view.updateShapeObject(data.stl, function () {
          view.zoomAll();
        });
      }

    }
    catch (error) {
      console.log('00000', error)
    }
  }

  if (data.step === null && data.stl === null) {
    return <div className="ThreejsView__Container">
      <Headding bold title={'3d Viewer: Cad File Not Loaded'} />
    </div>
  }

  if (isLoading) {
    return <CircularProgress />
  }

  return (
    <div className="ThreejsView__Container">
      <Headding bold title={'3D Viewer'} />
      <div id="graphical_view"
        className="Viewer_Graphical"></div>
    </div>
  )
}
