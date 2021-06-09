import axios from 'axios';
import { getRequest } from '../utils/apiHandler';

export const uploadFileS3Bucket = async (file) => {
    try {
        let fileParts = file.name.split('.');
        let fileName = file.name;
        let fileType = file.type //fileParts[1];

        console.log("Preparing the upload");
        const signedRes = await getRequest(`/sign_s3?fileName=${fileName}&fileType=${fileType}`);

        if (!signedRes) {
            throw new "Unable to generate url"
        }

        const signedRequest = signedRes.data.signedRequest;
        const url = signedRes.data.url;
        console.log("Recieved a signed request " + signedRequest);

        // Put the fileType in the headers for the upload
        var options = {
            headers: {
                'Content-Type': fileType
            }
        };
        const result = await axios.put(signedRequest, file, options);

        if (!result) {
            throw new 'Unable upload file to server'
        }

        console.log("Response from s3", result)
        return url;

    } catch (error) {
        console.log(error)
        return null
    }
};
