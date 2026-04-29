const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración de la conexión a la base de datos
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// --- ESTADÍSTICAS GLOBALES DEL JUGADOR ---

// GET: Obtener las estadísticas de un jugador por su DNI
router.get('/:dni', async (req, res) => {
    try {
        const { dni } = req.params;
        const [rows] = await pool.query('SELECT * FROM jugadores_estadisticas WHERE usuario_dni = ?', [dni]);
        
        if (rows.length === 0) {
            // Si no existen estadísticas, devolvemos 0 para todo
            return res.json({
                usuario_dni: dni,
                partidos_jugados: 0,
                partidos_ganados: 0,
                partidos_perdidos: 0,
                puntos: 0,
                racha_actual: 0,
                mejor_racha: 0
            });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener estadísticas del jugador:', error);
        res.status(500).json({ message: 'Error en el servidor al obtener las estadísticas' });
    }
});

// PUT: Actualizar las estadísticas de un jugador (o crearlas si no existen)
router.put('/:dni', async (req, res) => {
    try {
        const { dni } = req.params;
        const { partidos_jugados, partidos_ganados, partidos_perdidos, puntos, racha_actual, mejor_racha } = req.body;

        // Comprovamos si ya existe el registro
        const [existing] = await pool.query('SELECT usuario_dni FROM jugadores_estadisticas WHERE usuario_dni = ?', [dni]);
        
        if (existing.length === 0) {
            // Insertar
            await pool.query(
                `INSERT INTO jugadores_estadisticas 
                (usuario_dni, partidos_jugados, partidos_ganados, partidos_perdidos, puntos, racha_actual, mejor_racha) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [dni, partidos_jugados || 0, partidos_ganados || 0, partidos_perdidos || 0, puntos || 0, racha_actual || 0, mejor_racha || 0]
            );
        } else {
            // Actualizar
            await pool.query(
                `UPDATE jugadores_estadisticas SET 
                partidos_jugados = ?, partidos_ganados = ?, partidos_perdidos = ?, puntos = ?, racha_actual = ?, mejor_racha = ? 
                WHERE usuario_dni = ?`,
                [partidos_jugados || 0, partidos_ganados || 0, partidos_perdidos || 0, puntos || 0, racha_actual || 0, mejor_racha || 0, dni]
            );
        }
        
        res.json({ message: 'Estadísticas guardadas exitosamente' });
    } catch (error) {
        console.error('Error al actualizar estadísticas del jugador:', error);
        res.status(500).json({ message: 'Error en el servidor al actualizar las estadísticas' });
    }
});

// --- PARTIDOS RECIENTES DEL JUGADOR ---

// GET: Obtener los partidos recientes de un jugador por su DNI
router.get('/partidos/:dni', async (req, res) => {
    try {
        const { dni } = req.params;
        const [rows] = await pool.query('SELECT * FROM jugadores_partidos_recientes WHERE usuario_dni = ? ORDER BY created_at DESC', [dni]);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener los partidos recientes:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// POST: Agregar un partido reciente a un jugador
router.post('/partidos', async (req, res) => {
    try {
        const { usuario_dni, fecha, rival, resultado, score, puntos_obtenidos } = req.body;

        if (!usuario_dni || !fecha || !rival || !resultado || !score || !puntos_obtenidos) {
            return res.status(400).json({ message: 'Todos los campos del partido son obligatorios' });
        }

        const [result] = await pool.query(
            `INSERT INTO jugadores_partidos_recientes 
            (usuario_dni, fecha, rival, resultado, score, puntos_obtenidos) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [usuario_dni, fecha, rival, resultado, score, puntos_obtenidos]
        );

        res.status(201).json({ id: result.insertId, message: 'Partido agregado exitosamente' });
    } catch (error) {
        console.error('Error al agregar partido reciente:', error);
        res.status(500).json({ message: 'Error en el servidor al agregar el partido' });
    }
});

// DELETE: Eliminar un partido reciente por su ID
router.delete('/partidos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM jugadores_partidos_recientes WHERE id = ?', [id]);
        res.json({ message: 'Partido eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar partido reciente:', error);
        res.status(500).json({ message: 'Error en el servidor al eliminar el partido' });
    }
});

module.exports = router;
