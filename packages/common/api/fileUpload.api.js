var XMLHttpRequest = require('xhr2');
import axios from 'axios';
import CircularJSON from '../gltf/CircularJson';

// const host = `https://cadapi.struct.services/api/v0`;

let baseURL = process.env.REACT_APP_GLTF_CONVERTER;

baseURL = `https://cadapi.struct.services`;

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

const stringify = (jsonStructure) => {
  try {
    const jsonString = JSON.stringify(jsonStructure);
    return jsonString;
  } catch (error) {
    console.log('Error in Json String Conversion', error);
    try {
      const circularString = CircularJSON.CircularJSON.stringify(jsonStructure);
      return circularString;
    } catch (error) {
      console.log('Error in Json String Circular Conversion', error);
      return jsonStructure;
    }
  }
};
export const fetchShapeInfo = async (tree) => {
  var formTree = new FormData();
  formTree.append('tree', stringify(tree));
  return axios.post(`${host}/shapeinfo/`, formTree);
};

export const saveTreeInfo = async (tree, name, fileGUID) => {
  // console.log(tree);
  var formTree = new FormData();
  formTree.append('tree', stringify(tree));
  formTree.append('name', name);
  formTree.append('uuid', fileGUID || '');
  return axios.post(`${host}/savetree/`, formTree);
};

export const saveGDTInfo = async (gdt, name, fileGUID = '') => {
  // console.log(gdt);
  var formGDT = new FormData();
  formGDT.append('gdt', stringify(gdt));
  formGDT.append('name', name);
  formGDT.append('uuid', fileGUID || '');
  return axios.post(`${host}/savegdt/`, formGDT);
};

export const getGLTFJson = async (id) => {
  const convertURL = `${host}/convert?id=${id}`;
  return axios.get(convertURL);
};

