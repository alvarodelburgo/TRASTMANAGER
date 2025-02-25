const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const Tenant = require('../models/tenant');
const { verificarRenovacionToken, requireAuth } = require('../middlewares/middlewares');

// Definir las validaciones para los campos del formulario
const formValidator = [
    body('enterprise_id').isInt(),
    body('owner_id').isInt(),
    body('name').trim().escape(),
    body('lastname').trim().escape(),
    body('email').normalizeEmail(),
    body('dni').matches(/^\d{8}[A-Za-z]$/),
    body('phone_number').isMobilePhone(),
    body('bank_account').matches(/^[A-Z]{2}\d{2}[A-Z0-9]{4,30}$/)
  ];
  

router.post('/update_tenant/:id', verificarRenovacionToken, requireAuth, formValidator, (req, res) => {
    const tenantId = req.params.id;
    const { enterprise_id, owner_id, name, lastname, email, dni, phone_number, bank_account } = req.body;

    Tenant.findByPk(tenantId)
        .then(tenant => {
            if (!tenant) {
                throw new Error('Cliente no encontrado');
            }

            tenant.enterprise_id = enterprise_id !== '' ? enterprise_id : null;
            tenant.owner_id = owner_id !== '' ? owner_id : null;
            tenant.name = name;
            tenant.lastname = lastname;
            tenant.email = email;
            tenant.dni = dni;
            tenant.phone_number = phone_number;
            tenant.bank_account = bank_account;

            return tenant.save();
        })
        .then(updatedTenant => {

            const notificationToken = jwt.sign({ message:'Cliente actualizado correctamente', type:'success' }, process.env.JWT_SECRET, { expiresIn: '1m' });
            res.cookie('notificationToken', notificationToken);
            res.redirect('/tenants');
        })
        .catch(error => {
            const notificationToken = jwt.sign({ message:'Error al actualizar al cliente', type:'error' }, process.env.JWT_SECRET, { expiresIn: '1m' });
            res.cookie('notificationToken', notificationToken);
            res.redirect('/tenants');
            console.log(error);
        });
});

module.exports = router;