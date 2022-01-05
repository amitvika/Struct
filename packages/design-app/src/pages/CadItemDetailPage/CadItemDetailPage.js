import React from 'react';
import './style.css';

import DetailPage from '../../components/DetailComponent/DetailComponent';
import BaseItemProperties from '@monostruct/common/containers/BaseItemPropertiesTab';

const CadMaker = () => {
  const tabList = [
    {
      tabName: 'CAD or Upload/Customize CAD File',
      tabContent: BaseItemProperties
    },
    {
      tabName: 'Materials'
    },
    {
      tabName: 'GD&T And Assembly Constraints'
    },
    {
      tabName: 'Surface Finish and Treatment'
    },
    {
      tabName: 'Assembly'
    },
    {
      tabName: 'Classification'
    },
    {
      tabName: 'Functional Load and Simulation'
    },
    {
      tabName: 'Design Modifications'
    },
    {
      tabName: 'Manufacturing'
    },
    {
      tabName: 'Recycling and Sustainability'
    },
    {
      tabName: 'Assembly'
    },
    {
      tabName: 'Item Report'
    },
    {
      tabName: 'Make Item Configurable/Customizable'
    }
  ];

  return (
    <>
      <DetailPage
        title={'CAD Design'}
        tabList={tabList}
        isAddDesignVisible={true}
      ></DetailPage>
    </>
  );
};

export default CadMaker;
