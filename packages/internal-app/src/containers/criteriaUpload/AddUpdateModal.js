import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { Input, Textarea, Headding } from '@monostruct/common/components';

import Modal from '@monostruct/common/components/Modal';
import ExcelFileUpload from '@monostruct/common/components/ExcelFileUpload';
import FileHistory from './FileHistory';
import { useSelector } from 'react-redux';
import { uploadFileS3Bucket } from '@monostruct/common/api/aws';
import {
  hierarchyFileParser,
  criteriaFileParser,
  LookUpTableParser
} from './parser';
import LoadingModal from '@monostruct/common/components/LoadingModal';
import Select from '@monostruct/common/components/atoms/Select';
import get from 'lodash/get';

export default function AddUpdateModal({
  title,
  open,
  toggleModal,
  handleUpdate,
  isEditing,
  selectedValue,
  dataList = []
}) {
  const [value, setValue] = useState(selectedValue || {});
  const [isTypeSelected, setIsTypeSelected] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const { user } = useSelector((state) => state.auth);
  const [isLoading, setLoading] = useState(false);
  const [refreshFileHistory, setRefreshFileHistory] = useState(false);
  const [isRecordUpdated, setIsRecordUpdated] = useState(false);
  const [error, setError] = useState({});

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
      file_history
    }));
    setIsRecordUpdated(true);
  };

  const isValidationError = () => {
    if (!value.name) {
      setError({ name: true });
      return true;
    } else if (!value.type) {
      setError({ type: true });
      return true;
    } else {
      setError({});
      return false;
    }
  };

  const handleSave = async () => {
    if (isValidationError() || !isRecordUpdated) {
      return;
    }
    setLoading(true);
    if (value) {
      const updateCriteria = await handleUpdate(value);
      setValue(updateCriteria);
    }
    setRefreshFileHistory(!refreshFileHistory);
    setLoading(false);
    // toggleModal();
  };

  const handleFileChange = async (selectedFile) => {
    setLoading(true);

    let criteriaSchema = await criteriaFileParser(selectedFile);
    let hierarchySchema = await hierarchyFileParser(selectedFile, value.type);
    let lookUpTableSchema = await LookUpTableParser(selectedFile);
    const file_url = await uploadFileS3Bucket(selectedFile);

    let updateObj = {
      criteriaSchema,
      hierarchySchema,
      lookUpTableSchema,
      new_file: {
        file_name: selectedFile.name,
        file_url,
        loaded_by_name: user.name,
        loaded_by: user.id
      }
    };

    setValue((prev) => ({ ...prev, ...updateObj }));
    setLoading(false);
    setIsRecordUpdated(true);
  };

  const handleModalToggle = () => {
    toggleModal();
  };

  const getOptions = () => {
    const optionsList = [
      {
        label: 'Internal Use Product Configuration',
        value: 'Internal Use Product Configuration'
      },
      {
        label: 'Classification Configuration',
        value: 'Classification Configuration'
      },
      {
        label: 'Internal Circular faces',
        value: 'Internal Circular faces'
      },
      {
        label: 'External Circular faces',
        value: 'External Circular faces'
      },
      {
        label: 'Hole Tolerancing',
        value: 'Hole Tolerancing'
      },
      {
        label: 'External Circular faces',
        value: 'External Circular faces'
      },
      {
        label: 'Shaft Tolerancing',
        value: 'Shaft Tolerancing'
      }
    ];

    if (!dataList || dataList.length === 0) {
      return optionsList;
    }
    return optionsList.filter((option) => {
      const isAvailable = dataList.find(
        (dataItem) =>
          dataItem.type === option.value &&
          get(selectedValue, 'id') !== get(dataItem, 'id')
      );
      if (isAvailable) {
        return false;
      }
      return true;
    });
  };

  return (
    <Modal
      title={`${isEditing ? `Update ${selectedValue.name}` : 'Add'} ${title}`}
      open={open}
      toggleModal={handleModalToggle}
    >
      {isLoading && <LoadingModal isLoading={isLoading} />}
      <Grid className="section-padding-left" container spacing={4}>
        <Grid item xs={12} style={{ display: 'flex', justifyContent: 'end' }}>
          <Button variant="contained" color="primary" onClick={handleSave}>
            {isEditing ? 'Update' : 'Save'}
          </Button>
        </Grid>
        <Grid item xs={4}>
          <Headding bold title={'Name *'} />
        </Grid>
        <Grid item xs={8}>
          <Input
            placeholder="Enter"
            type="text"
            onChange={(event) => handleOnChange('name', event.target.value)}
            value={value?.name}
            hasError={error['name']}
          />
        </Grid>

        <Grid item xs={4}>
          <Headding bold title={'Type *'} />
        </Grid>
        <Grid item xs={8}>
          <Select
            options={getOptions()}
            onChange={(data) => handleOnChange('type', data.value)}
            value={value.type}
            hasError={error['type']}
          />
        </Grid>

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
            value={value?.notes}
          />
        </Grid>

        <ExcelFileUpload value={value} handleOnChange={handleFileChange} />
        <FileHistory
          link_id={value?.id}
          refreshFileHistory={refreshFileHistory}
        />

        <Grid item xs={12} style={{ display: 'flex', justifyContent: 'end' }}>
          <Button variant="contained" color="primary" onClick={handleSave}>
            {isEditing ? 'Update' : 'Save'}
          </Button>
        </Grid>
      </Grid>
    </Modal>
  );
}
