import { postRequest, getRequest, putRequest, deleteRequest } from '../utils/apiHandler';

const fetchTasks = (query) => getRequest(`/api/task?${query}`);

const upsertTask = (data) => postRequest('/api/task', data);

export default {
    fetchTasks,
    upsertTask
}