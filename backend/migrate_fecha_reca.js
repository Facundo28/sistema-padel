const mysql = require('mysql2/promise');
require('dotenv').config();

async function addFechaRecategorizacionColumn() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'padel_db'
        });

        console.log('Connected to MySQL databse. Checking for fecha_recategorizacion column...');

        const [rows] = await connection.execute(`
            SELECT COUNT(*) AS count 
            FROM information_schema.columns 
            WHERE table_schema = ? 
              AND table_name = 'usuarios' 
              AND column_name = 'fecha_recategorizacion'
        `, [process.env.DB_NAME || 'padel_db']);

        if (rows[0].count === 0) {
            console.log('Adding fecha_recategorizacion column...');
            await connection.execute(`
                ALTER TABLE usuarios 
                ADD COLUMN fecha_recategorizacion DATE DEFAULT NULL
            `);
            console.log('Successfully added fecha_recategorizacion column to usuarios table.');
            
            // Set existing players who have a previous level to today's date so it's not null
            await connection.execute(`
                UPDATE usuarios 
                SET fecha_recategorizacion = CURRENT_DATE() 
                WHERE nivel_anterior IS NOT NULL
            `);
        } else {
            console.log('Column fecha_recategorizacion already exists.');
        }

        await connection.end();
        console.log('Setup finished.');
    } catch (error) {
        console.error('Migration failed:', error);
    }
}

addFechaRecategorizacionColumn();
