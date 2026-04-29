const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// --- CATEGORIAS RUTAS ---

// Obtener todas las categorias
router.get('/categorias', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM noticias_categorias ORDER BY nombre ASC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching categorias:', error);
        res.status(500).json({ message: 'Error en el servidor al obtener las categorias' });
    }
});

// Crear nueva categoria (Admin)
router.post('/categorias', async (req, res) => {
    try {
        const { nombre, color } = req.body;
        if (!nombre) {
            return res.status(400).json({ message: 'El nombre de la categoría es obligatorio' });
        }
        
        const [result] = await pool.query(
            'INSERT INTO noticias_categorias (nombre, color) VALUES (?, ?)',
            [nombre, color || '#152336']
        );
        res.status(201).json({ id: result.insertId, nombre, color: color || '#152336' });
    } catch (error) {
        console.error('Error creating categoria:', error);
        res.status(500).json({ message: 'Error interno al crear categoría' });
    }
});

// --- NOTICIAS RUTAS ---

// Get all news
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT n.*, c.nombre as categoria_nombre, c.color as categoria_color 
            FROM noticias n 
            LEFT JOIN noticias_categorias c ON n.categoria_id = c.id 
            ORDER BY n.fecha DESC, n.created_at DESC
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching noticias:', error);
        res.status(500).json({ message: 'Error en el servidor al obtener las noticias' });
    }
});

// Get a single news article by ID
router.get('/:id', async (req, res) => {
    try {
        const query = `
            SELECT n.*, c.nombre as categoria_nombre, c.color as categoria_color 
            FROM noticias n 
            LEFT JOIN noticias_categorias c ON n.categoria_id = c.id 
            WHERE n.id = ?
        `;
        const [rows] = await pool.query(query, [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Noticia no encontrada' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching noticia:', error);
        res.status(500).json({ message: 'Error en el servidor al obtener la noticia' });
    }
});

// Create a news article (Admin only)
router.post('/', async (req, res) => {
    try {
        const { titulo, fecha, imagen, contenido_html, categoria_id } = req.body;
        
        if (!titulo || !fecha || !contenido_html) {
            return res.status(400).json({ message: 'Faltan campos obligatorios' });
        }

        const [result] = await pool.query(
            'INSERT INTO noticias (titulo, fecha, categoria_id, imagen, contenido_html) VALUES (?, ?, ?, ?, ?)',
            [titulo, fecha, categoria_id || null, imagen || null, contenido_html]
        );
        
        res.status(201).json({ id: result.insertId, message: 'Noticia creada correctamente' });
    } catch (error) {
        console.error('Error creating noticia:', error);
        res.status(500).json({ message: 'Error interno al crear noticia' });
    }
});

// Update a news article (Admin only)
router.put('/:id', async (req, res) => {
    try {
        const { titulo, fecha, imagen, contenido_html, categoria_id } = req.body;

        if (!titulo || !fecha || !contenido_html) {
            return res.status(400).json({ message: 'Faltan campos obligatorios' });
        }

        const [result] = await pool.query(
            'UPDATE noticias SET titulo = ?, fecha = ?, categoria_id = ?, imagen = ?, contenido_html = ? WHERE id = ?',
            [titulo, fecha, categoria_id || null, imagen || null, contenido_html, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Noticia no encontrada' });
        }

        res.json({ message: 'Noticia actualizada correctamente' });
    } catch (error) {
        console.error('Error updating noticia:', error);
        res.status(500).json({ message: 'Error interno al actualizar la noticia' });
    }
});

// Delete a news article (Admin only)
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM noticias WHERE id = ?', [req.params.id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Noticia no encontrada' });
        }

        res.json({ message: 'Noticia eliminada correctamente' });
    } catch (error) {
        console.error('Error deleting noticia:', error);
        res.status(500).json({ message: 'Error interno al eliminar la noticia' });
    }
});

module.exports = router;
