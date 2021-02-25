const aws = require('aws-sdk');
const config = require("config");
const AWS_ACCESS_KEY_ID = config.get("AWS_ACCESS_KEY_ID");
const AWS_SECRET_ACCESS_KEY = config.get("AWS_SECRET_ACCESS_KEY");

aws.config.update({
    region: 'us-east-1', // Put your aws region here
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    Key: AWS_SECRET_ACCESS_KEY
})
const S3_BUCKET = 'struct-dev';

exports.generate_signed_url = (req, res) => {

    const s3 = new aws.S3();  // Create a new instance of S3
    const { fileName, fileType } = req.query;

    // Set up the payload of what we are sending to the S3 api
    const s3Params = {
        Bucket: S3_BUCKET,
        Key: fileName,
        Expires: 500,
        ContentType: fileType,
        ACL: 'public-read'
    };

    // Make a request to the S3 API to get a signed URL which we can use to upload our file
    s3.getSignedUrl('putObject', s3Params, (err, data) => {
        if (err) {
            console.log(err);
            return res.json({ success: false, error: err })
        }
        // Data payload of what we are sending back, the url of the signedRequest and a URL where we can access the content after its saved. 
        // Send it all back
        res.json({
            success: true,
            signedRequest: data,
            url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`
        });
    });
}