import React, { useState, useEffect } from 'react'
import ThreeGeomView from '../3DViewer/GeomViewVendorItem';
// import MeshJSON from '../assets/mesh.json'
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Dropdown, DropdownToggle, DropdownMenu, DropdownItem
} from "reactstrap";
import ItemsAPI from '../../api/items.api';

export default function ThreejsViewModal({ itemId = '', isVisible = false,closeModal }) {
  const [isModalVisible, setIsModalVisible] = useState(isVisible);

  useEffect(() => {
    // if (isVisible) {
    setIsModalVisible(isVisible);
    if (isVisible) {
      fetchStep()
    }
    // }
  }, [isVisible]);

  const loadViewer = (MeshJSON) => {
    try {

      const container = document.getElementById("graphical_view");

      if (container && container != null && container.length === 0) {
        throw Error("Cannot find graphical view div");
      }

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


  const fetchStep = () => {

    ItemsAPI
      .getItemGeomtery(itemId)
      .then(res => {
        setTimeout(() => {
          loadViewer(res.data.step)
        }, 100);

      })
  }

  return (
    <div>
      <Modal isOpen={isModalVisible} toggle={closeModal}>
        <ModalHeader toggle={closeModal}>Details</ModalHeader>
        <ModalBody>
          <div className="Vendor_modal">

            <div className="Vendor_threejs_container">
              <div id="graphical_view" style={{ width: '500px', height: '500px' }}
                className="Viewer_Graphical"></div>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </div>
  )

}
