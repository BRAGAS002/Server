const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

const db = new sqlite3.Database('./messages.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
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

app.post('/submit', (req, res) => {
    const { name, message } = req.body;

    if (!name || !message) {
        return res.status(400).send('<h1>Please provide both name and message.</h1>');
    }

    const query = `INSERT INTO messages (name, message) VALUES (?, ?)`;
    db.run(query, [name, message], function (err) {
        if (err) {
            console.error('Error inserting message:', err.message);
            return res.status(500).send('<h1>There was an error saving your message. Please try again.</h1>');
        }
        res.send('<h1>Message received. Thank you for reaching out!</h1>');
    });
});

app.get('/messages', (req, res) => {
    const query = `SELECT * FROM messages ORDER BY timestamp DESC`;
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error fetching messages:', err.message);
            return res.status(500).send('<h1>Error fetching messages.</h1>');
        }

        let htmlContent = `
            <html>
            <head>
                <title>Messages</title>
                <style>
                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    th, td {
                        padding: 8px;
                        text-align: left;
                        border: 1px solid #ddd;
                    }
                    th {
                        background-color: #f2f2f2;
                    }
                </style>
            </head>
            <body>
                <h1>Messages</h1>
                <table>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Message</th>
                        <th>Timestamp</th>
                    </tr>
        `;

        rows.forEach(row => {
            htmlContent += `
                <tr>
                    <td>${row.id}</td>
                    <td>${row.name}</td>
                    <td>${row.message}</td>
                    <td>${row.timestamp}</td>
                </tr>
            `;
        });

        htmlContent += `
                </table>
            </body>
            </html>
        `;

        res.send(htmlContent);
    });
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

