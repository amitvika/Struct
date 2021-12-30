import React from 'react';
import { Tab, Tabs, Grid } from '@mui/material';

import TabContainer from '@monostruct/common/components/TabContainer';
import TabPanelContainer from '@monostruct/common/components/TabPanelContainer';

export default function DetailPageTab({ tabList }) {
  const [selectedTabIndex, setSelectedTabIndex] = React.useState(0);

  const handleTabChange = (event, newTabIndex) => {
    setSelectedTabIndex(newTabIndex);
  };
  const renderTab = () => {
    return tabList.map((tab, index) => (
      <Tab
        label={`${tab.tabName}`}
        value={index}
        sx={{
          textAlign: 'left',
          minHeight: '30px',
          alignItems: 'start'
        }}
      />
    ));
  };

  const TabContent = tabList[selectedTabIndex]
    ? tabList[selectedTabIndex].tabContent
    : null;

  return (
    <Grid container style={{ flexWrap: 'unset' }}>
      <TabContainer>
        <Tabs
          className="MuiTab-wrapper"
          orientation="vertical"
          variant="scrollable"
          value={selectedTabIndex}
          onChange={handleTabChange}
        >
          {renderTab()}
        </Tabs>
      </TabContainer>
      <TabPanelContainer>{TabContent && <TabContent />}</TabPanelContainer>
    </Grid>
  );
}
