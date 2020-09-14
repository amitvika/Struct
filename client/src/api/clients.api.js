import { postRequest, getRequest, putRequest, deleteRequest } from '../utils/apiHandler';

export const fetchClientsApi = () => getRequest('/api/clients');

const addClientApi = (data) => postRequest('/api/clients', data);

const updateClientApi = (id, data) => putRequest(`/api/clients/${id}`, data);

const deleteClientApi = (id) => deleteRequest(`/api/clients/${id}`);

export default {
  fetchClientsApi,
  addClientApi,
  updateClientApi,
  deleteClientApi
}