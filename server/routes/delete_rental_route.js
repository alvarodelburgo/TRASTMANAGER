const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Tenant = require('../models/tenant');
const Rental = require('../models/rental');
const Warehouse = require('../models/warehouse');
const Premises = require('../models/premises');
const { verificarRenovacionToken, requireAuth } = require('../middlewares/middlewares');

router.post('/delete_rental/:id', verificarRenovacionToken, requireAuth, async (req, res) => {
    const rentalId = req.params.id;

    try {
        await Promise.all([
            Warehouse.update({ warehouse_id: null}, { where: { rental_id: rentalId } }),
            Tenant.update({ tenant_id: null}, { where: { rental_id: rentalId } }),
            Premises.update({ premises_id: null}, { where: { rental_id: rentalId } })
            
        ]);
        const rental = await Rental.findByPk(rentalId);

        if (!rental) {
            throw new Error('Alquiler no encontrado');
        }

        await rental.destroy();

        const notificationToken = jwt.sign({ message:'Alquiler y registros relacionados borrados correctamente', type:'success' }, process.env.JWT_SECRET, { expiresIn: '1m' });
        res.cookie('notificationToken', notificationToken);
        res.redirect('/rentals');
    } catch (error) {
        const notificationToken = jwt.sign({ message:'Error al borrar el alquiler y registros relacionados', type:'error' }, process.env.JWT_SECRET, { expiresIn: '1m' });
        res.cookie('notificationToken', notificationToken);
        res.redirect('/rentals');
    }
});

module.exports = router;