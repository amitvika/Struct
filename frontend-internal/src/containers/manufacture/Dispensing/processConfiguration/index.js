import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { green } from '@material-ui/core/colors';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import Favorite from '@material-ui/icons/Favorite';
import FavoriteBorder from '@material-ui/icons/FavoriteBorder';
import { Paper, Grid, Button } from '@material-ui/core';
import CollapseTab from './CollapseTab';




const GreenCheckbox = withStyles({
    root: {
      color: green[400],
      '&$checked': {
        color: green[600],
      },
    },
    checked: {},
  })((props) => <Checkbox color="default" {...props} />);
  

export default function ProcessConfiguration() {
  

    // const tabArray = ['Spool Based', 'Stacked', 'Grid', 'Grid-Stacked', 'Bulk Container', 'Liquid Vat',
    // 'Pressure Vessel']   
 
  return (
    <CollapseTab/>

  );
}

