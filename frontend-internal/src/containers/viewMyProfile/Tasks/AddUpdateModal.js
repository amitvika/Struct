import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import {
    Select,
    Input,
    Textarea,
    Headding
} from '../../../components';
import Modal from '../../../components/Modal';
import { useSelector } from 'react-redux'

export default function AddUpdateModal({ title, fields, open, toggleModal, handleUpdate, isEditing, selectedValue }) {
    const [value, setValue] = useState({});
    const teamList = useSelector(state => state.team.teams);
    const [teamSelectOptions, setTeamSelectOptions] = useState([]);
    const [taskSelectOptions, setTaskSelectOptions] = useState([]);
    const [teamMemberSelectOptions, setTeamMemberSelectOptions] = useState([]);

    useEffect(() => {
        if (selectedValue) {
            setValue(selectedValue)
        }
        else {
            setValue({});
        }
    }, [selectedValue]);

    useEffect(() => {
        if (teamList.length > 0) {
            setTeamSelectOptions(getOptions());
        }
    }, [teamList])


    const handleOnChange = (name, value) => {

        setValue(preValue => ({
            ...preValue,
            [name]: value
        }))
    }

    const handleSaveButton = () => {
        if (value) {
            handleUpdate(value)
        }
        toggleModal();
    }

    const getOptions = () => {
        if (teamList) {
            return teamList.map(team => ({ label: team.name, value: team.id }))
        }
        else {
            return []
        }
    }

    return (
        <Modal
            title={`${isEditing ? 'Update' : 'Add'} ${title}`}
            open={open}
            toggleModal={toggleModal}>

            <Grid className="section-padding-left" container spacing={4}>
                <Grid item xs={4}>
                    <Headding bold title={'Name'} />
                </Grid>
                <Grid item xs={8}>
                    <Input
                        placeholder="Enter"
                        type="text"
                        onChange={(event) => handleOnChange('name', event.target.value)}
                        value={value['name']}
                    />
                </Grid>

                <Grid item xs={4}>
                    <Headding bold title={'Assigned Team'} />
                </Grid>
                <Grid item xs={8}>
                    <Select
                        onChange={(data) => handleOnChange('assigned_team', data.value)}
                        options={teamSelectOptions}
                        placeholder={`Select Team`}
                        value={value['assigned_team']} />
                </Grid>

                <Grid item xs={4}>
                    <Headding bold title={'Task'} />
                </Grid>
                <Grid item xs={8}>
                    <Select
                        onChange={(data) => handleOnChange('task', data.value)}
                        options={taskSelectOptions}
                        placeholder={`Select Task`}
                        value={value['task']} />
                </Grid>

                <Grid item xs={4}>
                    <Headding bold title={'Assigned To'} />
                </Grid>
                <Grid item xs={8}>
                    <Select
                        onChange={(data) => handleOnChange('assigned_to', data.value)}
                        options={teamMemberSelectOptions}
                        placeholder={`Select User`}
                        value={value['assigned_to']} />
                </Grid>

                <Grid item xs={4}>
                    <Headding bold title={'Created Team'} />
                </Grid>
                <Grid item xs={8}>
                    <Select
                        onChange={(data) => handleOnChange('created_team', data.value)}
                        options={teamSelectOptions}
                        placeholder={`Select Team`}
                        value={value['created_team']} />
                </Grid>

                <Grid item xs={6}>
                    <Button variant="contained" color="secondary" onClick={toggleModal}>
                        Cancel
                            </Button>
                </Grid>
                <Grid item xs={6}>
                    <Button variant="contained" color="primary" onClick={handleSaveButton}>
                        {isEditing ? 'Update' : 'Save'}
                    </Button>
                </Grid>
            </Grid>

        </Modal>
    );
}
