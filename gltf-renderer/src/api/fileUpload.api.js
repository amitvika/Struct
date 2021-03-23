import axios from 'axios';

const host = `http://localhost:8000/api/v0`;
export const upload3DFile = async (data) => {
    return axios.post(`${host}/upload/`, data)
};


export const getGLTFJson = (id) => {
    const convertURL = `${host}/convert?id=${id}`;
    return axios.get(convertURL)
}

export const getSplitFiles = (id, includeParts, distancegap, anglegap, disectParts) => {
    const splitURL = `${host}/split?id=${id}&includeparts=${includeParts}&distancegap=${distancegap}&anglegap=${anglegap}&disectparts=${disectParts}`;
	console.log(splitURL);
    return axios.get(splitURL)
}

export const getHierarchySplitFiles = (id, includeParts, distancegap, anglegap, disectParts) => {
    const splitURL = `${host}/hsplit?id=${id}&includeparts=${includeParts}&distancegap=${distancegap}&anglegap=${anglegap}&disectparts=${disectParts}`;
	console.log(splitURL);
    return axios.get(splitURL)
}

export const getAllTextures = () => {
    const fetchURL = `${host}/textures`;
    return axios.get(fetchURL)
}

export const getAllFiles = () => {
    const fetchURL = `${host}/files`;
    return axios.get(fetchURL)
}

export const resourcePathBase =  `http://localhost:8000/`; //"./gltfconverter/";//
export const resourcePathURL = resourcePathBase+"Display/";// `http://localhost:8000/Media/`;