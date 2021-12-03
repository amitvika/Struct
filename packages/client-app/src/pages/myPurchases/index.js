import React, { useState } from 'react';
import { Tab, Tabs } from '@material-ui/core';
import TabContainer from '@monostruct/common/components/TabContainer';
import TabPanelContainer from '@monostruct/common/components/TabPanelContainer';

export default function MyPurchases() {
  const [tabIndex, setTabIndex] = useState(1);

  const handleTabChange = (newTabIndex) => {
    console.log('Current Tab');
  };

  return (
    <div>
      <TabContainer>
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={tabIndex}
          onChange={(event, newTabIndex) => handleTabChange(newTabIndex)}
          className="tab"
        >
          <Tab label="Products" value={1} className="tab" />
          <Tab label="Usage" value={2} className="tab" />
          <Tab label="Support" value={3} className="tab" />
        </Tabs>
      </TabContainer>

      <TabPanelContainer></TabPanelContainer>
    </div>
  );
}
