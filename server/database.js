const { Sequelize } = require('sequelize');
require('dotenv').config(); // Carga las variables del .env

// Conexión para 'trastmanager' database
const tm_connection_db = new Sequelize(
  process.env.DB_NAME, 
  process.env.DB_USER, 
  process.env.DB_PASSWORD, 
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    port: process.env.DB_PORT,
    logging: false,
  }
);


// Función para conectar a la base de datos con Sequelize
const connectToDatabase = () => {
  tm_connection_db
    .authenticate()
    .then(() => {
      console.log('Conexión exitosa a la base de datos "trastmanager"');
    })
    .catch((error) => {
      console.error('Error al conectar a la base de datos "trastmanager":', error);
    });
};

connectToDatabase();

module.exports = {tm_connection_db};