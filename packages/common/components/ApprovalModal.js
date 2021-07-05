import React, { useState } from 'react'
import MainModal from './Modal'
import { Paper, Grid, Button } from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';
import Heading from './atoms/Headding';
import moment from 'moment';
// import GridView from '../../../components/GridView';
import { useSelector } from 'react-redux';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import CircularProgress from '@material-ui/core/CircularProgress';

export default function ApprovalModal({
    isModalOpened,
    toggleModal,
    selectedValue,
    handleApproval,
    fields,
    isLoading
}) {

    const { user } = useSelector(state => state.auth);
    const [currentApproval, setCurrentApproval] = useState({ author_name: '', author: "", date: '1223', is_approved: false })

    const onChange = (event) => (approval) => {
        if (event.target.checked) {
            setCurrentApproval(prev => ({ ...prev, is_approved: false }));

            const cApproval = { author: user._id, author_name: user.name, date: '1223', is_approved: true }
            handleApproval(selectedValue.id, cApproval)
        }
        else {
            handleApproval(selectedValue.id, { ...approval, is_approved: false })
        }
    }

    const renderProductionApprovalActions = () => {
        let approvalList = selectedValue.approval_list || []
        let list = [];

        list.push(
            approvalList.map((approvalItem, index) => {
                return (
                    <Grid key={approvalItem.approval_id} item xs={12}>
                        <FormControlLabel
                            control={
                                <Checkbox inputProps={{ 'aria-label': 'uncontrolled-checkbox' }}
                                    onChange={(event) => onChange(event)(approvalItem)}
                                    checked={approvalItem.is_approved}
                                />
                            }
                            label={`Approved By ${approvalItem.author_name} on ${moment(approvalItem.approval_time).format('DD/MM/YYYY HH:mm:ss')}`}
                        />
                    </Grid>
                )
            })
        )

        if (approvalList.length < 3) {
            list.push(
                <Grid key={'new_approval'} item xs={12}>
                    <FormControlLabel
                        control={
                            <Checkbox inputProps={{ 'aria-label': 'uncontrolled-checkbox' }}
                                onChange={(event) => onChange(event)({})}
                                checked={currentApproval.is_approved}
                            />
                        }
                        label={`${currentApproval.is_approved ? currentApproval.author_name : approvalList.length == 2 ? 'CHECK TO START AUTOSCALING' : ''}`}
                    />
                </Grid>
            )
        }

        return list
    }


    const renderView = () => {
        return fields
            .filter(fieldItem => fieldItem.isGridViewVisible === false ? fieldItem.isGridViewVisible : true)
            .map(item => {
                return (
                    <Grid item container key={item.title}>

                        <Grid item xs={4}>
                            {item.title}
                        </Grid>
                        <Grid item xs={8}>
                            {selectedValue[item.field]}
                        </Grid>
                    </Grid>
                )

            })
    }


    return (
        <MainModal open={isModalOpened} toggleModal={toggleModal} >
            <Paper style={{ padding: 10 }}>

                <Grid container spacing={4}>
                    <Grid item xs={12}>
                        <Heading bold>Production Approval</Heading>
                    </Grid>
                    {renderView()}

                    <Grid item xs={4}>
                        Approved for Production
                    </Grid>
                    <Grid container xs={8} style={{ display: "flex" }}>
                        {renderProductionApprovalActions()}
                        {
                            isLoading && <CircularProgress />
                        }
                    </Grid>


                    {/* <Grid item xs={12} style={{ textAlign: 'center' }}>
                        <Button
                            style={{ marginTop: '20px' }}
                            variant="contained"
                            color="primary"
                            type="button"
                            disabled={!currentApproval.isChecked}
                            onClick={() => handleApproval(selectedValue.id, currentApproval)}>
                            OK
                        </Button>
                    </Grid> */}
                </Grid>

            </Paper>
        </MainModal>
    )
}
