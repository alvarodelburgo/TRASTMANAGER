const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const Invoice = require('../models/invoice');
const { verificarRenovacionToken, requireAuth } = require('../middlewares/middlewares');

// Definir las validaciones para los campos del formulario
const formValidator = [
    body('enterprise_id').isInt(),
    body('owner_id').isInt(),
    body('premises_id').isInt(),
    body('warehouse_id').isInt(),
    body('tenant_id').isInt(),
    body('name').trim().escape(),
    body('issue_date').trim().escape(),
    body('due_date').trim().escape(),
    body('payment_date').trim().escape(),
    body('total_amount').isDecimal(),
    body('status').trim().escape()
];

router.post('/update_invoice/:id', verificarRenovacionToken, requireAuth, formValidator, (req, res) => {
    const invoiceId = req.params.id;
    const { enterprise_id, owner_id, premises_id, warehouse_id, tenant_id, name, issue_date, due_date, payment_date, total_amount, status} = req.body;

    Invoice.findByPk(invoiceId)
    .then(invoice => {
        if (!invoice) {
            throw new Error('Propietario no encontrado');
        }

        invoice.enterprise_id = enterprise_id === 'null' ? null : enterprise_id;
        invoice.owner_id = owner_id;
        invoice.premises_id = premises_id;
        invoice.warehouse_id = warehouse_id;
        invoice.tenant_id = tenant_id;
        invoice.name = name;
        invoice.issue_date = issue_date;
        invoice.due_date = due_date ;
        invoice.payment_date = payment_date === 'null' || payment_date === '' ? null : payment_date;
        invoice.total_amount = total_amount;
        invoice.status = status;

        return invoice.save();
    })
    .then(updatedInvoice => {
        const notificationToken = jwt.sign({ message:'Factura actualizada correctamente', type:'success' }, process.env.JWT_SECRET, { expiresIn: '1m' });
        res.cookie('notificationToken', notificationToken);
        res.redirect('/invoices');
    })
    .catch(error => {
        console.log(error);
        const notificationToken = jwt.sign({ message:'Error al actualizar la factura', type:'error' }, process.env.JWT_SECRET, { expiresIn: '1m' });
        res.cookie('notificationToken', notificationToken);
        res.redirect('/invoices');
    });
});

module.exports = router;