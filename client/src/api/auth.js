import { postRequest, getRequest } from '../utils/apiHandler';

export const loginApi = (data) => postRequest('/api/auth', data);

export const registrationApi = (data) => postRequest('/api/users', data);

export const loadUserApi = () => getRequest('api/auth/user') 