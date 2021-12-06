import React from 'react';
import ClipboardText from './ClipboardText';
import TextBoxWithInputField from './TextBoxWithInputField';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Paper, Box, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { Headding } from 'src/components';
import LogoView from './LogoView';
import { useHistory } from 'react-router-dom';

export default function DetailComponentInnerHeader({
  prefix,
  name,
  id,
  handleSave,
  tabName,
  action,
  title,
  allowLogoUpload = false,
  logoUrl,
  handleLogoChange = () => ({}),
  allowEditTitle = false
}) {
  const history = useHistory();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleClick = () => {
    if (action) {
      history.push(action);
    } else {
      history.goBack();
    }
  };

  return (
    <Paper
      style={{
        padding: 10,
        margin: 10,
        paddingTop: 30,
        display: 'flex',
        position: 'relative',
        flexDirection: isMobile ? 'column' : 'row'
      }}
    >
      {/* <IconButton style={{ zIndex: 999 }} color="primary" onClick={handleClick}>
        <ArrowBackIcon />
      </IconButton> */}
      <Box style={{ zIndex: 999 }}>
        <TextBoxWithInputField
          {...{
            prefix,
            name,
            updateItemOnServer: handleSave,
            allowEditTitle
          }}
        />
        <Headding as={'h6'}>
          {prefix} ID: {id} <ClipboardText item_id={id} />
        </Headding>
      </Box>
      {allowLogoUpload && (
        <LogoView {...{ logoUrl, handleLogoChange, name: title }} />
      )}
      <Box
        style={{
          position: isMobile ? 'relative' : 'absolute',
          display: 'flex',
          top: 0,
          justifyContent: 'center',
          width: '100%',
          alignItems: 'center',
          height: '100%',
          flexDirection: 'column'
        }}
      >
        <Headding as={'h5'}>{title}</Headding>
        <Headding as={'h6'}>{tabName}</Headding>
      </Box>
    </Paper>
  );
}
