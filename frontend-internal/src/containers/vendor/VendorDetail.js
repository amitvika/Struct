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

import { NavLink, useParams } from "react-router-dom";
import ItemContainer from './Items';
import VendorAPI from '../../api/vendor.api';
import LogoView from '../../components/LogoView';
import MuiAlert from '@material-ui/lab/Alert';

function Alert(props) {
	return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const VendorDetail = () => {
  const [value, setValue] = useState(1);
  const [vendorInfo, setVendorInfo] = useState({});
  let { id } = useParams();
  const [snackbarOptions, setSnackbarOptions] = useState({ isOpen: false, message: '' });


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

  const renderPageSwitch = (index) => {
    switch (index) {
      case 1:
        return <ItemContainer vendorName={vendorInfo.name} vendorId={id} />;
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

  const handleSave = () => {
    VendorAPI.updateVendorApi(id, vendorInfo)
      .then(res => {
        setVendorInfo(res.data);
        setSnackbarOptions({ isOpen: true, message: 'All data is saved' })
      })
      .catch(err => {
        setSnackbarOptions({ isOpen: true, message: 'Unable to perform operation' })
      });
  }

  const handleLogoChange = ({ logoName, logoUrl }) => {
    setVendorInfo(prevState => {
      return {
        ...prevState,
        logoName,
        logoUrl
      }
    });
  }

  
	const handleSnackbarClose = () => {
		setSnackbarOptions({ isOpen: false })
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
            <div>
              <h4>Vendor Name: {vendorInfo.name}</h4>
              <p>Vendor ID:{id}</p>
            </div>

            <LogoView
              logoUrl={vendorInfo.logoUrl}
              handleLogoChange={handleLogoChange} />
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
              <Tab label="Validation Failures" value={5} />
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
      <Snackbar open={snackbarOptions.isOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
				<Alert onClose={handleSnackbarClose} severity="success">
					{snackbarOptions.message}
				</Alert>
			</Snackbar>
    </>
  );
}

export default VendorDetail;
