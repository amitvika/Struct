import React from 'react';
import './style.css';

import CadMakerDesigner from '../../containers/CadMakerDesigner/CadMakerDesigner';
import DetailPage from '../../components/DetailComponent/DetailComponent';
// import Manufacturing from '@monostruct/internal-app/src/containers/manufacture/index2'

const CadMaker = () => {
  const tabList = [
    {
      tabName: 'Designer',
      tabContent: <CadMakerDesigner />,
    },
    {
      tabName: 'Manufacture',
      // tabContent: <Manufacturing />,
    },
    {
      tabName: 'Classification',
      tabContent: <CadMakerDesigner />,
    },
  ];

  return (
    <>
      <DetailPage title={'CAD'} tabList={tabList}></DetailPage>
    </>
  );
};

export default CadMaker;
