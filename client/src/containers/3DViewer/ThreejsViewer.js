import React, { useEffect, useState } from 'react'
import ThreeGeomView from '../Geoms/GeomView';
import Headding from '../../components/atoms/Headding'
import './style.css';

export default function ThreejsViewer({ jsonMesh = {} }) {

  useEffect(() => {

    if (Object.keys(jsonMesh).length > 0) {
      setTimeout(() => {
        loadViewer()
      }, [2000])
    }
  }, [jsonMesh]);

  const loadViewer = () => {
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

      console.log(jsonMesh);

      view.updateShapeObject(jsonMesh, function () {
        view.zoomAll();
      });
    }
    catch (error) {
      console.log('00000', error)
    }
  }

  if (Object.keys(jsonMesh).length === 0) {
    return <div className="ThreejsView__Container">
      <Headding bold title={'3d Viewer: Cad File Not Loaded'} />
      </div>
  }

  return (
    <div className="ThreejsView__Container">
      <Headding bold title={'3D Viewer'} />
      <div id="graphical_view"
        className="Viewer_Graphical"></div>
    </div>
  )
}
