import React, { useState } from "react";
import {
  Button,
  Snackbar,
  Paper,
  Tab,
  Tabs,
  Grid,
  Breadcrumbs,
  Link,
  Typography
} from "@material-ui/core";

import { NavLink, useParams, useLocation } from "react-router-dom";
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ProductDesignDetail = () => {
  const [value, setValue] = useState(1);
  let { id } = useParams();
  let query = useQuery();

  const renderPageSwitch = (index) => {
    switch (index) {
      case 1:
        return "THINGS MADE WITH PRODUCT DESIGN DO NOT REUIRED ADDITIONAL PROCESS CONFIG. IT IS MEANT TO BE FULLY AUTOMATED.  Select if its a standalone item or part of an assembly";
      case 2:
        return "can choose elements such as screens, button panels, sensors, actuators, drive trains.  Can select an item from Items or anotherproduct design to incorporate   ";
      case 3:
        return "";
      case 4:
        return "";
      case 5:
        return "This configures water proofing, pressure proofing, ";
      case 6:
        return "";

      default:
        return "Undefined Tab Index";
    }
  }

  const handleSave = () => {

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
                to='/product-design'>
                Product Design List
              </NavLink>

              <Typography color="textPrimary">
                Product Design Details
              </Typography>
            </Breadcrumbs>
          </Paper>
          <Paper style={{ padding: 10, margin: 10 }}>
            <h4>Design Name: {query.get('product_name')}</h4>
            <p>Design ID:{id}</p>
          </Paper>
        </Grid>
        <Grid item sm={2}>
          <Paper style={{ padding: 20, margin: 10 }}>
            <Tabs
              orientation="vertical"
              variant="scrollable"
              value={value}
              onChange={(event, newValue) => setValue(newValue)}>

              <Tab label="Design Type" value={1} />
              <Tab label="Functional Elements" value={2} />
              <Tab label="Aesthetics/Shape" value={3} />
              <Tab label="Functional Integration" value={4} />
              <Tab label="Environmental Resistance" value={5} />
              <Tab label="Mechanical Resistance" value={6} />
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

export default ProductDesignDetail;
