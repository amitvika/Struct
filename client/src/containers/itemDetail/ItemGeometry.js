import React, { useState, useEffect } from 'react'
import Grid from '@material-ui/core/Grid';
import {
  Button,
  Snackbar,
  Paper,
  CircularProgress
} from "@material-ui/core";
import Headding from '../../components/atoms/Headding';
import GeometryInput from './GeometryInput';
import FileUpload from '../../components/FileUpload';

import ThreejsViewer from '../3DViewer/ThreejsViewer';
import ProcessGroupAPI from '../../api/processGroup.api'
import ItemAPI from '../../api/items.api';

export default function ItemGeometry({ itemId, itemProperties, setItemProperties, threejsData }) {

  const [isLoading, setIsLoading] = useState(false);
  const [isStepLoaded, setIsStepLoaded] = useState(false);
  const [threejsObject, setThreejsObject] = useState({});

  useEffect(() => {

    if (threejsData.step || threejsData.stl) {
      setIsStepLoaded(true);
    }
    setThreejsObject(threejsData)

  }, [threejsData])

  const handleFileUpload = (data) => {
    setIsLoading(true);
    ProcessGroupAPI
      .uploadStepfile(data)
      .then(res => {
        setIsLoading(false);
        if (res.data) {
          setIsStepLoaded(true);
          setThreejsObject(res.data)
        }
      })
      .catch(error => {
        // console.log('----->>>>', error)
        setIsLoading(false);
      })
  }

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

  if (isLoading) {
    return <CircularProgress />
  }
  return (
    <div>
      {
        <>
          <Paper style={{ padding: 20, margin: 10 }}>
            <Headding fontSize={24} bold title={'Cad File or Assembly File Upload'} />
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
          </Paper>
          <GeometryInput setItemProperties={setItemProperties} itemProperties={itemProperties} />
        </>
      }
      <Paper style={{ padding: 20, margin: 10 }}>
        <ThreejsViewer
          data={threejsObject} isLoading={isLoading} />
      </Paper>
    </div >
  )
}
