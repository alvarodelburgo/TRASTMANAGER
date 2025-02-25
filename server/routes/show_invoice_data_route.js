const express = require('express');
const path = require('path');
const router = express.Router();
const { verificarRenovacionToken, requireAuth } = require('../middlewares/middlewares');

router.get('/invoices', verificarRenovacionToken, requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/html', 'invoices.html'));
});

module.exports = router;