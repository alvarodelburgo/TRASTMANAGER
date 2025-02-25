const socketIo = require('socket.io');

let io;

const initSocket = (server) => {
    io = socketIo(server); // Se asocia Socket.IO con el servidor HTTP
};

const getSocket = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!'); // Si intentas usarlo antes de inicializarlo, arroja un error
    }
    return io;
};

module.exports = { initSocket, getSocket };