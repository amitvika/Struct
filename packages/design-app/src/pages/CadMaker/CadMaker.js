import React from 'react';
import './style.css';

import CadMakerDesigner from '../../containers/CadMakerDesigner/CadMakerDesigner';
import DetailPage from '../../components/DetailComponent/DetailComponent';
import ManufactureProcessingProcessSimulation from '@monostruct/common/containers/ManufactureProcessingProcessSimulation';
import CadCategory from '../../containers/CadCategory/CadCategory';

const CadMaker = () => {
  const tabList = [
    {
      tabName: 'Category',
      tabContent: CadCategory
    },
    {
      tabName: 'Designer',
      tabContent: CadMakerDesigner
    },
    {
      tabName: 'Manufacture',
      tabContent: ManufactureProcessingProcessSimulation
    },
    {
      tabName: 'Classification',
      tabContent: CadMakerDesigner
    },
    {
      tabName: 'Molecules'
    },
    {
      tabName: 'Therapies'
      // tabContent: <CadMakerDesigner />,
    },
    {
      tabName: '“Culinary”'
      // tabContent: <CadMakerDesigner />,
    }
  ];

  return (
    <>
      <DetailPage title={'CAD'} tabList={tabList} type={'CAD'}></DetailPage>
    </>
  );
};

export default CadMaker;
