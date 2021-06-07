import React, { useState } from 'react'
import Grid from '@material-ui/core/Grid';
import MaterialTable from "material-table";

import Select from '../../../components/atoms/Select';
import Input from '../../../components/atoms/Input';
import ToolTypeOptions from './ToolTypeOptions';
import MachineTool_Workholding from './MachineTool_Workholding';
import UnassembledKit from './UnassembledKit';
import Switch from '@material-ui/core/Switch';
import { withStyles } from '@material-ui/core/styles';


export default function ItemTypeConfigurations({ itemProperties = {}, setItemProperties, gltfjson, setgltfjson }) {
    const itemConfiguration = itemProperties.itemTypeConfiguration || {};
    const itemGeometry = itemProperties.itemGeometry || {}
    const [columns, setColumns] = useState([
        { title: 'Item ID', field: 'itemID' },
        { title: 'Item Name', field: 'itemName' },
        { title: 'Actuator Type', field: 'actuatorType' },
        {
            title: 'For Axis #',
            field: 'forAxis'
        },
    ]);

    const handleOnChange = (name, value) => {
        setItemProperties(prev => ({
            ...prev,
            itemTypeConfiguration: {
                ...prev.itemTypeConfiguration,
                [name]: value
            }
        }))
    }
    const [state, setState] = React.useState({
        checkedC: true,
    });
    const handleChange = (event) => {
        setState({ ...state, [event.target.name]: event.target.checked });
    };

    // if (!itemProperties.itemGeometry) {
    //   return <div>Please populate fields in Item Properties and Geometry</div>
    // }
    return (
        <Grid className="section-padding-left" container spacing={4}>
            <Grid item xs={12} >
            </Grid>
            {
                itemGeometry.itemType === 'Unassembled Kit' &&
                <UnassembledKit />
            }
            {
                itemGeometry.itemType === 'Tool' &&
                <ToolTypeOptions
                    itemConfiguration={itemConfiguration}
                    handleOnChange={handleOnChange} />
            }

            {
                itemGeometry.itemType === 'Machine - Compound/Tool/Workholding' &&
                <MachineTool_Workholding
                    itemConfiguration={itemConfiguration}
                    handleOnChange={handleOnChange}
                    gltfjson={gltfjson}
                    setgltfjson={setgltfjson}
                />
            }

            {
                itemGeometry.itemType && itemGeometry.itemType.includes('Machine -') &&
                <Grid item xs={12}>
                    <MaterialTable
                        title={itemGeometry.itemType}
                        columns={columns}
                    />
                </Grid>
            }
            {
                itemGeometry.itemType === "Submachine - Actuator" &&
                <Grid item xs={4} >
                    <Grid component="label" container alignItems="center" spacing={1}>
                        <Grid item>Rotational Actuator</Grid>
                        <Switch color="primary" />
                        <Grid item>Linear Actuator</Grid>
                    </Grid>
                    <Grid component="label" container alignItems="center" spacing={1}>
                        <Grid item>Select Stator/Stationary Component(s)</Grid>
                        <Switch color="primary" />
                    </Grid>
                    <Grid component="label" container alignItems="center" spacing={1}>
                        <Grid item>Select Rotor/Mobile Component(s)</Grid>
                        <Switch color="primary" />
                    </Grid>
                    {/* <Select
            label="Machine Actuator Type"
            placeholder="Select"
            options={[
              { label: 'Rotational', value: 'Rotational' },
              { label: 'Linear', value: 'Linear' }
            ]}
            onChange={(data) => handleOnChange('machineActuatorType', data.value)}
            value={itemConfiguration.machineActuatorType && { label: itemConfiguration.machineActuatorType }}
          /> */}
                </Grid>
            }
            {
                itemConfiguration.machineActuatorType === 'Linear' &&
                <>
                    <Grid item xs={4} >
                        <Input
                            label="Travel Length (mm)"
                            placeholder="Enter"
                            type="number"
                            onChange={(event) => handleOnChange('travelLength', event.target.value)}
                            value={itemConfiguration.travelLength}
                        />
                    </Grid>
                    <Grid item xs={4} >
                        <Input
                            label="Resolution (um)"
                            placeholder="Enter"
                            type="number"
                            onChange={(event) => handleOnChange('resolution', event.target.value)}
                            value={itemConfiguration.resolution}
                        />
                    </Grid>

                    <Grid item xs={4} ></Grid>
                    <Grid item xs={4} >
                        <Input
                            label="Repeatability (um)"
                            placeholder="Enter"
                            type="number"
                            onChange={(event) => handleOnChange('repeatability', event.target.value)}
                            value={itemConfiguration.repeatability}
                        />
                    </Grid>
                    <Grid item xs={4} >
                        <Input
                            label="Backlash (um)"
                            placeholder="Enter"
                            type="number"
                            onChange={(event) => handleOnChange('backlash', event.target.value)}
                            value={itemConfiguration.backlash}
                        />
                    </Grid>

                    <Grid item xs={4} ></Grid>
                    <Grid item xs={4} >
                        <Input
                            label="Max Force (N)"
                            placeholder="Enter"
                            type="number"
                            onChange={(event) => handleOnChange('maxForce', event.target.value)}
                            value={itemConfiguration.maxForce}
                        />
                    </Grid>
                </>
            }

            {
                itemConfiguration.machineActuatorType === 'Rotational' &&
                <>
                    <Grid item xs={4} >
                        <Input
                            label="Rotation Limit (radians)"
                            placeholder="Enter"
                            type="number"
                            onChange={(event) => handleOnChange('rotationLimit', event.target.value)}
                            value={itemConfiguration.rotationLimit}
                        />
                    </Grid>
                    <Grid item xs={4} >
                        <Input
                            label="Resolution (arcseconds)"
                            placeholder="Enter"
                            type="number"
                            onChange={(event) => handleOnChange('rotationResolution', event.target.value)}
                            value={itemConfiguration.rotationResolution}
                        />
                    </Grid>

                    <Grid item xs={4} ></Grid>
                    <Grid item xs={4} >
                        <Input
                            label="Repeatability (arcseconds)"
                            placeholder="Enter"
                            type="number"
                            onChange={(event) => handleOnChange('rotationRepeatability', event.target.value)}
                            value={itemConfiguration.rotationRepeatability}
                        />
                    </Grid>
                    <Grid item xs={4} >
                        <Input
                            label="Backlash (arcseconds)"
                            placeholder="Enter"
                            type="number"
                            onChange={(event) => handleOnChange('rotationBacklash', event.target.value)}
                            value={itemConfiguration.rotationBacklash}
                        />
                    </Grid>

                    <Grid item xs={4} ></Grid>
                    <Grid item xs={4} >
                        <Input
                            label="Max Force (Nm)"
                            placeholder="Enter"
                            type="number"
                            onChange={(event) => handleOnChange('rotationMaxForce', event.target.value)}
                            value={itemConfiguration.rotationMaxForce}
                        />
                    </Grid>
                </>
            }

        </Grid>
    )
}
