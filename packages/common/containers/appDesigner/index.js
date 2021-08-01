import React from 'react'
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Input from '../../components/atoms/Input';

export default function AppDesigner() {
  return (
    <Grid container>
      <Grid sm={8}>
      </Grid>
      <Grid sm={4}>
        <Paper>
          <Input label={''}/>
        </Paper>
      </Grid>
    </Grid>
  )
}
