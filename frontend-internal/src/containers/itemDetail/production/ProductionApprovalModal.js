import React from 'react'
import MainModal from '../../../components/Modal'
import { Paper, Grid, Button } from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Heading from '../../../components/atoms/Headding';
import moment from 'moment';

export default function ProductionApprovalModal({
    isModalOpened,
    toggleModal,
    selectedValue,
    setSelectedValue,
    handleApproveItemForProduction
}) {

    const onChange = (event) => {
        setSelectedValue(prev => ({ ...prev, isApprovedforProduction: event.target.checked }))
    }

    return (
        <MainModal open={isModalOpened} toggleModal={toggleModal} >
            <Paper style={{ padding: 10 }}>

                <Grid container spacing={4}>
                    <Grid item xs={12}>
                        <Heading bold>Production Approval</Heading>
                    </Grid>

                    <Grid item xs={4}>
                        ID
                    </Grid>
                    <Grid item xs={8}>{selectedValue.id}</Grid>

                    <Grid item xs={4}>
                        Name
                    </Grid>
                    <Grid item xs={8}>{selectedValue.name}</Grid>

                    <Grid item xs={4}>
                        Quantity
                    </Grid>
                    <Grid item xs={8}>{selectedValue.quantity}</Grid>

                    <Grid item xs={4}>
                        Start Date
                    </Grid>
                    <Grid item xs={8}>{moment(selectedValue.start_date).format('DD/MM/YYYY')}</Grid>


                    <Grid item xs={4}>
                        End Date
                    </Grid>
                    <Grid item xs={8}>{moment(selectedValue.end_date).format('12/31/2999')}</Grid>

                    <Grid item xs={4}>
                        Approved for Production
                    </Grid>

                    <Grid item xs={8}>
                        <Checkbox inputProps={{ 'aria-label': 'uncontrolled-checkbox' }}
                            onChange={onChange}
                            checked={selectedValue.isApprovedforProduction} />
                    </Grid>

                    {selectedValue.isApprovedforProduction &&
                        <>
                            <Grid item xs={4} />
                            {/* <Grid item xs={8}>{selectedValue.productionApprovedBy.name} has approved for production at </Grid> */}
                        </>

                    }

                    <Grid item xs={12} style={{ textAlign: 'center' }}>
                        <Button
                            style={{ marginTop: '20px' }}
                            variant="contained"
                            color="primary"
                            type="button"
                            onClick={() => handleApproveItemForProduction(selectedValue)}>
                            OK
                    </Button>
                    </Grid>
                </Grid>

            </Paper>
        </MainModal>
    )
}
