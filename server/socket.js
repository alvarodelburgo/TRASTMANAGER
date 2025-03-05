const socketIo = require('socket.io');

let io;

const initSocket = (server) => {
    io = socketIo(server, {
        cors: {
            origin: ["https://trastmanager.com/", "http://localhost:3000"], // Orígenes permitidos
            methods: ["GET", "POST", "DELETE"],
            credentials: true,
            allowedHeaders: ["Content-Type", "Authorization"]
        },
        transports: ['polling', 'websocket']
    });
};

const getSocket = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

module.exports = { initSocket, getSocket };