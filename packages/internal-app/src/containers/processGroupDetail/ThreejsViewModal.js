import React, { useState, useEffect } from 'react';
import ItemsAPI from '@monostruct/common/api/items.api';
import AssemblyProcessAPI from '@monostruct/common/api/assemblyProcess.api';
import MainModal from '@monostruct/common/components/Modal';
import OutlinedInput from '@mui/material/OutlinedInput';
import { MenuItem, Select, Tooltip } from '@mui/material';
import { Button } from 'bootstrap';

export default function ThreejsViewModal({
  isVisible = false,
  setIsThreejsVisible,
  assemblyProcessData = {}
}) {
  const [isModalVisible, setIsModalVisible] = useState(isVisible);
  const [itemList, setItemList] = useState([]);
  const [localSelectedItem, setLocalSelectedItem] = useState({
    name: 'Select Item'
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [threejsObject, setThreejsObject] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const toggleDropdown = () => setDropdownOpen((prevState) => !prevState);

  const [tooltipOpen, setTooltipOpen] = useState(false);

  const toggle = () => setTooltipOpen(!tooltipOpen);

  useEffect(() => {
    // if (isVisible) {
    setIsModalVisible(isVisible);
    if (isVisible) {
      setThreejsObject({});
      setLocalSelectedItem({ name: 'Select Item' });
    }
    // }
  }, [isVisible]);

  useEffect(() => {
    if (!assemblyProcessData.action) {
      return;
    }

    setIsLoading(true);
    ItemsAPI.getItemsAllAPI(`item_type=${assemblyProcessData.action}`)
      .then((res) => {
        setIsLoading(false);
        let itemListClone = [];

        if (Array.isArray(res.data)) {
          itemListClone = res.data;
          setItemList(itemListClone);
        }

        if (assemblyProcessData && assemblyProcessData.itemId) {
          updateThreejsModel(assemblyProcessData.itemId);
        }
      })
      .catch((error) => {
        setIsLoading(false);
        console.log('Error:-', error);
      });
  }, [assemblyProcessData.action]);

  const updateThreejsModel = (itemId) => {
    setTimeout(() => {
      setThreejsObject(itemList.filter((item) => item.itemId === itemId)[0]);
    }, 100);
  };

  const handleChange = (item) => {
    setLocalSelectedItem(item);
    updateThreejsModel(item._id);
  };

  const handleSubmitButton = () => {
    if (!assemblyProcessData) {
      return;
    }

    AssemblyProcessAPI.updateAssemblyProcessApi(assemblyProcessData._id, {
      itemId: localSelectedItem._id
    })
      .then((res) => {
        console.log('Response --->>>', res);
        if (res.data.success) {
        }
      })
      .catch((error) => {
        console.log('--->>>>');
      });
  };

  return (
    <MainModal
      open={isModalVisible}
      toggleModal={() => setIsThreejsVisible(false)}
      title={'Thressjs'}
    >
      <div style={{ display: 'flex', flexDirection: 'row', height: '75vh' }}>
        <div style={{ width: '70%' }}>
          {/* <ThreejsViewer data={threejsObject} isLoading={isLoading} /> */}
        </div>
        <Tooltip
          title={
            assemblyProcessData.action === 'Work Holding 1'
              ? `This will only show items of type "Machine - Tool/Workholding. Please ensure item has 3d model loaded, otherwise it will not populate here`
              : `Please ensure item has 3d model loaded, otherwise it will not populate here`
          }
        ></Tooltip>
        <div style={{ width: '30%' }}>
          <Select
            labelId="demo-multiple-name-label"
            id="demo-multiple-name"
            multiple
            value={localSelectedItem.name}
            onChange={handleChange}
            input={<OutlinedInput label="Name" />}
          >
            {itemList.map((name) => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
          </Select>

          <Button
            style={{ marginBottom: '2rem' }}
            block
            onClick={handleSubmitButton}
          >
            Go
          </Button>
        </div>
      </div>
    </MainModal>
  );
}
