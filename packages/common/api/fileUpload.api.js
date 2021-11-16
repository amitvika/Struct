var XMLHttpRequest = require('xhr2');
import axios from 'axios';
// const host = `https://cadapi.struct.services/api/v0`;
// const baseURL = process.env.REACT_APP_GLTF_CONVERTER;

const baseURL = `https://cadapi.struct.services`;

const host = `${baseURL}/api/v0`;

export const upload3DFile = async (oneFile) => {
  var formData = new FormData();
  formData.append('file', oneFile);
  return axios.post(`${host}/upload/`, formData);
};

export const uploadChunkData = async (formData) => {
  // console.log('Uploading', `${host}/chunkupload/`, formData);
  return axios.post(`${host}/chunkupload/`, formData);
};
export const fetchShapeInfo = async (tree) => {
  var formTree = new FormData();
  formTree.append('tree', JSON.stringify(tree));
  return axios.post(`${host}/shapeinfo/`, formTree);
};

export const saveTreeInfo = async (tree, name, fileGuid) => {
  // console.log(tree);
  var formTree = new FormData();
  formTree.append('tree', JSON.stringify(tree));
  formTree.append('name', name);
  formTree.append('uuid', fileGUID ? fileGUID : '');
  return axios.post(`${host}/savetree/`, formTree);
};

export const saveGDTInfo = async (gdt, name, fileGUID = '') => {
  // console.log(gdt);
  var formGDT = new FormData();
  formGDT.append('gdt', JSON.stringify(gdt));
  formGDT.append('name', name);
  formGDT.append('uuid', fileGUID ? fileGUID : '');
  return axios.post(`${host}/savegdt/`, formGDT);
};

export const getGLTFJson = (id) => {
  const convertURL = `${host}/convert?id=${id}`;
  return axios.get(convertURL);
};

export const getSplitFiles = (
  id,
  includeParts,
  distancegap,
  anglegap,
  disectParts,
  moverotate
) => {
  const splitURL = `${host}/split?id=${id}&includeparts=${includeParts}&disectparts=${disectParts}&distancegap=${distancegap}&anglegap=${anglegap}&moverotate=${moverotate}`;
  // console.log(splitURL);
  return axios.get(splitURL);
};

export const getHierarchySplitFiles = (
  id,
  includeParts,
  distancegap,
  anglegap,
  disectParts,
  moverotate,
  edgesize,
  vertexsize,
  maximumfaces,
  seperateparts,
  createthumb
) => {
  const splitURL = `${host}/hsplit?id=${id}&includeparts=${includeParts}&disectparts=${disectParts}&distancegap=${distancegap}&anglegap=${anglegap}&moverotate=${moverotate}&edgesize=${edgesize}&vertexsize=${vertexsize}&moverotate=${moverotate}&maximumfaces=${maximumfaces}&seperateparts=${seperateparts}&createthumb=${createthumb}`;
  // console.log(splitURL);
  return axios.get(splitURL);
};

export const getPartsStackableInfo = (
  id,
  distancegap,
  anglegap,
  animationtime
) => {
  const stackURL = `${host}/stackable?id=${id}&distancegap=${distancegap}&anglegap=${anglegap}&animationtime=${animationtime}`;
  // console.log(stackURL);
  return axios.get(stackURL);
};

export const getPartsAssemblyOrder = (
  id,
  distancegap,
  anglegap,
  explodegap,
  center,
  holescale,
  removegap,
  animationtime
) => {
  const orderURL = `${host}/assemblyorder?id=${id}&distancegap=${distancegap}&anglegap=${anglegap}&explodegap=${explodegap}&center=${center}&holescale=${holescale}&removegap=${removegap}&animationtime=${animationtime}`;
  // console.log(orderURL);
  return axios.get(orderURL);
};

export const getPartsKinematicOrder = (
  id,
  distancegap,
  anglegap,
  animationtime
) => {
  const kinematicURL = `${host}/kinematicorder?id=${id}&distancegap=${distancegap}&anglegap=${anglegap}&animationtime=${animationtime}`;
  // console.log(kinematicURL);
  return axios.get(kinematicURL);
};

export const getMinimumDistance = (
  xmove,
  ymove,
  zmove,
  xrotate,
  yrotate,
  zrotate,
  moverotate,
  fname,
  sname
) => {
  const getURL = `${host}/mindistance?moverotate=${moverotate}&xmove=${xmove}&ymove=${ymove}&zmove=${zmove}&xrotate=${xrotate}&yrotate=${yrotate}&zrotate=${zrotate}&fname=${
    fname ? fname : ''
  }&sname=${sname ? sname : ''}`;
  // console.log(getURL);
  return axios.get(getURL);
};

