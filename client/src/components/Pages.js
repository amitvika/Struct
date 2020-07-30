import React, { Component, Fragment } from "react";
import { Container } from "reactstrap";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import AppNavbar from "./AppNavbar";
//Main Nav
import Clients from "./mainNav/Clients";
import Vendors from "./mainNav/Vendors";
import Items from "./mainNav/Items";
import ProcessGroups from "./mainNav/ProcessGroups";
import ProductDesign from "./mainNav/ProductDesign";
//Ops Nav
import AccessConfiguration from "./opsNav/AccessConfiguration";
import ConfigurationHistory from "./opsNav/ConfigurationHistory";
import ViewAccess from "./opsNav/ViewAccess";
import AccessSetup from "./opsNav/AccessSetup";
import LoginPage from "./auth/LoginPage";
//Sub Nav
import ClientDetail from "./subNav/ClientDetail";
import ProcessGroupDetail from "./subNav/ProcessGroupDetail";
import VendorDetail from "./subNav/VendorDetail";
import ItemDetail from "./subNav/ItemDetail";
import ProductDesignDetail from "./subNav/ProductDesignDetail";
//UI Library Components
import { Spinner } from "reactstrap";
class Pages extends Component {
  state = {
    userLoaded: false,
    pageHistory: []
  };

  render() {
    const containerNav = item => {
      return <Container style={{ marginTop: "7%" }}>{item}</Container>;
    };

    const mainNav = page => {
      switch (page.page) {
        case "ProcessGroups":
          return containerNav(<ProcessGroups />);
        case "Items":
          return containerNav(<Items />);
        case "Clients":
          return containerNav(<Clients />);
        case "Vendors":
          return containerNav(<Vendors />);
        case "ProductDesign":
          return containerNav(<ProductDesign />);
        default:
          return "undefined";
      }
    };
    const clientsNav = page => {
      switch (page.page) {
        default:
          return (
            <div style={{ marginTop: "4%" }}>
              <ClientDetail id={page.objId} />{" "}
            </div>
          );
      }
    };
    const vendorsNav = page => {
      switch (page.page) {
        default:
          return (
            <div style={{ marginTop: "4%" }}>
              <VendorDetail id={page.objId} />{" "}
            </div>
          );
      }
    };
    const itemsNav = page => {
      switch (page.page) {
        default:
          return (
            <div style={{ marginTop: "4%" }}>
              <ItemDetail id={page.objId} />{" "}
            </div>
          );
      }
    };
    const productDesignNav = page => {
      switch (page.page) {
        default:
          return (
            <div style={{ marginTop: "4%" }}>
              <ProductDesignDetail id={page.objId} />{" "}
            </div>
          );
      }
    };
    const processGroupsNav = page => {
      switch (page.page) {
        default:
          return (
            <div style={{ marginTop: "4%" }}>
              <ProcessGroupDetail id={page.objId} />
            </div>
          );
      }
    };
    const opsNav = page => {
      switch (page.page) {
        case "ConfigurationHistory":
          return containerNav(<ConfigurationHistory />);
        //return "config hx";
        case "AccessSetup":
          return containerNav(<AccessSetup />);
        case "ViewAccess":
          return containerNav(<ViewAccess />);
        case "AccessConfiguration":
          return containerNav(<AccessConfiguration />);
        default:
          return "undefined";
      }
    };
    function renderPageSwitch(page) {
      switch (page.navType) {
        case "MainNav":
          return mainNav(page);
        case "OpsNav":
          return opsNav(page);
        case "ClientsNav":
          return clientsNav(page);
        case "VendorsNav":
          return vendorsNav(page);
        case "ProcessGroupsNav":
          return processGroupsNav(page);
        case "ItemsNav":
          return itemsNav(page);
        case "ProductDesignNav":
          return productDesignNav(page);
        default:
          return mainNav(page);
      }
    }
    return (
      <div>
        {this.props.auth.isAuthenticated ? (
          <div>
            {this.props.auth.user.userAccess != null ? (
              <div>
                <AppNavbar />

                {renderPageSwitch(this.props.page.page)}
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center"
                }}
              >
                <Spinner animation="border" />
              </div>
            )}
          </div>
        ) : (
          <Container style={{ marginTop: "7%" }}>
            <LoginPage />
          </Container>
        )}
      </div>
    );
  }
}

Pages.propTypes = {
  page: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  page: state.page,
  auth: state.auth
});

export default connect(mapStateToProps, null)(Pages);
