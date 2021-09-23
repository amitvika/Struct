import React, { useState, useEffect } from 'react';
import MainModal from '@monostruct/common/components/Modal';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { Input, Headding } from '@monostruct/common/components';

export default function AddEditFactoryModal({
  title,
  isEditing,
  selectedValue,
  fields,
  addFactory,
  updateFactory,
  isAddEditModalOpened,
  toggleAddEditModal,
}) {
  const [value, setValue] = useState({});

  useEffect(() => {
    if (selectedValue) {
      setValue(selectedValue);
    } else {
      setValue({});
    }
  }, [selectedValue]);

  const renderView = () => {
    return fields
      .filter((item) => item.type)
      .map((item) => {
        return (
          <Grid container key={`view_${item.title}`}>
            <Grid item xs={4}>
              <Headding bold title={item.title} />
            </Grid>
            <Grid item xs={8}>
              {renderField(item)}
            </Grid>
          </Grid>
        );
      });
  };

  const handleOnChange = (name, value) => {
    setValue((preValue) => ({
      ...preValue,
      [name]: value,
    }));
  };

  const handleSaveButton = async () => {
    if (value) {
      await updateFactory(value);
    }

    toggleAddEditModal();
  };
  const renderField = (item) => {
    if (item.type === 'text') {
      return (
        <Input
          placeholder="Enter"
          type="text"
          onChange={(event) => handleOnChange(item.field, event.target.value)}
          value={value[item.field]}
        />
      );
    }
  };
  return (
    <MainModal
      open={isAddEditModalOpened}
      toggleModal={toggleAddEditModal}
      title={`${isEditing ? `Update ${selectedValue.name}` : 'Add'} ${title}`}
    >
      <Grid className="section-padding-left" container spacing={4}>
        {renderView()}

        <Grid item xs={6}>
          <Button
            variant="contained"
            color="secondary"
            onClick={toggleAddEditModal}
          >
            Cancel
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveButton}
          >
            {isEditing ? 'Update' : 'Save'}
          </Button>
        </Grid>
      </Grid>
    </MainModal>
  );
}
