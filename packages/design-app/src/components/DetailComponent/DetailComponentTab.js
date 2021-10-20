import React from 'react';
import { Paper, Tab, Tabs, Grid } from '@material-ui/core';

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
        style={{ textAlign: 'left' }}
      />
    ));
  };

  

  const TabContent = tabList[selectedTabIndex] ? tabList[selectedTabIndex].tabContent : null; 

  return (
    <Grid container>
      <Grid item sm={2}>
        <Paper style={{ margin: 10, marginBottom: '70px' }}>
          <Tabs
            className="MuiTab-wrapper"
            orientation="vertical"
            variant="scrollable"
            value={selectedTabIndex}
            onChange={handleTabChange}
          >
            {renderTab()}
          </Tabs>
        </Paper>
      </Grid>
      <Grid item sm={10}>
        <TabContent/>
      </Grid>
    </Grid>
  );
}
