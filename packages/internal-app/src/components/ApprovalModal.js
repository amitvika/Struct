import React, { useState } from 'react'
import { Paper, Grid, Button } from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';
import moment from 'moment';
// import GridView from '../../../components/GridView';
import { useSelector } from 'react-redux';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Heading from '@ravibasil/common/components/atoms/Headding';
import MainModal from './Modal'

export default function ProductionApprovalModal({
    isModalOpened,
    toggleModal,
    selectedValue,
    setSelectedValue,
    handleApproval,
    list,
    fields,
    title,
    approvalList
}) {

    const { user } = useSelector(state => state.auth);

    const [currentApproval, setCurrentApproval] = useState({ author_name: '', author: "", date: '1223', isChecked: false })

    const onChange = (event) => {

        if (event.target.checked) {
            setCurrentApproval({ author: user._id, author_name: user.name, date: '1223', isChecked: true })
        }
        else {
            setCurrentApproval({ isChecked: false })
        }
    }

    const renderView = () => {
        return fields
            .filter(fieldItem => fieldItem.isGridViewVisible === false ? fieldItem.isGridViewVisible : true)
            .map(item => {
                return (<>
                    <Grid item xs={4}>
                        {item.title}
                    </Grid>
                    <Grid item xs={8}>
                        {selectedValue[item.field]}
                    </Grid>
                </>)

            })
    }



    const renderProductionApprovalActions = () => {
        let approvalList = selectedValue.approval_list || []
        let list = [];
        list = approvalList.map(approvalItem => {
            return (
                <>
                    <Grid container xs={12} style={{ textAlign: 'center' }}>
                        <FormControlLabel
                            control={
                                <Checkbox inputProps={{ 'aria-label': 'uncontrolled-checkbox' }}
                                    disabled
                                    checked={true}
                                />
                            }
                            label={`Approved By ${approvalItem.author_name} on ${moment(approvalItem.approval_time).format('DD/MM/YYYY HH:mm:ss')}`}
                        />
                    </Grid>
                </>
            )
        })

        if (approvalList.length < 3) {
            list.push(
                <Grid container xs={12} style={{ textAlign: 'center' }}>
                    <FormControlLabel
                        control={
                            <Checkbox inputProps={{ 'aria-label': 'uncontrolled-checkbox' }}
                                onChange={onChange}
                                checked={currentApproval.isChecked}
                            />
                        }
                        label={`${currentApproval.isChecked ? currentApproval.author_name : ''}`}
                    >
                    </FormControlLabel>
                </Grid>
            )
        }

        return list
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
                    </Grid>


                    <Grid item xs={12} style={{ textAlign: 'center' }}>
                        <Button
                            style={{ marginTop: '20px' }}
                            variant="contained"
                            color="primary"
                            type="button"
                            disabled={!currentApproval.isChecked}
                            onClick={() => handleApproval(selectedValue.id, currentApproval)}>
                            OK
                     </Button>
                    </Grid>
                </Grid>

            </Paper>
        </MainModal>
    )
}
