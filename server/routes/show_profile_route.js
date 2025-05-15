const express = require('express');
const router = express.Router();
const path = require('path');
const jwt = require('jsonwebtoken');
const Owner = require('../models/owner');
const Enterprise = require('../models/enterprise');
const Administrator = require('../models/administrator');

//require('dotenv').config();


router.get('/profile/:username', async (req, res) => {
    const username = req.params.username;

    try {
        let user;
        let role;
        let userID;
        let viewing;

        user = await Owner.findOne({ where: { username: username } });
        if (user) {
            userID = user.id;
            role = 'owner';
            viewing = 'withoutloggingin';
        } else {
            user = await Enterprise.findOne({ where: { username: username } });
            if (user) {
                userID = user.id;
                role = 'enterprise';
                viewing = 'withoutloggingin';
            } else {
                user = await Administrator.findOne({ where: { username: username } });
                if (user) {
                    userID = user.id;
                    role = 'administrator';
                    viewing = 'withoutloggingin';
                } else {
                    console.error('Usuario no encontrado');
                    return res.status(404).send('Usuario no encontrado');
                }
            }
        }

        const roleToken = jwt.sign({ userID, role, viewing }, process.env.JWT_SECRET);
        res.cookie('roleToken', roleToken, { httpOnly: true, sameSite: 'Strict', secure: true}); /*httpOnly: true, sameSite: 'Strict', secure: false,*/
        res.sendFile(path.join(__dirname, '../../client/html', 'profile.html'));

    } catch (error) {
        console.error(error);
        res.status(500).send('Error interno del servidor');
    }
});

module.exports = router;