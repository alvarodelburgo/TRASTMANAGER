const express = require('express');
const router = express.Router();
const path = require('path');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Administrator = require('../models/administrator');
const Enterprise = require('../models/enterprise');
const Owner = require('../models/owner');
const Premises = require('../models/premises');
const Rental = require('../models/rental');
const Tenant = require('../models/tenant');
const Warehouse = require('../models/warehouse');
const Offer = require('../models/offer');
const Invoice = require('../models/invoice');
const CryptoJS = require('crypto-js');

const cookieParser = require('cookie-parser');
//require('dotenv').config();
router.use(cookieParser());

router.get('/api-data', (req, res) => {

    const accessToken = req.cookies.accessToken;
    const roleToken = req.cookies.roleToken;

    if (!accessToken) {
        jwt.verify(roleToken, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).send('Invalid recovery token');
            }

            const userID = decoded.userID;
            const role = decoded.role;
            const viewing = decoded.viewing;

            switch (role) {
                case 'owner':
                    Owner.findOne({where: { id: userID}}, {attributes: ['id', 'name', 'lastname', 'username', 'email', 'phone_number', 'role']})
                    .then(ownerfinded => {
                        if(ownerfinded){
                            Promise.all([
                                Owner.findAll({ where: { id: userID } }),
                                Offer.findAll({ where: { owner_id: userID } })
                            ])
                            .then(([owner, offer]) => {

                                const ownerData = owner[0];
                                profile_image = ownerData.dataValues.profile_image;
                                const relativeImagePath = path.relative(path.join(__dirname, '../../client/assets'), profile_image);
                                const normalizedImagePath = relativeImagePath.replace(/\\/g, '/');

                                const data = { owner, offer, role, viewing, profile_image: '/' + normalizedImagePath};

                                // Clave y vector de inicialización (IV) para el cifrado
                                const algorithm = 'aes-256-cbc'; // Algoritmo de cifrado
                                const key = crypto.randomBytes(32); // Clave de 32 bytes (256 bits)
                                const iv = crypto.randomBytes(16); // IV de 16 bytes

                                // Función para cifrar los datos
                                function encrypt(text) {
                                let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
                                let encrypted = cipher.update(JSON.stringify(text), 'utf8', 'hex');
                                encrypted += cipher.final('hex');
                                return encrypted;
                                }

                                // Cifra los datos
                                const encryptedData = encrypt(data);

                                // Convertir la clave y el IV a formato hexadecimal para enviarlos
                                const keyHex = key.toString('hex');
                                const ivHex = iv.toString('hex')

                                // Envío del JSON cifrado como respuesta
                                res.json({ encryptedData, key: keyHex, iv: ivHex });
                            })
                            .catch(error => {
                                console.error('Error al obtener datos del propietario:', error);
                            });
                        }
                        else{
                            console.error('No se ha encontrado al propietario');
                        }
                    });
                    break;
        
                case 'enterprise':
                    Enterprise.findOne({where: { id: userID }}, {attributes: ['id', 'name', 'lastname', 'username', 'email', 'phone_number', 'role']})
                
                    .then(enterprisefinded => {
                        if(enterprisefinded){
                            Promise.all([
                                Enterprise.findAll({ where: { id: userID } }),
                                Offer.findAll({ where: { enterprise_id: userID } })
                            ])
                            .then(([enterprise, offer]) => {

                                const enterpriseData = enterprise[0].dataValues;
                                const profile_image = enterpriseData.profile_image;
                                const relativeImagePath = path.relative(path.join(__dirname, '../../client/assets'), profile_image);
                                const normalizedImagePath = relativeImagePath.replace(/\\/g, '/');

                                const data = { enterprise, offer, role, viewing, profile_image: '/' + normalizedImagePath};
                                
                                // Clave y vector de inicialización (IV) para el cifrado
                                const algorithm = 'aes-256-cbc'; // Algoritmo de cifrado
                                const key = crypto.randomBytes(32); // Clave de 32 bytes (256 bits)
                                const iv = crypto.randomBytes(16); // IV de 16 bytes

                                // Función para cifrar los datos
                                function encrypt(text) {
                                let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
                                let encrypted = cipher.update(JSON.stringify(text), 'utf8', 'hex');
                                encrypted += cipher.final('hex');
                                return encrypted;
                                }

                                const encryptedData = encrypt(data);
                                const keyHex = key.toString('hex');
                                const ivHex = iv.toString('hex');
                                
                                res.json({ encryptedData, key: keyHex, iv: ivHex });
                            })
                            .catch(error => {
                                console.error('Error al obtener datos de la empresa:', error);
                            });
                        }
                        else{
                            console.error('No se ha encontrado la empresa');
                        }
        
                    });
                    
                    break;
        
                case 'administrator':
                    Administrator.findOne({where: { id: userID }}, {attributes: ['id', 'name', 'lastname', 'username', 'email', 'phone_number', 'role']})
                    
                    .then(administratorfinded => {
                        if(administratorfinded){
                            Promise.all([
                                Administrator.findOne({ where: { id: userID } }),
                                Offer.findAll({ where: { administrator_id: userID } })
                            ])
                            .then(([administrator, offer]) => {

                              
                                const administratorData = administrator.dataValues;
                                const profile_image = administratorData.profile_image;
                                const relativeImagePath = path.relative(path.join(__dirname, '../../client/assets'), profile_image);
                                const normalizedImagePath = relativeImagePath.replace(/\\/g, '/');

                                const data = { administrator, offer, role, viewing, profile_image: '/' + normalizedImagePath};

                                // Clave y vector de inicialización (IV) para el cifrado
                                const algorithm = 'aes-256-cbc'; // Algoritmo de cifrado
                                const key = crypto.randomBytes(32); // Clave de 32 bytes (256 bits)
                                const iv = crypto.randomBytes(16); // IV de 16 bytes

                                // Función para cifrar los datos
                                function encrypt(text) {
                                let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
                                let encrypted = cipher.update(JSON.stringify(text), 'utf8', 'hex');
                                encrypted += cipher.final('hex');
                                return encrypted;
                                }

                                const encryptedData = encrypt(data);
                                const keyHex = key.toString('hex');
                                const ivHex = iv.toString('hex')

                                // Envío del JSON cifrado como respuesta
                                res.json({ encryptedData, key: keyHex, iv: ivHex });

                            })
                            .catch(error => {
                                console.error('Error al obtener datos de administrador:', error);
                            });
        
                        }
                        else{
                            console.error('No se ha encontrado al administrador');
                        }
                    
                    });
                    break;
                    
                default:
                    res.status(400).json({ message: 'Tipo de usuario desconocido' });
                }
        });
        
    }
    else{

        jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                console.error('Error verifying token:', err.message);
                return res.status(403).send('Invalid recovery token');
            }

            const userID = decoded.userID;
            const role = decoded.role;

            switch (role) {
                case 'owner':
                    Owner.findOne({
                        where: { id: userID }
                    })
                    .then(ownerfinded => {
                        if(ownerfinded){
                            Promise.all([
                                Owner.findAll({ where: { id: userID } }),
                                Premises.findAll({ where: { owner_id: userID }, order: [['id', 'ASC']] }),
                                Rental.findAll({ where: { owner_id: userID } , order: [['id', 'ASC']] }),
                                Tenant.findAll({ where: { owner_id: userID } , order: [['id', 'ASC']] }),
                                Warehouse.findAll({ where: { owner_id: userID } , order: [['id', 'ASC']] }),
                                Offer.findAll({ where: { owner_id: userID } , order: [['id', 'ASC']] }),
                                Invoice.findAll({ where: { owner_id: userID } , order: [['id', 'ASC']] })
                            ])
                            .then(([owner, premises, rental, tenant, warehouse, offer, invoice]) => {

                                const ownerData = owner[0];
                                profile_image = ownerData.dataValues.profile_image;
                                const relativeImagePath = path.relative(path.join(__dirname, '../../client/assets'), profile_image);
                                const normalizedImagePath = relativeImagePath.replace(/\\/g, '/');

                                const data = { owner, premises, rental, tenant, warehouse, offer, invoice, role, profile_image: '/' + normalizedImagePath};

                                // Clave y vector de inicialización (IV) para el cifrado
                                const algorithm = 'aes-256-cbc'; // Algoritmo de cifrado
                                const key = crypto.randomBytes(32); // Clave de 32 bytes (256 bits)
                                const iv = crypto.randomBytes(16); // IV de 16 bytes

                                // Función para cifrar los datos
                                function encrypt(text) {
                                let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
                                let encrypted = cipher.update(JSON.stringify(text), 'utf8', 'hex');
                                encrypted += cipher.final('hex');
                                return encrypted;
                                }

                                // Cifra los datos
                                const encryptedData = encrypt(data);
                                
                                // Convertir la clave y el IV a formato hexadecimal para enviarlos
                                const keyHex = key.toString('hex');
                                const ivHex = iv.toString('hex')

                                // Envío del JSON cifrado como respuesta
                                res.json({ encryptedData, key: keyHex, iv: ivHex });
                            })
                            .catch(error => {
                                console.error('Error al obtener datos del propietario:', error);
                            });
                        }
                        else{
                            console.error('No se ha encontrado al propietario');
                        }
                    });
                    break;
        
                case 'enterprise':
                    Enterprise.findOne({where: { id: userID }})
                
                    .then(enterprisefinded => {
                        if(enterprisefinded){
                            Promise.all([
                                Enterprise.findAll({ where: { id: userID }, order: [['id', 'ASC']] }),
                                Premises.findAll({ where: { enterprise_id: userID }, order: [['id', 'ASC']]  }),
                                Rental.findAll({ where: { enterprise_id: userID }, order: [['id', 'ASC']]  }),
                                Tenant.findAll({ where: { enterprise_id: userID }, order: [['id', 'ASC']]  }),
                                Warehouse.findAll({ where: { enterprise_id: userID }, order: [['id', 'ASC']]  }),
                                Offer.findAll({ where: { enterprise_id: userID } , order: [['id', 'ASC']] }),
                                Invoice.findAll({ where: { enterprise_id: userID } , order: [['id', 'ASC']] })
                            ])
                            .then(([enterprise, premises, rental, tenant, warehouse, offer, invoice]) => {

                                const enterpriseData = enterprise[0];
                                profile_image = enterpriseData.dataValues.profile_image;
                                const relativeImagePath = path.relative(path.join(__dirname, '../../client/assets'), profile_image);
                                const normalizedImagePath = relativeImagePath.replace(/\\/g, '/');

                                const data = { enterprise, premises, rental, tenant, warehouse, offer, invoice, role, profile_image: '/' + normalizedImagePath};

                                // Clave y vector de inicialización (IV) para el cifrado
                                const algorithm = 'aes-256-cbc'; // Algoritmo de cifrado
                                const key = crypto.randomBytes(32); // Clave de 32 bytes (256 bits)
                                const iv = crypto.randomBytes(16); // IV de 16 bytes

                                // Función para cifrar los datos
                                function encrypt(text) {
                                let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
                                let encrypted = cipher.update(JSON.stringify(text), 'utf8', 'hex');
                                encrypted += cipher.final('hex');
                                return encrypted;
                                }

                                // Cifra los datos
                                const encryptedData = encrypt(data);
                                
                                // Convertir la clave y el IV a formato hexadecimal para enviarlos
                                const keyHex = key.toString('hex');
                                const ivHex = iv.toString('hex')

                                // Envío del JSON cifrado como respuesta
                                res.json({ encryptedData, key: keyHex, iv: ivHex });
                            })
                            .catch(error => {
                                console.error('Error al obtener datos de la empresa:', error);
                            });
                        }
                        else{
                            console.error('No se ha encontrado la empresa');
                        }
        
                    });
                    
                    break;
        
                case 'administrator':
                    Administrator.findOne({where: { id: userID }})
                    
                    .then(administratorfinded => {
                        if(administratorfinded){
                            Promise.all([
                                Administrator.findAll({ order: [['id', 'ASC']] }),
                                Enterprise.findAll({ order: [['id', 'ASC']] }),
                                Owner.findAll({ order: [['id', 'ASC']] }),
                                Premises.findAll({ order: [['id', 'ASC']] }),
                                Rental.findAll({ order: [['id', 'ASC']] }),
                                Tenant.findAll({ order: [['id', 'ASC']] }),
                                Warehouse.findAll({ order: [['id', 'ASC']] }),
                                Offer.findAll({ order: [['id', 'ASC']] }),
                                Invoice.findAll({ order: [['id', 'ASC']] })
                            ])
                            .then(([administrator, enterprise, owner, premises, rental, tenant, warehouse, offer, invoice]) => {

                                const administratorData = administrator[0];
                                profile_image = administratorData.dataValues.profile_image;
                                const relativeImagePath = path.relative(path.join(__dirname, '../../client/assets'), profile_image);
                                const normalizedImagePath = relativeImagePath.replace(/\\/g, '/');
                                
                                const data = { administrator, enterprise, owner, premises, rental, tenant, warehouse, offer, invoice, role, profile_image: '/' + normalizedImagePath};

                                // Clave y vector de inicialización (IV) para el cifrado
                                const algorithm = 'aes-256-cbc'; // Algoritmo de cifrado
                                const key = crypto.randomBytes(32); // Clave de 32 bytes (256 bits)
                                const iv = crypto.randomBytes(16); // IV de 16 bytes

                                // Función para cifrar los datos
                                function encrypt(text) {
                                let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
                                let encrypted = cipher.update(JSON.stringify(text), 'utf8', 'hex');
                                encrypted += cipher.final('hex');
                                return encrypted;
                                }

                                // Cifra los datos
                                const encryptedData = encrypt(data);
                                
                                // Convertir la clave y el IV a formato hexadecimal para enviarlos
                                const keyHex = key.toString('hex');
                                const ivHex = iv.toString('hex')

                                // Envío del JSON cifrado como respuesta
                                res.json({ encryptedData, key: keyHex, iv: ivHex });
                            })
                            .catch(error => {
                                console.error('Error al obtener datos de administrador:', error);
                                res.status(500).json({ message: 'Error interno del servidor' });
                            });
        
                        }
                        else{
                            console.error('No se ha encontrado al administrador');
                        }
                    
                    });
                    break;
                    
                default:
                    res.status(400).json({ message: 'Tipo de usuario desconocido' });
                }
        });
    }
})

module.exports = router;