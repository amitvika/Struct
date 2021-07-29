import React, { useState } from 'react'
import { Paper, Grid, Button } from '@material-ui/core';
import MainModal from '@ravibasil/common/components/Modal'
import Headding from '@ravibasil/common/components/atoms/Headding'
import FileUpload from '@ravibasil/common/components/FileUpload'
import Input from '@ravibasil/common/components/atoms/Input';

export default function IdentificationModal({ isModalOpened, toggleModal }) {
  const [identificationNumber, setIdentificationNumber] = useState([{
    index: 1,
    identityNumber: ''
  }]);

  const handleOnChange = (event, identity) => {

  }

  return (
    <div>
      <MainModal open={isModalOpened} toggleModal={toggleModal}>
        <Grid className="section-padding-left" container spacing={4}>

          <Grid item xs={12} >
            <Headding bold title={'Identification'} />
          </Grid>
          <Grid item xs={12}>
            <FileUpload handleFileUpload={() => console.log('file selected')} label={"Upload Bar Code"} />
          </Grid>

          <Grid item xs={6} style={{ textAlign: 'center' }}>
            {
              identificationNumber.map((identity, index) => {
                return (
                  <>
                    <Grid item xs={12} >
                      <Input
                        label={`Identification Number ${index + 1}`}
                        placeholder="Enter"
                        type="text"
                        value={identity.value}
                        onChange={(event) => handleOnChange(event, identity)}
                      />
                    </Grid>
                    <Grid item xs={8}></Grid>
                  </>)
              })
            }
          </Grid>

          <Grid item xs={6} style={{ textAlign: 'center' }}>
            <Button
              style={{ marginTop: '20px' }}
              variant="contained"
              color="primary"
              type="button"
              onClick={() => setIdentificationNumber(prevNums => [...prevNums, {}])}>
              Add Additional ID
            </Button>
          </Grid>


        </Grid>
      </MainModal>
    </div>
  )
}
