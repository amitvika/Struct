import React, { useState } from 'react';
import { Snackbar, Button, Paper, Tab, Tabs, Grid } from '@material-ui/core';
import AddBoxIcon from '@material-ui/icons/AddBox';
import EditIcon from '@material-ui/icons/Edit';
// import SubHeaderWithArrow from "@monostruct/internal-app/components/SubHeaderWithArrow";
import { useParams, useHistory } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { useQuery } from '@monostruct/internal-app/src/utils/customHooks';
import './style.css';

import Designer from '../cadDetail/designer'

const CadTab = () => {
  // const dispatch = useDispatch();
  const history = useHistory();
  let { id } = useParams();

  const [tabIndex, setTabIndex] = useState('designer');
  const renderPageSwitch = () => {
    switch (tabIndex) {
      case 0:
        return 'Add vendor items here';
      case 'designer':
        return <Designer />;
      case 'mpps':
        return 'mpps';
      case 'classification':
        return 'classification';
      default:
        return 'Undefined Tab Index';
    }
  };

  const handleTabChange = (event, newTabIndex) => {
    if (tabIndex !== newTabIndex) {
      // setIsLoading(true);
      setTabIndex(newTabIndex);

      // history.push({
      //   pathname: `/items/${id}`,
      //   search: `?tab=${newTabIndex}`,
      // });
    }
    //console.log("IsLoading, inside",isLoading);
  };

  const tabList = {
    designer: 'Designer',
    mpps: 'Manufacture',
    classification: 'Classification',
  };

  const renderTab = () => {
    let tabP = [];
    Object.keys(tabList).forEach((key, index) => {
      tabP.push(
        <Tab
          label={`${index + 1}. ${tabList[key]}`}
          value={key}
          style={{ textAlign: 'left' }}
        />
      );
    });
    return tabP;
  };

  return (
    <>
      <Grid container>
        <Grid item sm={12}>
          {/* <SubHeaderWithArrow
                        action={'/cad'}
                        title={'CAD Details'}
                    /> */}
          <Paper style={{ padding: 10, margin: 10, display: 'flex' }}>
            <Grid>
              {/* <h4>Item Name: {itemProperties.name}</h4> */}
              <Grid style={{ display: 'flex' }}>
                <p>Item ID:{id} </p>
              </Grid>
            </Grid>
            <Grid style={{ margin: 'auto' }}>
              <h4>{tabList[tabIndex]}</h4>
            </Grid>

            <Grid style={{ marginLeft: 'auto' }}>
              <Button>
                <AddBoxIcon />
              </Button>
              <Button>
                <EditIcon />
              </Button>
            </Grid>
          </Paper>
        </Grid>
        <Grid item sm={2}>
          <Paper style={{ margin: 10, marginBottom: '70px' }}>
            <Tabs
              className="MuiTab-wrapper"
              orientation="vertical"
              variant="scrollable"
              value={tabIndex}
              onChange={handleTabChange}
            >
              {renderTab()}
            </Tabs>
          </Paper>
        </Grid>
        <Grid item sm={10}>
          {/* <Paper style={{ margin: 10 }}> */}
          {renderPageSwitch()}
          {/* </Paper> */}
        </Grid>
      </Grid>
      <Snackbar
        style={{
          left: '10%',
        }}
        open={true}
      >
        <Button size="large" variant="contained" color="primary">
          Save
        </Button>
      </Snackbar>
    </>
  );
};

export default CadTab;
