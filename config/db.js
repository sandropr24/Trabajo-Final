const mysql = require('mysql2/promise'); //Acceso BD - MYSQL
require('dotenv').config(); //Leer los valores del archivo de configuracion 

//pool de conexiones => "conjunto de conexiones disponibles"
//conexion "regular" (normal) => usuario 1 => abre > proceso > cierra
//pool "optimizado" => se crear todas las conexiones a ofrecer(10) => usuario1, usuario2, etc , usuario11(cola)

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