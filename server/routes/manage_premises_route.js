const express = require('express');
const router = express.Router();
const path = require('path');
const { verificarRenovacionToken, requireAuth } = require('../middlewares/middlewares');

router.get('/manage_premises/:id', verificarRenovacionToken, requireAuth, (req, res) => {
  
  res.sendFile(path.join(__dirname, '../../client/html', 'manage_premises.html'));
  });

  module.exports = router;