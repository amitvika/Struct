import React from 'react';
import { Paper, Grid } from '@mui/material';

import makeStyles from '@mui/styles/makeStyles';

import { Headding, Input } from '../../../../components';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    marginTop: 10,
    marginBottom: 10,
  },
}));

export default function MoldAnalysis() {
  const classes = useStyles();

  const handleOnChange = () => {};
  return (
    <Paper elevation={3} className={classes.paper}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Headding fontSize={20} title={'Mold Analysis'}></Headding>
        </Grid>
        <Grid item xs={12}>
          <Grid item xs={8}>
            <Grid
              item
              xs={12}
              style={{
                display: 'flex',
                marginTop: '10px',
                marginBottom: '10px',
              }}
            >
              <Grid item xs={6}>
                <Headding
                  as={'span'}
                  fontSize={'16px'}
                  title={'Total Number of Mold Parts'}
                />
              </Grid>
              <Grid item xs={6}>
                <Input
                  placeholder="Enter"
                  type="number"
                  onChange={(event) =>
                    handleOnChange('mass', event.target.value)
                  }
                />
              </Grid>
            </Grid>

            <Grid
              item
              xs={12}
              style={{
                display: 'flex',
                marginTop: '10px',
                marginBottom: '10px',
              }}
            >
              <Grid item xs={6}>
                <Headding
                  as={'span'}
                  fontSize={'16px'}
                  title={'Max Units Possible per Mold Assembly'}
                />
              </Grid>
              <Grid item xs={6}>
                <Input
                  placeholder="Enter"
                  type="number"
                  onChange={(event) =>
                    handleOnChange('mass', event.target.value)
                  }
                />
              </Grid>
            </Grid>

            <Grid
              item
              xs={12}
              style={{
                display: 'flex',
                marginTop: '10px',
                marginBottom: '10px',
              }}
            >
              <Grid item xs={6}>
                <Headding
                  as={'span'}
                  fontSize={'16px'}
                  title={'Fixed Mold Parts'}
                />
              </Grid>
              <Grid item xs={6}>
                <Input
                  placeholder="Enter"
                  type="number"
                  onChange={(event) =>
                    handleOnChange('mass', event.target.value)
                  }
                />
              </Grid>
            </Grid>

            <Grid
              item
              xs={12}
              style={{
                display: 'flex',
                marginTop: '10px',
                marginBottom: '10px',
              }}
            >
              <Grid item xs={6}>
                <Headding
                  as={'span'}
                  fontSize={'16px'}
                  title={'Linear Motion Mold Parts'}
                />
              </Grid>
              <Grid item xs={6}>
                <Input
                  placeholder="Enter"
                  type="number"
                  onChange={(event) =>
                    handleOnChange('mass', event.target.value)
                  }
                />
              </Grid>
            </Grid>

            <Grid
              item
              xs={12}
              style={{
                display: 'flex',
                marginTop: '10px',
                marginBottom: '10px',
              }}
            >
              <Grid item xs={6}>
                <Headding
                  as={'span'}
                  fontSize={'16px'}
                  title={'Rotary Motion Mold Parts'}
                />
              </Grid>
              <Grid item xs={6}>
                <Input
                  placeholder="Enter"
                  type="number"
                  onChange={(event) =>
                    handleOnChange('mass', event.target.value)
                  }
                />
              </Grid>
            </Grid>

            <Grid
              item
              xs={12}
              style={{
                display: 'flex',
                marginTop: '10px',
                marginBottom: '10px',
              }}
            >
              <Grid item xs={6}>
                <Headding
                  as={'span'}
                  fontSize={'16px'}
                  title={'Multi Actuator Combination Mold Parts'}
                />
              </Grid>
              <Grid item xs={6}>
                <Input
                  placeholder="Enter"
                  type="number"
                  onChange={(event) =>
                    handleOnChange('mass', event.target.value)
                  }
                />
              </Grid>
            </Grid>
            <Grid
              item
              xs={12}
              style={{
                display: 'flex',
                marginTop: '10px',
                marginBottom: '10px',
              }}
            >
              <Grid item xs={6}>
                <Headding
                  as={'span'}
                  fontSize={'16px'}
                  title={'Required Clamping Force'}
                />
              </Grid>
              <Grid item xs={6}>
                <Input
                  placeholder="Enter"
                  type="number"
                  onChange={(event) =>
                    handleOnChange('mass', event.target.value)
                  }
                />
              </Grid>
            </Grid>
            <Grid
              item
              xs={12}
              style={{
                display: 'flex',
                marginTop: '10px',
                marginBottom: '10px',
              }}
            >
              <Grid item xs={6}>
                <Headding
                  as={'span'}
                  fontSize={'16px'}
                  title={'Injection Time'}
                />
              </Grid>
              <Grid item xs={6}>
                <Input
                  placeholder="Enter"
                  type="number"
                  onChange={(event) =>
                    handleOnChange('mass', event.target.value)
                  }
                />
              </Grid>
            </Grid>

            <Grid
              item
              xs={12}
              style={{
                display: 'flex',
                marginTop: '10px',
                marginBottom: '10px',
              }}
            >
              <Grid item xs={6}>
                <Headding
                  as={'span'}
                  fontSize={'16px'}
                  title={'Cooling Time'}
                />
              </Grid>
              <Grid item xs={6}>
                <Input
                  placeholder="Enter"
                  type="number"
                  onChange={(event) =>
                    handleOnChange('mass', event.target.value)
                  }
                />
              </Grid>
            </Grid>

            <Grid
              item
              xs={12}
              style={{
                display: 'flex',
                marginTop: '10px',
                marginBottom: '10px',
              }}
            >
              <Grid item xs={6}>
                <Headding
                  as={'span'}
                  fontSize={'16px'}
                  title={'Post Opening Part Handling Methods'}
                />
              </Grid>
              <Grid item xs={6}>
                <Input
                  placeholder="Enter"
                  type="number"
                  onChange={(event) =>
                    handleOnChange('mass', event.target.value)
                  }
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={4}></Grid>
        </Grid>
      </Grid>
    </Paper>
  );
}
