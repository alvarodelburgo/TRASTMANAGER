const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const Premises = require('../models/premises');
const Warehouse = require('../models/warehouse');
const { verificarRenovacionToken, requireAuth } = require('../middlewares/middlewares');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../client/assets/uploads')); // Define la carpeta de destino para guardar los archivos adjuntos
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Define el nombre de archivo original para guardar el archivo adjunto
  }
});
  
const upload = multer({ storage: storage })


// Definir las validaciones para los campos del formulario
const formValidator = [
  body('owner_id').isInt(),
  body('enterprise_id').isInt(),
  body('name').trim().escape(),
  body('address').trim().escape(),
  body('capacity').trim().escape(),
  body('state').trim().escape(),
  body('description').trim().escape()
];



router.get('/create_premises', verificarRenovacionToken, requireAuth,(req, res) => {
  
  res.sendFile(path.join(__dirname, '../../client/html', 'create_premises.html'));

});

router.post('/create_premises', upload.single('premises_image'), formValidator, (req, res) => {
  
  const { enterprise_id, owner_id, name, address, capacity, state, description} = req.body;
  
  let imagenPerfilPath = null;

  if (req.file) {

    const nombreArchivo = req.file.originalname;
    const rutaImagen = path.join(__dirname, '../../client/assets/uploads', nombreArchivo);
    fs.renameSync(req.file.path, rutaImagen);
    imagenPerfilPath = '/assets/uploads/' + nombreArchivo;

  }else {

    imagenPerfilPath = '/assets/uploads/warehouse.jpg';
  }


  Premises.create({
    enterprise_id: enterprise_id !== '' ? enterprise_id : null,
    owner_id: owner_id !== '' ? owner_id : null,
    name: name,
    address: address,
    capacity: capacity,
    state: state,
    description:description,
    premises_image:imagenPerfilPath
  })

  .then(premise => {
    const premiseID = premise.id;
    const notificationToken = jwt.sign({ message:'Local creado correctamente', type:'success' }, process.env.JWT_SECRET, { expiresIn: '1m' });
    res.cookie('notificationToken', notificationToken);

    Warehouse.max('id')
    .then((maxId) => {
      const new_warehouse_id = maxId ? maxId + 1 : 1;

      const warehousePromises = [];
      for (let i = 0; i < capacity; i++) {
        const warehouse_id = new_warehouse_id + i;
        warehousePromises.push(
        Warehouse.create({
          id: warehouse_id,
          premises_id: premiseID,
          enterprise_id: enterprise_id !== '' ? enterprise_id : null,
          owner_id: owner_id !== '' ? owner_id : null,
          name: `Almacén ${warehouse_id}` ,
          size: 0,
          rental_price: 0,
          availability: String('No definido')
        })
      );
      }

      Promise.all(warehousePromises)
      .then(warehouse => {
        const notificationToken = jwt.sign({ message:'Almacenes creados correctamente', type:'success' }, process.env.JWT_SECRET, { expiresIn: '1m' });
        res.cookie('notificationToken', notificationToken);
        res.redirect('/premises');
      })
      .catch(error => {
        const notificationToken = jwt.sign({ message:'Error al crear los almacenes', type:'error' }, process.env.JWT_SECRET, { expiresIn: '1m' });
        res.cookie('notificationToken', notificationToken);
        res.redirect('/create_premises');
        console.log(error);
      });
    })
    .catch((error) => {
      const notificationToken = jwt.sign({ message:'Error al obtener el último ID', type:'error' }, process.env.JWT_SECRET, { expiresIn: '1m' });
      res.cookie('notificationToken', notificationToken);
      res.redirect('/create_premises');
      console.log(error);
    });
    })
  .catch(error => {
    const notificationToken = jwt.sign({ message:'Error al crear el local', type:'error' }, process.env.JWT_SECRET, { expiresIn: '1m' });
    res.cookie('notificationToken', notificationToken);
    res.redirect('/create_premises');
  });
});

module.exports = router;