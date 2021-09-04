import React, { useState } from 'react'
import Input from '@ravibasil/common/components/atoms/Input';
import { Grid, Button, makeStyles, Paper } from "@material-ui/core";
import TemplateModal from './TemplateModal';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import UserAccess from './userAccess';
import { AppDesignerContextProvider } from '../../context/AppDesignerContext';


const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    justifyContent: 'space-evenly'
  }
}));

export default function AppDesigner() {
  const classes = useStyles();
  const [isModalOpened, setIsModalOpened] = useState(false)
  const handleTemplateClick = () => {
    setIsModalOpened(!isModalOpened)
  }
  const [state, setState] = React.useState({
    checkedA: true,
    checkedB: true,
  });

  const handleChange = (event) => {
    setState({ ...state, [event.target.name]: event.target.checked });
  };


  return (
    <AppDesignerContextProvider>
      {isModalOpened &&
        <TemplateModal
          isModalOpened={isModalOpened}
          handleTemplateClick={handleTemplateClick} />}
      <Grid container className={classes.container}>
        <Grid item xs={5}>
          <UserAccess />
        </Grid>
        <Grid item xs={4}>
          <FormControlLabel
            control={
              <Switch
                checked={state.checkedB}
                onChange={handleChange}
                name="checkedB"
                color="primary"
              />
            }
            label="Web view"
          />
           <FormControlLabel
            control={
              <Switch
                checked={state.checkedB}
                onChange={handleChange}
                name="checkedB"
                color="primary"
              />
            }
            label="Mobile view"
          />
        </Grid>
        <Grid item xs={3} className={classes.container}>
          <Grid>
            <Button variant="contained" color="primary" onClick={handleTemplateClick}>
              Templates, Style and Options
            </Button>
          </Grid>
          <Grid>
            <Button variant="contained" color="primary">
              Database Options
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </AppDesignerContextProvider>
  )
}
