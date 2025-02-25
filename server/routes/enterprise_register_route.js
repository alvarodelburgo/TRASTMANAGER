const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const crypto = require("crypto");
const jwt = require('jsonwebtoken');
const Enterprise = require('../models/enterprise');
const { verificarRenovacionToken, requireAuth } = require('../middlewares/middlewares');
const { Sequelize } = require('sequelize');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../client/assets/uploads')); // Define la carpeta de destino para guardar los archivos adjuntos
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Define el nombre de archivo original para guardar el archivo adjunto
  }
});
  
const upload = multer({ storage: storage });


// Definir las validaciones para los campos del formulario
const formValidator = [
  body('name').trim().escape(),
  body('address').trim().escape(),
  body('username').trim().escape(),
  body('email').normalizeEmail(),
  body('cif').matches(/^[A-HJ-NP-S]{1}\d{8}[A-J]{1}$/),
  body('phone_number').isMobilePhone(),
  body('bank_account').matches(/^[A-Z]{2}\d{2}[A-Z0-9]{4,30}$/),
  body('role').trim().escape(),
  body('password').trim().escape()
];


router.get('/enterprise_register', verificarRenovacionToken, requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/html', 'enterprise_register.html'));
});


router.post('/enterprise_register', upload.single('profile_image'), formValidator, (req, res) => {

  const { name, address, username, email, phone_number, cif, bank_account, role, password} = req.body;

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
  Enterprise.findOne({
    where: {
      [Sequelize.Op.or]: [
        { username: username },
        { email: email },
        { phone_number: phone_number },
        { cif: cif },
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
      if (existingOwner.cif === cif) {
        errorMessage += 'El CIF ya está registrado. ';
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
        return res.redirect('/enterprise_register');
      }
    }

    Enterprise.create({
      name: name,
      address: address,
      username: username,
      email: email,
      phone_number: phone_number,
      cif:cif,
      bank_account: bank_account,
      role: role,
      password: password_hash,
      profile_image:imagenPerfilPath
    })

    .then(enterprise => {
      const notificationToken = jwt.sign({ message:'Empresa registrada correctamente', type:'success' }, process.env.JWT_SECRET, { expiresIn: '1m' });
      res.cookie('notificationToken', notificationToken);
      res.redirect('/enterprises');

    })
    .catch(error => {
      const notificationToken = jwt.sign({ message:'Error al registrar la empresa', type:'error' }, process.env.JWT_SECRET, { expiresIn: '1m' });
      res.cookie('notificationToken', notificationToken);
      res.redirect('/enterprise_register');
    });
  })

  .catch(error => {
    console.log(error);
    const notificationToken = jwt.sign({message: 'Error al verificar los datos. Intente de nuevo.',type: 'error'}, process.env.JWT_SECRET, { expiresIn: '1m' });
    res.cookie('notificationToken', notificationToken);
    res.redirect('/enterprise_register');
  });
});

module.exports = router;