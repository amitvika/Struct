import React from 'react';
import { Grid, Paper } from '@material-ui/core';
import Checkbox from '../atoms/Checkbox';
import Headding from '../atoms/Headding';
import Filter from './Filter';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/AddBox';
import Box from '@material-ui/core/Box';

export default function Toolbar({
  title,
  isGridViewSelected,
  setIsGridViewSelected,
  isViewArchivedChecked,
  handleViewArchived,
  isHistoryModalOpened,
  handleHistoryToggle,
  isDeleteCheckboxVisible = true,
  isHistoryCheckboxVisible = true,
  isCustomAddButtonVisible = false,
  handleAddButtonPress = () => {},
  AdditionalFilter = null,
  ...restProps
}) {
  return (
    <Paper style={{ padding: '10px', marginTop: '10px', marginBottom: '10px' }}>
      <Grid container>
        <Grid item xs="auto">
          <Checkbox
            checked={isGridViewSelected}
            size="large"
            label="View GridView"
            onChange={() => setIsGridViewSelected(!isGridViewSelected)}
          />

          {isHistoryCheckboxVisible && (
            <Checkbox
              checked={isHistoryModalOpened}
              label="Show History"
              onChange={handleHistoryToggle}
            />
          )}

          {isDeleteCheckboxVisible && (
            <Checkbox
              checked={isViewArchivedChecked}
              label="View Archived"
              onChange={handleViewArchived}
            />
          )}
        </Grid>
        <Grid item xs style={{ display: 'flex', flexDirection: 'column' }}>
          <Filter {...restProps} />
          {AdditionalFilter !== null && <AdditionalFilter {...restProps} />}
        </Grid>

        {title === 'Items' && (
          <Grid
            item
            xs="auto"
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            <Checkbox label="Unused by Other Items" />
            <Checkbox label="Unused by Clients" />
          </Grid>
        )}
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs>
          <Box textAlign="center" m={1}>
            <Headding as={'h4'} title={title}></Headding>
          </Box>
        </Grid>
        {isCustomAddButtonVisible && (
          <Grid item xs={1}>
            <IconButton
              color="primary"
              aria-label="upload picture"
              component="span"
              onClick={handleAddButtonPress}
            >
              <AddIcon />
            </IconButton>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
}
