import React from 'react';
import { Tab, Tabs, Grid } from '@mui/material';

import TabContainer from '@monostruct/common/components/TabContainer';
import TabPanelContainer from '@monostruct/common/components/TabPanelContainer';
import { useHistory } from 'react-router-dom';

export default function DetailPageTab({
  tabList,
  urlPathname = '',
  changeUrlOnTabChange = false
}) {
  const history = useHistory();

  const [selectedTabIndex, setSelectedTabIndex] = React.useState(0);

  const handleTabChange = (event, newTabIndex) => {
    setSelectedTabIndex(newTabIndex);
    if (tabList[newTabIndex].tabId) {
      history.push({
        pathname: urlPathname,
        search: `?tab=${tabList[newTabIndex].tabId}`
      });
    }
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

  const TabProps = tabList[selectedTabIndex]
    ? tabList[selectedTabIndex].tabProps
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
      <TabPanelContainer>
        {TabContent && <TabContent {...{ ...TabProps }} />}
      </TabPanelContainer>
    </Grid>
  );
}
