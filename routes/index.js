var express = require('express');
var router = express.Router();
var calendar = require('./calendar');

calendar.writeICS();


/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { });
});

router.get('/project', function(req, res, next) {
	res.render('project', { 'projects':calendar.getAllProjects() });
});

router.get('/calendar', function(req, res, next) {
	res.render('calendar', { 'calendar': calendar.getCalendarData() });
});

module.exports = router;
