import React, { useState } from 'react';
import Modal from '@ravibasil/common/components/Modal';
import { Paper, Tabs, Tab, Grid, Divider, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Templates from './TemplatesTab';
import Styles from './StylesTab';
import './style.css';
import LoginTab from './LoginTab';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    marginTop: '10px',
    marginBottom: '10px',
  },
  tabPaper: {
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    cursor: 'pointer',
    transition: '0.3s',
    '&:hover, &:focus': {
      backgroundColor: '#DCDCDC',
    },
  },
  selectedTab: {
    backgroundColor: 'blue',
  },
 modal : {
     maxHeight: '800px !important'
 }
 
}));

export default function TemplateModal({ isModalOpened, handleTemplateClick }) {
  const classes = useStyles();
  const [selectedTab, setSelectedTab] = useState('');

  const tabArray = ['Templates', 'Styles', 'Login & Authentication'];
  const handleTabChange = (tabName) => {
    // setSelectedTab(tabName);
    if (tabName === selectedTab) {
      setSelectedTab('');
    }
    else {
      setSelectedTab(tabName);
    }
  };
  const renderDetailPanel = () => {

    if (selectedTab === 'Templates') {
      return <Templates />
    }
    else if (selectedTab === 'Styles') {
      return <Styles/>
    }
    else if (selectedTab === 'Login & Authentication') {
      return <LoginTab />
    }
  
    else {

      return null

    }

  }



  return (
    <Modal
      // className={classes.modal}
      open={isModalOpened}
      toggleModal={handleTemplateClick}
    >
      <Paper elevation={3} className={classes.paper}>
        <Grid container spacing={1}>
          {tabArray.map((tabName) => (
            <Grid item xs={2} key={tabName}>
              <Paper
                onClick={() => handleTabChange(tabName)}
                style={{
                  backgroundColor: selectedTab === tabName ? '#343a40' : '',
                  color: selectedTab === tabName ? 'white' : '',
                }}
                className={classes.tabPaper}
              >
                {tabName}
              </Paper>
            </Grid>
          ))}
        </Grid>
        <Divider orientation="horizontal" flexItem />
        {renderDetailPanel()}
      </Paper>
  
    
    </Modal>
  );
}
