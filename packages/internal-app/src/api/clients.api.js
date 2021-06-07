import { postRequest, getRequest, putRequest, deleteRequest, patchRequest } from '../utils/apiHandler';

export const fetchClientsApi = (query) => getRequest(`/api/clients?${query}`);

const upsertClient = (data) => postRequest('/api/clients', data);

// const fetchClientApi = (id) => getRequest(`/api/clients/${id}`);

// const addClientApi = (data) => postRequest('/api/clients', data);

// const updateClientApi = (id, data) => putRequest(`/api/clients/${id}`, data);

const configureSubdomain = (id, data) => patchRequest(`/api/clients/${id}/configure-domain`, data);

// const deleteClientApi = (id) => deleteRequest(`/api/clients/${id}`);

export default {
    fetchClientsApi,
    upsertClient,
    //   fetchClientApi,
    //   addClientApi,
    //   updateClientApi,
    //   deleteClientApi,
    configureSubdomain
}