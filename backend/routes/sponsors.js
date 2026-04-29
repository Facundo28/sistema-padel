const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de multer para subir imágenes
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, '../public/uploads/sponsors');
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'sponsor-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// @route   GET api/sponsors
// @desc    Obtener todos los sponsors
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM sponsors ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

// @route   POST api/sponsors
// @desc    Crear un nuevo sponsor
router.post('/', upload.single('logo'), async (req, res) => {
    const { name, web_url } = req.body;
    const logo_path = req.file ? `/uploads/sponsors/${req.file.filename}` : null;

    if (!name) {
        return res.status(400).json({ msg: 'El nombre es requerido' });
    }

    try {
        const [result] = await db.execute(
            'INSERT INTO sponsors (name, logo_path, web_url) VALUES (?, ?, ?)',
            [name, logo_path, web_url || null]
        );

        res.status(201).json({
            id: result.insertId,
            name,
            logo_path,
            web_url,
            msg: 'Sponsor guardado exitosamente'
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

// @route   DELETE api/sponsors/:id
// @desc    Eliminar un sponsor
router.delete('/:id', async (req, res) => {
    try {
        const [existing] = await db.execute('SELECT id, logo_path FROM sponsors WHERE id = ?', [req.params.id]);
        if (existing.length === 0) {
            return res.status(404).json({ msg: 'Sponsor no encontrado' });
        }

        const logoPath = existing[0].logo_path;
        if (logoPath) {
            const fullPath = path.join(__dirname, '..', 'public', logoPath);
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
            }
        }

        await db.execute('DELETE FROM sponsors WHERE id = ?', [req.params.id]);
        res.json({ msg: 'Sponsor eliminado' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

module.exports = router;
