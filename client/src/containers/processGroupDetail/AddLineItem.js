import React, { useState } from 'react'
import {
  Paper,
  Grid,
  Icon,
  Button
} from "@material-ui/core";
import Input from '../../components/atoms/Input';
import Headding from '../../components/atoms/Headding';

export default function AddLineItem({ processGroupName = '', name = '', addItemToAssembly }) {
  const [itemName, setItemName] = useState(processGroupName);
  const [isEditOn, setIsEditOn] = useState(false);
  const [updatedItemName, setUpdatedItemName] = useState(processGroupName);

  const handleSaveLineItem = () => {
    setIsEditOn();
    setItemName(updatedItemName)

  }

  const handleClose = () => {
    // setItemName(itemName)
  }

  return (
    <Paper style={{ padding: 10, margin: 10 }}>
      <Grid container>
        <Grid item xs={4} >
          <Headding bold title={'Assembly Item Name'} />
        </Grid>
        <Grid item xs={8} >
          <div style={{ display: 'flex' }}>
            {
              isEditOn ?
                <>
                  <Input
                    // label="Travel Length (mm)"
                    placeholder="Enter"
                    type="text"
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
            onClick={addItemToAssembly}>
            Add Item to Assembly
            </Button>
        </Grid>
      </Grid>
    </Paper>
  )
}
