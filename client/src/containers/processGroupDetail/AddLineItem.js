import React, { useState } from 'react'
import {
  Paper,
  Grid,
  Icon,
  Button
} from "@material-ui/core";
import Input from '../../components/atoms/Input';
import Headding from '../../components/atoms/Headding';
import ItemAPI from '../../api/items.api';
import ThreejsViewer from '../3DViewer/ThreejsViewer';

export default function AddLineItem({ processGroupName = '', name = '', addItemToAssembly }) {
  const [itemName, setItemName] = useState(processGroupName);
  const [isEditOn, setIsEditOn] = useState(false);
  const [updatedItemName, setUpdatedItemName] = useState(processGroupName);
  const [itemId, setItemId] = useState()

  const handleSaveLineItem = () => {
    ItemAPI.saveItemAPI({ name: itemName })
      .then(res => {
        console.log('Response', res);

        setItemId(res.data._id);
      })
      .catch(error => {
        console.log('Item save error', error)
      });

    setIsEditOn(false);
    setItemName(updatedItemName)
  }

  const handleClose = () => {
    // setItemName(itemName)
    setIsEditOn(false);
  }

  return (
    <Paper style={{ padding: 10, margin: 10 }}>
      <Grid container>
        <Grid item xs={12} >
          <Headding bold title={'Assembly Item Name'} />
        </Grid>
        <Grid item xs={12} >
          <div style={{ display: 'flex' }}>
            {
              isEditOn ?
                <>
                  <Input
                    // label="Travel Length (mm)"
                    placeholder="Enter"
                    type="text"
                    value={updatedItemName}
                    onChange={event => setUpdatedItemName(event.target.value)}
                  />
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Icon style={{ marginLeft: '18px' }} onClick={handleClose}>cancel</Icon>
                    <Icon style={{ marginLeft: '18px' }} onClick={handleSaveLineItem}>check</Icon>
                  </div>
                </>
                :
                <>
                  <Headding title={itemName} />
                  <Icon style={{ marginLeft: '18px' }} onClick={() => setIsEditOn(true)}>edit</Icon>
                </>
            }
          </div>
        </Grid>
        <Grid item xs={4}>
          <Button
            size="large"
            variant="contained"
            color="primary"
            onClick={() => addItemToAssembly(itemId)}>
            Add Item to Assembly
            </Button>
        </Grid>
        <Grid item xs={4}>
          <ThreejsViewer data={{}}  />
        </Grid>
      </Grid>
    </Paper>
  )
}
