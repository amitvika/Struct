import React, { useState, useEffect } from 'react'
import Grid from '@material-ui/core/Grid';
import {
  Button,
  Snackbar,
  Paper,
  CircularProgress
} from "@material-ui/core";
import Headding from '../../components/atoms/Headding'
import GeometryInput from './GeometryInput';
import FileUpload from '../../components/FileUpload';

import ThreejsViewer from '../3DViewer/ThreejsViewer';
import ProcessGroupAPI from '../../api/processGroup.api'
import ItemAPI from '../../api/items.api';

export default function ItemGeometry({ itemId, itemDetail, setItemGeometryDetail }) {

  const [isLoading, setIsLoading] = useState(false);
  const [isStepLoaded, setIsStepLoaded] = useState(false);
  const [jsonMesh, setJSONMesh] = useState({});

  useEffect(() => {

    if (itemDetail.step) {
      setIsStepLoaded(true);
    }
    setJSONMesh(itemDetail.step)

  }, [itemDetail])

  const handleFileUpload = (data) => {
    setIsLoading(true);
    ProcessGroupAPI
      .uploadStepfile(data)
      .then(res => {
        setIsStepLoaded(false);
        setIsLoading(false);
        if (res.data) {
          setJSONMesh(res.data)
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
        setJSONMesh({})
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
        <Paper elevation={0} className="ItemGeometry--Choose">
          <Grid className="section-padding-left" container spacing={4}>

            <Grid item xs={12}>
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
            </Grid>
            <Grid item xs={12}>
              <Headding bold title={'Set Item Properties'} />
            </Grid>
            <GeometryInput setItemData={setItemGeometryDetail} itemData={itemDetail} />
          </Grid>
        </Paper>
      }

      <ThreejsViewer
        jsonMesh={jsonMesh} />
    </div >
  )
}
