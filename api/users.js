/*
 * API sub-router for businesses collection endpoints.
 */

const router = require('express').Router();

const {UserSchema, insertNewUser, getUserById, validateUser} = require('../models/user');
const {generateAuthToken, requireIdAuth, requireRoleAuth} = require('../lib/auth');
const { validateAgainstSchema } = require('../lib/validation');

router.post('/', requireRoleAuth, async (req, res) => {
  if (validateAgainstSchema(req.body,UserSchema)) {
    if(req.body.role==='instructor' && req.role!=='admin' || req.body.role==='admin' && req.role!=='admin'){
      res.status(403).send({
        error: "Unauthorized to add admin or instructor"
      });
    }else{
      if( req.body.role !== 'instructor' && req.body.role !== 'admin' ){
        req.body.role = "student";
      }
      try {
        const id = await insertNewUser(req.body);
        res.status(201).send({
          _id: id
        });
      } catch (err) {
        console.error("  -- Error:", err);
        res.status(500).send({
          error: "error inserting new user. Try against later."
        });
      }
    }
  } else {
    res.status(400).send({
      error: "request body does not contain a valid user."
    });
  }
});

router.post('/login', async (req, res) => {
  if (req.body && req.body.email && req.body.password) {
    try {
      //console.log("validating user");
      const authenticated = await validateUser(req.body.email, req.body.password);
      //console.log(authenticated);
      if (authenticated[0]) {
        const token = generateAuthToken(authenticated[1]);
        res.status(200).send({
          token: token
        });
      } else {
        res.status(401).send({
          error: "Invalid credentials"
        });
      }
    } catch (err) {
      res.status(500).send({
        error: "Error validating user.  Try again later."
      });
    }
  } else {
    res.status(400).send({
      error: "Request body was invalid"
    });
  }
});

router.get('/:id', requireIdAuth, async (req, res, next) => {
  //console.log("testing here");
  //console.log(req.params.id, req.user);
  if (req.params.id == req.user) {
    try {
      const user = await getUserById(req.params.id, false);
      if (user) {
        res.status(200).send(user);
      } else {
        next();
      }
    } catch (err) {
      console.error("  -- Error:", err);
      res.status(500).send({
        error: "Error fetching user.  Try again later."
      });
    }
  } else {
    res.status(403).send({
      error: "Unauthorized to access the specified resource"
    });
  }
});

module.exports = router;
