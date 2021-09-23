import React, { useState, useEffect } from 'react';
import { Paper, Grid, Icon, Button } from '@material-ui/core';
import {
  Input,
  Headding,
  //   ThreejsViewer
} from '@monostruct/common/components';
import ItemAPI from '@monostruct/common/api/items.api';

export default function AddLineItem({
  processGroupName = '',
  name = '',
  addItemToAssembly,
  assemblyProcessData,
}) {
  const [item, setItem] = useState({});
  const [isEditOn, setIsEditOn] = useState(false);
  const [updatedItemName, setUpdatedItemName] = useState('');

  useEffect(() => {
    if (assemblyProcessData.itemId) {
      setItem(assemblyProcessData.itemId);
      setUpdatedItemName(assemblyProcessData?.itemId?.name);
    }

    return () => {};
  }, [assemblyProcessData]);

  const handleUpdatedItem = () => {
    ItemAPI.updateItemAPI(item._id, { name: updatedItemName })
      .then((res) => {
        if (res.data) {
          setItem(res.data);
        }
      })
      .catch((error) => {
        console.log('Item save error', error);
      });

    setIsEditOn(false);
  };

  const handleClose = () => {
    // setItemName(itemName)
    setIsEditOn(false);
  };

  return (
    <Paper style={{ padding: 10, margin: 10 }}>
      <Grid container>
        <Grid item xs={12}>
          <Headding fontSize={26} bold title={'Assembly Item Name'} />
        </Grid>
        <Grid item xs={12}>
          <div style={{ display: 'flex' }}>
            {isEditOn ? (
              <>
                <Input
                  // label="Travel Length (mm)"
                  placeholder="Enter"
                  type="text"
                  value={updatedItemName}
                  onChange={(event) => setUpdatedItemName(event.target.value)}
                />
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Icon style={{ marginLeft: '18px' }} onClick={handleClose}>
                    cancel
                  </Icon>
                  <Icon
                    style={{ marginLeft: '18px' }}
                    onClick={handleUpdatedItem}
                  >
                    check
                  </Icon>
                </div>
              </>
            ) : (
              <>
                <Headding title={item.name} />
                <Icon
                  style={{ marginLeft: '18px' }}
                  onClick={() => setIsEditOn(true)}
                >
                  edit
                </Icon>
              </>
            )}
          </div>
        </Grid>

        <Grid item xs={4}>
          {/* <ThreejsViewer data={{}} /> */}
        </Grid>
      </Grid>
    </Paper>
  );
}
