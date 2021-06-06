import React, { Component } from 'react'
import MeshJSON from '../../../assets/mesh.json'
import {
  Modal,
  ModalHeader,
  ModalBody,
} from "reactstrap";

import {
//   ThreejsViewer
} from '../../../components';

export default class AssemblyThreejsView extends Component {

  render() {
    const { isModalVisible, handleModalToggle } = this.props;
    return (
      <Modal isOpen={isModalVisible} toggle={handleModalToggle}>
        <ModalHeader toggle={handleModalToggle}>Thressjs</ModalHeader>
        <ModalBody>
          <div style={{ height: '40vh' }}>
            {/* <ThreejsViewer isLoading={false}
              data={MeshJSON}
            ></ThreejsViewer> */}
          </div >
        </ModalBody>
      </Modal>
    )
  }
}