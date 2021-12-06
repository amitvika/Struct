import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import Check from '@mui/icons-material/Check';
import Cancel from '@mui/icons-material/Cancel';
import Headding from '@monostruct/common/components/atoms/Headding';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useHistory } from 'react-router-dom';

export default function TextBoxWithInputField({
  prefix,
  name,
  updateItemOnServer,
  allowEditTitle = true
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const wrapperRef = useRef(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [itemTitle, setItemTitle] = useState(name);

  useEffect(() => {
    setItemTitle(name);
  }, [name]);

  const handleSave = () => {
    setIsEditMode(false);
    updateItemOnServer({ name: itemTitle });
  };
  const handleCancel = () => {
    setIsEditMode(false);
    setItemTitle(name);
  };

  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        handleSave();
      }
    }

    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef]);

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Headding as={'h5'}> {prefix} Name:</Headding>
      <div style={{ marginLeft: 5 }}>
        {!isEditMode ? (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Headding as={'h5'} style={{ fontWeight: 'bold' }}>
              {itemTitle}
            </Headding>
            {!isMobile && allowEditTitle && (
              <Button onClick={() => setIsEditMode(true)}>
                <EditIcon />
              </Button>
            )}
          </div>
        ) : (
          <FormControl
            sx={{ m: 1, width: '25ch' }}
            variant="outlined"
            ref={wrapperRef}
          >
            <OutlinedInput
              id="outlined-adornment-password"
              type="text"
              value={itemTitle}
              onChange={(event) => setItemTitle(event.target.value)}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleSave}
                    edge="end"
                    size="large">
                    <Check />
                  </IconButton>
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleCancel}
                    edge="end"
                    size="large">
                    <Cancel />
                  </IconButton>
                </InputAdornment>
              }
              label="Password"
            />
          </FormControl>
        )}
      </div>
    </div>
  );
}
