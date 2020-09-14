import { getRequest, postRequest, putRequest, deleteRequest } from '../utils/apiHandler';

const getprocessGroupsApi = () => getRequest('/api/processGroups');

const addprocessGroupsApi = (data) => postRequest('/api/processGroups', data);

const updateprocessGroupsApi = (id,data) => putRequest(`/api/processGroups/${id}`, data);

const deleteprocessGroupsApi = (id) => deleteRequest(`/api/processGroups/${id}`);

export default {
  getprocessGroupsApi,
  addprocessGroupsApi,
  updateprocessGroupsApi,
  deleteprocessGroupsApi
}