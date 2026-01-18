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

const nodemailer = require('nodemailer');

app.listen(port, () => {
    console.log(`Backend corriendo en http://localhost:${port}`);
});

// Configuración de Email (Nodemailer - IONOS)
const transporter = nodemailer.createTransport({
    host: 'smtp.ionos.com',
    port: 587,
    secure: false, // false para puerto 587 (STARTTLS)
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Función auxiliar de envío
const sendConfirmationEmail = async (to, cita) => {
    if (!process.env.EMAIL_USER) {
        console.warn('⚠️ EMAIL_USER no configurado. Saltando envío de correo.');
        return;
    }

    const fechaFormat = new Date(cita.fecha_hora).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });

    const mailOptions = {
        from: `"Clínica Dr. Quiroz" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: '📅 Confirmación de tu Cita Médica',
        html: `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #f0f0f0;">
                
                <!-- Cabecera -->
                <div style="background: linear-gradient(135deg, #0d9488 0%, #115e59 100%); padding: 30px 20px; text-align: center;">
                    <div style="background-color: rgba(255,255,255,0.2); width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 15px auto; display: flex; align-items: center; justify-content: center; line-height: 60px; font-size: 30px;">
                        📅
                    </div>
                    <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">¡Cita Confirmada!</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 14px;">Tu salud está en buenas manos</p>
                </div>

                <!-- Contenido -->
                <div style="padding: 30px; color: #444444;">
                    <p style="margin-bottom: 20px; font-size: 16px;">Hola <strong>${cita.paciente_nombre}</strong>,</p>
                    <p style="margin-bottom: 25px; line-height: 1.6; color: #555;">Nos complace confirmarte que tu cita ha sido agendada exitosamente en nuestro sistema.</p>
                    
                    <div style="background-color: #f0fdfa; border-left: 4px solid #0d9488; padding: 20px; border-radius: 0 8px 8px 0; margin-bottom: 30px;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; font-size: 14px; color: #555; width: 30%;"><strong>🗓️ Fecha:</strong></td>
                                <td style="padding: 8px 0; font-size: 15px; color: #111; font-weight: 600;">${new Date(cita.fecha_hora).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-size: 14px; color: #555;"><strong>⏰ Hora:</strong></td>
                                <td style="padding: 8px 0; font-size: 15px; color: #0d9488; font-weight: 700;">${new Date(cita.fecha_hora).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true })}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-size: 14px; color: #555;"><strong>🩺 Motivo:</strong></td>
                                <td style="padding: 8px 0; font-size: 15px; color: #111;">${cita.motivo || 'Consulta General'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-size: 14px; color: #555;"><strong>👨‍⚕️ Doctor:</strong></td>
                                <td style="padding: 8px 0; font-size: 15px; color: #111;">Dr. Rubén Quiroz</td>
                            </tr>
                        </table>
                    </div>

                    <div style="text-align: center; margin-top: 30px;">
                         <a href="#" style="background-color: #0d9488; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block;">Ver mi cita en línea</a>
                         <p style="font-size: 12px; color: #888; margin-top: 15px;">Si necesitas cancelar o reprogramar, por favor contáctanos con al menos 24 horas de anticipación.</p>
                    </div>
                </div>

                <!-- Footer -->
                <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
                    <p style="margin: 0; font-weight: 600; color: #334155;">Clínica de Cardiología - Dr. Rubén Quiroz</p>
                    <p style="margin: 5px 0 0 0; font-size: 12px; color: #94a3b8;">Calle Médicos 123, Consultorio 404 • CDMX</p>
                    <div style="margin-top: 15px;">
                        <span style="display: inline-block; width: 30px; height: 1px; background-color: #cbd5e1; vertical-align: middle;"></span>
                        <span style="font-size: 11px; margin: 0 10px; color: #cbd5e1;">CONFIDENCIAL</span>
                        <span style="display: inline-block; width: 30px; height: 1px; background-color: #cbd5e1; vertical-align: middle;"></span>
                    </div>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`📧 Correo enviado a ${to}`);
    } catch (error) {
        console.error('❌ Error enviando correo:', error);
    }
};

// Ruta: Crear nueva cita (Incluye envío de correo)
app.post('/api/citas', async (req, res) => {
    const { paciente_nombre, telefono, email, fecha_hora, motivo } = req.body;

    if (!paciente_nombre || !fecha_hora) {
        return res.status(400).json({ error: 'Nombre y fecha fecha_hora son obligatorios' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO citas (paciente_nombre, telefono, email, fecha_hora, motivo) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING *`,
            [paciente_nombre, telefono, email, fecha_hora, motivo]
        );

        const nuevaCita = result.rows[0];
        console.log('✅ Cita creada en DB:', nuevaCita.id);

        // Enviar correo si existe email
        if (email) {
            // No esperamos el await para no retrasar la respuesta de la API
            sendConfirmationEmail(email, nuevaCita);
        }

        res.status(201).json(nuevaCita);
    } catch (err) {
        console.error('Error creando cita:', err);
        res.status(500).json({ error: 'Error al crear la cita' });
    }
});
