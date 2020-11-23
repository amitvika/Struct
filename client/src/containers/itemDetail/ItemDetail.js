import React, { useState, useEffect } from "react";
import {
  Snackbar,
  Button,
  Paper,
  Tab,
  Tabs,
  Box,
  Grid,
  Breadcrumbs,
  Typography,
  CircularProgress
} from "@material-ui/core";
import { NavLink, useParams } from "react-router-dom";

import ItemGeometry from './ItemGeometry';
import CurrentUsage from './CurrentUsage';
import VendorDetails from './VendorDetails';

import ItemTypeConfigurations from './ItemTypeConfigurations';
import ItemAPI from '../../api/items.api';

const ItemDetail = () => {
  const [value, setValue] = useState(1);
  let { id } = useParams();
  const [itemGeometryDetail, setItemGeometryDetail] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [itemDetail, setItemDetail] = useState({});
  const [threejsData, setThreejsData] = useState({});

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const itemDetailResponse = await ItemAPI.getItemAPI(id)
      if (itemDetailResponse.data) {
        setItemDetail(itemDetailResponse.data);
      }

      const itemGeometryResponse = await ItemAPI.getItemGeomtery(id)
      if (itemGeometryResponse.data) {
        setItemGeometryDetail(itemGeometryResponse.data);
      }

      const itemThreejsDataResponse = await ItemAPI.getItemThreejsData(id);
      if (itemThreejsDataResponse.data) {
        setThreejsData(itemThreejsDataResponse.data)
      }

      setIsLoading(false);
    })()
  }, []);

  const renderPageSwitch = (index) => {
    switch (index) {
      case 0:
        return "Add vendor items here";
      case 1:
        return <ItemGeometry itemId={id} itemDetail={itemGeometryDetail} setItemGeometryDetail={setItemGeometryDetail} threejsData={threejsData} />;
      case 2:
        return <CurrentUsage itemId={id} />
      case 3:
        return "signed service agreement with the current state of config.  IF there is changed configs, those changes will show up here and will indicate to reduline the contract with those new items.  Also feature of auto generate the contract will be included";
      case 4:
        return <ItemTypeConfigurations itemId={id} itemGeometryDetail={itemGeometryDetail} setItemGeometryDetail={setItemGeometryDetail} />
      case 5:
        return "shows a log of all items that do not pass vailidation along with other client complaints";
      case 6:
        return "if this vendor is a client, shows payments and billing, along with a unified net payments/billing description";
      case 7:
        return "place all past and current service agreements here";
      case 8:
        return <VendorDetails />
      default:
        return "Undefined Tab Index";
    }
  }

  const handleSave = () => {
    // setIsLoading(true);
    itemGeometryDetail.step = undefined;
    ItemAPI
      .updateItemGeomtery(id, { ...itemGeometryDetail, itemId: id })
      .then(res => {
        setItemGeometryDetail(res.data)
      })
      .catch(error => {
      })
  }

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <>
      <Grid container>
        <Grid item sm sm={12}>
          <Paper style={{ padding: 20, margin: 10 }}>
            <Breadcrumbs
              style={{
                display: "flex",
                justifyContent: "center"
              }}
            >
              <NavLink
                to='/items'>
                Items
              </NavLink>

              <Typography color="textPrimary">Item Details</Typography>
            </Breadcrumbs>
          </Paper>
          <Paper style={{ padding: 10, margin: 10 }}>
            <h4>Item Name: {itemDetail.name}</h4>
            <p>Item ID:{id}</p>
          </Paper>
        </Grid>
        <Grid item sm={2}>
          <Paper style={{ padding: 20, margin: 10 }}>
            <Tabs
              orientation="vertical"
              variant="scrollable"
              value={value}
              onChange={(event, newValue) => setValue(newValue)}>
              <Tab label="Item Geometry and Properties" value={1} />
              <Tab label="Item Type Configurations" value={4} />
              <Tab label="Item Variations" value={5} />
              <Tab label="Validations" value={6} />
              <Tab label="Production Regimens" value={7} />
              <Tab label="Current Usage" value={2} />
              <Tab label="Vendor Details" value={8} />
            </Tabs>
          </Paper>
        </Grid>
        <Grid item sm sm={10}>
          <Paper style={{ padding: 20, margin: 10 }}>
            {renderPageSwitch(value)}
          </Paper>
        </Grid>
      </Grid>
      <Snackbar
        style={{
          left: '10%'
        }}
        open={true}
      >
        <Button
          size="large"
          variant="contained"
          color="primary"
          onClick={handleSave}>
          Save
          </Button>
      </Snackbar>
    </>
  );
}

export default ItemDetail;
