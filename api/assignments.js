const router = require('express').Router();

const { validateAgainstSchema } = require('../lib/validation');
const {
    AssignmentSchema,
    validateDate,
    getAssignmentById, 
    deleteAssignmentById, 
    insertNewAssignment 
} = require('../models/assignment');

router.post('/', async (req, res, next) => {
    if (validateAgainstSchema(req.body, AssignmentSchema)) {
        if (validateDate(req.body.due)) {
            try {
                const id = await insertNewAssignment(req.body);
                res.status(201).send({ id: id });
            } catch (err) {
                res.status(500).send({
                    error: "Error inserting assignment into DB."
                });
            }
        } else {
            res.status(400).send({
                error: "Request body does not contain a valid due date for assignment."
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
    const assignment = await getAssignmentById(parseInt(req.param.id));
    res.status(200).send(assignment);
  } catch (err) {
    res.status(500).send({
        error: "Error fetching assignment.  Try again later."
    });
  }
});

router.patch('/:id', (req, res, next) => {
    res.status(500).send({
        error: "Boo."
    });
});

router.delete('/:id', async (req, res, next) => {
    try {
        const deleteSuccessful = await deleteAssignmentById(parseInt(req.params.id));
        if (deleteSuccessful) {
            res.status(204).end();
        } else {
            next();
        }
    } catch (err) {
        res.status(500).send({
            error: "Unable to delete assignment."
        });
    }
});

module.exports = router;