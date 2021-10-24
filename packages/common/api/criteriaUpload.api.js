import { getRequest, postRequest } from '../utils/apiHandler';

const fetchCriteriaUpload = (query) => getRequest(`/api/criteriaUpload?${query}`);

const upsertCriteriaUpload = (data) => postRequest('/api/criteriaUpload', data);

const getHierarchyStructure = () => getRequest(`/api/criteriaUpload/latest`);

export default {
  fetchCriteriaUpload,
  upsertCriteriaUpload,
  getHierarchyStructure
}