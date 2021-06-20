import React,{  useState }  from 'react';
//import CircleUnchecked from '@material-ui/icons/RadioButtonUnchecked';
//import CircleChecked from '@material-ui/icons/CheckCircleOutline';

import Checkbox from '@material-ui/core/Checkbox';
import Radio from '@material-ui/core/Radio';
import CircleChecked from '@material-ui/icons/CheckCircleOutline';
//import CircleCheckedFilled from '@material-ui/icons/CheckCircle';
import CircleUnchecked from '@material-ui/icons/RadioButtonUnchecked';
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