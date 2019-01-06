const ical = require('ical-generator');
const fs = require('fs-extra');
var moment = require('moment');

exports.getCalendarData = () => {
	const typeOrder = ["holiday", "absence", "project", "class", "officehours_daniel"]
	var calendar_data = fs.readJsonSync('public/calendar.json');
	//Sort calendar events
	calendar_data.events.sort((a, b) => {
		return moment(a.date) - moment(b.date);
	});
	var events = [{'date_str': moment(calendar_data.events[0].date).format("MMMM D"), "events":[]}];
	calendar_data.events.forEach((event) => {
		var date_str = moment(event.date).format("MMMM D");
		if(date_str != events[events.length - 1].date_str) {
			events.push({'date_str': date_str, "events":[]});
		}
		events[events.length - 1].events.push(event)
	});
	return events;
}

exports.getAllProjects = () => {
	var calendar_data = fs.readJsonSync('public/calendar.json');
	return calendar_data.events.filter(event => {
		return event.type == 'project';
	}).sort((a, b) => { //Sort ascending
		return moment(a.date) - moment(b.date);
	}).map(event => {
		project = {
			//All assignments due 11:59pm the day before they are listed on the calendar
			'due': moment(event.date).subtract(1, 'minutes'),
			'title': event.title
		};
		if('anchor' in event) {
			project.anchor = event.anchor;
			if(project.anchor.startsWith('final')) {
				//... but the final assignments are actually due the day they are listed on the calendar.
				project.due = project.due.add(1, "days");
			}
		}
		if('link' in event) {
			project.link = event.link;
		}
		return project;
	});
}

exports.writeICS = () => {
	var calendar_data = fs.readJsonSync('public/calendar.json');
	var ics_events = [].concat.apply([], calendar_data.events.map((e) => {
		if(e.type == "class") {
			var time = moment(e.date + " " + calendar_data.class_default.time);
			var body = {
				"summary": 'Class: ' + e.title,
				"start": time,
				"end": moment(time).add(calendar_data.class_default.duration, "minutes"),
				"location": calendar_data.class_default.location
			}
			if(e.location) {
				body.location = e.location;
			}
			if(e.time) {
				body.start = moment(e.date + " " + e.time);
			}
			if(e.duration) {
				body.end = moment(body.start).add(e.duration, "minutes");
			}
			return body;
		} else if(e.type == "project") {
			//All assignments due 11:59pm the day before they are listed on the calendar
			var time = moment(e.date).subtract(1, "minutes");
			if(e.anchor.startsWith("final")) {
				//... but the final assignments are actually due the day they are listed on the calendar.
				time = time.add(1, "days");
			}
			return {
				"summary": 'Due: ' + e.title,
				"start": time,
				"end": moment(time).add(60, 'minutes')
			}
		} else {
			var time = moment(e.date);
			return {
				"summary": e.title,
				"start": time,
				"allDay": true
			}
		}
	}));

	var cal = ical({domain:'depstein.net', prodId: {company: 'University of California, Irvine Department of Informatics', product: 'IN4MATX 241 Winter 2019', timezone:'America/Los_Angeles'}}).ttl(60*60*24);
	ics_events.forEach((event) => {
		cal.createEvent(event);
	});

	cal.saveSync('public/calendar.ics');
}