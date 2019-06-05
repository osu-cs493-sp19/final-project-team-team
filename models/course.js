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