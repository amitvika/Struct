import React, { useState } from 'react'
import Select from '../../../components/atoms/Select';
import Input from '../../../components/atoms/Input';
import Grid from '@material-ui/core/Grid';

export default function MachineTool_Workholding({ itemConfiguration, handleOnChange }) {
  return (
    <>
      <Grid item xs={4} >
        <Select
          label="Used For"
          placeholder="Select"
          options={[
            { label: 'Workpiece', value: 'Workpiece' },
            { label: 'Tool', value: 'Tool' }
          ]}
          onChange={(data) => handleOnChange('machineToolWorkholding', data.value)}
          value={itemConfiguration.machineToolWorkholding && { label: itemConfiguration.machineToolWorkholding }}
        />
      </Grid>
      {
        itemConfiguration.machineToolWorkholding === 'Tool' &&
        <>
          <Grid item xs={4} >
            <Select
              label="For Tool Type"
              placeholder="Select"
              options={[
                { label: 'Static Cutter', value: 'Static Cutter' },
                { label: 'Rotational Tool', value: 'Rotational Tool' },
                { label: 'Dynamic Mold', value: 'Dynamic Mold' }
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
