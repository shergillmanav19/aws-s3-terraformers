const express = require("express");
const fs = require("fs");
const util = require("util");
const aws = require("aws-sdk");
const sharp = require("sharp");
const axios = require("axios");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
const { videoResize } = require("node-video-resize");
ffmpeg.setFfmpegPath(ffmpegPath);
// const upload = multer({ dest: "uploads/" });
const { uploadFile, getFileStream, fileExists } = require("./s3");
const app = express();

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
async function uploadtos3(key, type) {
  try {
    const res = await axios({
      url: `https://ipfs.io/ipfs/${key}`,
      responseType: "arraybuffer",
    });
    const buffer = Buffer.from(res.data, "binary");

    if (type == "image") {
      const image = await sharp(buffer)
        .resize(300, null)
        .withMetadata()
        .toBuffer({ resolveWithObject: true });
      await uploadFile(key, image.data, type);
    }
    if (type == "video") {
      fs.writeFile(`${key}.mp4`, buffer, async (err) => {
        if (!err) console.log("Data written");
        // ffmpeg(`./${key}.mp4`).size('200x?');
        // ffmpeg(`${key}.mp4`)
        //   .output("outputfile.mp4")
        //   .videoCodec("h.264")
        //   .size("30%")
        //   .on("end", function () {
        //     console.log("Finished processing");
        //   })
        //   .run();
        await videoResize({
          inputPath: `${key}.mp4`,
          outputPath: "output.mp4",
          format: "mp4",
          size: "300x412",
        });
        fs.readFile("output.mp4", async (err, data) => {
          if (!err) await uploadFile(key, data, type);
        });
      });
    }
  } catch (error) {
    console.error(`error occurred ${error}`);
    return "Error";
  }

  return "Success";
}

app.get("/file/:key/:type", async (req, res) => {
  console.log(req.params);
  const key = req.params.key;
  const type = req.params.type;

  s3.headObject(
    {
      Bucket: bucketName,
      Key: key,
    },
    function (err, data) {
      if (err) {
        // file does not exist
        uploadtos3(key, type);
        return { Error: "Error" };
      } else {
        const readStream = getFileStream(key);
        readStream.pipe(res);
      }
    }
  );
});

app.listen(process.env.PORT ? process.env.PORT : 8080, () =>
  console.log("listening on port 8080")
);
