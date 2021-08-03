import React from 'react'
import Paper from '@material-ui/core/Paper';
import Headding from '@ravibasil/common/components/atoms/Headding';
import Viewer from '@ravibasil/common/components/Viewer';
import AddDesign from './addDesign';

export default function ProductTab({ gltfjson = {}, setgltfjson }) {
  return (
    <>
      <AddDesign />
      <Paper style={{ padding: 20, margin: 10, }}>
        <Headding>ThreeJS Screen</Headding>
        <Viewer
          gltfjson={gltfjson}
          setgltfjson={setgltfjson}
        />
      </Paper>
    </>
  )
}
