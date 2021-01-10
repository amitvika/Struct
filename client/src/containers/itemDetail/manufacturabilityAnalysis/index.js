import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-auto-tabpanel-${index}`}
      aria-labelledby={`scrollable-auto-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `scrollable-auto-tab-${index}`,
    'aria-controls': `scrollable-auto-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
}));

export default function ManufacturingAnalysis() {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div className={classes.root}>
      <AppBar position="static" color="default">
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          aria-label="scrollable auto tabs example"
        >
          <Tab label="Machining" {...a11yProps(0)} />
          <Tab label="Injection Casting" {...a11yProps(1)} />
          <Tab label="Assembly" {...a11yProps(2)} />
          <Tab label="Photolithography" {...a11yProps(3)} />
          <Tab label="Unpacking" {...a11yProps(4)} />
          <Tab label="PCB Assembly" {...a11yProps(5)} />
          <Tab label="3D Printing" {...a11yProps(6)} />
          <Tab label="Forming" {...a11yProps(6)} />
          <Tab label="Textile Assembly" {...a11yProps(6)} />
          <Tab label="Powder Stamping and Sintering" {...a11yProps(6)} />
          <Tab label="Coatings" {...a11yProps(6)} />
          <Tab label="Temperature and Gas Treatments" {...a11yProps(6)} />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0}>
        Machining
      </TabPanel>
      <TabPanel value={value} index={1}>
        Injection Casting
      </TabPanel>
      <TabPanel value={value} index={2}>
        Assembly
      </TabPanel>
      <TabPanel value={value} index={3}>
        Photolithography
      </TabPanel>
      <TabPanel value={value} index={4}>
        Unpacking
      </TabPanel>
      <TabPanel value={value} index={5}>
        PCB Assembly
      </TabPanel>
      <TabPanel value={value} index={6}>
        3D Printing
      </TabPanel>
      <TabPanel value={value} index={7}>
        Forming
      </TabPanel>
      <TabPanel value={value} index={8}>
        Textile Assembly
      </TabPanel>
      <TabPanel value={value} index={9}>
        Powder Stamping and Sintering
      </TabPanel>
      <TabPanel value={value} index={10}>
        Coatings
      </TabPanel>
      <TabPanel value={value} index={11}>
        Temperature and Gas Treatments
      </TabPanel>
    </div>
  );
}
