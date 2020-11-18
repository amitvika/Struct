import React, { useState, useEffect } from 'react'
import {
  Paper,
  Grid,
  Button
} from "@material-ui/core";
import Headding from '../../components/atoms/Headding';
import Space from '../../components/atoms/Space';
import Select from '../../components/atoms/Select';

import FileUpload from '../../components/FileUpload';
import Input from '../../components/atoms/Input';

export default function VendorDetails() {
  const [identificationNumber, setIdentificationNumber] = useState([]);

  return (
    <Paper elevation={0} className="ItemGeometry--Choose">
      <Grid className="section-padding-left" container spacing={4}>
        <Grid item xs={12} >
          <Headding bold title={'Identification'} />
        </Grid>
        <Grid item xs={12}>
          <FileUpload handleFileUpload={() => console.log('file selected')} label={"Upload Bar Code"} />
        </Grid>
        <Grid item xs={4} >
          <Input
            label="Identification Number #"
            placeholder="Enter"
            type="text"
          />
        </Grid>
        <Grid item xs={4} style={{ textAlign: 'center' }}>
          <Button
            style={{ marginTop: '20px' }}
            variant="contained"
            color="primary"
            type="button"
            onClick={() => setIdentificationNumber(prevNums => [...prevNums, {}])}>
            Add Additional ID
          </Button>
        </Grid>
        <Grid item xs={4}></Grid>
        {
          identificationNumber.map((identityNumber, index) => {
            return (
              <>
                <Grid item xs={4} >
                  <Input
                    label={`Identification Number ${index + 2}`}
                    placeholder="Enter"
                    type="text"
                  />
                </Grid>
                <Grid item xs={8}></Grid>
              </>)
          })
        }

        <Space size={30} />

        <Grid item xs={12} >
          <Headding bold title={'Receipt and Unpacking'} />
        </Grid>

        <Space size={10} />
        
        <Grid item xs={4}>
          <Headding title={'Receipt'} />
        </Grid>
        <Grid item xs={4} >
          <Select
            label="Receipt Method"
            placeholder="Select"
            options={[
              { label: 'Intermodal Container', value: 'Intermodal Container' },
              { label: 'Bulk Dump', value: 'Bulk Dump' },
              { label: 'Mobile Pressure Vessel', value: 'Mobile Pressure Vessel' },
              { label: 'Fluid Tanker', value: 'Fluid Tanker' },
              { label: 'Pallet Delivery', value: 'Pallet Delivery' },
              { label: 'Box Delivery', value: 'Box Delivery' }
            ]}
          />
        </Grid>
        <Grid item xs={4}>
          <Headding title={'Unpacking'} />
        </Grid>
        <Grid item xs={4}>
          
        </Grid>

      </Grid>
    </Paper>
  )
}
