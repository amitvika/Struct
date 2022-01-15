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
import {
  CustomTabs,
  CustomTab,
  TabPanel
} from '@monostruct/common/components/CustomTabs/CustomTabs';

const TaskTypeAndTeamAssignment = () => {
  const dispatch = useDispatch();
  const [isTabsActive, setIsTabsActive] = useState(false);
  const [selectedValue, setSelectedValue] = useState(false);

  useEffect(() => {
    dispatch(fetchMyTeamAction());
  }, []);

  const handleItemClick = (id, data) => {
    setSelectedValue(data);
    setIsTabsActive(!isTabsActive);
  };

  if (isTabsActive) {
    return <TabComponent {...{ selectedValue }} />;
  }

  return (
    <TableGridView
      title={'Team Task Setup'}
      fields={teamTaskSetupFields}
      fetchList={TeamSetupAPI.fetchTeamTask}
      upsertListItem={TeamSetupAPI.upsertTeamTask}
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

const TabComponent = ({ selectedValue }) => {
  const [selectedTabIndex, setCurrentSelectedTab] = useState(0);

  const handleTabChange = (newValue) => {
    setCurrentSelectedTab(newValue);
  };

  return (
    <Box>
      <CustomTabs>
        <CustomTab
          label="Team assignment"
          {...{ handleTabChange, selectedTabIndex, selectedValue }}
          {...a11yProps(0)}
        />
        <CustomTab
          label="Task creation"
          {...{ handleTabChange, selectedTabIndex, selectedValue }}
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

export default React.memo(TaskTypeAndTeamAssignment);
