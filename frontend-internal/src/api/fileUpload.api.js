import axios from 'axios';

const host = `http://34.226.233.235:8000/`;
export const upload3DFile = async (data) => {
    return axios.post(`${host}/upload/`, data)
};


export const getGLTFJson = (id) => {
    const convertURL = `${host}/convert?id=${id}`;
    return axios.get(convertURL)
}

export const getSplitFiles = (id) => {
    const splitURL = `${host}/split?id=${id}`;
	console.log(splitURL);
    return axios.get(splitURL)
}

export const resourcePathURL = "./gltfconverter/Display/";// `http://localhost:8000/Media/`;