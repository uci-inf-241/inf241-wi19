import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
	calendar:any[] = [];

  constructor(private http:HttpClient) {
  	this.http.get('./assets/calendar.json').subscribe(calendar => {
  		this.parseCalendar(calendar as {});
  	});
  }

  ngOnInit() {
  }

  parseCalendar(calendar:{}) {
  	const typeOrder = ["holiday", "absence", "project", "class", "officehours_daniel"]
	//Sort calendar events
	calendar['events'].sort((a, b) => {
		return moment(a.date).diff(moment(b.date));
	});
	this.calendar = [{'date_str': moment(calendar['events'][0].date).format("MMMM D"), "events":[]}];
	calendar['events'].forEach((event) => {
		var date_str = moment(event.date).format("MMMM D");
		if(date_str != this.calendar[this.calendar.length - 1].date_str) {
			this.calendar.push({'date_str': date_str, "events":[]});
		}
		this.calendar[this.calendar.length - 1].events.push(event)
	});
  }
}
