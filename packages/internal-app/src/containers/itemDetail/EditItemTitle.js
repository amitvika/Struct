import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import IconButton from '@material-ui/core/IconButton';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import Check from '@material-ui/icons/Check';
import Cancel from '@material-ui/icons/Cancel';
import Headding from '@monostruct/common/components/atoms/Headding';

export default function EditItemTitle({ itemProperties, updateItemOnServer }) {
  const wrapperRef = useRef(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [itemTitle, setItemTitle] = useState(itemProperties.name);

  useEffect(() => {
    setItemTitle(itemProperties.name);
  }, [itemProperties.name]);

  const handleSave = () => {
    setIsEditMode(false);
    updateItemOnServer({ name: itemTitle });
  };
  const handleCancel = () => {
    setIsEditMode(false);
    setItemTitle(itemProperties.name);
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
    <div style={{ display: 'flex' }}>
      <Headding as={'h4'}> Item Name:</Headding>
      <div style={{ marginLeft: 20 }}>
        {!isEditMode ? (
          <div style={{ display: 'flex' }}>
            <Headding as={'h4'} style={{ fontWeight: 'bold' }}>
              {itemTitle}
            </Headding>
            <Button onClick={() => setIsEditMode(true)}>
              <EditIcon />
            </Button>
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
                  >
                    <Check />
                  </IconButton>
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleCancel}
                    edge="end"
                  >
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
