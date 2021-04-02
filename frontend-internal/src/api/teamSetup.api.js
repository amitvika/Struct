import { postRequest, getRequest, putRequest, deleteRequest } from '../utils/apiHandler';

const fetchTeams = (query) => getRequest(`/api/team?${query}`);

const upsertTeam = (data) => postRequest('/api/team', data);

const fetchUsers = () => getRequest(`/api/team/users`);

const fetchTeamTask = (query) => getRequest(`/api/teamTask?${query}`);

const upsertTeamTask = (data) => postRequest('/api/teamTask', data);


export default {
    fetchTeams,
    upsertTeam,
    fetchUsers,
    fetchTeamTask,
    upsertTeamTask
}