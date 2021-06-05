import React, { useState } from 'react'
import Select from '../../../components/atoms/Select';
import Input from '../../../components/atoms/Input';
import Grid from '@material-ui/core/Grid';
import Heading from '../../../components/atoms/Headding'
import GeometricDimensioning from '../geometricDimensioning'
import GLTFRenderer from '../../../gltf/GltfRenderer'
import { Paper } from '@material-ui/core';
import CircularProgress from '@material-ui/core'
import Viewer from '../geometricDimensioning/Viewer'
import Headding from '../../../components/atoms/Headding';

export default function MachineTool_Workholding({ itemConfiguration, handleOnChange, gltfjson, setgltfjson }) {
    return (
        <>
            <Grid item xs={4} >
                <Heading bold>Machine - Compound/Tool/Workholding</Heading>
                <Select
                    label="Used For"
                    placeholder="Machine/Tool Type"
                    options={[
                        { label: 'Motion Control', value: 'Motion Control' },
                        { label: 'Workholding', value: 'Workholding' },
                        { label: 'Tool', value: 'Tool' }
                    ]}
                    onChange={(data) => handleOnChange('machineToolWorkholding', data.value)}
                    value={itemConfiguration.machineToolWorkholding && { label: itemConfiguration.machineToolWorkholding }}
                />

            </Grid>

            <Grid container spacing={4} style={{display: "block"}}>
                <Grid style={{textAlign: "center",marginLeft: "230px"}}>
                <Headding >Custom Selections</Headding>
                </Grid>
                <Grid item xs={6}>
                    <Viewer
                        gltfjson={gltfjson}
                        setgltfjson={setgltfjson}
                    />
                </Grid>
            </Grid>
            {
                itemConfiguration.machineToolWorkholding === 'Workholding' &&
                <>
                    <Grid item xs={4}>
                        <Select
                            label="For Workholding"
                            placeholder="Select"
                            options={[
                                { label: 'Linear Clamp', value: 'Linear Clamp' },
                                { label: 'Rotary Clamp', value: 'Rotary Clamp' },
                                { label: 'Pressure Vessel', value: 'Pressure Vessel' },
                                { label: 'Liquid Vat', value: 'Liquid Vat' },
                                { label: 'Bulk Particulate Container', value: 'Bulk Particulate Container' },
                            ]}
                        />
                    </Grid>
                </>
            }
            {
                itemConfiguration.machineToolWorkholding === 'Tool' &&
                <>
                    <Grid item xs={4} >
                        <Select
                            label="For Tool Type"
                            placeholder="Select"
                            options={[
                                { label: 'Stationary/Fixed Cutting Tool', value: 'Static Cutter' },
                                { label: 'Rotary Cutting Tool', value: 'Rotational Tool' },
                                { label: 'Press Tool/Mold', value: 'Dynamic Mold' }
                            ]}
                            onChange={(data) => handleOnChange('machineToolWorkholdingToolType', data.value)}
                            value={itemConfiguration.machineToolWorkholdingToolType && { label: itemConfiguration.machineToolWorkholdingToolType }}
                        />
                    </Grid>
                    {
                        itemConfiguration.machineToolWorkholdingToolType === 'Rotational Tool' &&
                        <>
                            <Grid item xs={4} />
                            <Grid item xs={4} >
                                <Input
                                    label="Max Tool Diameter"
                                    placeholder="Enter"
                                    type="number"
                                    onChange={(event) => handleOnChange('machineToolWorkholdingMaxToolDiameter', event.target.value)}
                                    value={itemConfiguration.machineToolWorkholdingMaxToolDiameter}
                                />
                            </Grid>
                            <Grid item xs={4} >
                                <Input
                                    label="Max Tool Diameter"
                                    placeholder="Enter"
                                    type="number"
                                    onChange={(event) => handleOnChange('machineToolWorkholdingMinToolDiameter', event.target.value)}
                                    value={itemConfiguration.machineToolWorkholdingMinToolDiameter}
                                />
                            </Grid>
                            <Grid item xs={4} >
                                <Input
                                    label="Max Tool Diameter"
                                    placeholder="Enter"
                                    type="number"
                                    onChange={(event) => handleOnChange('machineToolWorkholdingToolSeatDepth', event.target.value)}
                                    value={itemConfiguration.machineToolWorkholdingToolSeatDepth}
                                />
                            </Grid>
                        </>
                    }
                </>
            }
        </>
    )
}
