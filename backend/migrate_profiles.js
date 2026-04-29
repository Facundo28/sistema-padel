const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('Agregando foto_perfil y apodo a la tabla usuarios si no existen...');
        await connection.query(`
            ALTER TABLE usuarios 
            ADD COLUMN IF NOT EXISTS foto_perfil VARCHAR(255) DEFAULT NULL,
            ADD COLUMN IF NOT EXISTS apodo VARCHAR(100) DEFAULT NULL;
        `);
        console.log('Columnas agregadas con éxito.');
    } catch (err) {
        console.error('Error alterando la tabla:', err);
    } finally {
        await connection.end();
        process.exit();
    }
}

migrate();
