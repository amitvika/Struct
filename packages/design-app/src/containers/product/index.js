import React from 'react';
import Paper from '@mui/material/Paper';
import Headding from '@monostruct/common/components/atoms/Headding';
import Viewer from '@monostruct/common/components/Viewer';
import AddDesign from './addDesign';

export default function ProductTab({ gltfjson = {}, setgltfjson }) {
  return (
    <>
      <AddDesign />
      <Paper style={{ padding: 20, margin: 10 }}>
        <Headding>ThreeJS Screen</Headding>
        <Viewer gltfjson={gltfjson} setgltfjson={setgltfjson} />
      </Paper>
    </>
  );
}
