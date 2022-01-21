import React, { useState, useEffect } from 'react';
import { Snackbar, Button, Paper, Tab, Tabs, Grid } from '@mui/material';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import VendorAPI from '@monostruct/common/api/vendor.api';
import TabContainer from '@monostruct/common/components/TabContainer';
import TabPanelContainer from '@monostruct/common/components/TabPanelContainer';

import { useDispatch } from 'react-redux';
import { showErrorAlert, showSuccessAlert } from '../../actions/alert.action';
import SuppliedItems from './suppliedItems';
import SuppliedItemOption from './suppliedItemOptions';
import get from 'lodash/get';
import { useQuery } from '../../utils/customHooks';
import './style.css';
import DetailComponentInnerHeader from '@monostruct/common/components/DetailComponentInnerHeader';
import Documentation from 'src/containers/documentation';

const VendorDetail = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  let { id } = useParams();
  let query = useQuery();

  const [tabIndex, setTabIndex] = useState(1);
  const [vendorInfo, setVendorInfo] = useState({});

  useEffect(() => {
    if (query.get('tab')) {
      setTabIndex(parseInt(query.get('tab')));
    }
  }, [query.get('tab')]);

  useEffect(() => {
    VendorAPI.getVendorApi(id)
      .then((res) => {
        setVendorInfo(res.data);
      })
      .catch((error) => {});

    return () => {};
  }, [id]);

  const renderPageSwitch = () => {
    if (!get(vendorInfo, '_id')) {
      return null;
    }

    switch (tabIndex) {
      case 1:
        if (query.get('item_id')) {
          return (
            <SuppliedItemOption
              productId={query.get('item_id')}
              productName={query.get('p_name')}
            />
          );
        } else {
          return 'Supplied Items';
          // <SuppliedItems
          //   vendorInfo={vendorInfo}
          //   setVendorInfo={setVendorInfo}
          // />
        }
      case 2:
        return 'Shows all items to be billed for over here. configure the payments period over here. checks printing and mailing api will be linked to this ';
      case 3:
        return 'shows a log of all items that do not pass vailidation along with other client complaints';
      case 4:
        return 'if this vendor is a client, shows payments and billing, along with a unified net payments/billing description';
      case 5:
        return <Documentation />;
      default:
        return 'Undefined Tab Index';
    }
  };

  const handleSave = (data = {}) => {
    vendorInfo.itemId = undefined;

    syncWithServer({ ...vendorInfo, ...data });
  };

  const syncWithServer = (data) => {
    VendorAPI.updateVendorApi(id, data)
      .then((res) => {
        setVendorInfo(res.data);
        dispatch(showSuccessAlert({ message: 'All data is saved' }));
      })
      .catch((err) => {
        dispatch(showErrorAlert({ message: 'Unable to save data' }));
      });
  };

  const handleLogoChange = ({ logoName, logoUrl }) => {
    const updatedValues = {
      ...vendorInfo,
      logoName,
      logoUrl
    };

    setVendorInfo(updatedValues);
    syncWithServer(updatedValues);
  };

  const handleTabChange = (newTabIndex, accessSetupId) => {
    setTabIndex(newTabIndex);

    let search = `?tab=${newTabIndex}`;

    history.push({
      pathname: `/vendors/${id}`,
      search
    });
  };
  const tabItems = [
    'Supplied Items',
    'Payments',
    'Validation Failures',
    'Vendor as Client'
  ];

  return (
    <>
      <DetailComponentInnerHeader
        {...{
          prefix: 'Vendor',
          name: vendorInfo.name,
          id: vendorInfo._id,
          handleSave,
          tabName: tabItems[tabItems - 1],
          action: '/vendors',
          title: 'Vendor Details',
          allowEditTitle: true,
          handleLogoChange,
          logoUrl: vendorInfo.logoUrl,
          allowLogoUpload: true
        }}
      />
      <Grid container style={{ display: 'flex' }}>
        <TabContainer>
          <Tabs
            orientation="vertical"
            variant="scrollable"
            value={tabIndex}
            onChange={(event, newTabIndex) => handleTabChange(newTabIndex)}
          >
            <Tab
              label="Supplied Items "
              value={1}
              className="tab"
              sx={{ alignItems: 'start' }}
            />
            <Tab
              label="Payments"
              value={2}
              className="tab"
              sx={{ alignItems: 'start' }}
            />
            <Tab
              label="Validation Failures"
              value={3}
              className="tab"
              sx={{ alignItems: 'start' }}
            />
            <Tab
              label="Vendor as Client"
              value={4}
              className="tab"
              sx={{ alignItems: 'start' }}
            />
            <Tab
              label="Documentation"
              value={5}
              className="tab"
              sx={{ alignItems: 'start' }}
            />
          </Tabs>
        </TabContainer>
        <TabPanelContainer>{renderPageSwitch()}</TabPanelContainer>
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
          onClick={handleSave}
        >
          Save
        </Button>
      </Snackbar>
    </>
  );
};

export default VendorDetail;
