import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import TeamSetupAPI from '@monostruct/common/api/teamTask.api';
import { teamTaskSetupFields } from '@monostruct/common/constants/team';
import TableGridView from '@monostruct/common/components/TableGridView';
import AddUpdateModal from './AddUpdateModal';
import { fetchMyTeamAction } from '../../../actions/team.action';
import Box from '@mui/material/Box';
import TeamAssignment from './TeamAssignment/TeamAssignment';
import TaskCreation from './TaskCreation/TaskCreation';
import { TabPanel } from '@monostruct/common/components/CustomTabs/CustomTabs';
import { get } from 'lodash';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';

const TaskTypeAndTeamAssignment = () => {
  const dispatch = useDispatch();
  const [isTabsActive, setIsTabsActive] = useState(false);
  const [selectedValue, setSelectedValue] = useState(null);

  useEffect(() => {
    dispatch(fetchMyTeamAction());
  }, []);

  const handleItemClick = (id, data) => {
    setSelectedValue(data);
    setIsTabsActive(!isTabsActive);
  };

  if (isTabsActive) {
    return <TabComponent {...{ selectedValue, setSelectedValue }} />;
  }

  const handleItemUpdate = (data) => {
    if (data.assigned_teams) {
      data.assigned_teams = get(data, 'assigned_teams', []).map(
        (team) => team.id
      );
    }
    return TeamSetupAPI.upsertTeamTask(data);
  };

  return (
    <TableGridView
      title={'Team Task Setup'}
      fields={teamTaskSetupFields}
      fetchList={TeamSetupAPI.fetchTeamTask}
      upsertListItem={handleItemUpdate}
      isEditLinkVisible={true}
      {...{
        AddUpdateModal,
        handleItemClick
      }}
    />
  );
};

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
    tabIndex: index
  };
}

const TabComponent = ({ selectedValue, setSelectedValue, setIsTabsActive }) => {
  const [selectedTabIndex, setCurrentSelectedTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setCurrentSelectedTab(newValue);
  };

  const handleClick = () => {
    setIsTabsActive(false);
  };
  return (
    <>
      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          width: '100%',
          bgcolor: 'background.paper'
        }}
      >
        {/* <CustomTabs>
        <CustomTab
        label="Team assignment"
        {...{ handleTabChange, selectedTabIndex }}
        {...a11yProps(0)}
        />
        <CustomTab
        label="Task creation"
        {...{ handleTabChange, selectedTabIndex }}
        {...a11yProps(1)}
        />
      </CustomTabs> */}
        <IconButton
          color="primary"
          onClick={handleClick}
          component="span"
          size="large"
          sx={{
            position: 'absolute',
            zIndex: 9
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Tabs value={selectedTabIndex} onChange={handleTabChange} centered>
          <Tab label="Team assignment" {...a11yProps(0)} />
          <Tab label="Task creation" {...a11yProps(1)} />
        </Tabs>
      </Box>
      <TabPanel value={selectedTabIndex} index={0}>
        <TeamAssignment {...{ selectedValue, setSelectedValue }} />
      </TabPanel>
      <TabPanel value={selectedTabIndex} index={1}>
        <TaskCreation />
      </TabPanel>
    </>
  );
};

export default React.memo(TaskTypeAndTeamAssignment);
