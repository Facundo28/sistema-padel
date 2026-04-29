const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDb() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    });

    try {
        console.log('Creando base de datos si no existe...');
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
        console.log(`Base de datos '${process.env.DB_NAME}' lista.`);

        await connection.query(`USE \`${process.env.DB_NAME}\``);

        console.log('Creando tabla usuarios si no existe...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                dni VARCHAR(20) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                apellido VARCHAR(100) NOT NULL,
                nombre VARCHAR(100) NOT NULL,
                apodo VARCHAR(100),
                email VARCHAR(100) UNIQUE NOT NULL,
                sexo ENUM('Masculino', 'Femenino') NOT NULL,
                nivel VARCHAR(50) NOT NULL,
                telefono VARCHAR(20),
                tel_alternativo VARCHAR(20),
                fecha_nacimiento DATE,
                pais VARCHAR(50) DEFAULT 'Argentina',
                provincia VARCHAR(50),
                localidad VARCHAR(50),
                instagram VARCHAR(100),
                facebook VARCHAR(100),
                x VARCHAR(100),
                brazo_habil ENUM('Derecho', 'Izquierdo') NOT NULL,
                posicion ENUM('Lado Derecho de la Cancha', 'Lado Izquierdo de la Cancha', 'Indistinto') NOT NULL,
                rol ENUM('admin', 'user') DEFAULT 'user',
                foto_perfil VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Tabla usuarios lista.');

        console.log('Creando tabla ranking si no existe...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS ranking (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                apellido VARCHAR(100) NOT NULL,
                categoria VARCHAR(100) NOT NULL,
                puntos INT DEFAULT 0,
                estado ENUM('VIGENTE', 'NO VIGENTE') DEFAULT 'VIGENTE',
                segmento ENUM('LIBRES', 'MENORES', 'VETERANOS') DEFAULT 'LIBRES',
                periodo VARCHAR(50) NOT NULL,
                last_update DATE DEFAULT (CURRENT_DATE),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Tabla ranking lista.');

        console.log('Creando tabla torneos si no existe...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS torneos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(200) NOT NULL,
                descripcion TEXT,
                imagen VARCHAR(500),
                categoria VARCHAR(100) NOT NULL,
                fecha DATE NOT NULL,
                ubicacion VARCHAR(200),
                estado ENUM('INSCRIPCIONES', 'EN CURSO', 'FINALIZADO') DEFAULT 'INSCRIPCIONES',
                cupo INT DEFAULT 32,
                costo_inscripcion VARCHAR(100),
                localidad VARCHAR(100),
                modalidad VARCHAR(100),
                sistema_competencia VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Tabla torneos lista.');

        console.log('Creando tabla inscripciones si no existe...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS inscripciones (
                id INT AUTO_INCREMENT PRIMARY KEY,
                torneo_id INT NOT NULL,
                usuario_dni VARCHAR(20) NOT NULL,
                estado ENUM('CONFIRMADA', 'CANCELADA') DEFAULT 'CONFIRMADA',
                fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (torneo_id) REFERENCES torneos(id) ON DELETE CASCADE,
                UNIQUE KEY unique_inscripcion (torneo_id, usuario_dni)
            )
        `);
        console.log('Tabla inscripciones lista.');

        console.log('Creando tabla parejas si no existe...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS parejas (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user1_dni VARCHAR(20) NOT NULL,
                user2_dni VARCHAR(20) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user1_dni) REFERENCES usuarios(dni) ON DELETE CASCADE,
                FOREIGN KEY (user2_dni) REFERENCES usuarios(dni) ON DELETE CASCADE,
                UNIQUE KEY unique_pareja (user1_dni, user2_dni)
            )
        `);
        console.log('Tabla parejas lista.');

        console.log('Creando tabla torneo_zonas si no existe...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS torneo_zonas (
                id INT AUTO_INCREMENT PRIMARY KEY,
                torneo_id INT NOT NULL,
                nombre_zona VARCHAR(50) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (torneo_id) REFERENCES torneos(id) ON DELETE CASCADE
            )
        `);
        console.log('Tabla torneo_zonas lista.');

        console.log('Creando tabla torneo_participantes si no existe...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS torneo_participantes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                torneo_id INT NOT NULL,
                zona_id INT,
                pareja_id INT,
                pj INT DEFAULT 0,
                pg INT DEFAULT 0,
                pp INT DEFAULT 0,
                sf INT DEFAULT 0,
                sc INT DEFAULT 0,
                ds INT DEFAULT 0,
                gf INT DEFAULT 0,
                gc INT DEFAULT 0,
                dg INT DEFAULT 0,
                stb INT DEFAULT 0,
                pts INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (torneo_id) REFERENCES torneos(id) ON DELETE CASCADE,
                FOREIGN KEY (zona_id) REFERENCES torneo_zonas(id) ON DELETE SET NULL,
                FOREIGN KEY (pareja_id) REFERENCES parejas(id) ON DELETE CASCADE
            )
        `);
        console.log('Tabla torneo_participantes lista.');

        console.log('Creando tabla partidos si no existe...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS partidos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                torneo_id INT NOT NULL,
                zona_id INT NULL,
                pareja1_id INT NOT NULL,
                pareja2_id INT NOT NULL,
                fase ENUM('ZONAS', '8VOS', '4TOS', 'SEMIFINAL', 'FINAL') DEFAULT 'ZONAS',
                orden_fase INT DEFAULT 0,
                set1_p1 INT,
                set1_p2 INT,
                set2_p1 INT,
                set2_p2 INT,
                set3_p1 INT,
                set3_p2 INT,
                estado ENUM('PENDIENTE', 'JUGADO') DEFAULT 'PENDIENTE',
                fecha_partido DATETIME,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (torneo_id) REFERENCES torneos(id) ON DELETE CASCADE,
                FOREIGN KEY (zona_id) REFERENCES torneo_zonas(id) ON DELETE CASCADE,
                FOREIGN KEY (pareja1_id) REFERENCES parejas(id) ON DELETE CASCADE,
                FOREIGN KEY (pareja2_id) REFERENCES parejas(id) ON DELETE CASCADE
            )
        `);
        console.log('Tabla partidos lista.');

        console.log('Creando tabla circuit_events si no existe...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS circuit_events (
                id INT AUTO_INCREMENT PRIMARY KEY,
                titulo VARCHAR(200) NOT NULL,
                descripcion TEXT,
                fecha DATE NOT NULL,
                tipo ENUM('TORNEO', 'SOCIAL', 'CLINICA', 'OTRO') DEFAULT 'TORNEO',
                torneo_id INT NULL,
                imagen VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (torneo_id) REFERENCES torneos(id) ON DELETE SET NULL
            )
        `);
        console.log('Tabla circuit_events lista.');

        console.log('Creando tabla sponsors si no existe...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS sponsors (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(200) NOT NULL,
                logo_path VARCHAR(500),
                web_url VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Tabla sponsors lista.');

        console.log('Creando tabla galeria si no existe...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS galeria (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(200) DEFAULT 'Nueva Foto',
                image_path VARCHAR(500) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Tabla galeria lista.');

        console.log('Creando tabla comentarios si no existe...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS comentarios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                author_name VARCHAR(200) NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Tabla comentarios lista.');

        console.log('Creando tabla sedes si no existe...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS sedes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(200) NOT NULL,
                direccion VARCHAR(300) NOT NULL,
                localidad VARCHAR(100) NOT NULL,
                telefono VARCHAR(50),
                imagen VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Tabla sedes lista.');

        console.log('Creando tabla jugadores_estadisticas si no existe...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS jugadores_estadisticas (
                usuario_dni VARCHAR(20) PRIMARY KEY,
                partidos_jugados INT DEFAULT 0,
                partidos_ganados INT DEFAULT 0,
                partidos_perdidos INT DEFAULT 0,
                puntos INT DEFAULT 0,
                racha_actual INT DEFAULT 0,
                mejor_racha INT DEFAULT 0,
                FOREIGN KEY (usuario_dni) REFERENCES usuarios(dni) ON DELETE CASCADE
            )
        `);
        console.log('Tabla jugadores_estadisticas lista.');

        console.log('Creando tabla jugadores_partidos_recientes si no existe...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS jugadores_partidos_recientes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                usuario_dni VARCHAR(20) NOT NULL,
                fecha VARCHAR(50) NOT NULL,
                rival VARCHAR(200) NOT NULL,
                resultado ENUM('GANADO', 'PERDIDO') NOT NULL,
                score VARCHAR(50) NOT NULL,
                puntos_obtenidos VARCHAR(20) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (usuario_dni) REFERENCES usuarios(dni) ON DELETE CASCADE
            )
        `);
        console.log('Tabla jugadores_partidos_recientes lista.');

        console.log('Creando tabla noticias_categorias si no existe...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS noticias_categorias (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                color VARCHAR(50) DEFAULT '#152336',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Tabla noticias_categorias lista.');

        console.log('Creando tabla noticias si no existe...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS noticias (
                id INT AUTO_INCREMENT PRIMARY KEY,
                titulo VARCHAR(255) NOT NULL,
                fecha DATE NOT NULL,
                categoria_id INT NULL,
                imagen VARCHAR(500),
                contenido_html LONGTEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (categoria_id) REFERENCES noticias_categorias(id) ON DELETE SET NULL
            )
        `);
        console.log('Tabla noticias lista.');

    } catch (error) {
        console.error('Error inicializando la base de datos:', error);
    } finally {
        await connection.end();
    }
}

initDb();
