import { postRequest, getRequest, putRequest, deleteRequest } from '../utils/apiHandler';

const fetchTeamTask = (query) => getRequest(`/api/teamTask?${query}`);

const fetchMyTeamTask = (query) => getRequest(`/api/teamTask/my-teams`);

const upsertTeamTask = (data) => postRequest('/api/teamTask', data);

export default {
    fetchTeamTask,
    upsertTeamTask,
    fetchMyTeamTask,
}