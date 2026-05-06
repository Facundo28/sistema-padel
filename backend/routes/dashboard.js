const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET: Obtain aggregate stats for the dashboard cards
router.get('/stats', async (req, res) => {
    try {
        // 1. Cantidad de jugadores registrados
        const [jugadoresResult] = await db.query('SELECT COUNT(*) as total FROM usuarios');
        const totalJugadores = jugadoresResult[0].total;

        // 2. Cantidad de torneos activos
        const [torneosResult] = await db.query('SELECT COUNT(*) as total FROM torneos WHERE estado = "EN CURSO" OR estado = "INSCRIPCIONES"');
        const totalTorneosActivos = torneosResult[0].total;

        // 3. Cantidad de dinero que ingresa
        let ingresosNetos = 0;
        try {
            // Check if monto exists, otherwise count and multiply by 5000 as fallback
            const [inscripcionesCount] = await db.query('SELECT COUNT(*) as total FROM inscripciones WHERE estado = "CONFIRMADA"');
            ingresosNetos = inscripcionesCount[0].total * 5000; 
        } catch (e) {
            ingresosNetos = 0;
        }

        // 4. Cantidad de recategorizaciones
        let totalRecategorizaciones = 0;
        try {
            const [recatResult] = await db.query('SELECT COUNT(*) as total FROM solicitudes_recategorizacion');
            totalRecategorizaciones = recatResult[0].total;
        } catch(e) {
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
