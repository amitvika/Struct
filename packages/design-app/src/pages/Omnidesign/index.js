import React, { useState, useEffect } from 'react';
import {
  Snackbar,
  Button,
  Paper,
  Tab,
  Tabs,
  Grid,
  TextField,
  FormControl,
  IconButton,
} from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
// import SubHeaderWithArrow from "@monostruct/internal-app/src/components/SubHeaderWithArrow";
import { useParams, useHistory } from 'react-router-dom';
import Designer from './Designer';
// import Manufacturing from '@monostruct/internal-app/src/containers/manufacture/index2'

const OmniDesign = ({ gltfjson, setgltfjson }) => {
  // const dispatch = useDispatch();
  const history = useHistory();
  let { id } = useParams();

  const [isEditing, setIsEditing] = useState(false);
  const [updatedValue, setUpdatedValue] = useState('');
  const [tabIndex, setTabIndex] = useState('designer');

  const renderPageSwitch = () => {
    switch (tabIndex) {
      case 0:
        return 'Add vendor items here';
      case 'designer':
        return <Designer gltfjson={gltfjson} setgltfjson={setgltfjson} />;
      case 'manufacture':
      // <Manufacturing
      // itemId={id}
      // fileId={itemProperties.fileId}
      // itemProperties={itemProperties}
      // setItemProperties={setItemProperties}
      // fetchList={ItemAPI.getItemsAPI}
      // setStack={setStack}
      // setOrder={setOrder}
      // gltfjson={gltfjson}
      // isLoading={isLoading}
      // />;
      default:
        return 'Undefined Tab Index';
    }
  };

  const handleEditButtonClick = () => {
    setIsEditing(true);
    console.log('Edit Button is Clciked', isEditing);
  };
  const handleUpdatedValue = (e) => {
    setUpdatedValue(e.target.value);
  };
  const handleSaveButton = (e) => {
    setIsEditing(false);
    setUpdatedValue(e.target.value);
  };

  // const handleOnChange = (name, value) => {
  //   setValue(preValue => ({
  //     ...preValue,
  //     [name]: value
  //   }))
  // }
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
    designer: 'Designer',
    manufacture: 'Manufacture',
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
              {isEditing ? (
                <FormControl>
                  <TextField
                    value={isEditing ? updatedValue : tabList[tabIndex]}
                    defaultValue={tabList[tabIndex]}
                    onChange={handleUpdatedValue}
                    variant="outlined"
                    InputProps={{
                      endAdornment: (
                        <IconButton onClick={handleSaveButton}>
                          <SaveIcon />
                        </IconButton>
                      ),
                    }}
                  />
                </FormControl>
              ) : (
                <h2>{tabList[tabIndex]} </h2>
              )}
            </Grid>
            <Grid style={{ marginLeft: 'auto' }}>
              <Button onClick={handleEditButtonClick}>
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

export default OmniDesign;
