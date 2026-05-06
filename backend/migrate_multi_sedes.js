const db = require('./config/db');

async function migrate() {
    try {
        console.log('Creando tabla torneo_sedes...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS torneo_sedes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                torneo_id INT NOT NULL,
                sede_id INT NOT NULL,
                FOREIGN KEY (torneo_id) REFERENCES torneos(id) ON DELETE CASCADE,
                FOREIGN KEY (sede_id) REFERENCES sedes(id) ON DELETE CASCADE,
                UNIQUE KEY unique_torneo_sede (torneo_id, sede_id)
            )
        `);
        console.log('Tabla torneo_sedes lista.');

        console.log('Migrando sedes existentes de torneos a torneo_sedes...');
        const [torneos] = await db.query('SELECT id, sede_id FROM torneos WHERE sede_id IS NOT NULL');
        
        for (const torneo of torneos) {
            try {
                await db.query(
                    'INSERT IGNORE INTO torneo_sedes (torneo_id, sede_id) VALUES (?, ?)',
                    [torneo.id, torneo.sede_id]
                );
                console.log(`Migrada sede ${torneo.sede_id} para torneo ${torneo.id}`);
            } catch (err) {
                console.error(`Error migrando torneo ${torneo.id}:`, err.message);
            }
        }
        
        console.log('Migración completada.');

    } catch (error) {
        console.error('Error en la migración:', error);
    } finally {
        process.exit(0);
    }
}

migrate();
