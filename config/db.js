const mysql = require('mysql2/promise'); 
require('dotenv').config(); 


const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 50,
  timezone: "-05:00",
});

(async () => {
    try {
        const conn = await pool.getConnection();
        console.log('Conexión a MYSQL exitosa');
        conn.release(); 
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
    }
})();

module.exports = pool;