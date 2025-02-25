const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const Rental = require('../models/rental');
const { verificarRenovacionToken, requireAuth } = require('../middlewares/middlewares');

// Definir las validaciones para los campos del formulario
const formValidator = [
    body('EOid').isInt(),
    body('premises_id').isInt(),
    body('warehouse_id').isInt(),
    body('tenant_id').isInt(),
    body('role').trim().escape(),
    body('start_date').trim().escape(),
    body('finish_date').trim().escape(),
    body('price').isFloat(),
    body('state').trim().escape(),
    body('paid').isBoolean()
  ];

router.post('/update_rental/:id', verificarRenovacionToken, requireAuth, formValidator, (req, res) => {
    const rentalId = req.params.id;
    const { EOid, premises_id, warehouse_id, tenant_id, role, start_date, finish_date, price, state, paid } = req.body;

    let enterprise_id = null;
    let owner_id = null;

    if (role === 'owner') {
        owner_id = EOid !== '' ? EOid : null;
    } else {
        enterprise_id = EOid !== '' ? EOid : null;
    }


    Rental.findByPk(rentalId)
        .then(rental => {
            if (!rental) {
                throw new Error('Almacén no encontrado');
            }
            rental.enterprise_id = premises_id;
            rental.owner_id = premises_id;
            rental.premises_id = premises_id;
            rental.warehouse_id = warehouse_id;
            rental.tenant_id = tenant_id;
            rental.start_date = start_date;
            rental.finish_date = finish_date;
            rental.price = price;
            rental.state = state;
            rental.paid = paid;
            rental.enterprise_id = enterprise_id;
            rental.owner_id = owner_id;

            return rental.save();
        })
        .then(updatedRental => {
            const notificationToken = jwt.sign({ message:'Alquiler actualizado correctamente', type:'success' }, process.env.JWT_SECRET, { expiresIn: '1m' });
            res.cookie('notificationToken', notificationToken);
            res.redirect('/rentals');
        })
        .catch(error => {
            const notificationToken = jwt.sign({ message:'Error al actualizar el alquiler', type:'error' }, process.env.JWT_SECRET, { expiresIn: '1m' });
            res.cookie('notificationToken', notificationToken);
            res.redirect('/rentals');
        });
});

module.exports = router;