import React, { useState, useEffect } from 'react';
import MaterialTable, { MTableToolbar } from "material-table";
import { Grid, Paper, Tab, Tabs } from "@material-ui/core";
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Clients from './Clients';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    marginTop: '10px',
    marginBottom: '10px'
  },
  tabPaper: {
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    cursor: 'pointer',
    transition: '0.3s',
    "&:hover, &:focus": {
      backgroundColor: '#DCDCDC'
    }
  },
}));

export default function CurrentUsage() {
  const classes = useStyles();

  const [selectedTab, setSelectedTab] = useState("");

  const tabArray = ['Items Using This Item', 'Items Used By This Item', 'Items Created By This Item',
    'Clients Using/Buying This Item Directly', 'Clients Using/Buying This Item Indirectly']

  const handleTabChange = (tabName) => {
    setSelectedTab(tabName);
  }

  const renderContent = () => {
    switch (selectedTab) {
      case 'Clients Using/Buying This Item Directly':
        return <Clients />;
      default:
        return <></>
    }
  }

  return (
    <div>
      <Grid container spacing={1}>
        {
          tabArray.map(tabName =>
          (
            <Grid item xs={2.5}>
              <Paper onClick={() => handleTabChange(tabName)}
                style={{
                  backgroundColor: selectedTab === tabName ? "#343a40" : "",
                  color: selectedTab === tabName ? "white" : ""
                }}
                className={classes.tabPaper}>{tabName}</Paper>

            </Grid>
          )
          )
        }
      </Grid>

      {renderContent()}


    </div>
  )
}
