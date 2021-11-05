
// const baseURL = process.env.REACT_APP_GLTF_CONVERTER ? process.env.REACT_APP_GLTF_CONVERTER : 'http://localhost:8000' ;
const baseURL = process.env.REACT_APP_GLTF_CONVERTER ? process.env.REACT_APP_GLTF_CONVERTER : 'https://cadapi.struct.services' ;


const resourcePathBase = `${baseURL}/`; //"./gltfconverter/";//

const resourcePathURL = `${baseURL}/Display/`; //http://localhost:8000/Media/`;

module.exports = {
  resourcePathBase,
  resourcePathURL
};
