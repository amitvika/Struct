import { postRequest } from '../utils/apiHandler';

const getItemFeatureAPI = (data) => postRequest(`/api/itemFeature`, data);

export default {
  getItemFeatureAPI
};
