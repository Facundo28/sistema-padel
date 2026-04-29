const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// GET all comments, ordered by newest first
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM comentarios ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching comentarios:', error);
        res.status(500).json({ message: 'Error fetching comentarios' });
    }
});

// POST a new comment
router.post('/', async (req, res) => {
    const { author_name, content } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO comentarios (author_name, content) VALUES (?, ?)',
            [author_name, content]
        );
        res.status(201).json({ id: result.insertId, author_name, content, message: 'Comentario creado exitosamente' });
    } catch (error) {
        console.error('Error creating comentario:', error);
        res.status(500).json({ message: 'Error creating comentario' });
    }
});

// DELETE a comment
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM comentarios WHERE id = ?', [id]);
        res.json({ message: 'Comentario eliminado exitosamente' });
    } catch (error) {
        console.error('Error deleting comentario:', error);
        res.status(500).json({ message: 'Error deleting comentario' });
    }
});

module.exports = router;
