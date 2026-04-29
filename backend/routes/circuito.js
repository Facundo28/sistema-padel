const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../config/db');

// @route   GET api/circuito
// @desc    Get all circuit events
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT ce.*, t.nombre as torneo_nombre 
            FROM circuit_events ce
            LEFT JOIN torneos t ON ce.torneo_id = t.id
            ORDER BY ce.fecha ASC
        `);
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

// @route   POST api/circuito
// @desc    Create a circuit event (Admin)
router.post(
    '/',
    [
        body('titulo', 'El título es requerido').not().isEmpty(),
        body('fecha', 'La fecha es requerida').not().isEmpty(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { titulo, descripcion, fecha, tipo, torneo_id, imagen } = req.body;

        try {
            const sql = `INSERT INTO circuit_events (titulo, descripcion, fecha, tipo, torneo_id, imagen) VALUES (?, ?, ?, ?, ?, ?)`;
            const values = [titulo, descripcion || null, fecha, tipo || 'TORNEO', torneo_id || null, imagen || null];

            const [result] = await db.execute(sql, values);

            res.status(201).json({
                id: result.insertId,
                titulo, descripcion, fecha, tipo, torneo_id, imagen,
                msg: 'Evento del circuito creado'
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Error del servidor');
        }
    }
);

// @route   PUT api/circuito/:id
// @desc    Update a circuit event (Admin)
router.put('/:id', async (req, res) => {
    const { titulo, descripcion, fecha, tipo, torneo_id, imagen } = req.body;

    try {
        const [existing] = await db.execute('SELECT id FROM circuit_events WHERE id = ?', [req.params.id]);
        if (existing.length === 0) {
            return res.status(404).json({ msg: 'Evento no encontrado' });
        }

        const sql = `UPDATE circuit_events SET titulo = ?, descripcion = ?, fecha = ?, tipo = ?, torneo_id = ?, imagen = ? WHERE id = ?`;
        const values = [titulo, descripcion, fecha, tipo, torneo_id, imagen, req.params.id];

        await db.execute(sql, values);
        res.json({ msg: 'Evento actualizado', id: req.params.id });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

// @route   DELETE api/circuito/:id
// @desc    Delete a circuit event (Admin)
router.delete('/:id', async (req, res) => {
    try {
        const [existing] = await db.execute('SELECT id FROM circuit_events WHERE id = ?', [req.params.id]);
        if (existing.length === 0) {
            return res.status(404).json({ msg: 'Evento no encontrado' });
        }
        await db.execute('DELETE FROM circuit_events WHERE id = ?', [req.params.id]);
        res.json({ msg: 'Evento eliminado' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

module.exports = router;
