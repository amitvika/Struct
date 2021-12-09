import React, { useState } from 'react';
import { Slider } from '@mui/material';
const SliderState = (props) => {
  const { value, onChange, step, min, max, disabled } = props;
  const [sliderState, setSliderState]= useState(value);
  let prevslider = value;
 
  console.log("First slider",sliderState);
  return <div style={{width:'80%', height:'120%', top:'-20%'}}>
    <Slider zindex="tooltip" style={{width:'80%'}}
      {...props}
      valueLabelDisplay={'auto'}
      value={sliderState}      
      onChange={(event,slider) => { 
        //console.log("Changing slider",slider,prevslider);
        prevslider = slider;
        setSliderState(prevslider);
        onChange(prevslider);
        //console.log("Last slider",sliderState,prevslider,slider);
      //currentColor=prevcolor;
        } 
      }
      disabled={disabled}
      step={step}     
      min={min}
      max={max}   
      
    /></div>
};  

export default SliderState;
