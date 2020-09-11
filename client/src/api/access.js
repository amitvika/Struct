import { postRequest, getRequest } from '../utils/apiHandler';

export const fetchClientsApi = () => getRequest('/api/clients');