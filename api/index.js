const router = require('express').Router();

//router.use('/assignments', require('./assignments'));
router.use('/users', require('./users'));
//router.use('/courses', require('./courses'));

module.exports = router;
