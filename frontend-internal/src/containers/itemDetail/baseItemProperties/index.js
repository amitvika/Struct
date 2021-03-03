import React, { useState, useEffect } from 'react'
import Grid from '@material-ui/core/Grid';
import {
  Button,
  Snackbar,
  Paper,
  CircularProgress
} from "@material-ui/core";
import { useDispatch } from 'react-redux';

import GeometryInput from './GeometryInput';

import {
  ThreejsViewer,
  Headding,
  FileUpload
} from '../../../components';

import ProcessGroupAPI from '../../../api/processGroup.api'
import ItemAPI from '../../../api/items.api';

import GLTFRenderer from '../../gltf/GltfRenderer';
import { upload3DFile, getGLTFJson } from '../../../api/fileUpload.api'
import { showErrorAlert, showSuccessAlert } from '../../../actions/alert.action';

import '../style.css';


export default function BaseItemProperties({ itemId, itemProperties, setItemProperties, gltfjson, setgltfjson }) {
  const dispatch = useDispatch()

  const [isLoading, setIsLoading] = useState(false);
  const [isStepLoaded, setIsStepLoaded] = useState(false);
  const [threejsObject, setThreejsObject] = useState({});

  const [fileId, setFileId] = useState(0);
  const [files, setFiles] = useState([])
  const [isFileLoadingLoading, setIsFileLoadingLoading] = useState(false);

  useEffect(() => {
    if (itemProperties.fileId) {
      getView(itemProperties.fileId)
    }
  }, [])

  const handleFileUpload = (data) => {
    setIsLoading(true);
    upload3DFile(data)
      .then(res => {
        setFiles([res.data])
        setFileId(res.data.id);
        getView(res.data.id);

        setItemProperties(prevData => ({
          ...prevData,
          fileId: res.data.id
        }));

        dispatch(showSuccessAlert({ message: 'File uploaded successfully' }));

      })
      .catch(err => {
        console.log('Error -->> ', err)
        dispatch(showErrorAlert({ message: 'Unable to upload file at the moment' }));
        setIsLoading(false);
      })

    // ProcessGroupAPI
    //   .uploadStepfile(data)
    //   .then(res => {
    //     setIsLoading(false);
    //     if (res.data) {
    //       setIsStepLoaded(true);
    //       setThreejsObject(res.data)
    //     }
    //   })
    //   .catch(error => {
    // console.log('----->>>>', error)
    setIsLoading(false);
    // })
  }

  const getView = (fileId) => {
    setIsFileLoadingLoading(true)
    getGLTFJson(fileId)
      .then(res => res.data)
      .then((data) => {
        setgltfjson(data)
        setIsFileLoadingLoading(false);

        dispatch(showSuccessAlert({ message: 'File rendered successfully' }));
      })
      .catch(error => {
        setIsFileLoadingLoading(false);
        dispatch(showErrorAlert({ message: 'Unable to render file' }));
      })


  };

  const removeFile = (data) => {
    // setIsLoading(true);
    ItemAPI
      .deleteItemGeomtery(itemId)
      .then(res => {
        setThreejsObject({})
        setIsStepLoaded(false);


      })
      .catch(error => {
        // setIsLoading(false);
      })
  }

  return (
    <div>
      {
        <>
          <Paper style={{ padding: 20, margin: 10 }}>
            <Headding fontSize={24} bold title={'Upload Cad'} />
            {isStepLoaded ?
              <Button
                className="mt-2 mb-3"
                variant="contained"
                color="primary"
                onClick={removeFile}>
                Clear File
                    </Button>
              :
              <FileUpload handleFileUpload={handleFileUpload} itemId={itemId} />
            }
            {
              isLoading && <CircularProgress />
            }
          </Paper>
          <GeometryInput setItemProperties={setItemProperties} itemProperties={itemProperties} />

        </>
      }
      <Paper style={{ padding: 20, margin: 10 }}>
        {
          Object.keys(gltfjson).length > 0 && !isFileLoadingLoading &&
          <GLTFRenderer gltfjson={gltfjson} activefile={fileId} />
        }
        {
          isFileLoadingLoading && <CircularProgress />
        }

      </Paper>
    </div >
  )
}
