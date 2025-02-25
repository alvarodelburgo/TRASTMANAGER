const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const path = require('path');
const jwt = require('jsonwebtoken');

// Definir las validaciones para los campos del formulario
const formValidator = [
  body('digit1').isInt(),
  body('digit2').isInt(),
  body('digit3').isInt(),
  body('digit4').isInt(),
  body('digit5').isInt(),
  body('digit6').isInt()
];

router.get('/recovery_code', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/html', 'recovery_code.html'));
});

router.post('/recovery_code', formValidator, (req, res) => {
  const token = req.cookies.recoveryToken;

  // Construir inputCode a partir de los dígitos del formulario
  const { digit1, digit2, digit3, digit4, digit5, digit6 } = req.body;
  const inputCode = `${digit1}${digit2}${digit3}${digit4}${digit5}${digit6}`;

  if (!token) {
    return res.status(403).send('No recovery token found');
  }

  jwt.verify(token, process.env.CODE_KEY, (err, decoded) => {
    if (err) {
      console.error('Error verifying token:', err.message);
      return res.status(403).send('Invalid recovery token');
    }

    const recoveryCode = decoded.recoveryCode;
    const email = decoded.email;
    const foundIn = decoded.foundIn;

    if (recoveryCode.toString() === inputCode) {

      const emailToken = jwt.sign({ email, foundIn }, process.env.CODE_KEY, { expiresIn: '4m' });
      res.cookie('emailToken', emailToken, {httpOnly: true, sameSite: 'Strict', secure: true});//httpOnly: true, sameSite: 'Strict', secure: false
      res.redirect('/recovery_newpassword');
    } else {
      console.error('Código inválido');
      res.redirect('/recovery_code');
    }
  });
});

module.exports = router;