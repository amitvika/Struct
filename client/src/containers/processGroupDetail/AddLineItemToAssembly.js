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

export default function AddLineItemToAssembly({ toggleConfigureItemAssembly, selectedItems }) {
  const [fasteningMethod, setFasteningMethod] = useState('')

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
            {/* <Icon style={{ marginLeft: '18px' }} >check</Icon> */}
          </div>
        </Grid>
        <Grid item xs={4} >
          <Button
            size="large"
            variant="contained"
            color="primary"
            onClick={toggleConfigureItemAssembly}>
            Configure Item Assembly
            </Button>
        </Grid>
        <Grid item xs={8}>
          {
            selectedItems.length > 0 &&
            <>
              <Headding title={'Selected Item: '} />
              <TableContainer component={Paper}>
                <Table aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell>S No</TableCell>
                      <TableCell>Item Name</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedItems.map(itemRow => (
                      <TableRow
                        key={itemRow._id}>
                        <TableCell>{itemRow._id}</TableCell>
                        <TableCell >{itemRow.name}</TableCell>
                        <TableCell><Link to={`/items/${itemRow._id}`}>View</Link></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          }
        </Grid>

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
        <Grid item xs={3} />
      </Grid>
    </Paper >
  )
}
