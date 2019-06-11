/*
* User schema and data accessor methods
*/

const { ObjectId } = require('mongodb');
const { extractValidFields } = require('../lib/validation');
const bcrypt = require('bcryptjs');
const { getDBReference } = require('../lib/mongo');

const UserSchema = {
  name: { required: true },
  email: { required: true },
  password: { required: true },
  role: {require: false }
};
exports.UserSchema = UserSchema;

async function insertNewUser(user) {
  const userToInsert = extractValidFields(user,UserSchema);
  const db = getDBReference();
  const collection = db.collection('users');

  const passwordHash = await bcrypt.hash(user.password, 8);
  userToInsert.password = passwordHash;

  const result = await collection.insertOne(userToInsert);
  //console.log(result);
  return result.insertedId;
}
exports.insertNewUser = insertNewUser;

async function getUserById(id, includePassword){
  const db = getDBReference();
  const collection = db.collection('users');
  //console.log(id);
  if (!ObjectId.isValid(id)) {
    return null;
  } else {
    const projection = includePassword ? {} : { password: 0 };
    const results = await collection
      .find({ _id: new ObjectId(id) })
      .project(projection)
      .toArray();
    //console.log(results);
    return results[0];
  }
};
exports.getUserById = getUserById;

async function getUserByEmail(email, includePassword){
  const db = getDBReference();
  const collection = db.collection('users');
  console.log(email);

  const projection = includePassword ? {} : { password: 0 };
  const results = await collection
    .find({ email: email })
    .project(projection)
    .toArray();
  console.log(results);
  return results[0];
};

exports.validateUser = async function (id, password) {
  const user = await getUserByEmail(id, true);
  const authenticated = user && await bcrypt.compare(password, user.password);
  console.log(password, user.password, await bcrypt.compare(password, user.password));
  return [authenticated, user._id];
};

exports.validateInstructor = async function (id) {
  const user = await getUserById(id);
  if (user && (user.role == "instructor")) {
    return true;
  } else {
    return false;
  }
}