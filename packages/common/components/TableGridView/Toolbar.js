import React from 'react';
import { Grid, Paper, Button } from '@mui/material';
import Headding from '../atoms/Headding';
import Filter from './Filter';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material//AddBox';
import Box from '@mui/material/Box';
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
  showHistoryButtonToolbar = true,
  showArchiveButtonToolbar = true,
  ...restProps
}) {
  const [isFilterResetted, setIsFilterResetted] = React.useState(false);
  return (
    <Paper
      style={{
        padding: '10px',
        marginTop: '10px',
        marginBottom: '10px',
        position: 'relative',
        flexDirection: 'column'
      }}
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
          justifyContent: 'center',
          bottom: 0,
          paddingBottom: '10px'
        }}
      >
        <Headding as={'h4'} title={title}></Headding>
      </Box>

      <Box style={{ display: 'flex', justifyContent: 'center' }}>
        <Box style={{ marginLeft: 'auto' }}>
          {showHistoryButtonToolbar && (
            <Tooltip title="View History">
              <IconButton onClick={handleHistoryToggle} size="large">
                <HistoryIcon
                  sx={{
                    fontSize: 30,
                    color: `${
                      isHistoryCheckboxVisible ? '#000000' : 'disabled'
                    }`
                  }}
                />
              </IconButton>
            </Tooltip>
          )}

          {showArchiveButtonToolbar && (
            <Tooltip title="View Archived Items">
              <IconButton onClick={handleViewArchived} size="large">
                <FolderDeleteIcon
                  sx={{
                    fontSize: 30,
                    color: `${isViewArchivedChecked ? '#000000' : 'disabled'}`
                  }}
                />
              </IconButton>
            </Tooltip>
          )}
          {isCustomAddButtonVisible && (
            <Tooltip title="Create New Item">
              <IconButton onClick={handleAddButtonPress} size="large">
                <AddIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
    </Paper>
  );
}
