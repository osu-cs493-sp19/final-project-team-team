const {getUserById} = require('../models/user');
const jwt = require('jsonwebtoken');

const secretKey = 'ThisIsSoInsecure';

exports.generateAuthToken = function (userId) {
  const payload = {
    sub: userId
  };
  //console.log(payload);
  const token = jwt.sign(payload, secretKey, {expiresIn: '24h'});
  return token;
};

exports.requireAuthentication = async function (req, res, next) {
  const authHeader = req.get('Authorization') || '';
  const authHeaderParts = authHeader.split(' ');
  const token = authHeaderParts[0] === 'Bearer' ? authHeaderParts[1]
: null;
  try {
    const payload = jwt.verify(token,secretKey);
    //console.log(payload);
    test = await getUserById(payload.sub, false);
    //console.log(test);
    //if(!test.admin){req.user = payload.sub;}else{req.user = true;}
    req.user = payload.sub;
    //console.log(test, req.user);
    next();
  } catch (err) {
    console.error(" -- error:", err);
    res.status(401).send({
      error: "Invalid auth token"
    });
  }
}

exports.isAdmin = async function (req,res,next) {
  const authHeader = req.get('Authorization') || '';
  const authHeaderParts = authHeader.split(' ');
  const token = authHeaderParts[0] === 'Bearer' ? authHeaderParts[1]
: null;

  try {
    const payload = jwt.verify(token,secretKey);
    test = await getUserById(payload.sub, false);
    //console.log(test);
    if(test.role==="admin"){req.user = "admin";}
    if(test.role==="instructor"){req.user = "instructor";}
    next();
  } catch (err) {
    next();
  }
}
