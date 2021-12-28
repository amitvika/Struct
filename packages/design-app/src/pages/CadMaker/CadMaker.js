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
    }
  ];

  return (
    <>
      <DetailPage title={'CAD'} tabList={tabList}></DetailPage>
    </>
  );
};

export default CadMaker;
