import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import {
  Input,
  Textarea,
  Headding,
} from '@monostruct/common/components';

import Modal from '@monostruct/common/components/Modal';
import ExcelFileUpload from '@monostruct/common/components/ExcelFileUpload';
import FileHistory from './FileHistory';
import { useSelector } from 'react-redux';
import { uploadFileS3Bucket } from '@monostruct/common/api/aws';
import { hierarchyFileParser, criteriaFileParser } from './parser';
import LoadingModal from '@monostruct/common/components/LoadingModal';

export default function AddUpdateModal({
  title,
  open,
  toggleModal,
  handleUpdate,
  isEditing,
  selectedValue,
}) {
  const [value, setValue] = useState({});
  const [isTypeSelected, setIsTypeSelected] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const { user } = useSelector((state) => state.auth);
  const [isLoading, setLoading] = useState(false);
  const [refreshFileHistory, setRefreshFileHistory] = useState(false);

  useEffect(() => {
    if (selectedValue) {
      setValue(selectedValue);
    } else {
      setValue({});
    }
  }, [selectedValue]);

  const handleOnChange = (name, data) => {
    let file_history = value.file_history || [];
    if (name === 'new_file') {
      file_history = [data, ...file_history];
    }

    setValue((preValue) => ({
      ...preValue,
      [name]: data,
      file_history,
    }));
  };

  const handleSaveButton = async () => {
    setLoading(true);
    if (value) {
      await handleUpdate(value);
    }
    setRefreshFileHistory(!refreshFileHistory);
    setLoading(false);
    // toggleModal();
  };

  const handleTypeChange = (data) => {
    setIsTypeSelected(true);
    setSelectedType(data);
    handleOnChange('category', data);
  };

  const handleFileChange = async (selectedFile) => {
    setLoading(true);

    let criteriaSchema = await criteriaFileParser(selectedFile);
    let hierarchySchema = await hierarchyFileParser(selectedFile);

    const file_url = await uploadFileS3Bucket(selectedFile);

    let updateObj = {
      criteriaSchema,
      hierarchySchema,
      new_file: {
        file_name: selectedFile.name,
        file_url,
        loaded_by_name: user.name,
        loaded_by: user.id,
      },
    };

    console.log('updateObj', updateObj);
    setValue((prev) => ({ ...prev, ...updateObj }));
    setLoading(false);
  };

  return (
    <Modal
      title={`${isEditing ? `Update ${selectedValue.name}` : 'Add'} ${title}`}
      open={open}
      toggleModal={toggleModal}
    >
      {isLoading && <LoadingModal isLoading={isLoading} />}
      <Grid className="section-padding-left" container spacing={4}>
        <Grid item xs={4}>
          <Headding bold title={'Name'} />
        </Grid>
        <Grid item xs={8}>
          <Input
            placeholder="Enter"
            type="text"
            onChange={(event) => handleOnChange('name', event.target.value)}
            value={value.name}
          />
        </Grid>

        {/* <Grid item xs={4}>
          <Headding bold title={'Category'} />
        </Grid>
        <Grid item xs={8}>
          <Select
            options={[
              { label: 'Criteria', value: 'criteria' },
              { label: 'Hierarchy', value: 'hierarchy' },
            ]}
            onChange={(data) => handleTypeChange(data.value)}
            value={value.category && { label: value.category }}
          />
        </Grid> */}

        {isTypeSelected && (
          <>
            <Grid item xs={4}></Grid>
            <Grid item xs={8}>
              <a
                href={`${process.env.REACT_APP_API}/download/${selectedType}`}
                target="_blank"
                style={{ textDecoration: 'none' }}
                rel="noreferrer"
              >
                <Button variant="contained" color="secondary">
                  {selectedType === 'criteria'
                    ? 'Download Criteria Upload Template'
                    : 'Download Hirarchy Upload Template'}
                </Button>
              </a>
            </Grid>
          </>
        )}
        <Grid item xs={4}>
          <Headding bold title={'Note'} />
        </Grid>
        <Grid item xs={8}>
          <Textarea
            placeholder="Enter"
            onChange={(event) => handleOnChange('notes', event.target.value)}
            value={value.notes}
          />
        </Grid>

        <ExcelFileUpload value={value} handleOnChange={handleFileChange} />
        <FileHistory
          link_id={value.id}
          refreshFileHistory={refreshFileHistory}
        />

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
    </Modal>
  );
}
