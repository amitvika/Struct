import React, { useState } from 'react';
import Button from '@mui/material/Button';
import FileHistory from '@monostruct/common/containers/FileHistory';
import Grid from '@mui/material/Grid';
import Headding from '@monostruct/common/components/atoms/Headding';
import ExcelFileUpload from '@monostruct/common/components/ExcelFileUpload';
import {
  hierarchyFileParser,
  criteriaFileParser,
  LookUpTableParser
} from '@monostruct/common/components/ExcelUIParser';
import { uploadFileS3Bucket } from '@monostruct/common/api/aws';
import { useSelector } from 'react-redux';
import LoadingModal from '@monostruct/common/components/LoadingModal';

const InteractiveTaskExcelUI = ({ selectedValue }) => {
  const [value, setValue] = useState(selectedValue || {});
  const [isLoading, setLoading] = useState(false);
  const [isRecordUpdated, setIsRecordUpdated] = useState(false);
  const { user } = useSelector((state) => state.auth);

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
  return (
    <>
      {isLoading && <LoadingModal isLoading={isLoading} />}
      <Grid item xs={2}>
        <Headding bold title={`Upload Excel UI`} />
      </Grid>
      <ExcelFileUpload value={value} handleOnChange={handleFileChange} />
    </>
  );
};

export default InteractiveTaskExcelUI;
