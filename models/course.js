const { ObjectId } = require('mongodb');

const { getDBReference } = require('../lib/mongo');
const { extractValidFields } = require('../lib/validation');

const CourseSchema = {
    subject: { required: true },
    number: { required: true },
    title: { required: true },
    term: { required: true },
    instructorID: { required: true }
};
exports.CourseSchema = CourseSchema;

async function getCoursesPage(page, query) {
  const db = getDBReference();
  const collection = db.collection('courses');
  const count = await collection.countDocuments();

  /*
    * Compute last page number and make sure page is within allowed bounds.
    * Compute offset into collection.
    */
  const pageSize = 10;
  const lastPage = Math.ceil(count / pageSize);
  page = page > lastPage ? lastPage : page;
  page = page < 1 ? 1 : page;
  const offset = (page - 1) * pageSize;

  const results = await collection.find(query)
    .project({ students: 0 })
    .sort({ _id: 1 })
    .skip(offset)
    .limit(pageSize)
    .toArray();

  return {
    courses: results,
    page: page,
    totalPages: lastPage,
    pageSize: pageSize,
    count: count
  };
}
exports.getCoursesPage = getCoursesPage;

async function getCourseById(id) {
  const db = getDBReference();
  const collection = db.collection('courses');
  if (!ObjectId.isValid(id)) {
    return null;
  } else {
    const results = await collection
      .find({ _id: new ObjectId(id) })
      .project({ students: 0 })
      .toArray();
    return results[0];
  }
}
exports.getCourseById = getCourseById;

async function insertNewCourse(course) {
  course = extractValidFields(course, CourseSchema);
  course["students"] = [];
  const db = getDBReference();
  const collection = db.collection('courses');
  const result = await collection.insertOne(course);
  return result.insertedId;
}
exports.insertNewCourse = insertNewCourse;

async function updateCourseById(id, patch) {
  const db = getDBReference();
  const collection = db.collection('courses');
  if (!ObjectId.isValid(id)) {
    return false;
  } else {
    const result = await collection.updateOne(
      { _id: ObjectId(id)}, 
      {$set: patch}
    );
    return result.matchedCount > 0;
  }
}
exports.updateCourseById = updateCourseById;

async function deleteCourseById(id) {
  const db = getDBReference();
  const collection = db.collection('courses');
  if (!ObjectId.isValid(id)) {
    return false;
  } else {
    const result = await collection.deleteOne({
      _id: new ObjectId(id)
    });
    return result.deletedCount > 0;
  }
}
exports.deleteCourseById = deleteCourseById;

async function addStudentsToCourse(id, studentsList) {
  const db = getDBReference();
  const collection = db.collection('courses');
  if (!ObjectId.isValid(id)) {
    return false;
  } else {
    const result = await collection.updateOne(
      { _id: ObjectId(id) }, 
      { $push: { students: { $each: studentsList } } }
    );
    return result.matchedCount > 0;
  }
}
exports.addStudentsToCourse = addStudentsToCourse;

async function removeStudentsFromCourse(id, studentsList) {
  const db = getDBReference();
  const collection = db.collection('courses');
  if (!ObjectId.isValid(id)) {
    return false;
  } else {
    const result = await collection.updateOne(
      { _id: ObjectId(id) }, 
      { $pull: { students: { $in: studentsList } } }
    );
    return result.matchedCount > 0;
  }
}
exports.removeStudentsFromCourse = removeStudentsFromCourse;

async function getStudentsByCourseId (id) { 
  const db = getDBReference();
  const collection = db.collection('courses');
  if (!ObjectId.isValid(id)) {
    return null;
  } else {
    const results = await collection
      .find({ _id: new ObjectId(id) })
      .project({ students: 1, _id: 0 })
      .toArray();
    return results[0];
  }
}
exports.getStudentsByCourseId = getStudentsByCourseId;

async function getStudentsCSV (id) { 
  const db = getDBReference();
  const usersColl = db.collection('users');
  if (!ObjectId.isValid(id)) {
    return null;
  } else {
    const students = await getStudentsByCourseId(id);
    
    if (students){
      var inThing = [];
      students['students'].forEach(element => {
        inThing.push(new ObjectId(element));
      });
      
      console.log(students['students']);
      console.log(inThing);
      const data = await usersColl
        .find({ _id: { $in: inThing }  })
        .project({ password: 0, role: 0})
        .toArray();
      console.log(data);
      return data;
    } else {
      return null;
    }    
  }
}
exports.getStudentsCSV = getStudentsCSV;

async function getAssignmentsByCourseId(id) {
  const db = getDBReference();
  const collection = db.collection('assignments');
  if (!ObjectId.isValid(id)) {
    return null;
  } else {
    const results = await collection
      .find({ courseID: id })
      .project({ courseID: 0, title: 0, points:0, due: 0 })
      .toArray();
    console.log(results);
    return results;
  }
}
exports.getAssignmentsByCourseId = getAssignmentsByCourseId;