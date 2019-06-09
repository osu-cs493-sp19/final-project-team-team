const router = require('express').Router();

const { validateAgainstSchema } = require('../lib/validation');
const {
  AssignmentSchema,
  validateDate,
  getAssignmentById, 
  deleteAssignmentById, 
  insertNewAssignment,
  updateAssignmentById 
} = require('../models/assignment');

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

module.exports = router;