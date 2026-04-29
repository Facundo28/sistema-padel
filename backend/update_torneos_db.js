const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateDb() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        console.log('Actualizando tabla torneos con nuevas columnas...');
        await connection.query(`
            ALTER TABLE torneos 
            ADD COLUMN costo_inscripcion VARCHAR(100),
            ADD COLUMN localidad VARCHAR(100),
            ADD COLUMN modalidad VARCHAR(100),
            ADD COLUMN sistema_competencia VARCHAR(100)
        `);
        console.log('Columnas añadidas correctamente.');
    } catch (error) {
        if (error.code === 'ER_DUP_COLUMN_NAME') {
            console.log('Las columnas ya existen.');
        } else {
            console.error('Error actualizando la base de datos:', error);
        }
    } finally {
        await connection.end();
    }
}

updateDb();
