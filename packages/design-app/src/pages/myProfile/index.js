import React from 'react';

import CadMakerDesigner from '../../containers/CadMakerDesigner/CadMakerDesigner';
import DetailPage from '../../components/DetailComponent/DetailComponent';

const MyProfile = () => {
  const tabList = [
    {
      tabName: 'My Info',
      tabContent: <CadMakerDesigner />,
    },
    {
      tabName: 'My Machines and Tools',
      tabContent: <CadMakerDesigner />,
    },
    {
      tabName: 'My Orders',
      tabContent: <CadMakerDesigner />,
    },
    {
      tabName: 'My Sales',
      tabContent: <CadMakerDesigner />,
    },
  
  ];

  return (
    <>
      <DetailPage
        title={'My Profile'}
        tabList={tabList}
        isAddDesignVisible={false}
      ></DetailPage>
    </>
  );
};

export default MyProfile;
