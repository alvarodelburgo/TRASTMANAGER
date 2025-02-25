require('dotenv').config();
const { exec, spawnSync } = require('child_process');
const cron = require('node-cron');

// Configuración de la base de datos
const MAIN_DB = `postgresql://${process.env.MAIN_DB_USER}:${process.env.MAIN_DB_PASSWORD}@${process.env.MAIN_DB_HOST}:${process.env.MAIN_DB_PORT}/${process.env.MAIN_DB_NAME}`;
const BACKUP_DB = `postgresql://${process.env.BACKUP_DB_USER}:${process.env.BACKUP_DB_PASSWORD}@${process.env.BACKUP_DB_HOST}:${process.env.BACKUP_DB_PORT}/${process.env.BACKUP_DB_NAME}`;

// Función para realizar el backup de solo los datos
function backupData() {
    // Comando para hacer el dump solo de los datos
    const dumpCommand = `"C:\\Program Files\\PostgreSQL\\16\\bin\\pg_dump.exe" -U ${process.env.MAIN_DB_USER} -h ${process.env.MAIN_DB_HOST} -p ${process.env.MAIN_DB_PORT} -d ${process.env.MAIN_DB_NAME} --data-only --disable-triggers -F c -v -f C:\\tmp\\backup_data.dump`;

    // Comando para restaurar solo los datos
    const restoreCommand = `"C:\\Program Files\\PostgreSQL\\16\\bin\\pg_restore.exe" -U ${process.env.BACKUP_DB_USER} -h ${process.env.BACKUP_DB_HOST} -p ${process.env.BACKUP_DB_PORT} -d ${process.env.BACKUP_DB_NAME} --disable-triggers -v C:\\tmp\\backup_data.dump`;

    console.log('📦 Iniciando copia de datos...');

    // Utilizamos spawnSync para ejecutar el dump y permitir la entrada de la contraseña automáticamente
    const dumpProcess = spawnSync('pg_dump', [
        '-U', process.env.MAIN_DB_USER,
        '-h', process.env.MAIN_DB_HOST,
        '-p', process.env.MAIN_DB_PORT,
        '-d', process.env.MAIN_DB_NAME,
        '--data-only',
        '--disable-triggers',
        '-F', 'c',
        '-v',
        '-f', 'C:\\tmp\\backup_data.dump'
    ], {
        env: { ...process.env, PGPASSWORD: process.env.MAIN_DB_PASSWORD } // Usamos PGPASSWORD para evitar que se pida la contraseña
    });

    // Verificamos si ocurrió algún error en el proceso de dump
    if (dumpProcess.error) {
        console.error(`❌ Error al realizar el dump de los datos: ${dumpProcess.error}`);
        return;
    }

    console.log('✅ Dump de datos completado');

    // Ahora, realizamos el proceso de restauración con el mismo enfoque
    const restoreProcess = spawnSync('pg_restore', [
        '-U', process.env.BACKUP_DB_USER,
        '-h', process.env.BACKUP_DB_HOST,
        '-p', process.env.BACKUP_DB_PORT,
        '-d', process.env.BACKUP_DB_NAME,
        '--disable-triggers',
        '-v',
        'C:\\tmp\\backup_data.dump'
    ], {
        env: { ...process.env, PGPASSWORD: process.env.BACKUP_DB_PASSWORD } // Usamos PGPASSWORD para evitar que se pida la contraseña
    });

    // Verificamos si ocurrió algún error en el proceso de restauración
    if (restoreProcess.error) {
        console.error(`❌ Error al restaurar los datos: ${restoreProcess.error}`);
        return;
    }

    console.log('✅ Datos restaurados correctamente');
}

// Programar el cron para que se ejecute en exactamente 10 minutos

// Ejecutar a los 2 minutos de la hora actual
const now = new Date();
now.setMinutes(now.getMinutes() + 1); // Aumentamos 2 minutos

const minute = now.getMinutes();
const hour = now.getHours();

console.log(`🕒 Backup programado para las ${hour}:${minute}`);
cron.schedule(`${minute} ${hour} * * *`, () => {
    console.log('🕒 Ejecutando el proceso de backup...');
    backupData();
}, {
    scheduled: true,
    timezone: "Europe/Madrid"
});