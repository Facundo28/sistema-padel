const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de almacenamiento para fotos de perfil
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../public/uploads/profiles');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, req.params.dni + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// @route   POST api/auth/register
// @desc    Register user
router.post(
    '/register',
    [
        body('dni', 'DNI es requerido').not().isEmpty(),
        body('email', 'Email válido es requerido').isEmail(),
        body('password', 'La contraseña debe tener al menos 6 caracteres').isLength({ min: 6 }),
        body('nombre', 'Nombre es requerido').not().isEmpty(),
        body('apellido', 'Apellido es requerido').not().isEmpty(),
        body('sexo', 'Sexo es requerido').not().isEmpty(),
        body('nivel', 'Nivel de jugador es requerido').not().isEmpty(),
        body('brazo_habil', 'Brazo hábil es requerido').not().isEmpty(),
        body('posicion', 'Posición habitual es requerida').not().isEmpty(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            dni, password, apellido, nombre, email, sexo, nivel,
            telefono, tel_alternativo, fecha_nacimiento, pais,
            provincia, localidad, instagram, facebook, x,
            brazo_habil, posicion
        } = req.body;

        try {
            // Check if user exists (by DNI or Email)
            const [existingUser] = await db.execute(
                'SELECT id FROM usuarios WHERE dni = ? OR email = ?',
                [dni, email]
            );

            if (existingUser.length > 0) {
                return res.status(400).json({ errors: [{ msg: 'El usuario ya existe con ese DNI o Email' }] });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Check if this is the first user
            const [userCount] = await db.execute('SELECT COUNT(*) as count FROM usuarios');
            const role = userCount[0].count === 0 ? 'admin' : 'user';

            // Insert user
            const sql = `INSERT INTO usuarios (
                dni, password, apellido, nombre, email, sexo, nivel,
                telefono, tel_alternativo, fecha_nacimiento, pais,
                provincia, localidad, instagram, facebook, x,
                brazo_habil, posicion, rol
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            const values = [
                dni, hashedPassword, apellido, nombre, email, sexo, nivel,
                telefono, tel_alternativo, fecha_nacimiento, pais,
                provincia, localidad, instagram, facebook, x,
                brazo_habil, posicion, role
            ];

            await db.execute(sql, values);

            res.status(201).json({
                msg: 'Usuario registrado exitosamente',
                role: role
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Error del servidor');
        }
    }
);

// @route   POST api/auth/login
// @desc    Authenticate user & get role
router.post(
    '/login',
    [
        body('dni', 'DNI es requerido').not().isEmpty(),
        body('password', 'Contraseña es requerida').exists(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { dni, password } = req.body;

        try {
            const [users] = await db.execute(
                'SELECT dni, password, nombre, apellido, rol FROM usuarios WHERE dni = ?',
                [dni]
            );

            if (users.length === 0) {
                return res.status(400).json({ errors: [{ msg: 'Credenciales inválidas' }] });
            }

            const user = users[0];

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ errors: [{ msg: 'Credenciales inválidas' }] });
            }

            res.json({
                dni: user.dni,
                nombre: user.nombre,
                apellido: user.apellido,
                role: user.rol
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Error del servidor');
        }
    }
);

// @route   GET api/auth/profile/:dni
// @desc    Get full user profile
router.get('/profile/:dni', async (req, res) => {
    try {
        const [users] = await db.execute(
            `SELECT dni, apellido, nombre, apodo, email, sexo, nivel, nivel_anterior, telefono, tel_alternativo, 
             fecha_nacimiento, pais, provincia, localidad, instagram, facebook, x, 
             brazo_habil, posicion, rol, foto_perfil, created_at FROM usuarios WHERE dni = ?`,
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

// @route   POST api/auth/profile/:dni/foto
// @desc    Upload profile picture
router.post('/profile/:dni/foto', upload.single('foto'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'No se subió ninguna imagen' });
        }

        const fotoPath = '/uploads/profiles/' + req.file.filename;

        await db.execute(
            'UPDATE usuarios SET foto_perfil = ? WHERE dni = ?',
            [fotoPath, req.params.dni]
        );

        res.json({ msg: 'Foto de perfil actualizada', foto_perfil: fotoPath });
    } catch (err) {
        console.error('Error uploading profile picture:', err);
        res.status(500).send('Error del servidor');
    }
});

module.exports = router;
