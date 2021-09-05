import React, { useState, useRef } from 'react';
import { Paper, makeStyles, Tabs, Tab, Grid } from '@material-ui/core';
import './style.css'


const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    // height: 224,
  },
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`,
  },
}));


export default function Template() {
  const classes = useStyles();
  const [tabIndex, setTabIndex] = useState("Templates");

  const tabList = {
    store: "Online Store", blog: "Blog", bio: "Biography", buisness: "Business Page", forum: 'Forum'
  }

  const renderTab = () => {
    let tabP = []
    Object.keys(tabList).forEach((key, index) => {
      tabP.push(
        <Tab label={`${index + 1}. ${tabList[key]}`} value={key} style={{ textAlign: 'left' }} />)
    })
    return tabP
  }
  const renderPageSwitch = () => {
    switch (tabIndex) {
      case 0:
        return "Add vendor items here";
      case "store":
        return ""
      case "blog":
        return "style"
      case "bio":
        return "login"
      case "buisness":
        return "login"
      case "forum":
        return "login"
      default:
        return "";
    }
  }
  const handleTabChange = (event, newTabIndex) => {
    if (tabIndex != newTabIndex) {
      setTabIndex(newTabIndex);
    }
  }
  return (
      <Grid container>
        <Grid item sm={2}>
          <Paper style={{ margin: 10, marginBottom: "70px" }}>

            <Tabs
              className='MuiTab-wrapper'
              orientation="vertical"
              variant="scrollable"
              value={tabIndex}
              onChange={handleTabChange}>
              {renderTab()}
            </Tabs>
          </Paper>
        </Grid>
        <Grid item sm sm={10}>
          {renderPageSwitch()}
        </Grid>
      </Grid>
  );
}




