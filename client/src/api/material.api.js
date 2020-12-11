import { postRequest, getRequest, putRequest, deleteRequest } from '../utils/apiHandler';

export const fetchMaterialApi = () => getRequest('/api/material');

export default {
  fetchMaterialApi
}