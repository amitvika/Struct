import { getRequest, postRequest } from '../utils/apiHandler';

const fetchCriteriaUpload = (query) => getRequest(`/api/criteriaUpload?${query}`);

const upsertCriteriaUpload = (data) => postRequest('/api/criteriaUpload', data);

export default {
  fetchCriteriaUpload,
  upsertCriteriaUpload,
}