export const getSplitFiles = async (
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

export const getHierarchySplitFiles = async (
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
  createthumb,
  CreateChildSteps = true,
  CreateAssemblyOrder = false,
  CreateStackability = false,
  explodegap = 10.0,
  holescale = 0.77,
  removegap = 8.0,
  center = true,
  animationtime = 1.0,
  createchilds = false
) => {
  const additionalparams = `&CreateChildSteps=${CreateChildSteps}&CreateAssemblyOrder=${CreateAssemblyOrder}&CreateStackability=${CreateStackability}&explodegap=${explodegap}&holescale=${holescale}&removegap=${removegap}&center=${center}&animationtime=${animationtime}&createchilds=${createchilds}`;
  const splitURL = `${host}/hsplit?id=${id}&includeparts=${includeParts}&disectparts=${disectParts}&distancegap=${distancegap}&anglegap=${anglegap}&moverotate=${moverotate}&edgesize=${edgesize}&vertexsize=${vertexsize}&moverotate=${moverotate}&maximumfaces=${maximumfaces}&seperateparts=${seperateparts}&createthumb=${createthumb}${additionalparams}`;
  // console.log(splitURL);
  return axios.get(splitURL);
};

export const getPartsStackableInfo = async (
  id,
  distancegap,
  anglegap,
  animationtime
) => {
  const stackURL = `${host}/stackable?id=${id}&distancegap=${distancegap}&anglegap=${anglegap}&animationtime=${animationtime}`;
  // console.log(stackURL);
  return axios.get(stackURL);
};

export const getPartsAssemblyOrder = async (
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

export const getPartsKinematicOrder = async (
  id,
  distancegap,
  anglegap,
  animationtime
) => {
  const kinematicURL = `${host}/kinematicorder?id=${id}&distancegap=${distancegap}&anglegap=${anglegap}&animationtime=${animationtime}`;
  // console.log(kinematicURL);
  return axios.get(kinematicURL);
};
export const getPartsKinematicMovement = async (
  id,
  distancegap,
  anglegap,
  animationtime,
  kinematicItemList
) => {
  var formInfo = new FormData();
  formInfo.append('id', id);
  formInfo.append('distancegap', distancegap);
  formInfo.append('anglegap', anglegap);
  formInfo.append('animationtime', animationtime);
  formInfo.append('parts', stringify({ parts: kinematicItemList }));
  return axios.post(`${host}/kinematicmove/`, formInfo);

  /*  const kinematicURL = `${host}/kinematicmove?id=${id}&distancegap=${distancegap}&anglegap=${anglegap}&animationtime=${animationtime}`;
  // console.log(kinematicURL);
  return axios.get(kinematicURL); */
};

export const getMinimumDistance = async (
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
    fname || ''
  }&sname=${sname || ''}`;
  // console.log(getURL);
  return axios.get(getURL);
};

export const getShapeInfo = async (
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
  formShapeInfo.append('steps', stringify({ steps: stepArray }));
  formShapeInfo.append('siblings', stringify({ siblings: siblingArray }));
  formShapeInfo.append('parts', stringify({ parts: partArray }));
  formShapeInfo.append('uuid', fileGUID || '');
  return axios.post(`${host}/shapeinfo/`, formShapeInfo);
};

export const getAllTextures = async () => {
  const fetchURL = `${host}/textures`;
  return axios.get(fetchURL);
};

export const getAllFiles = async () => {
  const fetchURL = `${host}/files`;
  return axios.get(fetchURL);
};
export const getAFile = async (file) => {
  const fetchURL = `${host}/getcontent?file=${file}`;
  // console.log(fetchURL);
  return axios.get(fetchURL);
};
export const fetchAFile = async (file, path) => {
  const fetchURL = `${host}/fetchcontent?file=${file}&path=${path || ''}`;
  // console.log(fetchURL);
  return axios.get(fetchURL);
};
export const getAFileFromURLStore = async (store, ext, fromURL) => {
  if (ext == 'status' || ext == 'progress') {
    const fetchURL = `${resourcePathStatus}${store}.${ext}`;
    // console.log(fetchURL);
    return getAFile(fetchURL);
  } else {
    const availURL = await getExistingPathFromServer(store, ext);
    let fetchURL = `${
      availURL ? availURL : fromURL ? fromURL : ''
    }${store}.${ext}`;
    try {
      const resData = await axios.get(fetchURL);
      if (resData) return resData;
    } catch (error) {
      console.log('Error while fetching 1', error, fetchURL);
    }
    if (availURL != fromURL && availURL != null && fromURL != null) {
      const linuxURL = `${fromURL}${store}.${ext}`;
      let isFileExists = await isFileExistingInServer(linuxURL);
      if (isFileExists) {
        try {
          const resData = await axios.get(linuxURL);
          if (resData) return resData;
        } catch (error) {
          console.log('Error while fetching 2', error, linuxURL);
        }
      }
    }
    fetchURL = `${
      availURL == resourcePathDisplay ? resourcePathS3 : resourcePathDisplay
    }${store}.${ext}`;
    console.log('Getting file from', fetchURL);
    return getAFile(fetchURL);
  }
};
export const getAFileFromPathStore = async (store, ext, fromPath) => {
  if (ext == 'status' || ext == 'progress') {
    const fetchURL = `${resourcePathStatus}${store}.${ext}`;
    // console.log(fetchURL);
    return getAFile(fetchURL);
  } else {
    const fetchURL = `${fromPath}${store}.${ext}`;
    return getAFile(fetchURL);
  }
};

export const getExistingURLPath = async (store, ext) => {
  const fetchURL = `${host}/checkexists?file=${store}.${ext}`;
  return axios.get(fetchURL);
};

export const getExistingPathFromServer = async (store, ext) => {
  const fetchURL = `${host}/checkexists?file=${store}.${ext}`;
  try {
    const resdata = await axios.get(fetchURL);
    if (resdata && resdata.data) {
      if (resdata.data.path == 'Linux') {
        return resourcePathURL;
      }
      if (resdata.data.path == 'S3') {
        return resourcePathS3URL;
      }
      return '';
    }
    return null;
  } catch (error) {
    console.log('Error while fetching', error, fetchURL);
    return null;
  }
};

export const getAFileFromStore = async (store, ext) => {
  if (ext == 'status' || ext == 'progress') {
    // const fetchURL = `${resourceStatusURL}${store}.${ext}`;
    const fetchURL = `${resourcePathStatus}${store}.${ext}`;
    // console.log(fetchURL);
    return getAFile(fetchURL);
    // console.log(fetchURL);
    //return axios.get(fetchURL);
  } else {
    const availURL = await getExistingPathFromServer(store, ext);
    let fetchURL = `${availURL ? availURL : resourcePathURL}${store}.${ext}`;
    if (availURL != null) {
      try {
        const resData = await axios.get(fetchURL);
        if (resData) return resData;
      } catch (error) {
        console.log('Error while fetching 1', error, fetchURL);
      }
    }
    if (availURL != resourcePathURL && availURL != null) {
      const linuxURL = `${resourcePathURL}${store}.${ext}`;
      let isFileExists = await isFileExistingInServer(linuxURL);
      if (isFileExists) {
        try {
          const resData = await axios.get(linuxURL);
          if (resData) return resData;
        } catch (error) {
          console.log('Error while fetching 2', error, linuxURL);
        }
      }
    }
    if (availURL != resourcePathS3URL && availURL != null) {
      const linuxURL = `${resourcePathS3URL}${store}.${ext}`;
      let isFileExists = await isFileExistingInServer(linuxURL);
      if (isFileExists) {
        try {
          const resData = await axios.get(linuxURL);
          if (resData) return resData;
        } catch (error) {
          console.log('Error while fetching 3', error, linuxURL);
        }
      }
    }
    fetchURL = `${
      availURL == resourcePathDisplay ? resourcePathS3 : resourcePathDisplay
    }${store}.${ext}`;
    console.log('Getting file from', fetchURL);
    return getAFile(fetchURL);
  }
};

export const checkExistingPathFromStore = async (
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
      let isFileExists = await isFileExistingInServer(checkingURL);
      if (isFileExists) {
        return checkURL;
      }
    }
    const availURL = await getExistingPathFromServer(store, ext);
    if (availURL) {
      return availURL;
    } else {
      if (checkPresence) {
        return null;
      } else {
        return resourcePathS3URL;
      }
    }

    /* if (checkURL != resourcePathURL) {
      const linuxURL = `${resourcePathURL}${store}.${ext}`;
      let isFileExists = await isFileExistingInServer(linuxURL);
      if (isFileExists) {
        return resourcePathURL;
      }
    }
    if (checkURL != resourcePathS3URL) {
      const s3URL = `${resourcePathS3URL}${store}.${ext}`;
      let isFileExists = await isFileExistingInServer(s3URL);
      if (isFileExists) {
        return resourcePathS3URL;
      }
    }
    if (checkPresence) {
      return null;
    } else {
      return resourcePathS3URL;
    } */
  }
};

export const getGltfForStore = async (store) => {
  return getAFileFromStore(store, 'gltf');
};

export const getTreeForStore = async (store) => {
  return getAFileFromStore(store, 'tree');
};

export const getThumbnailForStoreURL = async (store) => {
  return getAFileFromStore(store, 'png');
};

export const download = ({ downloadURL, fileName }) => {
  fetch(`${baseURL}/${downloadURL}`)
    .then((response) => response.blob())
    .then((blob) => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
    })
    .catch(console.error);
};

const checkURLExists = async (url) => {
  // Create the XHR request
  var request = new XMLHttpRequest();

  // Return it as a Promise
  return new Promise(function (resolve, reject) {
    // Setup our listener to process compeleted requests
    request.onreadystatechange = function () {
      // Only run if the request is complete
      if (request.readyState !== 4) return;
      resolve(request);
    };

    // Setup our HTTP request
    request.open('HEAD', url, true);

    // Send the request
    request.send();
  });
};

export const isFileExistingInServer = async (urlAsFile) => {
  /* try {
    try {
      var xhr = new XMLHttpRequest();
      try {
        xhr.open('HEAD', urlAsFile, false);
        xhr.send();
        return xhr.status !== 404;
      } catch (exception) {
        console.log(exception);
        return false;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  } catch (error) {
    return false;
  } */
  try {
    const resData = await checkURLExists(urlAsFile);
    // console.log('Result', resData.status, urlAsFile);
    return resData && resData.status != 404;
  } catch (error) {
    console.log('CheckURLExists', error, urlAsFile);
    return false;
  }
};

export const resourcePathStatus = 'Display/';
export const resourcePathDisplay = 'Display/';
export const resourcePathS3 = `s3bucket/${resourcePathDisplay}`;
export const resourcePathBase = `${baseURL}/`; //"./gltfconverter/";//
export const resourcePathURL = `${resourcePathBase}Display/`; //('//http://localhost:8000/Media/');
export const resourceStatusURL = `${resourcePathBase}Status/`;
export const resourcePathS3URL = `${resourcePathBase}S3Display/`; //"./gltfconverter/";//
