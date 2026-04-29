const express = require('express');
const router = express.Router();
const db = require('../config/db');

// @route   GET api/sedes
// @desc    Get all venues
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM sedes ORDER BY nombre ASC');
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/sedes
// @desc    Add new venue
router.post('/', async (req, res) => {
    const { nombre, direccion, localidad, telefono, imagen } = req.body;

    try {
        const [result] = await db.query(
            'INSERT INTO sedes (nombre, direccion, localidad, telefono, imagen) VALUES (?, ?, ?, ?, ?)',
            [nombre, direccion, localidad, telefono, imagen]
        );
        
        const [newSede] = await db.query('SELECT * FROM sedes WHERE id = ?', [result.insertId]);
        res.json(newSede[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/sedes/:id
// @desc    Update venue
router.put('/:id', async (req, res) => {
    const { nombre, direccion, localidad, telefono, imagen } = req.body;

    try {
        await db.query(
            'UPDATE sedes SET nombre = ?, direccion = ?, localidad = ?, telefono = ?, imagen = ? WHERE id = ?',
            [nombre, direccion, localidad, telefono, imagen, req.params.id]
        );
        
        const [updatedSede] = await db.query('SELECT * FROM sedes WHERE id = ?', [req.params.id]);
        res.json(updatedSede[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/sedes/:id
// @desc    Delete venue
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM sedes WHERE id = ?', [req.params.id]);
        res.json({ msg: 'Sede eliminada' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
