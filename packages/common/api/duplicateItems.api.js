import { getRequest } from '../utils/apiHandler';

const getItemsAPI = (query) => getRequest(`/api/duplicateItems?${query}`);

export default {
    getItemsAPI
};
