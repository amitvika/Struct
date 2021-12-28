import React from 'react';
import { Paper, Typography } from '@mui/material';
import { useStyles } from './DetailComponent.style';
import AddDesignForm from './AddDesignForm';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Tooltip from '@mui/material/Tooltip';

export default function DetailComponentHeader({
  title,
  isAddDesignVisible = true
}) {
  const classes = useStyles();
  return (
    <Paper
      className={classes.paperContainer}
      style={{ justifyContent: 'unset', alignItems: 'center' }}
    >
      <div style={{ zIndex: 9, display: 'flex' }}>
        {isAddDesignVisible && <AddDesignForm />}
        <DesignTypeSelection />
      </div>
      <div
        style={{
          position: 'absolute',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%'
        }}
      >
        <Typography variant="h4" className={classes.title}>
          {title}
        </Typography>
      </div>
    </Paper>
  );
}

const DesignTypeSelection = () => {
  return (
    <RadioGroup
      row
      aria-label="gender"
      name="row-radio-buttons-group"
      sx={{
        flexWrap: 'nowrap',
        whiteSpace: 'nowrap'
      }}
    >
      <Tooltip
        title="All Private Products are only accessible by the designer/uploader"
        placement="bottom"
      >
        <FormControlLabel
          value="Private Product"
          control={<Radio />}
          label="Private Product"
        />
      </Tooltip>
      <Tooltip
        title="Open sourcing your design allows others to view, modify, and/or export your design"
        placement="bottom"
      >
        <FormControlLabel
          value="Open Source"
          control={<Radio />}
          label="Open Source"
        />
      </Tooltip>
      <Tooltip
        title="This allows your design to be public but others can only export or modify the design at a premium paid to you"
        placement="bottom"
      >
        <FormControlLabel
          value="Available with Fee"
          control={<Radio />}
          label="Available with Fee"
        />
      </Tooltip>
    </RadioGroup>
  );
};
