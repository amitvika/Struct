import { postRequest, getRequest, putRequest, deleteRequest } from '../utils/apiHandler';

const getItemsAPI = (query) => getRequest(`/api/items?${query}`);

const saveItemAPI = (data) => postRequest(`/api/items`, data);

const updateItemsAPI = (id, data) => putRequest(`/api/items/${id}`, data);

const deleteItemAPI = (id) => deleteRequest(`/api/items/${id}`);

const getItemsAllAPI = (query) => getRequest(`/api/items/all`);

export default {
  getItemsAPI,
  saveItemAPI,
  updateItemsAPI,
  deleteItemAPI,
  getItemsAllAPI
}