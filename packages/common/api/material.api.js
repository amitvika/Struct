import { postRequest, getRequest, putRequest, deleteRequest } from '../utils/apiHandler';

export const fetchMaterialApi = (query) => getRequest(`/api/material?${query}`);
export const fetchCategories = (query) => getRequest(`/api/material/category?${query}`);

export const fetchMaterialHierarchy  = (material) => getRequest(`/api/material/get-hierarchy/${material}`);

export default {
  fetchMaterialApi,
  fetchCategories,
  fetchMaterialHierarchy
}