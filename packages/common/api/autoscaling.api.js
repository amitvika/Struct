import { postRequest, getRequest, putRequest, deleteRequest } from '../utils/apiHandler';

const fetchAutoscalings = (query) => getRequest(`/api/autoscaling?${query}`);

const upsertAutoscaling = (data) => postRequest('/api/autoscaling', data);

const approveItemForAutoscaling = (id, data) => putRequest(`/api/autoscaling/${id}/approve`, data);

const itemsInAutoscaling = (query) => getRequest(`/api/autoscaling/items-in-autoscaling?${query}`);

export default {
    fetchAutoscalings,
    upsertAutoscaling,
    approveItemForAutoscaling,
    itemsInAutoscaling
}