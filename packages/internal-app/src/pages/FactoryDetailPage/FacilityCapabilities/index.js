import React, { useState } from 'react';
import Box from '@mui/material/Box';

import {
  CustomTabs,
  CustomTab
} from '@monostruct/common/components/CustomTabs/CustomTabs';

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
    tabIndex: index
  };
}

const FacilityCapabilities = () => {
  const [selectedTabIndex, setCurrentSelectedTab] = useState(0);

  const handleTabChange = (newValue) => {
    setCurrentSelectedTab(newValue);
  };

  return (
    <Box>
      <CustomTabs>
        <CustomTab
          label="Motion Control"
          {...{ handleTabChange, selectedTabIndex }}
          {...a11yProps(0)}
        />
        <CustomTab
          label="Tools"
          {...{ handleTabChange, selectedTabIndex }}
          {...a11yProps(1)}
        />
      </CustomTabs>
    </Box>
  );
};

export default React.memo(FacilityCapabilities);
