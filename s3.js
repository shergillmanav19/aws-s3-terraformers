require("dotenv").config();
const S3 = require("aws-sdk/clients/s3");

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey,
});

// uploads a file to s3
function uploadFile(key, res, type) {
  console.log(res);
  const uploadParams = {
    Bucket: bucketName,
    Body: res,
    Key: key,
    ContentType: type === "video" ? "video/mp4" : "image/png",
  };
  return s3.upload(uploadParams).promise();
}
exports.uploadFile = uploadFile;

function getFileStream(fileKey) {
  const params = {
    Key: fileKey,
    Bucket: bucketName,
  };

  return s3.getObject(params).createReadStream();
}
exports.getFileStream = getFileStream;
