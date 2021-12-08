import React, { useEffect, useState } from 'react';
import ItemsAPI from '@monostruct/common/api/items.api';
import MainModal from '@monostruct/common/components/Modal';

export default function AppComponent({
  isAddComponentModalOpen,
  setIsAddComponentModalOpen,
  setSelectedItem
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [itemList, setItemList] = useState([]);
  const [localSelectedItem, setLocalSelectedItem] = useState({
    name: 'Select Item'
  });

  const toggleModal = () => {
    setIsAddComponentModalOpen(!isAddComponentModalOpen);
    setModalOpen((prevState) => !prevState);
  };
  const toggleDropdown = () => setDropdownOpen((prevState) => !prevState);

  useEffect(() => {
    ItemsAPI.getItemsAllAPI()
      .then((res) => {
        if (Array.isArray(res.data)) {
          setItemList(res.data);
        }
      })
      .catch((error) => {
        console.log('Error:-', error);
      });
  }, []);

  useEffect(() => {
    if (isAddComponentModalOpen) {
      setModalOpen(true);
    }
  }, [isAddComponentModalOpen]);

  const handleChange = (item) => {
    setLocalSelectedItem(item);
  };

  const onSubmit = () => {};

  return (
    <MainModal open={modalOpen} toggleModal={toggleModal} title={'Add Item'}>
      <Select
        labelId="demo-multiple-name-label"
        id="demo-multiple-name"
        multiple
        value={localSelectedItem.name}
        onChange={handleChange}
        input={<OutlinedInput label="Name" />}
      >
        {itemList.map(({ name }) => (
          <MenuItem key={name} value={name}>
            {name}
          </MenuItem>
        ))}
      </Select>
      <Button
        color="dark"
        style={{ marginBottom: '2rem' }}
        block
        onClick={() => {
          toggleModal();
          setSelectedItem(localSelectedItem);
        }}
      >
        Go
      </Button>
    </MainModal>
  );
}
