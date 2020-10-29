import React, { useState, useEffect } from "react";
import {
  Paper,
  Tab,
  Tabs,
  Box,
  Grid,
  Breadcrumbs,
  Typography
} from "@material-ui/core";
import { NavLink, useParams } from "react-router-dom";
import ItemGeometry from './ItemGeometry';
import CurrentUsage from './CurrentUsage';

const ItemDetail = () => {
  const [value, setValue] = useState(1);
  let { id } = useParams();

  const renderPageSwitch = (index) => {
    switch (index) {
      case 0:
        return "Add vendor items here";
      case 1:
        return <ItemGeometry itemId={id} />;
      case 2:
        return <CurrentUsage itemId={id} />

      case 7:
        return "place all past and current service agreements here";
      case 3:
        return "signed service agreement with the current state of config.  IF there is changed configs, those changes will show up here and will indicate to reduline the contract with those new items.  Also feature of auto generate the contract will be included";
      case 4:
        return "Shows all items to be billed for over here. configure the payments period over here. checks printing and mailing api will be linked to this ";
      case 5:
        return "shows a log of all items that do not pass vailidation along with other client complaints";
      case 6:
        return "if this vendor is a client, shows payments and billing, along with a unified net payments/billing description";

      default:
        return "Undefined Tab Index";
    }
  }
  return (
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
          <h4>Item Name: Struct</h4>
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
            <Tab label="Current Usage" value={2} />
            <Tab label="Item Properties" value={3} />
            <Tab label="Item Type Configurations" value={4} />
            <Tab label="Item Variations" value={5} />
            <Tab label="Validations" value={6} />
            <Tab label="Production Regimens" value={7} />
          </Tabs>
        </Paper>
      </Grid>
      <Grid item sm sm={10}>
        <Paper style={{ padding: 20, margin: 10 }}>
          {renderPageSwitch(value)}
        </Paper>
      </Grid>
    </Grid>
  );
}

export default ItemDetail;
