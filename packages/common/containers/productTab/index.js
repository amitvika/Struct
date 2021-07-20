import React from 'react'
import Product from '../product'
import Paper from '@material-ui/core/Paper';
import { Headding } from 'src/components';
import Viewer from '@ravibasil/internal-app/src/components/Viewer'

export default function ProductTab({ gltfjson, setgltfjson }) {
    return (
        <div>
            <Product />
            <Paper style={{ padding: 20, margin: 10,  }}>
                <Headding>ThreeJS Screen</Headding>
                    <Viewer
                        gltfjson={gltfjson}
                        setgltfjson={setgltfjson}
                    />
            </Paper>
        </div>
    )
}
