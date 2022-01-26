const express = require("express");
const fs = require("fs");
const util = require("util");
const sharp = require("sharp");
const axios = require("axios");
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
// const upload = multer({ dest: "uploads/" });
const { uploadFile, getFileStream } = require("./s3");
const app = express();

app.post("/uploadtos3", async (req, res) => {
  console.log(req.query);
  const key = req.query.key;
  const type = req.query.type;

  

    try {
      const res = await axios({
        url: `https://ipfs.io/ipfs/${key}`,
        responseType: "arraybuffer",
      });
      const buffer = Buffer.from(res.data, "binary");
      
      if(type=="image"){
        const image = await sharp(buffer)
          .resize(300, null)
          .withMetadata()
          .toBuffer({ resolveWithObject: true });
          await uploadFile(key,image.data);
      }
      if(type=="video"){
         fs.writeFile(`${key}.mp4`, buffer,{encoding: 'base64'}, (err) => {
          if(!err) console.log('Data written');
          // ffmpeg(`./${key}.mp4`).size('200x?');
          ffmpeg(`${key}.mp4`)
          .output('outputfile.mp4')
          .videoCodec('libx264')
          .size("30%")
          .on('end', function() {
            console.log('Finished processing');
          })
          .run();
          

        });
        
        fs.readFile('outputfile.mp4', {encoding: 'base64'} , async  (err, data) => {
          if (err) {
            console.error(err)
            return
          }
          await uploadFile(key,data);
        })
        
      }
    } catch (error) {
      console.error(`error occurred ${error}`);
      res.send("Error");
    }
  

  res.send("Success");0 
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
