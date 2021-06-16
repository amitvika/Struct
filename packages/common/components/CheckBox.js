import React,{  useState }  from 'react';

const Checkbox = (props) => {
  const { onChange, label, checked } = props;
  const [state, setstate] = useState({
    isChecked: checked ? true: false
  });
  
  const toggleCheckboxChange = (event) => {   

    setstate({ isChecked: event.target.checked })

    onChange(label,event.target.checked);
  }
  return (
    <div className="checkbox">
      <label>
        <input
              type="checkbox"
              value={label}
              checked={state.isChecked}
              onChange={toggleCheckboxChange}
              {...props}
          />
        {label}
      </label>
    </div>
  );
  
}



export default Checkbox;