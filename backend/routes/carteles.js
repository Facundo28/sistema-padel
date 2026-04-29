const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, '../public/uploads/carteles');
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'cartel-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

const saveConfig = async (clave, valor) => {
    await db.execute(
        `INSERT INTO configuraciones (clave, valor) VALUES (?, ?) 
         ON DUPLICATE KEY UPDATE valor = ?`,
        [clave, valor, valor]
    );
};

// @route   GET api/carteles
// @desc    Obtener configuraciones actuales de carteles (hero y cards)
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT clave, valor FROM configuraciones WHERE clave LIKE 'hero_%' OR clave LIKE 'card_%'");
        const config = {};
        rows.forEach(r => { config[r.clave] = r.valor; });
        res.json(config);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

// @route   POST api/carteles/hero
// @desc    Actualizar el tipo y media del Hero
router.post('/hero', upload.single('media'), async (req, res) => {
    try {
        const { type } = req.body; // 'video' o 'foto'
        let media_path = req.file ? `/uploads/carteles/${req.file.filename}` : req.body.media_path;
        
        if (type) await saveConfig('hero_type', type);
        // Sometimes they just update type without uploading new media
        if (req.file) {
             await saveConfig('hero_media', media_path);
        } else if (media_path) {
             await saveConfig('hero_media', media_path); // En caso de q estemos reseteando o manteniendo
        }

        res.json({ msg: 'Hero actualizado', type, media_path });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor al actualizar hero');
    }
});

// @route   POST api/carteles/card
// @desc    Actualizar la imagen de una tarjeta específica
router.post('/card', upload.single('media'), async (req, res) => {
    try {
        const { card_id } = req.body; // 'card_circuito', 'card_sedes', 'card_fotos', 'card_sponsor'
        let media_path = req.file ? `/uploads/carteles/${req.file.filename}` : null;
        
        if (!card_id || !media_path) {
             return res.status(400).json({ msg: 'Faltan datos requeridos (card_id o media)' });
        }

        await saveConfig(card_id, media_path);
        res.json({ msg: 'Tarjeta actualizada', card_id, media_path });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor al actualizar card');
    }
});

module.exports = router;
