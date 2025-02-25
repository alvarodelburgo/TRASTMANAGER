const socket = io();

async function token_user() {
            
    // Obtener datos del usuario desde el servidor
    const response = await fetch('/data-user');
    if (!response.ok) {
        throw new Error('No se pudo obtener la información');
    }

    // Obtener los datos cifrados y las claves de la respuesta
    const { encryptedData, key, iv } = await response.json();

    // Descifrar los datos recibidos
    const data = await decryptData(encryptedData, key, iv);

    socket.emit('login-user', data);
}

// MOSTRAMOS EL MENSAJE RECIBIDO DEL SOCKET
socket.on('sendMessageToUser', (data) => {
    showNotification(data.message, data.type);
});

//RECIBIMOS EL MENSAJE DE QUE SE HA EXPIRADO EL TOKEN Y CERRAMOS SESIÓN
socket.on('sessionExpired', (data) => {
    window.location.href = '/logout';
});

// MOSTRAMOS EL MENSAJE RECIBIDO DE LA RENOVACIÓN DEL TOKEN
socket.on('tokenRenewed', (data) => {
    showNotification(data.message, data.type);
});

// MOSTRAMOS EL MENSAJE RECIBIDO DE LA RENOVACIÓN DEL TOKEN
socket.on('renewToken', (data) => {

    fetch('/renew-token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Token renovado y almacenado en la cookie', data);
    })
    .catch(error => console.error('Error al almacenar el token en la cookie:', error));
    
});