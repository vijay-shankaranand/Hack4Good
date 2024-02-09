const express = require('express');
const cors = require("cors")
const app = express();
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Hack4Good',
  password: 'Hack4Good',
  port: 5433, // Default PostgreSQL port
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
      await questions.map(question =>
      client.query(
        'INSERT INTO questions (event_id, question_text) VALUES ($1, $2)',
        [eventId, question]
      ));
  
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
    const result = await client.query('SELECT * FROM events');
    const events = result.rows;
    client.release();
    res.status(200).json(events);
  } catch (err) {
    console.error('Error retrieving events:', err);
    res.status(500).json({ error: 'Error retrieving events' });
  }
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});