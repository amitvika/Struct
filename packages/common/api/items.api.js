import { postRequest, getRequest, putRequest, deleteRequest } from '../utils/apiHandler';

const getItemsAPI = (query) => getRequest(`/api/items?${query}`);

const addItemApi = (data) => postRequest(`/api/items`, data);

const saveItemAPI = (data) => postRequest(`/api/items`, data);

const updateItemAPI = (id, data) => putRequest(`/api/items/${id}`, data);

const deleteItemAPI = (id) => deleteRequest(`/api/items/${id}`);

const getItemsAllAPI = (query) => getRequest(`/api/items/all?${query}`);

const deleteItemGeomtery = (id) => deleteRequest(`/api/items/${id}/three-model`);

const getItemThreejsData = (id) => getRequest(`/api/items/${id}/three-model`);

const getItemOrders = (query) => getRequest(`/api/items/order?${query}`);

const upsertItemOrder = (data) => postRequest(`/api/items/order`, data);

export default {
  getItemsAPI,
  addItemApi,
  saveItemAPI,
  updateItemAPI,
  deleteItemAPI,
  getItemsAllAPI,
  deleteItemGeomtery,
  getItemThreejsData,
  getItemOrders,
  upsertItemOrder
}