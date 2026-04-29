const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Category hierarchy: index 0 = highest level, index 7 = lowest level
const CATEGORIAS_ORDER = [
    'Caballeros Primera (1ra C)',
    'Caballeros Segunda (2da C)',
    'Caballeros Tercera (3ra C)',
    'Caballeros Cuarta (4ta C)',
    'Caballeros Quinta (5ta C)',
    'Caballeros Sexta (6ta C)',
    'Caballeros Septima (7ma C)',
    'Caballeros Octava (8va C)',
    'Caballeros SIN Categorizar (Cab_SC)'
];

function getCategoryIndex(categoria) {
    const idx = CATEGORIAS_ORDER.indexOf(categoria);
    return idx === -1 ? 999 : idx;
}

// @route   POST api/inscripciones
// @desc    Register a user for a tournament (with category validation)
router.post('/', async (req, res) => {
    const { torneo_id, usuario_dni } = req.body;

    if (!torneo_id || !usuario_dni) {
        return res.status(400).json({ msg: 'Torneo y DNI son requeridos' });
    }

    try {
        // Get user's category (nivel)
        const [users] = await db.execute('SELECT nivel FROM usuarios WHERE dni = ?', [usuario_dni]);
        if (users.length === 0) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }
        const userCategoria = users[0].nivel;
        const userCatIndex = getCategoryIndex(userCategoria);

        // Get tournament's category
        const [torneos] = await db.execute('SELECT * FROM torneos WHERE id = ?', [torneo_id]);
        if (torneos.length === 0) {
            return res.status(404).json({ msg: 'Torneo no encontrado' });
        }
        const torneo = torneos[0];

        if (torneo.estado !== 'INSCRIPCIONES') {
            return res.status(400).json({ msg: 'Este torneo no está abierto para inscripciones' });
        }

        const torneoCatIndex = getCategoryIndex(torneo.categoria);

        // Validation: user can register for same or HIGHER category (lower index)
        // A 7ma C player (index 6) can register for 6ta C (index 5) but NOT 8va C (index 7)
        if (torneoCatIndex > userCatIndex) {
            return res.status(400).json({
                msg: `No podés inscribirte a este torneo. Tu categoría es ${userCategoria} y el torneo es de ${torneo.categoria}. Solo podés inscribirte a tu misma categoría o superior.`
            });
        }

        // Check capacity
        const [inscriptosCount] = await db.execute(
            'SELECT COUNT(*) as total FROM inscripciones WHERE torneo_id = ? AND estado = "CONFIRMADA"',
            [torneo_id]
        );
        if (inscriptosCount[0].total >= torneo.cupo) {
            return res.status(400).json({ msg: 'El torneo está completo, no hay cupo disponible' });
        }

        // Check if already registered
        const [existing] = await db.execute(
            'SELECT id FROM inscripciones WHERE torneo_id = ? AND usuario_dni = ? AND estado = "CONFIRMADA"',
            [torneo_id, usuario_dni]
        );
        if (existing.length > 0) {
            return res.status(400).json({ msg: 'Ya estás inscripto en este torneo' });
        }

        // Register
        const [result] = await db.execute(
            'INSERT INTO inscripciones (torneo_id, usuario_dni) VALUES (?, ?) ON DUPLICATE KEY UPDATE estado = "CONFIRMADA"',
            [torneo_id, usuario_dni]
        );

        res.status(201).json({
            id: result.insertId,
            torneo_id,
            usuario_dni,
            estado: 'CONFIRMADA',
            msg: '¡Inscripción exitosa!'
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

// @route   GET api/inscripciones/:dni
// @desc    Get all registrations for a user
router.get('/:dni', async (req, res) => {
    try {
        const sql = `
            SELECT i.*, t.nombre as torneo_nombre, t.categoria as torneo_categoria, 
                   t.fecha as torneo_fecha, t.ubicacion as torneo_ubicacion, t.estado as torneo_estado
            FROM inscripciones i
            JOIN torneos t ON i.torneo_id = t.id
            WHERE i.usuario_dni = ?
            ORDER BY i.fecha_inscripcion DESC
        `;
        const [rows] = await db.execute(sql, [req.params.dni]);
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

// @route   PUT api/inscripciones/:id/cancelar
// @desc    Cancel a registration
router.put('/:id/cancelar', async (req, res) => {
    try {
        const [existing] = await db.execute('SELECT id FROM inscripciones WHERE id = ?', [req.params.id]);
        if (existing.length === 0) {
            return res.status(404).json({ msg: 'Inscripción no encontrada' });
        }

        await db.execute('UPDATE inscripciones SET estado = "CANCELADA" WHERE id = ?', [req.params.id]);
        res.json({ msg: 'Inscripción cancelada' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

module.exports = router;
