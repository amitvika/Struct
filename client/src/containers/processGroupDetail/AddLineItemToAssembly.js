import React from 'react'
import {
  Paper,
  Grid,
  Icon,
  Button
} from "@material-ui/core";
import Headding from '../../components/atoms/Headding';

export default function AddLineItemToAssembly({ toggleConfigureItemAssembly }) {
  return (
    <Paper style={{ padding: 20, margin: 10 }}>
      <Grid className="section-padding-left" container spacing={4}>
        <Grid item xs={6} >
          <Headding fontSize={26} bold title={'Assembly Sequence Number'} />
        </Grid>
        <Grid item xs={6}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Headding title={'Status:'} />
            <Icon style={{ marginLeft: '18px' }} >cancel</Icon>
            <Icon style={{ marginLeft: '18px' }} >check</Icon>
          </div>
        </Grid>
        <Grid item xs={12} >
          <Button
            size="large"
            variant="contained"
            color="primary"
            onClick={toggleConfigureItemAssembly}>
            Configure Item Assembly
            </Button>
        </Grid>
      </Grid>
    </Paper>
  )
}
