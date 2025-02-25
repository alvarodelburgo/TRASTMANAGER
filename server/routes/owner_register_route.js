const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const crypto = require("crypto");
const jwt = require('jsonwebtoken');
const Owner = require('../models/owner');
const { verificarRenovacionToken, requireAuth } = require('../middlewares/middlewares');
const { Sequelize } = require('sequelize');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../client/assets/uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
  
const upload = multer({ storage: storage });


// Definir las validaciones para los campos del formulario
const formValidator = [
  body('name').trim().escape(),
  body('lastname').trim().escape(),
  body('username').trim().escape(),
  body('email').normalizeEmail(),
  body('dni').matches(/^\d{8}[A-Za-z]$/),
  body('phone_number').isMobilePhone(),
  body('bank_account').matches(/^[A-Z]{2}\d{2}[A-Z0-9]{4,30}$/),
  body('role').trim().escape(),
  body('password').trim().escape()
];


router.get('/owner_register', verificarRenovacionToken, requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/html', 'owner_register.html'));
});


router.post('/owner_register',upload.single('profile_image'), formValidator, (req, res) => {
  
  const { name, lastname, username, email, dni, phone_number, bank_account, role, password} = req.body;

  const password_hash = crypto.createHash("sha256").update(password).digest("hex");

  let imagenPerfilPath = null;

  if (req.file) {

    const nombreArchivo = req.file.originalname;
    const rutaImagen = path.join(__dirname, '../../client/assets/uploads', nombreArchivo);
    fs.renameSync(req.file.path, rutaImagen);
    imagenPerfilPath = '/assets/uploads/' + nombreArchivo;

  }else {
    
    imagenPerfilPath = '/assets/uploads/default_profile_img.jpg';

  }


  // Validar si ya existe un propietario con el mismo email, teléfono, DNI o cuenta bancaria
  Owner.findOne({
    where: {
      [Sequelize.Op.or]: [
        { username: username },
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
      if (existingOwner.username === username) {
        errorMessage += 'El nombre de usuario ya está registrado. ';
      }
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
        
        // Enviar el mensaje de error y redirigir de nuevo al formulario
        const notificationToken = jwt.sign({message: errorMessage.trim(), type:'error'}, process.env.JWT_SECRET, { expiresIn: '10m' });

        // Guardamos el token de notificación con el mensaje de error en una cookie
        res.cookie('notificationToken', notificationToken);
        
        // Redirigimos al formulario de registro con el mensaje de error
        return res.redirect('/owner_register');
      }
    }

    Owner.create({
      name: name,
      lastname: lastname,
      username: username,
      email: email,
      dni:dni,
      phone_number: phone_number,
      bank_account: bank_account,
      role: role,
      password: password_hash,
      profile_image:imagenPerfilPath
    })

    .then(owner => {
      const notificationToken = jwt.sign({ message:'Propietario registrado correctamente', type:'success' }, process.env.JWT_SECRET, { expiresIn: '1m' });
      res.cookie('notificationToken', notificationToken);
      res.redirect('/owners');
    })
    .catch(error => {
      console.log(error);
      const notificationToken = jwt.sign({ message:'Error al registrar al propietario', type:'error' }, process.env.JWT_SECRET, { expiresIn: '1m' });
      res.cookie('notificationToken', notificationToken);
      res.redirect('/owner_register');
    });

  })
  .catch(error => {
      console.log(error);
      const notificationToken = jwt.sign({message: 'Error al verificar los datos. Intente de nuevo.',type: 'error'}, process.env.JWT_SECRET, { expiresIn: '1m' });
      res.cookie('notificationToken', notificationToken);
      res.redirect('/owner_register');
  });
});

module.exports = router;