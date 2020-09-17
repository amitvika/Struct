import { getRequest, postRequest, putRequest, deleteRequest } from '../utils/apiHandler';

const getProcessGroupsApi = () => getRequest('/api/processGroups');

const getProcessGroupsByIdApi = (id) => getRequest(`/api/processgroup/${id}`);

const addProcessGroupsApi = (data) => postRequest('/api/processGroups', data);

const updateProcessGroupsApi = (id, data) => putRequest(`/api/processGroups/${id}`, data);

const deleteProcessGroupsApi = (id) => deleteRequest(`/api/processGroups/${id}`);

const getProcessDataApi = (id) => getRequest(`/api/processdata/${id}`);

const addProcessDataApi = (data) => postRequest(`/api/processdata`, data);

export default {
  getProcessGroupsApi,
  getProcessGroupsByIdApi,
  addProcessGroupsApi,
  updateProcessGroupsApi,
  deleteProcessGroupsApi,
  getProcessDataApi,
  addProcessDataApi
}