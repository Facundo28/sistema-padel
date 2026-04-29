const express = require('express');
const router = express.Router();
const db = require('../config/db');

// @route   GET api/configuraciones/mantenimiento
// @desc    Get maintenance status
router.get('/mantenimiento', async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT valor FROM configuraciones WHERE clave = 'mantenimiento_recategorizaciones'`
        );
        
        let isMaintenance = false;
        if (rows.length > 0) {
            isMaintenance = rows[0].valor === 'true';
        }
        
        res.json({ mantenimiento: isMaintenance });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

// @route   POST api/configuraciones/mantenimiento
// @desc    Update maintenance status
router.post('/mantenimiento', async (req, res) => {
    try {
        const { mantenimiento } = req.body;
        const valorStr = mantenimiento ? 'true' : 'false';

        await db.execute(
            `INSERT INTO configuraciones (clave, valor) VALUES ('mantenimiento_recategorizaciones', ?) 
             ON DUPLICATE KEY UPDATE valor = ?`,
            [valorStr, valorStr]
        );
        
        res.json({ msg: 'Estado de mantenimiento actualizado', mantenimiento });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

module.exports = router;
