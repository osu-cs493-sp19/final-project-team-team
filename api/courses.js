const router = require('express').Router();
const { validateAgainstSchema } = require('../lib/validation');
const { getCoursesPage,
        getCourseById,
        insertNewCourse,
        updateCourseById,
        deleteCourseById,
        CourseSchema } = require('../models/course');

router.get('/', async (req, res) => {
    try {
        /*
        * Fetch page info, generate HATEOAS links for surrounding pages and then
        * send response.
        */
        var q = {};
        var and_clauses= [];
        var subject = req.query.subject;
        var number = req.query.number;
        var term = req.query.term;
        if(subject){
            and_clauses.push({'subject': subject});
        }
        if(number){
            and_clauses.push({'number': number});
        }
        if(term){
            and_clauses.push({'term': term});
        }

        if(and_clauses.length > 1){ 
            q['$and'] = and_clauses; // filter the search by any criteria given by the user
        } 
        else if(and_clauses.length == 1) {
            q = and_clauses;
        }      

        const coursePage = await getCoursesPage((parseInt(req.query.page) || 1),q);
        coursePage.links = {};
        if (coursePage.page < coursePage.totalPages) {
            coursePage.links.nextPage = `/courses?page=${coursePage.page + 1}`;
            coursePage.links.lastPage = `/courses?page=${coursePage.totalPages}`;
        }
        if (coursePage.page > 1) {
            coursePage.links.prevPage = `/courses?page=${coursePage.page - 1}`;
            coursePage.links.firstPage = '/courses?page=1';
        }
        res.status(200).send(coursePage);
        } catch (err) {
        console.error(err);
        res.status(500).send({
            error: "Error fetching courses list.  Please try again later."
        });
    }
  });


  router.get('/:id', async (req, res, next) => {
    try {
      const course = await getCourseById(req.params.id);
      if (course) {
        res.status(200).send(course);
      } else {
        next();
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Error fetching course.  Try again later."
      });
    }
  });

  router.post('/', async (req, res, next) => {
    if (validateAgainstSchema(req.body, CourseSchema)) {
        try {
          const id = await insertNewCourse(req.body);
          res.status(201).send({ id: id });
        } catch (err) {
          console.error(err);
          res.status(500).send({
            error: "Error inserting course into DB."
          });
        }
    } else {
      res.status(400).send({
        error: "Request body does not contain a valid course."
      });
    }
  });


  router.patch('/:id', async (req, res, next) => {
    try {
      var patch = {};
      if (req.body) {
        if (req.body.subject) {
          patch.subject = req.body.subject;
        }
        if (req.body.title) {
          patch.title = req.body.title;
        }
        if (req.body.number) {
          patch.number = req.body.number;
        }
        if (req.body.term) {
            patch.term = req.body.term;
        }
        if (req.body.instructorId) {
            patch.instructorId = req.body.instructorId;
        }
        const successful = await updateCourseById(req.params.id, patch);
        if (successful) {
          res.status(200).send({});
        }
      } else {
        res.status(400).send({
          error: "Invalid body for course patch request."
        });
      }
    } catch(err) {
      console.error(err);
      res.status(500).send({
        error: "Error patching course. Try again later."
      });
    }
  });


  router.delete('/:id', async (req, res, next) => {
    try {
      const deleteSuccessful = await deleteCourseById(req.params.id);
      if (deleteSuccessful) {
        res.status(204).end();
      } else {
        next();
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Unable to delete course."
      });
    }
  });


module.exports = router;