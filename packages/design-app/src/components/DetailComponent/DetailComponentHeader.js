import React, { useEffect } from 'react';
import { Paper, Typography } from '@mui/material';
import { useStyles } from './DetailComponent.style';
import AddDesignForm from './AddDesignForm';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Tooltip from '@mui/material/Tooltip';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export default function DetailComponentHeader({
  title,
  isAddDesignVisible = true,
  handleSave,
  itemValue,
  setItemValue
}) {
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Paper
      className={classes.paperContainer}
      style={{
        justifyContent: 'unset',
        alignItems: 'center',
        flexDirection: isMobile ? 'column' : 'row'
      }}
    >
      <div
        style={{
          zIndex: 9,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row'
        }}
      >
        {isAddDesignVisible && <AddDesignForm {...{ itemValue, handleSave }} />}
        <DesignTypeSelection
          {...{
            setItemValue,
            itemValue,
            handleSave,
            isMobile
          }}
        />
      </div>

      <div
        style={{
          position: isMobile ? 'relative' : 'absolute',
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

const DesignTypeSelection = ({
  setItemValue,
  itemValue,
  handleSave,
  isMobile
}) => {
  const [value, setValue] = React.useState(itemValue.design_type);

  useEffect(() => {
    setValue(itemValue.design_type);
  }, [itemValue.design_type]);

  const handleChange = (event) => {
    setValue(event.target.value);
    if (itemValue.id) {
      handleSave({ design_type: event.target.value });
    } else {
      setItemValue(event.target.value);
    }
  };

  return (
    <RadioGroup
      row
      aria-label="gender"
      name="row-radio-buttons-group"
      sx={{
        flexWrap: 'nowrap',
        whiteSpace: isMobile ? 'wrap' : 'nowrap'
      }}
      value={value}
      onChange={handleChange}
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
