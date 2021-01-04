import React, { useState } from 'react'
import {
  Paper,
  Grid,
  Icon,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core";
import Headding from '../../components/atoms/Headding';
import Select from '../../components/atoms/Select';
import { Link } from 'react-router-dom';

export default function AssemblySequenceNumber({ data, toggleConfigureItemAssembly, selectedItem, deleteAssemblySequence }) {
  const [fasteningMethod, setFasteningMethod] = useState('')

  return (
    <Paper style={{ padding: 20, margin: 10 }}>
      <Grid className="section-padding-left" container spacing={4}>
        <Grid item xs={6} >
          <Headding fontSize={26} bold title={`Assembly Sequence Number #${data.orderNumber}`} />
        </Grid>
        <Grid item xs={6}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Headding title={'Status:'} />
            <Icon style={{ marginLeft: '18px' }} onClick={() => deleteAssemblySequence(data._id)}>cancel</Icon>
            {/* <Icon style={{ marginLeft: '18px' }} >check</Icon> */}
          </div>
        </Grid>
        <Grid item xs={12} >
          <Button
            size="large"
            variant="contained"
            color="primary"
            onClick={() => toggleConfigureItemAssembly(data._id)}>
            Configure Item Assembly
            </Button>
        </Grid>
        {
          data.itemId && Object.keys(data.itemId).length > 0 &&
          (
            <Grid item xs={12} style={{ display: 'flex' }}>
              <Headding title={'Selected Item: '} />
              <Link to={`/items/${data.itemId._id}`}>{data.itemId.name}</Link>
            </Grid>
          )
        }

        <Grid item xs={4}>
          <Headding title={'Fastening Method(s):'} />
        </Grid>
        <Grid item xs={6} >
          <Select
            placeholder="Select"
            options={[
              { label: 'Placement/None', value: 'Placement/None' },
              { label: 'Interference Fit', value: 'Interference Fit' },
              { label: 'Screw', value: 'Screw' },
              { label: 'Nut/Bolt', value: 'Nut/Bolt' },
              { label: 'Snap Fit', value: 'Snap Fit' },
              { label: 'Adhesive Joint', value: 'Adhesive Joint' },
              { label: 'Weld', value: 'Weld' },
              { label: 'Brazing', value: 'Brazing' }
            ]}
            value={fasteningMethod && { label: fasteningMethod, value: fasteningMethod }}
            onChange={data => setFasteningMethod(data.value)}
          />
        </Grid>
        <Grid item xs={2} />
      </Grid>
    </Paper >
  )
}
