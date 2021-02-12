import { postRequest, getRequest } from '../utils/apiHandler';

export const fetchFactories = () => getRequest('/api/factory');

const upsertFactoryApi = (data) => postRequest(`/api/factory`, data);

export default {
    fetchFactories,
    upsertFactoryApi
}