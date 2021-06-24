import React, { useState } from 'react'
import Select from '@ravibasil/common/components/atoms/Select';
import Input from '@ravibasil/common/components/atoms/Input';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Headding from '@ravibasil/common/components/atoms/Headding'
// import Viewer from '../geometricDimensioning/Viewer'
import Viewer from 'src/components/Viewer';

export default function MachineTool_Workholding({ itemConfiguration, handleOnChange, gltfjson, setgltfjson }) {
    return (
        <Paper style={{ padding: 20, margin: 10 }}>
            <Headding fontSize={20} bold>Machine - Compound/Tool/Workholding</Headding>
            <Paper style={{ padding: 20, margin: 10 }}>
                <Grid className="section-padding-left" container  spacing={4}>
                    <Grid item xs={4}>
                        <Headding bold>Type</Headding>
                    </Grid>
                    <Grid item xs={8}>
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
                    {
                        itemConfiguration.machineToolWorkholding === 'Workholding' &&
                        <>
                            <Grid item xs={4}>
                                <Headding bold>Sub-Type</Headding>
                            </Grid>
                            <Grid item xs={8}>
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
                                    onChange={(data) => handleOnChange('machineToolWorkholdingType',data.value)}
                                    value={itemConfiguration.machineToolWorkholdingType}

                                />
                            </Grid>
                        </>
                    }
                </Grid>
            </Paper>

            <Grid item xs={12}>
                <Headding style={{ marginLeft: 'inherit', marginTop: '30px' }}>Custom Selections</Headding>
            </Grid>
            <Grid item xs={12} >
                <Viewer
                    gltfjson={gltfjson}
                    setgltfjson={setgltfjson}
                />
            </Grid>

            <Grid className="section-padding-left" container>
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
            </Grid>
        </Paper >
    )
}
