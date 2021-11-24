import React, { useEffect, useState } from 'react';
import {
  LinearProgress,
  Box,
  IconButton,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel
} from '@material-ui/core';
import { v4 as uuidv4 } from 'uuid';

import {
  uploadChunkData,
  download /*,
  checkExistingPathFromStore*/
} from '../../api/fileUpload.api';

import ExportLogo from '../../assets/images/export.png';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  custom_file: {
    position: 'relative',
    width: '100%',
    height: 'calc(1.5em + .75rem + 2px)'
  },
  custom_file_input: {
    zIndex: 2,
    margin: 0,
    overflow: 'hidden',
    opacity: 0,
    position: 'relative',
    width: '100%',
    height: 'calc(1.5em + .75rem + 2px)'
  },
  custom_file_label: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: '.375rem .75rem',
    lineHeight: 1.5,
    color: '#495057',
    left: 0,
    zIndex: 1,
    height: 'calc(1.5em + .75rem + 2px)',
    overflow: 'hidden',
    fontWeight: 400,
    backgroundColor: '#fff',
    border: '1px solid #ced4da',
    borderRadius: '.25rem',
    '&::after': {
      bottom: 0,
      zIndex: 3,
      display: 'block',
      height: 'calc(1.5em + .75rem)',
      content: '"Browse"',
      backgroundColor: '#e9ecef',
      borderLeft: 'inherit',
      borderRadius: '0 .25rem .25rem 0',
      position: 'absolute',
      top: 0,
      right: 0,
      padding: '.375rem .75rem',
      lineHeight: 1.5,
      color: '#495057'
    }
  }
}));

const chunkSize = 1048576 * 3; //its 3MB, increase the number measure in mb

