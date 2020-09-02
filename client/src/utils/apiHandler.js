import axios from 'axios';
import store from '../store';

export const request = async (server_url, path, data, method) => {
  console.log('---->>>>', store.auth.token)

  return axios({
    method,
    url: `${server_url}${path}`,
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': store.auth.token
    },
    data
  });
};

export const getRequest = (path, data) => request(path, data, 'GET');
export const postRequest = (path, data) => request(path, data, 'POST');
export const patchRequest = (path, data) => request(path, data, 'PATCH');
export const deleteRequest = (path, data) => request(path, data, 'DELETE');
export const putRequest = (path, data) => request(path, data, 'PUT');
