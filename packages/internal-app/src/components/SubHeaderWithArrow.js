import React from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Paper, Typography, IconButton } from '@mui/material';
import { useHistory } from 'react-router-dom';

export default function SubHeaderWithArrow({ action, title }) {
  const history = useHistory();

  const handleClick = () => {
    if (action) {
      history.push(action);
    } else {
      history.goBack();
    }
  };
  return (
    <Paper>
      <IconButton color="primary" onClick={handleClick} component="span" size="large">
        <ArrowBackIcon />
      </IconButton>
      <Typography
        style={{
          display: 'flex',
          alignItems: 'center',
          fontSize: '20px'
        }}
      >
        {title}
      </Typography>
    </Paper>
  );
}
