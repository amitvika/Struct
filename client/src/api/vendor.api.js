import { getRequest, postRequest, putRequest, deleteRequest } from '../utils/apiHandler';

const getVendorApi = (query) => getRequest(`/api/vendor?${query}`);

const addVendorApi = (data) => postRequest('/api/vendor', data);

const updateVendorApi = (id, data) => putRequest(`/api/vendor/${id}`, data);

const deleteVendorApi = (id) => deleteRequest(`/api/vendor/${id}`);

export default {
  getVendorApi,
  addVendorApi,
  updateVendorApi,
  deleteVendorApi
}