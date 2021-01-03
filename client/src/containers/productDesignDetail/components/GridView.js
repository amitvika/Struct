import React from 'react'
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import GridList from '../../../components/GridList';
import Cardview from '../../../components/Cardview';

export default function GridView({ productDesignList, handleHistoryToggle }) {
  return (
    <GridList>
      {productDesignList.map(product => {
        return (<Cardview>
          <Grid item xs container direction="column" spacing={2}>
            <Grid item xs>
              <Typography gutterBottom variant="subtitle1">
                Name: {product.name}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Client: {product.clientName}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Created By: {product.created_by}
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="body2" style={{ cursor: 'pointer' }} onClick={() => handleHistoryToggle({ rowId: product.id })}>
                View History
                </Typography>
            </Grid>
          </Grid>
        </Cardview>
        )
      })
      }
    </GridList>

  )
}
