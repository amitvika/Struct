import React, { useState, useEffect } from 'react';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Tooltip,
} from 'reactstrap';
import ItemsAPI from '@monostruct/common/api/items.api';
import AssemblyProcessAPI from '@monostruct/common/api/assemblyProcess.api';

export default function ThreejsViewModal({
  isVisible = false,
  setIsThreejsVisible,
  assemblyProcessData = {},
}) {
  const [isModalVisible, setIsModalVisible] = useState(isVisible);
  const [itemList, setItemList] = useState([]);
  const [localSelectedItem, setLocalSelectedItem] = useState({
    name: 'Select Item',
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
      itemId: localSelectedItem._id,
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
    <div>
      <Modal isOpen={isModalVisible} toggle={() => setIsThreejsVisible(false)}>
        <ModalHeader toggle={() => setIsThreejsVisible(false)}>
          Thressjs
        </ModalHeader>
        <ModalBody>
          <div
            style={{ display: 'flex', flexDirection: 'row', height: '75vh' }}
          >
            <div style={{ width: '70%' }}>
              {/* <ThreejsViewer data={threejsObject} isLoading={isLoading} /> */}
            </div>
            <Tooltip
              placement="right"
              isOpen={tooltipOpen}
              target="TooltipExample"
              toggle={toggle}
            >
              {assemblyProcessData.action === 'Work Holding 1'
                ? `This will only show items of type "Machine - Tool/Workholding. Please ensure item has 3d model loaded, otherwise it will not populate here`
                : `Please ensure item has 3d model loaded, otherwise it will not populate here`}
            </Tooltip>
            <div style={{ width: '30%' }}>
              <Dropdown
                isOpen={dropdownOpen}
                toggle={toggleDropdown}
                style={{ marginBottom: '2rem' }}
              >
                <DropdownToggle
                  caret
                  style={{ width: '100%' }}
                  id="TooltipExample"
                >
                  {localSelectedItem.name}
                </DropdownToggle>
                <DropdownMenu>
                  {itemList.map((item, index) => {
                    return (
                      <DropdownItem
                        key={index}
                        onClick={() => handleChange(item)}
                        value={item.name}
                      >
                        {item.name}
                      </DropdownItem>
                    );
                  })}
                </DropdownMenu>
              </Dropdown>

              <Button
                color="dark"
                style={{ marginBottom: '2rem' }}
                block
                onClick={handleSubmitButton}
              >
                Go
              </Button>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
}
