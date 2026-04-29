const express = require('express');
const router = express.Router();
const db = require('../config/db');

// @route   GET api/parejas/buscar/:dni
// @desc    Search for a user by DNI
router.get('/buscar/:dni', async (req, res) => {
    try {
        const [users] = await db.execute(
            'SELECT dni, nombre, apellido FROM usuarios WHERE dni = ?',
            [req.params.dni]
        );
        if (users.length === 0) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }
        res.json(users[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

// @route   POST api/parejas/vincular
// @desc    Link two users as a partner
router.post('/vincular', async (req, res) => {
    const { user1_dni, user2_dni } = req.body;

    if (!user1_dni || !user2_dni) {
        return res.status(400).json({ msg: 'Ambos DNI son requeridos' });
    }

    if (user1_dni === user2_dni) {
        return res.status(400).json({ msg: 'No podés vincularte con vos mismo' });
    }

    try {
        // Check if both users exist
        const [user1] = await db.execute('SELECT dni FROM usuarios WHERE dni = ?', [user1_dni]);
        const [user2] = await db.execute('SELECT dni FROM usuarios WHERE dni = ?', [user2_dni]);

        if (user1.length === 0 || user2.length === 0) {
            return res.status(404).json({ msg: 'Uno o ambos usuarios no existen' });
        }

        // Check if user1 already has a partner
        const [user1HasPartner] = await db.execute(
            'SELECT id FROM parejas WHERE user1_dni = ? OR user2_dni = ?',
            [user1_dni, user1_dni]
        );
        if (user1HasPartner.length > 0) {
            return res.status(400).json({ msg: 'Ya tenés una pareja vinculada' });
        }

        // Check if user2 already has a partner
        const [user2HasPartner] = await db.execute(
            'SELECT id FROM parejas WHERE user1_dni = ? OR user2_dni = ?',
            [user2_dni, user2_dni]
        );
        if (user2HasPartner.length > 0) {
            return res.status(400).json({ msg: 'Este usuario ya tiene una pareja vinculada' });
        }

        // Insert link
        const [result] = await db.execute(
            'INSERT INTO parejas (user1_dni, user2_dni) VALUES (?, ?)',
            [user1_dni, user2_dni]
        );

        res.status(201).json({ id: result.insertId, msg: '¡Vínculo de pareja creado exitosamente!' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

// @route   GET api/parejas/detalle/:dni
// @desc    Get current partner of a user
router.get('/detalle/:dni', async (req, res) => {
    try {
        const [parejas] = await db.execute(
            `SELECT p.*, 
                    u1.nombre as u1_nombre, u1.apellido as u1_apellido, u1.foto_perfil as u1_foto,
                    u2.nombre as u2_nombre, u2.apellido as u2_apellido, u2.foto_perfil as u2_foto
             FROM parejas p
             JOIN usuarios u1 ON p.user1_dni = u1.dni
             JOIN usuarios u2 ON p.user2_dni = u2.dni
             WHERE p.user1_dni = ? OR p.user2_dni = ?`,
            [req.params.dni, req.params.dni]
        );

        if (parejas.length === 0) {
            return res.json(null);
        }

        const pareja = parejas[0];
        const isUser1 = pareja.user1_dni === req.params.dni;
        
        const partnerInfo = {
            id: pareja.id,
            dni: isUser1 ? pareja.user2_dni : pareja.user1_dni,
            nombre: isUser1 ? pareja.u2_nombre : pareja.u1_nombre,
            apellido: isUser1 ? pareja.u2_apellido : pareja.u1_apellido,
            foto_perfil: isUser1 ? pareja.u2_foto : pareja.u1_foto,
        };

        res.json(partnerInfo);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

// @route   DELETE api/parejas/:id
// @desc    Unlink partner
router.delete('/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM parejas WHERE id = ?', [req.params.id]);
        res.json({ msg: 'Vínculo eliminado' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

module.exports = router;
