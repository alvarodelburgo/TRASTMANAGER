const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const path = require('path');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const multer = require('multer');
const crypto = require("crypto");
const Administrator = require('../models/administrator');
const Owner = require('../models/owner');
const Enterprise = require('../models/enterprise');
const { verificarRenovacionToken, requireAuth } = require('../middlewares/middlewares');

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
    body('lastname').trim().escape(),
    body('address').trim().escape(),
    body('username').trim().escape(),
    body('email').normalizeEmail(),
    body('phone_number').isMobilePhone(),
    body('cif').matches(/^[A-HJ-NP-S]{1}\d{8}[A-J]{1}$/),
    body('dni').matches(/^\d{8}[A-Za-z]$/),
    body('bank_account').matches(/^[A-Z]{2}\d{2}[A-Z0-9]{4,30}$/),
    body('password').trim().escape(),
    body('passwordConfirm').trim().escape()
  ];

router.post('/update_profile/:username', verificarRenovacionToken, requireAuth, upload.single('profile_image'), formValidator, async (req, res) => {
    const usernameParam = req.params.username;
    const { name, lastname, address, username, email, phone_number, cif, dni, bank_account, password, passwordConfirm, delete_profile_image } = req.body;

    if (password != passwordConfirm) {
        const notificationToken = jwt.sign({ message:'Las contraseñas no coinciden', type:'error' }, process.env.JWT_SECRET, { expiresIn: '1m' });
        res.cookie('notificationToken', notificationToken);
        return res.redirect('/edit_profile');
    }

    let password_hash = null;
    if (password) {
        password_hash = crypto.createHash("sha256").update(password).digest("hex");
    }

    let imagenPerfilPath = null;

    if (req.file) {

        const nombreArchivo = req.file.originalname;
        const rutaImagen = path.join(__dirname, '../../client/assets/uploads', nombreArchivo);
        fs.renameSync(req.file.path, rutaImagen);
        imagenPerfilPath = '/assets/uploads/' + nombreArchivo;

    }
    else if(delete_profile_image === "yes"){
        
        imagenPerfilPath = '/assets/uploads/default_profile_img.jpg';
    }

    try {
        let user;
        let userType = '';

        // Buscar en la tabla de administradores
        user = await Administrator.findOne({ where: {username: usernameParam} });
        if (user) userType = 'Administrator';

        // Si no se encuentra en administradores, buscar en owners
        if (!user) {
            user = await Owner.findOne({ where: {username: usernameParam} });
            if (user) userType = 'Owner';
        }

        // Si no se encuentra en owners, buscar en enterprises
        if (!user) {
            user = await Enterprise.findOne({ where: {username: usernameParam} });
            if (user) userType = 'Enterprise';
        }

        // Si no se encuentra en ninguna tabla, retornar un error
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        
        // Actualizar campos específicos según el tipo de usuario
        if (userType === 'Administrator') {
            // Actualizar los campos comunes
            if (imagenPerfilPath) user.profile_image = imagenPerfilPath;
            if (email) user.email = email;
            if (username) user.username = username;
            if (password_hash) user.password = password_hash;

        } else if (userType === 'Owner') {
            // Actualizar campos específicos de Owner
            if (name) user.name = name;
            if (lastname) user.lastname = lastname;
            if (username) user.username = username;
            if (phone_number) user.phone_number = phone_number;
            if (dni) user.dni = dni;
            if (bank_account) user.bank_account = bank_account;
            if (imagenPerfilPath) user.profile_image = imagenPerfilPath;

        } else if (userType === 'Enterprise') {
            // Actualizar campos específicos de Enterprise
            if (name) user.name = name;
            if (address) user.address = address;
            if (username) user.username = username;
            if (phone_number) user.phone_number = phone_number;
            if (cif) user.cif = cif;
            if (bank_account) user.bank_account = bank_account;
            if (imagenPerfilPath) user.profile_image = imagenPerfilPath;
        }

        await user.save();
        const notificationToken = jwt.sign({ message:'Perfil actualizado correctamente', type:'success' }, process.env.JWT_SECRET, { expiresIn: '1m' });
        res.cookie('notificationToken', notificationToken);
        return res.redirect('/edit_profile');

    } catch (error) {
        const notificationToken = jwt.sign({ message:'Error al actualizar el perfil', type:'error' }, process.env.JWT_SECRET, { expiresIn: '1m' });
        res.cookie('notificationToken', notificationToken);
        return res.redirect('/edit_profile');
    }
});

module.exports = router;