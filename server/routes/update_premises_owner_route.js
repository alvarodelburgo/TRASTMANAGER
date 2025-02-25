const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const path = require('path');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const Premises = require('../models/premises');
const { verificarRenovacionToken, requireAuth } = require('../middlewares/middlewares');

// Configuración de multer para almacenar archivos
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
    body('address').trim().escape(),
    body('state').trim().escape(),
    body('description').trim().escape()
  ];

router.post('/update_premises_owner/:id', verificarRenovacionToken, requireAuth, upload.single('premises_image'), formValidator, async (req, res) => {
    const premisesId = req.params.id;
    const { name, address, state, description, delete_premises_image } = req.body;

    try {
        const premises = await Premises.findByPk(premisesId);

        if (!premises) {
            throw new Error('Local no encontrado');
        }

        // Asignar los nuevos datos al objeto premises
        premises.name = name;
        premises.address = address;
        premises.state = state;
        premises.description = description;

        // Actualizar la imagen solo si se proporciona una nueva imagen o se solicita eliminarla
        if (req.file) {
            const nombreArchivo = req.file.originalname;
            premises.premises_image = `/assets/uploads/${nombreArchivo}`;
        } else if (delete_premises_image === "yes") {
            premises.premises_image = '/assets/uploads/warehouse.jpg';
        }
        
        // Forzamos el guardado de los cambios en la base de datos
        await premises.save();

        // Crear el token de notificación para el éxito
        const notificationToken = jwt.sign({ message: 'Local actualizado correctamente', type: 'success' }, process.env.JWT_SECRET, { expiresIn: '1m' });
        res.cookie('notificationToken', notificationToken);
        res.redirect(`/edit_premises/${premisesId}`);
    } catch (error) {
        console.log(error);

        // Crear el token de notificación para el error
        const notificationToken = jwt.sign({ message: 'Error al actualizar el local', type: 'error' }, process.env.JWT_SECRET, { expiresIn: '1m' });
        res.cookie('notificationToken', notificationToken);
        res.redirect(`/edit_premises/${premisesId}`);
    }
});

module.exports = router;