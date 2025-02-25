const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();
router.use(cookieParser());
const crypto = require('crypto');


router.get('/data-user', (req, res) => {

    const accessToken = req.cookies.accessToken;

    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            console.error('Error verifying token:', err.message);
            return res.status(403).send('Invalid recovery token');
        }
            
        const userID = decoded.userID;
        const role = decoded.role;
        const userUUID = decoded.userUUID;

        const data = { userID, role, userUUID};
        
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
            
    });
})

module.exports = router;