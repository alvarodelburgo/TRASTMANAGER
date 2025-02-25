const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Offer = require('../models/offer');
const { verificarRenovacionToken, requireAuth } = require('../middlewares/middlewares');

router.post('/delete_offer/:id', verificarRenovacionToken, requireAuth, async (req, res) => {
    const offerId = req.params.id;

    try {
        
        const offer = await Offer.findByPk(offerId);

        if (!offer) {
            throw new Error('Cliente no encontrado');
        }

        await offer.destroy();

        const notificationToken = jwt.sign({ message:'Oferta eliminada correctamente', type:'success' }, process.env.JWT_SECRET, { expiresIn: '1m' });
        res.cookie('notificationToken', notificationToken);
        res.redirect('/offers');
    } catch (error) {
        const notificationToken = jwt.sign({ message:'Error al eliminar la oferta', type:'error' }, process.env.JWT_SECRET, { expiresIn: '1m' });
        res.cookie('notificationToken', notificationToken);
        res.redirect('/offers');
    }
});

module.exports = router;