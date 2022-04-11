var XMLHttpRequest = require('xhr2');
// const baseURL = process.env.REACT_APP_GLTF_CONVERTER
//   ? process.env.REACT_APP_GLTF_CONVERTER
//   : 'https://cadapi.struct.services';

let baseURL = process.env.REACT_APP_GLTF_CONVERTER
  ? process.env.REACT_APP_GLTF_CONVERTER
  : 'http://localhost:8000';

baseURL = 'https://cadapi.struct.services';

const resourcePathBase = `${baseURL}/`; //"./gltfconverter/";//

const resourcePathURL = `${baseURL}/Display/`; //http://localhost:8000/Media/`;
const resourcePathS3URL = `${baseURL}/S3Display/`;
const isFileExistingInServer = async (urlAsFile) => {
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

const checkURLExists = (url) => {
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

module.exports = {
  resourcePathBase,
  resourcePathURL,
  resourcePathS3URL,
  isFileExistingInServer
};
