import React, { useState, useEffect } from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import ClearIcon from '@material-ui/icons/Clear';
import { Button, Grid, Paper } from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';
import { useSelector, useDispatch } from 'react-redux';
// import { setCurrentItemAction } from '../../../../actions/itemActions';

export default function NestedList(props) {
  const { setItemValue, itemProperties, setStack, gltfjson } = props;

  const currentItem = useSelector((state) => state.item.currentItem);
  const [splitfiles, setsplitfiles] = useState({ gltfjson });

  useEffect(() => {
    setsplitfiles(props.gltfjson);
    let storage = { ...currentItem.storage };
    storage['stacked'] = props.gltfjson?.stackable
      ? props.gltfjson?.stackable[0].count >= 2
      : false;
  }, [props]);

  const dispatch = useDispatch();
  const [currentTab, setCurrentTab] = useState(true);

  const [storage, setStorage] = useState({});

  useEffect(() => {
    setStorage(currentItem.storage);
  }, [currentItem]);

  const handleChange = (event) => {
    const updatedItem = {
      ...currentItem,
      storage: {
        ...storage,
        [event.target.name]: event.target.checked
      }
    };

    dispatch(setCurrentItemAction(updatedItem));
  };

  const handleListItem = (value) => {
    if (currentTab === value) {
      setCurrentTab(null);
    } else {
      setCurrentTab(value);
      if (value == 'Stacked') {
        setStack({ item: { ...itemProperties }, ...props });
      }
    }
  };

  const {
    spoolBased,
    stacked,
    grid,
    gridStacked,
    bulkContainer,
    liquidVat,
    pressure
  } = currentItem?.storage || {};

  const error =
    [
      spoolBased,
      stacked,
      grid,
      gridStacked,
      bulkContainer,
      liquidVat,
      pressure
    ].filter((v) => v).length !== 2;

  return (
    <List component="nav">
      <Paper>
        <div style={{ display: 'flex' }}>
          <ListItem button onClick={() => handleListItem('Spool Based')}>
            Spool Based
            {currentTab === 'Spool Based' ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Button>
            <ClearIcon />
          </Button>
          <Checkbox
            name="spoolBased"
            checked={spoolBased}
            onChange={handleChange}
            inputProps={{ 'aria-label': 'primary checkbox' }}
          />
        </div>

        <Collapse
          in={currentTab === 'Spool Based'}
          timeout="auto"
          unmountOnExit
        >
          this is first tab
        </Collapse>
      </Paper>
      <Paper>
        <div style={{ display: 'flex' }}>
          <ListItem button onClick={() => handleListItem('Stacked')}>
            {' '}
            Stacked
            {currentTab === 'Stacked' ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Button>
            <ClearIcon />
          </Button>
          <Checkbox
            name="stacked"
            checked={stacked}
            onChange={handleChange}
            inputProps={{ 'aria-label': 'primary checkbox' }}
          />
        </div>
        <Collapse in={currentTab === 'Stacked'} timeout="auto" unmountOnExit>
          {splitfiles.stackable ? props.gltfjson?.stackable[0].count : 0}
        </Collapse>
      </Paper>

      <Paper>
        <div style={{ display: 'flex' }}>
          <ListItem button onClick={() => handleListItem('Grid')}>
            {' '}
            Grid
            {currentTab === 'Grid' ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Button>
            <ClearIcon />
          </Button>
          <Checkbox
            name="grid"
            checked={grid}
            onChange={handleChange}
            inputProps={{ 'aria-label': 'primary checkbox' }}
          />
        </div>
        <Collapse in={currentTab === 'Grid'} timeout="auto" unmountOnExit>
          This is third Tab
        </Collapse>
      </Paper>

      <Paper>
        <div style={{ display: 'flex' }}>
          <ListItem button onClick={() => handleListItem('Grid-Stacked')}>
            {' '}
            Grid-Stacked
            {currentTab === 'Grid-Stacked' ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Button>
            <ClearIcon />
          </Button>
          <Checkbox
            name="gridStacked"
            checked={gridStacked}
            onChange={handleChange}
            inputProps={{ 'aria-label': 'primary checkbox' }}
          />
        </div>
        <Collapse
          in={currentTab === 'Grid-Stacked'}
          timeout="auto"
          unmountOnExit
        >
          this is Fourth tab
        </Collapse>
      </Paper>

      <Paper>
        <div style={{ display: 'flex' }}>
          <ListItem button onClick={() => handleListItem('Bulk Container')}>
            {' '}
            Bulk Container
            {currentTab === 'Bulk Container' ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Button>
            <ClearIcon />
          </Button>
          <Checkbox
            name="bulkContainer"
            checked={bulkContainer}
            onChange={handleChange}
            inputProps={{ 'aria-label': 'primary checkbox' }}
          />
        </div>
        <Collapse
          in={currentTab === 'Bulk Container'}
          timeout="auto"
          unmountOnExit
        >
          this is Fifth tab
        </Collapse>
      </Paper>

      <Paper>
        <div style={{ display: 'flex' }}>
          <ListItem button onClick={() => handleListItem('Liquid Vat')}>
            {' '}
            Liquid Vat
            {currentTab === 'Liquid Vat' ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Button>
            <ClearIcon />
          </Button>
          <Checkbox
            name="liquidVat"
            checked={liquidVat}
            onChange={handleChange}
            inputProps={{ 'aria-label': 'primary checkbox' }}
          />
        </div>
        <Collapse in={currentTab === 'Liquid Vat'} timeout="auto" unmountOnExit>
          This is sixth Tab
        </Collapse>
      </Paper>

      <Paper>
        <div style={{ display: 'flex' }}>
          <ListItem button onClick={() => handleListItem('Pressure Vessel')}>
            Pressure Vessel
            {currentTab === 'Pressure Vessel' ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Button>
            <ClearIcon />
          </Button>
          <Checkbox
            name="pressure"
            checked={pressure}
            onChange={handleChange}
            inputProps={{ 'aria-label': 'primary checkbox' }}
          />
        </div>
        <Collapse
          in={currentTab === 'Pressure Vessel'}
          timeout="auto"
          unmountOnExit
        >
          This is seventh Tab
        </Collapse>
      </Paper>
    </List>
  );
}
