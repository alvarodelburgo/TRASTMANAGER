const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');
const Warehouse = require('../models/warehouse');
const { verificarRenovacionToken, requireAuth } = require('../middlewares/middlewares');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Definir las validaciones para los campos del formulario
const formValidator = [
    body('premisesId').isInt(),
    body('EOid').isInt(),
    body('role').trim().escape(),
    body('name').trim().escape(),
    body('size').trim().escape(),
    body('rental_price').isDecimal(),
    body('availability').trim().escape(),
    body('key').trim().escape()
  ];

// RUTA PARA ACTUALIZAR UN PROPIETARIO
router.post('/update_warehouse/:id', verificarRenovacionToken, requireAuth, formValidator, async (req, res) => {
    const warehouseId = req.params.id;
    const { premisesId, EOid, role, tenant_id, name, size, rental_price, availability, notes} = req.body;

    const { key, Temail} = req.body;

    let enterprise_id = null;
    let owner_id = null;

    if (role === 'enterprise') {
        enterprise_id = EOid !== '' ? EOid : null;
    } else {
        owner_id = EOid !== '' ? EOid : null;
    }

    try {
        
        // Buscar el almacén
        const warehouse = await Warehouse.findByPk(warehouseId);
        if (!warehouse) {
            return res.status(404).json({ message: 'Almacén no encontrado' });
        }

        // Actualizar los campos del almacén
        if (premisesId !== undefined) {
            warehouse.premises_id = premisesId !== '' ? parseInt(premisesId, 10) : null;
        }
        if (tenant_id !== undefined) {
            warehouse.tenant_id = tenant_id !== '' ? parseInt(tenant_id, 10) : null;
        }
        if (name !== undefined && name !== null && name !== '') {
            warehouse.name = name !== '' ? name : null;
        }
        if (size !== undefined && size !== null && size !== '') {
            warehouse.size = size;
        }
        if (rental_price !== undefined && rental_price !== null && rental_price !== '') {
            warehouse.rental_price = rental_price !== '' ? rental_price : null;
        }
        if (availability !== undefined && availability !== null && availability !== '') {
            warehouse.availability = availability;
        }
        if (enterprise_id !== undefined) {
            warehouse.enterprise_id = enterprise_id;
        }
        if (owner_id !== undefined) {
            warehouse.owner_id = owner_id;
        }
        if (key !== undefined) {
            warehouse.key = key;
        }

        if (notes !== undefined) {
            warehouse.notes = notes;
        }

        // Guardar el almacén actualizado
        await warehouse.save();

        // Buscar al tenant a partir de tenant_id
        if (Temail) {

            // Enviar correo de notificación

            const msg = {
                to: Temail,
                from: 'soporte.trastmanager@gmail.com',
                templateId: process.env.PLANTILLA_CLAVE_TRASTERO,
                dynamic_template_data: {key: key}
            };

            await sgMail.send(msg);

        } 

        // Crear token de notificación para redirigir
        const notificationToken = jwt.sign({ message: 'Almacén actualizado correctamente', type: 'success' }, process.env.JWT_SECRET, { expiresIn: '1m' });
        res.cookie('notificationToken', notificationToken);

        // Redirigir a la lista de almacenes
        res.redirect('/warehouses');
    } catch (error) {
        console.error('Error al actualizar el almacén:', error);

        // Enviar error de notificación
        const notificationToken = jwt.sign({ message: 'Error al actualizar el almacén', type: 'error' }, process.env.JWT_SECRET, { expiresIn: '1m' });
        res.cookie('notificationToken', notificationToken);

        // Redirigir a la lista de almacenes
        res.redirect('/warehouses');
    }
});

module.exports = router;