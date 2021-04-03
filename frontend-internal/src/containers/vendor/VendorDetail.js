import React, { useState, useEffect } from "react";
import {
  Snackbar,
  Button,
  Paper,
  Tab,
  Tabs,
  Grid,
  Breadcrumbs,
  Link,
  Typography
} from "@material-ui/core";

import { NavLink, useParams, useHistory, useLocation } from "react-router-dom";
import ItemContainer from './Items';
import VendorAPI from '../../api/vendor.api';
import LogoView from '../../components/LogoView';

import { useDispatch } from 'react-redux';
import { showErrorAlert, showSuccessAlert, hideAlert } from '../../actions/alert.action';
import IncomingVendorProducts from './IncomingVendorProducts'
import get from 'lodash/get';
import SuppliedItems from './SuppliedItems'
import ProductOptions from './SuppliedItems/productOptions'

function useQuery() {
  return new URLSearchParams(useLocation().search);
}


const VendorDetail = () => {
  const dispatch = useDispatch()
  const history = useHistory();
  let { id } = useParams();
  let query = useQuery();

  const [tabIndex, setTabIndex] = useState(1);

  const [vendorInfo, setVendorInfo] = useState({});
  const [snackbarOptions, setSnackbarOptions] = useState({ isOpen: false, message: '' });

  useEffect(() => {
    if (query.get('tab')) {
      setTabIndex(parseInt(query.get('tab')))
    }

  }, [query.get('tab')]);

  useEffect(() => {

    VendorAPI.getVendorApi(id)
      .then(res => {
        setVendorInfo(res.data);

      })
      .catch(error => {

      })

    return () => {

    }
  }, [id])

  const renderPageSwitch = () => {

    if (!get(vendorInfo, '_id')) {
      return null;
    }

    switch (tabIndex) {
      // case 1:
      //   return <ItemContainer vendorName={vendorInfo.name} vendorId={id} />;
      case 1:
        return <IncomingVendorProducts />
      case 2:
        return "pull reports base on items, and any details below";
      case 3:
        return <SuppliedItems />
      case 4:
        return "Shows all items to be billed for over here. configure the payments period over here. checks printing and mailing api will be linked to this ";
      case 5:
        return "shows a log of all items that do not pass vailidation along with other client complaints";
      case 6:
        return "if this vendor is a client, shows payments and billing, along with a unified net payments/billing description";
      case 10:
        return <ProductOptions />
      default:
        return "Undefined Tab Index";
    }
  }

  const handleSave = () => {
    itemProperties.itemId = undefined;

    syncWithServer(vendorInfo)
  }

  const syncWithServer = (data) => {
    VendorAPI.updateVendorApi(id, data)
      .then(res => {
        setVendorInfo(res.data);
        dispatch(showSuccessAlert({ message: 'All data is saved' }));
      })
      .catch(err => {
        dispatch(showErrorAlert({ message: 'Unable to save data' }));
      });
  }

  const handleLogoChange = ({ logoName, logoUrl }) => {
    const updatedValues = {
      ...vendorInfo,
      logoName,
      logoUrl
    };

    setVendorInfo(updatedValues);
    syncWithServer(updatedValues);
  }

  const handleTabChange = (event, newTabIndex) => {
    setTabIndex(newTabIndex)

    history.push({
      pathname: `/vendors/${id}`,
      search: `?tab=${newTabIndex}`
    })
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
                to='/vendors'>
                Vendors
              </NavLink>

              <Typography color="textPrimary">Vendor Details</Typography>
            </Breadcrumbs>
          </Paper>

          <Paper style={{ display: 'flex', padding: 10, margin: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h4>Vendor Name: {vendorInfo.name}</h4>
              <p>Vendor ID:{id}</p>
            </div>

            <LogoView
              logoUrl={vendorInfo.logoUrl}
              handleLogoChange={handleLogoChange}
              name={vendorInfo.name} />
          </Paper>

        </Grid>
        <Grid item sm={2}>
          <Paper style={{ padding: 20, margin: 10 }}>
            <Tabs
              orientation="vertical"
              variant="scrollable"
              value={tabIndex}
              onChange={handleTabChange}>
              {/* onChange={(event, newValue) => setValue(newValue)}> */}
              {/* <Tab label="Services" value={1} /> */}
              <Tab label="Incoming Vendor Products" value={1} />
              {/* <Tab label="Reports" value={2} /> */}
              {/* <Tab label="Service Agreement" value={3} /> */}
              <Tab label="Supplied Items" value={3} />
              <Tab label="Payments" value={4} />
              <Tab label="Validation Failures" value={5} />
              <Tab label="Vendor as Client" value={6} />

            </Tabs>
          </Paper>
        </Grid>
        <Grid item sm sm={10}>
          <Paper style={{ padding: 20, margin: 10 }}>
            {renderPageSwitch()}

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

export default VendorDetail;
