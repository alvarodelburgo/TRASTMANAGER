const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Invoices = require('../models/invoice');
const { verificarRenovacionToken, requireAuth } = require('../middlewares/middlewares');

router.post('/delete_invoice/:id', verificarRenovacionToken,requireAuth,  async (req, res) => {
    const invoiceId = req.params.id;

    try {
        const invoices = await Invoices.findByPk(invoiceId);

        if (!invoices) {
            throw new Error('Local no encontrado');
        }

        await invoices.destroy();

        const notificationToken = jwt.sign({ message:'Factura borrada', type:'success' }, process.env.JWT_SECRET, { expiresIn: '1m' });
        res.cookie('notificationToken', notificationToken);
        res.redirect('/invoices');
    } catch (error) {
        const notificationToken = jwt.sign({ message:'Error al borrar la factura', type:'error' }, process.env.JWT_SECRET, { expiresIn: '1m' });
        res.cookie('notificationToken', notificationToken);
        res.redirect('/invoices');
    }
});

module.exports = router;