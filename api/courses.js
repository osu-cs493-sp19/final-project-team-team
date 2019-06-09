const router = require('express').Router();
const { validateAgainstSchema } = require('../lib/validation');
const { getCoursesPage } = require('../models/course');

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
        if(subject.length > 0){
            and_clauses.push({'subject': subject});
        }
        if(number.length > 0){
            and_clauses.push({'number': number});
        }
        if(term.length > 0){
            and_clauses.push({'term': term});
        }

        if(and_clauses.length > 0){ 
            q['$and'] = and_clauses; // filter the search by any criteria given by the user
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
            error: "Error fetching coursees list.  Please try again later."
        });
    }
  });


module.exports = router;