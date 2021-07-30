import { postRequest, getRequest, putRequest, deleteRequest, patchRequest } from '../utils/apiHandler';

export const fetchClientsApi = (query) => getRequest(`/api/clients?${query}`);

const upsertClient = (data) => postRequest('/api/clients', data);

const configureSubdomain = (id, data) => patchRequest(`/api/clients/${id}/configure-domain`, data);

export default {
    fetchClientsApi,
    upsertClient,
    configureSubdomain
}