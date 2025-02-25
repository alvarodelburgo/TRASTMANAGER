const express = require('express');
const router = express.Router();
const { loadTokens } = require('../middlewares/middlewares');
const path = require('path');
const fs = require('fs');

router.get('/logout', (req, res) => {
    const accessToken = req.cookies.accessToken;

    try {

        const sessionsFilePath = path.join(__dirname, '../data/sessions.json');

        const sessionsData = JSON.parse(fs.readFileSync(sessionsFilePath, 'utf-8'));

        const updatedSessions = sessionsData.filter(entry => !(entry.accessToken === accessToken));

        fs.writeFileSync(sessionsFilePath, JSON.stringify(updatedSessions, null, 2));

        // Limpiar cookies
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.clearCookie('roleToken');
        res.clearCookie('lastActivity');

        // Destruir la sesión del usuario
        req.session.destroy(err => {
            if (err) {
                console.error('Error al destruir la sesión:', err);
                return res.redirect('/home');
            }
            res.redirect('/login');
        });
    } catch (err) {
        console.error('Error al procesar el token:', err);
        res.status(401).send('Token inválido o expirado.');
    }
});

module.exports = router;