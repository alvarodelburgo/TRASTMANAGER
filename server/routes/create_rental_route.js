const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const path = require('path');
const jwt = require('jsonwebtoken');
const Rental = require('../models/rental');
const { verificarRenovacionToken, requireAuth } = require('../middlewares/middlewares');


// Definir las validaciones para los campos del formulario
const formValidator = [
  body('enterprise_id').isInt(),
  body('owner_id').isInt(),
  body('premises_id').isInt(),
  body('warehouse_id').isInt(),
  body('tenant_id').isInt(),
  body('start_date').trim().escape(),
  body('finish_date').trim().escape(),
  body('price').isFloat(),
  body('state').trim().escape(),
  body('paid').isBoolean()
];


router.get('/create_rental', verificarRenovacionToken,requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/html', 'create_rental.html'));
});

router.post('/create_rental', formValidator, (req, res) => {

  const { enterprise_id, owner_id, premises_id, warehouse_id, tenant_id, start_date, finish_date, price, state, paid} = req.body;

  Rental.create({
    enterprise_id: enterprise_id !== '' ? enterprise_id : null,
    owner_id: owner_id !== '' ? owner_id : null,
    premises_id: premises_id,
    warehouse_id: warehouse_id,
    tenant_id: tenant_id,
    start_date: start_date,
    finish_date: finish_date,
    price: price,
    state: state,
    paid: paid
  })

  .then(rental => {
    const notificationToken = jwt.sign({ message:'Alquiler creado correctamente', type:'success' }, process.env.JWT_SECRET, { expiresIn: '1m' });
    res.cookie('notificationToken', notificationToken);
    res.redirect('/rentals');

  })
  .catch(error => {
    console.log(error);
    const notificationToken = jwt.sign({ message:'Error al registrar el alquiler', type:'error' }, process.env.JWT_SECRET, { expiresIn: '1m' });
    res.cookie('notificationToken', notificationToken);
    res.redirect('/create_rental');
  });
});

module.exports = router;