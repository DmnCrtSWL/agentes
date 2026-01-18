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

// Ruta: Obtener todas las citas
app.get('/api/citas', async (req, res) => {
    try {
        // Consulta SQL directa
        const result = await pool.query('SELECT * FROM citas ORDER BY fecha_hora ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error ejecutando query:', err);
        res.status(500).json({ error: 'Error interno del servidor al obtener citas' });
    }
});

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('API de Citas Médicas Funcionando 🚀');
});

app.listen(port, () => {
    console.log(`Backend corriendo en http://localhost:${port}`);
});
