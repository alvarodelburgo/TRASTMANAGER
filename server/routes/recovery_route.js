const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const path = require('path');
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');
const Enterprise = require('../models/enterprise');
const Owner = require('../models/owner');
const cookieParser = require('cookie-parser');

require('dotenv').config();

router.use(cookieParser());
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Definir las validaciones para los campos del formulario
const formValidator = [
    body('email').trim().normalizeEmail()
  ];

router.get('/recovery', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/html', 'recovery.html'));
});


router.post('/recovery', formValidator, async (req, res) => {
  const { email } = req.body;

  if (!email) {
      return res.status(400).send('Email is required');
  }

  try {
      const owner = await Owner.findOne({ where: { email } });
      let foundIn = 'Owner';

      if (!owner) {
          const enterprise = await Enterprise.findOne({ where: { email } });
          if (!enterprise) {
              console.log('Email not found');
              return res.redirect('/password_recovery');
          } else {
              foundIn = 'Enterprise';
          }
      }

      const recoveryCode = Math.floor(100000 + Math.random() * 900000);

      const token = jwt.sign({ email, recoveryCode, foundIn }, process.env.CODE_KEY, { expiresIn: '4m' });

      const msg = {
        to: email,
        from: 'soporte.trastmanager@gmail.com',
        templateId: process.env.PLANTILLA_CLAVE_RECUPERACION_CONTRASENA,
        dynamic_template_data: {recoveryCode: recoveryCode}
    };

      await sgMail.send(msg);

      res.cookie('recoveryToken', token, {httpOnly: true, sameSite: 'Strict', secure: true}); // httpOnly: true, sameSite: 'Strict' , secure: false,*/
      res.redirect('/recovery_code');

  } catch (error) {
      console.error('Error in password recovery process:', error);
      res.status(500).send('Failed to send recovery email');
  }
});

module.exports = router;