import React, { useState } from 'react'
import { Grid, Button } from '@material-ui/core';
import MainModal from '@ravibasil/common/components/Modal'
import Headding from '@ravibasil/common/components/atoms/Headding'
import FileUpload from '@ravibasil/common/components/FileUpload'
import Input from '@ravibasil/common/components/atoms/Input';

export default function IdentificationModal({ isModalOpened, toggleModal, saveIdentification }) {
  const [identificationNumber, setIdentificationNumber] = useState([{
    index: 1,
    identityNumber: ''
  }]);

  const handleOnChange = (event, identity) => {
    setIdentificationNumber(preValue => {
      return preValue.map(item => {
        if (item.index === identity.index) {
          return {
            ...item,
            identityNumber: event.target.value
          }
        }
        return item;
      })
    });
  }

  const handleRemove = (identity) => {
    setIdentificationNumber(preValue => {
      return preValue.filter(item => {
        if (item.index === identity.index) {
          return false;
        }
        return true;
      })
    });
  }

  const handleSave = () => {

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
                    <Grid item xs={8} >
                      <Input
                        label={`Identification Number ${index + 1}`}
                        placeholder="Enter"
                        type="text"
                        value={identity.value}
                        onChange={(event) => handleOnChange(event, identity)}
                      />
                    </Grid>
                    <Grid item xs={8}>
                      <Button variant="contained" color="secondary" onClick={() => handleRemove(identity)}>
                        Remove
                      </Button>
                    </Grid>
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

          <Grid item xs={12} style={{ textAlign: 'center' }}>
            <Button
              style={{ marginTop: '20px' }}
              variant="contained"
              color="primary"
              type="button"
              onClick={handleSave}>
              Save
            </Button>
          </Grid>
        </Grid>
      </MainModal>
    </div>
  )
}
