import { postRequest, getRequest, putRequest, deleteRequest } from '../utils/apiHandler';

const fetchTeams = (query) => getRequest(`/api/team?${query}`);

const upsertTeam = (data) => postRequest('/api/team', data);

const fetchUsers = () => getRequest(`/api/team/users`)

export default {
    fetchTeams,
    upsertTeam,
    fetchUsers
}