const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const express = require("express");
const fs = require("fs");
const util = require("util");
const sharp = require("sharp");
const axios = require("axios");
// const upload = multer({ dest: "uploads/" });
const { uploadFile, getFileStream } = require("./s3");
const app = express();

app.get("/images/:key", async (req, res) => {
  console.log(req.params);
  const key = req.params.key;

  try {
    const imageResponse = await axios({
      url: `https://ipfs.io/ipfs/${key}`,
      responseType: "arraybuffer",
    });
    const buffer = Buffer.from(imageResponse.data, "binary");
    const image = await sharp(buffer)
      .resize(300, 250)
      .withMetadata()
      .toBuffer({ resolveWithObject: true });

    await uploadFile(key, image.data);
    // const response = await fetch(`https://ipfs.io/ipfs/${key}`);
    // const resBuffer = await response.arrayBuffer();
    // const image = await sharp(resBuffer)
    //   .resize(300, 250)
    //   .withMetadata()
    //   .toBuffer({ resolveWithObject: true });
    // uploadFile(key, image.data);
    // const response = fetch(`https://ipfs.io/ipfs/${key}`)
    //   .then((res) => {
    //     uploadFile(key, res);
    //   })
    //   .then((res) => {
    //     // callback(null, res);
    //   })
    //   .catch((err) => {
    //     // callback(err, null);
    //   });
    // var blob = await response.blob();
    // blob = blob.toString();
    // console.log(blob);
    // const base64Data = blob.replace(/^data:image\/png;base64,/, "");
    // require("fs").writeFile("out.png", base64Data, "base64", function (err) {
    //   console.log("Hello error", err);
    // });
    // // const file = new File([blob], key);
    // const result = await uploadFile(key);
    // console.log(result);
  } catch (error) {
    console.error(`get: error occurred ${error}`);
    res.send("Hello");
  }

  res.send("Hello");
});

app.get("/getImage", (req, res) => {
  // console.log(req.params);
  // const key = req.params.key;
  const readStream = getFileStream(
    "QmPR5rU9UbGVhFiMbUrSEZWy6rAAvSZwMscBekMcwXy5AQ"
  );

  readStream.pipe(res);
});

app.listen(8080, () => console.log("listening on port 8080"));
