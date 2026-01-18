const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Permite peticiones desde tu frontend (localhost:5173)
app.use(express.json());

// Configuración de la Base de Datos (Neon Postgres)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_aclJYNkAe8C5@ep-withered-grass-ahonh5wg-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require',
    ssl: {
        rejectUnauthorized: false
    }
});

// Ruta: Obtener citas activas (no canceladas)
app.get('/api/citas', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM citas WHERE status != 'cancelada' ORDER BY fecha_hora ASC");
        res.json(result.rows);
    } catch (err) {
        console.error('Error ejecutando query:', err);
        res.status(500).json({ error: 'Error interno del servidor al obtener citas' });
    }
});

// Ruta: Obtener citas canceladas
app.get('/api/cancelaciones', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM citas WHERE status = 'cancelada' ORDER BY deleted_at DESC, fecha_hora ASC");
        res.json(result.rows);
    } catch (err) {
        console.error('Error ejecutando query:', err);
        res.status(500).json({ error: 'Error interno del servidor al obtener cancelaciones' });
    }
});

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('API de Citas Médicas Funcionando 🚀');
});

// Ruta: Actualizar estado de una cita
app.put('/api/citas/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        let queryText = 'UPDATE citas SET status = $1 WHERE id = $2 RETURNING *';
        let queryParams = [status, id];

        if (status === 'cancelada') {
            queryText = 'UPDATE citas SET status = $1, deleted_at = NOW() WHERE id = $2 RETURNING *';
        } else if (status === 'confirmada') {
            // Opcional: Si se reactiva, podríamos querer limpiar el deleted_at
            queryText = 'UPDATE citas SET status = $1, deleted_at = NULL WHERE id = $2 RETURNING *';
        }

        const result = await pool.query(queryText, queryParams);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Cita no encontrada' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error actualizando cita:', err);
        res.status(500).json({ error: 'Error al actualizar la cita' });
    }
});

app.listen(port, () => {
    console.log(`Backend corriendo en http://localhost:${port}`);
});
