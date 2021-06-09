import { postRequest, getRequest, putRequest } from '../utils/apiHandler';

export const getAssemblyManufactureByItem = (itemId) => getRequest(`/api/assemblyManufacture/item/${itemId}`);

export const upsertAssemblyManufacture = (data) => postRequest(`/api/assemblyManufacture`, data);

export default {
    getAssemblyManufactureByItem,
    upsertAssemblyManufacture
}