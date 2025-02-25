const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const path = require('path');
const jwt = require('jsonwebtoken');
const Invoice = require('../models/invoice');
const { verificarRenovacionToken, requireAuth } = require('../middlewares/middlewares');
const { Sequelize } = require('sequelize');


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
  body('total_amount').isFloat(),
  body('status').trim().escape(),
];


// Función para generar el próximo invoice_number
async function generateInvoiceNumber() {
    try {
      const lastInvoice = await Invoice.findOne({
        order: [['id', 'DESC']], // Ordena por ID descendente para obtener la última factura
      });
  
      if (lastInvoice && lastInvoice.invoice_number) {
        const lastNumber = parseInt(lastInvoice.invoice_number.replace('INV', ''), 10);
        return `INV${lastNumber + 1}`;
      }
  
      return 'INV1'; // Si no hay facturas previas, comienza con INV1
    } catch (error) {
      console.error('Error al generar invoice_number:', error);
      throw new Error('No se pudo generar el número de factura');
    }
  }


router.get('/create_invoice', verificarRenovacionToken, requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/html', 'create_invoice.html'));
});


router.post('/create_invoice', formValidator, async (req, res) => {

    const { enterprise_id, owner_id, premises_id, warehouse_id, tenant_id, name, issue_date, due_date, payment_date, total_amount, status} = req.body;
    
    const invoice_number = await generateInvoiceNumber();
    
    Invoice.create({
        invoice_number: invoice_number,
        enterprise_id: enterprise_id !== '' ? enterprise_id : null,
        owner_id: owner_id !== '' ? owner_id : null,
        premises_id: premises_id,
        warehouse_id: warehouse_id,
        tenant_id: tenant_id,
        name: name,
        issue_date: issue_date,
        due_date: due_date,
        payment_date: payment_date !== '' ? payment_date : null,
        total_amount: total_amount,
        status: status
    })
  
    .then(invoice => {
      const notificationToken = jwt.sign({ message:'Factura creada correctamente', type:'success' }, process.env.JWT_SECRET, { expiresIn: '1m' });
      res.cookie('notificationToken', notificationToken);
      res.redirect('/invoices');
  
    })
    .catch(error => {
      console.log(error);
      const notificationToken = jwt.sign({ message:'Error al crear la factura', type:'error' }, process.env.JWT_SECRET, { expiresIn: '1m' });
      res.cookie('notificationToken', notificationToken);
      res.redirect('/create_invoice');
    });
  });
  
  module.exports = router;