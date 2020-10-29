import React, { useEffect, useState } from 'react'
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Form,
  FormGroup,
  Dropdown, DropdownToggle, DropdownMenu, DropdownItem
} from "reactstrap";
import ItemsAPI from '../../api/items.api';

export default function AppComponent({ isAddComponentModalOpen, setIsAddComponentModalOpen, setSelectedItem }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [itemList, setItemList] = useState([]);
  const [localSelectedItem, setLocalSelectedItem] = useState({ name: 'Select Item' })

  const toggleModal = () => {
    setIsAddComponentModalOpen(!isAddComponentModalOpen)
    setModalOpen(prevState => !prevState);
  }
  const toggleDropdown = () => setDropdownOpen(prevState => !prevState);

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

  useEffect(() => {
    if (isAddComponentModalOpen) {
      setModalOpen(true);
    }
  }, [isAddComponentModalOpen])

  const handleChange = (item) => {
    setLocalSelectedItem(item)
  }

  const onSubmit = () => {

  }

  return (
    <Modal className="Add_Component" isOpen={modalOpen} toggle={toggleModal}>
      <ModalHeader toggle={toggleModal}>Add Item</ModalHeader>
      <ModalBody>
        <Form onSubmit={onSubmit}>
          <FormGroup>
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
              toggleModal()
              setSelectedItem(localSelectedItem)
            }
            }>
              Go
          </Button>
          </FormGroup>
        </Form>
      </ModalBody>
    </Modal>
  )
}
