let userSockets = {};

// Función para registrar un usuario con su socket
function registerUser(userID, socketID) {
    userSockets[userID] = socketID;
}

// Función para eliminar un usuario al desconectarse
function unregisterUser(socketID) {
    for (const userID in userSockets) {
        if (userSockets[userID] === socketID) {
            delete userSockets[userID];
            break;
        }
    }
}

// Función para obtener el socket de un usuario
function getUserSocket(userID) {
    return userSockets[userID];
}

// Exportar las funciones
module.exports = { registerUser, unregisterUser, getUserSocket };