const router = require('express').Router();
const {
  getDownloadStreamByFilename
} = require('../models/submission');

router.get('/submissions/:filename', async (req, res, next) => {
  getDownloadStreamByFilename(req.params.filename)
    .on('error', (err) => {
      if (err.code === 'ENOENT') {
        next();
      } else {
        console.error(err);
        res.status(500).send({
          error: "Error downloading file. Try again later."
        });
      }
    })
    .on('file', (file) => {
      console.log(file);
      res.status(200).type(file.metadata.contentType);
    })
    .pipe(res);
});

module.exports = router;