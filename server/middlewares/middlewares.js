const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { getSocket } = require('../socket');
const { getUserSocket } = require('../socketManager'); // Importar la función

// Ruta al archivo JSON donde se almacenan las sesiones
const sessionsFilePath = path.join(__dirname, '../data/sessions.json');

// Cargar las sesiones desde el archivo JSON
function loadSessions() {
    if (fs.existsSync(sessionsFilePath)) {
        const data = fs.readFileSync(sessionsFilePath, 'utf-8');
        return JSON.parse(data);
    }
    return [];
}


// MIDDLEWARE PARA PROCESAR DATOS DEL FORMULARIO
const middleware_procesar = express.urlencoded({ extended: false });


// MIDDLEWARE PARA MANEJAR ERRORES 404
const notFound_middleware = ((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, '../..', 'client/html', '404.html'));
});


const io = getSocket();

// Función para comprobar el tiempo restante de todas las sesiones cada 30 segundos
function verificarSesionesActivas() {

    let activeSessions = loadSessions();

    activeSessions.forEach(session => {
        const tiempoRestante = session.tiempoExpiracion - Date.now();

        const userID = session.userID
        const userUUID = session.userUUID;
        const role = session.role;

        const data = {userID, role, userUUID};

        //console.log(`tiempo Restante del token para usuario nº ${userUUID} y rol ${role}:`, tiempoRestante);
        //console.log('------------------------------------------------------------------------');

        const tiempoInactivo = Date.now() - session.ultimoAcceso;

        let tiempoDesdeUltimaRenovacion = session.tiempoDesdeUltimaRenovacion;

        tiempoDesdeUltimaRenovacion += 20000;
        session.tiempoDesdeUltimaRenovacion = tiempoDesdeUltimaRenovacion;

        //RENOVAR EN EL JSON EL TIEMPO RESTANTE
        const user = activeSessions.find(user => user.userUUID === userUUID);

        if (user){
            user.tiempoRestante = tiempoRestante;
            user.tiempoDesdeUltimaRenovacion = tiempoDesdeUltimaRenovacion;
            fs.writeFileSync(sessionsFilePath, JSON.stringify(activeSessions, null, 2));
        }

        if( tiempoRestante < 0.4 * 60 * 1000 ){

            console.log(`El token del usuario ${userUUID} ha expirado`);
            
            const socketID = getUserSocket(userUUID);

            if (socketID) {
                io.to(socketID).emit('sessionExpired');
            }

        }

        else if( tiempoRestante < 5 * 60 * 1000 ){

            //SI TIENES ACTIVIDAD SE RENUEVA EL TOKEN
            if(tiempoInactivo <= 2 * 60 * 1000 && tiempoDesdeUltimaRenovacion >= 10 * 60 * 1000){
                console.log(`Renovando tiempo del token para el usuario ${userUUID}`);

                const user = activeSessions.find(user => user.userUUID === userUUID);

                if (user){
                    user.tiempoDesdeUltimaRenovacion = 0;
                    user.tiempoExpiracion = Date.now() + 900000;
                    user.tiempoRestante = 900000;
                    fs.writeFileSync(sessionsFilePath, JSON.stringify(activeSessions, null, 2));
                }

                // EMITIR MENSAJE DE RENOVACION
                const socketID = getUserSocket(userUUID);
                if (socketID) {
                    io.to(socketID).emit('tokenRenewed', { message: 'Se ha renovado la sesión', type: 'info' });
                    io.to(socketID).emit('renewToken', data);
                }   
            }
            else{
                console.log('Tu sesión se cerrará por inactividad.');
                const socketID = getUserSocket(userUUID); // Obtener el socket ID del usuario

                if (socketID) {
                    // Si el socket existe, enviar el mensaje
                    io.to(socketID).emit('sendMessageToUser', {userUUID, message: 'Tu sesión se cerrará por inactividad.', type: 'info'});
                }
            }
        }
            
        else if( tiempoRestante >= 5 * 60 * 1000 && tiempoInactivo <= 2 * 60 * 1000 && tiempoDesdeUltimaRenovacion >= 7 * 60 * 1000 ){

            console.log(`Renovando token para el usuario ${userUUID}`);

            const user = activeSessions.find(user => user.userUUID === userUUID);

            if (user){
                user.tiempoDesdeUltimaRenovacion = 0;
                user.tiempoExpiracion = Date.now() + 900000;
                user.tiempoRestante = user.tiempoExpiracion - Date.now();
                fs.writeFileSync(sessionsFilePath, JSON.stringify(activeSessions, null, 2));
            }

            // EMITIR MENSAJE DE RENOVACION
            const socketID = getUserSocket(userUUID);
            if (socketID) {
                io.to(socketID).emit('tokenRenewed', { message: 'Se ha renovado la sesión', type: 'info' });
                io.to(socketID).emit('renewToken', data);
            }     
        }
    });

    fs.writeFileSync(sessionsFilePath, JSON.stringify(activeSessions, null, 2));
}

