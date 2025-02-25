const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const sendgrid = require('sendgrid');
require('dotenv').config();
const http = require('http');
const { initSocket, getSocket } = require('./socket');
const { registerUser, unregisterUser } = require('./socketManager');

// CARGAR LAS VARIABLES DE ENTORNO
dotenv.config();

const app = express();
const server = http.createServer(app); // Crear servidor HTTP
initSocket(server); // Inicializar Socket.IO

const io = getSocket();


// ARCHIVOS ESTÁTICOS DE REACT (ajustar la ruta según la estructura de tu proyecto)
app.use(express.static(path.join(__dirname, '../client')));

// CONFIGURACIÓN DE EXPRES SESSION
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// MIDDLEWARES
const { middleware_procesar, notFound_middleware } = require('./middlewares/middlewares');

// MIDDLEWARE BODY-PARSER
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.json());
// Middleware para analizar cuerpos de solicitudes en formato URL-encoded
app.use(express.urlencoded({ extended: true }));

// CORS PARA LOCALHOST
// const corsOptions = {
//   origin: ['http://localhost:5000', 'http://192.168.1.43:5000'],
//   optionsSuccessStatus: 200,
//   credentials: true
// };
// app.use(cors(corsOptions));

// RUTAS
const api_data = require('./routes/api_data');
const data_user = require('./routes/data_user');
const renew_token = require('./routes/renew_token');

const index_route = require('./routes/index_route');
const login_route = require('./routes/login_route');
const logout_route = require('./routes/logout_route');
const recovery_route = require('./routes/recovery_route');
const recovery_code_route = require('./routes/recovery_code_route');
const recovery_newpassword_route = require('./routes/recovery_newpassword_route');

const home_route = require('./routes/home_route');
const contact_route = require('./routes/contact_route');


const edit_profile_route = require('./routes/edit_profile_route');
const update_profile_route = require('./routes/update_profile_route');


const edit_premises_route = require('./routes/edit_premises_route');
const manage_premises_route = require('./routes/manage_premises_route');
const manage_warehouse_route = require('./routes/manage_warehouse_route');
const edit_warehouse_route = require('./routes/edit_warehouse_route');


const owner_register_route = require('./routes/owner_register_route');
const enterprise_register_route = require('./routes/enterprise_register_route');
const create_premises_route = require('./routes/create_premises_route');
const create_tenant_route = require('./routes/create_tenant_route');
const create_rental_route = require('./routes/create_rental_route');
const create_warehouse_route = require('./routes/create_warehouse_route');
const create_offer_route = require('./routes/create_offer_route');
const create_invoice_route = require('./routes/create_invoice_route');

const update_owner_route = require('./routes/update_owner_route');
const delete_owner_route = require('./routes/delete_owner_route');
const update_enterprise_route = require('./routes/update_enterprise_route');
const delete_enterprise_route = require('./routes/delete_enterprise_route');
const update_premises_route = require('./routes/update_premises_route');
const delete_premises_route = require('./routes/delete_premises_route');
const update_warehouse_route = require('./routes/update_warehouse_route');
const delete_warehouse_route = require('./routes/delete_warehouse_route');
const update_tenant_route = require('./routes/update_tenant_route');
const delete_tenant_route = require('./routes/delete_tenant_route');
const update_rental_route = require('./routes/update_rental_route');
const delete_rental_route = require('./routes/delete_rental_route');
const update_premises_owner_route = require('./routes/update_premises_owner_route');
const delete_offer_route = require('./routes/delete_offer_route');
const update_offer_route = require('./routes/update_offer_route');
const delete_invoice_route = require('./routes/delete_invoice_route');
const update_invoice_route = require('./routes/update_invoice_route');

const show_cameras_route = require('./routes/show_cameras_route');
const show_owner_data_route = require('./routes/show_owner_data_route');
const show_enterprise_data_route = require('./routes/show_enterprise_data_route');
const show_profile_route = require('./routes/show_profile_route');
const show_rental_data_route = require('./routes/show_rental_data_route');
const show_warehouse_data_route = require('./routes/show_warehouse_data_route');
const show_tenant_data_route = require('./routes/show_tenant_data_route');
const show_premises_data_route = require('./routes/show_premises_data_route');
const show_offer_data_route = require('./routes/show_offer_data_route');
const show_invoice_data_route = require('./routes/show_invoice_data_route');


const upload_file_route = require('./routes/upload_file_route');
const upload_offer_route = require('./routes/upload_offer_route');

// USAR EL MIDDLEWARE QUE PROCESA LA INFORMACIÓN DE LOS FORMULARIOS
app.use(middleware_procesar);

// USAMOS LAS RUTAS
app.use(index_route);
app.use(login_route);
app.use(logout_route);
app.use(recovery_route);
app.use(recovery_code_route);
app.use(recovery_newpassword_route);
app.use(home_route);
app.use(contact_route);


app.use(edit_profile_route);
app.use(update_profile_route);

app.use(edit_premises_route);
app.use(manage_premises_route);
app.use(manage_warehouse_route);
app.use(edit_warehouse_route);


app.use(owner_register_route);
app.use(enterprise_register_route);
app.use(create_premises_route);
app.use(create_tenant_route);
app.use(create_rental_route);
app.use(create_warehouse_route);
app.use(create_offer_route);
app.use(create_invoice_route);

app.use(update_owner_route);
app.use(delete_owner_route);
app.use(update_enterprise_route);
app.use(delete_enterprise_route);
app.use(update_premises_route);
app.use(delete_premises_route);
app.use(update_warehouse_route);
app.use(delete_warehouse_route);
app.use(update_tenant_route);
app.use(delete_tenant_route);
app.use(update_rental_route);
app.use(delete_rental_route);
app.use(update_premises_owner_route);
app.use(delete_offer_route);
app.use(update_offer_route);
app.use(delete_invoice_route);
app.use(update_invoice_route);

app.use(show_cameras_route);
app.use(show_owner_data_route);
app.use(show_enterprise_data_route);
app.use(show_profile_route);
app.use(show_rental_data_route);
app.use(show_warehouse_data_route);
app.use(show_tenant_data_route);
app.use(show_premises_data_route);
app.use(show_offer_data_route);
app.use(show_invoice_data_route);

app.use(upload_file_route);
app.use(upload_offer_route);


// USAMOS LAS RUTAS DE LA API
app.use(api_data);
app.use(data_user);
app.use(renew_token);

// MIDDLEWARE QUE MANEJA LOS ERRORES 404
app.use(notFound_middleware);


// Evento de conexión de Socket.IO
io.on('connection', (socket) => {
  //console.log('Nuevo cliente conectado:', socket.id);

  //RECIBIMOS LOS DATOS DESDE EL HOME
  socket.on('login-user', (data) => {
    const userUUID = data.userUUID;
    registerUser(userUUID, socket.id);
  });

  // Desconexión
  socket.on('disconnect', () => {
      //console.log('Cliente desconectado:', socket.id);
      unregisterUser(socket.id);
  });
});

// SERVIDOR
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Servidor en ejecución en http://localhost:${PORT}`);
});