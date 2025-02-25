const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const path = require('path');
const jwt = require('jsonwebtoken');
const Tenant = require('../models/tenant');
const { verificarRenovacionToken, requireAuth } = require('../middlewares/middlewares');
const { Sequelize } = require('sequelize');


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


router.get('/create_tenant', verificarRenovacionToken, requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/html', 'create_tenant.html'));
});

router.post('/create_tenant', formValidator, (req, res) => {
  const { enterprise_id, owner_id, name, lastname, email, dni, phone_number, bank_account } = req.body;
  
  // Validar si ya existe un propietario con el mismo email, teléfono, DNI o cuenta bancaria
  Tenant.findOne({
    where: {
      [Sequelize.Op.or]: [
        { email: email },
        { phone_number: phone_number },
        { dni: dni },
        { bank_account: bank_account }
      ]
    }
  })
  .then(existingOwner => {
    if (existingOwner) {
      let errorMessage = '';

      // Comprobamos cada campo por separado y agregamos los mensajes de error

      if (existingOwner.email === email) {
        errorMessage += 'El correo electrónico ya está registrado. ';
      }
      if (existingOwner.phone_number === phone_number) {
        errorMessage += 'El número de teléfono ya está registrado. ';
      }
      if (existingOwner.dni === dni) {
        errorMessage += 'El DNI ya está registrado. ';
      }
      if (existingOwner.bank_account === bank_account) {
        errorMessage += 'La cuenta bancaria ya está registrada. ';
      }

      // Si encontramos algún error, lo enviamos
      if (errorMessage !== '') {
        console.log('Errores encontrados:', errorMessage);

        // Enviar el mensaje de error y redirigir de nuevo al formulario
        const notificationToken = jwt.sign({message: errorMessage.trim(), type:'error'}, process.env.JWT_SECRET, { expiresIn: '1m' });

        // Guardamos el token de notificación con el mensaje de error en una cookie
        res.cookie('notificationToken', notificationToken);
        
        // Redirigimos al formulario de registro con el mensaje de error
        return res.redirect('/create_tenant');
      }
    }

    Tenant.create({
      enterprise_id : enterprise_id !== '' ? enterprise_id : null,
      owner_id : owner_id !== '' ? owner_id : null,
      name: name,
      lastname: lastname,
      email: email,
      dni: dni,
      phone_number: phone_number,
      bank_account: bank_account
    })
    .then(tenant => {
      const notificationToken = jwt.sign({ message:'Cliente registrado correctamente', type:'success' }, process.env.JWT_SECRET, { expiresIn: '1m' });
      res.cookie('notificationToken', notificationToken);
      res.redirect('/tenants');
    })
    .catch(error => {
      const notificationToken = jwt.sign({ message:'Error al registrar al cliente', type:'error' }, process.env.JWT_SECRET, { expiresIn: '1m' });
      res.cookie('notificationToken', notificationToken);
      res.redirect('/create_tenant');
      console.log(error);
    });
  })
  .catch(error => {
    console.log(error);
    const notificationToken = jwt.sign({message: 'Error al verificar los datos. Intente de nuevo.',type: 'error'}, process.env.JWT_SECRET, { expiresIn: '1m' });
    res.cookie('notificationToken', notificationToken);
    res.redirect('/create_tenant');
});
});

module.exports = router;