const router = require('express').Router();

router.use('/assignments', require('./assignments'));
router.use('/media', require('./media'));

module.exports = router;
