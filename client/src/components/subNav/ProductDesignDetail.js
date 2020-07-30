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

class ProductDesignDetail extends Component {
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
                Product Design List
              </Link>

              <Typography color="textPrimary">
                Product Design Details
              </Typography>
            </Breadcrumbs>
          </Paper>
          <Paper style={{ padding: 10, margin: 10 }}>
            <h4>Design Name: Struct</h4>
            <p>Design ID:{this.props.id}</p>
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

export default connect(mapStateToProps, { changePage })(ProductDesignDetail);
