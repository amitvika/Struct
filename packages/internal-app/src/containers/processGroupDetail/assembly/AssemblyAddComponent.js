import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import ItemsAPI from '@monostruct/common/api/items.api';

export default function DialogSelect({
  isAddComponentModalOpen,
  setIsAddComponentModalOpen,
  setSelectedItem
}) {
  const [open, setOpen] = React.useState(false);

  const [itemList, setItemList] = React.useState([]);
  const [localSelectedItem, setLocalSelectedItem] = React.useState({
    name: 'Select Item'
  });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason !== 'backdropClick') {
      setOpen(false);
    }
  };

  React.useEffect(() => {
    ItemsAPI.getItemsAllAPI()
      .then((res) => {
        if (Array.isArray(res.data)) {
          setItemList(res.data);
        }
      })
      .catch((error) => {
        console.log('Error:-', error);
      });
  }, []);

  React.useEffect(() => {
    if (isAddComponentModalOpen) {
      setOpen(true);
    }
  }, [isAddComponentModalOpen]);

  const handleChange = (item) => {
    setLocalSelectedItem(item);
  };

  const onSubmit = () => {};

  return (
    <div>
      <Button onClick={handleClickOpen}>Open select dialog</Button>
      <Dialog disableEscapeKeyDown open={open} onClose={handleClose}>
        <DialogTitle>Add Item</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ display: 'flex', flexWrap: 'wrap' }}>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <InputLabel htmlFor="demo-dialog-native">Items</InputLabel>
              <Select
                native
                value={localSelectedItem.name}
                onChange={handleChange}
                input={<OutlinedInput label="Age" id="demo-dialog-native" />}
              >
                <option aria-label="None" value="" />
                {itemList.map((item, index) => {
                  return (
                    <option
                      key={index}
                      onClick={() => handleChange(item)}
                      value={item.name}
                    >
                      {item.name}
                    </option>
                  );
                })}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleClose}>Ok</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
