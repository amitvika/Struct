import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux';
import moment from 'moment';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { Paper, Grid, Button } from '@material-ui/core';
import MainModal from '@ravibasil/common/components/Modal'
import Heading from '@ravibasil/common/components/atoms/Headding';
import Link from '@material-ui/core/Link';
import { useHistory, useParams } from "react-router-dom";
import CircularProgress from '@material-ui/core/CircularProgress';

export default function ProductionApprovalModal({
    isModalOpened,
    toggleModal,
    selectedValue,
    handleApproveItemForProduction,
    isLoading
}) {
    let history = useHistory();
    const { user } = useSelector(state => state.auth);

    const [currentApproval, setCurrentApproval] = useState({ author_name: '', author: "", date: '1223', isChecked: false })

    const onChange = (event) => {

        const cApproval = { author: user._id, author_name: user.name, date: '1223', isChecked: true }

        handleApproveItemForProduction(selectedValue.id, cApproval)
    }

    const renderProductionApprovalActions = () => {
        let approvalList = selectedValue.approval_list || []
        let list = [];

        list.push(
            approvalList.map(approvalItem => {
                return (
                    <Grid container xs={12} style={{ textAlign: 'center' }}>
                        <FormControlLabel
                            control={
                                <Checkbox inputProps={{ 'aria-label': 'uncontrolled-checkbox' }}
                                    checked={true}
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
                <Grid container xs={12} style={{ textAlign: 'center' }}>
                    <FormControlLabel
                        control={
                            <Checkbox inputProps={{ 'aria-label': 'uncontrolled-checkbox' }}
                                onChange={onChange}
                                checked={currentApproval.isChecked}
                            // onClick={() => handleApproveItemForProduction(selectedValue.id, currentApproval)}
                            />
                        }
                        label={`${currentApproval.isChecked ? currentApproval.author_name : ''}`}
                    />
                </Grid>
            )
        }

        return list
    }
    const handleFactoryClick = () => {
        history.push(`/factories/${selectedValue.factory_id}`)

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
                        Factory
                    </Grid>
                    <Grid item xs={8} style={{ cursor: 'pointer' }}>
                        <Link onClick={handleFactoryClick}>{selectedValue.factory_name} </Link></Grid>

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
                    <Grid container xs={8} style={{ display: "flex" }}>
                        {
                            renderProductionApprovalActions()
                        }
                        {
                            isLoading && <CircularProgress />
                        }
                    </Grid>
                </Grid>

            </Paper>
        </MainModal>
    )
}
