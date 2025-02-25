const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const path = require('path');
const crypto = require("crypto");
const jwt = require('jsonwebtoken');
const Owner = require('../models/owner');
const Enterprise = require('../models/enterprise');
require('dotenv').config();


// Definir las validaciones para los campos del formulario
const formValidator = [
  body('password').trim().escape(),
  body('confirmPassword').trim().escape()
];

router.get('/recovery_newpassword', (req, res) => {

  res.sendFile(path.join(__dirname, '../../client/html', 'recovery_newpassword.html'));

});


router.post('/recovery_newpassword', formValidator, async (req, res) => {
  const { password, confirmPassword } = req.body;

  const emailToken = req.cookies.emailToken;
  
    if (!emailToken) {
      return res.status(403).send('No recovery token found');
    }

    let email;
    let foundIn;
  
    jwt.verify(emailToken, process.env.CODE_KEY, (err, decoded) => {
      if (err) {
        console.error('Error verifying token:', err.message);
        return res.status(403).send('Invalid recovery token');
      }
      email = decoded.email;
      foundIn = decoded.foundIn;
    });

    if (password !== confirmPassword) {
        const notificationToken = jwt.sign({ message:'Las contraseñas no coinciden, intente nuevamente.', type:'error' }, process.env.JWT_SECRET, { expiresIn: '2m' });
        res.cookie('notificationToken', notificationToken);
        return res.redirect('/recovery_newpassword');
    }
    try {

      const password_hash = crypto.createHash("sha256").update(password).digest("hex");

      if (foundIn === 'Owner') {
        await Owner.update({ password: password_hash }, {where: { email: email}});

      } 
      
      else {
        await Enterprise.update({ password: password_hash }, {where: {email: email}});

      }
      res.redirect('/login');
    } catch (error) {
      const notificationToken = jwt.sign({ message:'Error al actualizar la contraseña.', type:'error' }, process.env.JWT_SECRET, { expiresIn: '2m' });
      res.cookie('notificationToken', notificationToken);
      return res.redirect('/recovery_newpassword');
    }
});

module.exports = router;