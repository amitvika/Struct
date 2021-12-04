import React, { useState } from 'react';
import { Button, Link, Paper } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import MainModal from '@monostruct/common/components/Modal';
import Stackability from '../../Stackability';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1
  },
  text: {
    textAlign: 'center',
    fontSize: 'x-large',
    color: '#787676',
    fontWeight: '600'
  },
  gridContainer: {
    margin: '5px'
  },
  innerGrid: {
    maxWidth: '19%',
    textAlign: 'center'
  },
  paper: {
    color: ' #65696c'
  },
  button: {
    color: ' #65696c'
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
    '&:hover, &:focus': {
      backgroundColor: '#DCDCDC'
    }
  }
}));

export default function ManufacturabilityAnalysis(props) {
  const classes = useStyles();
  const { itemProperties, setStack } = props;
  const [isModalOpened, setIsModalOpened] = React.useState(false);
  const [selectedTab, setSelectedTab] = useState('');

  const toggleModal = () => {
    setIsModalOpened(!isModalOpened);
  };

  const handleTabChange = (tabName) => {
    toggleModal();
    setSelectedTab(tabName);
    console.log(tabName);

    if (tabName == 'Stackability') {
      setStack({ item: { ...itemProperties }, ...props });
    }
  };

  const tabArray = [
    'Stackability',
    'Fragility',
    'Size Constraints',
    'Quantity/Time',
    'Physical State'
  ];
  return (
    <>
      <div className={classes.text} elevation={3}>
        Key Factors
      </div>
      <MainModal open={isModalOpened} toggleModal={toggleModal}>
        {selectedTab === 'Stackability' ? <Stackability {...props} /> : null}
      </MainModal>
      <Grid container spacing={1}>
        {tabArray.map((tabName) => (
          <Grid item xs={2}>
            <Paper
              onClick={() => handleTabChange(tabName)}
              style={{
                backgroundColor: selectedTab === tabName ? '#343a40' : '',
                color: selectedTab === tabName ? 'white' : ''
              }}
              className={classes.tabPaper}
            >
              {tabName}
            </Paper>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
