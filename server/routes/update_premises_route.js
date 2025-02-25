const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const Premises = require('../models/premises');
const Warehouse = require('../models/warehouse');
const { verificarRenovacionToken, requireAuth } = require('../middlewares/middlewares');

// Definir las validaciones para los campos del formulario
const formValidator = [
    body('EOid').isInt(),
    body('EOname').trim().escape(),
    body('role').trim().escape(),
    body('name').trim().escape(),
    body('address').trim().escape(),
    body('capacity').trim().escape(),
    body('state').trim().escape(),
    body('description').trim().escape()
  ];

router.post('/update_premises/:id', verificarRenovacionToken, requireAuth, formValidator, (req, res) => {
    const premisesId = req.params.id;
    const { EOid, EOname, role, name, address, capacity, state, description } = req.body;

    let enterprise_id = null;
    let owner_id = null;

    if (role === 'enterprise') {
        enterprise_id = EOid;
    } else {
        owner_id = EOid;
    }

    Premises.findByPk(premisesId)
        .then(premises => {
            if (!premises) {
                throw new Error('Local no encontrado');
            }

            const oldCapacity = premises.capacity;
            const newCapacity = parseInt(capacity, 10);

            premises.name = name;
            premises.address = address;
            premises.capacity = newCapacity;
            premises.state = state;
            premises.description = description;
            premises.enterprise_id = enterprise_id;
            premises.owner_id = owner_id;

            return premises.save().then(() => ({ premises, oldCapacity, newCapacity }));
        })
        .then(({ premises, oldCapacity, newCapacity }) => {
            if (newCapacity > oldCapacity) {
                
                const warehousesToCreate = newCapacity - oldCapacity;
                const createWarehouses = [];

                for (let i = 0; i < warehousesToCreate; i++) {
                    createWarehouses.push(
                        Warehouse.findOne({ order: [['id', 'DESC']] })
                            .then(lastWarehouse => {
                                let nextId = 1;

                                if (lastWarehouse) {
                                    nextId = lastWarehouse.id + 1;
                                }

                                return Warehouse.create({
                                    id: nextId,
                                    premises_id: premises.id,
                                    enterprise_id: enterprise_id,
                                    owner_id: owner_id,
                                    tenant_id: null,
                                    name: null,
                                    size: null,
                                    rental_price: 0,
                                    notes: null
                                });
                            })
                    );
                }

                return Promise.all(createWarehouses);
            } else if (newCapacity < oldCapacity) {
                
                const warehousesToDelete = oldCapacity - newCapacity;

                return Warehouse.findAll({
                    where: { premises_id: premises.id },
                    order: [['id', 'DESC']],
                    limit: warehousesToDelete
                })
                .then(warehouses => {
                    const deleteWarehouses = warehouses.map(warehouse => warehouse.destroy());
                    return Promise.all(deleteWarehouses);
                });
            }
        })
        .then(() => {
            const notificationToken = jwt.sign({ message:'Local actualizado correctamente', type:'success' }, process.env.JWT_SECRET, { expiresIn: '1m' });
            res.cookie('notificationToken', notificationToken);
            res.redirect('/premises');
        })
        .catch(error => {
            console.log(error);
            const notificationToken = jwt.sign({ message:'Error al actualizar el local', type:'error' }, process.env.JWT_SECRET, { expiresIn: '1m' });
            res.cookie('notificationToken', notificationToken);
            res.redirect('/premises');
        });
});

module.exports = router;