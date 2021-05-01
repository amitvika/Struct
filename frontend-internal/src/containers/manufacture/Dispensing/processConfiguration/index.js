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
 
const [state, setState] = React.useState({
    SpoolBased: false,
    Stacked: false,
    Grid: false,
    GridStacked: false,
    BulkContainer: false,
    LiquidVat: false,
    PressureVessel: false
  });

  const handleChange = (event) => {
    setState({ ...state, [event.target.name]: event.target.checked });
  };

  return (
    <Grid container spacing={1}>

    <FormGroup row>
      <FormControlLabel
        control={
        <Checkbox checked={state.SpoolBased} onChange={handleChange} name="SpoolBased" />}
        label="Spool Based"
      />
       <FormControlLabel
        control={
        <Checkbox checked={state.Stacked} onChange={handleChange} name="Stacked" />}
        label="Stacked"
      />
       <FormControlLabel
        control={
        <Checkbox checked={state.Grid} onChange={handleChange} name="Grid" />}
        label="Grid"
      />
       <FormControlLabel
        control={
        <Checkbox checked={state.GridStacked} onChange={handleChange} name="GridStacked" />}
        label="Grid-Stacked"
      />
       <FormControlLabel
        control={
        <Checkbox checked={state.BulkContainer} onChange={handleChange} name="BulkContainer" />}
        label="Bulk Container"
      />
       <FormControlLabel
        control={
        <Checkbox checked={state.LiquidVat} onChange={handleChange} name="LiquidVat" />}
        label="Liquid Vat"
      />
       <FormControlLabel
        control={
        <Checkbox checked={state.PressureVessel} onChange={handleChange} name="PressureVessel" />}
        label="Pressure Vessel"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={state.checkedB}
            onChange={handleChange}
            name="checkedB"
            color="primary"
          />
        }
        label="Primary"
      />
     
     
    </FormGroup>
    </Grid>

  );
}

