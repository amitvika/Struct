import axios from 'axios';

const host = `http://localhost:8000/api/v0`;
export const upload3DFile = async (data) => {
    return axios.post(`${host}/upload/`, data)
};


export const getGLTFJson = (id) => {
    const convertURL = `${host}/convert?id=${id}`;
    return axios.get(convertURL)
}

export const resourcePathURL = `http://localhost:8000/Display/`;