import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import StructLogo from '../assets/images/struct_logo.png';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    margin: '10px 2px 10px 2px',
    maxWidth: 400,
    minWidth: 400,
    cursor: 'pointer',
    transition: '0.3s',
    "&:hover, &:focus": {
      backgroundColor: '#DCDCDC'
    }
  },

  image: {
    width: 55,
    height: 70,
  },
  img: {
    margin: 'auto',
    display: 'block',
    maxWidth: '100%',
    maxHeight: '100%',
  },
}));

export default function ComplexGrid(props) {
  const classes = useStyles();

  return (
    // <div className={classes.root}>
    <Paper className={classes.paper} onClick={props.onClick}>
      <Grid container spacing={2}>
        <Grid item xs={2}>
          <ButtonBase className={classes.image}>
            <img className={classes.img} alt="complex" src={StructLogo} />
          </ButtonBase>
        </Grid>
        <Grid item xs={10}>
          {
            props.children
          }
        </Grid>
      </Grid>
    </Paper>
  );
}
