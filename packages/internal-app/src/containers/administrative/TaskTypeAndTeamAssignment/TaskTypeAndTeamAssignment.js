import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import TeamSetupAPI from '@monostruct/common/api/teamTask.api';
import { teamTaskSetupFields } from '@monostruct/common/constants/team';
import TableGridView from '@monostruct/common/components/TableGridView';
import AddUpdateModal from './AddUpdateModal';
import { fetchMyTeamAction } from '../../../actions/team.action';
import ManageTeamModal from './ManageTeamModal';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import TeamAssignment from './TeamAssignment/TeamAssignment';
import TaskCreation from './TaskCreation/TaskCreation';

const TaskTypeAndTeamAssignment = () => {
  const dispatch = useDispatch();
  const [isTabsActive, setIsTabsActive] = useState(false);

  useEffect(() => {
    dispatch(fetchMyTeamAction());
  }, []);

  const handleItemClick = () => setIsTabsActive(!isTabsActive);

  if (isTabsActive) {
    return <TabComponent />;
  }

  return (
    <TableGridView
      title={'Team Task Setup'}
      fields={teamTaskSetupFields}
      fetchList={TeamSetupAPI.fetchTeamTask}
      upsertListItem={TeamSetupAPI.upsertTeamTask}
      isEditLinkVisible={true}
      isManageTeamVisible={true}
      {...{
        AddUpdateModal,
        ManageTeamModal,
        handleItemClick
      }}
    />
  );
};

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`
  };
}

const TabComponent = () => {
  const [currentSelectedTab, setCurrentSelectedTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setCurrentSelectedTab(newValue);
  };

  return (
    <Box>
      <Tabs
        value={currentSelectedTab}
        onChange={handleTabChange}
        indicatorColor="secondary"
        textColor="inherit"
        variant="fullWidth"
        aria-label="full width team type assignment"
      >
        <Tab label="Team assignment " {...a11yProps(0)} />
        <Tab label="Task creation" {...a11yProps(1)} />
      </Tabs>
      <TabPanel value={currentSelectedTab} index={0}>
        <TeamAssignment />
      </TabPanel>
      <TabPanel value={currentSelectedTab} index={1}>
        <TaskCreation />
      </TabPanel>
    </Box>
  );
};

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default TaskTypeAndTeamAssignment;
