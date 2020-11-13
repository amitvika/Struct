import React, { useState, useEffect } from 'react'
import ThreejsViewer from '../3DViewer/ThreejsViewer';
// import MeshJSON from '../assets/mesh.json'
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Dropdown, DropdownToggle, DropdownMenu, DropdownItem
} from "reactstrap";
import ItemsAPI from '../../api/items.api';

export default function ThreejsViewModal({ isVisible = false, setIsThreejsVisible }) {
  const [isModalVisible, setIsModalVisible] = useState(isVisible);
  const [itemList, setItemList] = useState([]);
  const [localSelectedItem, setLocalSelectedItem] = useState({ name: 'Select Item' })
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [jsonMesh, setJSONMesh] = useState({});

  const toggleDropdown = () => setDropdownOpen(prevState => !prevState);

  useEffect(() => {
    // if (isVisible) {
    setIsModalVisible(isVisible);
    if (isVisible) {
      setJSONMesh({});
      setLocalSelectedItem({ name: 'Select Item' })
    }
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


  const handleChange = (item) => {
    setLocalSelectedItem(item);

    ItemsAPI
      .getItemGeomtery(item._id)
      .then(res => {
        setTimeout(() => {
          setJSONMesh(res.data.step)
        }, 100);

      })
  }

  return (
    <div>
      <Modal isOpen={isModalVisible} toggle={() => setIsThreejsVisible(false)}>
        <ModalHeader toggle={() => setIsThreejsVisible(false)}>Thressjs</ModalHeader>
        <ModalBody>
          <div>

            <ThreejsViewer jsonMesh={jsonMesh} />
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
