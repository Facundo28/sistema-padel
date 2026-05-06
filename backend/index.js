const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Servir la carpeta uploads para que las imágenes sean accesibles vía web
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/ranking', require('./routes/ranking'));
app.use('/api/torneos', require('./routes/torneos'));
app.use('/api/inscripciones', require('./routes/inscripciones'));
app.use('/api/parejas', require('./routes/parejas'));
app.use('/api/circuito', require('./routes/circuito'));
app.use('/api/sedes', require('./routes/sedes'));
app.use('/api/sponsors', require('./routes/sponsors'));
app.use('/api/galeria', require('./routes/galeria'));
app.use('/api/jugadores', require('./routes/jugadores'));
app.use('/api/comentarios', require('./routes/comentarios'));
app.use('/api/estadisticas', require('./routes/estadisticas'));
app.use('/api/noticias', require('./routes/noticias'));
app.use('/api/configuraciones', require('./routes/configuraciones'));
app.use('/api/carteles', require('./routes/carteles'));
app.use('/api/dashboard', require('./routes/dashboard'));

app.get('/', (req, res) => {
    res.send('Padel Management API is running');
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is connected' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
