import React from 'react'
import Viewer from '@ravibasil/common/components/Viewer';
import Paper from '@material-ui/core/Paper';
import Headding from '@ravibasil/common/components/atoms/Headding';

export default function PredesignedComponents({ gltfjson = {}, setgltfjson }) {
  return (
    <Paper style={{ padding: 20, margin: 10, }}>
      <Headding>ThreeJS Screen</Headding>
      <Viewer
        gltfjson={gltfjson}
        setgltfjson={setgltfjson}
      />
    </Paper>
  )
}
