import React, { useState } from 'react';
import { Paper, Grid, Icon, Button } from '@mui/material';
import Headding from '@monostruct/common/components/atoms/Headding';

import { Link } from 'react-router-dom';

export default function AssemblySequenceNumber({
  data,
  toggleConfigureItemAssembly,
  deleteAssemblySequence,
}) {
  return (
    <Paper style={{ padding: 20, margin: 10 }}>
      <Grid className="section-padding-left" container spacing={4}>
        <Grid item xs={6}>
          <Headding
            fontSize={26}
            bold
            title={`Assembly Sequence Number #${data.orderNumber}`}
          />
        </Grid>
        <Grid item xs={3}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Headding title={'Status:'} />
            <Icon style={{ marginLeft: '18px' }}>cancel</Icon>
            {/* <Icon style={{ marginLeft: '18px' }} >check</Icon> */}
          </div>
        </Grid>
        <Grid item xs={3}>
          <Button
            size="small"
            variant="contained"
            color="secondary"
            onClick={() => deleteAssemblySequence(data._id)}
          >
            Delete Item in Assembly
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Button
            size="large"
            variant="contained"
            color="primary"
            onClick={() => toggleConfigureItemAssembly(data)}
          >
            Configure Item Assembly
          </Button>
        </Grid>
        {data.itemId && Object.keys(data.itemId).length > 0 && (
          <Grid item xs={12} style={{ display: 'flex' }}>
            <Headding title={'Selected Item: '} />
            <Link target="_blank" to={`/items/${data.itemId._id}`}>
              {data.itemId.name}
            </Link>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
}
