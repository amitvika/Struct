import React, { useEffect, useState } from 'react';
import { Snackbar, Button, Paper, Tab, Tabs, Grid } from '@mui/material';
import { NavLink, useHistory, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import CircularProgress from '@mui/material/CircularProgress';

import FactoriesAPI from '@monostruct/common/api/factories.api';
import { showErrorAlert, showSuccessAlert } from '../../actions/alert.action';

import BaseFactorySetup from './baseFactorySetup';
import ItemsInProduction from './itemsInProduction';
import Autoscaling from './autoscaling';
import FloorplanSetup from './floorplanSetup';
import FacilityCapabilities from './FacilityCapabilities';
import './style.css';

import get from 'lodash/get';
import { useQuery } from 'src/utils/customHooks';
import TabContainer from '@monostruct/common/components/TabContainer';
import TabPanelContainer from '@monostruct/common/components/TabPanelContainer';
import DetailComponentInnerHeader from '@monostruct/common/components/DetailComponentInnerHeader';
import FactoryLevelProcesses from './FactoryLevelProcesses';

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

  const handleSave = (data = {}) => {
    syncWithServer({ ...factoryValue, ...data });
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
      case 6:
        return <FactoryLevelProcesses />;
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
        <CircularProgress />
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
  const tabItems = [
    'Base Factory Setup',
    'Items in Production',
    'Floorplan Setup',
    'Facility Capabilities',
    'Autoscaling',
    'Factory Level Processes'
  ];

  return (
    <>
      <DetailComponentInnerHeader
        {...{
          prefix: 'Factory',
          name: factoryValue.name,
          id: factoryValue.id,
          action: '/factories',
          handleSave,
          title: 'Factories Details',
          allowEditTitle: true,
          allowLogoUpload: false,
          tabName: tabItems[tabIndex - 1]
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
            <Tab
              label="Base Factory Setup"
              value={1}
              className="tab"
              sx={{ alignItems: 'start' }}
            />
            <Tab
              label="Items in Production"
              value={2}
              className="tab"
              sx={{ alignItems: 'start' }}
            />
            <Tab
              label="Floorplan Setup"
              value={3}
              className="tab"
              sx={{ alignItems: 'start' }}
            />
            <Tab
              label="Facility Capabilities"
              value={4}
              className="tab"
              sx={{ alignItems: 'start' }}
            />
            <Tab
              label="Autoscaling"
              value={5}
              className="tab"
              sx={{ alignItems: 'start' }}
            />
            <Tab
              label="Factory Level Processes"
              value={6}
              className="tab"
              sx={{ alignItems: 'start' }}
            />
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
