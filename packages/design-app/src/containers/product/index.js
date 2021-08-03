import React from 'react'
import Paper from '@material-ui/core/Paper';
import Headding from '@ravibasil/common/components/atoms/Headding';

export default function ProductTab({ gltfjson, setgltfjson }) {
  return (
    <>
      <Paper style={{ padding: 20, margin: 10, }}>
        <Headding>ThreeJS Screen</Headding>
        {/* <Viewer
                        gltfjson={gltfjson}
                        setgltfjson={setgltfjson}
                    /> */}
      </Paper>
    </>
  )
}
