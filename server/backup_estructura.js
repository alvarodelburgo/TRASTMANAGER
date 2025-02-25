require('dotenv').config(); // Cargar variables de entorno
const { exec } = require('child_process');

// Configuración de la base de datos
const MAIN_DB = `postgresql://${process.env.MAIN_DB_USER}:${process.env.MAIN_DB_PASSWORD}@${process.env.MAIN_DB_HOST}:${process.env.MAIN_DB_PORT}/${process.env.MAIN_DB_NAME}`;
const BACKUP_DB = `postgresql://${process.env.BACKUP_DB_USER}:${process.env.BACKUP_DB_PASSWORD}@${process.env.BACKUP_DB_HOST}:${process.env.BACKUP_DB_PORT}/${process.env.BACKUP_DB_NAME}`;

// Función de backup
function backupDatabase() {
    // Comando para hacer el dump de la estructura, funciones y triggers
    const dumpCommand = `"C:\\Program Files\\PostgreSQL\\16\\bin\\pg_dump.exe" -U ${process.env.MAIN_DB_USER} -h ${process.env.MAIN_DB_HOST} -p ${process.env.MAIN_DB_PORT} -d ${process.env.MAIN_DB_NAME} -s -F c -b -v -f C:\\tmp\\backup_structure_and_functions.dump`;

    // Comando para restaurar la estructura, funciones y triggers
    const restoreCommand = `"C:\\Program Files\\PostgreSQL\\16\\bin\\pg_restore.exe" -d ${BACKUP_DB} -v C:\\tmp\\backup_structure_and_functions.dump`;

    // Realizar el dump de la estructura, funciones y triggers
    exec(dumpCommand, (err, stdout, stderr) => {
        if (err) {
            console.error(`Error al realizar el dump: ${stderr}`);
            return;
        }

        // Si el dump fue exitoso, realizar la restauración
        exec(restoreCommand, (err, stdout, stderr) => {
            if (err) {
                console.error(`Error al restaurar la estructura, funciones y triggers: ${stderr}`);
                return;
            }
            console.log('✅ Estructura, funciones y triggers restaurados correctamente.');
        });
    });
}

// Ejecutar el backup de la estructura, funciones y triggers
backupDatabase();