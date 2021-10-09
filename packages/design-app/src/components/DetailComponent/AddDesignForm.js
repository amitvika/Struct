import React, { useState, useEffect } from 'react';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Headding from '@monostruct/common/components/atoms/Headding';
import Input from '@monostruct/common/components/atoms/Input';
import EditIcon from '@material-ui//icons/Edit';
import SaveIcon from '@material-ui//icons/Save';

import { IconButton,Typography } from '@material-ui/core';

export default function AddDesign({ handleSave, name }) {
  const [value, setValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const onChange = (e) => {
    setValue(e.target.value);
  };

  useEffect(() => {
    if (name) {
      setValue(name);
    }
  }, [name]);
  const handleTitleClick = () => {
    setIsEditing(true);
  };
  const handleSaveTitle = () => {
    setValue(value);
    setIsEditing(false);
  };

  return (
   
      <Grid container>
        <Grid
          item
          xs={6}
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            padding: '10px',
            alignItems: 'center',
          }}
        >
          {!isEditing ? (
            <div onClick={handleTitleClick} style={{ display: 'flex' }}>
              <Headding
                fontSize={30}
                title={value}
                // title="helo"
                onClick={handleTitleClick}
                style={{ cursor: 'pointer', margin: 'auto' }}
              />
              <IconButton>
                <EditIcon />
              </IconButton>
            </div>
          ) : (
            <>
              <Input
                placeholder="Enter"
                type="text"
                onChange={onChange}
                value={value}
              />
              <IconButton onClick={handleSaveTitle}>
                <SaveIcon />
              </IconButton>
            </>
          )}
          {/* <Button
            variant="contained"
            color="primary"
            size="large"
            // onClick={() => handleSave(value)}
          >
            Save
          </Button> */}
        </Grid>
      </Grid>
  );
}
