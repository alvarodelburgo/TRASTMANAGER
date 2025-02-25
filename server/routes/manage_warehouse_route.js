const express = require('express');
const path = require('path');
const router = express.Router();
const { verificarRenovacionToken, requireAuth } = require('../middlewares/middlewares');

// RUTA PARA ACTUALIZAR UN PROPIETARIO
router.get('/manage_warehouse/:id', verificarRenovacionToken, requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/html', 'manage_warehouse.html'));

});

module.exports = router;