import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Button } from '@material-ui/core';
import { fade, makeStyles } from '@material-ui/core/styles';
import MenuIcon from '@material-ui/icons/Menu';
import GLTFRenderer from '../../../gltf/GltfRenderer';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  toolbar: {
    background: '#343a40'
  },
  title: {
    flexGrow: 1,
    display: 'none',
    color:'white',
    [
      theme.breakpoints.up('sm')]: {
      display: 'block',
    },
  },
}));


export default function GeometricDimensioning({ gltfjson }) {
  const classes = useStyles();
  
  return (
    <div>
      <Toolbar className={classes.toolbar}>

        <Typography className={classes.title} variant="h6" noWrap>
          Part Geometry
          </Typography>

        <Typography className={classes.title} variant="h6" noWrap>
          Part Assembly
          </Typography>

        <Typography className={classes.title} variant="h6" noWrap>
          GD&T Specifications
          </Typography>

        {/* <Button color="inherit">Login</Button> */}
      </Toolbar>
      {
        Object.keys(gltfjson).length > 0 &&
        <GLTFRenderer gltfjson={gltfjson} activefile={'fileId'} />
      }
    </div>
  )
}
