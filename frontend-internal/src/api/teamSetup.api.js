import { postRequest, getRequest, putRequest, deleteRequest } from '../utils/apiHandler';

const fetchTeams = (query) => getRequest(`/api/team?${query}`);

const fetchMyTeams = (query) => getRequest(`/api/team/my`);

const upsertTeam = (data) => postRequest('/api/team', data);

const fetchUsers = () => getRequest(`/api/team/users`);

const assignAccessRoleToTeams = (data) => putRequest('/api/team/access-role', data);

const fetchTeamTask = (query) => getRequest(`/api/teamTask?${query}`);

const fetchMyTeamTask = (query) => getRequest(`/api/teamTask/my-teams`);

const upsertTeamTask = (data) => postRequest('/api/teamTask', data);

export default {
    fetchTeams,
    fetchMyTeams,
    upsertTeam,
    fetchUsers,
    fetchTeamTask,
    upsertTeamTask,
    fetchMyTeamTask,
    assignAccessRoleToTeams
}