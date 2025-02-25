const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const path = require('path');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
router.use(cookieParser());
const rateLimit = require('express-rate-limit');
const Owner = require('../models/owner');
const Enterprise = require('../models/enterprise');
const Administrator = require('../models/administrator');

require('dotenv').config();


const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 3, // Máximo 5 intentos por IP
    handler: (req, res) => {
        
        const rateLimitMessage = jwt.sign({ message:'Demasiados intentos fallidos, intenta nuevamente más tarde (15min).', type:'error' }, process.env.JWT_SECRET, { expiresIn: '10m' });
        res.cookie('rateLimitMessage', rateLimitMessage, {httpOnly: true, sameSite: 'Strict', secure: true}); //httpOnly: false, secure: false, sameSite: 'Lax'
        res.redirect('/login');
        
    }
});

// Definir las validaciones para los campos del formulario
const formValidator = [
    body('email').trim().normalizeEmail(),
    body('password').trim().escape()
];


router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/html', 'login.html'));
});

router.post('/login', loginLimiter, formValidator, async (req, res) => {
    const { email, password } = req.body;

    try {
        
        const password_hash = crypto.createHash('sha256').update(password).digest('hex');

        let role;
        let userID = null;
        let userUUID;

        let user = await Owner.findOne({
            where: { email: email, password: password_hash }
        });

        if (!user) {
            user = await Enterprise.findOne({
                where: { email: email, password: password_hash }
            });
        }

        if (!user) {
            user = await Administrator.findOne({
                where: { email: email, password: password_hash }
            });
        }

        if (!user) {
            console.error('Usuario no encontrado');
            return res.redirect('/login');
        }

        if (user instanceof Owner) {
            role = 'owner';
            userID = user.id;
            userUUID = `O-${user.id}`;

        } else if (user instanceof Enterprise) {
            role = 'enterprise';
            userID = user.id;
            userUUID = `E-${user.id}`;

        } else if (user instanceof Administrator) {
            role = 'administrator';
            userID = user.id;
            userUUID = `A-${user.id}`;
   
        } else {
            throw new Error('Rol de usuario desconocido');
        }

        const accessToken = jwt.sign({ userID, role, userUUID }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
        res.cookie('accessToken', accessToken, {httpOnly: false, secure: false, sameSite: 'Lax'});
        res.redirect('/home');

    } catch (error) {
        console.log(error);
        const notificationToken = jwt.sign({ message:'Error al autenticar al usuario', type:'error' }, process.env.JWT_SECRET, { expiresIn: '10m' });
        res.cookie('notificationToken', notificationToken);
        res.redirect('/login');
    }
});

module.exports = router;