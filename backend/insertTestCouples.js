const db = require('./config/db');

async function insertTestCouples() {
    try {
        console.log('Buscando el torneo más reciente...');
        const [torneos] = await db.execute('SELECT id, nombre, categoria, cupo FROM torneos ORDER BY id DESC LIMIT 1');
        
        if (torneos.length === 0) {
            console.log('No hay torneos en la base de datos. Crea uno primero desde el panel.');
            process.exit(1);
        }

        const torneo = torneos[0];
        console.log(`Torneo encontrado: ${torneo.nombre} (ID: ${torneo.id}, Categoría: ${torneo.categoria}, Cupo: ${torneo.cupo})`);

        // Check how many are currently enrolled
        const [inscripciones] = await db.execute('SELECT COUNT(*) as c FROM inscripciones WHERE torneo_id = ?', [torneo.id]);
        const currentCount = inscripciones[0].c;

        const targetCount = torneo.cupo || 24;
        const toAdd = targetCount - currentCount;

        if (toAdd <= 0) {
            console.log('El torneo ya está lleno.');
            process.exit(0);
        }

        let parejasConfirmadas = 0;
        const randomPrefix = Math.floor(Math.random() * 90000) + 10000;

        for (let i = 1; i <= toAdd; i++) {
            const dni1 = `${randomPrefix}${i}1`;
            const dni2 = `${randomPrefix}${i}2`;

            console.log(`Insertando pareja adicional ${i} de ${toAdd}...`);

            // Insert User 1
            await db.execute(
                `INSERT IGNORE INTO usuarios (dni, nombre, apellido, email, password, sexo, nivel, brazo_habil, posicion, rol) 
                 VALUES (?, ?, ?, ?, ?, 'Masculino', ?, 'Derecho', 'Indistinto', 'user')`,
                [dni1, `ExtraJugador1_${i}`, `Test${i}`, `extra_jugador1_${randomPrefix}_${i}@test.com`, '123456', torneo.categoria]
            );

            // Insert User 2
            await db.execute(
                `INSERT IGNORE INTO usuarios (dni, nombre, apellido, email, password, sexo, nivel, brazo_habil, posicion, rol) 
                 VALUES (?, ?, ?, ?, ?, 'Masculino', ?, 'Derecho', 'Indistinto', 'user')`,
                [dni2, `ExtraJugador2_${i}`, `Test${i}`, `extra_jugador2_${randomPrefix}_${i}@test.com`, '123456', torneo.categoria]
            );

            // Insert Pareja
            const [parejaRes] = await db.execute(
                'INSERT INTO parejas (user1_dni, user2_dni) VALUES (?, ?)',
                [dni1, dni2]
            );
            const parejaId = parejaRes.insertId;

            // Enrol to tournament
            await db.execute(
                'INSERT INTO inscripciones (torneo_id, usuario_dni, estado) VALUES (?, ?, ?)',
                [torneo.id, dni1, 'CONFIRMADA']
            );

            parejasConfirmadas++;
        }

        console.log(`\n¡Éxito! Se han inscrito y confirmado ${parejasConfirmadas} parejas de prueba extra. Total: ${targetCount} parejas.`);
        console.log('Ya puedes ir al panel de administración del torneo, sección "Zonas" y presionar "Auto-armar Zonas".');

        
    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit(0);
    }
}

insertTestCouples();
