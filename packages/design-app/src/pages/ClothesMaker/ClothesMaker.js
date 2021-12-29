import React from 'react';
import DetailComponent from '../../components/DetailComponent/DetailComponent';

export default function ClothesMaker() {
  const tabList = [
    {
      tabName: 'Designer'
      // tabContent: <CadMakerDesigner />,
    },
    {
      tabName: 'Manufacture'
      // tabContent: <CadMakerDesigner />,
    },
    {
      tabName: 'Classification'
      // tabContent: <CadMakerDesigner />,
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
    <DetailComponent
      title={'Clothes Maker'}
      tabList={tabList}
      type={'CLOTHES'}
    />
  );
}
