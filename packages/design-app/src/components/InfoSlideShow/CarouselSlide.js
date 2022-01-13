import React from 'react';
import { Card, makeStyles } from '@material-ui/core';

export default function CarouselSlide(props) {
  const { backgroundColor, title } = props.content;

  const useStyles = makeStyles(() => ({
    card: {
      backgroundColor,
      borderRadius: 5,
      padding: '75px 50px',
      width: '700px',
      height: '500px',
      boxShadow: '20px 20px 20px black',
      display: 'flex',
      justifyContent: 'center',
      margin: '0 !important'
    }
  }));

  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <h1>{title}</h1>
    </Card>
  );
}
