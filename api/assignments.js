const router = require('express').Router();

const crypto = require('crypto');
const multer = require('multer');

const { validateAgainstSchema, validateDate } = require('../lib/validation');
const {
  AssignmentSchema,
  getAssignmentById, 
  deleteAssignmentById, 
  insertNewAssignment,
  updateAssignmentById,
  validateAssignmentID 
} = require('../models/assignment');

const { 
  SubmissionSchema,
  saveSubmission,
  getSubmissionsPageByID, 
  removeUploadedFile
} = require('../models/submission');

const fileTypes = {
  'text/plain':       'txt',
  'application/pdf':  'pdf',
  'image/jpeg':       'jpg',
  'image/png':        'png'
};
const upload = multer({
  storage: multer.diskStorage({
    destination: `${__dirname}/uploads`,
    filename: (req, file, callback) => {
      const basename = crypto.pseudoRandomBytes(16).toString('hex');
      const extension = fileTypes[file.mimetype];
      callback(null, `${basename}.${extension}`);
    }
  }),
  fileFilter: (req, file, callback) => {
    callback(null, !!fileTypes[file.mimetype]);
  }
});

router.post('/', async (req, res, next) => {
  if (validateAgainstSchema(req.body, AssignmentSchema)) {
    if (validateDate(req.body.due)) {
      try {
        const id = await insertNewAssignment(req.body);
        res.status(201).send({ id: id });
      } catch (err) {
        console.error(err);
        res.status(500).send({
          error: "Error inserting assignment into DB."
        });
      }
    } else {
      res.status(400).send({
        error: "Request body does not contain a valid due date for assignment. Due date must be in ISO 8601 format."
      });
    }
  } else {
    res.status(400).send({
      error: "Request body does not contain a valid assignment."
    });
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const assignment = await getAssignmentById(req.params.id);
    if (assignment) {
      res.status(200).send(assignment);
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Error fetching assignment.  Try again later."
    });
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    var patch = {};
    if (req.body) {
      if (req.body.courseID) {
        patch.courseID = req.body.courseID;
      }
      if (req.body.title) {
        patch.title = req.body.title;
      }
      if (req.body.points) {
        patch.points = req.body.points;
      }
      if (req.body.due) {
        if (validateDate(req.body.due)) {
          patch.due = req.body.due;
        } else {
          res.status(400).send({
            error: "Request body does not contain a valid due date for assignment. Due date must be in ISO 8601 format."
          });
        }
      }
      const successful = await updateAssignmentById(req.params.id, patch);
      if (successful) {
        res.status(200).send({});
      }
    } else {
      res.status(400).send({
        error: "Invalid body for assignment patch request."
      });
    }
  } catch(err) {
    console.error(err);
    res.status(500).send({
      error: "Error patching assignment. Try again later."
    });
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const deleteSuccessful = await deleteAssignmentById(req.params.id);
    if (deleteSuccessful) {
      res.status(204).end();
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to delete assignment."
    });
  }
});

router.post('/:id/submissions', upload.single('file'), async (req, res, next) => {
  if (validateAgainstSchema(req.body, SubmissionSchema)) {
    if (validateDate(req.body.timestamp)) {
      if (validateAssignmentID(req.params.id)) {
        try {
          const sub = {
            path: req.file.path,
            filename: req.file.filename,
            contentType: req.file.mimetype,
            assignmentID: req.body.assignmentID,
            studentID: req.body.studentID,
            timestamp: req.body.timestamp
          };
          const id = await saveSubmission(sub);
          await removeUploadedFile(req.file);

          res.status(201).send({ id: id });
        } catch (err) {
          console.error(err);
          res.status(500).send({
            error: "Error inserting submission into DB."
          });
        }
      } else {
        next();
      }
    } else {
      res.status(400).send({
        error: "Request body does not contain a valid timestamp for submission. Timestamp must be in ISO 8601 format."
      });
    }
  } else {
    res.status(400).send({
      error: "Request body does not contain a valid submission."
    });
  }
});

router.get('/:id/submissions', async (req, res, next) => {
  try {
    if (validateAssignmentID(req.params.id)) {
      const submissionPage = await getSubmissionsPageByID((parseInt(req.query.page) || 1), req.params.id, req.query.studentID);
      submissionPage.links = {};
      if (submissionPage.page < submissionPage.totalPages) {
          submissionPage.links.nextPage = `/assignments/${req.params.id}/submissions?page=${submissionPage.page + 1}`;
          submissionPage.links.lastPage = `/assignments/${req.params.id}/submissions?page=${submissionPage.totalPages}`;
      }
      if (submissionPage.page > 1) {
          submissionPage.links.prevPage = `/assignments/${req.params.id}/submissions?page=${submissionPage.page - 1}`;
          submissionPage.links.firstPage = `/assignments/${req.params.id}/submissions?page=1`;
      }
      res.status(200).send(submissionPage);
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Error fetching submissions page. Try again later."
    });
  }
});

module.exports = router;