import { postRequest, getRequest, putRequest, deleteRequest } from '../utils/apiHandler';

export const fetchClientsApi = () => getRequest('/api/clients');

const fetchUserAccessTypesApi = () => getRequest('/api/userAccessTypes');

const addUserAccessTypesApi = (data) => postRequest('/api/userAccessTypes', data);

const updateUserAccessTypesApi = (id, data) => putRequest(`/api/userAccessTypes/${id}`, data);

const deleteUserAccessTypesApi = (id) => deleteRequest(`/api/userAccessTypes/${id}`);

export default {
  fetchUserAccessTypesApi,
  addUserAccessTypesApi,
  updateUserAccessTypesApi,
  deleteUserAccessTypesApi
}