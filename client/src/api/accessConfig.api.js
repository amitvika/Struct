import { postRequest, getRequest, putRequest } from '../utils/apiHandler';

export const getUserAccessConfiguration = (id) => getRequest(`/api/userAccessConfigurations/${id}`);

export const saveUserAccessConfigurationAPI = (id, data) => putRequest(`/api/userAccessConfigurations/${id}`, data);

export const updateUserAccessConfigurationForUserAPI = (id, data) => putRequest(`/api/userAccessConfigurationUsers/${id}`, data);

export default {
  getUserAccessConfiguration,
  saveUserAccessConfigurationAPI,
  updateUserAccessConfigurationForUserAPI
}