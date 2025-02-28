const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const path = require('path');
const sgMail = require('@sendgrid/mail');
const jwt = require('jsonwebtoken');
const Contact = require('../models/contact');
//require('dotenv').config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);


// Definir las validaciones para los campos del formulario
const formValidator = [
    body('full_name').trim().escape(),
    body('email').normalizeEmail(),
    body('subject').trim().escape(),
    body('message').trim().escape()
];

router.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/html', 'contact.html'));
});

router.post('/contact', formValidator, async (req, res) => {
    const { full_name, email, subject, message } = req.body;

    try {
        await Contact.create({
            full_name: full_name,
            email: email,
            subject: subject,
            message: message
        });

        // Enviar correo de notificación
        const msg = {
            to: 'soporte.trastmanager@gmail.com',
            from: 'soporte.trastmanager@gmail.com',
            replyTo: email,
            templateId: process.env.PLANTILLA_CONTACTO,
            dynamic_template_data: {
                subject: subject,
                full_name: full_name,
                email: email,
                message: message,}
        };


        await sgMail.send(msg);
        const notificationToken = jwt.sign({ message:'Mensaje guardado y correo electrónico enviado', type:'success' }, process.env.JWT_SECRET, { expiresIn: '1m' });
        res.cookie('notificationToken', notificationToken);
        return res.redirect('/contact');

    } catch (error) {
        const notificationToken = jwt.sign({ message:'Error al guardar el mensaje o enviar el correo', type:'error' }, process.env.JWT_SECRET, { expiresIn: '1m' });
        res.cookie('notificationToken', notificationToken);
        return res.redirect('/contact');
    }
});

module.exports = router;