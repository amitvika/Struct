import React from 'react';
import { Grid, Paper, Button } from '@material-ui/core';
import Headding from '../atoms/Headding';
import Filter from './Filter';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@mui/icons-material//AddBox';
import Box from '@material-ui/core/Box';
import HistoryIcon from '@mui/icons-material//History';
import FolderDeleteIcon from '@mui/icons-material//DeleteSweepOutlined';
import Tooltip from '@mui/material/Tooltip';

export default function Toolbar({
  title,
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
  const [isFilterResetted, setIsFilterResetted] = React.useState(false);
  return (
    <Paper
      style={{
        padding: '10px',
        marginTop: '10px',
        marginBottom: '10px',
        position: 'relative'
      }}
      elevation={8}
    >
      <Grid container>
        <Grid item xs style={{ display: 'flex', flexDirection: 'column' }}>
          <Filter {...restProps} {...{ setIsFilterResetted }} />
          {AdditionalFilter !== null && (
            <AdditionalFilter {...restProps} {...{ isFilterResetted }} />
          )}
        </Grid>
      </Grid>
      <Box
        style={{
          position: 'absolute',
          display: 'flex',
          width: '100%',
          justifyContent: 'center'
        }}
      >
        <Headding as={'h4'} title={title}></Headding>
      </Box>

      <Box style={{ display: 'flex', justifyContent: 'center' }}>
        <Box style={{ marginLeft: 'auto' }}>
          <Tooltip title="View History">
            <IconButton onClick={handleHistoryToggle}>
              <HistoryIcon
                sx={{
                  fontSize: 30,
                  color: `${isHistoryCheckboxVisible ? '#000000' : 'disabled'}`
                }}
              />
            </IconButton>
          </Tooltip>
          <Tooltip title="View Archived Items">
            <IconButton onClick={handleViewArchived}>
              <FolderDeleteIcon
                sx={{
                  fontSize: 30,
                  color: `${isViewArchivedChecked ? '#000000' : 'disabled'}`
                }}
              />
            </IconButton>
          </Tooltip>

          {isCustomAddButtonVisible && (
            <Tooltip title="Create New Item">
              <IconButton onClick={handleAddButtonPress}>
                <AddIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
    </Paper>
  );
}
