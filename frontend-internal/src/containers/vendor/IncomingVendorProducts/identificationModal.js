import React, { useState } from 'react'
import MainModal from '../../../components/Modal'
import Headding from '../../../components/atoms/Headding'
import { Paper, Grid, Button } from '@material-ui/core';
import FileUpload from '../../../components/FileUpload'
import Input from '../../../components/atoms/Input';

export default function IdentificationModal({ isModalOpened, toggleModal }) {

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
                <Grid item xs={4} >
                    <Input
                        label="Identification Number #"
                        placeholder="Enter"
                        type="text"
                    />
                </Grid>
                <Grid item xs={4} style={{ textAlign: 'center' }}>
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
