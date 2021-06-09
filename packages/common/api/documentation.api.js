import { postRequest, getRequest, putRequest, deleteRequest } from '../utils/apiHandler';

const fetchDocumentations = (query) => getRequest(`/api/documentation?${query}`);

const upsertDocumentation = (data) => postRequest('/api/documentation', data);

export default {
    fetchDocumentations,
    upsertDocumentation
}