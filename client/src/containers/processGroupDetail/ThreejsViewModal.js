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
import AssemblyProcessAPI from '../../api/assemblyProcess.api';

export default function ThreejsViewModal({ isVisible = false, setIsThreejsVisible, assemblyProcessData }) {
  const [isModalVisible, setIsModalVisible] = useState(isVisible);
  const [itemList, setItemList] = useState([]);
  const [localSelectedItem, setLocalSelectedItem] = useState({ name: 'Select Item' })
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [threejsObject, setThreejsObject] = useState({});

  const toggleDropdown = () => setDropdownOpen(prevState => !prevState);

  useEffect(() => {
    // if (isVisible) {
    setIsModalVisible(isVisible);
    if (isVisible) {
      setThreejsObject({});
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
      });
  }, []);

  useEffect(() => {
    if (assemblyProcessData && assemblyProcessData.itemId) {
      fetchThreejs(assemblyProcessData.itemId);
    }
  }, [assemblyProcessData]);

  const fetchThreejs = (itemId) => {
    ItemsAPI
      .getItemThreejsData(itemId)
      .then(res => {
        setTimeout(() => {
          setThreejsObject(res.data)
        }, 100);

      })
  }

  const handleChange = (item) => {
    setLocalSelectedItem(item);
    fetchThreejs(item._id);
  }

  const handleSubmitButton = () => {
    if (!assemblyProcessData) {
      return;
    }

    AssemblyProcessAPI.updateAssemblyProcessApi(assemblyProcessData._id, { itemId: localSelectedItem._id })
      .then(res => {
        console.log('Response --->>>', res)
        if (res.data.success) {

        }
      })
      .catch(error => {
        console.log('--->>>>')
      })

  }

  return (
    <div>
      <Modal isOpen={isModalVisible} toggle={() => setIsThreejsVisible(false)}>
        <ModalHeader toggle={() => setIsThreejsVisible(false)}>Thressjs</ModalHeader>
        <ModalBody>
          <div style={{ display: 'flex', flexDirection: 'row', height: '75vh' }}>
            <div style={{ width: '70%' }}>
              <ThreejsViewer data={threejsObject} />
            </ div>
            <div style={{ width: '30%' }}>
              <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown} style={{ marginBottom: "2rem" }}>
                <DropdownToggle caret style={{ width: '100%' }}>
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
              <Button color="dark" style={{ marginBottom: "2rem" }} block onClick={handleSubmitButton}>
                Go
          </Button>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </div>
  )

}
