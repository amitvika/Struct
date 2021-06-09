import { getRequest, postRequest, putRequest, deleteRequest } from '../utils/apiHandler';
import axios, { post } from 'axios';

const getProcessGroupsApi = () => getRequest('/api/processGroups');

const getProcessGroupsByIdApi = (id) => getRequest(`/api/processgroup/${id}`);

const addProcessGroupsApi = (data) => postRequest('/api/processGroups', data);

const updateProcessGroupsApi = (id, data) => putRequest(`/api/processGroups/${id}`, data);

const deleteProcessGroupsApi = (id) => deleteRequest(`/api/processGroups/${id}`);

const getProcessDataListApi = (id) => getRequest(`/api/processdata/${id}/all`);

const addProcessDataApi = (data) => postRequest(`/api/processdata`, data);

const deleteProcessDataApi = (id) => deleteRequest(`/api/processdata/${id}`);

const uploadStepfile = (data) => {

  const url = '/api/step-file';
  const config = {
    headers: {
      'content-type': 'multipart/form-data',
    }
  }

  return axios.post(url, data)
}

export default {
  getProcessGroupsApi,
  getProcessGroupsByIdApi,
  addProcessGroupsApi,
  updateProcessGroupsApi,
  deleteProcessGroupsApi,
  getProcessDataListApi,
  addProcessDataApi,
  uploadStepfile,
  deleteProcessDataApi
}