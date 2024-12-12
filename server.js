const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize SQLite database
const db = new sqlite3.Database('./messages.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        // Create table if it doesn't exist
        db.run(
            `CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                message TEXT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
            (err) => {
                if (err) {
                    console.error('Error creating table:', err.message);
                }
            }
        );
    }
});

// Handle form submission
app.post('/submit', (req, res) => {
    const { name, message } = req.body;

    if (!name || !message) {
        return res.status(400).send('<h1>Please provide both name and message.</h1>');
    }

    // Insert the message into the database
    const query = `INSERT INTO messages (name, message) VALUES (?, ?)`;
    db.run(query, [name, message], function (err) {
        if (err) {
            console.error('Error inserting message:', err.message);
            return res.status(500).send('<h1>There was an error saving your message. Please try again.</h1>');
        }
        res.send('<h1>Message received. Thank you for reaching out!</h1>');
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

app.get('/messages', (req, res) => {
    const query = `SELECT * FROM messages ORDER BY timestamp DESC`;
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error fetching messages:', err.message);
            return res.status(500).send('<h1>Error fetching messages.</h1>');
        }
        res.json(rows); // Sends messages as JSON
    });
});
