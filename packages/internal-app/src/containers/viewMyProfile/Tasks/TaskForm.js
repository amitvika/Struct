import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import {
  Select,
  Input,
  Textarea,
  Headding,
} from '@monostruct/common/components';
import { useSelector } from 'react-redux';
import TeamTaskSetup from '@monostruct/common/api/teamTask.api';

export default function TaskForm({
  handleUpdate,
  selectedValue,
  toggleModal,
  isEditing,
}) {
  const [value, setValue] = useState({});
  const teamList = useSelector((state) => state.team.teams);
  const [teamSelectOptions, setTeamSelectOptions] = useState([]);
  const [taskSelectOptions, setTaskSelectOptions] = useState([]);
  const [teamMemberSelectOptions, setTeamMemberSelectOptions] = useState([]);

  useEffect(() => {
    if (selectedValue) {
      setValue(selectedValue);
    } else {
      setValue({});
    }
  }, [selectedValue]);

  useEffect(() => {
    if (teamList.length > 0) {
      setTeamSelectOptions(getOptions(teamList));

      if (selectedValue.assigned_team) {
        handleAssignedTeam(selectedValue.assigned_team);
      }
    }
  }, [teamList]);

  const handleOnChange = (name, value) => {
    setValue((preValue) => ({
      ...preValue,
      [name]: value,
    }));

    if (name === 'assigned_team') {
      handleAssignedTeam(value);
    }
  };

  const handleAssignedTeam = (teamId) => {
    TeamTaskSetup.fetchTeamTask(`teamId=${teamId}`)
      .then((res) => {
        setTaskSelectOptions(getOptions(res.data));
      })
      .catch((err) => {
        setTaskSelectOptions([]);
      });

    //set team Members
    const selectedTeam = teamList.find((team) => team.id === teamId);
    setTeamMemberSelectOptions(getOptions(selectedTeam.members));
  };

  const handleSaveButton = () => {
    if (value) {
      handleUpdate(value);
    }
    toggleModal();
  };

  const getOptions = (list) => {
    if (list) {
      return list.map((item) => ({ label: item.name, value: item.id }));
    } else {
      return [];
    }
  };

  return (
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
          value={value['assigned_team']}
        />
      </Grid>

      <Grid item xs={4}>
        <Headding bold title={'Task'} />
      </Grid>
      <Grid item xs={8}>
        <Select
          onChange={(data) => handleOnChange('team_task', data.value)}
          options={taskSelectOptions}
          placeholder={`Select Task`}
          value={value['team_task']}
        />
      </Grid>

      <Grid item xs={4}>
        <Headding bold title={'Assigned To'} />
      </Grid>
      <Grid item xs={8}>
        <Select
          onChange={(data) => handleOnChange('assigned_to', data.value)}
          options={teamMemberSelectOptions}
          placeholder={`Select User`}
          value={value['assigned_to']}
        />
      </Grid>

      <Grid item xs={4}>
        <Headding bold title={'Created Team'} />
      </Grid>
      <Grid item xs={8}>
        <Select
          onChange={(data) => handleOnChange('created_team', data.value)}
          options={teamSelectOptions}
          placeholder={`Select Team`}
          value={value['created_team']}
        />
      </Grid>

      {isEditing && (
        <>
          <Grid item xs={4}>
            <Headding bold title={'Description'} />
          </Grid>
          <Grid item xs={8}>
            <Input
              placeholder="Enter"
              type="text"
              onChange={(event) =>
                handleOnChange('description', event.target.value)
              }
              value={value['description']}
            />
          </Grid>

          <Grid item xs={4}>
            <Headding bold title={'Attach File(s)'} />
          </Grid>
          <Grid item xs={8}>
            {/* <Input
                                placeholder="Enter"
                                type="text"
                                onChange={(event) => handleOnChange('description', event.target.value)}
                                value={value['description']}
                            /> */}
          </Grid>
        </>
      )}

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
  );
}
