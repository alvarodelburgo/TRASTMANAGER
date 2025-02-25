const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');
router.use(cookieParser());

const { requireAuth } = require('../middlewares/middlewares');

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

// Definir las validaciones para los campos del formulario
const formValidator = [
    body('userID').isInt(),
    body('role').trim().escape(),
    body('userUUID').trim().escape()
  ];

// En tu backend (por ejemplo, Express.js)
router.post('/renew-token', requireAuth, formValidator, (req, res) => {

    const { userID, role, userUUID} = req.body;

    const accessToken = jwt.sign({ userID, role, userUUID }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    res.cookie('accessToken', accessToken, {httpOnly: true, sameSite: 'Strict', secure: true, path: '/', overwrite: true}); // httpOnly: false, secure: false, sameSite: 'Lax'

    // Cargar las sesiones activas
    let activeSessions = loadSessions();

    // Buscar al usuario y actualizar su token
    const user = activeSessions.find(user => user.userUUID === userUUID);
    
    if (user){
      user.accessToken = accessToken;
      fs.writeFileSync(sessionsFilePath, JSON.stringify(activeSessions, null, 2));
    }

    return res.status(200).json({ message: 'Token renovado correctamente' });
    
});

module.exports = router;