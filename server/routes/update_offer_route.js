const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const Offer = require('../models/offer');
const { verificarRenovacionToken, requireAuth } = require('../middlewares/middlewares');

// Definir las validaciones para los campos del formulario
const formValidator = [
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

router.post('/update_offer/:id', verificarRenovacionToken, requireAuth, formValidator, (req, res) => {

    const { premises_id, warehouse_id, title, address, size, rental_price, description, email, phone_number } = req.body;
    const offerid = req.params.id;

    Offer.findByPk(offerid)
    .then(offer => {
        if (!offer) {
            throw new Error('Oferta no encontrada');
        }
        
        offer.premises_id = premises_id;
        offer.warehouse_id = warehouse_id;
        offer.title = title;
        offer.address = address;
        offer.size = size;
        offer.rental_price = rental_price;
        offer.description = description;
        offer.email = email;
        offer.phone_number = phone_number;

        return offer.save();
    })
    .then(updatedOffer => {
        const notificationToken = jwt.sign({ message:'Oferta actualizada correctamente', type:'success' }, process.env.JWT_SECRET, { expiresIn: '1m' });
        res.cookie('notificationToken', notificationToken);
        res.redirect(`/offers`);
    })
    .catch(error => {
        console.log(error);
        const notificationToken = jwt.sign({ message:'Error al actualizar la oferta', type:'error' }, process.env.JWT_SECRET, { expiresIn: '1m' });
        res.cookie('notificationToken', notificationToken);
        res.redirect(`/offers`);
    });
});

router.post('/update_offer2/:id', verificarRenovacionToken, requireAuth, (req, res) => {

    const {title, address, size, rental_price, description, email, phone_number } = req.body;
    const offerid = req.params.id;

    Offer.findByPk(offerid)
    .then(offer => {
        if (!offer) {
            throw new Error('Oferta no encontrada');
        }
        
        offer.title = title;
        offer.address = address;
        offer.size = size;
        offer.rental_price = rental_price;
        offer.description = description;
        offer.email = email;
        offer.phone_number = phone_number;

        return offer.save();
    })
    .then(updatedOffer => {
        const notificationToken = jwt.sign({ message:'Oferta actualizada correctamente', type:'success' }, process.env.JWT_SECRET, { expiresIn: '1m' });
        res.cookie('notificationToken', notificationToken);
        res.redirect(`/home`);
    })
    .catch(error => {
        console.log(error);
        const notificationToken = jwt.sign({ message:'Error al actualizar la oferta', type:'error' }, process.env.JWT_SECRET, { expiresIn: '1m' });
        res.cookie('notificationToken', notificationToken);
        res.redirect(`/home`);
    });
});

module.exports = router;