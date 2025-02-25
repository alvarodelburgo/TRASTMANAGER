const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Premises = require('../models/premises');
const Rental = require('../models/rental');
const Warehouse = require('../models/warehouse');
const { verificarRenovacionToken, requireAuth } = require('../middlewares/middlewares');

router.post('/delete_premises/:id', verificarRenovacionToken,requireAuth,  async (req, res) => {
    const premisesId = req.params.id;

    try {
        await Promise.all([
            Rental.destroy({ where: { owner_id: premisesId } }),
            Warehouse.destroy({ where: { premises_id: premisesId } })
        ]);
        const premises = await Premises.findByPk(premisesId);

        if (!premises) {
            throw new Error('Local no encontrado');
        }

        await premises.destroy();

        const notificationToken = jwt.sign({ message:'Local y registros relacionados borrados correctamente', type:'success' }, process.env.JWT_SECRET, { expiresIn: '1m' });
        res.cookie('notificationToken', notificationToken);
        res.redirect('/premises');
    } catch (error) {
        const notificationToken = jwt.sign({ message:'Error al borrar el local y registros relacionados', type:'error' }, process.env.JWT_SECRET, { expiresIn: '1m' });
        res.cookie('notificationToken', notificationToken);
        res.redirect('/premises');
    }
});

module.exports = router;