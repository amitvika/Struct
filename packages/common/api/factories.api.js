import { postRequest, getRequest } from '../utils/apiHandler';

export const fetchFactories = (query) => getRequest(`/api/factory?${query}`);

const upsertFactoryApi = (data) => postRequest(`/api/factory`, data);

export default {
    fetchFactories,
    upsertFactoryApi
}