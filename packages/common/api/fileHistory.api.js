import { getRequest } from '../utils/apiHandler';

export const fetchFileHistoryApi = (id) => getRequest(`/api/fileHistory/${id}`);