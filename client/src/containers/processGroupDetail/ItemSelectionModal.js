import React, { useState, useEffect } from 'react'
import {
  Modal,
  ModalHeader,
  ModalBody
} from "reactstrap";
import Grid from '@material-ui/core/Grid';
import Select from '../../components/atoms/Select';
import Input from '../../components/atoms/Input';
import Headding from '../../components/atoms/Headding';
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
  CircularProgress
} from "@material-ui/core";
import { Link } from 'react-router-dom';
import ItemAPI from '../../api/items.api';

import './style.css';

export default function ItemSelectionModal({ toggleItemSelection,
  isItemSelectionModalOpen,
  selectedItems, setSelectedItems }) {

  const [itemList, setItemList] = useState([]);
  const [filter, setFilter] = useState({});

  const [isItemLoading, setIsItemLoading] = useState(false);
  const [searchItemByName, setSearchItemByName] = useState({
    name: '',
    typing: false,
    typingTimeout: 0,
  });

  const addItemToSelectedList = (data) => {
    setItemList(preItemList => {
      return preItemList.filter(item => item._id !== data._id);
    });

    setSelectedItems([...selectedItems, data])
  }

  const removeItemFromSelected = (data) => {
    setSelectedItems(preItemList => {
      return preItemList.filter(item => item._id !== data._id);
    });
    setItemList([...itemList, data])
  }

  const fetchData = ({ query = '' }) => {
    ItemAPI.filterItemsAPI(query)
      .then(res => {
        if (res.data) {
          setItemList(res.data)
        }
        console.log('Response :-', res);
      })
      .catch(error => {
        console.log('Error :-', error);
      })
    return () => {

    }
  }

  const handleChange = (name, value) => {
    setFilter(prevFilter => {
      return {
        ...prevFilter,
        [name]: value
      }
    })
  }

  const searchItem = () => {
    let query = []
    Object.keys(filter).forEach((key, index) => {
      if (filter[key]) {
        query.push(`${key}=${filter[key]}`)
      }
    });
    if (query.length > 0) {
      fetchData({ query: query.join('&') })
    }
  }


  const handleNameChange = (event) => {
    const inputValue = event.target.value;
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
  }

  return (
    <Modal isOpen={isItemSelectionModalOpen} toggle={toggleItemSelection} style={{ width: '70%' }}>
      <ModalHeader toggle={toggleItemSelection}>Select Item</ModalHeader>
      <ModalBody>
        <Grid className="section-padding-left" container spacing={4}>

          <Grid item xs={3} ><Headding title="Name Search" /></Grid>
          <Grid item xs={3} >
            <Input
              placeholder="Enter"
              type="text"
              onChange={(event) => handleNameChange(event)}
            />
          </Grid>
          <Grid item xs={3} >
            <Button
              variant="contained"
              color="primary"
              endIcon={<Icon>search</Icon>}
              onClick={searchItem}>
              Search
              </Button>
          </Grid>
          <Grid item xs={3} >
            {isItemLoading &&
              <CircularProgress />}
          </Grid>

          <Grid item xs={3} >
            <Headding title='Item type'></Headding>
          </Grid>
          <Grid item xs={3} >
            <Input
              placeholder="Enter"
              type="text"
              onChange={(event) => handleChange("itemType", event.target.value)}
            />
          </Grid>
          <Grid item xs={6} ></Grid>

          <Grid item xs={3} >
            <Headding title='Item category'></Headding>
          </Grid>
          <Grid item xs={3} >
            <Input
              placeholder="Enter"
              type="text"
              onChange={(event) => handleChange("itemCategory", event.target.value)}
            />
          </Grid>
          <Grid item xs={6} ></Grid>

          <Grid item xs={3} >
            <Headding title='Single Item Part or Assembly'></Headding>
          </Grid>
          <Grid item xs={3} >
            <Input
              placeholder="Enter"
              type="text"
              onChange={(event) => handleChange("isSingleItem", event.target.value)}
            />
          </Grid>
          <Grid item xs={6} ></Grid>
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
                {
                  selectedItems.map(itemRow => (
                    <TableRow
                      key={itemRow._id}
                    >
                      <TableCell>{itemRow._id}</TableCell>
                      <TableCell onClick={() => removeItemFromSelected(itemRow)}>
                        {itemRow.name}
                      </TableCell>
                      <TableCell><Link to={`/items/${itemRow._id}`}>View</Link> </TableCell>
                    </TableRow>
                  ))
                }
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
                {itemList.map(itemRow => (
                  <TableRow
                    key={itemRow._id}>
                    <TableCell>{itemRow._id}</TableCell>
                    <TableCell
                      onClick={() => addItemToSelectedList(itemRow)}>{itemRow.name}</TableCell>
                    <TableCell><Link to={`/items/${itemRow._id}`}>View </Link></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </ModalBody>
    </Modal >
  )
}
