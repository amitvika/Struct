import React, { Component } from 'react'
import MeshJSON from '../../../../assets/mesh.json'
import {
  Modal,
  ModalHeader,
  ModalBody,
} from "reactstrap";
import {
ThreeGeomView
} from '../../../../components';

export default class AssemblyThreejsView extends Component {

  render() {
    const { isModalVisible, handleModalToggle } = this.props;
    return (
      <Modal isOpen={isModalVisible} toggle={handleModalToggle}>
        <ModalHeader toggle={handleModalToggle}>Thressjs</ModalHeader>
        <ModalBody>
          <div style={{ height: '40vh' }}>
            <div  id="graphical_view"
              className="Viewer_Graphical"></div>
          </div >
        </ModalBody>
      </Modal>
    )
  }
}