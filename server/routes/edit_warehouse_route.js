const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const path = require('path');
const Warehouse = require('../models/warehouse');
const { verificarRenovacionToken,requireAuth } = require('../middlewares/middlewares');

// Definir las validaciones para los campos del formulario
const formValidator = [
    body('enterprise_id').isInt(),
    body('owner_id').isInt(),
    body('premises_id').isInt(),
    body('tenant_id').isInt(),
    body('name').trim().escape(),
    body('size').trim().escape(),
    body('rental_price').isDecimal(),
    body('notes').trim().escape()
  ];

router.get('/edit_warehouse/:id', verificarRenovacionToken, requireAuth,(req, res) => {
    res.sendFile(path.join(__dirname, '../../client/html', 'edit_warehouse.html'));
  });
  

// RUTA PARA ACTUALIZAR UN ALMACÉN
router.post('/edit_warehouse/:id', verificarRenovacionToken, requireAuth, formValidator, (req, res) => {
  const warehouseId = req.params.id;
  const { enterprise_id, owner_id, premises_id, tenant_id, name, size, rental_price, notes} = req.body;

  Warehouse.findByPk(warehouseId)
      .then(warehouse => {
          if (!warehouse) {
              throw new Error('Almacén no encontrado');
          }

          warehouse.premises_id = premises_id !== '' ? parseInt(premises_id, 10) : null;
          warehouse.tenant_id = tenant_id !== '' ? parseInt(tenant_id, 10) : null;
          warehouse.name = name !== '' ? name : null;
          warehouse.size = size !== '' ? size : null;
          warehouse.rental_price = rental_price !== '' ? parseFloat(rental_price) : null;
          warehouse.notes = notes !== '' ? notes : null;
          warehouse.enterprise_id = enterprise_id !== '' && !isNaN(parseInt(enterprise_id, 10)) ? parseInt(enterprise_id, 10) : null;
          warehouse.owner_id = owner_id !== '' && !isNaN(parseInt(owner_id, 10)) ? parseInt(owner_id, 10) : null;

          return warehouse.save();
      })
      .then(updatedWarehouse => {
          res.redirect(`/manage_warehouse/${warehouseId}`);
      })
      .catch(error => {
          res.redirect(`/edit_warehouse/${warehouseId}`);
          console.log(error);
      });
});

module.exports = router;