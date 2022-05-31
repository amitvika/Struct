import { getRequest } from '../utils/apiHandler';

const getItemsAPI = (query) => getRequest(`/api/duplicateChildItems?${query}`);

export default {
    getItemsAPI
};
