import React, { useState } from 'react'
import Select from '../../components/atoms/Select';
import Input from '../../components/atoms/Input';
import Grid from '@material-ui/core/Grid';
import MaterialTable from "material-table";
import ToolTypeOptions from './ToolTypeOptions';
import MachineTool_Workholding from './MachineTool_Workholding';
import UnassembledKit from './UnassembledKit';

export default function ItemTypeConfigurations({ itemProperties = {}, setItemProperties }) {
  const itemConfiguration = itemProperties.itemTypeConfiguration || {};
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

  // if (!itemProperties.itemGeometry) {
  //   return <div>Please populate fields in Item Properties and Geometry</div>
  // }
  return (
    <Grid className="section-padding-left" container spacing={4}>
      <Grid item xs={12} >
        {/* <Tooltip
          title={`All choices beginning "Machine - " should contain one or more "Machine Actuator" item types within the item's assembly`}
          placement="right-start"> */}
        {/* <Select
          label="Item Type"
          placeholder="Select"
          options={[
            { label: 'Machine - Actuator', value: 'Machine - Actuator' },
            { label: 'Machine - Motion Control', value: 'Machine - Motion Control' },
            { label: 'Machine - Tool/Workholding', value: 'Machine - Tool/Workholding' },
            { label: "Machine - Workpiece Environment Modification", value: "Machine - Workpiece Environment Modification" },
            { label: "Containment - Pressure Vessel", value: "Containment - Pressure Vessel" },
            { label: "Containment - Liquid Container", value: "Containment - Liquid Container" },
            { label: "Tool", value: "Tool" },
            { label: "Machine - Tool", value: "Machine - Tool" },
            { label: "Unassembled Kit", value: "Unassembled Kit" },
            { label: "Other", value: "Other" }
          ]}
          onChange={(data) => handleOnChange('itemType', data.value)}
          value={itemConfiguration.itemType && { label: itemConfiguration.itemType }}
        /> */}
        {/* </Tooltip> */}
      </Grid>
      {
        itemConfiguration.itemType === 'Unassembled Kit' &&
        <UnassembledKit />
      }
      {
        itemConfiguration.itemType === 'Tool' &&
        <ToolTypeOptions
          itemConfiguration={itemConfiguration}
          handleOnChange={handleOnChange} />
      }

      {
        itemConfiguration.itemType === 'Machine - Tool/Workholding' &&
        <MachineTool_Workholding
          itemConfiguration={itemConfiguration}
          handleOnChange={handleOnChange}
        />
      }

      {
        itemConfiguration.itemType && itemConfiguration.itemType.includes('Machine -') &&
        <Grid item xs={12}>
          <MaterialTable
            title={itemConfiguration.itemType}
            columns={columns}
          />
        </Grid>
      }
      {
        itemConfiguration.itemType === "Machine - Actuator" &&
        <Grid item xs={4} >
          <Select
            label="Machine Actuator Type"
            placeholder="Select"
            options={[
              { label: 'Rotational', value: 'Rotational' },
              { label: 'Linear', value: 'Linear' }
            ]}
            onChange={(data) => handleOnChange('machineActuatorType', data.value)}
            value={itemConfiguration.machineActuatorType && { label: itemConfiguration.machineActuatorType }}
          />
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
