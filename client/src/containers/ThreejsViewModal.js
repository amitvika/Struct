import React, { useState, useEffect } from 'react'
import ThreeGeomView from './3DViewer/GeomView';
// import MeshJSON from '../assets/mesh.json'
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Dropdown, DropdownToggle, DropdownMenu, DropdownItem
} from "reactstrap";
import ItemsAPI from '../api/items.api';

export default function ThreejsViewModal({ isVisible = false }) {
  const [isModalVisible, setIsModalVisible] = useState(isVisible);
  const [itemList, setItemList] = useState([]);
  const [localSelectedItem, setLocalSelectedItem] = useState({ name: 'Select Item' })
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => setDropdownOpen(prevState => !prevState);

  useEffect(() => {
    // if (isVisible) {
      setIsModalVisible(isVisible);
    // }
  }, [isVisible]);

  useEffect(() => {
    ItemsAPI.getItemsAllAPI()
      .then(res => {
        if (Array.isArray(res.data)) {
          setItemList(res.data)
        }
      })
      .catch(error => {
        console.log('Error:-', error)
      })
  }, []);

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


  const handleModalToggle = () => {
    setIsModalVisible(!isModalVisible);
  }

  const handleChange = (item) => {
    setLocalSelectedItem(item);

    ItemsAPI
      .getItemGeomtery(item._id)
      .then(res => {
        setTimeout(() => {
          loadViewer(res.data.step)
        }, 100);

      })
  }

  return (
    <div>
      <Modal isOpen={isModalVisible} toggle={handleModalToggle}>
        <ModalHeader toggle={handleModalToggle}>Thressjs</ModalHeader>
        <ModalBody>
          <div>

            <div id="graphical_view" style={{ height: '80vh' }}
              className="Viewer_Graphical"></div>
            <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
              <DropdownToggle caret>
                {localSelectedItem.name}
              </DropdownToggle>
              <DropdownMenu>
                {
                  itemList.map((item, index) => {
                    return <DropdownItem
                      key={index}
                      onClick={() => handleChange(item)}
                      value={item.name}>{item.name}</DropdownItem>
                  })
                }
              </DropdownMenu>
            </Dropdown>
            <Button color="dark" style={{ marginBottom: "2rem" }} block onClick={() => {
              setLocalSelectedItem(localSelectedItem)
            }
            }>
              Go
          </Button>
          </div>
        </ModalBody>
      </Modal>
    </div>
  )

}
