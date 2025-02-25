const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const Owner = require('../models/owner');
const { verificarRenovacionToken, requireAuth } = require('../middlewares/middlewares');

// Definir las validaciones para los campos del formulario
const formValidator = [
    body('name').trim().escape(),
    body('lastname').trim().escape(),
    body('username').trim().escape(),
    body('email').normalizeEmail(),
    body('dni').matches(/^\d{8}[A-Za-z]$/),
    body('phone_number').isMobilePhone(),
    body('bank_account').matches(/^[A-Z]{2}\d{2}[A-Z0-9]{4,30}$/)
  ];

router.post('/update_owner/:id', verificarRenovacionToken, requireAuth, formValidator, (req, res) => {
    const ownerId = req.params.id;
    const { name, lastname, username, email, dni, phone_number, bank_account } = req.body;

    Owner.findByPk(ownerId)
    .then(owner => {
        if (!owner) {
            throw new Error('Propietario no encontrado');
        }

        owner.name = name;
        owner.lastname = lastname;
        owner.username = username;
        owner.email = email;
        owner.dni = dni;
        owner.phone_number = phone_number;
        owner.bank_account = bank_account;

        return owner.save();
    })
    .then(updatedOwner => {
        const notificationToken = jwt.sign({ message:'Propietario actualizado correctamente', type:'success' }, process.env.JWT_SECRET, { expiresIn: '1m' });
        res.cookie('notificationToken', notificationToken);
        res.redirect('/owners');
    })
    .catch(error => {
        const notificationToken = jwt.sign({ message:'Error al actualizar al propietario', type:'error' }, process.env.JWT_SECRET, { expiresIn: '1m' });
        res.cookie('notificationToken', notificationToken);
        res.redirect('/owners');
    });
});

module.exports = router;