import { postRequest, getRequest, putRequest, deleteRequest } from '../utils/apiHandler';

const fetchTeams = (query) => getRequest(`/api/team?${query}`);

const fetchMyTeams = (query) => getRequest(`/api/team/my`);

const upsertTeam = (data) => postRequest('/api/team', data);

const fetchUsers = () => getRequest(`/api/team/users`);

const assignAccessRoleToTeams = (data) => putRequest('/api/team/access-role', data);

export default {
    fetchTeams,
    fetchMyTeams,
    upsertTeam,
    fetchUsers,
    assignAccessRoleToTeams
}