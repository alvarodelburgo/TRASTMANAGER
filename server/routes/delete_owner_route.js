const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Owner = require('../models/owner');
const Premises = require('../models/premises');
const Rental = require('../models/rental');
const Warehouse = require('../models/warehouse');
const { verificarRenovacionToken, requireAuth } = require('../middlewares/middlewares');

router.post('/delete_owner/:id', verificarRenovacionToken, requireAuth, (req, res) => {
    const ownerId = req.params.id;

    Promise.all([
        Premises.destroy({ where: { owner_id: ownerId } }),
        Rental.destroy({ where: { owner_id: ownerId } }),
        Warehouse.destroy({ where: { owner_id: ownerId } })
    ])
    .then(() => {
        return Owner.findByPk(ownerId);
    })
    .then(owner => {
        if (!owner) {
            throw new Error('Propietario no encontrado');
        }
        return owner.destroy();
    })
    .then(() => {
        const notificationToken = jwt.sign({ message:'Propietario y registros relacionados borrados correctamente', type:'success' }, process.env.JWT_SECRET, { expiresIn: '1m' });
        res.cookie('notificationToken', notificationToken);
        res.redirect('/owners');
    })
    .catch(error => {
        const notificationToken = jwt.sign({ message:'Error al borrar al propietario y registros relacionados', type:'error' }, process.env.JWT_SECRET, { expiresIn: '1m' });
        res.cookie('notificationToken', notificationToken);
        res.redirect('/owners');
    });
});

module.exports = router;