import { postRequest, getRequest, putRequest, deleteRequest } from '../utils/apiHandler';

const fetchProductions = (query) => getRequest(`/api/production?${query}`);

const upsertProduction = (data) => postRequest('/api/production', data);

export default {
    fetchProductions,
    upsertProduction
}