import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import TeamSetupAPI from '@monostruct/common/api/teamTask.api';
import { teamTaskSetupFields } from '@monostruct/common/constants/team';
import TableGridView from '@monostruct/common/components/TableGridView';
import AddUpdateModal from './AddUpdateModal';
import { fetchMyTeamAction } from '../../../actions/team.action';
import ManageTeamModal from './ManageTeamModal';
import Box from '@mui/material/Box';
import TeamAssignment from './TeamAssignment/TeamAssignment';
import TaskCreation from './TaskCreation/TaskCreation';
import {
  CustomTabs,
  CustomTab,
  TabPanel
} from '@monostruct/common/components/CustomTabs/CustomTabs';

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
    'aria-controls': `full-width-tabpanel-${index}`,
    tabIndex: index
  };
}

const TabComponent = () => {
  const [selectedTabIndex, setCurrentSelectedTab] = useState(0);

  const handleTabChange = (newValue) => {
    setCurrentSelectedTab(newValue);
  };

  return (
    <Box>
      <CustomTabs>
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
      </CustomTabs>
      <TabPanel value={selectedTabIndex} index={0}>
        <TeamAssignment />
      </TabPanel>
      <TabPanel value={selectedTabIndex} index={1}>
        <TaskCreation />
      </TabPanel>
    </Box>
  );
};

export default TaskTypeAndTeamAssignment;
