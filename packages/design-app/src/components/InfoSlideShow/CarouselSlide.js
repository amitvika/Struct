import React from 'react';
import { Box } from '@mui/material';

export default function CarouselSlide(props) {
  const { backgroundColor, title } = props.content;

  return (
    <Box
      sx={{
        backgroundColor,
        borderRadius: 5,
        padding: '75px 50px',
        width: '700px',
        height: '500px',
        boxShadow: '20px 20px 20px black',
        display: 'flex',
        justifyContent: 'center',
        margin: '0 !important'
      }}
    >
      <h1>{title}</h1>
    </Box>
  );
}
