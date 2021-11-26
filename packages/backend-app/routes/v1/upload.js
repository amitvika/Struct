const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const config = require('config');
const DBuri = config.get('mongoURI');
const path = require('path');
const crypto = require('crypto');

var conn = mongoose.createConnection(
  //"mongodb+srv://amit_ika:dividivi@cluster0-ne7uw.mongodb.net/test?retryWrites=true&w=majority",
  DBuri,
  { useUnifiedTopology: true }
);

let gfs;
conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});

const storage = new GridFsStorage({
  url: DBuri, //'mongodb+srv://amit_ika:dividivi@cluster0-ne7uw.mongodb.net/test?retryWrites=true&w=majority',
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads'
        };
        resolve(fileInfo);
      });
    });
  }
});

// Set multer storage engine to the newly created object
const upload = multer({ storage });

// Upload your files as usual
router.post('/', upload.single('file'), (req, res, next) => {
  console.log('hit');
  res.json({ file: req.file });
});

router.get('/', (req, res) => {
  gfs.files.find().toArray((err, files) => {
    if (!files || files.length === 0) {
      return res.status(404).json({
        err: 'No files exist'
      });
    }
    return res.json(files);
  });
});

router.get('/:filename', (req, res) => {
  console.log('hitsff');
  gfs.files.findOne(
    // { filename: "4f6451ba26f358ffef61bfd4dc85f627.STEP" }, //pinion gear
    //  { filename: "2e537c1c57a0a0dc91c28f879e69f8fa.STEP" }, //cube with lofted face
    { filename: 'f2fc88075bd632908708eb1461f0b81b.STEP' }, //spline face only shape
    // { filename: "8002c9f8a6263b5ea0e416dc738e5845.STEP" }, //ellipse extrsuion with flat cut
    //   { filename: "656a63915e3da8151b3752a502cebf08.STEP" }, //flat plate
    //  { filename: "4d07b6db8d836c1fd10b8b9104cf7f29.STEP" }, //sept extrusion
    // { filename: "82ab9b11f6f4e052fad7bbd2e52e23f2.STEP" }, //really complex flat surfaces extrusion
    // { filename: "0af5fa7c4f094a1eb9a4e54ab69f1b83.STEP" }, //slightly complex flat surfaces extrusion
    // { filename: "6be2c43345b4d2b8ac2b709bbb191a68.STEP" }, //less complex flat surfaces extrusion
    //  { filename: "a70ab95eaf027a292dea011af9d72eae.STEP" }, //square plate with square hole
    // { filename: "a63e863ecbceab13a65822dfa10e1ecb.STEP" }, //square plate with low complexity  hole
    // { filename: "fcc3e65b241e8c50112302f206872800.STEP" }, //square plate with low complexity  hole

    //   { filename: "4280ad4fd974950328be2db57646d88c.STEP" }, //cube with on round arch face
    // { filename: "1e10faa6071f49bb87657c70a2f19965.STEP" }, //two plates connected by column
    // { filename: "f2361aa290ca64e4054a20381627baca.STEP" }, //complex circles and cylinders
    // { filename: "7f1d7a5a9699e5966d277b16797a924a.STEP" }, //cubes and cylinders
    // { filename: "3970b5ff447a25fada55c517eed31928.STEP" }, //cubes and cylinders no circular face
    //  { filename: "be26daf71c981b753c79e3fa320f996d.STEP" }, //cubes and cylinders no circular face, vertical cylinder
    // { filename: "cf3adaa3800ac00c93980acf88ba0d83.STEP" }, // vertical cylinder and cubes

    // { filename: "dcdfba7dc1ae76d1e938314ca4dc23f0.STEP" }, // 45 degress dylinder and cubes ellipse intersection
    //{ filename: "c2bf23a1f999903c175f4e8879543b35.STEP" }, //45  vertical cylinder and cubes

    // { filename: "fa6c152f73a17831b94c7315dc094f01.STEP" }, //ellipse extrsuion

    //    { filename: "ad2f0483f5aa3c96c33a5e96715ab213.STEP" }, //cylinder with flat cut

    // { filename: "a5d729573fa600c0dd82de18f77d67c4.STEP" }, //cone
    //{ filename: "e547d19d8f971656e2273d42d75bbbe1.STEP" }, //bullet--->toroidal surface
    //  { filename: "8931d886bba4a012117bbe738e347e5d.STEP" }, //4 sided pyramid
    // { filename: "37ed8ac2e0383e32139416c112175915.STEP" }, //sphere

    //{ filename: "38827e76afc046ddd6bf04fdd2f5004d.STEP" }, //sphere on a stick
    //  { filename: "15ae2d76ad62c87f57d1a002b6e3b837.STEP" }, //chess peice
    //  { filename: "9dd93fee843626cb184cb2b5a962b0e3.STEP" }, //spline extrusion

    (err, file) => {
      if (!file || file.length === 0) {
        return res.status(404).json({
          err: 'No file exist'
        });
      }
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    }
  );
});

module.exports = router;
