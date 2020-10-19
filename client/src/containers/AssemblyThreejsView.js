import React, { Component } from 'react'
import ThreeGeomView from './3DViewer/GeomView';
import MeshJSON from '../assets/mesh.json'

export default class AssemblyThreejsView extends Component {

  componentDidMount() {
    const container = document.getElementById("graphical_view");

    if (container.length === 0) {
      throw Error("Cannot find graphical view div");
    }

    let view = new ThreeGeomView.GeomView(container);

    view.clearAll();
    view.updateShapeObject(MeshJSON, function () {
      view.zoomAll();
    });
  }

  render() {
    return (
      <div>
        <div style={{ height: '40vh' }} id="graphical_view"
          className="Viewer_Graphical"></div>

      </div >
    )
  }
}