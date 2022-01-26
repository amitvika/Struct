import React, { useState } from 'react';
import {ColorPicker} from 'material-ui-color';
const ColorPickerState = (props) => {
  const { value, onChange } = props;
  const [colorState, setColorState]= useState(value);
  let prevcolor = value;
 
  console.log("First",colorState);
  return <div style={{width:'80%', zIndex: 2000}}>
    <ColorPicker zindex="tooltip"  
      {...props}        
      value={colorState}
      defaultValue={prevcolor}
      onChange={(color) => { 
        console.log("Changing",color,prevcolor);
        prevcolor = color;
        setColorState(prevcolor);
        onChange(color);
        console.log("Last",colorState,prevcolor,color);
      //currentColor=prevcolor;
        } 
      }
    />
   </div>
};  

export default ColorPickerState;
