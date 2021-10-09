import React from 'react'
import DetailComponent from '../../components/DetailComponent/DetailComponent'

export default function ArchitectureDesigner() {
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
    <DetailComponent title={'Architecture Designer'} tabList={tabList}/>
  )
}
