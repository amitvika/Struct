import { postRequest, getRequest, putRequest, deleteRequest } from '../utils/apiHandler';

const fetchAssemblyProcessApi = (id) => getRequest(`/api/assemblyProcess/${id}`);

const addAssemblyProcessApi = (data) => postRequest('/api/assemblyProcess', data);

const updateAssemblyProcessApi = (id, data) => putRequest(`/api/assemblyProcess/${id}`, data);

const deleteAssemblyProcessApi = (id) => deleteRequest(`/api/assemblyProcess/${id}`);

export default {
  fetchAssemblyProcessApi,
  addAssemblyProcessApi,
  updateAssemblyProcessApi,
  deleteAssemblyProcessApi
}