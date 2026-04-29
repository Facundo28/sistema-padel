const db = require('./config/db');

async function migrateConfig() {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS configuraciones (
                clave VARCHAR(100) PRIMARY KEY,
                valor VARCHAR(255) NOT NULL,
                descripcion TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('Tabla configuraciones creada/verificada.');

        // Insert default maintenance mode row
        await db.execute(`
            INSERT IGNORE INTO configuraciones (clave, valor, descripcion) 
            VALUES ('mantenimiento_recategorizaciones', 'false', 'Modo de mantenimiento para página pública durante recategorizaciones')
        `);
        console.log('Valor por defecto para mantenimiento insertado.');

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        process.exit();
    }
}

migrateConfig();
