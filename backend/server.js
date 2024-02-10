const express = require('express');
const cors = require("cors")
const app = express();
const { Pool } = require('pg');

const pool = new Pool({
  user: 'dxoaihno',
  host: 'rain.db.elephantsql.com',
  database: 'dxoaihno',
  password: 'lFSblelQkfSY7jmJW90n0zGkp_0uLxW8',
  port: 5432, // Default PostgreSQL port
});

pool.connect()
  .then(() => console.log('Connected to PostgreSQL database'))
  .catch(err => console.error('Error connecting to PostgreSQL database', err));

app.use(cors())
app.use(express.json());

// Route to create a new event
app.post('/events', async (req, res) => {
    const { eventName, eventDate, questions, eventPw } = req.body;
  
    try {
      const client = await pool.connect();
      // Insert event into events table
      const eventResult = await client.query(
        'INSERT INTO event (name, date, password) VALUES ($1, $2, $3) RETURNING *',
        [eventName, eventDate, eventPw]
      );
      const eventId = eventResult.rows[0].event_id;
      // Insert questions into questions table
      await questions.map(question => {
      const questionResult = client.query(
        'INSERT INTO questions (question_id, question_text, event_id) VALUES ($1, $2, $3)',
        [question.id, question.text, eventId]
      )
      
      question.options.map(option => client.query('INSERT INTO options (question_id, option_text, option_id, event_id) VALUES ($1, $2, $3, $4) RETURNING *',
       [question.id, option.text, option.id, eventId]))
      
      });
      client.release();
      res.status(201).json({ message: 'Event created successfully' });
    } catch (err) {
      console.error('Error creating event:', err);
      res.status(500).json({ error: 'Error creating event' });
    }
  });

// Route to retrieve all events
app.get('/events', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM event');
    const events = result.rows;
    client.release();
    res.status(200).json(events);
  } catch (err) {
    console.error('Error retrieving events:', err);
    res.status(500).json({ error: 'Error retrieving events' });
  }
});

//Retrieve all questions for an event
app.get('/questions', async (req, res) => {
  const { eventId } = req.body;

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM questions WHERE event_id: $1', [eventId]);
    const questions = result.rows;
    client.release();
    res.status(200).json(questions);
  } catch (err) {
    console.error('Error retrieving questions:', err);
    res.status(500).json({ error: 'Error retrieving questions' });
  }
});

//Get options of a question
app.get('/options', async (req, res) => {
  const { questionId } = req.body;

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM options WHERE question_id: $1', [questionId]);
    const options = result.rows;
    client.release();
    res.status(200).json(rows);
  } catch (err) {
    console.error('Error retrieving options:', err);
    res.status(500).json({ error: 'Error retrieving options' });
  }
});

// route to create new volunteer
app.post('/volunteer', async (req, res) => {
  const { volunteerId, userName } = req.body;

  try {
    const client = await pool.connect();
    // Insert volunteer into table
    const eventResult = await client.query(
      'INSERT INTO volunteer (volunteer_id, name) VALUES ($1, $2) RETURNING *',
      [volunteeerId, userName]
    );
    client.release();
    res.status(201).json({ message: 'Volunteer created successfully' });
  } catch (err) {
    console.error('Error creating volunteer:', err);
    res.status(500).json({ error: 'Error creating volunteer' });
  }
});

//Route to create new submission
app.post('/submission', async (req, res) => {
  const { eventId, volunteerId, optionIds } = req.body;

  try {
    const client = await pool.connect();
    // Insert submission into submission table
    const eventResult = await optionIds.map(optionId => 
      client.query(
      'INSERT INTO submission (event_id, volunteer_id, option_id, question_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [eventId, volunteerId, optionId, optionId.question_id]
    ));
    client.release();
    res.status(201).json({ message: 'Event created successfully' });
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ error: 'Error creating event' });
  }
});



// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});