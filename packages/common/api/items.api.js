import {
  postRequest,
  getRequest,
  putRequest,
  deleteRequest
} from '../utils/apiHandler';

const getItemsAPI = (query) => getRequest(`/api/items?${query}`);

const updateItemAPI = (id, data) => putRequest(`/api/items/${id}`, data);

const getItemsAllAPI = (query) => getRequest(`/api/items/all?${query}`);

const getItemOrders = (query) => getRequest(`/api/itemOrder?${query}`);

const upsertItemOrder = (data) => postRequest(`/api/itemOrder`, data);

const upsertItems = (data) => postRequest(`/api/items/upsert`, data);

export default {
  getItemsAPI,
  updateItemAPI,
  getItemsAllAPI,
  getItemOrders,
  upsertItemOrder,
  upsertItems
};
