const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const Enterprise = require('../models/enterprise');
const { verificarRenovacionToken, requireAuth } = require('../middlewares/middlewares');

// Definir las validaciones para los campos del formulario
const formValidator = [
    body('name').trim().escape(),
    body('address').trim().escape(),
    body('username').trim().escape(),
    body('email').normalizeEmail(),
    body('cif').matches(/^[A-HJ-NP-S]{1}\d{8}[A-J]{1}$/),
    body('phone_number').isMobilePhone(),
    body('bank_account').matches(/^[A-Z]{2}\d{2}[A-Z0-9]{4,30}$/)
  ];

router.post('/update_enterprise/:id', verificarRenovacionToken, requireAuth, formValidator, (req, res) => {
    const enterpriseId = req.params.id;
    const { name, address, username, email, cif, phone_number, bank_account } = req.body;

    Enterprise.findByPk(enterpriseId)
    .then(enterprise => {
        if (!enterprise) {
            throw new Error('Empresa no encontrada');
        }

        enterprise.name = name;
        enterprise.address = address;
        enterprise.username = username;
        enterprise.email = email;
        enterprise.cif = cif;
        enterprise.phone_number = phone_number;
        enterprise.bank_account = bank_account;

        return enterprise.save();
    })
    .then(updatedEnterprise => {
        const notificationToken = jwt.sign({ message:'Empresa actualizada correctamente', type:'success' }, process.env.JWT_SECRET, { expiresIn: '1m' });
        res.cookie('notificationToken', notificationToken);
        res.redirect('/enterprises');
    })
    .catch(error => {
        const notificationToken = jwt.sign({ message:'Error al actualizar la empresa', type:'error' }, process.env.JWT_SECRET, { expiresIn: '1m' });
        res.cookie('notificationToken', notificationToken);
    });
});

module.exports = router;