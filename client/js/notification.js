// Función para decodificar JWT
function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  
    return JSON.parse(jsonPayload);
}
  
// NOTIFICACION PARA CREAR, BORRAR, EDITAR, ACTUALIZAR
  function handleNotification() {
  
    // Imprimir todas las cookies en la consola usando js-cookie
    const allCookies = Cookies.get();

    // Obtener la cookie notificationToken usando js-cookie
    const rateLimitMessage = Cookies.get('rateLimitMessage');
  
    // Obtener la cookie notificationToken usando js-cookie
    const notificationToken = Cookies.get('notificationToken');

    if (notificationToken) {
      // Decodificar el JWT
      const notificationData = parseJwt(notificationToken);
  
      const type = notificationData.type;
  
      // Usar la información de la cookie
      showNotification(notificationData.message, type);
  
      // Opcional: Eliminar la cookie después de usarla
      Cookies.remove('notificationToken', { path: '/' });
    }
    if (rateLimitMessage) {
      // Decodificar el JWT
      const notificationData = parseJwt(rateLimitMessage);
  
      const type = notificationData.type;
  
      // Usar la información de la cookie
      showNotification(notificationData.message, type);
  
      // Opcional: Eliminar la cookie después de usarla
      Cookies.remove('rateLimitMessage', { path: '/' });
    }
}



function showNotification(message, type) {
  const notification = document.getElementById('notification2');
  
  if (notification) {
    notification.innerText = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';

    // Ocultar la notificación después de 2 segundos
    setTimeout(() => {
      notification.style.display = 'none';
    }, 3000);
  } else {
    console.error('Elemento con id "notification" no encontrado.');
  }
}
