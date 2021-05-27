import { postRequest, getRequest, putRequest, deleteRequest } from '../utils/apiHandler';

const fetchProductions = (query) => getRequest(`/api/production?${query}`);

const upsertProduction = (data) => postRequest('/api/production', data);

const approveItemForProduction = (id, data) => putRequest(`/api/production/${id}/approve`, data);

const itemsInProduction = (query) => getRequest(`/api/production/items-in-production?${query}`);

export default {
    fetchProductions,
    upsertProduction,
    approveItemForProduction,
    itemsInProduction
}