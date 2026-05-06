const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../config/db');

// @route   GET api/torneos
// @desc    Get all tournaments (optionally filter by estado)
router.get('/', async (req, res) => {
    try {
        const { estado } = req.query;
        let sql = `SELECT t.*, 
                   (SELECT GROUP_CONCAT(s.nombre SEPARATOR ', ') FROM torneo_sedes ts JOIN sedes s ON ts.sede_id = s.id WHERE ts.torneo_id = t.id) as sedes_nombres,
                   (SELECT GROUP_CONCAT(ts.sede_id) FROM torneo_sedes ts WHERE ts.torneo_id = t.id) as sede_ids_raw,
                   (SELECT COUNT(*) FROM inscripciones i WHERE i.torneo_id = t.id AND i.estado = 'CONFIRMADA') as inscriptos 
                   FROM torneos t`;
        const params = [];

        if (estado) {
            sql += ' WHERE t.estado = ?';
            params.push(estado);
        }

        sql += ' ORDER BY t.fecha ASC';

        const [rows] = await db.execute(sql, params);
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

// @route   GET api/torneos/:id
// @desc    Get tournament by ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM torneos WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ msg: 'Torneo no encontrado' });
        }
        
        const torneo = rows[0];

        // Fetch sedes
        const [sedes] = await db.execute(
            `SELECT s.* FROM sedes s 
             JOIN torneo_sedes ts ON s.id = ts.sede_id 
             WHERE ts.torneo_id = ?`,
            [req.params.id]
        );
        
        torneo.sedes = sedes;
        
        res.json(torneo);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

// @route   POST api/torneos
// @desc    Create a tournament (admin)
router.post(
    '/',
    [
        body('nombre', 'Nombre es requerido').not().isEmpty(),
        body('categoria', 'Categoría es requerida').not().isEmpty(),
        body('fecha', 'Fecha es requerida').not().isEmpty(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { 
            nombre, descripcion, imagen, categoria, fecha, ubicacion, estado, cupo,
            costo_inscripcion, localidad, modalidad, sistema_competencia, sede_id, sede_ids
        } = req.body;

        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const sql = `INSERT INTO torneos (
                            nombre, descripcion, imagen, categoria, fecha, ubicacion, 
                            estado, cupo, costo_inscripcion, localidad, modalidad, sistema_competencia, sede_id
                         )
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const values = [
                nombre,
                descripcion || null,
                imagen || null,
                categoria,
                fecha,
                ubicacion || null,
                estado || 'INSCRIPCIONES',
                cupo || 32,
                costo_inscripcion || null,
                localidad || null,
                modalidad || null,
                sistema_competencia || null,
                sede_id || null
            ];

            const [result] = await connection.execute(sql, values);
            const tournamentId = result.insertId;

            // Insert into torneo_sedes
            const finalSedeIds = sede_ids || (sede_id ? [sede_id] : []);
            if (finalSedeIds.length > 0) {
                for (const sId of finalSedeIds) {
                    await connection.execute(
                        'INSERT INTO torneo_sedes (torneo_id, sede_id) VALUES (?, ?)',
                        [tournamentId, sId]
                    );
                }
            }

            // Auto-insert into circuit_events
            try {
                await connection.execute(
                    'INSERT INTO circuit_events (titulo, descripcion, fecha, tipo, torneo_id, imagen) VALUES (?, ?, ?, ?, ?, ?)',
                    [nombre, descripcion || null, fecha, 'TORNEO', tournamentId, imagen || null]
                );
            } catch (circuitErr) {
                console.error("Error auto-adding to circuit_events:", circuitErr);
            }

            await connection.commit();

            res.status(201).json({
                id: tournamentId,
                nombre, descripcion, imagen, categoria, fecha, ubicacion,
                estado: estado || 'INSCRIPCIONES',
                cupo: cupo || 32,
                costo_inscripcion, localidad, modalidad, sistema_competencia,
                msg: '¡Torneo creado!'
            });
        } catch (err) {
            await connection.rollback();
            console.error(err.message);
            res.status(500).send('Error del servidor');
        } finally {
            connection.release();
        }
    }
);

// @route   PUT api/torneos/:id
// @desc    Update a tournament
router.put('/:id', async (req, res) => {
    const { 
        nombre, descripcion, imagen, categoria, fecha, ubicacion, estado, cupo,
        costo_inscripcion, localidad, modalidad, sistema_competencia, sede_id, sede_ids
    } = req.body;

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [existing] = await connection.execute('SELECT id FROM torneos WHERE id = ?', [req.params.id]);
        if (existing.length === 0) {
            await connection.rollback();
            return res.status(404).json({ msg: 'Torneo no encontrado' });
        }

        // Formatear fecha si viene en formato ISO (del frontend)
        let formattedFecha = fecha;
        if (fecha && typeof fecha === 'string' && fecha.includes('T')) {
            formattedFecha = fecha.split('T')[0];
        }

        const sql = `UPDATE torneos SET 
                     nombre = ?, descripcion = ?, imagen = ?, categoria = ?, 
                     fecha = ?, ubicacion = ?, estado = ?, cupo = ?,
                     costo_inscripcion = ?, localidad = ?, modalidad = ?, sistema_competencia = ?, sede_id = ?
                     WHERE id = ?`;
        const values = [
            nombre, 
            descripcion || null, 
            imagen || null, 
            categoria, 
            formattedFecha, 
            ubicacion || null, 
            estado, 
            cupo || 32,
            costo_inscripcion || null, 
            localidad || null, 
            modalidad || null, 
            sistema_competencia || null, 
            sede_id || (sede_ids && sede_ids.length > 0 ? sede_ids[0] : null),
            req.params.id
        ];

        await connection.execute(sql, values);

        // Update torneo_sedes
        if (sede_ids) {
            // Remove old associations
            await connection.execute('DELETE FROM torneo_sedes WHERE torneo_id = ?', [req.params.id]);
            
            // Insert new ones
            if (sede_ids.length > 0) {
                for (const sId of sede_ids) {
                    await connection.execute(
                        'INSERT INTO torneo_sedes (torneo_id, sede_id) VALUES (?, ?)',
                        [req.params.id, sId]
                    );
                }
            }
        }

        await connection.commit();
        res.json({ msg: 'Torneo actualizado', id: parseInt(req.params.id) });
    } catch (err) {
        await connection.rollback();
        console.error('Error al actualizar torneo:', err.message);
        res.status(500).json({ msg: 'Error del servidor al actualizar el torneo', error: err.message });
    } finally {
        connection.release();
    }
});

// @route   DELETE api/torneos/:id
// @desc    Delete a tournament
router.delete('/:id', async (req, res) => {
    try {
        const [existing] = await db.execute('SELECT id FROM torneos WHERE id = ?', [req.params.id]);
        if (existing.length === 0) {
            return res.status(404).json({ msg: 'Torneo no encontrado' });
        }
        await db.execute('DELETE FROM torneos WHERE id = ?', [req.params.id]);
        res.json({ msg: 'Torneo eliminado' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

// @route   GET api/torneos/:id/clasificacion
// @desc    Get zones, participants and matches for a tournament
router.get('/:id/clasificacion', async (req, res) => {
    try {
        const torneoId = req.params.id;

        // 1. Get Zones
        const [zonas] = await db.execute('SELECT id, nombre_zona as nombre FROM torneo_zonas WHERE torneo_id = ?', [torneoId]);

        // 2. Get Participants with Couple names
        const [participantes] = await db.execute(`
            SELECT tp.*, p.user1_dni, p.user2_dni, 
                   u1.nombre as u1_nombre, u1.apellido as u1_apellido,
                   u2.nombre as u2_nombre, u2.apellido as u2_apellido
            FROM torneo_participantes tp
            JOIN parejas p ON tp.pareja_id = p.id
            JOIN usuarios u1 ON p.user1_dni = u1.dni
            JOIN usuarios u2 ON p.user2_dni = u2.dni
            WHERE tp.torneo_id = ?
        `, [torneoId]);

        // 3. Get Matches
        const [partidos] = await db.execute(`
            SELECT p.*, s.nombre as sede_nombre,
                   u1a.apellido as u1a_apellido, u1a.nombre as u1a_nombre, u1a.localidad as u1a_localidad,
                   u1b.apellido as u1b_apellido, u1b.nombre as u1b_nombre, u1b.localidad as u1b_localidad,
                   u2a.apellido as u2a_apellido, u2a.nombre as u2a_nombre, u2a.localidad as u2a_localidad,
                   u2b.apellido as u2b_apellido, u2b.nombre as u2b_nombre, u2b.localidad as u2b_localidad
            FROM partidos p
            LEFT JOIN sedes s ON p.sede_id = s.id
            LEFT JOIN parejas par1 ON p.pareja1_id = par1.id
            LEFT JOIN usuarios u1a ON par1.user1_dni = u1a.dni
            LEFT JOIN usuarios u1b ON par1.user2_dni = u1b.dni
            LEFT JOIN parejas par2 ON p.pareja2_id = par2.id
            LEFT JOIN usuarios u2a ON par2.user1_dni = u2a.dni
            LEFT JOIN usuarios u2b ON par2.user2_dni = u2b.dni
            WHERE p.torneo_id = ?
        `, [torneoId]);

        // Helper to get zone letter
        const getZoneLetter = (name) => {
            const match = name.match(/ZONA\s+([A-Z])/i);
            if (match) return match[1].toUpperCase();
            // Fallback for old numeric names if any
            const num = name.match(/\d+/);
            if (num) return String.fromCharCode(64 + parseInt(num[0]));
            return 'Z';
        };

        const formatLocality = (l1, l2) => {
            if (l1 && l2) return `${l1} / ${l2}`;
            return l1 || l2 || '';
        };

        const getStatus = (m) => {
            if (m.estado !== 'JUGADO') return { p1: '', p2: '' };
            let p1_sets = 0; let p2_sets = 0;
            if (m.set1_p1 > m.set1_p2) p1_sets++; else if (m.set1_p2 > m.set1_p1) p2_sets++;
            if (m.set2_p1 > m.set2_p2) p1_sets++; else if (m.set2_p2 > m.set2_p1) p2_sets++;
            if (m.set3_p1 !== null && m.set3_p2 !== null) {
                if (m.set3_p1 > m.set3_p2) p1_sets++; else if (m.set3_p2 > m.set3_p1) p2_sets++;
            }
            if (p1_sets > p2_sets) return { p1: 'GANADOR', p2: 'PERDEDOR' };
            if (p2_sets > p1_sets) return { p1: 'PERDEDOR', p2: 'GANADOR' };
            const p1_games = (m.set1_p1 || 0) + (m.set2_p1 || 0) + (m.set3_p1 || 0);
            const p2_games = (m.set1_p2 || 0) + (m.set2_p2 || 0) + (m.set3_p2 || 0);
            if (p1_games > p2_games) return { p1: 'GANADOR', p2: 'PERDEDOR' };
            if (p2_games > p1_games) return { p1: 'PERDEDOR', p2: 'GANADOR' };
            return { p1: '', p2: '' };
        };

        const mapMatch = (m, zoneTeams = []) => {
            const status = getStatus(m);
            const t1 = zoneTeams.find(et => et.id === m.pareja1_id);
            const t2 = zoneTeams.find(et => et.id === m.pareja2_id);

            return {
                id: m.id,
                fase: m.fase,
                orden_fase: m.orden_fase,
                t1_code: t1?.code || (m.fase !== 'ZONAS' ? 'P1' : ''),
                t2_code: t2?.code || (m.fase !== 'ZONAS' ? 'P2' : ''),
                p1_player1: m.u1a_nombre ? `${m.u1a_apellido.toUpperCase()} ${m.u1a_nombre.toUpperCase()}` : 'A DEFINIR',
                p1_player2: m.u1b_nombre ? `${m.u1b_apellido.toUpperCase()} ${m.u1b_nombre.toUpperCase()}` : '',
                p1_localidad: m.u1a_localidad ? formatLocality(m.u1a_localidad, m.u1b_localidad) : '-',
                p1_status: status.p1,
                p2_player1: m.u2a_nombre ? `${m.u2a_apellido.toUpperCase()} ${m.u2a_nombre.toUpperCase()}` : 'A DEFINIR',
                p2_player2: m.u2b_nombre ? `${m.u2b_apellido.toUpperCase()} ${m.u2b_nombre.toUpperCase()}` : '',
                p2_localidad: m.u2a_localidad ? formatLocality(m.u2a_localidad, m.u2b_localidad) : '-',
                p2_status: status.p2,
                score: m.estado === 'JUGADO' ? 
                    [
                        (m.set1_p1 !== null && m.set1_p1 !== undefined) ? `${m.set1_p1}-${m.set1_p2}` : null,
                        (m.set2_p1 !== null && m.set2_p1 !== undefined) ? `${m.set2_p1}-${m.set2_p2}` : null,
                        (m.set3_p1 !== null && m.set3_p1 !== undefined) ? `${m.set3_p1}-${m.set3_p2}` : null
                    ].filter(Boolean).join(' / ') || '0-0'
                    : 'VS',
                state: m.estado,
                fecha_original: m.fecha_partido,
                sede_id: m.sede_id,
                sede_nombre: m.sede_nombre
            };
        };

        // Structure the response
        const zonesWithData = zonas.map(z => {
            const zoneLetter = getZoneLetter(z.nombre);
            const zoneTeams = participantes.filter(p => p.zona_id === z.id).map((p, idx) => ({
                id: p.id,
                pareja_id: p.pareja_id,
                code: `${zoneLetter}${idx + 1}`,
                player1: `${p.u1_apellido.toUpperCase()} ${p.u1_nombre.toUpperCase()}`,
                player2: `${p.u2_apellido.toUpperCase()} ${p.u2_nombre.toUpperCase()}`,
                pj: p.pj, pg: p.pg, pp: p.pp, sf: p.sf, sc: p.sc, ds: p.ds, gf: p.gf, gc: p.gc, dg: p.dg, stb: p.stb, pts: p.pts
            }));

            return {
                ...z,
                equipos: zoneTeams,
                partidos: partidos.filter(m => m.zona_id === z.id).map(m => mapMatch(m, zoneTeams))
            };
        });

        const playoffMatches = partidos.filter(m => m.fase !== 'ZONAS').map(m => mapMatch(m));

        res.json({ zonas: zonesWithData, playoffs: playoffMatches });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

// @route   GET api/torneos/:id/inscriptos
// @desc    Get all confirmed registrations for a tournament
router.get('/:id/inscriptos', async (req, res) => {
    try {
        const sql = `
            SELECT i.*, u.nombre, u.apellido, u.nivel,
                   p.id as pareja_id, p.user2_dni as pareja_dni, 
                   up.nombre as pareja_nombre, up.apellido as pareja_apellido
            FROM inscripciones i
            JOIN usuarios u ON i.usuario_dni = u.dni
            LEFT JOIN parejas p ON (u.dni = p.user1_dni OR u.dni = p.user2_dni)
            LEFT JOIN usuarios up ON (CASE WHEN u.dni = p.user1_dni THEN p.user2_dni = up.dni ELSE p.user1_dni = up.dni END)
            WHERE i.torneo_id = ? AND i.estado = 'CONFIRMADA'
        `;
        const [rows] = await db.execute(sql, [req.params.id]);
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

// @route   PUT api/torneos/:id/partidos/:pId
// @desc    Update a match score and status
router.put('/:id/partidos/:pId', async (req, res) => {
    const { id, pId } = req.params;
    const body = req.body;

    // Normalize ALL values to prevent undefined from reaching mysql2
    const normalizeScore = (val) => {
        if (val === undefined || val === null || val === '') return null;
        const parsed = parseInt(val);
        return isNaN(parsed) ? null : parsed;
    };

    const set1_p1 = normalizeScore(body.set1_p1);
    const set1_p2 = normalizeScore(body.set1_p2);
    const set2_p1 = normalizeScore(body.set2_p1);
    const set2_p2 = normalizeScore(body.set2_p2);
    const set3_p1 = normalizeScore(body.set3_p1);
    const set3_p2 = normalizeScore(body.set3_p2);
    const estado = body.estado ?? 'PENDIENTE';
    const fecha_partido = body.fecha_partido ?? null;
    const finalSedeId = normalizeScore(body.sede_id);

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Get current match data
        const [mRows] = await connection.execute('SELECT * FROM partidos WHERE id = ?', [pId]);
        if (mRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ msg: 'Partido no encontrado' });
        }
        const match = mRows[0];

        // 2. Update the match
        await connection.execute(
            `UPDATE partidos SET 
             set1_p1 = ?, set1_p2 = ?, set2_p1 = ?, set2_p2 = ?, set3_p1 = ?, set3_p2 = ?, 
             estado = ?, fecha_partido = ?, sede_id = ? 
             WHERE id = ?`,
            [set1_p1, set1_p2, set2_p1, set2_p2, set3_p1, set3_p2, estado, fecha_partido, finalSedeId, pId]
        );

        // 3. Handle advancement/standings
        if (match.zona_id) {
            await updateZoneStandings(connection, id, match.zona_id);
            await checkZoneAdvancement(connection, id, match.zona_id);
        } else if (match.fase && match.fase !== 'ZONAS' && estado === 'JUGADO') {
            await updatePlayoffAdvancement(connection, id, match.fase, match.orden_fase);
        }

        await connection.commit();
        res.json({ msg: 'Partido actualizado correctamente' });
    } catch (err) {
        await connection.rollback();
        console.error('Error updating match details:', err);
        res.status(500).json({ msg: 'Error al actualizar: ' + err.message });
    } finally {
        connection.release();
    }
});

async function updateZoneStandings(connection, torneoId, zonaId) {
    // 1. Get all participants in the zone
    const [participantes] = await connection.execute(
        'SELECT pareja_id FROM torneo_participantes WHERE torneo_id = ? AND zona_id = ?',
        [torneoId, zonaId]
    );

    // 2. Clear stats for everyone in the zone
    for (const p of participantes) {
        await connection.execute(
            'UPDATE torneo_participantes SET pj=0, pg=0, pp=0, sf=0, sc=0, ds=0, gf=0, gc=0, dg=0, stb=0, pts=0 WHERE torneo_id = ? AND pareja_id = ?',
            [torneoId, p.pareja_id]
        );
    }

    // 3. Get all JUGADO matches for this zone
    const [partidos] = await connection.execute(
        'SELECT * FROM partidos WHERE torneo_id = ? AND zona_id = ? AND estado = "JUGADO"',
        [torneoId, zonaId]
    );

    // 4. Calculate stats
    const stats = {};
    participantes.forEach(p => {
        stats[p.pareja_id] = { pj: 0, pg: 0, pp: 0, sf: 0, sc: 0, ds: 0, gf: 0, gc: 0, dg: 0, stb: 0, pts: 0 };
    });

    partidos.forEach(m => {
        const p1 = m.pareja1_id;
        const p2 = m.pareja2_id;

        if (!stats[p1] || !stats[p2]) return;

        stats[p1].pj++;
        stats[p2].pj++;

        let p1_sets = 0;
        let p2_sets = 0;

        // Set 1
        if (m.set1_p1 > m.set1_p2) p1_sets++; else if (m.set1_p2 > m.set1_p1) p2_sets++;
        // Set 2
        if (m.set2_p1 > m.set2_p2) p1_sets++; else if (m.set2_p2 > m.set2_p1) p2_sets++;
        // Set 3
        if (m.set3_p1 !== null && m.set3_p2 !== null) {
            if (m.set3_p1 > m.set3_p2) p1_sets++; else if (m.set3_p2 > m.set3_p1) p2_sets++;
            // Check if it's a super tie break (usually 3rd set in some formats)
            const isSTB = (m.set3_p1 >= 10 || m.set3_p2 >= 10) && Math.abs(m.set3_p1 - m.set3_p2) >= 2;
            if (isSTB) {
                if (m.set3_p1 > m.set3_p2) stats[p1].stb++; else stats[p2].stb++;
            }
        }

        stats[p1].sf += p1_sets;
        stats[p1].sc += p2_sets;
        stats[p2].sf += p2_sets;
        stats[p2].sc += p1_sets;

        stats[p1].gf += (m.set1_p1 || 0) + (m.set2_p1 || 0) + (m.set3_p1 || 0);
        stats[p1].gc += (m.set1_p2 || 0) + (m.set2_p2 || 0) + (m.set3_p2 || 0);
        stats[p2].gf += (m.set1_p2 || 0) + (m.set2_p2 || 0) + (m.set3_p2 || 0);
        stats[p2].gc += (m.set1_p1 || 0) + (m.set2_p1 || 0) + (m.set3_p1 || 0);

        if (p1_sets > p2_sets) {
            stats[p1].pg++;
            stats[p1].pts += 3;
            stats[p2].pp++;
            stats[p2].pts += 1;
        } else if (p2_sets > p1_sets) {
            stats[p2].pg++;
            stats[p2].pts += 3;
            stats[p1].pp++;
            stats[p1].pts += 1;
        }
    });

    // 5. Save stats
    for (const pareja_id in stats) {
        const s = stats[pareja_id];
        const ds = s.sf - s.sc;
        const dg = s.gf - s.gc;

        await connection.execute(
            `UPDATE torneo_participantes 
             SET pj = ?, pg = ?, pp = ?, sf = ?, sc = ?, ds = ?, gf = ?, gc = ?, dg = ?, stb = ?, pts = ?
             WHERE torneo_id = ? AND zona_id = ? AND pareja_id = ?`,
            [s.pj, s.pg, s.pp, s.sf, s.sc, ds, s.gf, s.gc, dg, s.stb, s.pts, torneoId, zonaId, pareja_id]
        );
    }
}

// @route   POST api/torneos/:id/zonas/asignar-pareja
// @desc    Assign a couple to a zone and auto-generate matches if zone is full (3 couples)
router.post('/:id/zonas/asignar-pareja', async (req, res) => {
    const { pareja_id, zona_nombre } = req.body;
    const torneo_id = req.params.id;

    if (!pareja_id || !zona_nombre) {
        return res.status(400).json({ msg: 'Pareja y nombre de zona son requeridos' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Ensure the zone exists for this tournament
        let [zonas] = await connection.execute('SELECT id FROM torneo_zonas WHERE torneo_id = ? AND nombre_zona = ?', [torneo_id, zona_nombre]);
        let zona_id;
        
        if (zonas.length === 0) {
            const [result] = await connection.execute('INSERT INTO torneo_zonas (torneo_id, nombre_zona) VALUES (?, ?)', [torneo_id, zona_nombre]);
            zona_id = result.insertId;
        } else {
            zona_id = zonas[0].id;
        }

        // 2. Check if the couple is already in a zone for this tournament
        const [existing] = await connection.execute('SELECT id FROM torneo_participantes WHERE torneo_id = ? AND pareja_id = ?', [torneo_id, pareja_id]);
        if (existing.length > 0) {
            return res.status(400).json({ msg: 'Esta pareja ya está asignada a una zona en este torneo' });
        }

        // 3. Assign the couple
        await connection.execute('INSERT INTO torneo_participantes (torneo_id, zona_id, pareja_id) VALUES (?, ?, ?)', [torneo_id, zona_id, pareja_id]);

        await connection.commit();
        res.json({ msg: 'Pareja asignada exitosamente' });
    } catch (err) {
        await connection.rollback();
        console.error(err.message);
        res.status(500).send('Error del servidor');
    } finally {
        connection.release();
    }
});

// @route   POST api/torneos/:id/zonas/:zId/generar-partidos
// @desc    Manually generate all-vs-all matches for a zone
router.post('/:id/zonas/:zId/generar-partidos', async (req, res) => {
    const { id, zId } = req.params;

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Get all participants in the zone
        const [participantes] = await connection.execute(
            'SELECT pareja_id FROM torneo_participantes WHERE torneo_id = ? AND zona_id = ?',
            [id, zId]
        );

        if (participantes.length < 2) {
            await connection.rollback();
            return res.status(400).json({ msg: 'Se necesitan al menos 2 parejas para generar partidos' });
        }

        // 2. Check if matches already exist
        const [existing] = await connection.execute(
            'SELECT id FROM partidos WHERE torneo_id = ? AND zona_id = ?',
            [id, zId]
        );
        if (existing.length > 0) {
            await connection.rollback();
            return res.status(400).json({ msg: 'Ya existen partidos generados para esta zona' });
        }

        const pIds = participantes.map(p => p.pareja_id);

        if (pIds.length === 4) {
            // Generate initial 2 matches for zone of 4
            // Match 1: P1 vs P2 (orden_fase 1)
            // Match 2: P3 vs P4 (orden_fase 2)
            const matches = [[0, 1], [2, 3]];
            for (let i = 0; i < matches.length; i++) {
                const [p1Idx, p2Idx] = matches[i];
                await connection.execute(
                    'INSERT INTO partidos (torneo_id, zona_id, pareja1_id, pareja2_id, estado, orden_fase) VALUES (?, ?, ?, ?, ?, ?)',
                    [id, zId, pIds[p1Idx], pIds[p2Idx], 'PENDIENTE', i + 1]
                );
            }
        } else {
            // Generate all-vs-all matches for other sizes
            for (let i = 0; i < pIds.length; i++) {
                for (let j = i + 1; j < pIds.length; j++) {
                    await connection.execute(
                        'INSERT INTO partidos (torneo_id, zona_id, pareja1_id, pareja2_id, estado) VALUES (?, ?, ?, ?, ?)',
                        [id, zId, pIds[i], pIds[j], 'PENDIENTE']
                    );
                }
            }
        }

        await connection.commit();
        res.json({ msg: `Partidos generados correctamente para ${pIds.length} parejas (${(pIds.length * (pIds.length - 1)) / 2} partidos totales)` });
    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ msg: 'Error de servidor' });
    } finally {
        connection.release();
    }
});

// @route   DELETE api/torneos/:id/zonas/remover-pareja
// @desc    Remove a couple from a tournament zone and delete pending matches
router.delete('/:id/zonas/remover-pareja', async (req, res) => {
    const torneo_id = req.params.id;
    const { pareja_id, zona_id } = req.body;

    if (!pareja_id || !zona_id) {
        return res.status(400).json({ msg: 'Pareja ID y Zona ID requeridos' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Remove from torneo_participantes
        await connection.execute(
            'DELETE FROM torneo_participantes WHERE torneo_id = ? AND zona_id = ? AND pareja_id = ?',
            [torneo_id, zona_id, pareja_id]
        );

        // 2. Clear matches of that zone (all of them, since the group is no longer valid)
        await connection.execute(
            'DELETE FROM partidos WHERE torneo_id = ? AND zona_id = ?',
            [torneo_id, zona_id]
        );

        // 3. Update standings to reset stats for remaining players in that zone
        await updateZoneStandings(connection, torneo_id, zona_id);

        await connection.commit();
        res.json({ msg: 'Pareja removida, partidos limpiados y estadísticas reiniciadas' });
    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ msg: 'Error de servidor' });
    } finally {
        connection.release();
    }
});

// @route   PUT api/torneos/:id/participantes/:pId/stats
// @desc    Update team statistics manually
router.put('/:id/participantes/:pId/stats', async (req, res) => {
    const { pj, pg, pp, sf, sc, ds, gf, gc, dg, stb, pts } = req.body;
    const { pId } = req.params;

    try {
        await db.execute(
            `UPDATE torneo_participantes 
             SET pj = ?, pg = ?, pp = ?, sf = ?, sc = ?, ds = ?, gf = ?, gc = ?, dg = ?, stb = ?, pts = ?
             WHERE id = ?`,
            [pj, pg, pp, sf, sc, ds, gf, gc, dg, stb, pts, pId]
        );
        res.json({ msg: 'Estadísticas actualizadas correctamente' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

// @route   DELETE api/torneos/:id/zonas/:zId
// @desc    Delete an empty zone from a tournament
router.delete('/:id/zonas/:zId', async (req, res) => {
    const { id, zId } = req.params;

    try {
        // 1. Check if the zone has participants
        const [participantes] = await db.execute('SELECT id FROM torneo_participantes WHERE zona_id = ?', [zId]);
        if (participantes.length > 0) {
            return res.status(400).json({ msg: 'No se puede eliminar una zona que tiene equipos asignados' });
        }

        // 2. Delete the zone
        await db.execute('DELETE FROM torneo_zonas WHERE id = ? AND torneo_id = ?', [zId, id]);
        
        res.json({ msg: 'Zona eliminada correctamente' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

// @route   POST api/torneos/:id/playoffs/generate
// @desc    Generate initial playoff matches (azar)
router.post('/:id/playoffs/generate', async (req, res) => {
    const torneo_id = req.params.id;
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();

        // 1. Get all winners/runners up from zones
        const [participantes] = await connection.execute(
            `SELECT p.* FROM torneo_participantes p 
             JOIN torneo_zonas z ON p.zona_id = z.id 
             WHERE p.torneo_id = ? 
             ORDER BY z.id, p.pts DESC, p.dg DESC, p.gf DESC`,
            [torneo_id]
        );

        // Group by zone and take top 2
        const zones = {};
        participantes.forEach(p => {
            if (!zones[p.zona_id]) zones[p.zona_id] = [];
            if (zones[p.zona_id].length < 2) zones[p.zona_id].push(p.pareja_id);
        });

        const qualifiedTeams = Object.values(zones).flat();

        if (qualifiedTeams.length < 2) {
            await connection.rollback();
            return res.status(400).json({ msg: 'No hay suficientes equipos clasificados para generar llaves' });
        }

        // Shuffle qualified teams (azar)
        for (let i = qualifiedTeams.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [qualifiedTeams[i], qualifiedTeams[j]] = [qualifiedTeams[j], qualifiedTeams[i]];
        }

        // Determine starting phase and phases to generate
        const phaseOrder = ['8VOS', '4TOS', 'SEMIFINAL', 'FINAL'];
        let startPhaseIdx = 3; // Default FINAL
        if (qualifiedTeams.length > 8) startPhaseIdx = 0;
        else if (qualifiedTeams.length > 4) startPhaseIdx = 1;
        else if (qualifiedTeams.length > 2) startPhaseIdx = 2;

        const startPhase = phaseOrder[startPhaseIdx];

        // Clear existing playoff matches for this tournament to avoid duplicates
        await connection.execute(
            'DELETE FROM partidos WHERE torneo_id = ? AND fase != "ZONAS"',
            [torneo_id]
        );

        // Generate matches for ALL phases from startPhase up to FINAL
        for (let idx = startPhaseIdx; idx < phaseOrder.length; idx++) {
            const currentFase = phaseOrder[idx];
            // Number of matches for this phase: 8VOS=8, 4TOS=4, SEMIFINAL=2, FINAL=1
            const matchCount = Math.pow(2, (3 - idx)); 

            for (let i = 0; i < matchCount; i++) {
                let p1 = null;
                let p2 = null;

                // For the first phase, assign teams
                if (currentFase === startPhase) {
                    p1 = qualifiedTeams[i * 2] || null;
                    p2 = qualifiedTeams[i * 2 + 1] || null;
                }

                await connection.execute(
                    'INSERT INTO partidos (torneo_id, pareja1_id, pareja2_id, fase, orden_fase, estado) VALUES (?, ?, ?, ?, ?, ?)',
                    [torneo_id, p1, p2, currentFase, i, 'PENDIENTE']
                );
            }
        }

        await connection.commit();
        res.json({ msg: `Llave generada con éxito (${startPhase} hasta FINAL)`, startPhase });
    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).send('Error del servidor');
    } finally {
        connection.release();
    }
});

// @route   GET api/torneos/:id/bracket
// @desc    Get all playoff matches for a tournament
router.get('/:id/bracket', async (req, res) => {
    try {
        const [partidos] = await db.execute(
            `SELECT m.*, s.nombre as sede_nombre,
             u1a.apellido as u1a_apellido, u1a.nombre as u1a_nombre, u1a.localidad as u1a_localidad,
             u1b.apellido as u1b_apellido, u1b.nombre as u1b_nombre, u1b.localidad as u1b_localidad,
             u2a.apellido as u2a_apellido, u2a.nombre as u2a_nombre, u2a.localidad as u2a_localidad,
             u2b.apellido as u2b_apellido, u2b.nombre as u2b_nombre, u2b.localidad as u2b_localidad,
             tz1.nombre_zona as p1_zona, tp1.id as p1_tp_id, tp1.zona_id as p1_zona_id,
             tz2.nombre_zona as p2_zona, tp2.id as p2_tp_id, tp2.zona_id as p2_zona_id
             FROM partidos m
             LEFT JOIN sedes s ON m.sede_id = s.id
             LEFT JOIN parejas p1 ON m.pareja1_id = p1.id
             LEFT JOIN usuarios u1a ON p1.user1_dni = u1a.dni
             LEFT JOIN usuarios u1b ON p1.user2_dni = u1b.dni
             LEFT JOIN parejas p2 ON m.pareja2_id = p2.id
             LEFT JOIN usuarios u2a ON p2.user1_dni = u2a.dni
             LEFT JOIN usuarios u2b ON p2.user2_dni = u2b.dni
             LEFT JOIN torneo_participantes tp1 ON m.pareja1_id = tp1.pareja_id AND m.torneo_id = tp1.torneo_id
             LEFT JOIN torneo_zonas tz1 ON tp1.zona_id = tz1.id
             LEFT JOIN torneo_participantes tp2 ON m.pareja2_id = tp2.pareja_id AND m.torneo_id = tp2.torneo_id
             LEFT JOIN torneo_zonas tz2 ON tp2.zona_id = tz2.id
             WHERE m.torneo_id = ? AND m.fase != 'ZONAS'
             ORDER BY 
                CASE m.fase
                    WHEN '8VOS' THEN 1
                    WHEN '4TOS' THEN 2
                    WHEN 'SEMIFINAL' THEN 3
                    WHEN 'FINAL' THEN 4
                    ELSE 5
                END ASC, 
                m.orden_fase ASC`,
            [req.params.id]
        );

        // Get all participants to calculate position within zone
        const [allParticipantes] = await db.execute(
            'SELECT id, zona_id FROM torneo_participantes WHERE torneo_id = ? ORDER BY id ASC',
            [req.params.id]
        );

        const getTeamCode = (zonaNombre, tpId, zonaId) => {
            if (!zonaNombre || !tpId) return '-';
            const match = zonaNombre.match(/ZONA\s+([A-Z])/i);
            let letter = 'Z';
            if (match) {
                letter = match[1].toUpperCase();
            } else {
                const numMatch = zonaNombre.match(/\d+/);
                letter = numMatch ? String.fromCharCode(64 + parseInt(numMatch[0])) : 'Z';
            }
            
            const zoneParticipants = allParticipantes.filter(p => p.zona_id === zonaId);
            const pos = zoneParticipants.findIndex(p => p.id === tpId) + 1;
            
            return `${letter}${pos}`;
        };

        const formatLocality = (l1, l2) => {
            if (l1 && l2) return `${l1} / ${l2}`;
            return l1 || l2 || '';
        };

        const getStatus = (m) => {
            if (m.estado !== 'JUGADO') return { p1: '', p2: '' };
            let p1_sets = 0; let p2_sets = 0;
            if (m.set1_p1 > m.set1_p2) p1_sets++; else if (m.set1_p2 > m.set1_p1) p2_sets++;
            if (m.set2_p1 > m.set2_p2) p1_sets++; else if (m.set2_p2 > m.set2_p1) p2_sets++;
            if (m.set3_p1 !== null && m.set3_p2 !== null) {
                if (m.set3_p1 > m.set3_p2) p1_sets++; else if (m.set3_p2 > m.set3_p1) p2_sets++;
            }
            if (p1_sets > p2_sets) return { p1: 'GANADOR', p2: 'PERDEDOR' };
            if (p2_sets > p1_sets) return { p1: 'PERDEDOR', p2: 'GANADOR' };
            const p1_games = (m.set1_p1 || 0) + (m.set2_p1 || 0) + (m.set3_p1 || 0);
            const p2_games = (m.set1_p2 || 0) + (m.set2_p2 || 0) + (m.set3_p2 || 0);
            if (p1_games > p2_games) return { p1: 'GANADOR', p2: 'PERDEDOR' };
            if (p2_games > p1_games) return { p1: 'PERDEDOR', p2: 'GANADOR' };
            return { p1: '', p2: '' };
        };

        const mappedPartidos = partidos.map(m => {
            const status = getStatus(m);
            return {
                id: m.id,
                fase: m.fase,
                orden_fase: m.orden_fase,
                p1_code: getTeamCode(m.p1_zona, m.p1_tp_id, m.p1_zona_id),
                p2_code: getTeamCode(m.p2_zona, m.p2_tp_id, m.p2_zona_id),
                p1_player1: m.u1a_nombre ? `${m.u1a_apellido.toUpperCase()} ${m.u1a_nombre.toUpperCase()}` : 'A DEFINIR',
                p1_player2: m.u1b_nombre ? `${m.u1b_apellido.toUpperCase()} ${m.u1b_nombre.toUpperCase()}` : '',
                p1_localidad: m.u1a_localidad ? formatLocality(m.u1a_localidad, m.u1b_localidad) : '-',
                p1_status: status.p1,
                p2_player1: m.u2a_nombre ? `${m.u2a_apellido.toUpperCase()} ${m.u2a_nombre.toUpperCase()}` : 'A DEFINIR',
                p2_player2: m.u2b_nombre ? `${m.u2b_apellido.toUpperCase()} ${m.u2b_nombre.toUpperCase()}` : '',
                p2_localidad: m.u2a_localidad ? formatLocality(m.u2a_localidad, m.u2b_localidad) : '-',
                p2_status: status.p2,
                score: m.estado === 'JUGADO' ? 
                    [m.set1_p1 !== null && `${m.set1_p1}-${m.set1_p2}`, m.set2_p1 !== null && `${m.set2_p1}-${m.set2_p2}`, m.set3_p1 !== null && `${m.set3_p1}-${m.set3_p2}`].filter(Boolean)
                    : [],
                score_str: m.estado === 'JUGADO' ? 
                    [m.set1_p1 !== null && `${m.set1_p1}-${m.set1_p2}`, m.set2_p1 !== null && `${m.set2_p1}-${m.set2_p2}`, m.set3_p1 !== null && `${m.set3_p1}-${m.set3_p2}`].filter(Boolean).join(' / ')
                    : 'VS',
                state: m.estado,
                fecha_partido: m.fecha_partido,
                sede_id: m.sede_id,
                sede_nombre: m.sede_nombre
            };
        });

        res.json(mappedPartidos);
    } catch (err) {
        console.error('Error fetching bracket:', err);
        res.status(500).json({ msg: 'Error al obtener llaves: ' + err.message });
    }
});

async function updatePlayoffAdvancement(connection, torneoId, fase, ordenFase) {
    // 1. Get the match that just finished
    const [mRows] = await connection.execute(
        'SELECT * FROM partidos WHERE torneo_id = ? AND fase = ? AND orden_fase = ?',
        [torneoId, fase, ordenFase]
    );
    if (mRows.length === 0) return;
    const match = mRows[0];
    if (match.estado !== 'JUGADO') return;

    // 2. Identify winner
    const { winner } = getMatchWinnerAndLoser(match);
    if (!winner) return;

    // 3. Determine next phase
    const phases = ['8VOS', '4TOS', 'SEMIFINAL', 'FINAL'];
    const currentIdx = phases.indexOf(fase);
    if (currentIdx === -1 || currentIdx === phases.length - 1) return; // No next phase

    const nextFase = phases[currentIdx + 1];
    const nextOrden = Math.floor(ordenFase / 2);
    const isPareja2 = ordenFase % 2 !== 0;

    // 4. Update next match
    const parejaColumn = isPareja2 ? 'pareja2_id' : 'pareja1_id';
    await connection.execute(
        `UPDATE partidos SET ${parejaColumn} = ? WHERE torneo_id = ? AND fase = ? AND orden_fase = ?`,
        [winner, torneoId, nextFase, nextOrden]
    );
}

function getMatchWinnerAndLoser(match) {
    let p1_sets = 0; let p2_sets = 0;
    if (match.set1_p1 > match.set1_p2) p1_sets++; else if (match.set1_p2 > match.set1_p1) p2_sets++;
    if (match.set2_p1 > match.set2_p2) p1_sets++; else if (match.set2_p2 > match.set2_p1) p2_sets++;
    if (match.set3_p1 !== null && match.set3_p2 !== null) {
        if (match.set3_p1 > match.set3_p2) p1_sets++; else if (match.set3_p2 > match.set3_p1) p2_sets++;
    }

    let winner = null;
    let loser = null;

    if (p1_sets > p2_sets) {
        winner = match.pareja1_id;
        loser = match.pareja2_id;
    } else if (p2_sets > p1_sets) {
        winner = match.pareja2_id;
        loser = match.pareja1_id;
    } else {
        // Tie-breaker by games
        const p1_games = (match.set1_p1 || 0) + (match.set2_p1 || 0) + (match.set3_p1 || 0);
        const p2_games = (match.set1_p2 || 0) + (match.set2_p2 || 0) + (match.set3_p2 || 0);
        if (p1_games > p2_games) {
            winner = match.pareja1_id;
            loser = match.pareja2_id;
        } else {
            winner = match.pareja2_id;
            loser = match.pareja1_id;
        }
    }
    return { winner, loser };
}

async function checkZoneAdvancement(connection, torneoId, zonaId) {
    // 1. Get all participants in the zone to check size
    const [participantes] = await connection.execute(
        'SELECT pareja_id FROM torneo_participantes WHERE torneo_id = ? AND zona_id = ?',
        [torneoId, zonaId]
    );
    if (participantes.length !== 4) return;

    // 2. Get current matches for this zone
    const [partidos] = await connection.execute(
        'SELECT * FROM partidos WHERE torneo_id = ? AND zona_id = ?',
        [torneoId, zonaId]
    );

    const m1 = partidos.find(m => m.orden_fase === 1);
    const m2 = partidos.find(m => m.orden_fase === 2);

    // 3. If Match 1 and Match 2 are played, generate or update Match 3 and 4
    if (m1?.estado === 'JUGADO' && m2?.estado === 'JUGADO') {
        const res1 = getMatchWinnerAndLoser(m1);
        const res2 = getMatchWinnerAndLoser(m2);

        const m3 = partidos.find(m => m.orden_fase === 3);
        const m4 = partidos.find(m => m.orden_fase === 4);

        if (!m3) {
            await connection.execute(
                'INSERT INTO partidos (torneo_id, zona_id, pareja1_id, pareja2_id, estado, orden_fase) VALUES (?, ?, ?, ?, ?, ?)',
                [torneoId, zonaId, res1.winner, res2.winner, 'PENDIENTE', 3]
            );
        } else {
            await connection.execute(
                'UPDATE partidos SET pareja1_id = ?, pareja2_id = ? WHERE id = ?',
                [res1.winner, res2.winner, m3.id]
            );
        }

        if (!m4) {
            await connection.execute(
                'INSERT INTO partidos (torneo_id, zona_id, pareja1_id, pareja2_id, estado, orden_fase) VALUES (?, ?, ?, ?, ?, ?)',
                [torneoId, zonaId, res1.loser, res2.loser, 'PENDIENTE', 4]
            );
        } else {
            await connection.execute(
                'UPDATE partidos SET pareja1_id = ?, pareja2_id = ? WHERE id = ?',
                [res1.loser, res2.loser, m4.id]
            );
        }
    }
}

// @route   POST api/torneos/:id/zonas/auto-generar
// @desc    Auto generate zones and assign couples based on standard distribution table
router.post('/:id/zonas/auto-generar', async (req, res) => {
    const torneo_id = req.params.id;
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();

        // 1. Get confirmed couples from inscripciones
        const [inscripciones] = await connection.execute(`
            SELECT i.usuario_dni, p.id as pareja_id 
            FROM inscripciones i
            JOIN usuarios u ON i.usuario_dni = u.dni
            JOIN parejas p ON (u.dni = p.user1_dni OR u.dni = p.user2_dni)
            WHERE i.torneo_id = ? AND i.estado = 'CONFIRMADA'
        `, [torneo_id]);

        // Deduplicate to get unique couples
        const uniqueCouples = [...new Set(inscripciones.map(i => i.pareja_id))].filter(Boolean);
        const count = uniqueCouples.length;

        // 2. Lookup distribution
        const distTable = {
            2: { z3: 0, z4: 0 },
            3: { z3: 1, z4: 0 },
            4: { z3: 0, z4: 1 },
            6: { z3: 2, z4: 0 },
            7: { z3: 1, z4: 1 },
            8: { z3: 0, z4: 2 },
            9: { z3: 3, z4: 0 },
            10: { z3: 2, z4: 1 },
            11: { z3: 1, z4: 2 },
            12: { z3: 4, z4: 0 },
            13: { z3: 3, z4: 1 },
            14: { z3: 2, z4: 2 },
            15: { z3: 5, z4: 0 },
            16: { z3: 0, z4: 4 },
            18: { z3: 6, z4: 0 },
            20: { z3: 0, z4: 5 },
            21: { z3: 7, z4: 0 },
            24: { z3: 8, z4: 0 },
            28: { z3: 0, z4: 7 },
            30: { z3: 10, z4: 0 },
            32: { z3: 0, z4: 8 },
            36: { z3: 12, z4: 0 },
            40: { z3: 0, z4: 10 },
            48: { z3: 16, z4: 0 },
            50: { z3: 10, z4: 5 }
        };

        const dist = distTable[count];
        if (!dist) {
            await connection.rollback();
            const validNumbers = Object.keys(distTable).join(', ');
            return res.status(400).json({ 
                msg: `No hay distribución definida para ${count} parejas. Las cantidades permitidas son: ${validNumbers}.` 
            });
        }

        // 3. Clear existing zones, participants and matches
        await connection.execute('DELETE FROM partidos WHERE torneo_id = ?', [torneo_id]);
        await connection.execute('DELETE FROM torneo_participantes WHERE torneo_id = ?', [torneo_id]);
        await connection.execute('DELETE FROM torneo_zonas WHERE torneo_id = ?', [torneo_id]);

        if (count === 2) {
            // Direct final scenario
            await connection.execute(
                'INSERT INTO partidos (torneo_id, pareja1_id, pareja2_id, fase, orden_fase, estado) VALUES (?, ?, ?, ?, ?, ?)',
                [torneo_id, uniqueCouples[0], uniqueCouples[1], 'FINAL', 0, 'PENDIENTE']
            );
            await connection.commit();
            return res.json({ msg: 'Final directa generada exitosamente' });
        }

        // 4. Shuffle couples
        for (let i = uniqueCouples.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [uniqueCouples[i], uniqueCouples[j]] = [uniqueCouples[j], uniqueCouples[i]];
        }

        // 5. Create zones and assign
        let coupleIdx = 0;

        const totalZones = dist.z3 + dist.z4;
        
        for (let i = 0; i < totalZones; i++) {
            // Process z4 zones first as requested
            const isZone4 = i < dist.z4;
            const size = isZone4 ? 4 : 3;
            
            const zonaLetra = String.fromCharCode(65 + i); // 0 -> A, 1 -> B...
            const zonaNombre = `ZONA ${zonaLetra}`;
            
            const [zRes] = await connection.execute(
                'INSERT INTO torneo_zonas (torneo_id, nombre_zona) VALUES (?, ?)',
                [torneo_id, zonaNombre]
            );
            const zonaId = zRes.insertId;

            // Assign couples
            const assignedCouples = [];
            for (let j = 0; j < size; j++) {
                if (coupleIdx < uniqueCouples.length) {
                    const pid = uniqueCouples[coupleIdx++];
                    assignedCouples.push(pid);
                    await connection.execute(
                        'INSERT INTO torneo_participantes (torneo_id, zona_id, pareja_id) VALUES (?, ?, ?)',
                        [torneo_id, zonaId, pid]
                    );
                }
            }

            if (assignedCouples.length === 4) {
                // Special sequential logic for zone of 4
                // Match 1: P1 vs P2 (orden 1)
                // Match 2: P3 vs P4 (orden 2)
                const matches = [[0, 1], [2, 3]];
                for (let x = 0; x < matches.length; x++) {
                    const [p1Idx, p2Idx] = matches[x];
                    await connection.execute(
                        'INSERT INTO partidos (torneo_id, zona_id, pareja1_id, pareja2_id, estado, orden_fase) VALUES (?, ?, ?, ?, ?, ?)',
                        [torneo_id, zonaId, assignedCouples[p1Idx], assignedCouples[p2Idx], 'PENDIENTE', x + 1]
                    );
                }
            } else {
                // Generate matches for this zone (all-vs-all)
                for (let x = 0; x < assignedCouples.length; x++) {
                    for (let y = x + 1; y < assignedCouples.length; y++) {
                        await connection.execute(
                            'INSERT INTO partidos (torneo_id, zona_id, pareja1_id, pareja2_id, estado) VALUES (?, ?, ?, ?, ?)',
                            [torneo_id, zonaId, assignedCouples[x], assignedCouples[y], 'PENDIENTE']
                        );
                    }
                }
            }

            // zoneCounter removal
        }

        await connection.commit();
        res.json({ msg: `${dist.z3 + dist.z4} zonas y partidos generados exitosamente para ${count} parejas.` });

    } catch (err) {
        await connection.rollback();
        console.error('Error auto-generando: ', err);
        res.status(500).json({ msg: 'Error interno del servidor al auto-generar zonas' });
    } finally {
        connection.release();
    }
});

module.exports = router;
