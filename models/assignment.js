const { ObjectId } = require('mongodb').ObjectID;

const { getDBReference } = require('../lib/mongo');
const { extractValidFields } = require('../lib/validation');

/*
 * Schema describing required/optional fields of an assignment object.
 */
const AssignmentSchema = {
  courseId: { required: true },
  title: { required: true },
  points: { required: true },
  due: { required: true }
};
exports.AssignmentSchema = AssignmentSchema;

/*
 * Executes a DB query to insert a new business into the database.  Returns
 * a Promise that resolves to the ID of the newly-created business entry.
 */
async function insertNewAssignment(assignment) {
  assignment = extractValidFields(assignment, AssignmentSchema);
  const db = getDBReference();
  const collection = db.collection('assignments');
  const result = await collection.insertOne(assignment);
  return result.insertedId;
}
exports.insertNewAssignment = insertNewAssignment;

/*
 * Executes a DB query to fetch information about a single specified
 * assignment based on its ID.  Does not fetch photo data for the
 * assignment.  Returns a Promise that resolves to an object containing
 * information about the requested assignment.  If no assignment with the
 * specified ID exists, the returned Promise will resolve to null.
 */
async function getAssignmentById(id) {
  const db = getDBReference();
  const collection = db.collection('assignments');
  if (!ObjectId.isValid(id)) {
    return null;
  } else {
    const results = await collection
      .find({ _id: new ObjectId(id) })
      .toArray();
    return results[0];
  }
}
exports.getAssignmentById = getAssignmentById;

async function updateAssignmentById(id) {
    
}
exports.updateAssignmentById = updateAssignmentById;

async function deleteAssignmentById(id) {
  const collection = db.collection('assignments');
  const result = await collection.deleteOne({
    _id: new ObjectId(id)
  });
  return result.deletedCount > 0;
}
exports.deleteAssignmentById = deleteAssignmentById;

function validateDate(date) {
  // Date validation here
  return true;
}
exports.validateDate = validateDate;