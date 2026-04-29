const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../config/db');

// @route   GET api/ranking
// @desc    Get all ranking entries (with optional filters)
router.get('/', async (req, res) => {
    try {
        const { segmento, periodo, estado, categoria, search } = req.query;

        let sql = 'SELECT * FROM ranking WHERE 1=1';
        const params = [];

        if (segmento && segmento !== 'TODOS') {
            sql += ' AND segmento = ?';
            params.push(segmento);
        }
        if (periodo) {
            sql += ' AND periodo = ?';
            params.push(periodo);
        }
        if (estado && estado !== 'TODAS' && estado !== 'VIGENTES' && estado !== 'NO VIGENTES') {
            sql += ' AND estado = ?';
            params.push(estado);
        } else if (estado === 'VIGENTES') {
            sql += ' AND estado = ?';
            params.push('VIGENTE');
        } else if (estado === 'NO VIGENTES') {
            sql += ' AND estado = ?';
            params.push('NO VIGENTE');
        }
        if (categoria) {
            sql += ' AND categoria = ?';
            params.push(categoria);
        }
        if (search) {
            sql += ' AND (nombre LIKE ? OR apellido LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        sql += ' ORDER BY puntos DESC';

        const [rows] = await db.execute(sql, params);
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

// @route   POST api/ranking
// @desc    Add a player to the ranking
router.post(
    '/',
    [
        body('nombre', 'Nombre es requerido').not().isEmpty(),
        body('apellido', 'Apellido es requerido').not().isEmpty(),
        body('categoria', 'Categoría es requerida').not().isEmpty(),
        body('puntos', 'Puntos es requerido').isInt({ min: 0 }),
        body('periodo', 'Periodo es requerido').not().isEmpty(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { nombre, apellido, categoria, puntos, estado, segmento, periodo } = req.body;

        try {
            const sql = `INSERT INTO ranking (nombre, apellido, categoria, puntos, estado, segmento, periodo, last_update)
                         VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())`;
            const values = [
                nombre,
                apellido,
                categoria,
                parseInt(puntos) || 0,
                estado || 'VIGENTE',
                segmento || 'LIBRES',
                periodo
            ];

            const [result] = await db.execute(sql, values);

            res.status(201).json({
                id: result.insertId,
                nombre,
                apellido,
                categoria,
                puntos: parseInt(puntos) || 0,
                estado: estado || 'VIGENTE',
                segmento: segmento || 'LIBRES',
                periodo,
                last_update: new Date().toISOString().split('T')[0],
                msg: '¡Jugador añadido al ranking!'
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Error del servidor');
        }
    }
);

// @route   PUT api/ranking/:id
// @desc    Update a ranking entry
router.put('/:id', async (req, res) => {
    const { nombre, apellido, categoria, puntos, estado, segmento, periodo } = req.body;

    try {
        const [existing] = await db.execute('SELECT id FROM ranking WHERE id = ?', [req.params.id]);
        if (existing.length === 0) {
            return res.status(404).json({ msg: 'Registro no encontrado' });
        }

        const sql = `UPDATE ranking SET nombre = ?, apellido = ?, categoria = ?, puntos = ?, 
                     estado = ?, segmento = ?, periodo = ?, last_update = CURDATE() WHERE id = ?`;
        const values = [nombre, apellido, categoria, parseInt(puntos) || 0, estado, segmento, periodo, req.params.id];

        await db.execute(sql, values);

        res.json({ msg: 'Ranking actualizado', id: parseInt(req.params.id) });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

// @route   DELETE api/ranking/:id
// @desc    Delete a ranking entry
router.delete('/:id', async (req, res) => {
    try {
        const [existing] = await db.execute('SELECT id FROM ranking WHERE id = ?', [req.params.id]);
        if (existing.length === 0) {
            return res.status(404).json({ msg: 'Registro no encontrado' });
        }

        await db.execute('DELETE FROM ranking WHERE id = ?', [req.params.id]);
        res.json({ msg: 'Registro eliminado' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

module.exports = router;
