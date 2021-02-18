import axios from '../utils/axios';
import get from 'lodash/get';

export const request = async (path, data, method) => {
  const token = localStorage.getItem("token");

  return axios({
    method,
    url: `${process.env.REACT_APP_API}${path}`,
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': token,
      "Access-Control-Allow-Origin": "*"
    },
    data
  })
    .catch(error => {
      const status = get(error, 'response.status');

      if (status === 401 && path !== '/api/auth/user') {
        window.localStorage.clear('token');
        window.location = '/';
      }
    })
};

export const getRequest = (path, data) => request(path, data, 'GET');
export const postRequest = (path, data) => request(path, data, 'POST');
export const patchRequest = (path, data) => request(path, data, 'PATCH');
export const deleteRequest = (path, data) => request(path, data, 'DELETE');
export const putRequest = (path, data) => request(path, data, 'PUT');
