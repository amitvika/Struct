import { postRequest, getRequest, putRequest, deleteRequest } from '../utils/apiHandler';

const fetchTeams = (query) => getRequest(`/api/team?${query}`);

const upsertTeam = (data) => postRequest('/api/team', data);

export default {
    fetchTeams,
    upsertTeam
}