import React from 'react';
import './style.css';

import CadMakerDesigner from '../../containers/CadMakerDesigner/CadMakerDesigner';
import DetailPage from '../../components/DetailComponent/DetailComponent';
import ManufactureProcessingProcessSimulation from '@monostruct/common/containers/ManufactureProcessingProcessSimulation';

const CadMaker = () => {
  const tabList = [
    {
      tabName: 'Designer',
      tabContent: CadMakerDesigner,
    },
    {
      tabName: 'Manufacture',
      tabContent: ManufactureProcessingProcessSimulation,
    },
    {
      tabName: 'Classification',
      tabContent: CadMakerDesigner,
    },
  ];

  return (
    <>
      <DetailPage title={'CAD'} tabList={tabList}></DetailPage>
    </>
  );
};

export default CadMaker;
