import React from 'react'
import Select from '../../components/atoms/Select';
import Input from '../../components/atoms/Input';
import Grid from '@material-ui/core/Grid';


export default function EndMillOptions({ itemConfiguration, handleOnChange }) {
  return (
    <>
      <Grid item xs={4} ></Grid>
      <Grid item xs={4} >
        <Input
          label="Input Length (mm)"
          placeholder="Enter"
          type="number"
          onChange={(event) => handleOnChange('endMillInputLength', event.target.value)}
          value={itemConfiguration.endMillInputLength}
        />
      </Grid>
      <Grid item xs={4} >
        <Input
          label="Input Width (mm)"
          placeholder="Enter"
          type="number"
          onChange={(event) => handleOnChange('endMillInputWidth', event.target.value)}
          value={itemConfiguration.endMillInputWidth}
        />
      </Grid>
      <Grid item xs={4} >
        <Input
          label="Input Plunge Depth (mm)"
          placeholder="Enter"
          type="number"
          onChange={(event) => handleOnChange('endMillInputPlungeDepth', event.target.value)}
          value={itemConfiguration.endMillInputLength}
        />
      </Grid>
      <Grid item xs={4} >
        <Input
          label="Input Material"
          placeholder="Enter"
          type="text"
          onChange={(event) => handleOnChange('endMillInputMaterial', event.target.value)}
          value={itemConfiguration.endMillInputMaterial}
        />
      </Grid>
      <Grid item xs={4} >
        <Input
          label="Input Coating"
          placeholder="Enter"
          type="text"
          onChange={(event) => handleOnChange('endMillInputCoating', event.target.value)}
          value={itemConfiguration.endMillInputCoating}
        />
      </Grid>
      <Grid item xs={4} >
        <Input
          label="Input # Flutes"
          placeholder="Enter"
          type="text"
          onChange={(event) => handleOnChange('endMillInputFlutes', event.target.value)}
          value={itemConfiguration.endMillInputFlutes}
        />
      </Grid>
      <Grid item xs={4} >
        <Input
          label="Input SFM"
          placeholder="Enter"
          type="text"
          onChange={(event) => handleOnChange('endMillInputSFM', event.target.value)}
          value={itemConfiguration.endMillInputSFM}
        />
      </Grid>
      <Grid item xs={4} >
        <Input
          label="Input Speed"
          placeholder="Enter"
          type="text"
          onChange={(event) => handleOnChange('endMillInputSpeed', event.target.value)}
          value={itemConfiguration.endMillInputSpeed}
        />
      </Grid>
      <Grid item xs={4} >
        <Input
          label="Input Feeds"
          placeholder="Enter"
          type="text"
          onChange={(event) => handleOnChange('endMillInputFeeds', event.target.value)}
          value={itemConfiguration.endMillInputFeeds}
        />
      </Grid>
      <Grid item xs={4} >
        <Input
          label="Input Tool Life"
          placeholder="Enter"
          type="text"
          onChange={(event) => handleOnChange('endMillInputToolLife', event.target.value)}
          value={itemConfiguration.endMillInputToolLife}
        />
      </Grid>
      <Grid item xs={4} >
        <Select
          label="Operation Types"
          placeholder="Select"
          options={[
            { label: 'Facing (Flat Face)', value: 'Facing (Flat Face)' },
            { label: 'Roughing', value: 'Roughing' }
          ]}
          onChange={(data) => handleOnChange('endMillInputOperationTypes', data.value)}
          value={itemConfiguration.endMillInputOperationTypes && { label: itemConfiguration.endMillInputOperationTypes }}
        />
      </Grid>
    </>
  )
}
