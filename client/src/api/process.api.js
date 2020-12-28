import { getRequest, postRequest, putRequest, deleteRequest } from '../utils/apiHandler';

const getProcessApi = () => getRequest('/api/processes');

const addProcessApi = (data) => postRequest('/api/processes', data);

const deleteProcessApi = (id) => deleteRequest(`/api/processes/${id}`);

const updateProcessData = (id,data) => putRequest(`/api/processdata/${id}`, data);

const getProcessData = (id) => getRequest(`/api/processdata/${id}`);

export default {
  getProcessApi,
  addProcessApi,
  updateProcessData,
  deleteProcessApi,
  getProcessData
}