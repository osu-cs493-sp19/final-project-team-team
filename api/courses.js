const router = require('express').Router();
const { parse } = require('json2csv');
const { validateAgainstSchema } = require('../lib/validation');
const { requireRoleAuth,
        requireIdAuth } = require('../lib/auth');
const { getCoursesPage,
        getCourseById,
        insertNewCourse,
        updateCourseById,
        deleteCourseById,
        addStudentsToCourse,
        removeStudentsFromCourse,
        getStudentsByCourseId,
        getStudentsCSV,
        getAssignmentsByCourseId,
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

router.post('/', requireRoleAuth, async (req, res, next) => {
    if(req.role === 'admin'){
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
    } else {
        res.status(403).send({
            error: "You are not authorized for this action."
        });
    }
});


router.patch('/:id', requireRoleAuth, requireIdAuth, async (req, res, next) => {
    const course = await getCourseById(req.body.courseID);

    if (req.role === 'admin' || (req.role === 'instructor' && req.user == course.instructorID)) {
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
    } else {
        res.status(403).send({
            error: "You are not authorized for this action."
        });
    }
});


router.delete('/:id', requireRoleAuth, async (req, res, next) => {
    if(req.role === 'admin'){
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
    } else {
        res.status(403).send({
            error: "You are not authorized for this action."
        });
    }
});


router.post('/:id/students', requireRoleAuth, requireIdAuth, async(req, res, next) => {
    const course = await getCourseById(req.body.courseID);

    if (req.role === 'admin' || (req.role === 'instructor' && req.user == course.instructorID)) {
        if(req.body.add && req.body.remove) {
            try{
                var toAdd = req.body.add;
                var toRemove = req.body.remove;
                var ins, rem;
                if(toAdd.length > 0){
                    ins = await addStudentsToCourse(req.params.id, toAdd);
                }
                if(toRemove.length > 0){
                    rem = await removeStudentsFromCourse(req.params.id, toRemove);
                }
                if (ins || rem) {
                    res.status(200).send({});
                } else if (await getCourseById(req.params.id)) {
                    res.status(400).send({
                    error: "Request body does not contain any students to add or remove."
                    });
                } else {
                next();
                }
            }
            catch(err){
                console.error(err);
                res.status(500).send({
                    error: "Unable to update students."
                });
            }
        } else {
            res.status(400).send({
                error: "Request body does not contain any students to add or remove."
            });
        }
    } else {
        res.status(403).send({
            error: "You are not authorized for this action."
        });
    }
});

router.get('/:id/students', requireRoleAuth, requireIdAuth, async(req, res, next) => {
    const course = await getCourseById(req.body.courseID);

    if (req.role === 'admin' || (req.role === 'instructor' && req.user == course.instructorID)) {
        try {
            const students = await getStudentsByCourseId(req.params.id);
            if (students) {
                res.status(200).send(students);
            } else {
                next();
            }
        } catch (err) {
            console.error(err);
            res.status(500).send({
                error: "Error fetching students.  Try again later."
            });
        }
    } else {
        res.status(403).send({
            error: "You are not authorized for this action."
        });
    }
});

router.get('/:id/roster', requireRoleAuth, requireIdAuth, async(req, res, next) => {
    const course = await getCourseById(req.body.courseID);

    if (req.role === 'admin' || (req.role === 'instructor' && req.user == course.instructorID)) {
        try {
            if (await getCourseById(req.params.id) === null){
                res.status(404).send({
                    error: "Course does not exist."
                });
            } else{
                const data = await getStudentsCSV(req.params.id);
                console.log(data);
                const fields = ['_id', 'name', 'email'];
                const opts = { fields };
                const csv = parse(data, opts);
                console.log(csv);
                res.attachment('students.csv');
                res.status(200).send(csv);
            }
        } catch (err) {
            console.error(err);
            res.status(500).send({
                error: "Error fetching students.  Try again later."
            });
        }
    } else {
        res.status(403).send({
            error: "You are not authorized for this action."
        });
    }
});

router.get('/:id/assignments', async (req, res, next) => {
    try {
        if (await getCourseById(req.params.id) === null){
            res.status(404).send({
                error: "Course does not exist."
            });
        } else{
            const data = await getAssignmentsByCourseId(req.params.id);
            var arr = [];
            data.forEach(element => {
                arr.push(element["_id"]);
            });
            var r = {};
            r["assignments"] = arr;
            res.status(200).send(r);
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({
            error: "Error fetching assignments.  Try again later."
        });
    }
});


module.exports = router;