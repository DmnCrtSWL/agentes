const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const resetDb = async () => {
    try {
        console.log('🗑️  Borrando todas las citas y reiniciando IDs...');
        await pool.query('TRUNCATE TABLE citas RESTART IDENTITY');
        console.log('✅ Base de datos limpiada exitosamente.');
    } catch (err) {
        console.error('❌ Error borrando datos:', err);
    } finally {
        await pool.end();
    }
};

resetDb();
