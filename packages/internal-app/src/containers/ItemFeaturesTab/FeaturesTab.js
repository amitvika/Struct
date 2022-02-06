import React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';

import ItemFeatureAPI from '@monostruct/common/api/itemsFeature.api';
import Headding from '@monostruct/common/components/atoms/Headding';

export default function ItemFeatureTab({ parsing_details_id, fileName }) {
  const [state, setState] = React.useState({});

  React.useEffect(() => {
    ItemFeatureAPI.getItemFeatureAPI({ parsing_details_id, fileName })
      .then((res) => {
        setState(res.data);
      })
      .catch((error) => {
        console.log('Error:', error);
      });
  }, []);

  if (Object.keys(state).length === 0) {
    return <Box>No Features drafted</Box>;
  }

  return (
    <Box>
      <Headding>Item Features</Headding>
      <Grid container spacing={2}>
        <Grid item xs={2}>
          <Headding>Faces</Headding>
        </Grid>
        <Grid item xs={10}>
          <Headding>{state.faces}</Headding>
        </Grid>

        <Grid item xs={2}>
          <Headding>Edges</Headding>
        </Grid>
        <Grid item xs={10}>
          <Headding>{state.edges}</Headding>
        </Grid>

        <Grid item xs={2}>
          <Headding>Vertices</Headding>
        </Grid>
        <Grid item xs={10}>
          <Headding>{state.vertices}</Headding>
        </Grid>

        <Grid item xs={2}>
          <Headding>Trees</Headding>
        </Grid>
        <Grid item xs={10}>
          <Headding>{state.trees}</Headding>
        </Grid>

        <Grid item xs={2}>
          <Headding>Mass</Headding>
        </Grid>
        <Grid item xs={10}>
          <Headding>{state.mass}</Headding>
        </Grid>
      </Grid>
    </Box>
  );
}