setInterval(verificarSesionesActivas, 20000);


// Middleware para inicializar sesión activa
const verificarRenovacionToken = async (req, res, next) => {

    const accessToken = req.cookies.accessToken;

    const rutasExcluidas = ['/profile/:username', '/contact'];
    if (rutasExcluidas.some(ruta => req.path.startsWith(ruta))) {
        console.log('Ruta excluida de verificación de token:', req.path);
        return next();
    }

    if (!accessToken) {
        console.log('No se proporcionó token');
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

        const userID = decoded.userID;
        const role = decoded.role;
        const userUUID = decoded.userUUID;

        const tiempoExpiracion = decoded.exp * 1000;
        const tiempoInactivoMaximo = 14 * 60 * 1000;
        const ultimoAcceso = req.cookies.lastActivity ? parseInt(req.cookies.lastActivity) : Date.now();
        const tiempoRestante = tiempoExpiracion - Date.now();
        const tiempoDesdeUltimaRenovacion = 0;
    
        const userInfo = {userUUID:userUUID, userID:userID, role:role , tiempoExpiracion:tiempoExpiracion, tiempoInactivoMaximo:tiempoInactivoMaximo, ultimoAcceso:ultimoAcceso, 
            accessToken:accessToken, tiempoRestante:tiempoRestante, tiempoDesdeUltimaRenovacion: tiempoDesdeUltimaRenovacion};
        

        let activeSessions = loadSessions();

        const user = activeSessions.find(user => user.userUUID === userUUID);

        if (user){
            user.ultimoAcceso = ultimoAcceso;
            fs.writeFileSync(sessionsFilePath, JSON.stringify(activeSessions, null, 2));
        }

        if (!user){
            activeSessions.push(userInfo);
            fs.writeFileSync(sessionsFilePath, JSON.stringify(activeSessions, null, 2));
        }

        res.cookie('lastActivity', Date.now().toString(), {httpOnly: true, sameSite:'Lax', secure: false});
        

        next();
    } catch (error) {
        console.error('Error al verificar el token:', error);
        return res.redirect('/login');
    }
};


// Middleware de autenticación
const requireAuth = (req, res, next) => {
  const token = req.cookies.accessToken;

  if (token) {
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err) => {
          if (err) {
              console.error('Token no válido:', err);
              res.redirect('/login');
          } else {
              next();
          }
      });
  } else {
      console.log('No se proporcionó token en requireAuth');
      res.redirect('/login');
  }
};


// Middleware para verificar el rol de administrador
const requireAdmin = (req, res, next) => {
    const roleToken = req.cookies.roleToken;

    if(!roleToken){
        res.status(403).send('Acceso prohibido. Esta ruta solo es accesible para administradores.');
    }
    else {
        jwt.verify(roleToken, process.env.JWT_SECRET, (err) => {
            if (err) {
                res.redirect('/login');
            } else {
                next();
            }
        });
    }
};

module.exports = {middleware_procesar, notFound_middleware, verificarRenovacionToken, requireAuth, requireAdmin};