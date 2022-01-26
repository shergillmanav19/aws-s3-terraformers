require("dotenv").config();
const fs = require("fs");
const S3 = require("aws-sdk/clients/s3");
const sharp = require("sharp");

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey,
});
async function ShrinkSize(path, imageFit = "fill", width = 235, height = 320) {
  const resizeOptions = {
    fit: imageFit,
  };
  const image = await sharp(path)
    .resize(width, height, resizeOptions)
    .withMetadata()
    .toBuffer({ resolveWithObject: true });
  return image;
}
// uploads a file to s3
function uploadFile(key, res) {

  const uploadParams = {
    Bucket: bucketName,
    Body: res,
    Key: key,
    ContentType: "video/mp4"
  };
  return s3.upload(uploadParams).promise();
}
exports.uploadFile = uploadFile;

// downloads a file from s3
function getFileStream(fileKey) {
  const downloadParams = {
    Key: fileKey,
    Bucket: bucketName,
  };

  return s3.getObject(downloadParams).createReadStream();
}
exports.getFileStream = getFileStream;
