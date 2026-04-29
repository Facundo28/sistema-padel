const mysql = require('mysql2/promise');
const config = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'padel_gestion'
};

async function testApi() {
    const db = await mysql.createConnection(config);
    const torneoId = 1;
    try {
        const [partidos] = await db.execute(
            `SELECT m.*, 
             u1a.apellido as u1a_apellido, u1a.nombre as u1a_nombre, u1a.localidad as u1a_localidad,
             u1b.apellido as u1b_apellido, u1b.nombre as u1b_nombre, u1b.localidad as u1b_localidad,
             u2a.apellido as u2a_apellido, u2a.nombre as u2a_nombre, u2a.localidad as u2a_localidad,
             u2b.apellido as u2b_apellido, u2b.nombre as u2b_nombre, u2b.localidad as u2b_localidad
             FROM partidos m
             JOIN parejas p1 ON m.pareja1_id = p1.id
             JOIN usuarios u1a ON p1.user1_dni = u1a.dni
             JOIN usuarios u1b ON p1.user2_dni = u1b.dni
             JOIN parejas p2 ON m.pareja2_id = p2.id
             JOIN usuarios u2a ON p2.user1_dni = u2a.dni
             JOIN usuarios u2b ON p2.user2_dni = u2b.dni
             WHERE m.torneo_id = ? AND m.fase != 'ZONAS'
             ORDER BY m.fase DESC, m.orden_fase ASC`,
            [torneoId]
        );

        console.log('--- API RAW FETCH ---');
        console.log('Count:', partidos.length);
        console.log(JSON.stringify(partidos, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await db.end();
    }
}

testApi();