export const getShapeInfo = (
  start,
  stepArray = [],
  siblingArray = [],
  partArray = [],
  fileGUID
) => {
  /*  const getURL = `${host}/shapeinfo?start=${start}&steps=${stepArray}&parents=${JSON.stringify({parents:parentArray})}`;
  console.log(getURL);
  return axios.get(getURL); */
  // console.log(start, stepArray, siblingArray);
  var formShapeInfo = new FormData();
  formShapeInfo.append('start', start);
  formShapeInfo.append('steps', JSON.stringify({ steps: stepArray }));
  formShapeInfo.append('siblings', JSON.stringify({ siblings: siblingArray }));
  formShapeInfo.append('parts', JSON.stringify({ parts: partArray }));
  formShapeInfo.append('uuid', fileGUID ? fileGUID : '');
  return axios.post(`${host}/shapeinfo/`, formShapeInfo);
};

export const getAllTextures = () => {
  const fetchURL = `${host}/textures`;
  return axios.get(fetchURL);
};

export const getAllFiles = () => {
  const fetchURL = `${host}/files`;
  return axios.get(fetchURL);
};
export const getAFileFromURLStore = (store, ext, fromURL) => {
  if (ext == 'status' || ext == 'progress') {
    const fetchURL = `${resourceStatusURL}${store}.${ext}`;
    // console.log(fetchURL);
    return axios.get(fetchURL);
  } else {
    const linuxURL = `${fromURL}${store}.${ext}`;
    // console.log(linuxURL);
    return axios.get(linuxURL);
  }
};
export const getAFileFromStore = (store, ext) => {
  if (ext == 'status' || ext == 'progress') {
    const fetchURL = `${resourceStatusURL}${store}.${ext}`;
    // console.log(fetchURL);
    return axios.get(fetchURL);
  } else {
    const linuxURL = `${resourcePathURL}${store}.${ext}`;
    if (isFileExistingInServer(linuxURL)) {
      // console.log(linuxURL);
      return axios.get(linuxURL);
    } else {
      const s3URL = `${resourcePathS3URL}${store}.${ext}`;
      // console.log(s3URL);
      return axios.get(s3URL);
    }
  }
};

export const checkExistingPathFromStore = (
  store,
  ext,
  checkPresence = false,
  checkURL = null
) => {
  if (ext == 'status' || ext == 'progress') {
    return resourceStatusURL;
  } else {
    if (checkURL) {
      const checkingURL = `${checkURL}${store}.${ext}`;
      if (isFileExistingInServer(checkingURL)) {
        return checkURL;
      }
    }
    if (checkURL != resourcePathURL) {
      const linuxURL = `${resourcePathURL}${store}.${ext}`;
      if (isFileExistingInServer(linuxURL)) {
        return resourcePathURL;
      }
    }
    if (checkURL != resourcePathS3URL) {
      const s3URL = `${resourcePathS3URL}${store}.${ext}`;
      if (isFileExistingInServer(s3URL)) {
        return resourcePathS3URL;
      }
    }
    if (checkPresence) {
      return null;
    } else {
      return resourcePathS3URL;
    }
  }
};

export const getGltfForStore = (store) => {
  return getAFileFromStore(store, 'gltf');
};

export const getTreeForStore = (store) => {
  return getAFileFromStore(store, 'tree');
};

export const getThumbnailForStoreURL = (store) => {
  return getAFileFromStore(store, 'png');
};

export const download = (fileStore) => {
  fetch(`${baseURL}/${fileStore}`)
    .then((response) => response.blob())
    .then((blob) => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileStore;
      link.click();
    })
    .catch(console.error);
};

export const isFileExistingInServer = (urlAsFile) => {
  try {
    try {
      var xhr = new XMLHttpRequest();
      try {
        xhr.open('HEAD', urlAsFile, false);
        xhr.send();
        return xhr.status !== 404;
      } catch (exception) {
        // console.log(exception);
        return false;
      }
    } catch (error) {
      // console.log(error);
      return false;
    }
  } catch (error) {
    return false;
  }
};

export const resourcePathBase = `${baseURL}/`; //"./gltfconverter/";//
export const resourcePathURL = `${baseURL}/Display/`;
('//http://localhost:8000/Media/');
export const resourceStatusURL = `${baseURL}/Status/`;
export const resourcePathS3URL = `${baseURL}/S3Display/`; //"./gltfconverter/";//
