const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Tenant = require('../models/tenant');
const Rental = require('../models/rental');
const Warehouse = require('../models/warehouse');
const { verificarRenovacionToken, requireAuth } = require('../middlewares/middlewares');

router.post('/delete_tenant/:id', verificarRenovacionToken, requireAuth, async (req, res) => {
    const tenantId = req.params.id;

    try {
        await Promise.all([
            Rental.update({ tenant_id: null}, { where: { tenant_id: tenantId } }),
            Warehouse.update({ tenant_id: null}, { where: { tenant_id: tenantId } })
        ]);

        const tenant = await Tenant.findByPk(tenantId);

        if (!tenant) {
            throw new Error('Cliente no encontrado');
        }

        await tenant.destroy();

        const notificationToken = jwt.sign({ message:'Cliente eliminado correctamente', type:'success' }, process.env.JWT_SECRET, { expiresIn: '1m' });
        res.cookie('notificationToken', notificationToken);
        res.redirect('/tenants');
    } catch (error) {
        const notificationToken = jwt.sign({ message:'Error al eliminar el cliente', type:'error' }, process.env.JWT_SECRET, { expiresIn: '1m' });
        res.cookie('notificationToken', notificationToken);
        res.redirect('/tenants');
    }
});

module.exports = router;