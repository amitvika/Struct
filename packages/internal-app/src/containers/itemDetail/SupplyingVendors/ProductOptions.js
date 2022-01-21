import React, { useState } from 'react';

import makeStyles from '@mui/styles/makeStyles';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
// import Orders from '../order/index';
import Orders from 'src/pages/VendorDetailPage/order';
import SubHeaderWithArrow from '../../../components/SubHeaderWithArrow';
import { useParams } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1
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
  },
  selectedTab: {
    backgroundColor: 'blue'
  },
  dividerStyle: {
    marginTop: '20px',
    marginBottom: '20px'
  },
  verticalDivider: {
    margin: '5px',
    width: '1px'
  }
}));

export default function ProductOption({ productId, productName }) {
  let { id: vendorId } = useParams();
  const classes = useStyles();

  const [selectedTab, setSelectedTab] = useState('Orders');

  const tabArray = ['Orders'];

  const handleTabChange = (tabName) => {
    setSelectedTab(tabName);
  };

  const renderDetailPanel = () => {
    if (selectedTab === 'Orders') {
      return <Orders />;
    } else {
      return 'not Found Page';
    }
  };

  return (
    <>
      <SubHeaderWithArrow
        action={`/vendors/${vendorId}?tab=1`}
        title={`Configure Product: ${productName}`}
      />

      <Paper elevation={3} className={classes.paper}>
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
      </Paper>
      {renderDetailPanel()}
    </>
  );
}
