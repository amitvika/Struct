import React from 'react'
import DetailComponent from '../../components/DetailComponent/DetailComponent'

export default function ProductMaker() {
  const tabList = [
    {
      tabName: 'Designer',
      // tabContent: <CadMakerDesigner />,
    },
    {
      tabName: 'Manufacture',
      // tabContent: <CadMakerDesigner />,
    },
    {
      tabName: 'Classification',
      // tabContent: <CadMakerDesigner />,
    },
  ];
  return (
    <DetailComponent title={'Product Maker'} tabList={tabList}/>
  )
}
