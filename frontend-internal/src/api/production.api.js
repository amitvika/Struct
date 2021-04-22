import { postRequest, getRequest, putRequest, deleteRequest } from '../utils/apiHandler';

const fetchProductions = (query) => getRequest(`/api/production?${query}`);

const upsertProduction = (data) => postRequest('/api/production', data);

const approveItemForProduction = (data) => putRequest(`/api/production/approve`, data);

export default {
    fetchProductions,
    upsertProduction,
    approveItemForProduction
}