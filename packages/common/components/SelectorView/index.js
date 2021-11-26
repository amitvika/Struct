import React, { useState, useEffect } from 'react';

import Filter from '../TableGridView/Filter';
import GridView from '../TableGridView/GridView';
import Headding from '../atoms/Headding';
import Space from '../atoms/Space';

import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

import { Grid, Paper } from '@material-ui/core';
import { Spinner } from 'reactstrap';

import get from 'lodash/get';

export default function SelectorView({
  title,
  fetchList,
  fields,
  mapValues,
  handleUpdate,
  handleSelection,
  fetchSelectedList,
  isMultiSelection = true
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [itemList, setItemList] = useState([]);
  const [filteredItemList, setFilteredItemList] = useState([]);

  const [selectedItemList, setSelectedItemList] = useState([]);
  const [filteredSelectedItemList, setSelectedFilteredItemList] = useState([]);

  const [isItemSelectionVisible, setIsItemSelectionVisible] = useState(false);

  const onClick = () => setIsItemSelectionVisible(!isItemSelectionVisible);
  const [state, setState] = useState({
    checkedA: true
  });
  const handleChange = (event) => {
    setState({ ...state, [event.target.name]: event.target.checked });
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async (query) => {
    try {
      setIsLoading(true);

      const itemRes = await fetchList();
      const alreadySelected = await fetchSelectedList();

      const items = get(itemRes, 'data', []);

      const mappedItems = mapValues(
        items.filter((item) => {
          if (alreadySelected) {
            return (
              !alreadySelected.includes(item.id) ||
              !alreadySelected.includes(item._id)
            );
          } else {
            return true;
          }
        })
      );

      if (alreadySelected) {
        const selectedItems = mapValues(
          items.filter((item) => {
            const data =
              alreadySelected.includes(item.id) ||
              alreadySelected.includes(item._id);
            if (data) {
              return true;
            } else {
              return false;
            }
          })
        );
        setSelectedItemList(selectedItems);
        setSelectedFilteredItemList(selectedItems);
      }

      setItemList(mappedItems);
      setFilteredItemList(mappedItems);
      setIsLoading(false);
    } catch (error) {
      console.log('Error', error);
    }
  };

  const handleItemClick = (data) => {
    if (isItemSelectionVisible) {
      if (isMultiSelection) {
        setFilteredItemList((prevState) => {
          let updatedState = prevState.filter((item) => item.id != data.id);
          return updatedState;
        });
      } else {
        setFilteredItemList(itemList.filter((item) => item.id != data.id));
      }

      let updatdSelected = [...selectedItemList, data];
      if (!isMultiSelection) {
        updatdSelected = [data];
      }

      setSelectedItemList(updatdSelected);
      setSelectedFilteredItemList(updatdSelected);

      handleUpdate(updatdSelected.map((item) => item.id));
      // handleUpdate({
      //     ...clientData,
      //     linkedItems: [...clientData.linkedItems, data.id]
      // })
    } else {
      handleSelection(data);
    }
  };

  const handleItemRemove = (data) => {
    if (isItemSelectionVisible) {
      setFilteredItemList((prevState) => {
        return [data, ...prevState];
      });

      const updatdSelected = selectedItemList.filter(
        (item) => item.id != data.id
      );
      setSelectedItemList(updatdSelected);

      setSelectedFilteredItemList(updatdSelected);

      handleUpdate(updatdSelected.map((item) => item.id));
      // handleUpdate({
      //     ...clientData,
      //     linkedItems: clientData.linkedItems.filter(itemId => itemId !== data.id)
      // })
    } else {
      handleSelection(data);
    }
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex' }}>
        <Headding
          fontSize={20}
          title={`Configure ${title}`}
          style={{
            fontWeight: 'bold',
            alignItems: 'center',
            display: 'flex'
          }}
        ></Headding>
        <FormGroup style={{ marginLeft: '20px' }}>
          <FormControlLabel
            control={
              <Checkbox
                onClick={onClick}
                checked={state.checkedB}
                onChange={handleChange}
                name="checkedB"
                color="primary"
              />
            }
            label={`Add/Remove  ${title}`}
          />
        </FormGroup>
      </div>

      {selectedItemList.length > 0 ? (
        <>
          {/* Filter section */}
          <Paper
            style={{ padding: '10px', marginTop: '10px', marginBottom: '10px' }}
          >
            <Grid container>
              <Filter
                list={selectedItemList}
                filteredList={filteredSelectedItemList}
                setFilteredList={setSelectedFilteredItemList}
                columnsFields={fields}
              />
            </Grid>
          </Paper>
          <Space size={20} />
          <Headding
            fontSize={20}
            title={`Selected ${title}`}
            style={{ fontWeight: 'bold' }}
          ></Headding>
          <GridView
            list={filteredSelectedItemList}
            handleHistoryToggle={() => false}
            handleAddEditToggle={() => false}
            columnsFields={fields}
            handleTableRowClick={handleItemRemove}
            isHistoryLinkVisible={false}
            isAddEditLinkVisible={false}
            isInsideDetailPanel={true}
            showDeleteActionButton={false}
          />
        </>
      ) : (
        <Headding
          fontSize={20}
          title={`No ${title} Selected`}
          style={{ fontWeight: 'bold' }}
        ></Headding>
      )}

      {isItemSelectionVisible && (
        <>
          {/* Filter section */}

          <Space size={20} />

          <Headding
            fontSize={20}
            title={`Choose ${title}`}
            style={{ fontWeight: 'bold' }}
          ></Headding>
          <Paper
            style={{ padding: '10px', marginTop: '10px', marginBottom: '10px' }}
          >
            <Grid container>
              <Filter
                list={itemList}
                filteredList={filteredItemList}
                setFilteredList={setFilteredItemList}
                columnsFields={fields}
              />
            </Grid>
          </Paper>
          <GridView
            list={filteredItemList}
            handleHistoryToggle={() => false}
            handleAddEditToggle={() => false}
            columnsFields={fields}
            handleTableRowClick={handleItemClick}
            isHistoryLinkVisible={false}
            isAddEditLinkVisible={false}
            isInsideDetailPanel={true}
            showDeleteActionButton={false}
          />
        </>
      )}
    </div>
  );
}
