const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Enterprise = require('../models/enterprise');
const Premises = require('../models/premises');
const Rental = require('../models/rental');
const Warehouse = require('../models/warehouse');
const { verificarRenovacionToken, requireAuth } = require('../middlewares/middlewares');

router.post('/delete_enterprise/:id', verificarRenovacionToken, requireAuth, (req, res) => {
    const enterpriseId = req.params.id;

    Promise.all([
        Premises.update({ enterprise_id: null }, { where: { enterprise_id: enterpriseId } }),
        Rental.update({ enterprise_id: null }, { where: { enterprise_id: enterpriseId } }),
        Warehouse.update({ enterprise_id: null }, { where: { enterprise_id: enterpriseId } })
    ])
    .then(() => {
        return Promise.all([
            Rental.destroy({ where: { enterprise_id: enterpriseId } }),
            Warehouse.destroy({ where: { enterprise_id: enterpriseId } }),
            Premises.destroy({ where: { enterprise_id: enterpriseId } })
        ]);
    })
    .then(() => {
        return Enterprise.findByPk(enterpriseId);
    })
    .then(enterprise => {
        if (!enterprise) {
            throw new Error('Empresa no encontrada');
        }
        return enterprise.destroy();
    })
    .then(() => {
        const notificationToken = jwt.sign({ message:'Empresa y registros relacionados borrados correctamente', type:'success' }, process.env.JWT_SECRET, { expiresIn: '1m' });
        res.cookie('notificationToken', notificationToken);
        res.redirect('/enterprises');
    })
    .catch(error => {
        const notificationToken = jwt.sign({ message:'Error al borrar la empresa y registros relacionados', type:'error' }, process.env.JWT_SECRET, { expiresIn: '1m' });
        res.cookie('notificationToken', notificationToken);
        res.redirect('/enterprises');
    });
});

module.exports = router;