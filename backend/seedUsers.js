const db = require('./config/db');
const bcrypt = require('bcryptjs');

const users = [
    { dni: '10000001', password: 'password123', nombre: 'Carlos', apellido: 'Gomez', email: 'carlos@test.com', nivel: 'Caballeros Octava (8va C)', sexo: 'Masculino' },
    { dni: '10000002', password: 'password123', nombre: 'Lucia', apellido: 'Fernandez', email: 'lucia@test.com', nivel: 'Caballeros Septima (7ma C)', sexo: 'Femenino' },
    { dni: '10000003', password: 'password123', nombre: 'Pedro', apellido: 'Rodriguez', email: 'pedro@test.com', nivel: 'Caballeros Sexta (6ta C)', sexo: 'Masculino' },
    { dni: '10000004', password: 'password123', nombre: 'Sofia', apellido: 'Martinez', email: 'sofia@test.com', nivel: 'Caballeros Quinta (5ta C)', sexo: 'Femenino' },
    { dni: '10000005', password: 'password123', nombre: 'Juan', apellido: 'Sosa', email: 'juan@test.com', nivel: 'Caballeros Cuarta (4ta C)', sexo: 'Masculino' }
];

async function seed() {
    console.log('Iniciando carga de usuarios de prueba...');
    const salt = await bcrypt.genSalt(10);

    for (const u of users) {
        try {
            const hashedPassword = await bcrypt.hash(u.password, salt);
            const sql = `INSERT INTO usuarios (
                dni, password, apellido, nombre, email, sexo, nivel,
                brazo_habil, posicion, rol
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            
            const values = [
                u.dni, hashedPassword, u.apellido, u.nombre, u.email, u.sexo, u.nivel,
                'Derecho', 'Reves', 'user'
            ];

            await db.execute(sql, values);
            console.log(`Usuario ${u.nombre} ${u.apellido} (DNI: ${u.dni}) creado.`);
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                console.log(`Usuario DNI: ${u.dni} ya existe.`);
            } else {
                console.error(`Error creando ${u.dni}:`, err.message);
            }
        }
    }
    console.log('Carga finalizada.');
    process.exit();
}

seed();
