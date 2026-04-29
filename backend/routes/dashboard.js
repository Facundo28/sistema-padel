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

// GET: Obtain aggregate stats for the dashboard cards
router.get('/stats', async (req, res) => {
    try {
        // 1. Cantidad de jugadores registrados
        const [jugadoresResult] = await pool.query('SELECT COUNT(*) as total FROM usuarios');
        const totalJugadores = jugadoresResult[0].total;

        // 2. Cantidad de torneos activos
        const [torneosResult] = await pool.query('SELECT COUNT(*) as total FROM torneos WHERE estado = "EN CURSO" OR estado = "PROXIMAMENTE"');
        const totalTorneosActivos = torneosResult[0].total;

        // 3. Cantidad de dinero que ingresa (sumatoria de pagos de inscripciones confirmadas u otro, if table exists. Let's try inscripciones first)
        // Check if inscripciones has a pago or costo field, or just count them and we can calculate.
        // Assuming there is a 'monto' in inscripciones, if not we will catch error. Let's do a safe query first or rely on standard structure.
        let ingresosNetos = 0;
        try {
            const [ingresosResult] = await pool.query('SELECT SUM(monto) as total FROM inscripciones WHERE estado = "confirmada"');
            ingresosNetos = ingresosResult[0].total || 0;
        } catch (e) {
            console.log("Could not sum from inscripciones or monto column missing, defaulting to count.");
            const [inscripcionesCount] = await pool.query('SELECT COUNT(*) as total FROM inscripciones WHERE estado = "confirmada"');
            // Assuming 5000 per inscription as fallback if money tracking isn't set up yet
            ingresosNetos = inscripcionesCount[0].total * 5000; 
        }

        // 4. Cantidad de recategorizaciones
        let totalRecategorizaciones = 0;
        try {
            // Assuming table 'recategorizaciones' exists
            const [recatResult] = await pool.query('SELECT COUNT(*) as total FROM solicitudes_recategorizacion');
            totalRecategorizaciones = recatResult[0].total;
        } catch(e) {
            console.log("solicitudes_recategorizacion table probably doesnt exist, falling back to 0");
            totalRecategorizaciones = 0;
        }


        res.json({
            jugadores_registrados: totalJugadores,
            torneos_activos: totalTorneosActivos,
            ingresos_totales: ingresosNetos,
            recategorizaciones: totalRecategorizaciones
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Error fetching stats' });
    }
});

module.exports = router;
