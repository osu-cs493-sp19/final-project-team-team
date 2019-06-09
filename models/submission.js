const fs = require('fs');

const { ObjectId, GridFSBucket } = require('mongodb');

const { getDBReference } = require('../lib/mongo');
const { extractValidFields } = require('../lib/validation');

/*
 * Schema describing required/optional fields of a submission object.
 */
const SubmissionSchema = {
  assignmentID: { required: true },
  studentID: { required: true },
  timestamp: { required: true }
};
exports.SubmissionSchema = SubmissionSchema;

function saveSubmission(sub) {
  return new Promise((resolve, reject) => {
    const db = getDBReference();
    const bucket = new GridFSBucket(db, { bucketName: 'submissions'} );

    console.log(sub.contentType);
    const metadata = {
      contentType: sub.contentType,
      assignmentID: sub.assignmentID,
      studentID: sub.studentID,
      timestamp: sub.timestamp
    };

    const uploadStream = bucket.openUploadStream(
      sub.filename,
      { metadata: metadata }
    );

    fs.createReadStream(sub.path)
      .pipe(uploadStream)
      .on('error', (err) => {
        reject(err);
      })
      .on('finish', (result) => {
        resolve(result._id);
      });
  });
}
exports.saveSubmission = saveSubmission;

function removeUploadedFile(file) {
  return new Promise((resolve, reject) => {
    fs.unlink(file.path, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
exports.removeUploadedFile = removeUploadedFile;

async function getSubmissionsPageByID(page, aId, sId) {
  const db = getDBReference();
  const bucket = new GridFSBucket(db, { bucketName: 'submissions' });
  let countQuery;
  if (sId) {
    countQuery = await bucket.find({ "metadata.assignmentID": aId, "metadata.studentID": sId })
      .toArray();
  } else {
    countQuery = await bucket.find({ "metadata.assignmentID": aId })
      .toArray();
  }
  const count = countQuery.length;

  const pageSize = 10;
  const lastPage = Math.ceil(count / pageSize);
  page = page > lastPage ? lastPage : page;
  page = page < 1 ? 1 : page;
  const offset = (page - 1) * pageSize;
  let results;

  if (sId) {
    results = await bucket.find({ "metadata.assignmentID": aId, "metadata.studentID": sId })
      .sort({ studentID: 1 })
      .skip(offset)
      .limit(pageSize)
      .toArray();
  } else {
    results = await bucket.find({ "metadata.assignmentID": aId })
    .sort({ studentID: 1 })
    .skip(offset)
    .limit(pageSize)
    .toArray();
  }

  const submissions = [];
  for(var i = 0; i < results.length; i++) {
    submissions.push({
      assignmentID: results[i].metadata.assignmentID,
      studentID: results[i].metadata.studentID,
      timestamp: results[i].metadata.timestamp,
      file: `/media/submissions/${results[i].filename}`
    });
  }
  return { 
    submissions: submissions,
    page: page,
    totalPages: lastPage,
    pageSize: pageSize,
    count: count
  };
}
exports.getSubmissionsPageByID = getSubmissionsPageByID;

function getDownloadStreamByFilename(filename) {
  const db = getDBReference();
  const bucket = new GridFSBucket(db, { bucketName: 'submissions' });
  return bucket.openDownloadStreamByName(filename);
}
exports.getDownloadStreamByFilename = getDownloadStreamByFilename;
