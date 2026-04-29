const express = require('express');
const router = express.Router();
const db = require('../config/db');

// @route   GET api/jugadores
// @desc    Get all players
router.get('/', async (req, res) => {
    try {
        // Obtenemos a los usuarios que son jugadores (podemos filtrar por rol si aplica, acá traemos rol = 'user')
        const [jugadores] = await db.execute(
            `SELECT dni, nombre, apellido, apodo, pais, localidad, foto_perfil, brazo_habil, posicion, fecha_nacimiento, nivel, nivel_anterior, fecha_recategorizacion 
             FROM usuarios 
             WHERE rol = 'user'`
        );
        res.json(jugadores);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

// @route   GET api/jugadores/:dni
// @desc    Get single player by DNI
router.get('/:dni', async (req, res) => {
    try {
        const [jugadores] = await db.execute(
            `SELECT dni, nombre, apellido, apodo, pais, localidad, foto_perfil, brazo_habil, posicion, fecha_nacimiento, nivel, nivel_anterior, fecha_recategorizacion 
             FROM usuarios 
             WHERE dni = ? AND rol = 'user'`,
            [req.params.dni]
        );
        if (jugadores.length === 0) {
            return res.status(404).json({ msg: 'Jugador no encontrado' });
        }
        res.json(jugadores[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

// @route   PUT api/jugadores/:dni/nivel
// @desc    Update player level (category)
router.put('/:dni/nivel', async (req, res) => {
    try {
        const { nivel } = req.body;
        if (!nivel) {
            return res.status(400).json({ msg: 'Nivel es requerido' });
        }

        // Obtener nivel actual para guardarlo como nivel_anterior
        const [jugador] = await db.execute(
            `SELECT nivel FROM usuarios WHERE dni = ? AND rol = 'user'`,
            [req.params.dni]
        );

        if (jugador.length === 0) {
            return res.status(404).json({ msg: 'Jugador no encontrado' });
        }

        const nivelActual = jugador[0].nivel;

        await db.execute(
            `UPDATE usuarios SET nivel_anterior = ?, nivel = ?, fecha_recategorizacion = CURRENT_DATE() WHERE dni = ? AND rol = 'user'`,
            [nivelActual, nivel, req.params.dni]
        );
        res.json({ msg: 'Categoría actualizada correctamente' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

module.exports = router;
