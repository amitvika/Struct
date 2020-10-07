import React, { useState, useEffect } from 'react'
import ThreeGeomView from './3DViewer/GeomView';
import MeshJSON from '../assets/mesh.json'
import {
  Modal,
  ModalHeader,
  ModalBody,
} from "reactstrap";

export default function ThreejsViewModal({ isVisible = false }) {
  const [isModalVisible, setIsModalVisible] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setTimeout(() => {
        loadViewer();

      }, 3000)
      setIsModalVisible(!isModalVisible);
    }
  }, [isVisible]);

  useEffect(() => {

  }, []);

  const loadViewer = () => {
    try {

      const container = document.getElementById("graphical_view");

      if (container && container != null && container.length === 0) {
        throw Error("Cannot find graphical view div");
      }
      console.log('--->>', container)
      let view = new ThreeGeomView.GeomView(container);

      view.clearAll();
      view.updateShapeObject(MeshJSON, function () {
        view.zoomAll();
      });
    }
    catch (error) {
      console.log('00000', error)
    }
  }

  const handleModalToggle = () => {
    setIsModalVisible(!isModalVisible);
  }

  return (
    <div>
      <Modal isOpen={isModalVisible} toggle={handleModalToggle}>
        <ModalHeader toggle={handleModalToggle}>Thressjs</ModalHeader>
        <ModalBody>
          <div id="graphical_view"
            className="Viewer_Graphical"></div>
        </ModalBody>
      </Modal>
    </div>
  )

}
