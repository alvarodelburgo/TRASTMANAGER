const express = require('express');
const path = require('path');
const router = express.Router();
const { verificarRenovacionToken, requireAuth } = require('../middlewares/middlewares');

router.get('/cameras', verificarRenovacionToken, requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/html', 'cameras.html'));
});

module.exports = router;