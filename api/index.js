const router = require('express').Router();

router.use('/assignments', require('./assignments'));

module.exports = router;
