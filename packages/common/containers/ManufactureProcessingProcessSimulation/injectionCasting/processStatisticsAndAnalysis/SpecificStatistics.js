import React from 'react';
import { Paper, Grid } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

import { Headding } from '../../../../components';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    marginTop: 10,
    marginBottom: 10,
  },
}));

export default function SpecificStatistics() {
  const classes = useStyles();

  const [state, setState] = React.useState({
    majorMoldDirection: false,
    partingline: false,
    pusherLocations: false,
  });

  const handleChange = (event) => {
    setState({ ...state, [event.target.name]: event.target.checked });
  };

  return (
    <Paper elevation={3} className={classes.paper}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Headding
            fontSize={20}
            title={'Process + Item Specific Statistics'}
          ></Headding>
        </Grid>

        <Grid item xs={12}>
          <Grid item xs={6}>
            <Headding
              style={{ display: 'flex' }}
              title={`Least Number of Overhangs`}
            ></Headding>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={state.majorMoldDirection}
                    onChange={handleChange}
                    name="majorMoldDirection"
                  />
                }
                label="Show Major Mold Directions"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={state.partingline}
                    onChange={handleChange}
                    name="partingline"
                  />
                }
                label="Show Parting Line(s)"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={state.pusherLocations}
                    onChange={handleChange}
                    name="pusherLocations"
                  />
                }
                label="Show Pusher Locations"
              />
            </FormGroup>
          </Grid>
          <Grid item xs={6}></Grid>
        </Grid>
      </Grid>
    </Paper>
  );
}
