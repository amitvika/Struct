
// const baseURL = process.env.REACT_APP_GLTF_CONVERTER ? process.env.REACT_APP_GLTF_CONVERTER : 'https://cadapi.struct.services' ;
// const baseURL = process.env.REACT_APP_GLTF_CONVERTER ? process.env.REACT_APP_GLTF_CONVERTER : 'http://localhost:8000' ;
const baseURL = 'https://cadapi.struct.services' ;

const resourcePathBase = `${baseURL}/`; //"./gltfconverter/";//

const resourcePathURL = `${baseURL}/Display/`; //http://localhost:8000/Media/`;
const resourcePathS3URL = `${baseURL}/S3Display/`
const isFileExistingInServer = (urlAsFile) => {
  try{
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
  }
};

module.exports = {
  resourcePathBase,
  resourcePathURL,
  resourcePathS3URL,
  isFileExistingInServer
};
