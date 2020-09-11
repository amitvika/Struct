import { postRequest, getRequest } from '../utils/apiHandler';

export const getUserAccessConfiguration = (id) => getRequest(`/api/userAccessConfigurations/${id}`);
