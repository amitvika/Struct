import React, { useState } from "react";
import {
  Paper,
  Tab,
  Tabs,
  Grid,
  Breadcrumbs,
  Link,
  Typography
} from "@material-ui/core";
import { NavLink, useParams } from "react-router-dom";
import ItemContainer from '../containers/Items';

const VendorDetail = () => {
  const [value, setValue] = useState(1);
  let { id } = useParams();

  const renderPageSwitch = (index) => {
    switch (index) {
      case 1:
        return <ItemContainer vendorId={id} />;
      case 2:
        return "pull reports base on items, and any details below";
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
              to='/vendors'>
              Vendors
              </NavLink>

            <Typography color="textPrimary">Vendor Details</Typography>
          </Breadcrumbs>
        </Paper>
        <Paper style={{ padding: 10, margin: 10 }}>
          <h4>Vendor Name: Struct</h4>
          <p>Vendor ID:{id}</p>
        </Paper>
      </Grid>
      <Grid item sm={2}>
        <Paper style={{ padding: 20, margin: 10 }}>
          <Tabs
            orientation="vertical"
            variant="scrollable"
            value={value}
            onChange={(event, newValue) => setValue(newValue)}>
            <Tab label="Services" value={1} />
            <Tab label="Reports" value={2} />
            <Tab label="Service Agreement" value={3} />
            <Tab label="Payments" value={4} />
            <Tab label="Identified Issues" value={5} />
            <Tab label="Vendor as Client" value={6} />
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

export default VendorDetail;
