import React, { useState, useRef } from 'react';
import Modal from '@ravibasil/common/components/Modal'
import { Paper, makeStyles, Tabs, Tab, Grid, Snackbar, Button } from '@material-ui/core';
import Templates from './TemplatesTab'
import Styles from './StylesTab'
import './style.css'
import LoginTab from './LoginTab';


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


export default function TemplateModal({ isModalOpened, handleTemplateClick }) {
  const classes = useStyles();
  const [tabIndex, setTabIndex] = useState("Templates");

  const tabList = {
    templates: "Templates", styles: "Styles", login: "Login & Authentication"
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
      case "templates":
        return <Templates />
      case "styles":
        return <Styles />
      case "login":
        return <LoginTab />
      default:
        return "Undefined Tab Index";
    }
  }
  const handleTabChange = (event, newTabIndex) => {
    if (tabIndex != newTabIndex) {
      setTabIndex(newTabIndex);
    }
  }
  return (
    <>

      <Modal
        open={isModalOpened}
        toggleModal={handleTemplateClick}
      >
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
              <Snackbar
                style={{
                  left: '10%'
                }}
                open={true}
              >
                <Button
                  size="large"
                  variant="contained"
                  color="primary"
                >
                  Save
                </Button>
              </Snackbar>
            </Paper>
          </Grid>
          <Grid item sm sm={10}>
            {renderPageSwitch()}
          </Grid>

        </Grid>

      </Modal >
    </>
  );
}




