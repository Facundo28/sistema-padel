const db = require('./config/db');

async function migrate() {
    try {
        await db.execute('ALTER TABLE usuarios ADD COLUMN nivel_anterior VARCHAR(50) DEFAULT NULL;');
        console.log('Migration successful: nivel_anterior column added');
    } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log('Column already exists');
        } else {
            console.error('Migration failed:', err);
        }
    } finally {
        process.exit();
    }
}

migrate();
