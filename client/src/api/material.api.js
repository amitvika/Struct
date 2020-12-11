import { postRequest, getRequest, putRequest, deleteRequest } from '../utils/apiHandler';

export const fetchMaterialApi = (query) => getRequest(`/api/material?${query}`);

export default {
  fetchMaterialApi
}