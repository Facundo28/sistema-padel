const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de multer para subir imágenes
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, '../public/uploads/galeria');
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'galeria-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// @route   GET api/galeria
// @desc    Obtener todas las fotos de galería
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM galeria ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

// @route   POST api/galeria
// @desc    Crear una o múltiples fotos de galería
router.post('/', upload.array('images', 10), async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ msg: 'No se subieron imágenes' });
    }

    const { title } = req.body;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();
        const uploadedImages = [];

        for (const file of req.files) {
            const image_path = `/uploads/galeria/${file.filename}`;
            const [result] = await connection.execute(
                'INSERT INTO galeria (title, image_path) VALUES (?, ?)',
                [title || 'Nueva Foto', image_path]
            );
            
            uploadedImages.push({
                id: result.insertId,
                title: title || 'Nueva Foto',
                image_path
            });
        }

        await connection.commit();
        res.status(201).json({
            images: uploadedImages,
            msg: `${req.files.length} imagen(es) subida(s) exitosamente`
        });
    } catch (err) {
        await connection.rollback();
        console.error(err.message);
        res.status(500).send('Error del servidor');
    } finally {
        connection.release();
    }
});

// @route   DELETE api/galeria/:id
// @desc    Eliminar una foto de la galería
router.delete('/:id', async (req, res) => {
    try {
        const [existing] = await db.execute('SELECT id, image_path FROM galeria WHERE id = ?', [req.params.id]);
        if (existing.length === 0) {
            return res.status(404).json({ msg: 'Foto no encontrada' });
        }

        const imagePath = existing[0].image_path;
        if (imagePath) {
            const fullPath = path.join(__dirname, '..', 'public', imagePath);
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
            }
        }

        await db.execute('DELETE FROM galeria WHERE id = ?', [req.params.id]);
        res.json({ msg: 'Foto eliminada' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

module.exports = router;
