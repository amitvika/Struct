import { getRequest, postRequest, putRequest, deleteRequest } from '../utils/apiHandler';

const getVendorsApi = (query) => getRequest(`/api/vendor?${query}`);

const getVendorApi = (id) => getRequest(`/api/vendor/${id}`);

const addVendorApi = (data) => postRequest('/api/vendor', data);

const updateVendorApi = (id, data) => putRequest(`/api/vendor/${id}`, data);

const deleteVendorApi = (id) => deleteRequest(`/api/vendor/${id}`);

const upsertVendorApi = (data) => putRequest('/api/vendor', data);


export default {
  getVendorsApi,
  getVendorApi,
  addVendorApi,
  updateVendorApi,
  deleteVendorApi,
  upsertVendorApi
}