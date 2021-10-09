import React from 'react';
import Viewer from '@monostruct/common/components/Viewer';
import Paper from '@material-ui/core/Paper';
import Headding from '@monostruct/common/components/atoms/Headding';
import DetailComponent from '../../components/DetailComponent/DetailComponent';

export default function PcbTab({ gltfjson = {}, setgltfjson }) {
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
    <DetailComponent title={'Silicon Maker'} tabList={tabList}/>
    // <Paper style={{ padding: 20, margin: 10 }}>
    //   <Headding>ThreeJS Screen</Headding>
    //   <Viewer gltfjson={gltfjson} setgltfjson={setgltfjson} />
    // </Paper>
  );
}
