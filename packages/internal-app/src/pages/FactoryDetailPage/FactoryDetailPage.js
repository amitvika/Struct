import React, { useEffect, useState } from 'react';
import { Snackbar, Button, Paper, Tab, Tabs, Grid } from '@material-ui/core';
import { NavLink, useHistory, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Spinner } from 'reactstrap';

import FactoriesAPI from '@monostruct/common/api/factories.api';
import { showErrorAlert, showSuccessAlert } from '../../actions/alert.action';

import BaseFactorySetup from './baseFactorySetup';
import ItemsInProduction from './itemsInProduction';
import Autoscaling from './autoscaling';
import FloorplanSetup from './floorplanSetup';
import SubHeaderWithArrow from '../../components/SubHeaderWithArrow';
import FacilityCapabilities from './FacilityCapabilities';
import './style.css';

import get from 'lodash/get';
import { useQuery } from 'src/utils/customHooks';
import TabContainer from '@monostruct/common/components/TabContainer';
import TabPanelContainer from '@monostruct/common/components/TabPanelContainer';
import DetailComponentInnerHeader from '@monostruct/common/components/DetailComponentInnerHeader';

const FactoriesDetail = () => {
  let { id } = useParams();
  const dispatch = useDispatch();
  const history = useHistory();
  let query = useQuery();

  const [tabIndex, setTabIndex] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [value, setValue] = useState(1);
  const [factoryValue, setFactoryValue] = useState({});

  useEffect(() => {
    if (query.get('tab')) {
      setTabIndex(parseInt(query.get('tab')));
    }
  }, [query.get('tab')]);

  useEffect(() => {
    setIsLoading(true);
    FactoriesAPI.fetchFactories(`factory_id=${id}`)
      .then((res) => {
        setFactoryValue(get(res, 'data[0]', {}));

        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        dispatch(showErrorAlert({ message: 'Unable to get client' }));
        console.log('Error :', error);
      });
  }, [id]);

  const handleSave = () => {
    syncWithServer(factoryValue);
  };

  const syncWithServer = (data) => {
    FactoriesAPI.upsertFactoryApi(data)
      .then((res) => {
        setFactoryValue(res.data);
        dispatch(showSuccessAlert({ message: 'All data is saved' }));
      })
      .catch((error) => {
        console.log('Error :', error);
        setIsLoading(false);
        dispatch(showErrorAlert({ message: 'Unable to save data' }));
      });
  };

  const renderPageSwitch = (index) => {
    if (!get(factoryValue, 'id')) {
      return null;
    }
    switch (tabIndex) {
      case 1:
        return (
          <BaseFactorySetup
            factoryId={id}
            setFactoryValue={setFactoryValue}
            factoryValue={factoryValue}
          />
        );
      case 2:
        return (
          <ItemsInProduction
            factoryId={id}
            setFactoryValue={setFactoryValue}
            factoryValue={factoryValue}
          />
        );
      case 3:
        return <FloorplanSetup />;
      case 4:
        return <FacilityCapabilities />;
      case 5:
        return <Autoscaling />;
      default:
        return 'Undefined Tab Index';
    }
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <Spinner animation="border" />
      </div>
    );
  }
  const handleTabChange = (newTabIndex, accessSetupId) => {
    setTabIndex(newTabIndex);

    let search = `?tab=${newTabIndex}`;
    // if (query.get('product')) {
    //     search += `&product=${query.get('product')}`
    // }

    history.push({
      pathname: `/factories/${id}`,
      search
    });
  };

  return (
    <>
      <DetailComponentInnerHeader
        {...{
          prefix: 'Factory',
          name: factoryValue.name,
          id: factoryValue.id,
          action: '/factories',
          title: 'Factories Details',
          allowEditTitle: false,
          allowLogoUpload: false
        }}
      />

      <Grid container>
        <TabContainer>
          <Tabs
            orientation="vertical"
            variant="scrollable"
            value={tabIndex}
            onChange={(event, newTabIndex) => handleTabChange(newTabIndex)}
            className="tab"
          >
            <Tab label="Base Factory Setup" value={1} className="tab" />
            <Tab label="Items in Production" value={2} className="tab" />
            <Tab label="Floorplan Setup" value={3} className="tab" />
            <Tab label="Facility Capabilities" value={4} className="tab" />
            <Tab label="Autoscaling" value={5} className="tab" />
          </Tabs>
        </TabContainer>
        <TabPanelContainer>{renderPageSwitch(value)}</TabPanelContainer>
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

export default FactoriesDetail;
