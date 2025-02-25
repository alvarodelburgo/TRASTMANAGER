const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const path = require('path');
const Warehouse = require('../models/warehouse');
const jwt = require('jsonwebtoken');
const Premises = require('../models/premises');
const { verificarRenovacionToken, requireAuth } = require('../middlewares/middlewares');


// Definir las validaciones para los campos del formulario
const formValidator = [
    body('premises_id').isInt(),
    body('enterprise_id').isInt(),
    body('owner_id').isInt(),
    body('tenant_id').isInt(),
    body('name').trim().escape(),
    body('size').trim().escape(),
    body('rental_price').isDecimal(),
    body('availability').trim().escape()
  ];

router.get('/create_warehouse', verificarRenovacionToken, requireAuth,(req, res) => {
    res.sendFile(path.join(__dirname, '../../client/html', 'create_warehouse.html'));
});

router.post('/create_warehouse', formValidator, (req, res) => {
    const { premises_id, enterprise_id, owner_id, tenant_id, name, size, rental_price, availability} = req.body;

    Warehouse.findOne({
        order: [['id', 'DESC']]
    })
    .then(lastWarehouse => {
        let nextId = 1;

        if (lastWarehouse) {
            nextId = lastWarehouse.id + 1;
        }

        return Warehouse.create({
            id: nextId,
            premises_id: premises_id,
            enterprise_id: enterprise_id !== '' ? enterprise_id : null,
            owner_id: owner_id !== '' ? owner_id : null,
            tenant_id: tenant_id !== '' ? tenant_id : null,
            name: name !== '' ? name : 'No definido',
            size: size !== '' ? size : 'No definido',
            rental_price: rental_price !== '' ? rental_price : 'No definido',
            availability: availability !== '' ? availability : 'No definido'
        });
    })
    .then(newWarehouse => {
        const notificationToken = jwt.sign({ message:'Almacén registrado correctamente', type:'success' }, process.env.JWT_SECRET, { expiresIn: '1m' });
        res.cookie('notificationToken', notificationToken);
        return Premises.findByPk(premises_id);
    })
    .then(premises => {
        if (!premises) {
            throw new Error('Local no encontrado');
        }
        premises.capacity += 1;
        return premises.save();
    })
    .then(() => {
        res.redirect('/warehouses');
    })
    .catch(error => {
        const notificationToken = jwt.sign({ message:'Error al registrar el almacén', type:'error' }, process.env.JWT_SECRET, { expiresIn: '1m' });
        res.cookie('notificationToken', notificationToken);
        res.redirect('/create_warehouse');
    });
});

module.exports = router;