import React, { useState, useEffect } from 'react';
import Paper from '@mui/material/Paper';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Grid from '@mui/material/Grid';

import { useHistory } from 'react-router-dom';
import { useQuery } from '../../utils/customHooks';

import TeamSetup from '../teamSetup';
import TeamTaskSetup from '../teamTaskSetup';
import AccessSetup from '../accessSetup';
import CriteriaUpload from '../criteriaUpload';
import Users from '../users';
import ConfigurationHistory from 'src/pages/ConfigurationHistory';
import './style.css';
import { Headding } from 'src/components';

const Administrative = () => {
  const history = useHistory();
  let query = useQuery();

  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    if (query.get('tab')) {
      setTabIndex(parseInt(query.get('tab')));
    }
  }, [query, query.get('tab')]);

  const renderPageSwitch = () => {
    switch (tabIndex) {
      case 0:
        return <Users />;
      case 1:
        return <TeamSetup />;
      case 2:
        return <TeamTaskSetup />;
      case 3:
        return (
          <AccessSetup
            handleTabChange={handleTabChange}
            accessSetupId={query.get('accessSetupId')}
          />
        );
      case 4:
        return <CriteriaUpload />;
      case 5:
        return <ConfigurationHistory />;

      default:
        return 'Undefined Tab Index';
    }
  };

  const handleTabChange = (event, newTabIndex, accessSetupId) => {
    setTabIndex(newTabIndex);

    let search = `?tab=${newTabIndex}`;
    if (accessSetupId) {
      search += `&accessSetupId=${accessSetupId}`;
    }

    history.push({
      pathname: `/administrative`,
      search
    });
  };

  return (
    <>
      <Grid container>
        <Grid item sm={12}>
          <Paper
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: 30,
              margin: 10
            }}
          >
            <Headding as={'h4'}>Administrative</Headding>
          </Paper>
        </Grid>

        <Grid item sm={2}>
          <Paper style={{ padding: 20, margin: 10 }}>
            <Tabs
              orientation="vertical"
              variant="scrollable"
              value={tabIndex}
              onChange={handleTabChange}
            >
              <Tab label="All Users" value={0} className="tab" />
              <Tab label="User Access Permissions" value={3} className="tab" />
              <Tab label="Team User Assignments" value={1} className="tab" />
              <Tab
                label="Task Types & Team Assigments"
                value={2}
                className="tab"
              />
              <Tab label="Criteria Upload" value={4} className="tab" />
              <Tab label="Configuration History" value={5} className="tab" />
            </Tabs>
          </Paper>
        </Grid>
        <Grid item sm={10}>
          <Paper style={{ padding: 25, margin: 10 }}>
            {renderPageSwitch()}
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default Administrative;
