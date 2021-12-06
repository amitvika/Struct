import React from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@mui/styles/makeStyles';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Assembly from './assembly';
import Machining from './machining';
import InjectionCasting from './injectionCasting';
import './style.css';

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
  value: PropTypes.any.isRequired
};

function a11yProps(index) {
  return {
    id: `scrollable-auto-tab-${index}`,
    'aria-controls': `scrollable-auto-tabpanel-${index}`
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    width: '100%',
    backgroundColor: theme.palette.background.paper
  },
  ProcessTabs: {
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))',
    justifyItems: 'center',
    display: 'grid'
  }
}));

export default function Manufacturing(props) {
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
          classes={classes.ProcessTabs}
        >
          <Tab label="Manufacturability Analysis" {...a11yProps(0)} />
          <Tab label="Process" {...a11yProps(1)} />
          <Tab label="Machining" {...a11yProps(2)} />
          <Tab label="Injection Casting" {...a11yProps(3)} />
          <Tab label="Assembly" {...a11yProps(4)} />
          <Tab label="Photolithography" {...a11yProps(5)} />

          <Tab label="Unpacking" {...a11yProps(6)} />
          <Tab label="PCB Assembly" {...a11yProps(7)} />
          <Tab label="Extrusion" {...a11yProps(8)} />

          <Tab label="3D Printing" {...a11yProps(9)} />
          <Tab label="Forming" {...a11yProps(10)} />
          <Tab label="Textile Assembly" {...a11yProps(11)} />
          <Tab label="Powder Stamping and Sintering" {...a11yProps(12)} />
          <Tab label="Coatings" {...a11yProps(13)} />
          <Tab label="Temperature and Gas Treatments" {...a11yProps(14)} />
          <Tab label="Photochemical Machining" {...a11yProps(15)} />
        </Tabs>
      </AppBar>

      <TabPanel value={value} index={0}>
        Manufacturability Analysis
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Assembly {...props} />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <Machining />
      </TabPanel>
      <TabPanel value={value} index={3}>
        <InjectionCasting />
      </TabPanel>
      <TabPanel value={value} index={4}>
        Assembly
      </TabPanel>
      <TabPanel value={value} index={5}>
        Photolithography
      </TabPanel>
      <TabPanel value={value} index={6}>
        Unpacking
      </TabPanel>
      <TabPanel value={value} index={7}>
        PCB Assembly
      </TabPanel>
      <TabPanel value={value} index={8}>
        Extrusion
      </TabPanel>
      <TabPanel value={value} index={9}>
        3D Printing
      </TabPanel>
      <TabPanel value={value} index={10}>
        Forming
      </TabPanel>
      <TabPanel value={value} index={11}>
        Textile Assembly
      </TabPanel>
      <TabPanel value={value} index={12}>
        Powder Stamping and Sintering
      </TabPanel>
      <TabPanel value={value} index={13}>
        Coatings
      </TabPanel>
      <TabPanel value={value} index={14}>
        Temperature and Gas Treatments
      </TabPanel>
      <TabPanel value={value} index={15}>
        Photochemical Machining
      </TabPanel>
    </div>
  );
}