export default function LargeFileUpload({
  handleFileUpload,
  itemProperties,
  itemId,
  label = 'STEP, DXF, GERBER',
  setIsFileLoading,
  distanceGap,
  setDistanceGap,
  angleGap,
  setAngleGap,
  drawLine,
  setDrawLine,
  allowFirstLevelItems,
  setAllowFirstLevelItems
}) {
  const classes = useStyles();
  const [counter, setCounter] = useState(1);
  const [fileToBeUpload, setFileToBeUpload] = useState({});
  const [beginingOfTheChunk, setBeginingOfTheChunk] = useState(0);
  const [endOfTheChunk, setEndOfTheChunk] = useState(chunkSize);
  const [progress, setProgress] = useState(0);
  const [fileGuid, setFileGuid] = useState('');
  const [fileNameHere, setFileNameHere] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [chunkCount, setChunkCount] = useState(0);

  useEffect(() => {
    if (fileSize > 0) {
      fileUpload(counter);
    } else {
      setIsFileLoading(false);
    }
  }, [fileToBeUpload, progress]);
  const onChange = (e) => {
    resetChunkProperties();
    const dataload = e.target.files[0];
    if (dataload && dataload.size) {
      setFileSize(dataload.size);
      const totalCount =
        dataload.size % chunkSize == 0
          ? dataload.size / chunkSize
          : Math.floor(dataload.size / chunkSize) + 1; // Total count of chunks will have been upload to finish the file
      setChunkCount(totalCount);
      const fileID = uuidv4();
      setFileGuid(fileID);
      //console.log('File Loading', dataload);
      const filenameWithExtension = dataload.name.replace(/^.*[\\\/]/, '');
      setFileNameHere(filenameWithExtension);
      setIsFileLoading(true);
    } else {
      setFileSize(0);
    }
    setFileToBeUpload(dataload);
  };

  const fileUpload = () => {
    setCounter(counter + 1);
    if (counter <= chunkCount) {
      var chunk = fileToBeUpload.slice(beginingOfTheChunk, endOfTheChunk);
      uploadChunk(chunk);
    }
  };

  const uploadChunk = async (chunk) => {
    var formData = new FormData();
    formData.append('filename', fileNameHere);
    formData.append('id', counter);
    formData.append('uuid', fileGuid);
    formData.append('total', chunkCount);
    formData.append('data', chunk);
    try {
      const response = await uploadChunkData(formData);
      //console.log('My Response from uploadchunk', response);
      if (response) {
        const data = response.data;
        if (data.isSuccess) {
          setBeginingOfTheChunk(endOfTheChunk);
          setEndOfTheChunk(endOfTheChunk + chunkSize);
          var percentage = (counter / chunkCount) * 100;
          setProgress(percentage);
          if (counter == chunkCount) {
            setIsFileLoading(false);
            handleFileUpload(data);
          }
        } else {
          setIsFileLoading(false);
          console.log(
            'Error Occurred:',
            data.errorMessage,
            fileNameHere,
            counter,
            chunkCount
          );
        }
      } else {
        setIsFileLoading(false);
        console.log(
          'Error Occurred:',
          'Could not get response',
          fileNameHere,
          counter,
          chunkCount
        );
      }
    } catch (error) {
      setIsFileLoading(false);
      console.log('error', error, fileNameHere, counter, chunkCount);
    }
  };

  const resetChunkProperties = () => {
    setCounter(1);
    setBeginingOfTheChunk(0);
    setEndOfTheChunk(chunkSize);
    setProgress(0);
  };
  const handleExportButton = () => {
    download(itemProperties.fileName);
  };

  const onDistanceChange = (e) => {
    setDistanceGap(e.target.value);
  };

  const onAngleChange = (e) => {
    setAngleGap(e.target.value);
  };

  const onDrawLineChange = (e) => {
    setDrawLine(e.target.checked);
  };
  const fileGDTPath =
    (itemProperties.fileUUId ? itemProperties.fileUUId + '/' : '') +
    (itemProperties.fileGDT ? itemProperties.fileGDT : '');
  //console.log(fileGDTPath);
  if (
    itemProperties.fileStore &&
    itemProperties.fileGDT &&
    itemProperties.stepTreeLength // && checkExistingPathFromStore(fileGDTPath, 'gltf', true)
  ) {
    console.log(itemProperties.fileStore, distanceGap, angleGap, fileGDTPath);
    return (
      <div style={{ display: 'flex' }}>
        <Typography
          variant="h6"
          style={{
            display: 'flex',
            alignItems: 'center',
            color: 'blue'
          }}
        >
          {itemProperties.fileStore}
        </Typography>
        <IconButton margin="auto" onClick={handleExportButton}>
          <img
            src={ExportLogo}
            style={{ width: '20px', paddingTop: '2px' }}
            alt={'pictur' + (itemId || '').toString()}
          />
        </IconButton>
      </div>
    );
  }
  let getTrimmedValue = 0;
  getTrimmedValue = progress ? parseFloat(progress.toFixed(3)) : 0;
  if (isNaN(getTrimmedValue)) {
    getTrimmedValue = 0;
  }

  return (
    <div>
      <Box sx={{ width: '100%' }}>
        <TextField
          type="number"
          InputProps={{
            inputProps: {
              max: 10,
              min: 0.01
            }
          }}
          label="Distance Tollerance"
          onChange={onDistanceChange}
          value={distanceGap}
        />
        <TextField
          type="number"
          InputProps={{
            inputProps: {
              max: 3.13,
              min: 0.01
            }
          }}
          label="Angle Tollerance"
          onChange={onAngleChange}
          value={angleGap}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={drawLine}
              label="Load All Edges"
              onChange={onDrawLineChange}
            />
          }
          label="Load All Edges"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={allowFirstLevelItems}
              label="Create First Level Items"
              onChange={(event) =>
                setAllowFirstLevelItems(event.target.checked)
              }
            />
          }
          label="Create First Level Items"
        />
      </Box>
      <Box sx={{ width: '100%' }}>
        <LinearProgress variant="determinate" value={getTrimmedValue} />
      </Box>

      <div style={{ display: 'flex' }}>
        <Typography variant="h6">Upload Cad</Typography>
        <Box
          component="div"
          className={classes.custom_file}
          sx={{ width: '100%' }}
        >
          <input
            id="btn-upload"
            name="btn-upload"
            className={classes.custom_file_input}
            type="file"
            accept=".step,.stp,.igs,.iges,.stl,.brep"
            onChange={onChange}
          />
          <label className={classes.custom_file_label} htmlFor="file">
            {itemProperties.fileStore ? itemProperties.fileStore : label}
          </label>
        </Box>
      </div>
    </div>
  );
}
