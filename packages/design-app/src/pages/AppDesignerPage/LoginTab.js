import React, { useContext } from 'react';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { AppDesignerContext } from '../../context/AppDesignerContext';

export default function LoginTab() {

  const [checked, setChecked] = React.useState(false);
  const { setAppDesigner } = useContext(AppDesignerContext)
  const handleChange = (event) => {
    setChecked(event.target.checked);
    console.log(event.target.name)
    setAppDesigner(event.target.name)
  };

  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={checked}
          onChange={handleChange}     
          name="userAccess"
        />
      }
      label="Allow User Access Functionality"
    />
  );
}
