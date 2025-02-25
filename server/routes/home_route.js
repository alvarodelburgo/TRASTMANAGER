const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const router = express.Router();
const { verificarRenovacionToken, requireAuth } = require('../middlewares/middlewares');

// Usa cookie-parser
router.use(cookieParser());

// Ruta para '/home'
router.get('/home', verificarRenovacionToken, requireAuth, (req, res) => {
  // Recuperar la cookie
  const token = req.cookies.accessToken;

  // Verificar el JWT y extraer el role
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Token is not valid' });
    }

    const { role } = decoded;

    res.cookie('accessToken', token, { httpOnly: true, sameSite: 'Strict', secure: true }); //sameSite: 'Lax' secure: false

    // Dependiendo del rol, redirigir a un HTML diferente
    if (role === 'administrator') {
      return res.sendFile(path.join(__dirname, '../../client/html', 'home.html'));
    } else if (role === 'owner' || role === 'enterprise') {
      return res.sendFile(path.join(__dirname, '../../client/html', 'home2.html'));
    } else {
      return res.status(403).json({ error: 'Role not authorized' });
    }
  });
});

module.exports = router;
