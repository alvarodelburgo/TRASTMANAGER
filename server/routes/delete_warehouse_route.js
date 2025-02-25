const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Rental = require('../models/rental');
const Warehouse = require('../models/warehouse');
const Premises = require('../models/premises');
const { verificarRenovacionToken, requireAuth } = require('../middlewares/middlewares');

router.post('/delete_warehouse/:id', verificarRenovacionToken, requireAuth,(req, res) => {
    const warehouseId = req.params.id;

    let premisesId;

    Warehouse.findByPk(warehouseId)
        .then(warehouse => {
            if (!warehouse) {
                throw new Error('Almacén no encontrado');
            }
            premisesId = warehouse.premises_id;
            return Promise.all([
                Rental.update({ owner_id: null, enterprise_id: null }, { where: { owner_id: warehouseId } }),
                Rental.destroy({ where: { owner_id: warehouseId } })
            ]);
        })
        .then(() => {
            return Warehouse.findByPk(warehouseId);
        })
        .then(warehouse => {
            if (!warehouse) {
                throw new Error('Almacén no encontrado');
            }
            return warehouse.destroy();
        })
        .then(() => {
            return Premises.findByPk(premisesId);
        })
        .then(premises => {
            if (!premises) {
                throw new Error('Local no encontrado');
            }
            premises.capacity -= 1;
            return premises.save();
        })
        .then(() => {
            const notificationToken = jwt.sign({ message:'Almacén y registros relacionados borrados correctamente', type:'success' }, process.env.JWT_SECRET, { expiresIn: '1m' });
            res.cookie('notificationToken', notificationToken);
            res.redirect('/warehouses');
        })
        .catch(error => {
            const notificationToken = jwt.sign({ message:'Error al borrar el almacén y registros relacionados', type:'error' }, process.env.JWT_SECRET, { expiresIn: '1m' });
            res.cookie('notificationToken', notificationToken);
            res.redirect('/warehouses');
        });
});

module.exports = router;