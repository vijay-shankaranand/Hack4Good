create table volunteer (
   volunteer_id int primary key,
   name varchar(64)
);

create table participant (
   participant_id int primary key,
   name varchar(64)
);

create table event (
   event_id int primary key ,
   name varchar(64),
   date varchar(64),
   password varchar(64)
);

create table submission_kpi (
  submission_id  int primary key,
   kpi varchar(64),
   event_id int references event(event_id),
	volunteer_id int references volunteer(volunteer_id)
);

create table submission_feedback_volunteer (
  submission_id int primary key,
  feedback varchar(64),
  event_id int references event(event_id),
  volunteer_id int references volunteer(volunteer_id)
);

create table submission_feedback_participant (
   submission_id int primary key,
  feedback varchar(64),
  event_id int references event(event_id),
   participant_id int references participant(participant_id)
);

create table questions (
	event_id int references event(event_id),
	question_text varchar(64),
	primary key (event_id,question_text )
)