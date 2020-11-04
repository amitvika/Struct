import { postRequest, getRequest, putRequest, deleteRequest } from '../utils/apiHandler';

const getItemsAPI = (query) => getRequest(`/api/items?${query}`);

const saveItemAPI = (data) => postRequest(`/api/items`, data);

const updateItemsAPI = (id, data) => putRequest(`/api/items/${id}`, data);

const getItemAPI = (id) => getRequest(`/api/items/${id}`);

const deleteItemAPI = (id) => deleteRequest(`/api/items/${id}`);

const getItemsAllAPI = (query) => getRequest(`/api/items/all`);

const getItemGeomtery = (id) => getRequest(`/api/items/${id}/geomtery`);

const updateItemGeomtery = (id, data) => putRequest(`/api/items/${id}/geomtery`,data);

const deleteItemGeomtery = (id) => deleteRequest(`/api/items/${id}/geomtery`);


export default {
  getItemsAPI,
  getItemAPI,
  saveItemAPI,
  updateItemsAPI,
  deleteItemAPI,
  getItemsAllAPI,
  getItemGeomtery,
  deleteItemGeomtery,
  updateItemGeomtery
}