import React, { Component, useEffect, useState } from "react";
import { changePage } from "../actions/pageActions";
import {
  Paper,
  Tab,
  Tabs,
  Box,
  Grid,
  Breadcrumbs,
  Link
} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
// import { makeStyles } from "@material-ui/core/styles";
// import ClientDetailTabContent from "../components/subNav/ClientDetailTabs/ClientDetailTabContent";

class ClientDetail extends Component {
  state = {
    value: 0
  };
  onPageChangeClick = (navType, page, objId) => {
    const pageDetail = {
      navType,
      page,
      objId
    };
    // this.props.changePage(pageDetail);
  };
  handleChange = (event, newValue) => {
    this.setState({ value: newValue });
  };

  render() {
    function renderPageSwitch(index) {
      switch (index) {
        case -2:
          return "shows order claims via data file input or online store api.  Allows shipping configurations to be set as well. configure labelling as well";
        case -3:
          return "configure Notifications of manufacturing setup finishing, or specific components of setup such as molds and validations of molds, notifications of finishing of products, notifications of products being shipped.  Configured for email, text, and/or datafile notifications, account manager tools to pull information based on this client and selectable characteristics about items and process groups";
        case -1:
          return ".have a process group table and an items table.  when a proces group is selected, it will automatically filter the items table for input and output items for the selected PG. Conversly, if an item is selected, the out put and input process groups will show. Production machine configuration will be shown here (fixed position/cellulalr layout or flow line layout)+ number of setups ) ";
        case 0:
          return "Product questions/troubleshooting call center, manual writing, product design is free if they agree before hand to manfucature for us for atleast a year";
        case 1:
          return "configure warranty length by product, and associated pricing";
        case 2:
          return "account manager tools to pull information based on this client and selectable characteristics about items and process groups";
        case 3:
          return "signed service agreement with the current state of config.  IF there is changed configs, those changes will show up here and will indicate to reduline the contract with those new items.  Also feature of auto generate the contract will be included";
        case 4:
          return "stores all requirements documents tied with this client.  Potential tying ability with items created. Also autogenerate requirements documents based on the configs in the system";
        case 5:
          return "shows the total of things to be billed. Can configure the specific billing period. Based on bank account to send to, will check if vendors have same and show reconciliation and net total";
        case 6:
          return "lists all failed validations of respective process groups and items";
        case 7:
          return "Allows to link with a vendor in the system.  if it is linked, it will give show a billing and a payments table and a total net payment table below";

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
              <Link
                onClick={this.onPageChangeClick.bind(
                  this,
                  "MainNav",
                  "Clients",
                  0
                )}
                href="#"
              >
                Clients
              </Link>

              <Typography color="textPrimary">Client Details</Typography>
            </Breadcrumbs>
          </Paper>
          <Paper style={{ padding: 10, margin: 10 }}>
            <h4>Client Name: Struct</h4>
            <p>Client ID:{this.props.id}</p>
          </Paper>
        </Grid>
        <Grid item sm={2}>
          <Paper style={{ padding: 20, margin: 10 }}>
            <Tabs
              orientation="vertical"
              variant="scrollable"
              value={this.state.value}
              onChange={this.handleChange}
            >
              <Tab label="Products" value={-1} />
              <Tab label="Orders and Fulfillment" value={-2} />
              <Tab label="Billing" value={5} />
              <Tab label="Client Notifications" value={-3} />
              {/* <Tab label="Reports" value={2} />*/}
              <Tab label="Warranty Setup" value={1} />
              {/*<Tab label="End User Features" value={0} />*/}
              <Tab label="Requirements Documents" value={4} />
              <Tab label="Service Agreement" value={3} />
              <Tab label="Identified Issues" value={6} />
            </Tabs>
          </Paper>
        </Grid>
        <Grid item sm sm={10}>
          <Paper style={{ padding: 20, margin: 10 }}>
            {renderPageSwitch(this.state.value)}
          </Paper>
        </Grid>
      </Grid>
    );
  }
}

export default ClientDetail;
