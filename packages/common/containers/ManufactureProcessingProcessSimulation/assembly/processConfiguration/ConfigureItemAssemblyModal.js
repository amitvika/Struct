import React, { useState } from 'react';
import { Button, Grid, Radio } from '@mui/material';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';

import {
  Headding,
  // ThreejsViewer,
  Space,
  Select
} from '../../../../components';
import { Link } from 'react-router-dom';
import MainModal from '../../../../components/Modal';

export default function ConfigureItemAssembly({
  toggleConfigureItemAssembly,
  isConfigureItemAssemblyModalOpen,
  toggleItemSelection,
  selectedAssemblySequence,
  handleUpdateAssemblySequence
}) {
  const [threejsObject, setThreejsObject] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [fasteningMethod, setFasteningMethod] = useState([]);
  const [value, setValue] = useState(' ');

  const handleChange = (event) => {
    //console.log(event.target.value, value)
    if (event.target.value === value) {
      setValue('');
    } else {
      setValue(event.target.value);
    }
  };
  return (
    <MainModal
      open={isConfigureItemAssemblyModalOpen}
      toggleModal={toggleConfigureItemAssembly}
      style={{ width: '70%' }}
      title={'Configure Item Assembly'}
    >
      <Grid className="section-padding-left" container spacing={2}>
        <Grid item xs={8}>
          {/* <ThreejsViewer data={threejsObject} isLoading={isLoading} /> */}
        </Grid>

        <Grid item xs={4}>
          <Grid item xs={12}>
            <Button
              size="large"
              variant="contained"
              color="primary"
              onClick={toggleItemSelection}
            >
              Select Item
            </Button>
          </Grid>
          <Space size={20} />

          <Grid item xs={12}>
            {selectedAssemblySequence?.itemId && (
              <Grid item xs={12} style={{ display: 'flex' }}>
                <Headding title={'Selected Item: '} />
                <div>&nbsp;&nbsp;&nbsp;</div>
                <Link
                  target="_blank"
                  to={`/items/${selectedAssemblySequence?.itemId?._id}`}
                >
                  {selectedAssemblySequence?.itemId?.name}
                </Link>
              </Grid>
            )}
          </Grid>

          <Space size={20} />
          <Grid item xs={12}>
            <Select
              label={'Fastening Method(s):'}
              placeholder="Select"
              isMulti
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
              value={selectedAssemblySequence?.fasteningMethods || []}
              onChange={(data) =>
                handleUpdateAssemblySequence({ fasteningMethods: data })
              }
            />
          </Grid>
          <Space size={20} />
          <Grid item xs={12} style={{ display: 'flex' }}>
            <RadioGroup value={value}>
              {selectedAssemblySequence?.fasteningMethods &&
                selectedAssemblySequence?.fasteningMethods.map((fs) => {
                  return (
                    <FormControlLabel
                      value={fs}
                      control={<Radio onClick={handleChange} />}
                      label={fs}
                    />
                  );
                })}
            </RadioGroup>
          </Grid>
        </Grid>
      </Grid>
    </MainModal>
  );
}
