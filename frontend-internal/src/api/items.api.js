import { postRequest, getRequest, putRequest, deleteRequest } from '../utils/apiHandler';

const getItemsAPI = (query) => getRequest(`/api/items?${query}`);

const saveItemAPI = (data) => postRequest(`/api/items`, data);

const updateItemAPI = (id, data) => putRequest(`/api/items/${id}`, data);

const deleteItemAPI = (id) => deleteRequest(`/api/items/${id}`);

const getItemsAllAPI = (query) => getRequest(`/api/items/all?${query}`);

const deleteItemGeomtery = (id) => deleteRequest(`/api/items/${id}/three-model`);

const getItemThreejsData = (id) => getRequest(`/api/items/${id}/three-model`);

export default {
  getItemsAPI,
  saveItemAPI,
  updateItemAPI,
  deleteItemAPI,
  getItemsAllAPI,
  deleteItemGeomtery,
	getItemThreejsData
}