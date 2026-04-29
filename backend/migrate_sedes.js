const mysql = require('mysql2/promise');
require('dotenv').config({ path: __dirname + '/.env' });

async function migrate() {
    console.log("Connecting to DB:", process.env.DB_HOST);
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        // Add sede_id to torneos
        try {
            await connection.execute('ALTER TABLE torneos ADD COLUMN sede_id INT NULL');
            console.log("Added sede_id to torneos");
        } catch(e) {
            console.log("torneos.sede_id might already exist:", e.message);
        }

        // Add sede_id to partidos
        try {
            await connection.execute('ALTER TABLE partidos ADD COLUMN sede_id INT NULL');
            console.log("Added sede_id to partidos");
        } catch(e) {
            console.log("partidos.sede_id might already exist:", e.message);
        }

    } catch(err) {
        console.error("Migration error:", err);
    } finally {
        await connection.end();
    }
}

migrate();
