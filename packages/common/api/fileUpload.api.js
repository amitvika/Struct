import axios from 'axios';

// const host = `https://cadapi.struct.services/api/v0`;
// const baseURL = process.env.REACT_APP_GLTF_CONVERTER;
const baseURL = `https://cadapi.struct.services`;

const host = `${baseURL}/api/v0`

export const upload3DFile = async (oneFile) => {
    var formData = new FormData();
    formData.append('file', oneFile);
    return axios.post(`${host}/upload/`, formData);
};

export const fetchShapeInfo = async (tree) => {
    var formTree = new FormData();
    formTree.append('tree', JSON.stringify(tree));
    return axios.post(`${host}/shapeinfo/`, formTree);
};

export const getGLTFJson = (id) => {
    const convertURL = `${host}/convert?id=${id}`;
    return axios.get(convertURL);
}

export const getSplitFiles = (id, includeParts, distancegap, anglegap, disectParts, moverotate) => {
    const splitURL = `${host}/split?id=${id}&includeparts=${includeParts}&disectparts=${disectParts}&distancegap=${distancegap}&anglegap=${anglegap}&moverotate=${moverotate}`;
    console.log(splitURL);
    return axios.get(splitURL);
}

export const getHierarchySplitFiles = (id, includeParts, distancegap, anglegap, disectParts, moverotate, edgesize, vertexsize) => {
    const splitURL = `${host}/hsplit?id=${id}&includeparts=${includeParts}&disectparts=${disectParts}&distancegap=${distancegap}&anglegap=${anglegap}&moverotate=${moverotate}&edgesize=${edgesize}&vertexsize=${vertexsize}`;
    console.log(splitURL);
    return axios.get(splitURL);
}

export const getPartsStackableInfo = (id, distancegap, anglegap) => {
    const stackURL = `${host}/stackable?id=${id}&distancegap=${distancegap}&anglegap=${anglegap}`;
    console.log(stackURL);
    return axios.get(stackURL);
}

export const getPartsAssemblyOrder = (id, distancegap, anglegap, explodegap, center) => {
    const orderURL = `${host}/assemblyorder?id=${id}&distancegap=${distancegap}&anglegap=${anglegap}&explodegap=${explodegap}&center=${center}`;
	console.log(orderURL);
    return axios.get(orderURL);
}

export const getMinimumDistance = (xmove, ymove, zmove, xrotate, yrotate, zrotate, moverotate, fname, sname) => {
    const getURL = `${host}/mindistance?moverotate=${moverotate}&xmove=${xmove}&ymove=${ymove}&zmove=${zmove}&xrotate=${xrotate}&yrotate=${yrotate}&zrotate=${zrotate}&fname=${fname ? fname : ""}&sname=${sname ? sname : ""}`;
    console.log(getURL);
    return axios.get(getURL);
}

export const getShapeInfo = (start, stepArray = []) => {
    const getURL = `${host}/shapeinfo?start=${start}&steps=${stepArray}`;
    console.log(getURL);
    return axios.get(getURL);
}

export const getAllTextures = () => {
    const fetchURL = `${host}/textures`;
    return axios.get(fetchURL);
}

export const getAllFiles = () => {
    const fetchURL = `${host}/files`;
    return axios.get(fetchURL);
}

export const getAFileFromStore = (store,ext) => {
    const fetchURL = `${resourcePathURL}${store}.${ext}`;
    console.log(fetchURL);
    return axios.get(fetchURL);
}

export const getGltfForStore = (store) => {
    return getAFileFromStore(store,'gltf');   
}

export const getTreeForStore = (store) => {
    return getAFileFromStore(store,'tree');
}

export const getThumbnailForStoreURL = (store) => {
    return getAFileFromStore(store,'png');
}

export const resourcePathBase = `${baseURL}/`; //"./gltfconverter/";//
export const resourcePathURL = `${baseURL}/Display/`; //http://localhost:8000/Media/`;
