import React from 'react';
import './style.css';

import CadMakerDesigner from '../../containers/CadMakerDesigner/CadMakerDesigner';
import DetailPage from '../../components/DetailComponent/DetailComponent';

const CadMaker = () => {
  const tabList = [
    {
      tabName: 'Designer',
      tabContent: <CadMakerDesigner />,
    },
    {
      tabName: 'Manufacture',
      tabContent: <CadMakerDesigner />,
    },
    {
      tabName: 'Classification',
      tabContent: <CadMakerDesigner />,
    },
  ];

  return (
    <>
      <DetailPage tabList={tabList} title={'CAD'}></DetailPage>
    </>
  );
};

export default CadMaker;
