import { postRequest, getRequest, putRequest } from '../utils/apiHandler';

const getConfigurationHistory = (id) => getRequest(`/api/changetracking`);


export default {
  getConfigurationHistory
}