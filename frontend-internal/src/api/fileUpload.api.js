import axios from 'axios';

// const host = `https://cadapi.struct.services/api/v0`;
const baseURL = process.env.REACT_APP_GLTF_CONVERTER;
// const baseURL = `https://cadapi.struct.services`

const url = `${baseURL}/api/v0`

export const upload3DFile = async (data) => {
    return axios.post(`${url}/upload/`, data)
};


export const getGLTFJson = (id) => {
    const convertURL = `${url}/convert?id=${id}`;
    return axios.get(convertURL)
}

export const getSplitFiles = (id) => {
    const splitURL = `${url}/split?id=${id}`;
    console.log(splitURL);
    return axios.get(splitURL)
}

export const getHierarchySplitFiles = (id, includeParts, distancegap, anglegap) => {
    const splitURL = `${url}/hsplit?id=${id}&includeparts=${includeParts}&distancegap=${distancegap}&anglegap=${anglegap}`;
    console.log(splitURL);
    return axios.get(splitURL)
}

export const getAllTextures = () => {
    const fetchURL = `${url}/textures`;
    return axios.get(fetchURL)
}

export const getAllFiles = () => {
    const fetchURL = `${url}/files`;
    return axios.get(fetchURL)
}

export const resourcePathBase =  `${baseURL}/`; //"./gltfconverter/";//
export const resourcePathURL = `${baseURL}/Display/`; //http://localhost:8000/Media/`;