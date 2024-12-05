import express from 'express';
import bodyParser from 'body-parser';
import SQL from 'better-sqlite3';

// Initialize app and database 
const app = express();
const db = new SQL('lists.db'); 

// Middleware for parsing requests
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// GET all lists
app.get('/lists', (req, res) => {
    try {
        const lists = db.prepare('SELECT * FROM lists').all();
        res.json(lists);
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Database error' });
    }
});

// POST a new list
app.post('/lists', (req, res) => {
    const { text, completed } = req.body;

    if (text === undefined || completed === undefined) {
        return res.status(400).json({ status: 'error', message: 'Text and completed are required' });
    }

    try {
        const stm = `INSERT INTO lists (text, completed) VALUES (?, ?)`;
        db.prepare(stm).run(text, completed);
        res.status(201).json({ status: 'ok', message: 'List created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Database error' });
    }
});

// GET a single list by ID
app.get('/lists/:id', (req, res) => {
    const { id } = req.params;

    try {
        const list = db.prepare('SELECT * FROM lists WHERE id = ?').get(id);
        if (!list) {
            return res.status(404).json({ status: 'error', message: 'List not found' });
        }
        res.json(list);
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Database error' });
    }
});

// PATCH (update) a list
app.patch('/lists/:id', (req, res) => {
    const { id } = req.params;
    const { text, completed } = req.body;

    if (text === undefined && completed === undefined) {
        return res.status(400).json({ status: 'error', message: 'No fields to update' });
    }

    try {
        let stm = 'UPDATE lists SET ';
        const values = [];

        if (text !== undefined) {
            stm += 'text = ?, ';
            values.push(text);
        }
        if (completed !== undefined) {
            stm += 'completed = ?, ';
            values.push(completed);
        }

        stm = stm.slice(0, -2) + ' WHERE id = ?';
        values.push(id);

        const result = db.prepare(stm).run(...values);
        if (result.changes === 0) {
            return res.status(404).json({ status: 'error', message: 'List not found' });
        }

        res.json({ status: 'ok', message: 'List updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Database error' });
    }
});

// Start the server
const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});