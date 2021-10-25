import { getRequest, postRequest } from '../utils/apiHandler';

const fetchCriteriaUpload = (query) => getRequest(`/api/criteriaUpload?${query}`);

const upsertCriteriaUpload = (data) => postRequest('/api/criteriaUpload', data);

const getInternaUseProductConfiguration = () => getRequest(`/api/criteriaUpload/internaUseProductConfiguration`);

export default {
  fetchCriteriaUpload,
  upsertCriteriaUpload,
  getInternaUseProductConfiguration
}