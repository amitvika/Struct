import { getRequest, postRequest, putRequest, deleteRequest } from '../utils/apiHandler';

const getProductDesignApi = () => getRequest('/api/processGroups');

const addProductDesignApi = (data) => postRequest('/api/processGroups', data);

const updateProductDesignApi = (id,data) => putRequest(`/api/processGroups/${id}`, data);

const deleteProductDesignApi = (id) => deleteRequest(`/api/processGroups/${id}`);

export default {
  getProductDesignApi,
  addProductDesignApi,
  updateProductDesignApi,
  deleteProductDesignApi
}