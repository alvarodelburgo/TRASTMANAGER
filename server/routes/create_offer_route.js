const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const { verificarRenovacionToken, requireAuth } = require('../middlewares/middlewares');
const Offers = require('../models/offer');

// Configuración de multer para almacenar archivos
const storage = multer.diskStorage({
    destination: function (req, files, cb) {
        cb(null, path.join(__dirname, '../../client/assets/offers_images'));
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });


// Definir las validaciones para los campos del formulario
const formValidator = [
    body('administrator_id').isInt(),
    body('owner_id').isInt(),
    body('enterprise_id').isInt(),
    body('premises_id').isInt(),
    body('warehouse_id').isInt(),
    body('title').trim().escape(),
    body('address').trim().escape(),
    body('size').trim().escape(),
    body('rental_price').isDecimal(),
    body('description').trim().escape(),
    body('email').normalizeEmail(),
    body('phone_number').isMobilePhone()
];


router.get('/create_offer', verificarRenovacionToken, requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/html', 'create_offer.html'));
});


router.post('/create_offer', verificarRenovacionToken, requireAuth, upload.array('images', 5), formValidator, (req, res) => {

    const { administrator_id, owner_id, enterprise_id, premises_id, warehouse_id, title, address, size, rental_price, description, email, phone_number} = req.body;

    let imagenesPaths = [];

    if (req.files && req.files.length > 0) {

        req.files.forEach(file => {
            imagenesPaths.push('/offers_images/' + file.filename);
        });
    } else {
        // Si no hay archivos, asignar una imagen por defecto
        imagenesPaths.push('/offers_images/default.jpg');
    }

    Offers.create({
        administrator_id: administrator_id !== '' ? administrator_id : null,
        enterprise_id: enterprise_id !== '' ? enterprise_id : null,
        owner_id: owner_id !== '' ? owner_id : null,
        premises_id: premises_id,
        warehouse_id: warehouse_id,
        title: title,
        address: address,
        size: size,
        rental_price: rental_price,
        description:description,
        email: email,
        phone_number: phone_number,
        status: 'active',
        images: imagenesPaths  
    })
    .then(offer => {
        const notificationToken = jwt.sign({ message:'Oferta registrada correctamente', type:'success' }, process.env.JWT_SECRET, { expiresIn: '1m' });
        res.cookie('notificationToken', notificationToken);
        res.redirect('/home');
    })
    
    .catch(error => {
        const notificationToken = jwt.sign({ message:'Error al registrar la oferta', type:'error' }, process.env.JWT_SECRET, { expiresIn: '1m' });
        res.cookie('notificationToken', notificationToken);
        console.log(error);
        res.redirect('/home');
    });
});

module.exports = router;