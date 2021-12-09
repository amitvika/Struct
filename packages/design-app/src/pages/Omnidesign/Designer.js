import React from 'react';
import Viewer from '@monostruct/common/components/Viewer';
import Paper from '@mui/material/Paper';
import Headding from '@monostruct/common/components/atoms/Headding';

export default function Designer({ gltfjson = {}, setgltfjson }) {
  return (
    <Paper style={{ padding: 20, margin: 10 }}>
      <Headding>ThreeJS Screen</Headding>
      <Viewer gltfjson={gltfjson} setgltfjson={setgltfjson} />
    </Paper>
  );
}
