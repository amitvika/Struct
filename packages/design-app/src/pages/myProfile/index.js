import React, { useState } from 'react';
import {
  Snackbar,
  Button,
  Paper,
  Tab,
  Tabs,
  Grid,
} from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import { useParams, useHistory } from 'react-router-dom';

const MyProfile = ({ gltfjson, setgltfjson }) => {
  // const dispatch = useDispatch();
  const history = useHistory();
  let { id } = useParams();

  const [tabIndex, setTabIndex] = useState('designer');

  const renderPageSwitch = () => {
    switch (tabIndex) {
      case 0:
        return 'Add vendor items here';
      case 'myInfo':
        return 'My Info Tab';
      case 'mmt':
        return 'My Machines and Tools';
      default:
        return 'Undefined Tab Index';
    }
  };
  const handleTabChange = (event, newTabIndex) => {
    if (tabIndex != newTabIndex) {
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
    myInfo: 'My Info',
    mmt: 'My Machines and Tools',
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
        <Grid item sm sm={12}>
          <Paper style={{ padding: 10, margin: 10, display: 'flex' }}>
            <Grid style={{ margin: 'auto' }}>
              <h2>{tabList[tabIndex]} </h2>
            </Grid>
            <Grid style={{ marginLeft: 'auto' }}>
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
        <Grid item sm sm={10}>
          {renderPageSwitch()}
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

export default MyProfile;
