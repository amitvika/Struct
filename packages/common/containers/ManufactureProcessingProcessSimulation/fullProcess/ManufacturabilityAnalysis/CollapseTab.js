import React, { useState, useEffect } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ClearIcon from '@mui/icons-material/Clear';
import { Button, Grid, Paper } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
// import { useSelector, useDispatch } from 'react-redux';
// import { setCurrentItemAction } from '../../../../actions/itemActions'

export default function NestedList({ setItemValue }) {
  // const dispatch = useDispatch();
  const [currentTab, setCurrentTab] = useState(true);
  // const currentItem = useSelector((state) => state.item.currentItem);
  const currentItem = {}
  const [fullProcess, setFullProcess] = useState({});

  useEffect(() => {
    setFullProcess(currentItem.fullProcess);
  }, [currentItem]);
  const handleChange = (event) => {
    console.log('----', event.target.name, event.target.checked);
    const updatedItem = {
      ...currentItem,
      fullProcess: {
        ...fullProcess,
        [event.target.name]: event.target.checked,
      },
    };

    // dispatch(setCurrentItemAction(updatedItem));
  };

  const handleListItem = (value) => {
    if (currentTab === value) {
      setCurrentTab(null);
    } else {
      setCurrentTab(value);
    }
  };

  // const {SPOOLBASED, STACKED, GRID, GRIDSTACKED, BULKCONTAINER, LIQUIDVAT, PRESSUREVESSEL } = state;

  const {
    spoolBased,
    stacked,
    grid,
    gridStacked,
    bulkContainer,
    liquidVat,
    pressure,
  } = currentItem?.fullProcess || {};
  const error =
    [
      spoolBased,
      stacked,
      grid,
      gridStacked,
      bulkContainer,
      liquidVat,
      pressure,
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
          this is second tab
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
