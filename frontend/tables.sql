create table volunteer (
   volunteer_id int primary key,
   name varchar(64)
);

-- event_id increases by 1 each time
create table event (
   event_id int primary key ,
   name varchar(64),
   date varchar(64),
   password varchar(64)
);

create table questions (
   question_id int,
	event_id int references event(event_id),
	question_text varchar(64),
	UNIQUE (event_id,question_text),
   primary key (event_id, question_id)
);

CREATE TABLE options (
   option_id INT,
   question_id INT,
   event_id INT,
   option_text VARCHAR(64),
   FOREIGN KEY (question_id, event_id) REFERENCES questions(question_id, event_id),
   UNIQUE (question_id, event_id, option_id)
);

-- submission_id increases by 1 each time
CREATE TABLE submission (
  submission_id INT PRIMARY KEY,
  question_id INT,
  option_id INT,
  event_id INT,
  volunteer_id INT,
  FOREIGN KEY (question_id, option_id, event_id) REFERENCES options(question_id, option_id, event_id),
  FOREIGN KEY (volunteer_id) REFERENCES volunteer(volunteer_id)
);


CREATE SEQUENCE event_id_seq START 1;

ALTER TABLE event
  ALTER COLUMN event_id SET DEFAULT nextval('event_id_seq');


CREATE SEQUENCE submission_id_seq START 1;

ALTER TABLE submission
  ALTER COLUMN submission_id SET DEFAULT nextval('submission_id_seq');