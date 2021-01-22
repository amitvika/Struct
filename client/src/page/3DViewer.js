import React, { Component } from 'react'
import {
  ThreejsViewer
} from '../components';
import MeshJSON from '../assets/mesh.json'

export default class Viewer extends Component {

  render() {
    return (
      <div>
        <div style={{ height: '80vh' }} >
          <ThreejsViewer data={MeshJSON} isLoading={false} />
        </div>

      </div >
    )
  }
}
