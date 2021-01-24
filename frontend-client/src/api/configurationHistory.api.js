import { postRequest, getRequest, putRequest } from '../utils/apiHandler';

const getConfigurationHistory = (query) => getRequest(`/api/changetracking?${query}`);


export default {
  getConfigurationHistory
}