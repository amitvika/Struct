import { postRequest, getRequest, putRequest, deleteRequest } from '../utils/apiHandler';

const fetchAccessSetup = (query) => getRequest(`/api/accessSetup?${query}`);

const upsertAccessSetup = (data) => postRequest('/api/accessSetup', data);


export default {
    fetchAccessSetup,
    upsertAccessSetup
}