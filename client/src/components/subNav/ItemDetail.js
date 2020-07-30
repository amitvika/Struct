import axios from "axios";
import MaterialTable, { MTableToolbar } from "material-table";
import React, { Component } from "react";
import { connect } from "react-redux";
import { Spinner } from "reactstrap";
import { tokenConfig } from "../../actions/authActions";
import store from "../../store";
import { changePage } from "../../actions/pageActions";
import {
  Checkbox,
  Snackbar,
  MuiAlert,
  Paper,
  Tab,
  Tabs,
  Box,
  Grid,
  Breadcrumbs,
  Link,
  Typography
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

class ItemDetail extends Component {
  state = {
    value: 0
  };
  onPageChangeClick = (navType, page, objId) => {
    const pageDetail = {
      navType,
      page,
      objId
    };
    this.props.changePage(pageDetail);
  };
  handleChange = (event, newValue) => {
    this.setState({ value: newValue });
  };

  render() {
    function renderPageSwitch(index) {
      switch (index) {
        case 0:
          return "Add vendor items here";
        case 1:
          return "pull reports base on items, and any details below";
        case 2:
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
              <Link
                onClick={this.onPageChangeClick.bind(
                  this,
                  "MainNav",
                  "Items",
                  0
                )}
                href="#"
              >
                Items
              </Link>

              <Typography color="textPrimary">Item Details</Typography>
            </Breadcrumbs>
          </Paper>
          <Paper style={{ padding: 10, margin: 10 }}>
            <h4>Item Name: Struct</h4>
            <p>Item ID:{this.props.id}</p>
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
              <Tab label="Item Geometry" value={1} />
              <Tab label="Item Properties" value={2} />
              <Tab label="Item Type Configurations" value={3} />
              <Tab label="Item Variations" value={4} />
              <Tab label="Validations" value={5} />
              <Tab label="Production Regimens" value={6} />
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

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(mapStateToProps, { changePage })(ItemDetail);
