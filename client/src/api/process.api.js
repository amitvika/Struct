import { getRequest, postRequest, putRequest, deleteRequest } from '../utils/apiHandler';

const getProcessApi = () => getRequest('/api/processes');

const addProcessApi = (data) => postRequest('/api/processes', data);

const updateProcessApi = (id,data) => putRequest(`/api/processes/${id}`, data);

const deleteProcessApi = (id) => deleteRequest(`/api/processes/${id}`);

export default {
  getProcessApi,
  addProcessApi,
  updateProcessApi,
  deleteProcessApi
}