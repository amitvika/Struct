import React,{  useState }  from 'react';
//import CircleUnchecked from '@mui/icons-material/RadioButtonUnchecked';
//import CircleChecked from '@mui/icons-material/CheckCircleOutline';

import Checkbox from '@mui/material/Checkbox';
import Radio from '@mui/material/Radio';
import CircleChecked from '@mui/icons-material/CheckCircleOutline';
//import CircleCheckedFilled from '@mui/icons-material/CheckCircle';
import CircleUnchecked from '@mui/icons-material/RadioButtonUnchecked';
const LabelledCheckBox = (props) => {
  const { onChange, label, checked } = props;
  const [state, setstate] = useState({
    isChecked: checked ? true: false
  });
  
  const toggleCheckboxChange = (event) => {   

    setstate({ isChecked: event.target.checked })

    onChange(label,event.target.checked);
  }
  return (
    <span>
      <label>
        <Checkbox              
              value={label}
              checked={state.isChecked}
              checkedIcon = {<CircleChecked/>}
              icon = {<CircleUnchecked/>}
              onChange={toggleCheckboxChange}
              {...props}
          />
        {label}
      </label>
    </span>
  );
  
}



export default LabelledCheckBox;