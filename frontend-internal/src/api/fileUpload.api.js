import axios from 'axios';

// const host = `https://cadapi.struct.services/api/v0`;
const baseURL = process.env.REACT_APP_GLTF_CONVERTER;
// const baseURL = `https://cadapi.struct.services`

const url = `${baseURL}/api/v0`

export const upload3DFile = async (data) => {
	//console.log(`${url}/upload/`, data);
    return axios.post(`${url}/upload/`, data)
};

export const fetchShapeInfo = async (tree) => {
    var formTree = new FormData();
    formTree.append('tree', JSON.stringify(tree));   
    //console.log(`${url}/shapeinfo/`, formTree);
    return axios.post(`${url}/shapeinfo/`, formTree);
};

export const getGLTFJson = (id) => {
    const convertURL = `${url}/convert?id=${id}`;
    console.log(convertURL);
    return axios.get(convertURL);
}

export const getSplitFiles = (id, includeParts, distancegap, anglegap, disectParts, moverotate) => {
    const splitURL = `${url}/split?id=${id}&includeparts=${includeParts}&disectparts=${disectParts}&distancegap=${distancegap}&anglegap=${anglegap}&moverotate=${moverotate}`;
	console.log(splitURL);
    return axios.get(splitURL);
}

export const getHierarchySplitFiles = (id, includeParts=false, distancegap=0.1, anglegap=0.5, disectParts=false, moverotate=0, edgesize=0, vertexsize=0) => {
    const splitURL = `${url}/hsplit?id=${id}&includeparts=${includeParts}&disectparts=${disectParts}&distancegap=${distancegap}&anglegap=${anglegap}&moverotate=${moverotate}&edgesize=${edgesize}&vertexsize=${vertexsize}`;
    console.log(splitURL);
    return axios.get(splitURL);
}

export const getPartsStackableInfo = (id, distancegap, anglegap) => {
    const stackURL = `${url}/stackable?id=${id}&distancegap=${distancegap}&anglegap=${anglegap}`;
	console.log(stackURL);
    return axios.get(stackURL);
}

export const getMinimumDistance = (xmove, ymove, zmove, xrotate, yrotate, zrotate, moverotate,fname,sname) => {
    const getURL = `${url}/mindistance?moverotate=${moverotate}&xmove=${xmove}&ymove=${ymove}&zmove=${zmove}&xrotate=${xrotate}&yrotate=${yrotate}&zrotate=${zrotate}&fname=${fname?fname:""}&sname=${sname?sname:""}`;
    console.log(getURL);
    return axios.get(getURL);
}

export const getShapeInfo = (fname) => {
    const getURL = `${url}/shapeinfo?fname=${fname?fname:""}`;
    console.log(getURL);
    return axios.get(getURL);
}

export const getAllTextures = () => {
    const fetchURL = `${url}/textures`;
    return axios.get(fetchURL);
}

export const getAllFiles = () => {
    const fetchURL = `${url}/files`;
    return axios.get(fetchURL);
}

export const resourcePathBase =  `${baseURL}/`; //"./gltfconverter/";//
export const resourcePathURL = `${baseURL}/Display/`; //http://localhost:8000/Media/`;