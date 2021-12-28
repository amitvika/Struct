import { getRequest, postRequest } from '../utils/apiHandler';

const fetchProductDesigns = (query) =>
  getRequest(`/api/productDesign?${query}`);

const upsertProductDesign = (data) => postRequest('/api/productDesign', data);

export default {
  fetchProductDesigns,
  upsertProductDesign
};
