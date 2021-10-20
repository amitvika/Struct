import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import Grid from '@material-ui/core/Grid';
import Select from '@monostruct/common/components/atoms/Select';
import Input from '@monostruct/common/components/atoms/Input';
import Headding from '@monostruct/common/components/atoms/Headding';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Icon,
  CircularProgress,
} from '@material-ui/core';
import { Link } from 'react-router-dom';
import ItemAPI from '@monostruct/common/api/items.api';

import './style.css';

export default function ItemSelectionModal({
  toggleItemSelection,
  isItemSelectionModalOpen,
  selectedAssemblySequence,
  handleUpdateAssemblySequence,
}) {
  const [itemList, setItemList] = useState([]);
  const [filter, setFilter] = useState({});
  const [selectedItem, setSelectedItem] = useState({});

  const [isItemLoading, setIsItemLoading] = useState(false);
  const [searchItemByName, setSearchItemByName] = useState({
    name: '',
    typing: false,
    typingTimeout: 0,
  });

  useEffect(() => {
    setSelectedItem(selectedAssemblySequence?.itemId);
  }, []);

  const addItemToSelectedList = (data) => {
    setItemList((preItemList) => {
      if (selectedItem) {
        return [
          selectedItem,
          ...preItemList.filter((item) => item._id !== data._id),
        ];
      } else {
        return preItemList.filter((item) => item._id !== data._id);
      }
    });

    setSelectedItem(data);

    handleUpdateAssemblySequence({ itemId: data });
  };

  const removeItemFromSelected = (data) => {
    setSelectedItem({});

    setItemList([...itemList, data]);

    handleUpdateAssemblySequence({ itemId: null });
  };

  const fetchData = ({ query = '' }) => {
    ItemAPI.getItemsAPI(query)
      .then((res) => {
        if (res.data) {
          setItemList(res.data);
        }
        console.log('Response :-', res);
      })
      .catch((error) => {
        console.log('Error :-', error);
      });
    return () => {};
  };

  const handleChange = (name, value) => {
    setFilter((prevFilter) => {
      return {
        ...prevFilter,
        [name]: value,
      };
    });
  };

  const searchItem = () => {
    let query = [];
    Object.keys(filter).forEach((key, index) => {
      if (filter[key]) {
        query.push(`${key}=${filter[key]}`);
      }
    });
    if (query.length > 0) {
      fetchData({ query: query.join('&') });
    }
  };

  const handleNameChange = (event) => {
    const inputValue = event.target.value;
    handleChange('search', inputValue);

    if (inputValue.length < 3) {
      return;
    }

    if (searchItemByName.typingTimeout) {
      clearTimeout(searchItemByName.typingTimeout);
    }

    setSearchItemByName({
      name: inputValue,
      typing: false,
      typingTimeout: setTimeout(() => {
        fetchData({ query: `search=${inputValue}` });
      }, 1000),
    });
  };

  return (
    <Modal
      isOpen={isItemSelectionModalOpen}
      toggle={toggleItemSelection}
      style={{ width: '70%' }}
    >
      <ModalHeader toggle={toggleItemSelection}>Select Item</ModalHeader>
      <ModalBody>
        <Grid className="section-padding-left" container spacing={4}>
          <Grid item xs={3}>
            <Headding title="Name Search" />
          </Grid>
          <Grid item xs={4}>
            <Input
              placeholder="Enter"
              type="text"
              value={filter.search}
              onChange={(event) => handleNameChange(event)}
            />
          </Grid>
          <Grid item xs={3}>
            <Button
              variant="contained"
              color="primary"
              endIcon={<Icon>search</Icon>}
              onClick={searchItem}
            >
              Search
            </Button>
          </Grid>
          <Grid item xs={2}>
            {isItemLoading ? (
              <CircularProgress />
            ) : (
              <Button
                variant="contained"
                color="primary"
                endIcon={<Icon>cancel</Icon>}
                onClick={() => setFilter({})}
              >
                Clear
              </Button>
            )}
          </Grid>

          <Grid item xs={3}>
            <Headding title="Item type"></Headding>
          </Grid>
          <Grid item xs={4}>
            <Select
              // label="Item Type"
              placeholder="Select"
              options={[
                { label: 'Machine - Actuator', value: 'Machine - Actuator' },
                {
                  label: 'Machine - Motion Control',
                  value: 'Machine - Motion Control',
                },
                {
                  label: 'Machine - Tool/Workholding',
                  value: 'Machine - Tool/Workholding',
                },
                {
                  label: 'Machine - Workpiece Environment Modification',
                  value: 'Machine - Workpiece Environment Modification',
                },
                {
                  label: 'Containment - Pressure Vessel',
                  value: 'Containment - Pressure Vessel',
                },
                {
                  label: 'Containment - Liquid Container',
                  value: 'Containment - Liquid Container',
                },
                { label: 'Tool', value: 'Tool' },
                { label: 'Machine - Tool', value: 'Machine - Tool' },
                { label: 'Unassembled Kit', value: 'Unassembled Kit' },
                { label: 'Other', value: 'Other' },
              ]}
              onChange={(data) => handleChange('itemType', data.value)}
              value={filter.itemType ? { label: filter.itemType } : ''}
            />
          </Grid>
          <Grid item xs={5}></Grid>

          <Grid item xs={3}>
            <Headding title="Item category"></Headding>
          </Grid>
          <Grid item xs={4}>
            <Select
              // label="General Geometry"
              placeholder="Select"
              options={[
                { label: ' Solid', value: ' Solid' },
                {
                  label: 'Bulk Powder/Particles/Grains',
                  value: 'Bulk Powder/Particles/Grains',
                },
                { label: 'Liquid', value: 'Liquid' },
                { label: 'Gas', value: 'Gas' },
              ]}
              onChange={(data) => handleChange('itemCategory', data.value)}
              value={filter.itemCategory ? { label: filter.itemCategory } : ''}
            />
          </Grid>
          <Grid item xs={5}></Grid>

          <Grid item xs={3}>
            <Headding title="Single Item Part or Assembly"></Headding>
          </Grid>
          <Grid item xs={4}>
            <Select
              placeholder="Select"
              options={[
                { label: 'Single Item Part', value: 'Single Item Part' },
                { label: 'Multi-Item Assembly', value: 'Multi-Item Assembly' },
              ]}
              onChange={(data) => handleChange('assemblyType', data.value)}
              value={filter.assemblyType ? { label: filter.assemblyType } : ''}
            />
          </Grid>
          <Grid item xs={5}></Grid>
        </Grid>

        <div>
          <h5 className="mt-2">Selected Item</h5>
          <TableContainer className="mb-2" component={Paper}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>S No</TableCell>
                  <TableCell>Item Name</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedItem && (
                  <TableRow key={selectedItem._id}>
                    <TableCell>{selectedItem._id}</TableCell>
                    <TableCell
                      onClick={() => removeItemFromSelected(selectedItem)}
                    >
                      {selectedItem.name}
                    </TableCell>
                    <TableCell>
                      <Link target="_blank" to={`/items/${selectedItem._id}`}>
                        View
                      </Link>{' '}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <h5>Select Item</h5>
          <TableContainer component={Paper}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>S No</TableCell>
                  <TableCell>Item Name</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {itemList.map((itemRow) => (
                  <TableRow key={itemRow._id}>
                    <TableCell>{itemRow._id}</TableCell>
                    <TableCell onClick={() => addItemToSelectedList(itemRow)}>
                      {itemRow.name}
                    </TableCell>
                    <TableCell>
                      <Link target="_blank" to={`/items/${itemRow._id}`}>
                        View{' '}
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </ModalBody>
    </Modal>
  );
}
