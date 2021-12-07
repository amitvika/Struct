import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Headding from '@monostruct/common/components/atoms/Headding';
import Input from '@monostruct/common/components/atoms/Input';

export default function AddDesign({ handleSave, name }) {
  const [value, setValue] = useState('');

  const onChange = (e) => {
    setValue(e.target.value);
  };

  useEffect(() => {
    if (name) {
      setValue(name);
    }
  }, [name]);

  return (
    <Paper>
      <Grid container>
        <Grid
          item
          xs={6}
          style={{
            display: 'flex',
            justifyContent: 'space-evenly',
            padding: '10px',
            alignItems: 'center',
          }}
        >
          {/* </Grid>
                <Grid item xs={6} style={{ display: 'flex', justifyContent: 'space-evenly', padding: '10px', alignItems: 'center', }}> */}
          <Headding fontSize={30} title="Design Name" />
          <Input
            placeholder="Enter"
            type="text"
            onChange={onChange}
            value={value}
          />
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => handleSave(value)}
          >
            Save
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
}
