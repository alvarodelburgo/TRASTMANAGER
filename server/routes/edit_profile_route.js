const express = require('express');
const router = express.Router();
const path = require('path');
const { verificarRenovacionToken,requireAuth } = require('../middlewares/middlewares');

router.get('/edit_profile', verificarRenovacionToken, requireAuth,(req, res) => {
    res.sendFile(path.join(__dirname, '../../client/html', 'edit_profile.html'));
  });
  
  module.exports = router;