import React from 'react';
import { Paper, Tab, Tabs, Grid } from '@material-ui/core';

export default function DetailPageTab({ tabList }) {
  const [selectedTab, setSelectedTab] = React.useState({});

  const handleTabChange = (event, newTabIndex) => {
    setSelectedTab(newTabIndex);
  };
  const renderTab = () => {
    return tabList.map((tab, index) => (
      <Tab
        label={`${index + 1}. ${tab.tabName}`}
        value={tab.tabName}
        style={{ textAlign: 'left' }}
      />
    ));
  };

  return (
    <Grid container>
      <Grid item sm={2}>
        <Paper style={{ margin: 10, marginBottom: '70px' }}>
          <Tabs
            className="MuiTab-wrapper"
            orientation="vertical"
            variant="scrollable"
            value={selectedTab.tabName}
            onChange={handleTabChange}
          >
            {renderTab()}
          </Tabs>
        </Paper>
      </Grid>
      <Grid item sm={10}>
        {selectedTab.tabName}
      </Grid>
    </Grid>
  );
}
