const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Rental = require('../models/rental');
const { verificarRenovacionToken, requireAuth } = require('../middlewares/middlewares');


// Configuración de multer para almacenar archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../client/assets/contracts')); 
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); 
    }
});

const upload = multer({ storage: storage });

// Definir las validaciones para los campos del formulario
const formValidator = [
    body('warehouseId').isInt()
  ];

router.post('/upload_file/:id', verificarRenovacionToken, requireAuth, upload.single('uploaded_file'), formValidator, (req, res) => {
    const rentalId = req.params.id;
    const {warehouseId} = req.body;

    Rental.findByPk(rentalId)
        .then(rental => {
            if (!rental) {
                throw new Error('Almacén no encontrado');
            }

            if (req.file) {
                // Si se subió un archivo, actualizar el campo contract
                const nombreArchivo = req.file.originalname;
                const archivoPath = path.join('/assets/contracts/', nombreArchivo);
                rental.contract = archivoPath;
            } else {
                // Si no se subió un archivo, no modificar el campo contract
                rental.contract = null; // Mantener el valor actual
            }

            return rental.save();
        })
        .then(updatedRental => {
            res.redirect(`/manage_warehouse/${warehouseId}`);
        })
        .catch(error => {
            res.redirect(`/manage_warehouse/${warehouseId}`);
            console.log(error);
        });
});

module.exports = router;