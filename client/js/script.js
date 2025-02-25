// FUNCIÓN PARA DESCIFRAR DATOS
async function decryptData(encryptedData, keyHex, ivHex) {
    
    const key = CryptoJS.enc.Hex.parse(keyHex);
    const iv = CryptoJS.enc.Hex.parse(ivHex);

    const encrypted = CryptoJS.enc.Hex.parse(encryptedData);

    const decrypted = CryptoJS.AES.decrypt({ ciphertext: encrypted }, key, { iv: iv, mode: CryptoJS.mode.CBC });

    const decryptedData = CryptoJS.enc.Utf8.stringify(decrypted);

    return JSON.parse(decryptedData);
}

// FUNCIÓN CAJA PORTAPAPLES DEL PERFIL
function clipboard(){

    var btnCopyUrl = document.getElementById('btnCopyUrl');
    var urlContainer = document.getElementById('urlContainer');

    btnCopyUrl.addEventListener('click', function() {
      var currentUrl = window.location.href;

      urlContainer.textContent = currentUrl;

      urlContainer.classList.add('withHeight');

      urlContainer.innerHTML += `<a href="#" class="copy-button" id="copyUrlIcon" title="Copiar al portapapeles"><i class="fas fa-copy"></i></a>`;

      document.getElementById('copyUrlIcon').addEventListener('click', function(event) {
        event.preventDefault(); // Prevenir el comportamiento predeterminado del enlace

        var tempInput = document.createElement('input');
        tempInput.value = currentUrl;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);

        copyMessage.style.display = 'block';
            
        setTimeout(function() {
          copyMessage.style.display = 'none';
        }, 1500);
      });
    });

}

// FUNCION CARGAR IMAGEN DE PERFIL DE PROPIETARIOS, EMPRESAS Y ADMINISTRADORES
async function cargarImagenDePerfil() {
    try {
        const response = await fetch('/api-data');
        if (!response.ok) {
            throw new Error('No se pudo obtener la imagen de perfil');
        }

        const { encryptedData, key, iv } = await response.json();

        const data = await decryptData(encryptedData, key, iv);

        const role = data.role;
        const profile_image = data.profile_image;

        let username;

        if (data.owner && data.owner.length > 0 && role === 'owner') {
            ownerRole = data.owner[0].role;
            username = data.owner[0].username;
        } 
        else if (data.enterprise && data.enterprise.length > 0 && role === 'enterprise') {
            enterpriseRole = data.enterprise[0].role;
            username = data.enterprise[0].username;
        } 
        else if (data.administrator && data.administrator.length > 0 && role === 'administrator') {
            administratorRole = data.administrator[0].role;
            username = data.administrator[0].username;
        }
        else {
            throw new Error('Rol de usuario desconocido');
        }

        const profileImageDiv = document.getElementById('profile-image');
        profileImageDiv.innerHTML = `<a href="/profile/${username}"><img src="${profile_image}" alt="Imagen de perfil" class="profile-img"></a>`;

    } catch (error) {
        console.error('Error al cargar la imagen de perfil:', error.message);
    }
}



// FUNCION CARGAR DATOS PARA HOME DE PROPIETARIOS Y EMPRESAS
async function cargarHomeUser() {
    try {
        const response = await fetch('/api-data');
        if (!response.ok) {
            throw new Error('No se pudo obtener la información');
        }

        const { encryptedData, key, iv } = await response.json();

        const data = await decryptData(encryptedData, key, iv);

        const role = data.role;
        const mainContent = document.getElementById('main-content');
        const premises = data.premises;
         
        if (role === "owner" || role === "enterprise") {
            try{

                const aboveContent = document.getElementById('above-content');
            
                const titleDiv = document.createElement('h2');
                titleDiv.innerHTML = 'Panel Principal';
                aboveContent.appendChild(titleDiv);

                const HomeContainer = document.getElementById('main-content');
                HomeContainer.classList.remove('admin-tools');
                HomeContainer.classList.add('admin-tools2');
           
                for (let i = 0; i < premises.length; i++) {

                    const premiseDiv = document.createElement('div');
                    premiseDiv.classList.add('premise');

                    premiseDiv.innerHTML = `
                        <div class="premises-title">
                            <h2>Local Nº ${premises[i].id}</h2>
                        </div>

                        <div class="premises-card">
                            <div class="premises-image">
                                <img src="${premises[i].premises_image}" alt="Imagen de perfil" class="premises_image_profile">
                            </div>
                            <div class="premises-data">
                                <p for="premises-name" >Nombre</p>
                                <input type="text" placeholder="Nombre" id="premises-name" pattern="^[A-Za-záéíóúÁÉÍÓÚñÑüÜ ]+$" value="${premises[i].name}" readonly/>
                                
                                <p for="premises-address">Dirección</p>
                                <input type="text" placeholder="Dirección" id="premises-address" pattern="^[A-Za-z ]+$" value="${premises[i].address}" readonly/>
                                
                                <p for="warehouses-number">Nº Almacenes</p>
                                <input type="text" placeholder="Capacidad" id="warehouses-number" pattern="([1-9]{2})" value="${premises[i].capacity}" readonly/>
                                
                                <p for="premises-state">Estado</p>
                                <input type="text" placeholder="Estado" id="premises-state" pattern="^[A-Za-z ]+$" value="${premises[i].state}" readonly/>
                            </div>
                            <div class="premises-data2">
                                <textarea type="text" id="premises-description" placeholder="Descripción" readonly>${premises[i].description}</textarea>
                            </div>
                            <div class="premises-buttons">
                                <a href="/edit_premises/${premises[i].id}" id="edit_premises/${premises[i].id}" onclick="edit_premises(${premises[i].id})">Editar</a>
                                <a href="/manage_premises/${premises[i].id}">Gestionar</a>
                            </div>
                        </div>
                    `;
        
                    mainContent.appendChild(premiseDiv);
                }

                if (premises.length === 0) {
                    const noPremisesMessage = document.createElement('p');
                    noPremisesMessage.textContent = 'No se encontraron locales asociados.';
                    const mainUser = document.getElementById('main-user');
                    mainUser.classList.add('background');
                    mainContent.appendChild(noPremisesMessage);
                }
            } 
            catch (error) {
                console.error('Error al cargar los datos:', error.message);
            }
        } 
        else {
            throw new Error('Rol de usuario desconocido');
        }
    } catch (error) {
        console.error('Error al cargar los datos:', error.message);
    }
}

// FUNCION PARA CARGAR EL HOME DEL ADMINISTRADOR
async function cargarHomeAdmin() {
    try {
        const response = await fetch('/api-data');
        if (!response.ok) {
            throw new Error('No se pudo obtener la información');
        }

        const { encryptedData, key, iv } = await response.json();

        const data = await decryptData(encryptedData, key, iv);

        const role = data.role;

        if (role === 'administrator') {

            const aboveContent = document.getElementById('above-content');
            
            const titleDiv = document.createElement('h2');
            titleDiv.innerHTML = 'Panel de Administrador';
            aboveContent.appendChild(titleDiv);
            
            const mainContent = document.getElementById('main-content');

            const rentalLink = document.createElement('a');
            rentalLink.classList.add('admin-div-card');
            rentalLink.href = '/rentals';
            rentalLink.textContent = 'Alquileres';
            mainContent.appendChild(rentalLink);

            const warehouseLink = document.createElement('a');
            warehouseLink.classList.add('admin-div-card');
            warehouseLink.href = '/warehouses';
            warehouseLink.textContent = 'Almacenes';
            mainContent.appendChild(warehouseLink);

            const tenantLink = document.createElement('a');
            tenantLink.classList.add('admin-div-card');
            tenantLink.href = '/tenants';
            tenantLink.textContent = 'Clientes';
            mainContent.appendChild(tenantLink);

            const enterpriseLink = document.createElement('a');
            enterpriseLink.classList.add('admin-div-card');
            enterpriseLink.href = '/enterprises';
            enterpriseLink.textContent = 'Empresas';
            mainContent.appendChild(enterpriseLink);

            const invoiceLink = document.createElement('a');
            invoiceLink.classList.add('admin-div-card');
            invoiceLink.href = '/invoices';
            invoiceLink.textContent = 'Facturas';
            mainContent.appendChild(invoiceLink);

            const premisesLink = document.createElement('a');
            premisesLink.classList.add('admin-div-card');
            premisesLink.href = '/premises';
            premisesLink.textContent = 'Locales';
            mainContent.appendChild(premisesLink);

            const offerLink = document.createElement('a');
            offerLink.classList.add('admin-div-card'); 
            offerLink.href = '/offers';
            offerLink.textContent = 'Ofertas';
            mainContent.appendChild(offerLink);

            const ownerLink = document.createElement('a');
            ownerLink.classList.add('admin-div-card');
            ownerLink.href = '/owners';
            ownerLink.textContent = 'Propietarios'; 
            mainContent.appendChild(ownerLink);
        } 
        else {
            throw new Error('Rol de usuario desconocido');
        }
    } catch (error) {
        console.error('Error al cargar los datos:', error.message);
    }
}

// FUNCION PARA EDITAR ALMACENES
async function edit_premises(premisesId) {
    try {
        
        const response = await fetch('/api-data');
        if (!response.ok) {
            throw new Error('No se pudo obtener la información');
        }

        const { encryptedData, key, iv } = await response.json();

        const data = await decryptData(encryptedData, key, iv);

        const premises = data.premises;

        let selectedPremises = null;

        for (let i = 0; i < premises.length; i++) {
            if (premises[i].id === premisesId) {
                selectedPremises = premises[i];
                break;
            }
        }

        if (selectedPremises) {
            const premisesData = {
                id: selectedPremises.id,
                name: selectedPremises.name,
                address: selectedPremises.address,
                capacity: selectedPremises.capacity,
                description: selectedPremises.description,
                state: selectedPremises.state,
                premises_image: selectedPremises.premises_image
            };

            const edit_premises_container = document.getElementById('edit-premises-container');

            const premisesEdit = document.createElement('div');
            premisesEdit.classList.add('edit_premises_card');

            premisesEdit.innerHTML = `
                    <form id="PremisesEditForm" action="/update_premises_owner/${premisesData.id}" method="POST">
                        <div class="premises-title2">
                            <h2>Local Nº ${premisesData.id}</h2>
                        </div>

                        <div class="premises-card2">
                            <div class="premises-image">
                                <button type="button" id="profileButton2.0" onclick="showDiv2()">
                                    <img src="${premisesData.premises_image}" alt="Imagen de perfil" class="edit-premises-image">
                                </button>
                            </div>
                            <div class="premises-data3">
                                <label for="premises-name">Nombre</label>
                                <input type="text" placeholder="Nombre" pattern="^[A-Za-záéíóúÁÉÍÓÚñÑüÜ0-9 ]+$" value="${premisesData.name}" name="name" id="premises-name" autocomplete="name"/>
                                
                                <label for="premises-address">Dirección</label>
                                <input type="text" placeholder="Dirección" pattern="^[A-Za-záéíóúÁÉÍÓÚñÑüÜ0-9 ]+$" value="${premisesData.address}" name="address" id="premises-address" autocomplete="street-address"/>
                                
                                
                                <label for="premises-state">Estado:</label>
                                <select class="select" name="state" id="premises-state" required>
                                    <option class="option-disabled" disabled selected>Estado</option>
                                    <option class="option" value="Abierto" ${premisesData.state === 'Abierto' ? 'selected' : ''}>Abierto</option>
                                    <option class="option" value="Pendiente de apertura" ${premisesData.state === 'Pendiente de apertura' ? 'selected' : ''}>Pendiente de apertura</option>
                                    <option class="option" value="Cerrado" ${premisesData.state === 'Cerrado' ? 'selected' : ''}>Cerrado</option>
                                    <option class="option" value="En mantenimiento" ${premisesData.state === 'En mantenimiento' ? 'selected' : ''}>En mantenimiento</option>
                                    <option class="option" value="No Disponible" ${premisesData.state === 'No Disponible' ? 'selected' : ''}>No Disponible</option>
                                    <option class="option" value="En obras" ${premisesData.state === 'En obras' ? 'selected' : ''}>En obras</option>
                                </select>
                            
                            </div>
                            <div class="premises-data33">
                                <textarea placeholder="Descripción" name="description">${premisesData.description}</textarea>
                            </div>
                            <div class="premises-buttons2">
                                <button type="submit" form="PremisesEditForm">Guardar</button>
                            </div>
                        </div>
                    </form>

                    <div class="overlay" id="overlay2.0">
                        <div id="optionsDiv2.0" class="photo-menu">
                            <h3>Cambiar foto del perfil</h3>

                            <button onclick="openFileSelector2()" class="upload" type="button">Subir foto</button>
                            <button class="delete" type="button" onclick="submitDeletePhotoForm()">Eliminar foto actual</button>
                            <button id="cancelButton" class="cancel" type="button" onclick="CancelButtonClick2()">Cancelar</button>

                            <!-- Formulario para subir la foto -->
                            <form class="profile_dropzone" id="profileForm2.0" action="/update_premises_owner/${premisesData.id}" method="POST" enctype="multipart/form-data">
                                <input type="file" name="premises_image" id="fileInput2.0" accept=".jpg, .jpeg, .png, .gif" title="Subir imagen de perfil" style="display: none;" onchange="submitForm2()">
                            </form>

                            <!-- Formulario para eliminar la foto -->
                            <form id="deletePhotoPremises" action="/update_premises_owner/${premisesData.id}" method="POST" enctype="multipart/form-data" style="display: none;">
                                <input type="hidden" name="delete_premises_image" value="yes">
                            </form>
                        </div>
                    </div>`;

                    edit_premises_container.appendChild(premisesEdit);
        } else {
            console.error('Local no encontrado');
        }
    }
    catch (error) {
        console.error('Local no encontrado');
    }
}

// MOSTRAR EL DIV PARA CAMBIAR LA IMAGEN
function showDiv2() {
    var optionsDiv2 = document.getElementById('optionsDiv2.0');
    var overlay2 = document.getElementById('overlay2.0');
    if (optionsDiv2 && overlay2) {
        optionsDiv2.style.display = 'block';
        overlay2.style.position = 'fixed';
    }
}

// CIERRA EL DIV CUANDO SE HACE CLIC FUERA DEL DIV
document.addEventListener('click', function(event) {
    var optionsDiv2 = document.getElementById('optionsDiv2.0');
    var profileButton2 = document.getElementById('profileButton2.0');
    var overlay2 = document.getElementById('overlay2.0');

    if (optionsDiv2 && profileButton2 && overlay2) {
        if (!optionsDiv2.contains(event.target) && !profileButton2.contains(event.target)) {
            optionsDiv2.style.display = 'none';
            overlay2.style.position = 'relative';
        }
    }
});

// FUNCIONES PARA LAS POCIONES DEL DIV DE CAMBIAR LA IMAGEN DE PERFIL DEL ALMACÉN
function openFileSelector2() {
    document.getElementById('fileInput2.0').click();
}

function submitForm2() {
    document.getElementById('profileForm2.0').submit();
}

function submitDeletePhotoForm() {
    document.getElementById('deletePhotoPremises').submit();
}

function CancelButtonClick2() {
    var optionsDiv2 = document.getElementById('optionsDiv2.0');
    var overlay2 = document.getElementById('overlay2.0');
    
    if (optionsDiv2 && overlay2) {
        optionsDiv2.style.display = 'none';
        overlay2.style.position = 'relative';
    } else {
        console.error('optionsDiv or overlay not found');
    }
}


// FUNCION PARA MOSTRAR LOS ALMACENES
async function manage_premises(premisesId) {
    try {
        const response = await fetch('/api-data');
        if (!response.ok) {
            throw new Error('No se pudo obtener la información');
        }

        const { encryptedData, key, iv } = await response.json();

        const data = await decryptData(encryptedData, key, iv);


        const premises = data.premises;
        const warehouse = data.warehouse;

        const navLink = document.getElementById('main-column');
        navLink.innerHTML = `<a href="/home"><img src="/assets/LOGO-NEGRO.png" alt="Profile Image" id="logo-profile"> </a>`;

        let selectedCapacity = null;
        let warehouseIds = [];

        for (let i = 0; i < premises.length; i++) {
            if (premises[i].id === premisesId) {
                selectedCapacity = premises[i].capacity;
                break;
            }
        }

        for (let j = 0; j < warehouse.length; j++) {

            if (warehouse[j].premises_id === premisesId) { 
                warehouseIds.push(warehouse[j].id);
            }
        }

        if (selectedCapacity !== null) {
            
            const premises_management_container = document.getElementById('manage-premises-div');
            
            const premises_management_title = document.getElementById('above-content');
            const premises_title = document.createElement('h2');
            premises_title.innerHTML = 'Almacenes';
            premises_management_title.appendChild(premises_title);

            premises_management_container.innerHTML = '';

            for (let i = 0; i < selectedCapacity; i++) {

                const div = document.createElement('div');
                div.className = 'capacity-div';
                
                const link = document.createElement('a');
                link.href = `/manage_warehouse/${warehouseIds[i]}`;
                link.textContent = `Almacén ${warehouseIds[i]}`;

                div.appendChild(link);
                premises_management_container.appendChild(div);
            }
        } else {
            console.log(`No se encontró ningún premise con el ID ${premisesId}.`);
        }

    } catch (error) {
        console.error('Error al gestionar los locales:', error);
    }
}


// FUNCION PARA MOSTRAR LOS ALMACENES
async function manage_warehouse(warehouseId) {
    try {
        const response = await fetch('/api-data');
        if (!response.ok) {
            throw new Error('No se pudo obtener la información');
        }

        const { encryptedData, key, iv } = await response.json();

        const data = await decryptData(encryptedData, key, iv);

        const warehouse = data.warehouse;
        const tenant = data.tenant;
        const rental = data.rental;

        let selectedWarehouse = warehouse.find(w => w.id === warehouseId);
        

        if (!selectedWarehouse) {
            console.log('No se encontraron datos del almacén.');
            return 'No se encontraron datos del almacén.';
        }
        const warehouseData = {
            id: selectedWarehouse.id,
            name: selectedWarehouse.name || null,
            size: selectedWarehouse.size || null,
            rental_price: selectedWarehouse.rental_price || NaN,
            availability: selectedWarehouse.availability || null,
            tenant_id: selectedWarehouse.tenant_id || null,
            premises_id: selectedWarehouse.premises_id || null,
            notes: selectedWarehouse.notes || null,
            key: selectedWarehouse.key || null
            
        };

        const navLink = document.getElementById('main-column');
        navLink.innerHTML = `<a href="/manage_premises/${warehouseData.premises_id}" class="nav-link">Almacenes del Local</a>`;

        let selectedTenant = tenant.find(t => t.id === warehouseData.tenant_id) || {};

        const TenantData = {
            id: selectedTenant.id || '',
            name: selectedTenant.name || '',
            lastname: selectedTenant.lastname || '',
            email: selectedTenant.email || '',
            phone_number: selectedTenant.phone_number || '',
            bank_account: selectedTenant.bank_account || ''
        };

        const premises_management_title = document.getElementById('above-content');
        const premises_title = document.createElement('h2');
        premises_title.innerHTML = `Almacén nº ${warehouseData.id}`;
        premises_management_title.appendChild(premises_title);

        const manage_warehouse_container = document.getElementById('manage-warehouse-container');

        const WarehouseContainer = document.createElement('div');
        WarehouseContainer.classList.add('manage-warehouse-card');

        if (!warehouseData.name && !warehouseData.size && !warehouseData.rental_price && !warehouseData.availability && !warehouseData.tenant_id) {
            WarehouseContainer.innerHTML = `
                <div class="warehouse_no_data">
                    <p>No hay datos disponibles para este almacén.</p>
                    <a href="/edit_warehouse/${warehouseId}">Añadir datos del almacén</a>
                </div>
                <div class="tenant_no_data">
                    <p>No hay datos disponibles para este cliente.</p>
                    <p>Contacta con el administrador.</p>
                    <p><a href="/contact" class="contact-link">Contacto</a></p>
                </div>
                `;
        } else if (warehouseData.name && warehouseData.size && warehouseData.rental_price && warehouseData.availability && !warehouseData.tenant_id) {
            WarehouseContainer.innerHTML = `
                <form id="edit-warehouse-data-form-${warehouseData.id}" class="edit_form">
                    <div class="warehouse_data">
                        <h2>Datos del Almacén</h2>
                        <label for="warehouse-name">Nombre</label>
                        <input type="text" name="name" id="warehouse-name" value="${warehouseData.name}" autocomplete="name" readonly/>
                        
                        <label for="warehouse-size">Tamaño (m2)</label>
                        <input type="text" name="size" id="warehouse-size" value="${warehouseData.size}" autocomplete="on"readonly/>
                        
                        <label for="warehouse-price">Precio Alquiler (€)</label>
                        <input type="text" name="rental_price" id="warehouse-price" value="${warehouseData.rental_price}"autocomplete="on" readonly/>

                        <label for="warehouse-availability">Disponibilidad</label>
                        <input type="text" name="availability" id="warehouse-availability" value="${warehouseData.availability}" readonly/>
                        
                        <label for="warehouse-notes">Notas</label>
                        <textarea placeholder="Notas" name="notes" id="warehouse-notes" readonly>${warehouseData.notes}</textarea>

                        <a id="edit-warehouse-button-${warehouseData.id}" class="edit-link" title="Editar Almacén" onclick="edit_warehouse_data(${warehouseData.id})"><i class="fas fa-edit"></i></a>
                        <button type="submit" class="save-button" id="save-warehouse-button-${warehouseData.id}" onclick="update_warehouse_data(${warehouseData.id})" style="display:none;">Guardar</button>
                    </div>
                </form>
                    <div class="tenant_no_data">
                        <p>No hay datos disponibles para este cliente.</p>
                        <p>Contacta con el administrador.</p>
                        <p><a href="/contact" class="contact-link">Contacto</a></p>
                    </div>
                    `;
        } else if (!warehouseData.name && !warehouseData.size && !warehouseData.availability && !warehouseData.rental_price && warehouseData.tenant_id) {
            WarehouseContainer.innerHTML = `
               
                    <div class="warehouse_no_data">
                        <p>No hay datos disponibles para este almacén.</p>
                        <a href="/edit_warehouse/${warehouseId}">Añadir datos del almacén</a>
                    </div>
                    <div class="tenant_data">
                        <div class="title-icon">
                            <h2>Datos del Cliente</h2>
                            <div class="help-icon-warehouse-tenant">
                                <span class="help-icon" aria-label="Información del cliente">?</span>
                                <div class="help-text-warehouse-tenant">Para cambiar los datos del cliente contacte con el administrador.</div>
                            </div>
                        </div>
                        <label for="tenant-name">Nombre</label>
                        <input type="text" id="tenant-name" value="${TenantData.name}" autocomplete="name" readonly/>
                        
                        <label for="tenant-lastname">Apellidos</label>
                        <input type="text" id="tenant-lastname" value="${TenantData.lastname}" autocomplete="family-name" readonly/>
                        
                        <label for="tenant-email">Email</label>
                        <input type="email" id="tenant-email" value="${TenantData.email}" autocomplete="email" readonly/>
                        
                        <label for="tenant-phone">Teléfono</label>
                        <input type="text" id="tenant-phone" value="${TenantData.phone_number}" autocomplete="tel" readonly/>
                        
                        <label for="tenant-bankaccount">Cuenta Bancaria</label>
                        <input type="text" id="tenant-bankaccount" value="${TenantData.bank_account}" readonly/>
                    </div>
                    `;
        } else if (warehouseData.name && warehouseData.size && warehouseData.rental_price && warehouseData.availability && selectedTenant) {

            let selectedRental = rental.find(r => r.warehouse_id === warehouseId);
        
            const rentalData = {
                id: selectedRental.id || '',
                paid: selectedRental.paid || '',
                contract: selectedRental.contract || ''
            };

            const contrato = rentalData.contract;

            WarehouseContainer.innerHTML = `
                <form id="edit-warehouse-data-form-${warehouseData.id}" class="edit_form">
                    <div class="warehouse_data">
                        <h2>Datos del Almacén</h2>
                        <label for="warehouse-name">Nombre</label>
                        <input type="text" name="name" id="warehouse-name" value="${warehouseData.name}" autocomplete="name" readonly/>
                        
                        <label for="warehouse-size">Tamaño (m2)</label>
                        <input type="text" name="size" id="warehouse-size" value="${warehouseData.size}"autocomplete="on" readonly/>
                        
                        <label for="warehouse-price">Precio Alquiler (€)</label>
                        <input type="text" name="rental_price" id="warehouse-price" value="${warehouseData.rental_price}" autocomplete="on" readonly/>
                        
                        <label for="warehouse-availability">Disponibilidad</label>
                        <input type="text" name="availability" id="warehouse-availability" value="${warehouseData.availability}" readonly/>
                        
                        <label for="warehouse-notes">Notas</label>
                        <textarea placeholder="Notas" name="notes" id="warehouse-notes" readonly>${warehouseData.notes}</textarea>

                        <a id="edit-warehouse-button-${warehouseData.id}" class="edit-link" title="Editar Almacén" onclick="edit_warehouse_data(${warehouseData.id})"><i class="fas fa-edit"></i></a>
                        <button type="submit" class="save-button" id="save-warehouse-button-${warehouseData.id}" onclick="update_warehouse_data(${warehouseData.id})" style="display:none;">Guardar</button>
                    </div>
                </form>
                    <div class="tenant_data">

                        <div class="title-icon">
                            <h2>Datos del Cliente</h2>
                            <div class="help-icon-warehouse-tenant">
                                <span class="help-icon" aria-label="Información del cliente">?</span>
                                <div class="help-text-warehouse-tenant">Para cambiar los datos del cliente contacte con el administrador.</div>
                            </div>
                        </div>
                        
                        <label for="tenant-name">Nombre</label>
                        <input type="text" id="tenant-name" value="${TenantData.name}" autocomplete="name" readonly/>
                        
                        <label for="tenant-lastname">Apellidos</label>
                        <input type="text" id="tenant-lastname" value="${TenantData.lastname}" autocomplete="family-name" readonly/>
                        
                        <label for="tenant-email">Email</label>
                        <input type="email" id="tenant-email" value="${TenantData.email}" autocomplete="email" readonly/>
                        
                        <label for="tenant-phone">Teléfono</label>
                        <input type="text" id="tenant-phone" value="${TenantData.phone_number}" autocomplete="tel" readonly/>
                        
                        <label for="tenant-bankaccount">Cuenta bancaria</label>
                        <input type="text" id="tenant-bankaccount" value="${TenantData.bank_account}" autocomplete="off" readonly/>
                    </div>
                    <div class="other_data">

                        <h2 id="upload_file" class="title active" onclick="mostrarDiv('UploadDiv', 'upload_file', this.getAttribute('data-contrato'), ${warehouseData.id}, '${warehouseData.key}', '${TenantData.email}')" title="Subir contrato" data-contrato="${contrato}" >Subir contrato de Alquiler</h2>
                        <h2 id="contract" class="title" onclick="mostrarDiv('showDiv', 'contract', this.getAttribute('data-contrato'), ${warehouseData.id}, '${warehouseData.key}', '${TenantData.email}')" title="Visualizar contrato" data-contrato="${contrato}" >Contrato de alquiler</h2>
                        <h2 id="key" class="title" onclick="mostrarDiv('showKeyDiv', 'key', this.getAttribute('data-contrato'), ${warehouseData.id}, '${warehouseData.key}', '${TenantData.email}')" title="Visualizar contrato" data-contrato="${contrato}" >Generar clave</h2>
                        
                        <div id="UploadDiv" class="show_content">

                            <form class="dropzone-box" action="/upload_file/${rentalData.id}" method="POST" enctype="multipart/form-data">
                                <input type="hidden" value="${warehouseData.id}" name="warehouseId"/>
                                <h2>Carga y adjunta archivos</h2>
                                <p>Click para cargar o arrastra archivos</p>
                                <div class="dropzone-area">
                                    <div class="file-upload-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-cloud-upload" width="24"
                                            height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none"
                                            stroke-linecap="round" stroke-linejoin="round">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                            <path d="M7 18a4.6 4.4 0 0 1 0 -9a5 4.5 0 0 1 11 2h1a3.5 3.5 0 0 1 0 7h-1" />
                                            <path d="M9 15l3 -3l3 3" />
                                            <path d="M12 12l0 9" />
                                        </svg>
                                    </div>
                                    <input type="file" id="upload-file" name="uploaded_file" accept=".doc,.docx,.pdf" />
                                    <p class="file-info">No hay archivos seleccionados (.doc o .pdf)</p>
                                </div>
                                <div class="dropzone-actions">
                                    <button type="reset">
                                        Cancel
                                    </button>
                                    <button id="submit-button" type="submit">
                                        Save
                                    </button>
                                </div>
                            </form> 
                        
                        </div>
                        
                        <div id="showDiv" class="show_content" style="display: none;"> </div>

                        <div id="showKeyDiv" class="show_content" style="display: none;"> </div>
                    `;
        }
        manage_warehouse_container.appendChild(WarehouseContainer);
    } catch (error) {
        console.error('Error al gestionar los locales:', error);

        alert('PARA PODER ACCEDER A LA INFORMACIÓN DE ESTE ALMACÉN, PRIMERO ES NECESARIO CREAR UN ALQUILER PARA EL INQUILINO DE ESTE ALMACÉN');
        
    }
}

// FUNCION PARA EDITAR LA INFORMACION DE LOS ALMACENES (ADMIN)
function edit_warehouse_data(warehouseId) {
    const form = document.getElementById(`edit-warehouse-data-form-${warehouseId}`);

    // Obtener todos los inputs y textareas por la etiqueta name
    let inputs = form.querySelectorAll('input[name], textarea[name]');
    
    let listaInputs = [];
    
    inputs.forEach(function(input) {
        if (input.name === 'availability') {
            // Guardar el valor actual del input antes de reemplazarlo
            const currentValue = input.value;

            const select = document.createElement('select');
            select.name = 'availability';
            select.className = 'select';

            select.innerHTML = `
              <option class="option-disabled" disabled>Elige una opción</option>
              <option class="option" value="Alquilado">Alquilado</option>
              <option class="option" value="No alquilado">No alquilado</option>
            `;

            // Establecer el valor actual como seleccionado
            Array.from(select.options).forEach(option => {
                if (option.value === currentValue) {
                    option.selected = true;
                }
            });

            input.parentNode.replaceChild(select, input);
        } else {
            listaInputs.push(input);
            input.removeAttribute('readonly');
        }
    });

    // Mostrar el botón de guardar y ocultar el de editar y eliminar
    const save_Button = document.getElementById(`save-warehouse-button-${warehouseId}`);
    save_Button.style.display = 'inline-block';
    
    const edit_Button = document.getElementById(`edit-warehouse-button-${warehouseId}`);
    edit_Button.style.display = 'none';
    
}



// FUNCION PARA ACTUALIZAR LA INFORMACION DE LOS ALMACENES (ADMIN)
function update_warehouse_data(warehouseId){
    
    const form = document.getElementById(`edit-warehouse-data-form-${warehouseId}`);
    
    let inputs = form.querySelectorAll('input[name], textarea[name]');
    let selects = form.querySelectorAll('select[name]');
    let formData = {};

    inputs.forEach(function(input) {
        formData[input.name] = input.value;
    });

    selects.forEach(function(select) {
        formData[select.name] = select.value;
    });

    fetch(`/update_warehouse/${warehouseId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            window.location.href = `/manage_warehouse/${warehouseId}`;
        })
        .catch(error => {
            window.location.href = `/manage_warehouse/${warehouseId}`;
            console.log(error);
        });
}

// FUNCION PARA MOSTRAR LA INFORMACION DE CLIENTE, EL CONTRATO Y LA CLAVE GENERADA (TODOS)
let claveGenerada = null;

function mostrarDiv(divId, activeTitleId, contratoJson, warehouseId, key, Temail) {

    // Ocultar ambos divs
    document.getElementById('UploadDiv').style.display = 'none';
    document.getElementById('showDiv').style.display = 'none';
    document.getElementById('showKeyDiv').style.display = 'none';
    
    // Ocultar el fondo amarillo en ambos títulos
    document.getElementById('upload_file').classList.remove('active');
    document.getElementById('contract').classList.remove('active');
    document.getElementById('key').classList.remove('active');
    
    // Mostrar el div seleccionado
    document.getElementById(divId).style.display = 'block';
    
    // Marcar el título activo
    document.getElementById(activeTitleId).classList.add('active');

    if (divId === 'showDiv') {

        const showDiv = document.getElementById('showDiv');

        if (contratoJson){
            showDiv.innerHTML = `<embed src="${contratoJson}" type="application/pdf" class="upload_document" />`;
        }
        else{
            showDiv.innerHTML = `No se ha subido ningún contrato`;
        }
    }
    if (divId === 'showKeyDiv'){

        const showKeyDiv = document.getElementById('showKeyDiv');

        if (key != 'null'){
            showKeyDiv.innerHTML = `<p>${key}</p>`;
        }
        else{
            if (claveGenerada === null) {
                const prefix = "TR-";
                let randomDigits = "";
                
                for (let i = 0; i < 4; i++) {
                    randomDigits += Math.floor(Math.random() * 10);
                }
                claveGenerada = prefix + randomDigits;
                console.log(claveGenerada);
                showKeyDiv.innerHTML = `
                    <p>${claveGenerada}</p>
                    <button type=submit onclick="guardar_clave(${warehouseId}, claveGenerada, '${Temail}')">Guardar clave</button>
                `;
            }
        }
    }
}

// ---------------------------------------------------------------------------------------------------- //
// FUNCION PARA LA CLAVE GENERADA EN LA BASE DE DATOS
function guardar_clave(warehouseId, claveGenerada, Temail){

    fetch(`/update_warehouse/${warehouseId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({key: claveGenerada, Temail:Temail}),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            window.location.href = `/manage_warehouse/${warehouseId}`;
        })
        .catch(error => {
            window.location.href = `/manage_warehouse/${warehouseId}`;
            console.log(error);
        });
}

// ---------------------------------------------------------------------------------------------------- //
// FUNCION PARA EDITAR LA INFORMACION DEL ALMACEN
async function edit_warehouse(warehouseId){

    try {
        const response = await fetch('/api-data');
        if (!response.ok) {
            throw new Error('No se pudo obtener la información');
        }

       const { encryptedData, key, iv } = await response.json();

       const data = await decryptData(encryptedData, key, iv);

        const warehouse = data.warehouse;

        let selectWarehouse = warehouse.find(w => w.id === warehouseId);

            if (!selectWarehouse) {
                console.log('No se encontraron datos del almacén.');
                return 'No se encontraron datos del almacén.';
            }

            const warehouseData = {
                id: selectWarehouse.id,
                enterprise_id: selectWarehouse.enterprise_id || null,
                owner_id: selectWarehouse.owner_id || null,
                premises_id: selectWarehouse.premises_id || null
            };

            const navLink = document.getElementById('main-column');
            navLink.innerHTML = `          
                <a href="/manage_premises/${warehouseData.premises_id}" class="nav-link">Almacenes del Local</a>
            `;

            const editWarehouseDiv = document.getElementById('edit_warehouse');

            editWarehouseDiv.innerHTML = `
                <h2>Editar Almacén ${warehouseId}</h2>
                <form class="form" action="/edit_warehouse/${warehouseId}" method="POST">
                    
                    <input type="hidden" name="premises_id" value="${warehouseData.premises_id}" />
                    <div id="passwordError" class="error-message">El ID no tiene el formato correcto</div>

                    <input type="hidden" name="enterprise_id" value="${warehouseData.enterprise_id}" />
                    <div id="passwordError" class="error-message">El ID no tiene el formato correcto</div>

                    <input type="hidden" name="owner_id" value="${warehouseData.owner_id}" />
                    <div id="passwordError" class="error-message">El ID no tiene el formato correcto</div>

                    <input type="text" name="name" placeholder="Nombre" pattern="^[A-Za-záéíóúÁÉÍÓÚñÑüÜ0-9 ]+$" />
                    <div id="passwordError" class="error-message">El nombre del almacén no tiene el formato correcto</div>

                    <input type="text" name="size" placeholder="Tamaño" pattern="^[A-Za-záéíóúÁÉÍÓÚñÑüÜ0-9 ]+$" />
                    <div id="passwordError" class="error-message">El tamaño no tiene el formato correcto</div>

                    <input type="text" name="rental_price" placeholder="Precio de Alquiler"  />
                    <div id="passwordError" class="error-message">El precio no tiene el formato correcto</div>

                    <input type="text" name="tenant_id" placeholder="ID Cliente" pattern="^[0-9]*$" />
                    <div id="passwordError" class="error-message">El ID no tiene el formato correcto</div>

                    <input type="text" name="notes" placeholder="Notas" pattern="^[A-Za-záéíóúÁÉÍÓÚñÑüÜ0-9 ]+$"/>
                    <div id="passwordError" class="error-message">Las notas no tienen el formato correcto</div>

                    <button type="submit">Guardar</button>
                </form>
            `;
    }
    catch{
        console.error('Error al gestionar el almacén:', error);
    }
}

// ---------------------------------------------------------------------------------------------------- //
// FUNCIÓN EDITAR PERFIL DE ADMINISTRADOR, PROPIETARIO Y EMPRESA

async function editarPerfil() {
    try {
        const response = await fetch('/api-data');
        if (!response.ok) {
            throw new Error('No se pudo obtener la información del servidor');
        }
     
        const { encryptedData, key, iv } = await response.json();

        const data = await decryptData(encryptedData, key, iv);

        const role = data.role;
        
        if (role === 'administrator') {

            const username = data.administrator[0].username;
            const email = data.administrator[0].email;
            const profile_image = data.profile_image;

            const profileDiv = document.getElementById('profile-card-container');
            profileDiv.innerHTML = `
            <h2 class="h2">Editar Perfil</h2>
            <form class="form" id="profileDataForm" action="/update_profile/${username}" method="POST">
                <div class="profile-card">
                    
                    <div class="image-container2" id="profile-image2">
                        
                        <button type="button" id="profileButton" onclick="showDiv()">
                            <img src="${profile_image}" alt="Imagen de perfil" class="profile-img2">
                        </button>
                        
                        <input type="text" value="${username}" class="name-container2" name="username"/>
                    </div>
                    
                    <div class="about-container2" id="about-container-profile">
                        
                        <label>Correo electrónico:</label>
                        <input type="text" value="${email}" name="email"/>
                        
                        <label>Contraseña:</label>
                        <div class="password-container">
                            <input type="password" name="password" id="passwordInput" placeholder="Contraseña"/>
                            <span class="profile-toggle-password" alt="Mostrar contraseña" onclick="togglePassword()">
                                <img src="/assets/ojo-cerrado.png" id="togglePassword" alt="Ocultar contraseña"/>
                            </span>
                        </div>
                        
                        <label>Confirmar Contraseña:</label>
                        <div class="password-container">
                            <input type="password" name="passwordConfirm" id="passwordInput2" placeholder="Repetir Contraseña"/>
                            <span class="profile-toggle-password2" alt="Mostrar contraseña" onclick="ConfirmTogglePassword()">
                                <img src="/assets/ojo-cerrado.png" id="confirm-togglePassword" alt="Ocultar contraseña"/>
                            </span>
                        
                        </div>
                    </div>
                    
                    <button type="submit" form="profileDataForm">Guardar</button>
                </div>
            </form>
    
            <div class="overlay" id="overlay" >
                <div id="optionsDiv" class="photo-menu">
                    <h3>Cambiar foto del perfil</h3>
                    
                    <button onclick="openFileSelector()" class="upload" type="button">Subir foto</button>
                    
                    <button class="delete" type="submit" form="deletePhotoProfile">Eliminar foto actual</button>
                    
                    <button id="cancelButton" class="cancel" type="button" onclick="CancelButtonClick()">Cancelar</button>
                    
                    <form class="profile_dropzone" id="profileForm" action="/update_profile/${username}" method="POST" enctype="multipart/form-data">
                        <input type="file" name="profile_image" id="fileInput" accept=".jpg, .jpeg, .png, .gif" title="Subir imagen de perfil" onchange="submitForm()" style="display: none;">
                    </form>

                    <form id="deletePhotoProfile" action="/update_profile/${username}" method="POST" enctype="multipart/form-data" class="profile_dropzone" >
                        <input type="hidden" name="delete_profile_image" id="deleteFile" value="yes">
                    </form>
                </div>
            </div>`;
        }
        else if(role === 'owner'){

            const name = data.owner[0].name;
            const lastname = data.owner[0].lastname;
            const phone_number = data.owner[0].phone_number;
            const dni = data.owner[0].dni;
            const bank_account = data.owner[0].bank_account;
            const username = data.owner[0].username;
            const email = data.owner[0].email;
            const profile_image = data.profile_image;

            const profileDiv = document.getElementById('profile-card-container');
            profileDiv.innerHTML = `
            <h2 class="h2">Editar Perfil</h2>
            <form class="form" id="profileDataForm" action="/update_profile/${username}" method="POST">
                <div class="profile-card">
                    
                    <div class="image-container2" id="profile-image2">
                        
                        <button type="button" id="profileButton" onclick="showDiv()">
                            <img src="${profile_image}" alt="Imagen de perfil" class="profile-img2">
                        </button>
                        
                        <input type="text" value="${username}" class="name-container2" name="username"/>
                    </div>
                    
                    <div class="about-container2" id="about-container-profile">
                        
                        <label>Nombre:</label>
                        <input type="text" value="${name}" name="name"/>

                        <label>Apellidos:</label>
                        <input type="text" value="${lastname}" name="lastname"/>

                        <label>Correo electrónico:</label>
                        <input type="text" value="${email}" name="email"/>

                        <label>Número de Teléfono:</label>
                        <input type="text" value="${phone_number}" name="phone_number"/>

                        <label>DNI:</label>
                        <input type="text" value="${dni}" name="dni" id="dniInput"/>

                        <label>Cuenta Bancaria:</label>
                        <input type="text" value="${bank_account}" name="bank_account"/>

                        <label>Contraseña:</label>
                        <div class="password-container-profile">
                            <input type="password" id="passwordInput" name="password" placeholder="Contraseña"/>
                            <span class="edit-profile-toggle-password" alt="Mostrar contraseña" onclick="togglePassword()">
                                <img src="/assets/ojo-cerrado.png" id="togglePassword" alt="Ocultar contraseña"/>
                            </span>
                            <div id="passwordError" class="error-message">La contraseña no tiene el formato correcto</div>
                        </div>
                        
                        <label>Confirmar Contraseña:</label>
                        <div class="password-container-profile">
                            <input type="password" id="passwordInput2" name="passwordConfirm" placeholder="Repetir Contraseña"/>
                            <span class="edit-profile-toggle-password2" alt="Mostrar contraseña" onclick="ConfirmTogglePassword()">
                                <img src="/assets/ojo-cerrado.png" id="confirm-togglePassword" alt="Ocultar contraseña"/>
                            </span>
                            <div id="passwordError" class="error-message">La contraseña no tiene el formato correcto</div>
                        </div>
                    </div>
                    
                    <button type="submit" form="profileDataForm">Guardar</button>
                </div>
            </form>
    
            <div class="overlay" id="overlay" >
                <div id="optionsDiv" class="photo-menu">
                    <h3>Cambiar foto del perfil</h3>
                    
                    <button onclick="openFileSelector()" class="upload" type="button">Subir foto</button>
                    
                    <button class="delete" type="submit" form="deletePhotoProfile">Eliminar foto actual</button>
                    
                    <button id="cancelButton" class="cancel" type="button" onclick="CancelButtonClick()">Cancelar</button>
                    
                    <form class="profile_dropzone" id="profileForm" action="/update_profile/${username}" method="POST" enctype="multipart/form-data">
                        <input type="file" name="profile_image" id="fileInput" accept=".jpg, .jpeg, .png, .gif" title="Subir imagen de perfil" onchange="submitForm()" style="display: none;">
                    </form>

                    <form id="deletePhotoProfile" action="/update_profile/${username}" method="POST" enctype="multipart/form-data" class="profile_dropzone" >
                        <input type="hidden" name="delete_profile_image" id="deleteFile" value="yes">
                    </form>
                </div>
            </div>`;

            // Agregar el evento al formulario para validar el DNI al enviar
            const profileDataForm = document.getElementById('profileDataForm');
            const dniInput = document.getElementById('dniInput');
            const dniError = document.createElement('div');
            dniError.id = 'dniError';
            dniError.style.color = 'red';
            dniError.style.display = 'none';
            dniError.innerText = 'El DNI no es válido.';
            dniInput.parentElement.appendChild(dniError);

            profileDataForm.addEventListener('submit', function(event) {
                const dniValue = dniInput.value.trim();

                // Validar el DNI
                if (!validarDNI(dniValue)) {
                    event.preventDefault();
                    dniError.style.display = 'block'; 
                } else {
                    dniError.style.display = 'none';
                }
            });

        }
        else if(role === 'enterprise'){

            const name = data.enterprise[0].name;
            const address = data.enterprise[0].address;
            const phone_number = data.enterprise[0].phone_number;
            const cif = data.enterprise[0].cif;
            const bank_account = data.enterprise[0].bank_account;
            const username = data.enterprise[0].username;
            const email = data.enterprise[0].email;
            const profile_image = data.profile_image;

            const profileDiv = document.getElementById('profile-card-container');
            profileDiv.innerHTML = `
            <h2 class="h2">Editar Perfil</h2>
            <form class="form" id="profileDataForm" action="/update_profile/${username}" method="POST">
                <div class="profile-card">
                    
                    <div class="image-container2" id="profile-image2">
                        
                        <button type="button" id="profileButton" onclick="showDiv()">
                            <img src="${profile_image}" alt="Imagen de perfil" class="profile-img2">
                        </button>
                        
                        <input type="text" value="${username}" class="name-container2" name="username"/>
                    </div>
                    
                    <div class="about-container2" id="about-container-profile">
                        
                        <label>Nombre:</label>
                        <input type="text" value="${name}" name="name"/>

                        <label>Dirección:</label>
                        <input type="text" value="${address}" name="address"/>

                        <label>Correo electrónico:</label>
                        <input type="text" value="${email}" name="email"/>

                        <label>Número de Teléfono:</label>
                        <input type="text" value="${phone_number}" name="phone_number"/>

                        <label>CIF:</label>
                        <input type="text" value="${cif}" name="cif"/>

                        <label>Cuenta Bancaria:</label>
                        <input type="text" value="${bank_account}" name="bank_account"/>

                        <label>Contraseña:</label>
                        <div class="password-container-profile">
                            <input type="password" id="passwordInput" name="password" placeholder="Contraseña"/>
                            <span class="edit-profile-toggle-password" alt="Mostrar contraseña" onclick="togglePassword()">
                                <img src="/assets/ojo-cerrado.png" id="togglePassword" alt="Ocultar contraseña"/>
                            </span>
                            <div id="passwordError" class="error-message">La contraseña no tiene el formato correcto</div>
                        </div>
                        
                        <label>Confirmar Contraseña:</label>
                        <div class="password-container-profile">
                            <input type="password" id="passwordInput2" name="passwordConfirm" placeholder="Repetir Contraseña"/>
                            <span class="edit-profile-toggle-password2" alt="Mostrar contraseña" onclick="ConfirmTogglePassword()">
                                <img src="/assets/ojo-cerrado.png" id="confirm-togglePassword" alt="Ocultar contraseña"/>
                            </span>
                        </div>
                    </div>
                    
                    <button type="submit" form="profileDataForm">Guardar</button>
                </div>
            </form>
    
            <div class="overlay" id="overlay" >
                <div id="optionsDiv" class="photo-menu">
                    <h3>Cambiar foto del perfil</h3>
                    
                    <button onclick="openFileSelector()" class="upload" type="button">Subir foto</button>
                    
                    <button class="delete" type="submit" form="deletePhotoProfile">Eliminar foto actual</button>
                    
                    <button id="cancelButton" class="cancel" type="button" onclick="CancelButtonClick()">Cancelar</button>
                    
                    <form class="profile_dropzone" id="profileForm" action="/update_profile/${username}" method="POST" enctype="multipart/form-data">
                        <input type="file" name="profile_image" id="fileInput" accept=".jpg, .jpeg, .png, .gif" title="Subir imagen de perfil" onchange="submitForm()" style="display: none;">
                    </form>

                    <form id="deletePhotoProfile" action="/update_profile/${username}" method="POST" enctype="multipart/form-data" class="profile_dropzone" >
                        <input type="hidden" name="delete_profile_image" id="deleteFile" value="yes">
                    </form>
                </div>
            </div>`;

            // Agregar el evento al formulario para validar el DNI al enviar
            const profileDataForm = document.getElementById('profileDataForm');
            const dniInput = document.getElementById('dniInput');
            const dniError = document.createElement('div');
            dniError.id = 'dniError';
            dniError.style.color = 'red';
            dniError.style.display = 'none';
            dniError.innerText = 'El DNI no es válido.';
            dniInput.parentElement.appendChild(dniError);

            profileDataForm.addEventListener('submit', function(event) {
                const dniValue = dniInput.value.trim();

                // Validar el DNI
                if (!validarDNI(dniValue)) {
                    event.preventDefault();
                    dniError.style.display = 'block';
                } else {
                    dniError.style.display = 'none';
                }
            });
        }
        else {
            throw new Error('Rol de usuario desconocido');
        }
    }
    catch (error) {
        console.error('Error al editar perfil', error.message);
    }
}

// FUNCION PARA MOSTRA EL DIV DE CAMBIAR LA IMAGEN DE PERFIL
function showDiv() {
    var optionsDiv = document.getElementById('optionsDiv');
    var overlay = document.getElementById('overlay');
    optionsDiv.style.display = 'block';
    overlay.style.position = 'fixed';
}

// FUNCION PARA CERRAR EL DIV CUANDO SE HACE CLIC FUERA DEL DIV
document.addEventListener('click', function(event) {
    const optionsDiv = document.getElementById('optionsDiv');
    const profileButton = document.getElementById('profileButton');
    const overlay = document.getElementById('overlay');

    if (optionsDiv !== null && profileButton !== null) {
        if (!optionsDiv.contains(event.target) && !profileButton.contains(event.target)) {
            optionsDiv.style.display = 'none';
            overlay.style.position = 'relative';
        }
    }
});

// FUNCION PARA MOSTRA LAS OPCIONES DE CAMBIAR LA IMAGEN DE PERFIL
function openFileSelector() {
  document.getElementById('fileInput').click();
}

function submitForm() {
  document.getElementById('profileForm').submit();
}

function CancelButtonClick() {
    const optionsDiv = document.getElementById('optionsDiv');
    const overlay = document.getElementById('overlay');

    if (optionsDiv && overlay) {
        optionsDiv.style.display = 'none';
        overlay.style.position = 'relative';
    } else {
        console.error('optionsDiv or overlay not found');
    }
}


// ---------------------------------------------------------------------------------------------------- //
// ALQUILERES //

let EOTName = [];
let PremisesID = [];
let WarehouseID = [];
let RentalStartDate = [];
let RentalFinishDate = [];
let RentalPrice = ["menos de 5€", "entre 5€ y 10€", "mas de 10€"];
let RentalState = [];
let RentalPaid = [];

async function agregarAlquileres() {
    try {
        const response = await fetch('/api-data');
        if (!response.ok) {
            throw new Error('No se pudo obtener la información del servidor');
        }
        
        const { encryptedData, key, iv } = await response.json();

        const data = await decryptData(encryptedData, key, iv);

        const role = data.role;
        
        if (role === 'administrator') {

            const titleContent = document.getElementById('rental-title');
            
            const titleDiv = document.createElement('h2');
            titleDiv.innerHTML = 'Alquileres';

            titleContent.appendChild(titleDiv);

            const navLink = document.getElementById('main-column');
            navLink.innerHTML = `          
                <a href="/home"><img src="/assets/LOGO-NEGRO.png" alt="Imagen de perfil"></a>
            `;
            
            const rentalContent = document.getElementById('rental-mainDiv');
            const rentals = data.rental;

            if (rentals.length === 0) {

                rentalContent.classList.add('main-p');

                const noRentalsMessage = document.createElement('p');
                noRentalsMessage.innerHTML = 'No hay alquileres disponibles';
                rentalContent.appendChild(noRentalsMessage);

                const createRental = document.createElement('a');
                createRental.classList.add('create-link');
                createRental.href = '/create_rental'; 
                createRental.textContent = 'Crear alquiler';
    
                rentalContent.appendChild(createRental);

                const table_content = document.getElementById('table-container');
                table_content.style.display = 'none';

                const filters_button = document.getElementById('toggle-filters-btn');
                filters_button.style.display = 'none';

            } else {

                renderRentals(data, rentals);

                const createDivR = document.createElement('div');
                createDivR.classList.add('create-div');
                createDivR.id = 'createR-id';
                rentalContent.appendChild(createDivR);

                const createinfo = document.getElementById('createR-id');
                createinfo.innerHTML += `<a href="/create_rental" class="add-user" title="Crear alquiler" ><i class="fa-solid fa-file-contract"></i></a>`;
                

                const filtersRContainer = document.getElementById('filters-container');
    
                filtersRContainer.innerHTML += `
                    <div class="filters-container2" >
                        
                        <div class="div-filtro">
                            <label for="EOTName-filter">NOMBRE</label>
                            <select id="EOTName-filter" onchange="applyRentalFilters()">
                                <option value="">Todos</option>
                                ${generateEOTName(EOTName)}
                            </select>
                        </div>

                        <div class="div-filtro">
                            <label for="PremisesID-filter">LOCAL</label>
                            <select id="PremisesID-filter" onchange="applyRentalFilters()">
                                <option value="">Todos</option>
                                ${generatePremisesID(PremisesID)}
                            </select>
                        </div>

                        <div class="div-filtro">
                            <label for="WarehouseID-filter">ALMACÉN</label>
                            <select id="WarehouseID-filter" onchange="applyRentalFilters()">
                                <option value="">Todos</option>
                                ${generateWarehouseID(WarehouseID)}
                            </select>
                        </div>

                        <div class="div-filtro">
                            <label for="RentalStartDate-filter">FECHA INICIO</label>
                            <select id="RentalStartDate-filter" onchange="applyRentalFilters()">
                                <option value="">Todos</option>
                                ${generateRentalStartDate(RentalStartDate)}
                            </select>
                        </div>

                        <div class="div-filtro">
                            <label for="RentalFinishDate-filter">FECHA FIN</label>
                            <select id="RentalFinishDate-filter" onchange="applyRentalFilters()">
                                <option value="">Todos</option>
                                ${generateRentalFinishDate(RentalFinishDate)}
                            </select>
                        </div>

                        <div class="div-filtro">
                            <label for="RentalPrice-filter">PRECIO</label>
                            <select id="RentalPrice-filter" onchange="applyRentalFilters()">
                                <option value="">Todos</option>
                                ${generateRentalPrice(RentalPrice)}
                            </select>
                        </div>

                        <div class="div-filtro">
                            <label for="RentalState-filter">ESTADO</label>
                            <select id="RentalState-filter" onchange="applyRentalFilters()">
                                <option value="">Todos</option>
                                ${generateRentalState(RentalState)}
                            </select>
                        </div>

                        <div class="div-filtro">
                            <label for="RentalPaid-filter">ABONADO</label>
                            <select id="RentalPaid-filter" onchange="applyRentalFilters()">
                                <option value="">Todos</option>
                                ${generateRentalPaid(RentalPaid)}
                            </select>
                        </div>
                    </div>
                `;
                
                function generateEOTName(EOTName) {
                    return EOTName.map(rental => `<option value="${rental}">${rental}</option>`).join('');
                }

                function generatePremisesID(PremisesID) {
                    return PremisesID.map(rental => `<option value="${rental}">${rental}</option>`).join('');
                }

                function generateWarehouseID(WarehouseID) {
                    return WarehouseID.map(rental => `<option value="${rental}">${rental}</option>`).join('');
                }
            
                function generateRentalStartDate(RentalStartDate) {
                    return RentalStartDate.map(rental => `<option value="${rental}">${rental}</option>`).join('');
                }

                function generateRentalFinishDate(RentalFinishDate) {
                    return RentalFinishDate.map(rental => `<option value="${rental}">${rental}</option>`).join('');
                }

                function generateRentalPrice(RentalPrice) {
                    return RentalPrice.map(rental => `<option value="${rental}">${rental}</option>`).join('');
                }

                function generateRentalState(RentalState) {
                    return RentalState.map(rental => `<option value="${rental}">${rental}</option>`).join('');
                }

                function generateRentalPaid(RentalPaid) {
                    return RentalPaid.map(rental => `<option value="${rental}">${rental}</option>`).join('');
                }
            
            }
        }
        else if (role === 'owner' || role === 'enterprise') {

            const titleContent = document.getElementById('rental-title');
                
            const titleDiv = document.createElement('h2');
            titleDiv.innerHTML = 'Alquileres';
            titleContent.appendChild(titleDiv);
    
            const navLink = document.getElementById('main-column');
            navLink.classList.remove('nav-column');
            navLink.classList.add('nav-column-premises');
            navLink.innerHTML = `
                <a href="/home" class="nav-link">Inicio</a>
                <a href="/warehouses" class="nav-link">Listado de Almacenes</a>
                <a href="/rentals" class="nav-link">Alquileres</a>
                <a href="/cameras" class="nav-link">Cámaras</a>
                <a href="/invoices" class="nav-link">Facturación</a>
            `;
                
            const rentalContent = document.getElementById('rental-mainDiv');
            const rentals = data.rental;
    
            if (rentals.length === 0) {
    
                rentalContent.classList.add('main-p');
    
                const noRentalsMessage = document.createElement('p');
                noRentalsMessage.innerHTML = 'No hay alquileres disponibles';
                rentalContent.appendChild(noRentalsMessage);
    
                const createRental = document.createElement('a');
                createRental.classList.add('create-link');
                createRental.href = '/create_rental'; 
                createRental.textContent = 'Crear alquiler';
        
                rentalContent.appendChild(createRental);
    
                const table_content = document.getElementById('table-container');
                table_content.style.display = 'none';

                const filters_button = document.getElementById('toggle-filters-btn');
                filters_button.style.display = 'none';
    
            } else {

                renderRentals(data, rentals);

                const createDivR = document.createElement('div');
                createDivR.classList.add('create-div');
                createDivR.id = 'createR-id';
                rentalContent.appendChild(createDivR);

                const createinfo = document.getElementById('createR-id');
                createinfo.innerHTML += `<a href="/create_rental" class="add-user" title="Crear alquiler" ><i class="fa-solid fa-file-contract"></i></a>`;
                

                const filtersRContainer = document.getElementById('filters-container');
    
                filtersRContainer.innerHTML += `
                    <div class="filters-container2" >
                        
                        <div class="div-filtro">
                            <label for="EOTName-filter">NOMBRE</label>
                            <select id="EOTName-filter" onchange="applyRentalFilters()">
                                <option value="">Todos</option>
                                ${generateEOTName(EOTName)}
                            </select>
                        </div>

                        <div class="div-filtro">
                            <label for="PremisesID-filter">LOCAL</label>
                            <select id="PremisesID-filter" onchange="applyRentalFilters()">
                                <option value="">Todos</option>
                                ${generatePremisesID(PremisesID)}
                            </select>
                        </div>

                        <div class="div-filtro">
                            <label for="WarehouseID-filter">ALMACÉN</label>
                            <select id="WarehouseID-filter" onchange="applyRentalFilters()">
                                <option value="">Todos</option>
                                ${generateWarehouseID(WarehouseID)}
                            </select>
                        </div>

                        <div class="div-filtro">
                            <label for="RentalStartDate-filter">FECHA INICIO</label>
                            <select id="RentalStartDate-filter" onchange="applyRentalFilters()">
                                <option value="">Todos</option>
                                ${generateRentalStartDate(RentalStartDate)}
                            </select>
                        </div>

                        <div class="div-filtro">
                            <label for="RentalFinishDate-filter">FECHA FIN</label>
                            <select id="RentalFinishDate-filter" onchange="applyRentalFilters()">
                                <option value="">Todos</option>
                                ${generateRentalFinishDate(RentalFinishDate)}
                            </select>
                        </div>

                        <div class="div-filtro">
                            <label for="RentalPrice-filter">PRECIO</label>
                            <select id="RentalPrice-filter" onchange="applyRentalFilters()">
                                <option value="">Todos</option>
                                ${generateRentalPrice(RentalPrice)}
                            </select>
                        </div>

                        <div class="div-filtro">
                            <label for="RentalState-filter">ESTADO</label>
                            <select id="RentalState-filter" onchange="applyRentalFilters()">
                                <option value="">Todos</option>
                                ${generateRentalState(RentalState)}
                            </select>
                        </div>

                        <div class="div-filtro">
                            <label for="RentalPaid-filter">ABONADO</label>
                            <select id="RentalPaid-filter" onchange="applyRentalFilters()">
                                <option value="">Todos</option>
                                ${generateRentalPaid(RentalPaid)}
                            </select>
                        </div>
                    </div>
                `;
                
                function generateEOTName(EOTName) {
                    return EOTName.map(rental => `<option value="${rental}">${rental}</option>`).join('');
                }

                function generatePremisesID(PremisesID) {
                    return PremisesID.map(rental => `<option value="${rental}">${rental}</option>`).join('');
                }

                function generateWarehouseID(WarehouseID) {
                    return WarehouseID.map(rental => `<option value="${rental}">${rental}</option>`).join('');
                }
            
                function generateRentalStartDate(RentalStartDate) {
                    return RentalStartDate.map(rental => `<option value="${rental}">${rental}</option>`).join('');
                }

                function generateRentalFinishDate(RentalFinishDate) {
                    return RentalFinishDate.map(rental => `<option value="${rental}">${rental}</option>`).join('');
                }

                function generateRentalPrice(RentalPrice) {
                    return RentalPrice.map(rental => `<option value="${rental}">${rental}</option>`).join('');
                }

                function generateRentalState(RentalState) {
                    return RentalState.map(rental => `<option value="${rental}">${rental}</option>`).join('');
                }

                function generateRentalPaid(RentalPaid) {
                    return RentalPaid.map(rental => `<option value="${rental}">${rental}</option>`).join('');
                }
            }
        }
    } catch (error) {
        console.error('Error al agregar alquileres', error.message);
    }
}

function renderRentals(data, rentals){

    const rentalinfo = document.getElementById('Rdata-content');

    for (let i = 0; i < rentals.length; i++) {
        const rental = rentals[i];
        const owner_id = rental.owner_id;
        const enterprise_id = rental.enterprise_id;

        let EOname;
        let EOid;
        let role;
        let tenant_name = '';
        let tenantId = '';
        
        if (owner_id === null) {
            if (data.enterprise.length > 0) {
                EOid = enterprise_id;
                for (let i = 0; i < data.enterprise.length; i++) {
                    if (data.enterprise[i].id === EOid) {
                        EOname = data.enterprise[i].name;
                        break;
                    }
                }
                role = 'enterprise';
            } else {
                EOid = owner_id;
                for (let i = 0; i < data.owner.length; i++) {
                    if (data.owner[i].id === EOid) {
                        EOname = data.owner[i].name;
                        break;
                    }
                }
                role = 'owner';
            }
        } else {
            if (data.owner.length > 0) {
                EOid = owner_id;
                for (let i = 0; i < data.owner.length; i++) {
                    if (data.owner[i].id === EOid) {
                        EOname = data.owner[i].name;
                        break;
                    }
                }
                role = 'owner';
            } else {
                EOid = enterprise_id;
                for (let i = 0; i < data.enterprise.length; i++) {
                    if (data.enterprise[i].id === EOid) {
                        EOname = data.enterprise[i].name;
                        break;
                    }
                }
                role = 'enterprise';
            }
        }
        
        for (let j = 0; j < data.tenant.length; j++) {
            if (data.tenant[j].id === rental.tenant_id) {
                tenant_name = data.tenant[j].name;
                tenantId = data.tenant[j].id;
                break;
            }
        }

        if (!EOTName.includes(tenant_name)) {
            EOTName.push(tenant_name);
        }

        if (!PremisesID.includes(rental.premises_id)) {
            PremisesID.push(rental.premises_id);
        }

        if (!WarehouseID.includes(rental.warehouse_id)) {
            WarehouseID.push(rental.warehouse_id);
        }

        if (!RentalStartDate.includes(rental.start_date)) {
            RentalStartDate.push(rental.start_date);
        }

        if (!RentalFinishDate.includes(rental.finish_date)) {
            RentalFinishDate.push(rental.finish_date);
        }

        

        if (!RentalState.includes(rental.state)) {
            RentalState.push(rental.state);
        }

        if (!RentalPaid.includes(rental.paid)) {
            RentalPaid.push(rental.paid);
        }

        rentalinfo.innerHTML += `
        <tr id="edit-form-${rental.id}">
            <form id="edit-form-${rental.id}" class="edit_form">
                <td data-label="Nº Alquiler"><input name="id" type="text" value="${rental.id}" readonly></td>
                <td data-label="Nº Titular"><input name="EOid" type="text" value="${EOid}" readonly></td>
                <td data-label="Titular"><input name="EOname" type="text" value="${EOname}" readonly></td>
                <td data-label="Nº Local"><input type="text" name="premises_id" value="${rental.premises_id}" readonly></td>
                <td data-label="Nº Almacén"><input type="text" name="warehouse_id" value="${rental.warehouse_id}" readonly></td>
                <td data-label="Nº Cliente"><input name="tenant_id" type="text" value="${tenantId}" readonly></td>
                <td data-label="Cliente"><input name="tenant_name" type="text" value="${tenant_name}" readonly></td>
                <td data-label="Fecha Inicio"><input name="start_date" type="text" value="${rental.start_date}" readonly></td>
                <td data-label="Fecha Fin"><input name="finish_date" type="text" value="${rental.finish_date}" readonly></td>
                <td data-label="Precio"><input name="price" type="text" value="${rental.price}" readonly></td>
                <td data-label="Estado"><input name="state" type="text" value="${rental.state === 'ongoing' ? 'En curso' : 'Finalizado'}" readonly></td>
                <td data-label="Abonado"><input name="paid" type="text" value="${rental.paid ? 'Sí' : 'No'}" readonly></td>
                <input type="hidden" name="role" type="text" value="${role}" >
                <td data-label="Acciones">
                    <a href="#" id="edit-${rental.id}" class="edit-link" title="Editar Alquiler" onclick="editRental(${rental.id})"><i class="icon fas fa-edit"></i></a>
                    <a id="delete-${rental.id}" class="delete-link" title="Eliminar Alquiler" onclick="deleteRental(${rental.id})"><i class="icon fas fa-trash-alt"></i></a>
                    <button type="submit" class="save-button" id="save-button-${rental.id}" onclick="updateRental(${rental.id})" style="display:none;">Guardar</button>
                </td>
            </form>
        </tr>
        `;
    
    }
}

async function applyRentalFilters() {

    const EOTNameFilter = document.getElementById('EOTName-filter').value;
    const PremisesIDFilter = document.getElementById('PremisesID-filter').value;
    const WarehouseIDFilter = document.getElementById('WarehouseID-filter').value;
    const RentalStartDateFilter = document.getElementById('RentalStartDate-filter').value;
    const RentalFinishDateFilter = document.getElementById('RentalFinishDate-filter').value;
    const RentalPriceFilter = document.getElementById('RentalPrice-filter').value;
    const RentalStateFilter = document.getElementById('RentalState-filter').value;
    const RentalPaidFilter = document.getElementById('RentalPaid-filter').value;

    try {
        const response = await fetch('/api-data');
        if (!response.ok) {
            throw new Error('No se pudo obtener la información del servidor');
        }

        const { encryptedData, key, iv } = await response.json();

        const data = await decryptData(encryptedData, key, iv);

        const tenants = data.tenant;
        const rentals = data.rental;
        const premises = data.premises;
        const warehouses = data.warehouse;

        let filteredRentals = rentals;

        // Filtrar por NOMBRE CLIENTE
        if (EOTNameFilter) {
            const filteredEOTNameId = tenants.find(tenant => tenant.name == EOTNameFilter)?.id;

            if (filteredEOTNameId) {
                filteredRentals = filteredRentals.filter(rental => rental.tenant_id == filteredEOTNameId);
            } else {
                filteredRentals = [];
            }
        }

        // Filtrar por LOCAL
        if (PremisesIDFilter) {
            
            const filteredPremisesIDId = premises.find(premise => premise.id == PremisesIDFilter)?.id;

            if (filteredPremisesIDId) {
                filteredRentals = filteredRentals.filter(rental => rental.premises_id == filteredPremisesIDId);
            } else {
                filteredRentals = [];
            }
        }

        // Filtrar por ALMACEN
        if (WarehouseIDFilter) {
            
            const filteredWarehouseIDId = warehouses.find(warehouse => warehouse.id == WarehouseIDFilter)?.id;

            if (filteredWarehouseIDId) {
                filteredRentals = filteredRentals.filter(rental => rental.warehouse_id == filteredWarehouseIDId);
            } else {
                filteredRentals = [];
            }
        }

        // Filtrar por FECHA INICIO
        if (RentalStartDateFilter) {
            
            const filteredRentalStartDateId = rentals.find(rental => rental.start_date == RentalStartDateFilter)?.id;

            if (filteredRentalStartDateId) {
                filteredRentals = filteredRentals.filter(rental => rental.id == filteredRentalStartDateId);
            } else {
                filteredRentals = [];
            }
        }

        // Filtrar por FECHA FIN
        if (RentalFinishDateFilter) {
            
            const filteredRentalEndDateFilterId = rentals.find(rental => rental.finish_date == RentalFinishDateFilter)?.id;
                
            if (filteredRentalEndDateFilterId) {
                filteredRentals = filteredRentals.filter(rental => rental.id == filteredRentalEndDateFilterId);
            } else {
                filteredRentals = [];
            }
        }

        // Filtrar por PRECIO
        if (RentalPriceFilter) {
            filteredRentals = filteredRentals.filter(rental => {
                const price = rental.price;

                if (RentalPriceFilter === "menos de 5€") {
                    return price < 5;
                } else if (RentalPriceFilter === "entre 5€ y 10€") {
                    return price >= 5 && price <= 10;
                } else if (RentalPriceFilter === "mas de 10€") {
                    return price > 10;
                }
                
                return false; // Si no coincide con ningún filtro
            });
        }

        // Filtrar por ESTADO
        if (RentalStateFilter) {
            const filteredRentalStateFilterId = rentals.find(rental => rental.state == RentalStateFilter)?.id;
                
            if (filteredRentalStateFilterId) {
                filteredRentals = filteredRentals.filter(rental => rental.state == RentalStateFilter);
            } else {
                filteredRentals = [];
            }
        }

        // Filtrar por ABONADO
        if (RentalPaidFilter) {
            const filterValue = RentalPaidFilter === 'true' ? true : RentalPaidFilter === 'false' ? false : RentalPaidFilter;

            if (typeof filterValue === 'boolean') {

                filteredRentals = rentals.filter(rental => rental.paid === filterValue);
        
            } else {
                filteredRentals = [];
            }
        }
        

        // Si no hay resultados, mostrar mensaje
        if (filteredRentals.length === 0) {
            const rentalinfo = document.getElementById('Rdata-content');
            rentalinfo.innerHTML = '<p>No se encontraron resultados para los filtros aplicados.</p>';
            return;
        }

        const rentalinfo = document.getElementById('Rdata-content');
        rentalinfo.innerHTML = '';

        renderRentals(data, filteredRentals);

    } catch (error) {
        console.error("Error al aplicar los filtros:", error);
    }
}


function editRental(rentalId) {
    const form = document.getElementById(`edit-form-${rentalId}`);

    // Obtener todos los input por la etiqueta name
    let inputs = form.querySelectorAll('input[name]');

    let listaInputs = [];

    inputs.forEach(function(input) {
        if (input.name === 'state' || input.name === 'paid') {
            let currentValue = input.value;

            const select = document.createElement('select');
            select.name = input.name;
            select.className = 'select';

            if (input.name === 'state') {
                select.innerHTML = `
                    <option class="option-disabled" disabled>Estado del Alquiler</option>
                    <option class="option" value="ongoing">En curso</option>
                    <option class="option" value="completed">Finalizado</option>
                `;
               
                if (currentValue === 'ongoing') {
                    select.value = 'ongoing'; // Seleccionar "Sí"
                } else if (currentValue === 'completed') {
                    select.value = 'completed'; // Seleccionar "No"
                }

            } else if (input.name === 'paid') {
                select.innerHTML = `
                    <option class="option-disabled" disabled>Abonado</option>
                    <option class="option" value="true">Sí</option>
                    <option class="option" value="false">No</option>
                `;
                
                // Convertir true/false a "true"/"false"
                if (currentValue === 'true' || currentValue === true) {
                    select.value = 'true'; // Seleccionar "Sí"
                } else if (currentValue === 'false' || currentValue === false) {
                    select.value = 'false'; // Seleccionar "No"
                }
            }

            // Seleccionar la opción correspondiente
            Array.from(select.options).forEach(option => {
                if (option.value === currentValue) {
                    option.selected = true;
                }
            });

            // Reemplazar el input por el select
            input.parentNode.replaceChild(select, input);
        } else {
            listaInputs.push(input);
            input.removeAttribute('readonly');
        }
    });

    // Mostrar el botón de guardar y ocultar el de editar y eliminar
    const saveButton = document.getElementById(`save-button-${rentalId}`);
    saveButton.style.display = 'inline-block';
    
    const editButton = document.getElementById(`edit-${rentalId}`);
    editButton.style.display = 'none';
    
    const deleteButton = document.getElementById(`delete-${rentalId}`);
    deleteButton.style.display = 'none';
}





function updateRental(rentalId){
    
    const form = document.getElementById(`edit-form-${rentalId}`);
    let inputs = form.querySelectorAll('input[name]');
    let selects = form.querySelectorAll('select[name]');
    let formData  = {};

    inputs.forEach(function(input) {
        formData [input.name] = input.value;
        input.removeAttribute('readonly');
    });
    selects.forEach(function(select) {
        formData[select.name] = select.value;
    });

    // Validaciones de campos
    for (let input of inputs) {
        // Validar si el campo es solo lectura y no debe ser editado
        if (input.hasAttribute('readonly')) continue;

        // Validar campos numéricos (rental.id, EOid, premises_id, warehouse_id, tenant_id, etc.)
        if (input.name === "id" || input.name === "EOid" || input.name === "premises_id" || input.name === "warehouse_id" || input.name === "tenant_id") {
            if (!validateField(input, input.name, 'integer')) {
                return; // Si la validación falla, detener la ejecución
            }
        }

        // Validar el campo de precio
        if (input.name === "price" && input.value !== "") {
            if (!validateField(input, "Precio", 'price')) {
                return; // Si la validación falla, detener la ejecución
            }
        }

        // Validar fechas
        if (input.name === "start_date" || input.name === "finish_date") {
            if (!validateField(input, input.name, 'date')) {
                return; // Si la validación falla, detener la ejecución
            }
        }

        // Validar el campo 'tenant_name' (Cliente) para asegurarse de que no esté vacío
        if (input.name === "tenant_name") {
            if (!validateField(input, "Cliente", 'text')) {
                return; // Si la validación falla, detener la ejecución
            }
        }
    }


    fetch(`/update_rental/${rentalId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            window.location.href = '/rentals';
        })
        .catch(error => {
            window.location.href = '/rentals';
        });

}



function deleteRental(rentalId) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta almacén?')) {
        return;
    }

    fetch(`/delete_rental/${rentalId}`, {
        method: 'POST'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error al eliminar almacén: ${response.status}`);
        }
        window.location.href = '/rentals';
    })
    .catch(error => {
        alert('Error al eliminar el alquiler');
    });
}

// ---------------------------------------------------------------------------------------------------- //
// ALMACENES //

let EOWName = [];
let EOWRole = [];
let TenantWName = [];
let WarehouseSize = ["menos de 5 m2", "entre 5 m2 y 10 m2", "mas de 10 m2"];
let WarehousePrice = ["menos de 5€", "entre 5€ y 10€", "mas de 10€"];
let WarehouseAvailability = [];

async function agregarAlmacenes() {
    try {
        const response = await fetch('/api-data');
        if (!response.ok) {
            throw new Error('No se pudo obtener la información del servidor');
        }
        
        const { encryptedData, key, iv } = await response.json();

        const data = await decryptData(encryptedData, key, iv);

        const role = data.role;
        
        if (role === 'administrator') {

            const titleContent = document.getElementById('warehouse-title');
            
            const titleDiv = document.createElement('h2');
            titleDiv.innerHTML = 'Almacenes';

            titleContent.appendChild(titleDiv);

            const navLink = document.getElementById('main-column');
            navLink.innerHTML = `          
                <a href="/home"><img src="/assets/LOGO-NEGRO.png" alt="Imagen de perfil"></a>
            `;
            
            const warehouseContent = document.getElementById('warehouse-mainDiv');
            const warehouses = data.warehouse;

            if (warehouses.length === 0) {
                warehouseContent.classList.add('main-p');

                const noWarehousesMessage = document.createElement('p');
                noWarehousesMessage.innerHTML = 'No hay almacenes disponibles';
                warehouseContent.appendChild(noWarehousesMessage);

                const createWarehouse = document.createElement('a');
                createWarehouse.classList.add('create-link');
                createWarehouse.href = '/create_warehouse'; 
                createWarehouse.textContent = 'Crear almacén';
    
                warehouseContent.appendChild(createWarehouse);

                const table_content = document.getElementById('table-container');
                table_content.style.display = 'none';

                const filters_button = document.getElementById('toggle-filters-btn');
                filters_button.style.display = 'none';

            } else {

                renderWarehouses(data, warehouses);

                const createDiv = document.createElement('div');
                createDiv.classList.add('create-div');
                createDiv.id = 'create-id';
                warehouseContent.appendChild(createDiv);

                const createinfo = document.getElementById('create-id');

                createinfo.innerHTML += `<a href="/create_warehouse" class="add-user" title="Crear almacén" ><i class="fas fa-warehouse"></i></a>`;

                const filtersContainer = document.getElementById('filters-container');
    
                filtersContainer.innerHTML += `
                    <div class="filters-container2" >
                        
                        <div class="div-filtro">
                            <label for="EOWName-filter">NOMBRE</label>
                            <select id="EOWName-filter" onchange="applyWarehouseFilters()">
                                <option value="">Todos</option>
                                ${generateEOWName(EOWName)}
                            </select>
                        </div>

                        <div class="div-filtro">
                            <label for="EOWRole-filter">ROL</label>
                            <select id="EOWRole-filter" onchange="applyWarehouseFilters()">
                                <option value="">Todos</option>
                                ${generateEOWRole(EOWRole)}
                            </select>
                        </div>

                        <div class="div-filtro">
                            <label for="TenantWName-filter">CLIENTE</label>
                            <select id="TenantWName-filter" onchange="applyWarehouseFilters()">
                                <option value="">Todos</option>
                                ${generateTenantWName(TenantWName)}
                            </select>
                        </div>

                        <div class="div-filtro">
                            <label for="WarehouseSize-filter">TAMAÑO</label>
                            <select id="WarehouseSize-filter" onchange="applyWarehouseFilters()">
                                <option value="">Todos</option>
                                ${generateWarehouseSize(WarehouseSize)}
                            </select>
                        </div>

                        <div class="div-filtro">
                            <label for="WarehousePrice-filter">PRECIO</label>
                            <select id="WarehousePrice-filter" onchange="applyWarehouseFilters()">
                                <option value="">Todos</option>
                                ${generateWarehousePrice(WarehousePrice)}
                            </select>
                        </div>

                        <div class="div-filtro">
                            <label for="WarehouseAvailability-filter">ESTADO</label>
                            <select id="WarehouseAvailability-filter" onchange="applyWarehouseFilters()">
                                <option value="">Todos</option>
                                ${generateWarehouseAvailability(WarehouseAvailability)}
                            </select>
                        </div>
                    </div>
                `;

                function generateEOWName(EOWName) {
                    return EOWName.map(owner => `<option value="${owner}">${owner}</option>`).join('');
                }

                function generateEOWRole(EOWRole) {
                    return EOWRole.map(user => `<option value="${user}">${user}</option>`).join('');
                }

                function generateTenantWName(TenantWName) {
                    return TenantWName
                        .map(tenant => tenant === '' ? 'Sin cliente' : tenant)
                        .map(tenant => {
                            const value = tenant === 'Sin cliente' ? 'null' : tenant;
                            return `<option value="${value}">${tenant}</option>`;
                        })
                        .join('');
                }
            
                function generateWarehouseSize(WarehouseSize) {
                    return WarehouseSize
                        .map(warehouse => warehouse === null ? 'Sin tamaño' : warehouse)
                        .map(warehouse => {
                            const value = warehouse === 'Sin tamaño' ? 'null' : warehouse;
                            return `<option value="${value}">${warehouse}</option>`;
                        })
                        .join('');
                }

                function generateWarehousePrice(WarehousePrice) {
                    return WarehousePrice
                        .map(warehouse => warehouse === null ? 'Sin precio' : warehouse)
                        .map(warehouse => {
                            const value = warehouse === 'Sin precio' ? 'null' : warehouse;
                            return `<option value="${value}">${warehouse}</option>`;
                        })
                        .join('');
                }

                function generateWarehouseAvailability(WarehouseAvailability) {
                    return WarehouseAvailability
                        .map(warehouse => warehouse === null ? 'No definido' : warehouse)
                        .map(warehouse => {
                            const value = warehouse === 'No definido' ? 'No definido' : warehouse;
                            return `<option value="${value}">${warehouse}</option>`;
                        })
                        .join('');
                }
            }  
        }
        else if (role === 'owner' ||role === 'enterprise') {

            const titleContent = document.getElementById('warehouse-title');
            
            const titleDiv = document.createElement('h2');
            titleDiv.innerHTML = 'Almacenes';
            titleContent.appendChild(titleDiv);

            const navLink = document.getElementById('main-column');
            navLink.classList.remove('nav-column');
            navLink.classList.add('nav-column-premises');
            navLink.innerHTML = `
                <a href="/home" class="nav-link">Inicio</a>
                <a href="/warehouses" class="nav-link">Listado de Almacenes</a>
                <a href="/rentals" class="nav-link">Alquileres</a>
                <a href="/cameras" class="nav-link">Cámaras</a>
                <a href="/invoices" class="nav-link">Facturación</a>
    
            `;
            
            const warehouseContent = document.getElementById('warehouse-mainDiv');
            const warehouses = data.warehouse;

            if (warehouses.length === 0) {
                warehouseContent.classList.add('main-p');

                const noWarehousesMessage = document.createElement('p');
                noWarehousesMessage.innerHTML = 'No hay almacenes disponibles';
                warehouseContent.appendChild(noWarehousesMessage);

                const createWarehouse = document.createElement('a');
                createWarehouse.classList.add('create-link');
                createWarehouse.href = '/create_warehouse'; 
                createWarehouse.textContent = 'Crear almacén';
    
                warehouseContent.appendChild(createWarehouse);

                const table_content = document.getElementById('table-container');
                table_content.style.display = 'none';

                const filters_button = document.getElementById('toggle-filters-btn');
                filters_button.style.display = 'none';

            } else {

                renderWarehouses2(data, warehouses);

                const createDiv = document.createElement('div');
                createDiv.classList.add('create-div');
                createDiv.id = 'create-id';
                warehouseContent.appendChild(createDiv);

                const actions = document.getElementById('actions');
                actions.remove();

                const filtersContainer = document.getElementById('filters-container');

                filtersContainer.innerHTML += `
                    <div class="filters-container2" >
                        
                        <div class="div-filtro">
                            <label for="EOWName-filter">NOMBRE</label>
                            <select id="EOWName-filter" onchange="applyWarehouseFilters()">
                                <option value="">Todos</option>
                                ${generateEOWName(EOWName)}
                            </select>
                        </div>

                        <div class="div-filtro">
                            <label for="EOWRole-filter">ROL</label>
                            <select id="EOWRole-filter" onchange="applyWarehouseFilters()">
                                <option value="">Todos</option>
                                ${generateEOWRole(EOWRole)}
                            </select>
                        </div>

                        <div class="div-filtro">
                            <label for="TenantWName-filter">CLIENTE</label>
                            <select id="TenantWName-filter" onchange="applyWarehouseFilters()">
                                <option value="">Todos</option>
                                ${generateTenantWName(TenantWName)}
                            </select>
                        </div>

                        <div class="div-filtro">
                            <label for="WarehouseSize-filter">TAMAÑO</label>
                            <select id="WarehouseSize-filter" onchange="applyWarehouseFilters()">
                                <option value="">Todos</option>
                                ${generateWarehouseSize(WarehouseSize)}
                            </select>
                        </div>

                        <div class="div-filtro">
                            <label for="WarehousePrice-filter">PRECIO</label>
                            <select id="WarehousePrice-filter" onchange="applyWarehouseFilters()">
                                <option value="">Todos</option>
                                ${generateWarehousePrice(WarehousePrice)}
                            </select>
                        </div>

                        <div class="div-filtro">
                            <label for="WarehouseAvailability-filter">ESTADO</label>
                            <select id="WarehouseAvailability-filter" onchange="applyWarehouseFilters()">
                                <option value="">Todos</option>
                                ${generateWarehouseAvailability(WarehouseAvailability)}
                            </select>
                        </div>
                    </div>
                `;
        
                function generateEOWName(EOWName) {
                    return EOWName.map(owner => `<option value="${owner}">${owner}</option>`).join('');
                }

                function generateEOWRole(EOWRole) {
                    return EOWRole.map(user => `<option value="${user}">${user}</option>`).join('');
                }

                function generateTenantWName(TenantWName) {
                    return TenantWName
                        .map(tenant => tenant === '' ? 'Sin cliente' : tenant)
                        .map(tenant => {
                            const value = tenant === 'Sin cliente' ? 'null' : tenant;
                            return `<option value="${value}">${tenant}</option>`;
                        })
                        .join('');
                }
            
                function generateWarehouseSize(WarehouseSize) {
                    return WarehouseSize
                        .map(warehouse => warehouse === null ? 'Sin tamaño' : warehouse)
                        .map(warehouse => {
                            const value = warehouse === 'Sin tamaño' ? 'null' : warehouse;
                            return `<option value="${value}">${warehouse}</option>`;
                        })
                        .join('');
                }

                function generateWarehousePrice(WarehousePrice) {
                    return WarehousePrice
                        .map(warehouse => warehouse === null ? 'Sin precio' : warehouse)
                        .map(warehouse => {
                            const value = warehouse === 'Sin precio' ? 'null' : warehouse;
                            return `<option value="${value}">${warehouse}</option>`;
                        })
                        .join('');
                }

                function generateWarehouseAvailability(WarehouseAvailability) {
                    return WarehouseAvailability
                        .map(warehouse => warehouse === null ? 'No definido' : warehouse)
                        .map(warehouse => {
                            const value = warehouse === 'No definido' ? 'No definido' : warehouse;
                            return `<option value="${value}">${warehouse}</option>`;
                        })
                        .join('');
                }
            }
        }
    } catch (error) {
        console.error('Error al agregar almacenes', error.message);
    }
}
         
function renderWarehouses(data, warehouses){

    const warehouseinfo = document.getElementById('Wdata-content');

    for (let i = 0; i < warehouses.length; i++) {
        const warehouse = warehouses[i];
        const owner_id = warehouse.owner_id;
        const enterprise_id = warehouse.enterprise_id;

        let EOname;
        let EOid;
        let role;
        let tenant_name = '';
        let tenantId = '';
                    
        if (owner_id === null) {
            if (data.enterprise.length > 0) {
                EOid = enterprise_id;
                for (let i = 0; i < data.enterprise.length; i++) {
                    if (data.enterprise[i].id === EOid) {
                        EOname = data.enterprise[i].name;
                        break;
                    }
                }
                role = 'enterprise';
            } else {
                EOid = owner_id;
                for (let i = 0; i < data.owner.length; i++) {
                    if (data.owner[i].id === EOid) {
                        EOname = data.owner[i].name;
                        break;
                    }
                }
                role = 'owner';
            }
        } else {
            if (data.owner.length > 0) {
                EOid = owner_id;
                for (let i = 0; i < data.owner.length; i++) {
                    if (data.owner[i].id === EOid) {
                        EOname = data.owner[i].name;
                        break;
                    }
                }
                role = 'owner';
            } else {
                EOid = enterprise_id;
                for (let i = 0; i < data.enterprise.length; i++) {
                    if (data.enterprise[i].id === EOid) {
                        EOname = data.enterprise[i].name;
                        break;
                    }
                }
                role = 'enterprise';
            }          
        }
      
        for (let j = 0; j < data.tenant.length; j++) {
            if (data.tenant[j].id === warehouse.tenant_id) {
                tenant_name = data.tenant[j].name;
                tenantId = data.tenant[j].id;
                break;
            }
        }

        
        if (!EOWName.includes(EOname)) {
            EOWName.push(EOname);
        }

        if (!EOWRole.includes(role)) {
            EOWRole.push(role);
        }

        if (!TenantWName.includes(tenant_name)) {
            TenantWName.push(tenant_name);
        }

        if (!WarehouseAvailability.includes(warehouse.availability)) {
            WarehouseAvailability.push(warehouse.availability);
        }

        warehouseinfo.innerHTML += `
            <tr id="edit-form-${warehouse.id}">
                <form id="edit-form-${warehouse.id}" class="edit_form">
                    <td data-label="Nº Almacén"><input name="id" type="text" value="${warehouse.id}" readonly></td>
                    <td data-label="Nº Local"><input name="premisesId" type="text" value="${warehouse.premises_id}" readonly></td>
                    <td data-label="Nº Titular"><input name="EOid" type="text" value="${EOid}" readonly></td>
                    <td data-label="Titular"><input name="EOname" type="text" value="${EOname}" readonly></td>
                    <td data-label="Rol"><input name="role" type="text"  value="${role}" readonly></td>
                    <td data-label="Nº Cliente"><input name="tenant_id" type="text" value="${tenantId}" readonly></td>
                    <td data-label="Cliente"><input name="tenantName" type="text" value="${tenant_name}" readonly></td>
                    <td data-label="Nombre"><input name="name" type="text" value="${warehouse.name}" autocomplete="name" readonly></td>
                    <td data-label="Tamaño"><input name="size" type="text" value="${warehouse.size}" readonly></td>
                    <td data-label="Precio Alquiler"><input name="rental_price" type="text" value="${warehouse.rental_price}" readonly></td>
                    <td data-label="Disponibilidad"><input name="availability" type="text" value="${warehouse.availability}" readonly></td>
                    <td data-label="Acciones">
                        <a href="#" id="edit-${warehouse.id}" class="edit-link" title="Editar Almacén" onclick="editWarehouse(${warehouse.id})"><i class="icon fas fa-edit"></i></a>
                        <a id="delete-${warehouse.id}" class="delete-link" title="Eliminar Almacén" onclick="deleteWarehouse(${warehouse.id})"><i class="icon fas fa-trash-alt"></i></a>
                        <button type="submit" class="save-button" id="save-button-${warehouse.id}" onclick="updateWarehouse(${warehouse.id})" style="display:none;">Guardar</button>
                    </td>
                </form>
            </tr>
            `;             
    }
}

function renderWarehouses2(data, warehouses){

    const warehouseinfo = document.getElementById('Wdata-content');

    for (let i = 0; i < warehouses.length; i++) {
        const warehouse = warehouses[i];
        const owner_id = warehouse.owner_id;
        const enterprise_id = warehouse.enterprise_id;

        let EOname;
        let EOid;
        let role;
        let tenant_name = '';
        let tenantId = '';
                    
        if (owner_id === null) {
            if (data.enterprise.length > 0) {
                EOid = enterprise_id;
                for (let i = 0; i < data.enterprise.length; i++) {
                    if (data.enterprise[i].id === EOid) {
                        EOname = data.enterprise[i].name;
                        break;
                    }
                }
                role = 'enterprise';
            } else {
                EOid = owner_id;
                for (let i = 0; i < data.owner.length; i++) {
                    if (data.owner[i].id === EOid) {
                        EOname = data.owner[i].name;
                        break;
                    }
                }
                role = 'owner';
            }
        } else {
            if (data.owner.length > 0) {
                EOid = owner_id;
                for (let i = 0; i < data.owner.length; i++) {
                    if (data.owner[i].id === EOid) {
                        EOname = data.owner[i].name;
                        break;
                    }
                }
                role = 'owner';
            } else {
                EOid = enterprise_id;
                for (let i = 0; i < data.enterprise.length; i++) {
                    if (data.enterprise[i].id === EOid) {
                        EOname = data.enterprise[i].name;
                        break;
                    }
                }
                role = 'enterprise';
            }          
        }
      
        for (let j = 0; j < data.tenant.length; j++) {
            if (data.tenant[j].id === warehouse.tenant_id) {
                tenant_name = data.tenant[j].name;
                tenantId = data.tenant[j].id;
                break;
            }
        }

        
        if (!EOWName.includes(EOname)) {
            EOWName.push(EOname);
        }

        if (!EOWRole.includes(role)) {
            EOWRole.push(role);
        }

        if (!TenantWName.includes(tenant_name)) {
            TenantWName.push(tenant_name);
        }

        if (!WarehouseAvailability.includes(warehouse.availability)) {
            WarehouseAvailability.push(warehouse.availability);
        }

        warehouseinfo.innerHTML += `
            <tr id="edit-form-${warehouse.id}">
                <form id="edit-form-${warehouse.id}" class="edit_form">
                    <td data-label="Nº Almacén"><input name="id" type="text" value="${warehouse.id}" readonly></td>
                    <td data-label="Nº Local"><input name="premisesId" type="text" value="${warehouse.premises_id}" readonly></td>
                    <td data-label="Nº Titular"><input name="EOid" type="text" value="${EOid}" readonly></td>
                    <td data-label="Titular"><input name="EOname" type="text" value="${EOname}" readonly></td>
                    <td data-label="Rol"><input name="role" type="text"  value="${role}" readonly></td>
                    <td data-label="Nº Cliente"><input name="tenant_id" type="text" value="${tenantId}" readonly></td>
                    <td data-label="Cliente"><input name="tenantName" type="text" value="${tenant_name}" readonly></td>
                    <td data-label="Nombre"><input name="name" type="text" value="${warehouse.name}" autocomplete="name" readonly></td>
                    <td data-label="Tamaño"><input name="size" type="text" value="${warehouse.size}" readonly></td>
                    <td data-label="Precio Alquiler"><input name="rental_price" type="text" value="${warehouse.rental_price}" readonly></td>
                    <td data-label="Disponibilidad"><input name="availability" type="text" value="${warehouse.availability}" readonly></td>
                </form>
            </tr>
            `;             
    }
}

async function applyWarehouseFilters() {

    const EOWNameFilter = document.getElementById('EOWName-filter').value;
    const EOWRoleFilter = document.getElementById('EOWRole-filter').value;
    const TenantWNameFilter = document.getElementById('TenantWName-filter').value;
    const WarehouseSizeFilter = document.getElementById('WarehouseSize-filter').value;
    const WarehousePriceFilter = document.getElementById('WarehousePrice-filter').value;
    const WarehouseAvailabilityFilter = document.getElementById('WarehouseAvailability-filter').value;

    try {
        const response = await fetch('/api-data');
        if (!response.ok) {
            throw new Error('No se pudo obtener la información del servidor');
        }

        const { encryptedData, key, iv } = await response.json();

        const data = await decryptData(encryptedData, key, iv);

        const tenants = data.tenant;
        const warehouses = data.warehouse;
        const owners = data.owner;
        const enterprises = data.enterprise;

        let filteredWarehouses = warehouses;

        // Filtrar por NOMBRE PROPIETARIO
        if (EOWNameFilter) {
            const filteredEOWNameId = owners.find(owner => owner.name == EOWNameFilter)?.id || enterprises.find(enterprise => enterprise.name == EOWNameFilter)?.id;

            if (filteredEOWNameId) {
                filteredWarehouses = filteredWarehouses.filter(warehouse => warehouse.owner_id == filteredEOWNameId || warehouse.enterprise_id == filteredEOWNameId);
            } else {
                filteredWarehouses = [];
            }
        }

        // Filtrar por ROL
        if (EOWRoleFilter) {

            if (EOWRoleFilter === 'owner'){
                
                const filteredEOWRoleId = owners.find(owner => owner.role = EOWRoleFilter)?.id;
                
                if (filteredEOWRoleId) {
                    filteredWarehouses = filteredWarehouses.filter(warehouse => filteredEOWRoleId.includes(warehouse.owner_id));
                } else {
                    filteredWarehouses = [];
                }
            }
            else {
                const filteredEOWRoleId = enterprises.find(enterprise => enterprise.role = EOWRoleFilter)?.id;
                if (filteredEOWRoleId) {
                    
                    filteredWarehouses = filteredWarehouses.filter(warehouse => filteredEOWRoleId.includes(warehouse.enterprise_id));
                } else {
                    filteredWarehouses = [];
                }

            }
        
        }

        // Filtrar por NOMBRE DE CLIENTE
        if (TenantWNameFilter) {
            if (TenantWNameFilter === "null") {
                filteredWarehouses = filteredWarehouses.filter(warehouse => !warehouse.tenant_id);
            } else {
                const filteredTenantWNameId = tenants.find(tenant => tenant.name === TenantWNameFilter)?.id;

                if (filteredTenantWNameId) {
                    filteredWarehouses = filteredWarehouses.filter(warehouse => warehouse.tenant_id === filteredTenantWNameId);
                } else {

                    filteredWarehouses = [];
                }
            }
        }

        // Filtrar por TAMAÑO
        if (WarehouseSizeFilter) {
            if (WarehouseSizeFilter === "null") {
                // Filtrar almacenes que no tengan precio definido
                filteredWarehouses = filteredWarehouses.filter(warehouse => !warehouse.size);
            } else {
                filteredWarehouses = filteredWarehouses.filter(warehouse => {
                    const size = warehouse.size;

                    if (WarehouseSizeFilter === "menos de 5 m2") {
                        return size < 5;
                    } else if (WarehouseSizeFilter === "entre 5 m2 y 10 m2") {
                        return size >= 5 && price <= 10;
                    } else if (WarehouseSizeFilter === "mas de 10 m2") {
                        return size > 10;
                    }

                    return false; // Si no coincide con ningún filtro
                });
            }
        }

        // Filtrar por PRECIO
        if (WarehousePriceFilter) {
            if (WarehousePriceFilter === "null") {
                // Filtrar almacenes que no tengan precio definido
                filteredWarehouses = filteredWarehouses.filter(warehouse => !warehouse.rental_price);
            } else {
                filteredWarehouses = filteredWarehouses.filter(warehouse => {
                    const price = warehouse.rental_price;

                    if (WarehousePriceFilter === "menos de 5€") {
                        return price < 5;
                    } else if (WarehousePriceFilter === "entre 5€ y 10€") {
                        return price >= 5 && price <= 10;
                    } else if (WarehousePriceFilter === "mas de 10€") {
                        return price > 10;
                    }

                    return false; // Si no coincide con ningún filtro
                });
            }
        }


        // Filtrar por DISPONIBILIDAD
        if (WarehouseAvailabilityFilter) {
            if (WarehouseAvailabilityFilter === "null") {
                filteredWarehouses = filteredWarehouses.filter(warehouse => !warehouse.availability);
            } else {
                const filteredWarehouseAvailabilityId = warehouses.find(warehouse => warehouse.availability == WarehouseAvailabilityFilter)?.id;

                if (filteredWarehouseAvailabilityId) {
                    filteredWarehouses = filteredWarehouses.filter(warehouse => warehouse.availability == WarehouseAvailabilityFilter);
    
                } else {
                    filteredWarehouses = [];
                }
            }
        }

        // Si no hay resultados, mostrar mensaje
        if (filteredWarehouses.length === 0) {
            const warehouseinfo = document.getElementById('Wdata-content');
            warehouseinfo.innerHTML = '<p>No se encontraron resultados para los filtros aplicados.</p>';
            return;
        }

        const warehouseinfo = document.getElementById('Wdata-content');
        warehouseinfo.innerHTML = '';

        renderWarehouses(data, filteredWarehouses);

    } catch (error) {
        console.error("Error al aplicar los filtros:", error);
    }
}

function editWarehouse(warehouseId) {
    const form = document.getElementById(`edit-form-${warehouseId}`);

    let inputs = form.querySelectorAll('input[name]');

    let listaInputs = [];

    inputs.forEach(function(input) {
        if (input.name === 'availability') {
            // Guardar el valor actual del input antes de reemplazarlo
            const currentValue = input.value;

            const select = document.createElement('select');
            select.name = 'availability';
            select.className = 'select';

            select.innerHTML = `
              <option class="option-disabled" disabled>Elige una opción</option>
              <option class="option" value="Alquilado">Alquilado</option>
              <option class="option" value="No alquilado">No alquilado</option>
            `;

            // Establecer el valor actual como seleccionado
            Array.from(select.options).forEach(option => {
                if (option.value === currentValue) {
                    option.selected = true;
                }
            });

            input.parentNode.replaceChild(select, input);
        } else {
            listaInputs.push(input);
            input.removeAttribute('readonly');
        }
    });

    // Mostrar el botón de guardar y ocultar el de editar y eliminar
    const saveButton = document.getElementById(`save-button-${warehouseId}`);
    saveButton.style.display = 'inline-block';
    
    const editButton = document.getElementById(`edit-${warehouseId}`);
    editButton.style.display = 'none';
    
    const deleteButton = document.getElementById(`delete-${warehouseId}`);
    deleteButton.style.display = 'none';
}


function updateWarehouse(warehouseId) {
    const form = document.getElementById(`edit-form-${warehouseId}`);

    let inputs = form.querySelectorAll('input[name]');
    let selects = form.querySelectorAll('select[name]');
    let formData = {};

    inputs.forEach(function(input) {
        formData[input.name] = input.value;
    });

    selects.forEach(function(select) {
        formData[select.name] = select.value;
    });

    // Validaciones de campos
    for (let input of inputs) {
        // Validar si el campo es solo lectura y no debe ser editado
        if (input.hasAttribute('readonly')) continue;

        // Validar campos numéricos (rental.id, EOid, premises_id, warehouse_id, tenant_id, etc.)
        if (input.name === "id" || input.name === "premisesId" || input.name === "EOid" || input.name === "owner_id" || input.name === "tenant_id") {
            if (!validateField(input, input.name, 'integer')) {
                return; // Si la validación falla, detener la ejecución
            }
        }

        // Validar el campo de precio
        if (input.name === "rental_price" && input.value !== "") {
            if (!validateField(input, "Precio", 'price')) {
                return; // Si la validación falla, detener la ejecución
            }
        }

        // Validar tamaño
        if (input.name === "size") {
            if (!validateField(input, input.name, 'size')) {
                return;
            }
        }

        // Validar el campo 'tenant_name' (Cliente) para asegurarse de que no esté vacío
        if (input.name === "name" || input.name === "EOname") {
            if (!validateField(input, input.name, 'text')) {
                return; // Si la validación falla, detener la ejecución
            }
        }

    }

    fetch(`/update_warehouse/${warehouseId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            window.location.href = '/warehouses';
        })
        .catch(error => {
            window.location.href = '/warehouses';
        });
}


function deleteWarehouse(warehouseId) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta almacén?')) {
        return;
    }

    fetch(`/delete_warehouse/${warehouseId}`, {
        method: 'POST'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error al eliminar almacén: ${response.status}`);
        }
        window.location.href = '/warehouses';
    })
    .catch(error => {
        alert('Error al eliminar almacén');
    });
}

// ---------------------------------------------------------------------------------------------------- //
// CLIENTES //

let TenantName = [];
let TenantLastname = [];

async function agregarClientes() {
    try {
        const response = await fetch('/api-data');
        if (!response.ok) {
            throw new Error('No se pudo obtener la información del servidor');
        }
        
        const { encryptedData, key, iv } = await response.json();

        const data = await decryptData(encryptedData, key, iv);

        const role = data.role;
        
        if (role === 'administrator') {

            const titleContent = document.getElementById('tenant-title');
            
            const titleDiv = document.createElement('h2');
            titleDiv.innerHTML = 'Clientes';

            titleContent.appendChild(titleDiv);

            const navLink = document.getElementById('main-column');
            navLink.innerHTML = `          
                <a href="/home"><img src="/assets/LOGO-NEGRO.png" alt="Imagen de perfil"></a>
            `;

            const tenantContent = document.getElementById('tenant-mainDiv');
            const tenants = data.tenant;

            if (tenants.length === 0) {

                tenantContent.classList.add('main-p');

                const noTenantMessage = document.createElement('p');
                noTenantMessage.innerHTML = 'No hay clientes disponibles';
                tenantContent.appendChild(noTenantMessage);

                const createTenant = document.createElement('a');
                createTenant.classList.add('create-link');
                createTenant.href = '/create_tenant'; 
                createTenant.textContent = 'Crear cliente';
    
                tenantContent.appendChild(createTenant);

                const table_content = document.getElementById('table-container');
                table_content.style.display = 'none';

                const filters_button = document.getElementById('toggle-filters-btn');
                filters_button.style.display = 'none';

            } else {

                renderTenants(tenants);

                const createDivT = document.createElement('div');
                createDivT.classList.add('create-div');
                createDivT.id = 'createT-id';
                tenantContent.appendChild(createDivT);

                const createinfo = document.getElementById('createT-id');

                createinfo.innerHTML += `<a href="/create_tenant" class="add-user" title="Crear cliente" ><i class="fas fa-user-plus" ></i></a>`;

                const filtersTContainer = document.getElementById('filters-container');

                filtersTContainer.innerHTML += `
                    <div class="filters-container2" >

                        <div class="div-filtro">
                            <label for="TenantName-filter">NOMBRE</label>
                            <select id="TenantName-filter" onchange="applyTenantFilters()">
                                <option value="">Todos</option>
                                ${generateTenantName(TenantName)}
                            </select>
                        </div>
        
                        <div class="div-filtro">
                            <label for="TenantLastname-filter">APELLIDOS</label>
                            <select id="TenantLastname-filter" onchange="applyTenantFilters()">
                                <option value="">Todos</option>
                                ${generateTenantLastname(TenantLastname)}
                            </select>
                        </div>

                    </div>

                `;

                function generateTenantName(TenantName) {
                    return TenantName.map(tenant => `<option value="${tenant}">${tenant}</option>`).join('');
                }

                function generateTenantLastname(TenantLastname) {
                    return TenantLastname.map(tenant => `<option value="${tenant}">${tenant}</option>`).join('');
                }  
            }
        }
           
    } catch (error) {
        console.error('Error al agregar clientes', error.message);
    }
}

function renderTenants (tenants){

    const tenantinfo = document.getElementById('Tdata-content');

    for (let i = 0; i < tenants.length; i++) {
        const tenant = tenants[i];

        const maskSensitiveData = (value) => {
            if (!value) return '';
            return '•'.repeat(value.length);
        };

       
        if (!TenantName.includes(tenant.name)) {
            TenantName.push(tenant.name);
        }

        if (!TenantLastname.includes(tenant.lastname)) {
            TenantLastname.push(tenant.lastname);
        }

        tenantinfo.innerHTML += `
        <tr id="edit-form-${tenant.id}">
            <form id="edit-form-${tenant.id}" class="edit_form">
                <td data-label="Nº Cliente"><input name="id" type="text" value="${tenant.id}" readonly></td>
                <td data-label="Nº Empresa"><input name="enterprise_id" type="text" value="${tenant.enterprise_id}" readonly></td>
                <td data-label="Nº Propietario"><input name="owner_id" type="text" value="${tenant.owner_id}" readonly></td>
                <td data-label="Nombre"><input name="name" type="text" value="${tenant.name}" readonly></td>
                <td data-label="Apellido"><input name="lastname" type="text" value="${tenant.lastname}" readonly></td>
                <td data-label="Email"><input name="email" type="text" value="${tenant.email}" readonly></td>
                <td data-label="DNI"><input name="dni" type="text" value="${maskSensitiveData(tenant.dni)}" data-real-value="${tenant.dni}" data-real-value="${tenant.dni}" readonly class="sensitive-field"></td>
                <td data-label="Teléfono"><input name="phone_number" type="text" value="${maskSensitiveData(tenant.phone_number)}" data-real-value="${tenant.phone_number}" readonly class="sensitive-field"></td>
                <td data-label="Cuenta Bancaria"><input name="bank_account" type="text" value="${maskSensitiveData(tenant.bank_account)}" data-real-value="${tenant.bank_account}" readonly class="sensitive-field"></td>
                <td data-label="Acciones">
                    <a href="#" id="edit-${tenant.id}" class="edit-link" title="Editar Cliente" onclick="editTenant(${tenant.id})"><i class="icon fas fa-edit"></i></a>
                    <a id="delete-${tenant.id}" class="delete-link" title="Eliminar Cliente" onclick="deleteTenant(${tenant.id})"><i class="icon fas fa-trash-alt"></i></a>
                    <button type="submit" class="save-button" id="save-button-${tenant.id}" onclick="updateTenant(${tenant.id})" style="display:none;">Guardar</button>
                </td>
            </form>
        </tr>
        `;
    }
}

async function applyTenantFilters() {

    const TenantNameFilter = document.getElementById('TenantName-filter').value;
    const TenantLastnameFilter = document.getElementById('TenantLastname-filter').value;
  
    try {
        const response = await fetch('/api-data');
        if (!response.ok) {
            throw new Error('No se pudo obtener la información del servidor');
        }
  
        const { encryptedData, key, iv } = await response.json();
  
        const data = await decryptData(encryptedData, key, iv);
  
        const tenants = data.tenant;
  
        let filteredTenants = tenants;
  
        // Filtrar por NOMBRE CLIENTE
        if (TenantNameFilter) {
            const filteredTenantId = tenants.find(tenant => tenant.name == TenantNameFilter)?.id; // son 2 == porque tenantIDFilter es un string

            if (filteredTenantId) {
                filteredTenants = filteredTenants.filter(tenant => tenant.name == TenantNameFilter);
            } else {
                filteredTenants = [];
            }
            
        }

        // Filtrar por APELLIDO CLIENTE
        if (TenantLastnameFilter) {
            const filteredTenantId = tenants.find(tenant => tenant.lastname == TenantLastnameFilter)?.id; // son 2 == porque tenantIDFilter es un string

            if (filteredTenantId) {
                filteredTenants = filteredTenants.filter(tenant => tenant.lastname == TenantLastnameFilter);
            } else {
                filteredTenants = [];
            }
            
        }
  
        // Si no hay resultados, mostrar mensaje
        if (filteredTenants.length === 0) {
            const tenantinfo = document.getElementById('Tdata-content');
            tenantinfo.innerHTML = '<p>No se encontraron resultados para los filtros aplicados.</p>';
            return;
        }
  
        const tenantinfo = document.getElementById('Tdata-content');
        tenantinfo.innerHTML = '';
  
        renderTenants(filteredTenants);
  
    } catch (error) {
        console.error("Error al aplicar los filtros:", error);
    }
  }

function editTenant(tenantId) {
    const form = document.getElementById(`edit-form-${tenantId}`);

    let inputs = form.querySelectorAll('input[name]');

    let listaInputs = [];

    inputs.forEach(function(input) {
        listaInputs.push(input);
        input.removeAttribute('readonly');
    });


    inputs.forEach(input => {
        if (input.value === 'null') {
            input.value = '';
        }
        if (input.classList.contains('sensitive-field')) {
            // Para campos sensibles, mostrar el valor real
            input.value = input.getAttribute('data-real-value');
        }
        input.readOnly = false;
    });

    // Mostrar el botón de guardar y ocultar el de editar y eliminar
    const saveButton = document.getElementById(`save-button-${tenantId}`);
    saveButton.style.display = 'inline-block';
    
    const editButton = document.getElementById(`edit-${tenantId}`);
    editButton.style.display = 'none';
    
    const deleteButton = document.getElementById(`delete-${tenantId}`);
    deleteButton.style.display = 'none';
}


function updateTenant(tenantId){
    
    const form = document.getElementById(`edit-form-${tenantId}`);
    let inputs = form.querySelectorAll('input[name]');
    let formData  = {};

    inputs.forEach(function(input) {
        formData [input.name] = input.value;
        input.removeAttribute('readonly');
    });

    // Validaciones de campos
    for (let input of inputs) {
        // Validar si el campo es solo lectura y no debe ser editado
        if (input.hasAttribute('readonly')) continue;

        // Validar campos numéricos (id, enterprise_id, owner_id, etc.)
        if (input.name === "id") {
            if (!validateField(input, input.name, 'integer')) {
                return; // Si la validación falla, detener la ejecución
            }
        }

        // Permitir que enterprise_id y owner_id sean nulos o vacíos, pero si tienen valor, deben ser números
        if (input.name === "enterprise_id" || input.name === "owner_id") {
            if (input.value !== "" && !validateField(input, input.name, 'integer')) {
                return; // Si la validación falla y el campo no está vacío, detener la ejecución
            }
        }

        // Validar fechas
        if (input.name === "email" && input.value !== "") {
            if (!validateField(input, "Correo electrónico", 'email')) {
                return; // Si la validación falla, detener la ejecución
            }
        }

        // Validar el campo de telefono
        if (input.name === "phone_number" && input.value !== "") {
            if (!validateField(input, "Telefono", 'phone')) {
                return; // Si la validación falla, detener la ejecución
            }
        }

        // Validar el campo de DNI
        if (input.name === "dni" && input.value !== "") {
            if (!validateField(input, "DNI", 'dni')) {
                return; 
            }
        }

        // Validar el campo de IBAN
        if (input.name === "bank_account" && input.value !== "") {
            if (!validateField(input, "Cuenta Bancaria", 'iban')) {
                return; 
            }
        }
        

        // Validar el campo 'tenant_name' (Cliente) para asegurarse de que no esté vacío
        if (input.name === "name" || input.name === "lastname") {
            if (!validateField(input, input.name, 'text')) {
                return; // Si la validación falla, detener la ejecución
            }
        }

    }

    fetch(`/update_tenant/${tenantId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            window.location.href = '/tenants';
            
        })
        .catch(error => {
            window.location.href = '/tenants';
        });
}

function deleteTenant(tenantId) {
    if (!confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
        return;
    }

    fetch(`/delete_tenant/${tenantId}`, {
        method: 'POST'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error al eliminar cliente: ${response.status}`);
        }
        window.location.href = '/tenants';
        showNotification('Cliente eliminado correctamente', 'success');
    })
    .catch(error => {
        window.location.href = '/tenants';
        alert('Error al eliminar al cliente');
    });
}




// ---------------------------------------------------------------------------------------------------- //
// EMPRESAS //

let EnterpriseName = [];
let EnterpriseAdress = [];

async function agregarEmpresas() {
    try {
        const response = await fetch('/api-data');
        if (!response.ok) {
            throw new Error('No se pudo obtener la información del servidor');
        }
        
        const { encryptedData, key, iv } = await response.json();

        const data = await decryptData(encryptedData, key, iv);

        const role = data.role;
  
        if (role === 'administrator') {

            const titleContent = document.getElementById('enterprise-title');
            
            const titleDiv = document.createElement('h2');
            titleDiv.innerHTML = 'Empresas';

            titleContent.appendChild(titleDiv);
            
            const enterpriseContent = document.getElementById('enterprise-mainDiv');
            
            const enterprises = data.enterprise; 

            if (enterprises.length === 0) {

                enterpriseContent.classList.add('main-p');
                
                const noEnterprisesMessage = document.createElement('p');
                noEnterprisesMessage.innerHTML = 'No hay empresas registradas';
                enterpriseContent.appendChild(noEnterprisesMessage);

                const createEnterprise = document.createElement('a');
                createEnterprise.classList.add('create-link');
                createEnterprise.href = '/enterprise_register'; 
                createEnterprise.textContent = 'Crear empresa';
    
                enterpriseContent.appendChild(createEnterprise);

                const table_content = document.getElementById('table-container');
                table_content.style.display = 'none';

                const filters_button = document.getElementById('toggle-filters-btn');
                filters_button.style.display = 'none';

            } else {

                renderEnterprise(enterprises);

                
                const createDivE = document.createElement('div');
                createDivE.classList.add('create-div');
                createDivE.id = 'createE-id';
                enterpriseContent.appendChild(createDivE);

                const createinfo = document.getElementById('createE-id');

                createinfo.innerHTML += `<a href="/enterprise_register" class="add-user" title="Crear empresa" ><i class="fa-solid fa-building"></i></a>`;
                
                const filtersEContainer = document.getElementById('filters-container');

                filtersEContainer.innerHTML += `
                    <div class="filters-container2" >

                        <div class="div-filtro">
                            <label for="EnterpriseName-filter">NOMBRE</label>
                            <select id="EnterpriseName-filter" onchange="applyEnterpriseFilters()">
                                <option value="">Todos</option>
                                ${generateEnterpriseName(EnterpriseName)}
                            </select>
                        </div>
        
                        <div class="div-filtro">
                            <label for="EnterpriseAdress-filter">DIRECCIÓN</label>
                            <select id="EnterpriseAdress-filter" onchange="applyEnterpriseFilters()">
                                <option value="">Todos</option>
                                ${generateEnterpriseAdress(EnterpriseAdress)}
                            </select>
                        </div>

                    </div>

                `;

                function generateEnterpriseName(EnterpriseName) {
                    return EnterpriseName.map(enterprise => `<option value="${enterprise}">${enterprise}</option>`).join('');
                }

                function generateEnterpriseAdress(EnterpriseAdress) {
                    return EnterpriseAdress.map(enterprise => `<option value="${enterprise}">${enterprise}</option>`).join('');
                }
            }
        }
    } catch (error) {
        console.error('Error al agregar empresas', error.message);
    }
}


function renderEnterprise(enterprises){

    const enterpriseinfo = document.getElementById('Edata-content');

    for (let i = 0; i < enterprises.length; i++) {
        const enterprise = enterprises[i];

        const maskSensitiveData = (value) => {
            if (!value) return '';
            return '•'.repeat(value.length);
        };

       
        if (!EnterpriseName.includes(enterprise.name)) {
            EnterpriseName.push(enterprise.name);
        }

        if (!EnterpriseAdress.includes(enterprise.address)) {
            EnterpriseAdress.push(enterprise.address);
        }

        enterpriseinfo.innerHTML += `
        <tr id="edit-form-${enterprise.id}">
            <form id="edit-form-${enterprise.id}" class="edit_form">
                <td data-label="Nº"><input name="id" type="text" value="${enterprise.id}" readonly></td>
                <td data-label="Nombre"><input name="name" type="text" value="${enterprise.name}" readonly></td>
                <td data-label="Dirección"><input name="address" type="text" value="${enterprise.address}" readonly></td>
                <td data-label="Usuario"><input name="username" type="text" value="${enterprise.username}" readonly></td>
                <td data-label="Email"><input name="email" type="text" value="${enterprise.email}" readonly></td>
                <td data-label="CIF"><input name="cif" type="text" value="${maskSensitiveData(enterprise.cif)}" data-real-value="${enterprise.cif}" readonly class="sensitive-field" ></td>
                <td data-label="Teléfono"><input name="phone_number" type="text" value="${maskSensitiveData(enterprise.phone_number)}" data-real-value="${enterprise.phone_number}" readonly class="sensitive-field"></td>
                <td data-label="Cuenta Bancaria"><input name="bank_account" type="text" value="${maskSensitiveData(enterprise.bank_account)}" data-real-value="${enterprise.bank_account}" readonly class="sensitive-field"></td>
                <td data-label="Acciones">
                    <a href="#" id="edit-${enterprise.id}" class="edit-link" title="Editar Empresa" onclick="editEnterprise(${enterprise.id})"><i class="icon fas fa-edit"></i></a>
                    <a id="delete-${enterprise.id}" class="delete-link" title="Eliminar Empresa" onclick="deleteEnterprise(${enterprise.id})"><i class="icon fas fa-trash-alt"></i></a>
                    <button type="submit" class="save-button" id="save-button-${enterprise.id}" onclick="updateEnterprise(${enterprise.id})" style="display:none;">Guardar</button>
                </td>
            </form>
        </tr>
        `;
    }
}

async function applyEnterpriseFilters() {

    const EnterpriseNameFilter = document.getElementById('EnterpriseName-filter').value;
    const EnterpriseAdressFilter = document.getElementById('EnterpriseAdress-filter').value;
  
    try {
        const response = await fetch('/api-data');
        if (!response.ok) {
            throw new Error('No se pudo obtener la información del servidor');
        }
  
        const { encryptedData, key, iv } = await response.json();
  
        const data = await decryptData(encryptedData, key, iv);
  
        const enterprises = data.enterprise;
  
        let filteredEnterprises = enterprises;
  

        // Filtrar por NOMBRE EMPRESA
        if (EnterpriseNameFilter) {
            const filteredEnterpriseId = enterprises.find(enterprise => enterprise.name == EnterpriseNameFilter)?.id; // son 2 == porque tenantIDFilter es un string

            if (filteredEnterpriseId) {
                filteredEnterprises = filteredEnterprises.filter(enterprise => enterprise.name == EnterpriseNameFilter);
            } else {
                filteredEnterprises = [];
            } 
        }

        // Filtrar por DIRECCIÓN
        if (EnterpriseAdressFilter) {
            const filteredEnterpriseId = enterprises.find(enterprise => enterprise.address == EnterpriseAdressFilter)?.id; // son 2 == porque tenantIDFilter es un string

            if (filteredEnterpriseId) {
                filteredEnterprises = filteredEnterprises.filter(enterprise => enterprise.address == EnterpriseAdressFilter);
            } else {
                filteredEnterprises = [];
            }
            
        }
  
        // Si no hay resultados, mostrar mensaje
        if (filteredEnterprises.length === 0) {
            const enterpriseinfo = document.getElementById('Edata-content');
            enterpriseinfo.innerHTML = '<p>No se encontraron resultados para los filtros aplicados.</p>';
            return;
        }
  
        const enterpriseinfo = document.getElementById('Edata-content');
        enterpriseinfo.innerHTML = '';
  
        renderEnterprise(filteredEnterprises);
  
    } catch (error) {
        console.error("Error al aplicar los filtros:", error);
    }
}

function editEnterprise(enterpriseId) {
    const form = document.getElementById(`edit-form-${enterpriseId}`);

    let inputs = form.querySelectorAll('input[name]');

    let listaInputs = [];

    inputs.forEach(function(input) {
        listaInputs.push(input);
        input.removeAttribute('readonly');
    });


    inputs.forEach(input => {
        if (input.classList.contains('sensitive-field')) {
            // Para campos sensibles, mostrar el valor real
            input.value = input.getAttribute('data-real-value');
        }
        input.readOnly = false;
    });

    // Validaciones de campos
    for (let input of inputs) {
        // Validar si el campo es solo lectura y no debe ser editado
        if (input.hasAttribute('readonly')) continue;

        // Validar campos numéricos (rental.id, EOid, premises_id, warehouse_id, tenant_id, etc.)
        if (input.name === "id" || input.name === "enterprise_id" || input.name === "owner_id" ) {
            if (!validateField(input, input.name, 'integer')) {
                return; // Si la validación falla, detener la ejecución
            }
        }

        // Validar fechas
        if (input.name === "email" && input.value !== "") {
            if (!validateField(input, "Correo electrónico", 'email')) {
                return; // Si la validación falla, detener la ejecución
            }
        }

        // Validar el campo de telefono
        if (input.name === "phone_number" && input.value !== "") {
            if (!validateField(input, "Telefono", 'phone')) {
                return; // Si la validación falla, detener la ejecución
            }
        }

        // Validar el campo de DNI
        if (input.name === "cif" && input.value !== "") {
            if (!validateField(input, "CIF", 'cif')) {
                return; 
            }
        }

        // Validar el campo de IBAN
        if (input.name === "bank_account" && input.value !== "") {
            if (!validateField(input, "Cuenta Bancaria", 'iban')) {
                return; 
            }
        }
        

        // Validar el campo 'tenant_name' (Cliente) para asegurarse de que no esté vacío
        if (input.name === "name" || input.name === "address" || input.name === "username") {
            if (!validateField(input, input.name, 'text')) {
                return; // Si la validación falla, detener la ejecución
            }
        }

    }

    // Mostrar el botón de guardar y ocultar el de editar y eliminar
    const saveButton = document.getElementById(`save-button-${enterpriseId}`);
    saveButton.style.display = 'inline-block';
    
    const editButton = document.getElementById(`edit-${enterpriseId}`);
    editButton.style.display = 'none';
    
    const deleteButton = document.getElementById(`delete-${enterpriseId}`);
    deleteButton.style.display = 'none';
}


function updateEnterprise(enterpriseId){
    
    const form = document.getElementById(`edit-form-${enterpriseId}`);
    let inputs = form.querySelectorAll('input[name]');
    let formData  = {};

    inputs.forEach(function(input) {
        formData [input.name] = input.value;
        input.removeAttribute('readonly');
    });

    fetch(`/update_enterprise/${enterpriseId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            window.location.href = '/enterprises';
        })
        .catch(error => {
            window.location.href = '/enterprises';
        });
}

function deleteEnterprise(enterpriseId) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta empresa?')) {
        return; // Si el usuario cancela, no hacer nada
    }

    fetch(`/delete_enterprise/${enterpriseId}`, {
        method: 'POST'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error al eliminar propietario: ${response.status}`);
        }
        window.location.href = '/enterprises';
    })
    .catch(error => {
        alert('Error al eliminar propietario');
    });
}




// ---------------------------------------------------------------------------------------------------- //
// FACTURAS //

let InvoiceNumber = [];
let InvoiceTName = [];
let InvoiceStatus = [];

async function agregarFacturas() {
    try {
        const response = await fetch('/api-data');
        if (!response.ok) {
            throw new Error('No se pudo obtener la información del servidor');
        }
        
        const { encryptedData, key, iv } = await response.json();

        const data = await decryptData(encryptedData, key, iv);

        const role = data.role;
        
        if (role === 'administrator') {

            const titleContent = document.getElementById('invoice-title');
            
            const titleDiv = document.createElement('h2');
            titleDiv.innerHTML = 'Facturas';

            titleContent.appendChild(titleDiv);

            const navLink = document.getElementById('main-column');
            navLink.innerHTML = `          
                <a href="/home"><img src="/assets/LOGO-NEGRO.png" alt="Imagen de perfil"></a>
            `;
            
            const invoiceContent = document.getElementById('invoice-mainDiv');
            const invoices = data.invoice;

            if (invoices.length === 0) {

                invoiceContent.classList.add('main-p');

                const noInvoicesMessage = document.createElement('p');
                noInvoicesMessage.innerHTML = 'No hay facturas disponibles';
                invoiceContent.appendChild(noInvoicesMessage);

                const createInvoice = document.createElement('a');
                createInvoice.classList.add('create-link');
                createInvoice.href = '/create_invoice'; 
                createInvoice.textContent = 'Crear factura';
    
                invoiceContent.appendChild(createInvoice);

                const table_content = document.getElementById('table-container');
                table_content.style.display = 'none';

                const filters_button = document.getElementById('toggle-filters-btn');
                filters_button.style.display = 'none';

            } else {

                renderInvoices(data, invoices);

                const createDivI = document.createElement('div');
                createDivI.classList.add('create-div');
                createDivI.id = 'createI-id';
                invoiceContent.appendChild(createDivI);

                const createinfo = document.getElementById('createI-id');
                createinfo.innerHTML += `<a href="/create_invoice" class="add-user" title="Crear factura" ><i class="fa-solid fa-square-plus"></i></a>`;
                

                const filtersIContainer = document.getElementById('filters-container');
    
                filtersIContainer.innerHTML += `
                    <div class="filters-container2" >
                        
                        <div class="div-filtro">
                            <label for="InvoiceNumber-filter">Nº FACTURA</label>
                            <select id="InvoiceNumber-filter" onchange="applyInvoiceFilters()">
                                <option value="">Todos</option>
                                ${generateInvoiceNumber(InvoiceNumber)}
                            </select>
                        </div>

                        <div class="div-filtro">
                            <label for="InvoiceTName-filter">NOMBRE CLIENTE</label>
                            <select id="InvoiceTName-filter" onchange="applyInvoiceFilters()">
                                <option value="">Todos</option>
                                ${generateInvoiceTName(InvoiceTName)}
                            </select>
                        </div>

                        <div class="div-filtro">
                            <label for="InvoiceStatus-filter">ESTADO</label>
                            <select id="InvoiceStatus-filter" onchange="applyInvoiceFilters()">
                                <option value="">Todos</option>
                                ${generateInvoiceStatus(InvoiceStatus)}
                            </select>
                        </div>
                    </div>
                `;
                
                function generateInvoiceNumber(InvoiceNumber) {
                    return InvoiceNumber.map(invoice => `<option value="${invoice}">${invoice}</option>`).join('');
                }

                function generateInvoiceTName(InvoiceTName) {
                    return InvoiceTName.map(invoice => `<option value="${invoice}">${invoice}</option>`).join('');
                }

                function generateInvoiceStatus(InvoiceStatus) {
                    return InvoiceStatus.map(invoice => `<option value="${invoice}">${invoice}</option>`).join('');
                }
            }
        }
        else if (role === 'owner' || role === 'enterprise') {

            const titleContent = document.getElementById('invoice-title');
                
            const titleDiv = document.createElement('h2');
            titleDiv.innerHTML = 'Facturas';
            titleContent.appendChild(titleDiv);
    
            const navLink = document.getElementById('main-column');
            navLink.classList.remove('nav-column');
            navLink.classList.add('nav-column-premises');
            navLink.innerHTML = `
                <a href="/home" class="nav-link">Inicio</a>
                <a href="/warehouses" class="nav-link">Listado de Almacenes</a>
                <a href="/rentals" class="nav-link">Alquileres</a>
                <a href="/cameras" class="nav-link">Cámaras</a>
                <a href="/invoices" class="nav-link">Facturación</a>
            `;
                
            const invoiceContent = document.getElementById('invoice-mainDiv');
            const invoices = data.invoice;
    
            if (invoices.length === 0) {
    
                invoiceContent.classList.add('main-p');

                const noInvoicesMessage = document.createElement('p');
                noInvoicesMessage.innerHTML = 'No hay facturas disponibles';
                invoiceContent.appendChild(noInvoicesMessage);

                const createInvoice = document.createElement('a');
                createInvoice.classList.add('create-link');
                createInvoice.href = '/create_invoice'; 
                createInvoice.textContent = 'Crear factura';
    
                invoiceContent.appendChild(createInvoice);

                const table_content = document.getElementById('table-container');
                table_content.style.display = 'none';

                const filters_button = document.getElementById('toggle-filters-btn');
                filters_button.style.display = 'none';
    
            } else {

                renderInvoices(data, invoices);

                const createDivI = document.createElement('div');
                createDivI.classList.add('create-div');
                createDivI.id = 'createI-id';
                invoiceContent.appendChild(createDivI);

                const createinfo = document.getElementById('createI-id');
                createinfo.innerHTML += `<a href="/create_invoice" class="add-user" title="Crear factura" ><i class="fa-solid fa-square-plus"></i></a>`;
                

                const filtersIContainer = document.getElementById('filters-container');
    
                filtersIContainer.innerHTML += `
                    <div class="filters-container2" >
                        
                        <div class="div-filtro">
                            <label for="InvoiceNumber-filter">Nº FACTURA</label>
                            <select id="InvoiceNumber-filter" onchange="applyInvoiceFilters()">
                                <option value="">Todos</option>
                                ${generateInvoiceNumber(InvoiceNumber)}
                            </select>
                        </div>

                        <div class="div-filtro">
                            <label for="InvoiceTName-filter">NOMBRE CLIENTE</label>
                            <select id="InvoiceTName-filter" onchange="applyInvoiceFilters()">
                                <option value="">Todos</option>
                                ${generateInvoiceTName(InvoiceTName)}
                            </select>
                        </div>

                        <div class="div-filtro">
                            <label for="InvoiceStatus-filter">ESTADO</label>
                            <select id="InvoiceStatus-filter" onchange="applyInvoiceFilters()">
                                <option value="">Todos</option>
                                ${generateInvoiceStatus(InvoiceStatus)}
                            </select>
                        </div>
                    </div>
                `;
                
                function generateInvoiceNumber(InvoiceNumber) {
                    return InvoiceNumber.map(invoice => `<option value="${invoice}">${invoice}</option>`).join('');
                }

                function generateInvoiceTName(InvoiceTName) {
                    return InvoiceTName.map(invoice => `<option value="${invoice}">${invoice}</option>`).join('');
                }

                function generateInvoiceStatus(InvoiceStatus) {
                    return InvoiceStatus.map(invoice => `<option value="${invoice}">${invoice}</option>`).join('');
                }
            }
        }
    } catch (error) {
        console.error('Error al agregar las facturas', error.message);
    }
}

function renderInvoices(data, invoices){

    const invoiceinfo = document.getElementById('Idata-content');


    for (let i = 0; i < invoices.length; i++) {
        const invoice = invoices[i];

        let tenant_name = '';
        let tenantId = '';
        let tenantlastname = '';
        let tenantdni = '';
        let rental_price = '';
        let premises_id = '';
        let address = '';
        
        for (let j = 0; j < data.tenant.length; j++) {
            if (data.tenant[j].id === invoice.tenant_id) {
                tenant_name = data.tenant[j].name;
                tenantId = data.tenant[j].id;
                tenantlastname = data.tenant[j].lastname;
                tenantdni = data.tenant[j].dni;
        
                for (let k = 0; k < data.rental.length; k++) {
                    if (data.rental[k].tenant_id === invoice.tenant_id) {
                        rental_price = data.rental[k].price;
                        premises_id = data.rental[k].premises_id;
                        break;
                    }
                }

                for (let k = 0; k < data.premises.length; k++) {
                    if (data.premises[k].id === premises_id) {
                        address = data.premises[k].address;
                        break;
                    }
                }
        
                break;
            }
        }

        const datos_adicionales = {tenantlastname,tenantdni, rental_price, address};
 
        const dataString = JSON.stringify(datos_adicionales);
        const escapedDataString = dataString.replace(/"/g, "&quot;");
        

        if (!InvoiceNumber.includes(invoice.invoice_number)) {
            InvoiceNumber.push(invoice.invoice_number);
        }

        if (!InvoiceTName.includes(tenant_name)) {
            InvoiceTName.push(tenant_name);
        }

        if (!InvoiceStatus.includes(invoice.status)) {
            InvoiceStatus.push(invoice.status);
        }

        invoiceinfo.innerHTML += `
        <tr id="edit-form-${invoice.id}">
            <form id="edit-form-${invoice.id}" class="edit_form">
                <td data-label="Nº"><input name="id" type="text" value="${invoice.id}" readonly></td>
                <td data-label="Nº Factura"><input name="invoice_number" type="text" value="${invoice.invoice_number}" readonly></td>
                <td data-label="Inquilino"><input name="name" type="text" value="${tenant_name}" readonly></td>
                <td data-label="Monto Total"><input name="total_amount" type="text"  value="${invoice.total_amount}" readonly></td>
                <td data-label="Fecha Emisión"><input type="text" name="issue_date" value="${invoice.issue_date}" readonly></td>
                <td data-label="Fecha Vencimiento"><input type="text" name="due_date" value="${invoice.due_date}" readonly></td>
                <td data-label="Nº Local"><input type="text" name="premises_id" value="${invoice.premises_id}" readonly></td>
                <td data-label="Nº Almacén"><input type="text" name="warehouse_id" value="${invoice.warehouse_id}" readonly></td>
                <td data-label="Estado"><input name="status" type="text" value="${invoice.status}" readonly></td>
                <td data-label="Acciones">
                    <a id="button-show-invoice" class="edit-link" title="Ver factura" onclick="showInvoiceDiv(${invoice.id})"><i class="icon fa-regular fa-file-lines"></i></a>
                    <a id="download-${invoice.id}" class="edit-link" title="Descargar Factura"onclick="(function() { downloadInvoicePDF(${invoice.id}, '${escapedDataString}'); })()"><i class="icon fas fa-file-pdf"></i></a>
                    <a id="delete-${invoice.id}" class="delete-link" title="Eliminar Factura" onclick="deleteInvoice(${invoice.id})"><i class="icon fas fa-trash-alt"></i></a>
                    <button type="submit" class="save-button" id="save-button-${invoice.id}" onclick="updateInvoice(${invoice.id})" style="display:none;">Guardar</button>
                </td>
            </form>
        </tr>
        `;

        const invoiceContainer = document.getElementById('invoice-container');

        invoiceContainer.innerHTML += `
        <div class="overlay" id="show-invoice-overlay-${invoice.id}" >
            <div id="showInvoice-${invoice.id}" class="update-invoice-menu">

                <form action="/update_invoice/${invoice.id}" method="POST" >

                    <h3>${invoice.invoice_number}</h3>

                    <div class="update-ivoice-info">
                        <h4>Información de Identificación</h4>

                        <div class="update-ID-info" >

                            ${
                                invoice.enterprise_id ? 
                                    `<label for="EID">ID Empresa:</label>
                                    <input type="text" name="enterprise_id" id="EID" value="${invoice.enterprise_id}" autocomplete="on"/>`
                                    : invoice.owner_id
                                    ? `<label for="OID">ID Propietario:</label>
                                    <input type="text" name="owner_id" id="OID" value="${invoice.owner_id}" autocomplete="street-address"/>`
                                    : ''
                            }
                                        
                            <label for="PID">ID Local:</label>
                            <input type="text" name="premises_id" id="PID" value="${invoice.premises_id}"  pattern="^[0-9]*$" />
                                        
                            <label for="WID">ID Almacén:</label>
                            <input type="text" name="warehouse_id" id="WID" value="${invoice.warehouse_id}" pattern="^[0-9]*$" />
                                        
                            <label for="TID">ID Cliente:</label>
                            <input type="text" name="tenant_id" id="TID" value="${invoice.tenant_id}" pattern="^[0-9]*$" />
                        </div>
                    </div>

                    <div class="update-ivoice-info">
                        <h4>Información de la factura</h4>
                                    
                        <div class="update-ivoice-info2" >
                            <label for="NC">Nombre Cliente:</label>
                            <input type="text" name="name" id="NC" value="${invoice.name}" pattern="^[A-Za-záéíóúÁÉÍÓÚñÑüÜ ]+$" autocomplete="name" />
                                        
                            <label for="FE">Fecha Emisión:</label>
                            <input type="text" name="issue_date"  id="FE" value="${invoice.issue_date}"  />

                            <label for="FV">Fecha Vencimiento:</label>
                            <input type="text" name="due_date" id="FV" value="${invoice.due_date}" />

                            <label for="FP">Fecha Pago:</label>
                            <input type="text" name="payment_date" id="FP" value="${invoice.payment_date}" />

                            <label for="T">Total (€):</label>
                            <input type="text" name="total_amount" id="T" value="${invoice.total_amount}" />

                            <label for="E">Estado:</label>
                            <select class="select2" name="status" id="E">
                                <option class="option-disabled" disabled>Abonado</option>
                                <option class="option" value="Pagado" ${invoice.status === 'Pagado' ? 'selected' : ''}>Pagado</option>
                                <option class="option" value="No pagado" ${invoice.status === 'No pagado' ? 'selected' : ''}>No pagado</option>
                            </select>

                        </div>
                    </div>

                    <div class="invoice-buttons">
                        <button type="submit" class="OfferButtons">Guardar</button>
                        <button id="cancelButton" class="OfferButtons" type="button" onclick="CancelButtonClick34(${invoice.id})">Cancelar</button>
                    </div>

                </form>
            </div>
        </div>
        `;
    
    }
}
// ---------------------------------------------------------------------------------------------------- //
// FUNCION PARAD DESCARGAR COMO PDF

function getBase64Logo(callback) {
    const logoPath = '../assets/logo.png'; // Ruta del logo
    const reader = new FileReader();
    fetch(logoPath)
        .then(response => response.blob())
        .then(blob => {
            reader.onloadend = () => {
                callback(reader.result); // Devuelve el Base64
            };
            reader.readAsDataURL(blob);
        });
}


function downloadInvoicePDF(invoiceId, dataString) {
    const invoice = {
        id: invoiceId,
        invoice_number: document.querySelector(`#edit-form-${invoiceId} [name="invoice_number"]`).value,
        tenant_name: document.querySelector(`#edit-form-${invoiceId} [name="name"]`).value,
        total_amount: document.querySelector(`#edit-form-${invoiceId} [name="total_amount"]`).value,
        issue_date: document.querySelector(`#edit-form-${invoiceId} [name="issue_date"]`).value,
        due_date: document.querySelector(`#edit-form-${invoiceId} [name="due_date"]`).value,
        premises_id: document.querySelector(`#edit-form-${invoiceId} [name="premises_id"]`).value,
        warehouse_id: document.querySelector(`#edit-form-${invoiceId} [name="warehouse_id"]`).value,
        status: document.querySelector(`#edit-form-${invoiceId} [name="status"]`).value
    };
    const data = JSON.parse(dataString);

    const tenant_lastname = data.tenantlastname;
    const tenantdni = data.tenantdni;
    const rental_price = data.rental_price;
    const address = data.address;
    const tenant_full_name = `${invoice.tenant_name} ${tenant_lastname}`;
    
    const rental_price_float = parseFloat(rental_price);
  
    const total_iva = rental_price_float * 0.21;
    const total = rental_price_float + total_iva;


    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Cargar el logo desde assets
    getBase64Logo((logoBase64) => {
        // LOGO Y ENCABEZADO
        doc.addImage(logoBase64, 'PNG', 20, 10, 30, 30);

        doc.setFontSize(14);
        doc.text("Trast Manager", 60, 20);
        doc.setFontSize(10);
        doc.text("C. de Juan Hurtado de Mendoza, 4, Chamartín, 28036 Madrid", 60, 26);
        doc.text("CIF/NIF: A12345679", 60, 32);
        doc.text("E-mail: soporte.trastmanager@gmail.com", 60, 38);
        doc.text("Teléfono: +34628061892", 60, 44);


        // INFORMACIÓN DE LA FACTURA Y CLIENTE
        doc.setFontSize(12);
        doc.text("Factura a:", 20, 60);
        doc.setFontSize(10);
        doc.text(tenant_full_name, 20, 66);
        doc.text(`CIF/NIF: ${tenantdni}`, 20, 78);

        doc.setFontSize(12);
        doc.text(`Factura Nº: ${invoice.invoice_number}`, 140, 60);
        doc.setFontSize(10);
        doc.text(`Fecha de Factura: ${invoice.issue_date}`, 140, 66);
        doc.text(`Fecha de Vencimiento: ${invoice.due_date}`, 140, 72);

        // TABLA DE DETALLES con ancho automático
        doc.autoTable({
            startY: 90,
            head: [['Descripción', 'Cant', 'Ud', 'Precio', 'IVA', 'Total']],
            body: [
                [
                    `${address}`,
                    '1',
                    'mes',
                    `${rental_price}`,
                    '21%',
                    `${total}`
                ]
            ],
            headStyles: {
                fillColor: [240, 240, 240],
                textColor: 0,
                fontSize: 8,
                cellPadding: 2,
                halign: 'center'
            },
            styles: {
                fontSize: 8,
                cellPadding: 2,
                lineColor: [200, 200, 200],
                lineWidth: 0.1
            },
            margin: { left: 20, right: 20 },
            // No especificamos columnStyles para permitir el ajuste automático
            didParseCell: function(data) {
                // Alinear al centro todas las columnas excepto la descripción
                if (data.column.index > 0) {
                    data.cell.styles.halign = 'center';
                } else {
                    data.cell.styles.halign = 'left';
                }
            }
        });

        // RESUMEN DE PAGOS
        let finalY = doc.lastAutoTable.finalY + 10;
        doc.text('Subtotal sin IVA:', 120, finalY);
        doc.text(`${total} €`, 180, finalY, { align: 'right' });

        finalY += 6;
        doc.text(`IVA 21% de ${rental_price_float}: ${total_iva}`, 120, finalY);
        doc.text(`${total_iva} €`, 180, finalY, { align: 'right' });

        finalY += 6;
        doc.setFontSize(12);
        doc.text('Total EUR:', 120, finalY);
        doc.text(`${total} €`, 180, finalY, { align: 'right' });

        finalY += 10;
        doc.setFontSize(14);
        doc.text(`Importe a pagar (EUR): ${total} €`, 120, finalY);

        const footerY = finalY + 30;

        // Información bancaria y enlaces - columna derecha del QR
        // doc.setFontSize(8);
        // doc.text([
        //     'Código de entidad: 2100  Titular de la cuenta: Miguel Blanco',
        //     'BIC: ABCDEFGHXXX  IBAN: ES030949488838892',
        //     'Visita: https://trastmanager.com/contact'
        // ], 20, footerY + 8);



        // Número de página en la esquina inferior derecha
        doc.setFontSize(8);
        doc.text('Página 1 de 1', 180, footerY + 14, { align: 'right' });

        // GUARDAR PDF
        doc.save(`Factura_${invoice.invoice_number}.pdf`);
    });
}




// ---------------------------------------------------------------------------------------------------- //
// FUNCIONES PARA VER LA OFERTA CON LOS DATOS

// FUNCION PARA MOSTRA EL DIV DE CAMBIAR LA IMAGEN DE PERFIL
function showInvoiceDiv(invoiceId) {
    var showInvoice = document.getElementById('showInvoice-' + invoiceId);
    var invoice_overlay = document.getElementById('show-invoice-overlay-' + invoiceId);

    var invoice_title = document.getElementById('aside-invoice-title');
    invoice_title.style.zIndex = 0;

    var nav_invoice = document.getElementById('nav-invoice');
    nav_invoice.style.zIndex = 0;

    var footer_invoice = document.getElementById('footer-invoice');
    footer_invoice.style.zIndex = 0;

    showInvoice.style.display = 'block';
    invoice_overlay.style.position = 'fixed';
}
// ---------------------------------------------------------------------------------------------------- //

function CancelButtonClick34(invoiceId) {
    const showInvoice = document.getElementById('showInvoice-' + invoiceId);
    var invoice_overlay = document.getElementById('show-invoice-overlay-' + invoiceId);
    
    var invoice_title = document.getElementById('aside-invoice-title');
    invoice_title.style.zIndex = 3;

    var nav_invoice = document.getElementById('nav-invoice');
    nav_invoice.style.zIndex = 3;

    var footer_invoice = document.getElementById('footer-invoice');
    footer_invoice.style.zIndex = 3;
  
    if (showInvoice && invoice_overlay) {
        showInvoice.style.display = 'none';
        invoice_overlay.style.position = 'relative';
    } else {
        console.error('showInvoice or overlay not found');
    }
}


// ---------------------------------------------------------------------------------------------------- //
// FUNCION PARA APLICAR LOS FILTROS EN FACTURAS
async function applyInvoiceFilters() {

    const InvoiceNumberFilter = document.getElementById('InvoiceNumber-filter').value;
    const InvoiceTNameFilter = document.getElementById('InvoiceTName-filter').value;
    const InvoiceStatusFilter = document.getElementById('InvoiceStatus-filter').value;

    try {
        const response = await fetch('/api-data');
        if (!response.ok) {
            throw new Error('No se pudo obtener la información del servidor');
        }

        const { encryptedData, key, iv } = await response.json();

        const data = await decryptData(encryptedData, key, iv);

        const tenants = data.tenant;
        const invoices = data.invoice;

        let filteredInvoices = invoices;

        // Filtrar por NUMERO DE FACTURA
        if (InvoiceNumberFilter) {
            const filteredInvoiceNumberId = invoices.find(invoice => invoice.invoice_number == InvoiceNumberFilter)?.id;

            if (filteredInvoiceNumberId) {
                filteredInvoices = filteredInvoices.filter(invoice => invoice.id == filteredInvoiceNumberId);
            } else {
                filteredInvoices = [];
            }
        }

        // Filtrar por NOMBRE CLIENTE
        if (InvoiceTNameFilter) {
            const filteredInvoiceTNameId = tenants.find(tenant => tenant.name == InvoiceTNameFilter)?.id;

            if (filteredInvoiceTNameId) {
                filteredInvoices = filteredInvoices.filter(invoice => invoice.tenant_id == filteredInvoiceTNameId);
            } else {
                filteredInvoices = [];
            }
        }

        // Filtrar por ESTADO
        if (InvoiceStatusFilter) {
    
            filteredInvoices = filteredInvoices.filter(invoice => invoice.status == InvoiceStatusFilter);
        }
        


        // Si no hay resultados, mostrar mensaje
        if (filteredInvoices.length === 0) {
            const invoiceinfo = document.getElementById('Idata-content');
            invoiceinfo.innerHTML = '<p>No se encontraron resultados para los filtros aplicados.</p>';
            return;
        }

        const invoiceinfo = document.getElementById('Idata-content');
        invoiceinfo.innerHTML = '';

        renderInvoices(data, filteredInvoices);

    } catch (error) {
        console.error("Error al aplicar los filtros:", error);
    }
}


function editInvoice(invoiceId) {
    const form = document.getElementById(`edit-form-${invoiceId}`);

    // Obtener todos los input por la etiqueta name
    let inputs = form.querySelectorAll('input[name]');

    let listaInputs = [];

    inputs.forEach(function(input) {
        listaInputs.push(input);
        input.removeAttribute('readonly');
    });

    // Mostrar el botón de guardar y ocultar el de editar y eliminar
    const saveButton = document.getElementById(`save-button-${invoiceId}`);
    saveButton.style.display = 'inline-block';
    
    const editButton = document.getElementById(`edit-${invoiceId}`);
    editButton.style.display = 'none';
    
    const deleteButton = document.getElementById(`delete-${invoiceId}`);
    deleteButton.style.display = 'none';
}



function updateInvoice(invoiceId){
    
    const form = document.getElementById(`edit-form-${invoiceId}`);
    let inputs = form.querySelectorAll('input[name]');
    let formData  = {};

    inputs.forEach(function(input) {
        formData [input.name] = input.value;
        input.removeAttribute('readonly');
    });


    fetch(`/update_invoice/${invoiceId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            window.location.href = '/invoices';
        })
        .catch(error => {
            window.location.href = '/invoices';
        });

}

function deleteInvoice(invoiceId) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta factura?')) {
        return;
    }

    fetch(`/delete_invoice/${invoiceId}`, {
        method: 'POST'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error al eliminar la factura: ${response.status}`);
        }
        window.location.href = '/invoices';
    })
    .catch(error => {
        alert('Error al eliminar la factura');
    });
}


// ---------------------------------------------------------------------------------------------------- //
// LOCALES //

let EOName = [];
let EORole = [];
let PremisesAddress = [];
let PremisesCapacity = [];
let PremisesState = [];

async function agregarLocales() {
    try {
        const response = await fetch('/api-data');
        if (!response.ok) {
            throw new Error('No se pudo obtener la información del servidor');
        }
        
        const { encryptedData, key, iv } = await response.json();

        const data = await decryptData(encryptedData, key, iv);

        const role = data.role;
        
        if (role === 'administrator') {
            const titleContent = document.getElementById('premises-title');
            const titleDiv = document.createElement('h2');
            titleDiv.innerHTML = 'Locales';
            titleContent.appendChild(titleDiv);

            const premisesContent = document.getElementById('premises-mainDiv');
            const premises = data.premises;

            if (premises.length === 0) {
                premisesContent.classList.add('main-p');
                const noPremisesMessage = document.createElement('p');
                noPremisesMessage.innerHTML = 'No hay locales registrados';
                premisesContent.appendChild(noPremisesMessage);

                const createPremises = document.createElement('a');
                createPremises.classList.add('create-link');
                createPremises.href = '/create_premises'; 
                createPremises.textContent = 'Crear local';
                premisesContent.appendChild(createPremises);

                const table_content = document.getElementById('table-container');
                table_content.style.display = 'none';

                const filters_button = document.getElementById('toggle-filters-btn');
                filters_button.style.display = 'none';
            } else {

                renderPremises(data, premises);

                const createDivP = document.createElement('div');
                createDivP.classList.add('create-div');
                createDivP.id = 'createP-id';
                premisesContent.appendChild(createDivP);

                const createinfo = document.getElementById('createP-id');
                createinfo.innerHTML = `<a href="/create_premises" class="add-user" title="Crear local" ><i class="fa-solid fa-house-medical"></i></a>`;
            
                const filtersContainer = document.getElementById('filters-container');

                filtersContainer.innerHTML += `
                    <div class="filters-container2" >

                        <div class="div-filtro">
                            <label for="EOName-filter">TITULAR:</label>
                            <select id="EOName-filter" onchange="applyPremisesFilters()">
                                <option value="">Todos</option>
                                ${generateEOName(EOName)}
                            </select>
                        </div>

                        <div class="div-filtro">
                            <label for="EORole-filter">ROL:</label>
                            <select id="EORole-filter" onchange="applyPremisesFilters()">
                                <option value="">Todos</option>
                                ${generateEORole(EORole)}
                            </select>
                        </div>

                        <div class="div-filtro">
                            <label for="PremisesAddress-filter">DIRECCIÓN:</label>
                            <select id="PremisesAddress-filter" onchange="applyPremisesFilters()">
                                <option value="">Todos</option>
                                ${generatePremisesAddress(PremisesAddress)}
                            </select>
                        </div>

                        <div class="div-filtro">
                            <label for="PremisesCapacity-filter">CAPACIDAD:</label>
                            <select id="PremisesCapacity-filter" onchange="applyPremisesFilters()">
                                <option value="">Todos</option>
                                ${generatePremisesCapacity(PremisesCapacity)}
                            </select>
                        </div>
                        
                        <div class="div-filtro">
                            <label for="PremisesState-filter">ESTADO:</label>
                            <select id="PremisesState-filter" onchange="applyPremisesFilters()">
                                <option value="">Todos</option>
                                ${generatePremisesState(PremisesState)}
                            </select>
                        </div>
                    </div>
                `;

                function generateEOName(EOName) {
                    return EOName.map(premise => `<option value="${premise}">${premise}</option>`).join('');
                }

                function generateEORole(EORole) {
                    return EORole.map(premise => `<option value="${premise}">${premise}</option>`).join('');
                }

                function generatePremisesAddress(PremisesAddress) {
                    return PremisesAddress.map(premise => `<option value="${premise}">${premise}</option>`).join('');
                }

                function generatePremisesCapacity(PremisesCapacity) {
                    return PremisesCapacity.map(premise => `<option value="${premise}">${premise}</option>`).join('');
                }

                function generatePremisesState(PremisesState) {
                    return PremisesState.map(premise => `<option value="${premise}">${premise}</option>`).join('');
                }

                function generatePremisesState(PremisesState) {
                    return PremisesState
                        .map(premise => premise === '' ? 'Sin estado' : premise)
                        .map(premise => {
                            const value = premise === 'Sin estado' ? 'Sin estado' : premise;
                            return `<option value="${value}">${premise}</option>`;
                        })
                        .join('');
                }
            }
        }
    } catch (error) {
        console.error('Error al agregar locales', error.message);
    }
}

function renderPremises (data, premises){


    const premisesinfo = document.getElementById('Pdata-content');

    for (let i = 0; i < premises.length; i++) {
        const premise = premises[i];
        const owner_id = premise.owner_id;
        const enterprise_id = premise.enterprise_id;

        let EOname;
        let EOid;
        let role;
        
        if (owner_id === null) {
            if (data.enterprise.length > 0) {
                EOid = enterprise_id;
                for (let i = 0; i < data.enterprise.length; i++) {
                    if (data.enterprise[i].id === EOid) {
                        EOname = data.enterprise[i].name;
                        break;
                    }
                }
                role = 'enterprise';
            } else {
                EOid = owner_id;
                for (let i = 0; i < data.owner.length; i++) {
                    if (data.owner[i].id === EOid) {
                        EOname = data.owner[i].name;
                        break;
                    }
                }
                role = 'owner';
            }
        } else {
            if (data.owner.length > 0) {
                EOid = owner_id;
                for (let i = 0; i < data.owner.length; i++) {
                    if (data.owner[i].id === EOid) {
                        EOname = data.owner[i].name;
                        break;
                    }
                }
                role = 'owner';
            } else {
                EOid = enterprise_id;
                for (let i = 0; i < data.enterprise.length; i++) {
                    if (data.enterprise[i].id === EOid) {
                        EOname = data.enterprise[i].name;
                        break;
                    }
                }
                role = 'enterprise';
            }
        }

        if (!EOName.includes(EOname)) {
            EOName.push(EOname);
        }

        if (!EORole.includes(role)) {
            EORole.push(role);
        }

        if (!PremisesAddress.includes(premise.address)) {
            PremisesAddress.push(premise.address);
        }

        if (!PremisesCapacity.includes(premise.capacity)) {
            PremisesCapacity.push(premise.capacity);
        }

        if (!PremisesState.includes(premise.state)) {
            PremisesState.push(premise.state);
        }

        premisesinfo.innerHTML += `
        <tr id="edit-form-${premise.id}">
            <form id="edit-form-${premise.id}" class="edit_form">
                <td data-label="Nº Local"><input name="id" type="text" value="${premise.id}" readonly></td>
                <td data-label="Nº Propietario"><input name="EOid" type="text" value="${EOid}" readonly></td>
                <td data-label="Propietario"><input name="EOname" type="text" value="${EOname}" readonly></td>
                <td data-label="Rol"><input type="text" name="role" value="${role}" readonly></td>
                <td data-label="Nombre"><input name="name" type="text" value="${premise.name}" readonly></td>
                <td data-label="Dirección"><input name="address" type="text" value="${premise.address}" readonly></td>
                <td data-label="Capacidad"><input name="capacity" type="text" value="${premise.capacity}" readonly></td>
                <td data-label="Descripción"><input name="description" type="text" value="${premise.description}" readonly></td>
                <td data-label="Estado"><input name="state" type="text" value="${premise.state}" readonly></td>
                <td data-label="Acciones">
                    <a href="#" id="edit-${premise.id}" class="edit-link" title="Editar Local" onclick="editPremises(${premise.id})"><i class="icon fas fa-edit"></i></a>
                    <a id="delete-${premise.id}" class="delete-link" title="Eliminar Local" onclick="deletePremises(${premise.id})"><i class="icon fas fa-trash-alt"></i></a>
                    <button type="submit" class="save-button" id="save-button-${premise.id}" onclick="updatePremises(${premise.id})" style="display:none;">Guardar</button>
                </td>
            </form>
        </tr>
        `;
    }

}

async function applyPremisesFilters() {

    const EONameFilter = document.getElementById('EOName-filter').value;
    const EORoleFilter = document.getElementById('EORole-filter').value;
    const PremisesAddressFilter = document.getElementById('PremisesAddress-filter').value;
    const PremisesCapacityFilter = document.getElementById('PremisesCapacity-filter').value;
    const PremisesStateFilter = document.getElementById('PremisesState-filter').value;

    try {
        const response = await fetch('/api-data');
        if (!response.ok) {
            throw new Error('No se pudo obtener la información del servidor');
        }

        const { encryptedData, key, iv } = await response.json();

        const data = await decryptData(encryptedData, key, iv);

        const premises = data.premises;
        const owners = data.owner;
        const enterprises = data.enterprise;
        

        // Filtros combinados
        let filteredPremises = premises;


        // Filtrar por NOMBRE PROPIETARIO
        if (EONameFilter) {
            // Buscar todos los IDs que coincidan con el nombre en owners y enterprises
            const filteredOwnerIDs = owners
                .filter(owner => owner.name === EONameFilter)
                .map(owner => owner.id);

            const filteredEnterpriseIDs = enterprises
                .filter(enterprise => enterprise.name === EONameFilter)
                .map(enterprise => enterprise.id);

            // Unir ambos arreglos de IDs
            const filteredEOIDs = [...filteredOwnerIDs, ...filteredEnterpriseIDs];

            if (filteredEOIDs.length > 0) {
                filteredPremises = filteredPremises.filter(premise => filteredEOIDs.includes(premise.id));
                
            } else {
                filteredPremises = [];
            }
        }


        // Filtrar por ROL
        if (EORoleFilter) {

            if (EORoleFilter === 'owner'){
                
                filteredPremises = filteredPremises.filter(premise => premise.role = EORoleFilter );
            }
            else{
                filteredPremises = filteredPremises.filter(premise => premise.role = EORoleFilter);
            }
        }

        // Filtrar por DIRECCION
        if (PremisesAddressFilter) {

            filteredPremises = filteredPremises.filter(premise => premise.address == PremisesAddressFilter);
        }

        // Filtrar por CAPACIDAD
        if (PremisesCapacityFilter) {

            filteredPremises = filteredPremises.filter(premise => premise.capacity == PremisesCapacityFilter);
        }


        // Filtrar por ESTADO
        if (PremisesStateFilter) {

            filteredPremises = filteredPremises.filter(premise => premise.state == PremisesStateFilter);
        }

        


        // Si no hay resultados, mostrar mensaje
        if (filteredPremises.length === 0) {
            const premisesinfo = document.getElementById('Pdata-content');
            premisesinfo.innerHTML = '<p>No se encontraron resultados para los filtros aplicados.</p>';
            return;
        }

        // Actualizar la vista con los almacenes filtrados
        const premisesinfo = document.getElementById('Pdata-content');
        premisesinfo.innerHTML = ''; // Limpiar tabla de almacenes actual

        renderPremises(data, filteredPremises);

    } catch (error) {
        console.error("Error al aplicar los filtros:", error);
    }
}

function editPremises(premiseId) {
    const form = document.getElementById(`edit-form-${premiseId}`);

    // Obtener todos los input por la etiqueta name
    let inputs = form.querySelectorAll('input[name]');
    
    let listaInputs = [];

    inputs.forEach(function(input) {
        if (input.name === 'state') {
            const stateValue = input.value;

            const select = document.createElement('select');
            select.name = 'state';
            select.className = 'select';
    
            select.innerHTML = `
              <option class="option-disabled" disabled selected>Estado</option>
              <option class="option" value="Abierto">Abierto</option>
              <option class="option" value="Pendiente de apertura">Pendiente de apertura</option>
              <option class="option" value="Cerrado">Cerrado</option>
              <option class="option" value="En mantenimiento">En mantenimiento</option>
              <option class="option" value="No Disponible">No Disponible</option>
              <option class="option" value="En obras">En obras</option>
            `;

            // Establecer el valor actual como seleccionado
            Array.from(select.options).forEach(option => {
                if (option.value === stateValue) {
                    option.selected = true;
                }
            });
    
            input.parentNode.replaceChild(select, input);
        } else {
            listaInputs.push(input);
            input.removeAttribute('readonly');
        }
    });

    // Mostrar el botón de guardar y ocultar el de editar y eliminar
    const saveButton = document.getElementById(`save-button-${premiseId}`);
    saveButton.style.display = 'inline-block';
    
    const editButton = document.getElementById(`edit-${premiseId}`);
    editButton.style.display = 'none';
    
    const deleteButton = document.getElementById(`delete-${premiseId}`);
    deleteButton.style.display = 'none';
    
}


function updatePremises(premiseId){
    
    const form = document.getElementById(`edit-form-${premiseId}`);
    let inputs = form.querySelectorAll('input[name]');
    let selects = form.querySelectorAll('select[name]');
    let formData  = {};

    inputs.forEach(function(input) {
        formData [input.name] = input.value;
        input.removeAttribute('readonly');
    });

    selects.forEach(function(select) {
        formData[select.name] = select.value;
    });

    // Validaciones de campos
    for (let input of inputs) {
        // Validar si el campo es solo lectura y no debe ser editado
        if (input.hasAttribute('readonly')) continue;

        // Validar campos numéricos (rental.id, EOid, premises_id, warehouse_id, tenant_id, etc.)
        if (input.name === "id" || input.name === "EOid" || input.name === "owner_id" || input.name === "capacity" ) {
            if (!validateField(input, input.name, 'integer')) {
                return; // Si la validación falla, detener la ejecución
            }
        }

        // Validar fechas
        if (input.name === "email" && input.value !== "") {
            if (!validateField(input, "Correo electrónico", 'email')) {
                return; // Si la validación falla, detener la ejecución
            }
        }

        // Validar el campo de telefono
        if (input.name === "phone_number" && input.value !== "") {
            if (!validateField(input, "Telefono", 'phone')) {
                return; // Si la validación falla, detener la ejecución
            }
        }

        // Validar el campo de DNI
        if (input.name === "dni" && input.value !== "") {
            if (!validateField(input, "Dni", 'dni')) {
                return; 
            }
        }

        // Validar el campo de IBAN
        if (input.name === "bank_account" && input.value !== "") {
            if (!validateField(input, "Cuenta Bancaria", 'iban')) {
                return; 
            }
        }
        

        // Validar el campo 'tenant_name' (Cliente) para asegurarse de que no esté vacío
        if (input.name === "EOname" || input.name === "name" || input.name === "address" ) {
            if (!validateField(input, input.name, 'text')) {
                return; // Si la validación falla, detener la ejecución
            }
        }

    }


    fetch(`/update_premises/${premiseId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            window.location.href = '/premises';
        })
        .catch(error => {
            window.location.href = '/premises';
        });

}

function deletePremises(premiseId) {
    if (!confirm('¿Estás seguro de que deseas eliminar este local?')) {
        return; // Si el usuario cancela, no hacer nada
    }

    fetch(`/delete_premises/${premiseId}`, {
        method: 'POST'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error al eliminar local: ${response.status}`);
        }
        window.location.href = '/premises';
    })
    .catch(error => {
        alert('Error al eliminar local');
    });
}

// ---------------------------------------------------------------------------------------------------- //
// OFERTAS //

let OfferAddress = [];
let OfferSize = ["menos de 5 m2", "entre 5 m2 y 10 m2", "mas de 10 m2"];
let OfferPrice = ["menos de 5€", "entre 5€ y 10€", "mas de 10€"];

async function agregarOfertas() {
    try {
        const response = await fetch('/api-data');
        if (!response.ok) {
            throw new Error('No se pudo obtener la información del servidor');
        }

        const { encryptedData, key, iv } = await response.json();

        const data = await decryptData(encryptedData, key, iv);

        const role = data.role;
        const offers = data.offer;
        
        if (role === 'administrator') {
            
            const titleContent = document.getElementById('offer-title');
            
            const titleDiv = document.createElement('h2');
            titleDiv.innerHTML = 'Ofertas';
            titleContent.appendChild(titleDiv);

            const offerContent = document.getElementById('offer-mainDiv');
            
            if (offers.length === 0) {

                offerContent.classList.add('main-p');

                const noOffersMessage = document.createElement('p');
                noOffersMessage.innerHTML = 'No hay ofertas registradas';
                offerContent.appendChild(noOffersMessage);

                const createOwner = document.createElement('a');
                createOwner.classList.add('create-link');
                createOwner.href = '/create_offer'; 
                createOwner.textContent = 'Crear oferta';
    
                offerContent.appendChild(createOwner);

                const table_content = document.getElementById('table-container');
                table_content.style.display = 'none';

                const filters_button = document.getElementById('toggle-filters-btn');
                filters_button.style.display = 'none';

            } else {

                renderOffers(offers);

                const createDivOf = document.createElement('div');
                createDivOf.classList.add('create-div');
                createDivOf.id = 'createOf-id';
                offerContent.appendChild(createDivOf);

                const createinfo = document.getElementById('createOf-id');
                createinfo.innerHTML += `<a href="/create_offer" class="add-user" title="Crear oferta" ><i class="fas fa-user-plus" ></i></a>`;
                
                const filtersOfContainer = document.getElementById('filters-container');

                filtersOfContainer.innerHTML += `
                    <div class="filters-container2" >

                        <div class="div-filtro">
                            <label for="OfferAddress-filter">DIRECCIÓN</label>
                            <select id="OfferAddress-filter" onchange="applyOfferFilters()">
                                <option value="">Todos</option>
                                ${generateOfferAddress(OfferAddress)}
                            </select>
                        </div>
        
                        <div class="div-filtro">
                            <label for="OfferSize-filter">TAMAÑO</label>
                            <select id="OfferSize-filter" onchange="applyOfferFilters()">
                                <option value="">Todos</option>
                                ${generateOfferSize(OfferSize)}
                            </select>
                        </div>

                        <div class="div-filtro">
                            <label for="OfferPrice-filter">PRECIO</label>
                            <select id="OfferPrice-filter" onchange="applyOfferFilters()">
                                <option value="">Todos</option>
                                ${generateOfferPrice(OfferPrice)}
                            </select>
                        </div>

                    </div>

                `;

                function generateOfferAddress(OfferAddress) {
                    return OfferAddress.map(offer => `<option value="${offer}">${offer}</option>`).join('');
                }

                function generateOfferSize(OfferSize) {
                    return OfferSize.map(offer => `<option value="${offer}">${offer}</option>`).join('');
                }

                function generateOfferPrice(OfferPrice) {
                    return OfferPrice.map(offer => `<option value="${offer}">${offer}</option>`).join('');
                }
            }
        }

    } catch (error) {
        console.error('Error al agregar las ofertas:', error);
    }
}

function renderOffers(offers){

    const offerinfo = document.getElementById('Ofdata-content');

    for (let i = 0; i < offers.length; i++) {
        const offer = offers[i];

        const getValidId = (offer) => {
            return offer.administrator_id || offer.owner_id || offer.enterprise_id || '';
        };

        const validId = getValidId(offer);
       
        if (!OfferAddress.includes(offer.address)) {
            OfferAddress.push(offer.address);
        }

        offerinfo.innerHTML += `
        <tr id="edit-form-${offer.id}" >
            <form class="edit_form" >
                <td data-label="Nº"><input name="id" type="text" value="${offer.id}" readonly></td>
                <td data-label="Nº Titular"><input name="id" type="text" value="${validId}" readonly></td>
                <td data-label="Nº Local"><input name="premises_id" type="text" value="${offer.premises_id}" readonly></td>
                <td data-label="Nº Almacén"><input name="warehouse_id" type="text" value="${offer.warehouse_id}" readonly></td>
                <td data-label="Titulo"><input name="title" type="text" value="${offer.title}" readonly></td>
                <td data-label="Dirección"><input name="address" type="text" value="${offer.address}" readonly></td>
                <td data-label="Tamaño"><input name="size" type="text" value="${offer.size}" readonly></td>
                <td data-label="Precio"><input name="rental_price" type="text" value="${offer.rental_price}" readonly></td>
                <td data-label="Descripción"><input name="description" type="text" value="${offer.description}" readonly></td>
                <td data-label="Email"><input name="email" type="text" value="${offer.email}" readonly></td>
                <td data-label="Tamaño"><input name="phone_number" type="text" value="${offer.phone_number}" readonly></td>
                
                <td data-label="Acciones">
                    <a href="#" id="edit-${offer.id}" class="edit-link" title="Editar Oferta" onclick="editOffer(${offer.id})"><i class="icon fas fa-edit"></i></a>
                    <a id="delete-${offer.id}" class="delete-link" title="Eliminar Oferta" onclick="deleteOffer(${offer.id})"><i class="icon fas fa-trash-alt"></i></a>
                    <button type="submit" class="save-button" id="save-button-${offer.id}" onclick="updateOffer(${offer.id})" style="display:none;">Guardar</button>
                </td>
            </form>
        </tr>
        `;
    }
}

async function applyOfferFilters() {

    const OfferAddressFilter = document.getElementById('OfferAddress-filter').value;
    const OfferSizeFilter = document.getElementById('OfferSize-filter').value;
    const OfferPriceFilter = document.getElementById('OfferPrice-filter').value;
  
    try {
        const response = await fetch('/api-data'); // Ajusta la ruta según tu configuración
        if (!response.ok) {
            throw new Error('No se pudo obtener la información del servidor');
        }
  
        // Obtener los datos cifrados y las claves de la respuesta
        const { encryptedData, key, iv } = await response.json();
  
        // Descifrar los datos recibidos
        const data = await decryptData(encryptedData, key, iv);
  
        const offers = data.offer;
  
        // Filtros combinados
        let filteredOffers = offers;
  

        // Filtrar por DIRECCION
        if (OfferAddressFilter) {
            
            const filteredTenantId = offers.find(offer => offer.address == OfferAddressFilter)?.id; // son 2 == porque tenantIDFilter es un string

            if (filteredTenantId) {
                filteredOffers = filteredOffers.filter(offer => offer.address == OfferAddressFilter);
            } else {
                filteredOffers = [];
            }
            
        }

        // Filtrar por TAMAÑO
        if (OfferSizeFilter) {
            filteredOffers = filteredOffers.filter(offer => {
                const size = offer.size;

                if (OfferSizeFilter === "menos de 5 m2") {
                    return size < 5;
                } else if (OfferSizeFilter === "entre 5 m2 y 10 m2") {
                    return size >= 5 && size <= 10;
                } else if (OfferSizeFilter === "mas de 10 m2") {
                    return size > 10;
                }
                
                return false; // Si no coincide con ningún filtro
            });
        }

        // Filtrar por PRECIO
        if (OfferPriceFilter) {
            filteredOffers = filteredOffers.filter(offer => {
                const price = offer.rental_price;

                if (OfferPriceFilter === "menos de 5€") {
                    return price < 5;
                } else if (OfferPriceFilter === "entre 5€ y 10€") {
                    return price >= 5 && price <= 10;
                } else if (OfferPriceFilter === "mas de 10€") {
                    return price > 10;
                }
                
                return false; // Si no coincide con ningún filtro
            });
        }
  
        // Si no hay resultados, mostrar mensaje
        if (filteredOffers.length === 0) {
            const offerinfo = document.getElementById('Ofdata-content');
            offerinfo.innerHTML = '<p>No se encontraron resultados para los filtros aplicados.</p>';
            return;
        }
  
        // Actualizar la vista con los almacenes filtrados
        const offerinfo = document.getElementById('Ofdata-content');
        offerinfo.innerHTML = '';
  
        renderOffers(filteredOffers);
  
    } catch (error) {
        console.error("Error al aplicar los filtros:", error);
    }
}

function editOffer(offerId) {
    const form = document.getElementById(`edit-form-${offerId}`);

    // Obtener todos los input por la etiqueta name
    let inputs = form.querySelectorAll('input[name]');

    let listaInputs = [];

    inputs.forEach(function(input) {
        listaInputs.push(input);
        input.removeAttribute('readonly');
    });


    inputs.forEach(input => {
        if (input.classList.contains('sensitive-field')) {
            // Para campos sensibles, mostrar el valor real
            input.value = input.getAttribute('data-real-value');
        }
        input.readOnly = false;
    });

    // Mostrar el botón de guardar y ocultar el de editar y eliminar
    const saveButton = document.getElementById(`save-button-${offerId}`);
    saveButton.style.display = 'inline-block';
    
    const editButton = document.getElementById(`edit-${offerId}`);
    editButton.style.display = 'none';
    
    const deleteButton = document.getElementById(`delete-${offerId}`);
    deleteButton.style.display = 'none';
    
}


function updateOffer(offerId){
    
    const form = document.getElementById(`edit-form-${offerId}`);
    let inputs = form.querySelectorAll('input[name]');
    let formData  = {};

    inputs.forEach(function(input) {
        formData [input.name] = input.value;
        input.removeAttribute('readonly');
    });

    // Validaciones de campos
    for (let input of inputs) {
        // Validar si el campo es solo lectura y no debe ser editado
        if (input.hasAttribute('readonly')) continue;

        // Validar campos numéricos (rental.id, EOid, premises_id, warehouse_id, tenant_id, etc.)
        if (input.name === "id" || input.name === "premises_id" || input.name === "warehouse_id" ) {
            if (!validateField(input, input.name, 'integer')) {
                return; // Si la validación falla, detener la ejecución
            }
        }

        // Validar fechas
        if (input.name === "email" && input.value !== "") {
            if (!validateField(input, "Correo electrónico", 'email')) {
                return; // Si la validación falla, detener la ejecución
            }
        }

        // Validar el campo de telefono
        if (input.name === "phone_number" && input.value !== "") {
            if (!validateField(input, "Telefono", 'phone')) {
                return; // Si la validación falla, detener la ejecución
            }
        }

        // Validar el campo de DNI
        if (input.name === "rental_price" && input.value !== "") {
            if (!validateField(input, "Precio", 'price')) {
                return; 
            }
        }

        // Validar el campo de size
        if (input.name === "size" && input.value !== "") {
            if (!validateField(input, "Tamaño", 'size')) {
                return; 
            }
        }
        

        // Validar el campo 'tenant_name' (Cliente) para asegurarse de que no esté vacío
        if (input.name === "title" || input.name === "address") {
            if (!validateField(input, input.name, 'text')) {
                return; // Si la validación falla, detener la ejecución
            }
        }

    }


    fetch(`/update_offer/${offerId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            window.location.href = '/offers';
        })
        .catch(error => {
            window.location.href = '/offers';
        });

}

function deleteOffer(offerId) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta oferta?')) {
        return;
    }

    fetch(`/delete_offer/${offerId}`, {
        method: 'POST'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error al eliminar la oferta: ${response.status}`);
        }
        window.location.href = '/offers';
    })
    .catch(error => {
        alert('Error al eliminar la oferta');
    });
}



// ---------------------------------------------------------------------------------------------------- //
// PROPIETARIOS //

let OwnerName = [];
let OwnerLastname = [];

async function agregarPropietarios() {
    try {
        const response = await fetch('/api-data');
        if (!response.ok) {
            throw new Error('No se pudo obtener la información del servidor');
        }
        
        const { encryptedData, key, iv } = await response.json();

        const data = await decryptData(encryptedData, key, iv);

        const role = data.role;
        
        if (role === 'administrator') {
            
            const titleContent = document.getElementById('title-content');
            
            const titleDiv = document.createElement('h2');
            titleDiv.innerHTML = 'Propietarios';

            titleContent.appendChild(titleDiv);

            const ownersContent = document.getElementById('owner-mainDiv');
            
            const owners = data.owner;
            
            if (owners.length === 0) {

                ownersContent.classList.add('main-p');

                const noOwnersMessage = document.createElement('p');
                noOwnersMessage.innerHTML = 'No hay propietarios registrados';
                ownersContent.appendChild(noOwnersMessage);

                const createOwner = document.createElement('a');
                createOwner.classList.add('create-link');
                createOwner.href = '/owner_register'; 
                createOwner.textContent = 'Crear propietario';
    
                ownersContent.appendChild(createOwner);

                const table_content = document.getElementById('table-container');
                table_content.style.display = 'none';

                const filters_button = document.getElementById('toggle-filters-btn');
                filters_button.style.display = 'none';

            } else {

                renderOwners(owners);

                const createDivOw = document.createElement('div');
                createDivOw.classList.add('create-div');
                createDivOw.id = 'createOw-id';
                ownersContent.appendChild(createDivOw);

                const createinfo = document.getElementById('createOw-id');
                createinfo.innerHTML += `<a href="/owner_register" class="add-user" title="Crear propietario" ><i class="fas fa-user-plus" ></i></a>`;
                

                const filtersOwContainer = document.getElementById('filters-container');

                filtersOwContainer.innerHTML += `
                    <div class="filters-container2" >

                        <div class="div-filtro">
                            <label for="OwnerName-filter">NOMBRE</label>
                            <select id="OwnerName-filter" onchange="applyOwnersFilters()">
                                <option value="">Todos</option>
                                ${generateOwnerName(OwnerName)}
                            </select>
                        </div>
        
                        <div class="div-filtro">
                            <label for="OwnerLastname-filter">APELLIDOS</label>
                            <select id="OwnerLastname-filter" onchange="applyOwnersFilters()">
                                <option value="">Todos</option>
                                ${generateOwnerLastname(OwnerLastname)}
                            </select>
                        </div>

                    </div>

                `;

                function generateOwnerName(OwnerName) {
                    return OwnerName.map(owner => `<option value="${owner}">${owner}</option>`).join('');
                }

                function generateOwnerLastname(OwnerLastname) {
                    return OwnerLastname.map(owner => `<option value="${owner}">${owner}</option>`).join('');
                }
            }
        }
    } catch (error) {
        console.error('Error al agregar propietarios:', error.message);
    }
}

function renderOwners (owners){

    const ownerinfo = document.getElementById('Owdata-content');

    OwnerName = [];
    OwnerLastname = [];

    for (let i = 0; i < owners.length; i++) {
        const owner = owners[i];

        // Función para ocultar datos sensibles
        const maskSensitiveData = (value) => {
            if (!value) return '';
            return '•'.repeat(value.length);
        };

       
        if (!OwnerName.includes(owner.name)) {
            OwnerName.push(owner.name);
        }

        if (!OwnerLastname.includes(owner.lastname)) {
            OwnerLastname.push(owner.lastname);
        }

        ownerinfo.innerHTML += `
        <tr id="edit-form-${owner.id}" >
            <form class="edit_form" id="profileDataForm">
                <td data-label="Nº"><input name="id" type="text" value="${owner.id}" readonly></td>
                <td data-label="Nombre"><input name="name" type="text" value="${owner.name}" readonly autcomplete="name" ></td>
                <td data-label="Apellidos"><input name="lastname" type="text" value="${owner.lastname}" readonly autcomplete="family-name"></td>
                <td data-label="Usuario"><input name="username" type="text" value="${owner.username}" readonly ></td>
                <td data-label="Email"><input name="email" type="text" value="${owner.email}" readonly autcomplete="email"></td>
                <td data-label="DNI"><input name="dni" id="dniInput" type="text" value="${maskSensitiveData(owner.dni)}" data-real-value="${owner.dni}" readonly class="sensitive-field"></td>
                <td data-label="Teléfono"><input name="phone_number" type="text" value="${maskSensitiveData(owner.phone_number)}" data-real-value="${owner.phone_number}" readonly class="sensitive-field"></td>
                <td data-label="Cuenta Bancaria"><input name="bank_account" type="text" value="${maskSensitiveData(owner.bank_account)}" data-real-value="${owner.bank_account}" readonly class="sensitive-field"></td>
                <td data-label="Acciones">
                    <a href="#" id="edit-${owner.id}" class="edit-link" title="Editar Propietario" onclick="editOwner(${owner.id})"><i class="icon fas fa-edit"></i></a>
                    <a id="delete-${owner.id}" class="delete-link" title="Eliminar Propietario" onclick="deleteOwner(${owner.id})"><i class="icon fas fa-trash-alt"></i></a>
                    <button type="submit" form="profileDataForm" class="save-button" id="save-button-${owner.id}" onclick="updateOwner(${owner.id})" style="display:none;">Guardar</button>
                </td>
            </form>
        </tr>
        `;
        
    }

    // Agregar el evento al formulario para validar el DNI al enviar
    const profileDataForm = document.getElementById('profileDataForm');
    const dniInput = document.getElementById('dniInput');
    const dniError = document.createElement('div');
    dniError.id = 'dniError';
    dniError.style.color = 'red';
    dniError.style.display = 'none';
    dniError.innerText = 'El DNI no es válido.';
    dniInput.parentElement.appendChild(dniError);

    profileDataForm.addEventListener('submit', function(event) {
        const dniValue = dniInput.value.trim();

        // Validar el DNI
        if (!validarDNI(dniValue)) {
            event.preventDefault(); // Evitar el envío del formulario
            dniError.style.display = 'block'; // Mostrar el error
        } else {
            dniError.style.display = 'none'; // Ocultar el error
        }
    });
}

async function applyOwnersFilters() {

    const OwnerNameFilter = document.getElementById('OwnerName-filter').value;
    const OwnerLastnameFilter = document.getElementById('OwnerLastname-filter').value;
  
    try {
        const response = await fetch('/api-data'); // Ajusta la ruta según tu configuración
        if (!response.ok) {
            throw new Error('No se pudo obtener la información del servidor');
        }
  
        // Obtener los datos cifrados y las claves de la respuesta
        const { encryptedData, key, iv } = await response.json();
  
        // Descifrar los datos recibidos
        const data = await decryptData(encryptedData, key, iv);
  
        const owners = data.owner;
  
        // Filtros combinados
        let filteredOwners = owners;
  

        // Filtrar por NOMBRE CLIENTE
        if (OwnerNameFilter) {
            
            const filteredOwnerId = owners.find(owner => owner.name == OwnerNameFilter)?.id; // son 2 == porque tenantIDFilter es un string


            if (filteredOwnerId) {
                filteredOwners = filteredOwners.filter(owner => owner.name == OwnerNameFilter);
            } else {
                filteredOwners = [];  // Si no se encuentra el cliente, no hay almacenes
            }
            
        }

        // Filtrar por APELLIDO CLIENTE
        if (OwnerLastnameFilter) {
            
            const filteredOwnerId = owners.find(owner => owner.lastname == OwnerLastnameFilter)?.id; // son 2 == porque tenantIDFilter es un string

            if (filteredOwnerId) {
                filteredOwners = filteredOwners.filter(owner => owner.lastname == OwnerLastnameFilter);
            } else {
                filteredOwners = [];  // Si no se encuentra el cliente, no hay almacenes
            }
            
        }
  
        // Si no hay resultados, mostrar mensaje
        if (filteredOwners.length === 0) {
            const ownerinfo = document.getElementById('Owdata-content');
            ownerinfo.innerHTML = '<p>No se encontraron resultados para los filtros aplicados.</p>';
            return;
        }
  
        // Actualizar la vista con los almacenes filtrados
        const ownerinfo = document.getElementById('Owdata-content');
        ownerinfo.innerHTML = ''; // Limpiar tabla de almacenes actual
  
        renderOwners(filteredOwners);
  
    } catch (error) {
        console.error("Error al aplicar los filtros:", error);
    }
  }


function editOwner(ownerId) {
    const form = document.getElementById(`edit-form-${ownerId}`);

    // Obtener todos los input por la etiqueta name
    let inputs = form.querySelectorAll('input[name]');

    let listaInputs = [];

    inputs.forEach(function(input) {
        listaInputs.push(input);
        input.removeAttribute('readonly');
    });


    inputs.forEach(input => {
        if (input.classList.contains('sensitive-field')) {
            // Para campos sensibles, mostrar el valor real
            input.value = input.getAttribute('data-real-value');
        }
        input.readOnly = false;
    });

    // Mostrar el botón de guardar y ocultar el de editar y eliminar
    const saveButton = document.getElementById(`save-button-${ownerId}`);
    saveButton.style.display = 'inline-block';
    
    const editButton = document.getElementById(`edit-${ownerId}`);
    editButton.style.display = 'none';
    
    const deleteButton = document.getElementById(`delete-${ownerId}`);
    deleteButton.style.display = 'none';
    
}

function updateOwner(ownerID){
    
    const form = document.getElementById(`edit-form-${ownerID}`);
    let inputs = form.querySelectorAll('input[name]');
    let formData  = {};

    inputs.forEach(function(input) {
        formData [input.name] = input.value;
        input.removeAttribute('readonly');
    });

    // Validaciones de campos
    for (let input of inputs) {
        // Validar si el campo es solo lectura y no debe ser editado
        if (input.hasAttribute('readonly')) continue;

        // Validar campos numéricos (rental.id, EOid, premises_id, warehouse_id, tenant_id, etc.)
        if (input.name === "id" || input.name === "enterprise_id" || input.name === "owner_id" ) {
            if (!validateField(input, input.name, 'integer')) {
                return; // Si la validación falla, detener la ejecución
            }
        }

        // Validar fechas
        if (input.name === "email" && input.value !== "") {
            if (!validateField(input, "Correo electrónico", 'email')) {
                return; // Si la validación falla, detener la ejecución
            }
        }

        // Validar el campo de telefono
        if (input.name === "phone_number" && input.value !== "") {
            if (!validateField(input, "Telefono", 'phone')) {
                return; // Si la validación falla, detener la ejecución
            }
        }

        // Validar el campo de DNI
        if (input.name === "dni" && input.value !== "") {
            if (!validateField(input, "DNI", 'dni')) {
                return; 
            }
        }

        // Validar el campo de IBAN
        if (input.name === "bank_account" && input.value !== "") {
            if (!validateField(input, "Cuenta Bancaria", 'iban')) {
                return; 
            }
        }
        

        // Validar el campo 'tenant_name' (Cliente) para asegurarse de que no esté vacío
        if (input.name === "name" || input.name === "lastname" || input.name === "username") {
            if (!validateField(input, input.name, 'text')) {
                return; // Si la validación falla, detener la ejecución
            }
        }

    }


    fetch(`/update_owner/${ownerID}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            window.location.href = '/owners';
        })
        .catch(error => {
            window.location.href = '/owners';
        });

}

function deleteOwner(ownerID) {
    if (!confirm('¿Estás seguro de que deseas eliminar este propietario?')) {
        return; // Si el usuario cancela, no hacer nada
    }

    fetch(`/delete_owner/${ownerID}`, {
        method: 'POST'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error al eliminar propietario: ${response.status}`);
        }
        window.location.href = '/owners';
    })
    .catch(error => {
        alert('Error al eliminar propietario');
    });
}

// ---------------------------------------------------------------------------------------------------- //
// FUNCION PARA CARGAR EL PERFIL DE PROPIETARIO, EMPRESA O ADMINISTRADOR

async function cargarDatosDePerfil() {
    try {
        const response = await fetch('/api-data');
        if (!response.ok) {
            throw new Error('No se pudo obtener la información');
        }

        // Obtener los datos cifrados y las claves de la respuesta
        const { encryptedData, key, iv } = await response.json();

        // Descifrar los datos recibidos
        const data = await decryptData(encryptedData, key, iv);

        const administrator = data.administrator;
        const role = data.role;
        const viewing = data.viewing;

        

        if (role === 'owner' && viewing === 'withoutloggingin') {

            const owner_name = data.owner[0].name;
            const lastname = data.owner[0].lastname;
            const email = data.owner[0].email;
            const phone_number = data.owner[0].phone_number;
            const offers = data.offer;
            id = data.owner[0].id;

            const filteredOffers = offers.filter(offer => offer.owner_id);

            const profile_title = document.getElementById('profile-title');
            profile_title.textContent = `Perfil de ${owner_name}`;

            const profile_tools = document.getElementById('profile-tools');
            profile_tools.style.display = 'none';

            
            const urlContainer = document.getElementById('urlContainer');
            urlContainer.style.display = 'none';

            const profile_image = data.profile_image;
            const profileImageDiv2 = document.getElementById('profile-image2');
            profileImageDiv2.innerHTML = `<img src="${profile_image}" alt="Imagen de perfil" class="profile-img2">`;


            const nameContent = document.getElementById('name-container-profile');

            // Agregar la información del propietario
            nameContent.innerHTML = `<p>${owner_name}</p><p></p><p>${lastname}</p>`;

            const aboutContent = document.getElementById('about-container-profile');

            // Agregar la información del propietario
            aboutContent.innerHTML = `<p>Correo electrónico:</p><p>${email}</p>
                                      <p>Teléfono:</p><p>${phone_number}</p>`;


            const offersContent = document.getElementById('offers-container');

            // Verificar si la lista de propietarios está vacía
            if (filteredOffers.length === 0 ) {
                const noOffersMessage = document.createElement('p');
                noOffersMessage.innerHTML = 'No hay ofertas';
                offersContent.appendChild(noOffersMessage);
                
            } else {

                filteredOffers.forEach((offer, index) => {
                    // Crear un div para cada oferta
                    const offersDiv = document.createElement('div');
                    offersDiv.classList.add('offer-item');


                    // Agregar la imagen
                    offersDiv.innerHTML = `
                        <button type="button" id="offersButtonA-${index + 1}" class="offersButton" onclick="showOffersDiv2(${index + 1})">
                            <img src="${offer.images[0]}" alt="Offer Image" class="offer-image-profile">
                        </button>


                        <div class="overlay" id="show-offers-overlayA-${index + 1}" >
                            <div id="showOfferA-${index + 1}" class="offers-menu">
                            <form action="/upload_offer/${id}" method="POST" enctype="multipart/form-data">
                                
                                <h3>${offer.title}</h3>

                               <div class="carousel-container">
                                    <button type="button" class="prev" onclick="moveSlide(-1, ${index + 1})">&#10094;</button>
                                    <div class="carousel-images">
                                        ${offer.images.map((image, imgIndex) => `
                                            <img src="${image}" alt="Offer Image" class="offer-image-profile2" id="image-${index}-${imgIndex}" style="display: ${imgIndex === 0 ? 'block' : 'none'};">
                                        `).join('')}
                                    </div>
                                    <button type="button" class="next" onclick="moveSlide(1, ${index + 1})">&#10095;</button>
                                </div>

                                
                                <div class="warehouse-offer-info">
                                    <h4>Información del almacén</h4>

                                    <div class="warehouse-offer-info2" >
                                        <label>Dirección:</label>
                                        <p>${offer.address}</p>
                                        
                                        <label>Tamaño (m2):</label>
                                        <p>${offer.size} m2</p>
                                        
                                        <label>Precio de alquiler (€):</label>
                                        <p>${offer.rental_price} €</p>
                                        
                                        <label>Descripción:</label>
                                        <p>${offer.description}</p>
                                    </div>
                                
                                </div>
                                <div class="warehouse-offer-contact">
                                    <h4>Información de contacto</h4>
                                    
                                    <div class="warehouse-offer-contact2" >
                                        <label>Correo electrónico:</label>
                                        <p>${offer.email}</p>
                                        
                                        <label>Teléfono:</label>
                                        <p>${offer.phone_number}</p>
                                    </div>
                                </div>
                            
                            </form>
                            </div>
                        </div>

                    `;

                    offersContent.appendChild(offersDiv);
                })
            }
        } 


        else if (role === 'owner' ) {

            const profile_image = data.profile_image;
            const profileImageDiv2 = document.getElementById('profile-image2');
            profileImageDiv2.innerHTML = `<img src="${profile_image}" alt="Imagen de perfil" class="profile-img2">`;


            email = data.owner[0].email;
            phone_number = data.owner[0].phone_number;
            username = data.owner[0].username;
            const offers = data.offer;
            id = data.owner[0].id;
            const filteredOffers = offers.filter(offer => offer.owner_id);
            

            const nameContent = document.getElementById('name-container-profile');

            // Agregar la información del propietario
            nameContent.innerHTML = `<p>${username}</p>`;

            const aboutContent = document.getElementById('about-container-profile');

            // Agregar la información del propietario
            aboutContent.innerHTML = `<p>Correo electrónico:</p><p>${email}</p>
                                      <p>Teléfono:</p><p>${phone_number}</p>`;

            const offersContent = document.getElementById('offers-container');
            
        
            // Verificar si la lista de propietarios está vacía
            if (filteredOffers.length === 0 ) {
                const noOffersMessage = document.createElement('p');
                noOffersMessage.innerHTML = 'No hay ofertas';
                offersContent.appendChild(noOffersMessage);

                const createOffer = document.createElement('a');
                createOffer.classList.add('create-link-offers');
 
                createOffer.innerHTML = `

                    <a  id="profileButton" class="create-link-offers" onclick="showOffersDiv()">
                        <i class="fa-solid fa-square-plus"></i>
                        </br>
                        <p>Subir oferta</p>
                    </a>
             
                    <div class="overlay" id="offers-overlay" >
                        <div id="optionsOffersDiv" class="upload-offer-menu">
                            <form action="/upload_offer/${id}" method="POST" enctype="multipart/form-data">
                                <h3>Sube tu oferta</h3>

                                <div class="upload-warehouse-offer-info">
                                    <h4>Información del almacén</h4>

                                    <div class="upload-warehouse-offer-info2" >
                                        <label for="title">Título anuncio:</label>
                                        <input type="text" name="title" id="title" placeholder="Título anuncio" pattern="^[A-Za-záéíóúÁÉÍÓÚñÑüÜ0-9,. ]+$" required autocomplete="on"/>
                                        
                                        <label for="address">Dirección:</label>
                                        <input type="text" name="address" id="address" placeholder="Dirección" pattern="^[A-Za-záéíóúÁÉÍÓÚñÑüÜ0-9,. ]+$" required autocomplete="street-address"/>
                                            
                                        <label for="size">Tamaño (m2):</label>
                                        <input type="text" name="size" id="size" placeholder="Tamaño almacén (m2)"  required/>
                                            
                                        <label for="price">Precio de alquiler (€):</label>
                                        <input type="text" name="rental_price" id="price" placeholder="Precio de Alquiler (€)"  required/>
                                            
                                        <label for="description">Descripción (opcional):</label>
                                        <textarea name="description" id="description" placeholder="Descripción"></textarea>
                                    </div>
                                </div>

                                <div class="upload-warehouse-offer-contact">
                                    <h4>Información de contacto</h4>
                                        
                                    <div class="upload-warehouse-offer-contact2" >
                                        <label for="ownerEmail">Correo electrónico:</label>
                                        <input type="email" name="email" id="ownerEmail" placeholder="Correo electrónico" required autocomplete="email"/>
                                            
                                        <label for="phone_number">Teléfono:</label>
                                        <input type="text" name="phone_number" id="phone_number" placeholder="Teléfono" pattern="([0-9]{9})" required autocomplete="tel"/>
                                    </div>
                                </div>

                                <div class="upload-warehouse-offer-images">
                                    <h4>Imagenes del almacén</h4>
                                    <input type="file" name="images" id="fileInput" accept=".jpg, .jpeg, .png, .gif" title="Subir imagen de perfil" multiple>
                                </div>
                                
                                <input type="hidden" name="role" value="owner">
                            
                                <button type="submit">Enviar</button>
                                <button id="cancelButton" class="cancel" type="button" onclick="CancelButtonClick2()">Cancelar</button>
                            </form>
                        </div>
                    </div>
                `;
        
                offersContent.appendChild(createOffer);

            } else {

                filteredOffers.forEach((offer, index) => {

                    const offersDiv = document.createElement('div');
                    offersDiv.classList.add('offer-item');

                    offersDiv.innerHTML = `
                        <button type="button" id="offersButtonA-${index + 1}" class="offersButton" onclick="showOffersDiv2(${index + 1})"">
                            <img src="${offer.images[0]}" alt="Offer Image" class="offer-image-profile">
                        </button>


                        <div class="overlay" id="show-offers-overlayA-${index + 1}" >
                            <div id="showOfferA-${index + 1}" class="update-offer-menu">

                            <form action="/update_offer2/${offer.id}" method="POST" >

                                <h3>${offer.title}</h3>

                                <div class="carousel-container">
                                    <button type="button" class="prev" onclick="moveSlide(-1, ${index + 1})">&#10094;</button>
                                    <div class="carousel-images">
                                        ${offer.images.map((image, imgIndex) => `
                                            <img src="${image}" alt="Offer Image" class="offer-image-profile2" id="image-${index}-${imgIndex}" style="display: ${imgIndex === 0 ? 'block' : 'none'};">
                                        `).join('')}
                                    </div>
                                    <button type="button" class="next" onclick="moveSlide(1, ${index + 1})">&#10095;</button>
                                </div>

                                <div class="update-warehouse-offer-info">
                                    <h4>Información del almacén</h4>

                                    <div class="update-warehouse-offer-info2" >
                                        <label>Título anuncio:</label>
                                        <input type="text" name="title" value="${offer.title}" autocomplete="on"/>

                                        <label>Dirección:</label>
                                        <input type="text" name="address" value="${offer.address}" autocomplete="street-address"/>
                                        
                                        <label>Tamaño (m2):</label>
                                        <input type="text" name="size" value="${offer.size}"  />
                                        
                                        <label>Precio de alquiler (€):</label>
                                        <input type="text" name="rental_price" value="${offer.rental_price}" />
                                        
                                        <label>Descripción (opcional):</label>
                                        <textarea type="text" name="description" value="${offer.description}"></textarea>
                                    </div>
                                </div>

                                <div class="update-warehouse-offer-contact">
                                    <h4>Información de contacto</h4>
                                    
                                    <div class="update-warehouse-offer-contact2" >
                                        <label>Correo electrónico:</label>
                                        <input type="email" name="email" id="ownerEmail"  value="${offer.email}" autocomplete="email"/>
                                        
                                        <label>Teléfono:</label>
                                        <input type="text" name="phone_number" value="${offer.phone_number}" autocomplete="tel"/>
                                    </div>
                                </div>

                                <input type="hidden" name="username" value="${username}">
                            
                                <button type="submit" class="OfferButtons">Guardar</button>
                                <button id="cancelButton" class="OfferButtons" type="button" onclick="CancelButtonClick3(${index + 1})">Cancelar</button>
                                <a id="delete-${offer.id}" class="delete-link" title="Eliminar Oferta" onclick="deleteOffer(${offer.id})"><i class="fas fa-trash-alt"></i></a>

                                
                            </form>
                            </div>
                        </div>

                    `;

                    offersContent.appendChild(offersDiv);

                })

                const createOffer = document.createElement('a');
                createOffer.classList.add('create-link-offers');
 
                createOffer.innerHTML = `

                    <a  id="profileButton" class="create-link-offers" onclick="showOffersDiv()">
                        <i class="fa-solid fa-square-plus"></i>
                        </br>
                        <p>Subir oferta</p>
                    </a>
             
                    <div class="overlay" id="offers-overlay" >
                        <div id="optionsOffersDiv" class="upload-offer-menu">
                            <form action="/upload_offer/${id}" method="POST" enctype="multipart/form-data">
                                <h3>Sube tu oferta</h3>

                                <div class="upload-warehouse-offer-info">
                                    <h4>Información del almacén</h4>

                                    <div class="upload-warehouse-offer-info2" >
                                        <label for="title">Título anuncioo:</label>
                                        <input type="text" name="title" id="title" placeholder="Título anuncio" pattern="^[A-Za-záéíóúÁÉÍÓÚñÑüÜ0-9,. ]+$" required autocomplete="on"/>
                                        
                                        <label for="address">Dirección:</label>
                                        <input type="text" name="address" id="address" placeholder="Dirección" pattern="^[A-Za-záéíóúÁÉÍÓÚñÑüÜ0-9,. ]+$" required autocomplete="street-address"/>
                                            
                                        <label for="size">Tamaño (m2):</label>
                                        <input type="text" name="size" id="size" placeholder="Tamaño almacén (m2)"  required/>
                                            
                                        <label for="price">Precio de alquiler (€):</label>
                                        <input type="text" name="rental_price" id="price" placeholder="Precio de Alquiler (€)"  required/>
                                            
                                        <label for="description">Descripción (opcional):</label>
                                        <textarea name="description" id="description" placeholder="Descripción"></textarea>
                                    </div>
                                </div>

                                <div class="upload-warehouse-offer-contact">
                                    <h4>Información de contacto</h4>
                                        
                                    <div class="upload-warehouse-offer-contact2" >
                                        <label for="ownerEmail">Correo electrónico:</label>
                                        <input type="email" name="email" id="ownerEmail" placeholder="Correo electrónico" required autocomplete="email"/>
                                            
                                        <label for="phone_number">Teléfono:</label>
                                        <input type="text" name="phone_number" id="phone_number" placeholder="Teléfono" pattern="([0-9]{9})" required autocomplete="tel"/>
                                    </div>
                                </div>

                                <div class="upload-warehouse-offer-images">
                                    <h4>Imagenes del almacén</h4>
                                    <input type="file" name="images" id="fileInput" accept=".jpg, .jpeg, .png, .gif" title="Subir imagen de perfil" multiple>
                                </div>
                                
                                <input type="hidden" name="role" value="owner">
                            
                                <button type="submit">Enviar</button>
                                <button id="cancelButton" class="cancel" type="button" onclick="CancelButtonClick2()">Cancelar</button>
                            </form>
                        </div>
                    </div>
                `;
        
                offersContent.appendChild(createOffer);
            }
        }
        else if (role === 'enterprise' && viewing === 'withoutloggingin'){

            username = data.enterprise[0].username;
            enterprise_name = data.enterprise[0].name;
            address = data.enterprise[0].address;
            email = data.enterprise[0].email;
            phone_number = data.enterprise[0].phone_number;
            const offers = data.offer;
            id = data.enterprise[0].id;

            const filteredOffers = offers.filter(offer => offer.enterprise_id);

            const profile_title = document.getElementById('profile-title');
            profile_title.textContent = `Perfil de ${enterprise_name}`;

            const profile_tools = document.getElementById('profile-tools');
            profile_tools.style.display = 'none';

            const urlContainer = document.getElementById('urlContainer');
            urlContainer.style.display = 'none';

            const profile_image = data.profile_image;
            const profileImageDiv = document.getElementById('profile-image2');
            profileImageDiv.innerHTML = `<img src="${profile_image}" alt="Imagen de perfil" class="profile-img2">`;

            
            const nameContent = document.getElementById('name-container-profile');

            // Agregar la información del propietario
            nameContent.innerHTML = `<p>${enterprise_name}</p>`;

            const aboutContent = document.getElementById('about-container-profile');
            

            // Agregar la información del propietario

            aboutContent.innerHTML = `
            <p>Dirección:</p><p>${address}</p>
            <p>Correo electrónico:</p><p>${email}</p>
            <p>Teléfono:</p><p>${phone_number}</p>
            `;

            
            const offersContent = document.getElementById('offers-container');

            // Verificar si la lista de propietarios está vacía
            if (filteredOffers.length === 0) {
                const noOffersMessage = document.createElement('p');
                noOffersMessage.innerHTML = 'No hay ofertas';
                offersContent.appendChild(noOffersMessage);

            } else {

                filteredOffers.forEach((offer, index) => {
                    // Crear un div para cada oferta
                    const offersDiv = document.createElement('div');
                    offersDiv.classList.add('offer-item');


                    // Agregar la imagen
                    offersDiv.innerHTML = `
                        <button type="button" id="offersButtonA-${index + 1}" class="offersButton" onclick="showOffersDiv2(${index + 1})">
                            <img src="${offer.images[0]}" alt="Offer Image" class="offer-image-profile">
                        </button>


                        <div class="overlay" id="show-offers-overlayA-${index + 1}" >
                            <div id="showOfferA-${index + 1}" class="offers-menu">
                            <form action="/upload_offer/${id}" method="POST" enctype="multipart/form-data">
                                
                                <h3>${offer.title}</h3>

                               <div class="carousel-container">
                                    <button type="button" class="prev" onclick="moveSlide(-1, ${index + 1})">&#10094;</button>
                                    <div class="carousel-images">
                                        ${offer.images.map((image, imgIndex) => `
                                            <img src="${image}" alt="Offer Image" class="offer-image-profile2" id="image-${index}-${imgIndex}" style="display: ${imgIndex === 0 ? 'block' : 'none'};">
                                        `).join('')}
                                    </div>
                                    <button type="button" class="next" onclick="moveSlide(1, ${index + 1})">&#10095;</button>
                                </div>

                                
                                <div class="warehouse-offer-info">
                                    <h4>Información del almacén</h4>

                                    <div class="warehouse-offer-info2" >
                                        <label>Dirección:</label>
                                        <p>${offer.address}</p>
                                        
                                        <label>Tamaño (m2):</label>
                                        <p>${offer.size} m2</p>
                                        
                                        <label>Precio de alquiler (€):</label>
                                        <p>${offer.rental_price} €</p>
                                        
                                        <label>Descripción:</label>
                                        <p>${offer.description}</p>
                                    </div>
                                
                                </div>
                                <div class="warehouse-offer-contact">
                                    <h4>Información de contacto</h4>
                                    
                                    <div class="warehouse-offer-contact2" >
                                        <label>Correo electrónico:</label>
                                        <p>${offer.email}</p>
                                        
                                        <label>Teléfono:</label>
                                        <p>${offer.phone_number}</p>
                                    </div>
                                </div>
                            
                            </form>
                            </div>
                        </div>

                    `;

                    offersContent.appendChild(offersDiv);
                })
            }
        }

        else if (role === 'enterprise'){

            const profile_image = data.profile_image;
            const profileImageDiv = document.getElementById('profile-image2');
            profileImageDiv.innerHTML = `<img src="${profile_image}" alt="Imagen de perfil" class="profile-img2">`;

            const nameContent = document.getElementById('name-container-profile');

            enterprise_name = data.enterprise[0].name;

            // Agregar la información del propietario
            nameContent.innerHTML = `<p>${enterprise_name}</p>`;

            const aboutContent = document.getElementById('about-container-profile');

            username = data.enterprise[0].username;
            address = data.enterprise[0].address;
            email = data.enterprise[0].email;
            phone_number = data.enterprise[0].phone_number;
            const offers = data.offer;
            id = data.enterprise[0].id;
            const filteredOffers = offers.filter(offer => offer.enterprise_id);
            
            // Agregar la información del propietario
            aboutContent.innerHTML = `
            <p>Dirección:</p><p>${address}</p>
            <p>Correo electrónico:</p><p>${email}</p>
            <p>Teléfono:</p><p>${phone_number}</p>
            `;

            
            const offersContent = document.getElementById('offers-container');

            // Verificar si la lista de propietarios está vacía
            if (filteredOffers.length === 0) {
                const noOffersMessage = document.createElement('p');
                noOffersMessage.innerHTML = 'No hay ofertas';
                offersContent.appendChild(noOffersMessage);

                const createOffer = document.createElement('a');
                createOffer.classList.add('create-link-offers');

                createOffer.innerHTML = `

                    <a  id="profileButton" class="create-link-offers" onclick="showOffersDiv()">
                        <i class="fa-solid fa-square-plus"></i>
                        </br>
                        <p>Subir oferta</p>
                    </a>
             
                    <div class="overlay" id="offers-overlay" >
                        <div id="optionsOffersDiv" class="upload-offer-menu">
                            <form action="/upload_offer/${id}" method="POST" enctype="multipart/form-data">
                                <h3>Sube tu oferta</h3>

                                <div class="upload-warehouse-offer-info">
                                    <h4>Información del almacén</h4>

                                    <div class="upload-warehouse-offer-info2" >
                                        <label for="title">Título anuncio:</label>
                                        <input type="text" name="title" id="title" placeholder="Título anuncio" pattern="^[A-Za-záéíóúÁÉÍÓÚñÑüÜ0-9,. ]+$" required autocomplete="on"/>
                                        
                                        <label for="address">Dirección:</label>
                                        <input type="text" name="address" id="address" placeholder="Dirección" pattern="^[A-Za-záéíóúÁÉÍÓÚñÑüÜ0-9,. ]+$" required autocomplete="street-address"/>
                                            
                                        <label for="size">Tamaño (m2):</label>
                                        <input type="text" name="size" id="size" placeholder="Tamaño almacén (m2)"  required/>
                                            
                                        <label for="price">Precio de alquiler (€):</label>
                                        <input type="text" name="rental_price" id="price" placeholder="Precio de Alquiler (€)"  required/>
                                            
                                        <label for="description">Descripción (opcional):</label>
                                        <textarea name="description" id="description" placeholder="Descripción"></textarea>
                                    </div>
                                </div>

                                <div class="upload-warehouse-offer-contact">
                                    <h4>Información de contacto</h4>
                                        
                                    <div class="upload-warehouse-offer-contact2" >
                                        <label for="ownerEmail">Correo electrónico:</label>
                                        <input type="email" name="email" id="ownerEmail" placeholder="Correo electrónico" required autocomplete="email"/>
                                            
                                        <label for="phone_number">Teléfono:</label>
                                        <input type="text" name="phone_number" id="phone_number" placeholder="Teléfono" pattern="([0-9]{9})" required autocomplete="tel"/>
                                    </div>
                                </div>

                                <div class="upload-warehouse-offer-images">
                                    <h4>Imagenes del almacén</h4>
                                    <input type="file" name="images" id="fileInput" accept=".jpg, .jpeg, .png, .gif" title="Subir imagen de perfil" multiple>
                                </div>
                                
                                <input type="hidden" name="role" value="enterprise">
                            
                                <button type="submit">Enviar</button>
                                <button id="cancelButton" class="cancel" type="button" onclick="CancelButtonClick2()">Cancelar</button>
                            </form>
                        </div>
                    </div>
                `;
        
                offersContent.appendChild(createOffer);

            } else {

                filteredOffers.forEach((offer, index) => {

                    const offersDiv = document.createElement('div');
                    offersDiv.classList.add('offer-item');

                    offersDiv.innerHTML = `
                        <button type="button" id="offersButtonA-${index + 1}" class="offersButton" onclick="showOffersDiv2(${index + 1})"">
                            <img src="${offer.images[0]}" alt="Offer Image" class="offer-image-profile">
                        </button>


                        <div class="overlay" id="show-offers-overlayA-${index + 1}" >
                            <div id="showOfferA-${index + 1}" class="update-offer-menu">

                            <form action="/update_offer2/${offer.id}" method="POST" >

                                <h3>${offer.title}</h3>

                                <div class="carousel-container">
                                    <button type="button" class="prev" onclick="moveSlide(-1, ${index + 1})">&#10094;</button>
                                    <div class="carousel-images">
                                        ${offer.images.map((image, imgIndex) => `
                                            <img src="${image}" alt="Offer Image" class="offer-image-profile2" id="image-${index}-${imgIndex}" style="display: ${imgIndex === 0 ? 'block' : 'none'};">
                                        `).join('')}
                                    </div>
                                    <button type="button" class="next" onclick="moveSlide(1, ${index + 1})">&#10095;</button>
                                </div>

                                <div class="update-warehouse-offer-info">
                                    <h4>Información del almacén</h4>

                                    <div class="update-warehouse-offer-info2" >
                                        <label>Títul anuncioo:</label>
                                        <input type="text" name="title" value="${offer.title}" autocomplete="on"/>

                                        <label>Dirección:</label>
                                        <input type="text" name="address" value="${offer.address}" autocomplete="street-address"/>
                                        
                                        <label>Tamaño (m2):</label>
                                        <input type="text" name="size" value="${offer.size}"  />
                                        
                                        <label>Precio de alquiler (€):</label>
                                        <input type="text" name="rental_price" value="${offer.rental_price}" />
                                        
                                        <label>Descripción (opcional):</label>
                                        <textarea name="description" value="${offer.description}"></textarea>
                                    </div>
                                </div>

                                <div class="update-warehouse-offer-contact">
                                    <h4>Información de contacto</h4>
                                    
                                    <div class="update-warehouse-offer-contact2" >
                                        <label>Correo electrónico:</label>
                                        <input type="email" name="email" id="ownerEmail"  value="${offer.email}" autocomplete="email"/>
                                        
                                        <label>Teléfono:</label>
                                        <input type="text" name="phone_number" value="${offer.phone_number}" autocomplete="tel"/>
                                    </div>
                                </div>

                                <input type="hidden" name="username" value="${username}">
                            
                                <button type="submit" class="OfferButtons">Guardar</button>
                                <button id="cancelButton" class="OfferButtons" type="button" onclick="CancelButtonClick3(${index + 1})">Cancelar</button>
                                <a id="delete-${offer.id}" class="delete-link" title="Eliminar Oferta" onclick="deleteOffer(${offer.id})"><i class="fas fa-trash-alt"></i></a>

                                
                            </form>
                            </div>
                        </div>

                    `;

                    offersContent.appendChild(offersDiv);

                })

                const createOffer = document.createElement('a');
                createOffer.classList.add('create-link-offers');
 
                createOffer.innerHTML = `

                    <a  id="profileButton" class="create-link-offers" onclick="showOffersDiv()">
                        <i class="fa-solid fa-square-plus"></i>
                        </br>
                        <p>Subir oferta</p>
                    </a>
             
                    <div class="overlay" id="offers-overlay" >
                        <div id="optionsOffersDiv" class="upload-offer-menu">
                            <form action="/upload_offer/${id}" method="POST" enctype="multipart/form-data">
                                <h3>Sube tu oferta</h3>

                                <div class="upload-warehouse-offer-info">
                                    <h4>Información del almacén</h4>

                                    <div class="upload-warehouse-offer-info2" >
                                        <label for="title">Título anuncio:</label>
                                        <input type="text" name="title" id="title" placeholder="Título anuncio" pattern="^[A-Za-záéíóúÁÉÍÓÚñÑüÜ0-9,. ]+$" required autocomplete="on"/>
                                        
                                        <label for="address">Dirección:</label>
                                        <input type="text" name="address" id="address" placeholder="Dirección" pattern="^[A-Za-záéíóúÁÉÍÓÚñÑüÜ0-9,. ]+$" required autocomplete="street-address"/>
                                            
                                        <label for="size">Tamaño (m2):</label>
                                        <input type="text" name="size" id="size" placeholder="Tamaño almacén (m2)"  required/>
                                            
                                        <label for="price">Precio de alquiler (€):</label>
                                        <input type="text" name="rental_price" id="price" placeholder="Precio de Alquiler (€)"  required/>
                                            
                                        <label for="description">Descripción (opcional):</label>
                                        <textarea name="description" id="description" placeholder="Descripción"></textarea>
                                    </div>
                                </div>

                                <div class="upload-warehouse-offer-contact">
                                    <h4>Información de contacto</h4>
                                        
                                    <div class="upload-warehouse-offer-contact2" >
                                        <label for="ownerEmail">Correo electrónico:</label>
                                        <input type="email" name="email" id="ownerEmail" placeholder="Correo electrónico" required autocomplete="email"/>
                                            
                                        <label for="phone_number">Teléfono:</label>
                                        <input type="text" name="phone_number" id="phone_number" placeholder="Teléfono" pattern="([0-9]{9})" required autocomplete="tel"/>
                                    </div>
                                </div>

                                <div class="upload-warehouse-offer-images">
                                    <h4>Imagenes del almacén</h4>
                                    <input type="file" name="images" id="fileInput" accept=".jpg, .jpeg, .png, .gif" title="Subir imagen de perfil" multiple>
                                </div>
                                
                                <input type="hidden" name="role" value="enterprise">
                            
                                <button type="submit">Enviar</button>
                                <button id="cancelButton" class="cancel" type="button" onclick="CancelButtonClick2()">Cancelar</button>
                            </form>
                        </div>
                    </div>
                `;
        
                offersContent.appendChild(createOffer);
                
            }
        }

        
        else if (role === 'administrator' && viewing === 'withoutloggingin') {
            
         
            const profile_title = document.getElementById('profile-title');
            profile_title.textContent = 'Perfil del administrador';

            const profile_tools = document.getElementById('profile-tools');
            profile_tools.style.display = 'none';

            const urlContainer = document.getElementById('urlContainer');
            urlContainer.style.display = 'none';


            const profile_image = data.profile_image;
            const profileImageDiv = document.getElementById('profile-image2');
            profileImageDiv.innerHTML = `<img src="${profile_image}" alt="Imagen de perfil" class="profile-img2">`;

            username = data.administrator.username;
            email = data.administrator.email;
            const offers = data.offer;
            id = data.administrator.id;
            const filteredOffers = offers.filter(offer => offer.administrator_id);


            const nameContent = document.getElementById('name-container-profile');

            // Agregar la información del admin
            nameContent.innerHTML = `<p>${username}</p>`;

            const aboutContent = document.getElementById('about-container-profile');

            // Agregar la información del admin
            aboutContent.innerHTML = `<p>Correo electrónico:</p><p>${email}</p>`;
            
            const offersContent = document.getElementById('offers-container');

            // Verificar si la lista de propietarios está vacía
            if (filteredOffers.length === 0) {
                const noOffersMessage = document.createElement('p');
                noOffersMessage.innerHTML = 'No hay ofertas';
                offersContent.appendChild(noOffersMessage);

            } else {

                filteredOffers.forEach((offer, index) => {
                    // Crear un div para cada oferta
                    const offersDiv = document.createElement('div');
                    offersDiv.classList.add('offer-item');


                    // Agregar la imagen
                    offersDiv.innerHTML = `
                        <button type="button" id="offersButtonA-${index + 1}" class="offersButton" onclick="showOffersDiv2(${index + 1})">
                            <img src="${offer.images[0]}" alt="Offer Image" class="offer-image-profile">
                        </button>


                        <div class="overlay" id="show-offers-overlayA-${index + 1}" >
                            <div id="showOfferA-${index + 1}" class="offers-menu">
                            <form action="/upload_offer/${id}" method="POST" enctype="multipart/form-data">
                                
                                <h3>${offer.title}</h3>

                               <div class="carousel-container">
                                    <button type="button" class="prev" onclick="moveSlide(-1, ${index + 1})">&#10094;</button>
                                    <div class="carousel-images">
                                        ${offer.images.map((image, imgIndex) => `
                                            <img src="${image}" alt="Offer Image" class="offer-image-profile2" id="image-${index}-${imgIndex}" style="display: ${imgIndex === 0 ? 'block' : 'none'};">
                                        `).join('')}
                                    </div>
                                    <button type="button" class="next" onclick="moveSlide(1, ${index + 1})">&#10095;</button>
                                </div>

                                
                                <div class="warehouse-offer-info">
                                    <h4>Información del almacén</h4>

                                    <div class="warehouse-offer-info2" >
                                        <label>Dirección:</label>
                                        <p>${offer.address}</p>
                                        
                                        <label>Tamaño (m2):</label>
                                        <p>${offer.size} m2</p>
                                        
                                        <label>Precio de alquiler (€):</label>
                                        <p>${offer.rental_price} €</p>
                                        
                                        <label>Descripción:</label>
                                        <p>${offer.description}</p>
                                    </div>
                                
                                </div>
                                <div class="warehouse-offer-contact">
                                    <h4>Información de contacto</h4>
                                    
                                    <div class="warehouse-offer-contact2" >
                                        <label>Correo electrónico:</label>
                                        <p>${offer.email}</p>
                                        
                                        <label>Teléfono:</label>
                                        <p>${offer.phone_number}</p>
                                    </div>
                                </div>
                            
                            </form>
                            </div>
                        </div>

                    `;

                    offersContent.appendChild(offersDiv);
                })
            }
        }
        else if (role === 'administrator') {


            const profile_image = data.profile_image;
            const profileImageDiv = document.getElementById('profile-image2');
            profileImageDiv.innerHTML = `<img src="${profile_image}" alt="Imagen de perfil" class="profile-img2">`;

            username = data.administrator[0].username;
            email = data.administrator[0].email;
            id = data.administrator[0].id;
            const offers = data.offer;
            const filteredOffers = offers.filter(offer => offer.administrator_id);
  
            const nameContent = document.getElementById('name-container-profile');

            // Agregar la información del admin
            nameContent.innerHTML = `<p>${username}</p>`;

            const aboutContent = document.getElementById('about-container-profile');

            // Agregar la información del admin
            aboutContent.innerHTML = `<p>Correo electrónico:</p><p>${email}</p>`;

            const offersContent = document.getElementById('offers-container');

            // PARA SUBIR OFERTA
            if (filteredOffers.length === 0) {
                
                const noOffersMessage = document.createElement('p');
                noOffersMessage.innerHTML = 'No hay ofertas';
                offersContent.appendChild(noOffersMessage);

                const createOffer = document.createElement('a');
                createOffer.classList.add('create-link-offers');
 
                createOffer.innerHTML = `

                    <a  id="profileButton" class="create-link-offers" onclick="showOffersDiv()">
                        <i class="fa-solid fa-square-plus"></i>
                        </br>
                        <p>Subir oferta</p>
                    </a>
             
                    <div class="overlay" id="offers-overlay" >
                        <div id="optionsOffersDiv" class="upload-offer-menu">
                            <form action="/upload_offer/${id}" method="POST" enctype="multipart/form-data">
                                <h3>Sube tu oferta</h3>

                                <div class="upload-warehouse-offer-info">
                                    <h4>Información del almacén</h4>

                                    <div class="upload-warehouse-offer-info2" >
                                        <label for="title">Título anuncio:</label>
                                        <input type="text" name="title" id="title" placeholder="Título anuncio" pattern="^[A-Za-záéíóúÁÉÍÓÚñÑüÜ0-9,. ]+$" required autocomplete="on"/>
                                        
                                        <label for="address">Dirección:</label>
                                        <input type="text" name="address" id="address" placeholder="Dirección" pattern="^[A-Za-záéíóúÁÉÍÓÚñÑüÜ0-9,. ]+$" required autocomplete="street-address"/>
                                            
                                        <label for="size">Tamaño (m2):</label>
                                        <input type="text" name="size" id="size" placeholder="Tamaño almacén (m2)"  required/>
                                            
                                        <label for="price">Precio de alquiler (€):</label>
                                        <input type="text" name="rental_price" id="price" placeholder="Precio de Alquiler (€)"  required/>
                                            
                                        <label for="description">Descripción (opcional):</label>
                                        <textarea name="description" id="description" placeholder="Descripción"></textarea>
                                    </div>
                                </div>

                                <div class="upload-warehouse-offer-contact">
                                    <h4>Información de contacto</h4>
                                        
                                    <div class="upload-warehouse-offer-contact2" >
                                        <label for="ownerEmail">Correo electrónico:</label>
                                        <input type="email" name="email" id="ownerEmail" placeholder="Correo electrónico" required autocomplete="email"/>
                                            
                                        <label for="phone_number">Teléfono:</label>
                                        <input type="text" name="phone_number" id="phone_number" placeholder="Teléfono" pattern="([0-9]{9})" required autocomplete="tel"/>
                                    </div>
                                </div>

                                <div class="upload-warehouse-offer-images">
                                    <h4>Imagenes del almacén</h4>
                                    <input type="file" name="images" id="fileInput" accept=".jpg, .jpeg, .png, .gif" title="Subir imagen de perfil" multiple>
                                </div>
                                
                                <input type="hidden" name="role" value="administrator">
                            
                                <button type="submit">Enviar</button>
                                <button id="cancelButton" class="cancel" type="button" onclick="CancelButtonClick2()">Cancelar</button>
                            </form>
                        </div>
                    </div>
                `;
        
                offersContent.appendChild(createOffer);


            } else {

                filteredOffers.forEach((offer, index) => {

                    const offersDiv = document.createElement('div');
                    offersDiv.classList.add('offer-item');

                    offersDiv.innerHTML = `
                        <button type="button" id="offersButtonA-${index + 1}" class="offersButton" onclick="showOffersDiv2(${index + 1})"">
                            <img src="${offer.images[0]}" alt="Offer Image" class="offer-image-profile">
                        </button>


                        <div class="overlay" id="show-offers-overlayA-${index + 1}" >
                            <div id="showOfferA-${index + 1}" class="update-offer-menu">

                            <form action="/update_offer2/${offer.id}" method="POST" >

                                <h3>${offer.title}</h3>

                                <div class="carousel-container">
                                    <button type="button" class="prev" onclick="moveSlide(-1, ${index + 1})">&#10094;</button>
                                    <div class="carousel-images">
                                        ${offer.images.map((image, imgIndex) => `
                                            <img src="${image}" alt="Offer Image" class="offer-image-profile2" id="image-${index}-${imgIndex}" style="display: ${imgIndex === 0 ? 'block' : 'none'};">
                                        `).join('')}
                                    </div>
                                    <button type="button" class="next" onclick="moveSlide(1, ${index + 1})">&#10095;</button>
                                </div>

                                <div class="update-warehouse-offer-info">
                                    <h4>Información del almacén</h4>

                                    <div class="update-warehouse-offer-info2" >
                                        <label for="title">Título anuncio:</label>
                                        <input type="text" name="title" id="title" value="${offer.title}" autocomplete="on"/>

                                        <label for="address" >Dirección:</label>
                                        <input type="text" name="address" id="address" value="${offer.address}" autocomplete="street-address"/>
                                        
                                        <label for="size">Tamaño (m2):</label>
                                        <input type="text" name="size" id="size" value="${offer.size}"  />
                                        
                                        <label for="price">Precio de alquiler (€):</label>
                                        <input type="text" name="rental_price" id="price" value="${offer.rental_price}" />
                                        
                                        <label for="description">Descripción (opcional):</label>
                                        <textarea type="text" name="description" id="description" value="${offer.description}"></textarea>
                                    </div>
                                </div>

                                <div class="update-warehouse-offer-contact">
                                    <h4>Información de contacto</h4>
                                    
                                    <div class="update-warehouse-offer-contact2" >
                                        <label for="ownerEmail">Correo electrónico:</label>
                                        <input type="email" name="email" id="ownerEmail"  value="${offer.email}" autocomplete="email"/>
                                        
                                        <label for="phone_number">Teléfono:</label>
                                        <input type="text" name="phone_number" id="phone_number" value="${offer.phone_number}" autocomplete="tel"/>
                                    </div>
                                </div>

                                <input type="hidden" name="username" value="${username}">
                            
                                <button type="submit" class="OfferButtons">Guardar</button>
                                <button id="cancelButton" class="OfferButtons" type="button" onclick="CancelButtonClick3(${index + 1})">Cancelar</button>
                                <a id="delete-${offer.id}" class="delete-link" title="Eliminar Oferta" onclick="deleteOffer(${offer.id})"><i class="fas fa-trash-alt"></i></a>

                                
                            </form>
                            </div>
                        </div>

                    `;

                    offersContent.appendChild(offersDiv);

                })

                const createOffer = document.createElement('a');
                createOffer.classList.add('create-link-offers');
 
                createOffer.innerHTML = `

                    <a  id="profileButton" class="create-link-offers" onclick="showOffersDiv()">
                        <i class="fa-solid fa-square-plus"></i>
                        </br>
                        <p>Subir oferta</p>
                    </a>
             
                    <div class="overlay" id="offers-overlay" >
                        <div id="optionsOffersDiv" class="upload-offer-menu">
                            <form action="/upload_offer/${id}" method="POST" enctype="multipart/form-data">
                                <h3>Sube tu oferta</h3>

                                <div class="upload-warehouse-offer-info">
                                    <h4>Información del almacén</h4>

                                    <div class="upload-warehouse-offer-info2" >
                                        <label for="title">Título anuncio:</label>
                                        <input type="text" name="title" id="title" placeholder="Título anuncio" pattern="^[A-Za-záéíóúÁÉÍÓÚñÑüÜ0-9,. ]+$" required autocomplete="on"/>
                                        
                                        <label for="address">Dirección:</label>
                                        <input type="text" name="address" id="address" placeholder="Dirección" pattern="^[A-Za-záéíóúÁÉÍÓÚñÑüÜ0-9,. ]+$" required autocomplete="street-address"/>
                                            
                                        <label for="size">Tamaño (m2):</label>
                                        <input type="text" name="size" id="size" placeholder="Tamaño almacén (m2)"  required/>
                                            
                                        <label for="price">Precio de alquiler (€):</label>
                                        <input type="text" name="rental_price" id="price" placeholder="Precio de Alquiler (€)"  required/>
                                            
                                        <label for="description">Descripción (opcional):</label>
                                        <textarea name="description" id="description" placeholder="Descripción"></textarea>
                                    </div>
                                </div>

                                <div class="upload-warehouse-offer-contact">
                                    <h4>Información de contacto</h4>
                                        
                                    <div class="upload-warehouse-offer-contact2" >
                                        <label for="ownerEmail">Correo electrónico:</label>
                                        <input type="email" name="email" id="ownerEmail" placeholder="Correo electrónico" required autocomplete="email"/>
                                            
                                        <label for="phone_number">Teléfono:</label>
                                        <input type="text" name="phone_number" id="phone_number" placeholder="Teléfono" pattern="([0-9]{9})" required autocomplete="tel"/>
                                    </div>
                                </div>

                                <div class="upload-warehouse-offer-images">
                                    <h4>Imagenes del almacén</h4>
                                    <input type="file" name="images" id="fileInput" accept=".jpg, .jpeg, .png, .gif" title="Subir imagen de perfil" multiple>
                                </div>
                                
                                <input type="hidden" name="role" value="administrator">
                            
                                <button type="submit">Enviar</button>
                                <button id="cancelButton" class="cancel" type="button" onclick="CancelButtonClick2()">Cancelar</button>
                            </form>
                        </div>
                    </div>
                `;
        
                offersContent.appendChild(createOffer);
            }
        }

        else {
            throw new Error('Rol de usuario desconocido');
        }


    } catch (error) {
        console.error('Error al cargar los datos:', error.message);
    }
}

// ---------------------------------------------------------------------------------------------------- //
// FUNCION PARA BORRAR LA OFERTA
function deleteOffer(offerId) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta oferta?')) {
        return;
    }

    fetch(`/delete_offer/${offerId}`, {
        method: 'POST'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error al eliminar la oferta: ${response.status}`);
        }
        window.location.href = `/home`;
    })
    .catch(error => {
        alert('Error al eliminar el alquiler');
    });
}


// ---------------------------------------------------------------------------------------------------- //
// FUNCION PARA MOSTRA LAS OPCIONES DE CAMBIAR LA IMAGEN DE PERFIL
function openFileSelector() {
  document.getElementById('fileInput').click();
}

function submitForm() {
  document.getElementById('profileForm').submit();
}

// Define la función normal
function CancelButtonClick2() {
    const optionsOffersDiv = document.getElementById('optionsOffersDiv');
    const overlay = document.getElementById('offers-overlay');

    if (optionsOffersDiv && overlay) {
        optionsOffersDiv.style.display = 'none';
        overlay.style.position = 'relative';
    } else {
        console.error('optionsOffersDiv or overlay not found');
    }
}


// ---------------------------------------------------------------------------------------------------- //
// FUNCIONES PARA MOSTRAR EL DIV DE SUBIR OFERTA
function showOffersDiv() {
    var optionsOffersDiv = document.getElementById('optionsOffersDiv');
    var overlay = document.getElementById('offers-overlay');
    optionsOffersDiv.style.display = 'block';
    overlay.style.position = 'fixed';

}

// ---------------------------------------------------------------------------------------------------- //
// FUNCION PARA CERRAR EL DIV CUANDO SE HACE CLIC FUERA DEL DIV
document.addEventListener('click', function(event) {
    const optionsOffersDiv = document.getElementById('optionsOffersDiv');
    const profileButton = document.getElementById('profileButton');
    const overlay = document.getElementById('offers-overlay');
    
    if (optionsOffersDiv !== null && profileButton !== null) {
        if (!optionsOffersDiv.contains(event.target) && !profileButton.contains(event.target)) {
            optionsOffersDiv.style.display = 'none';
            overlay.style.position = 'relative';
        }
    }
});

// ---------------------------------------------------------------------------------------------------- //
// FUNCIONES PARA VER LA OFERTA CON LOS DATOS

// FUNCION PARA MOSTRA EL DIV DE CAMBIAR LA IMAGEN DE PERFIL
function showOffersDiv2(index) {
    var showOffer = document.getElementById('showOfferA-' + index);
    var overlay2 = document.getElementById('show-offers-overlayA-' + index);
    
    var header_invoice = document.getElementById('header-invoice');
    var header_notification = document.getElementById('header-notification');


    header_invoice.style.zIndex = 0;
    header_notification.style.zIndex = 0;

    showOffer.style.display = 'block';
    overlay2.style.position = 'fixed';
}

// FUNCION PARA CERRAR EL DIV CUANDO SE HACE CLIC FUERA DEL DIV
document.addEventListener('click', function(event) {

    const offersDivs = document.querySelectorAll('.offer-item');

    var header_invoice = document.getElementById('header-invoice');
    var header_notification = document.getElementById('header-notification');

    offersDivs.forEach((offerDiv, index) => {
        const showOffer = document.getElementById('showOfferA-' + (index + 1));  // ID dinámico de showOffer
        const offersButton = document.getElementById('offersButtonA-' + (index + 1)); // ID dinámico de offersButton
        var overlay2 = document.getElementById('show-offers-overlayA-' + (index + 1)); // ID dinámico de overlay

        // Verifica si el clic fue fuera del div o botón
        if (showOffer !== null && offersButton !== null) {
            if (!showOffer.contains(event.target) && !offersButton.contains(event.target)) {
                showOffer.style.display = 'none';
                overlay2.style.position = 'relative';  // Ajuste de la posición del overlay
                header_invoice.style.zIndex = 3;
                header_notification.style.zIndex = 3;
            }
        }
    });
});

// ---------------------------------------------------------------------------------------------------- //
// FUNCION PARA MOSTRA LAS OPCIONES DE CAMBIAR LA IMAGEN DE PERFIL
function openFileSelector() {
    document.getElementById('fileInput').click();
}
  
function submitForm() {
    document.getElementById('profileForm').submit();
}
  

function CancelButtonClick3(index) {
    const showOffer = document.getElementById('showOfferA-' + index);
    var overlay2 = document.getElementById('show-offers-overlayA-' + index);

    var header_invoice = document.getElementById('header-invoice');
    var header_notification = document.getElementById('header-notification');
    
    header_invoice.style.zIndex = 3;
    header_notification.style.zIndex = 3;
  
    if (showOffer && overlay2) {
        showOffer.style.display = 'none';
        overlay2.style.position = 'relative';
    } else {
        console.error('showOffer or overlay not found');
    }
}

// ---------------------------------------------------------------------------------------------------- //
// FUNCIÓN PARA PASAR IMAGENES DEL CARROUSEL
function moveSlide(direction, carouselIndex) {
    const carousel = document.querySelector(`#showOfferA-${carouselIndex} .carousel-images`);
    if (!carousel) {
        return;
    }

    const images = carousel.querySelectorAll('.offer-image-profile2');
    const totalImages = images.length;

    if (totalImages === 0) {
        return;
    }

    // Buscar la imagen actualmente visible
    let currentIndex = Array.from(images).findIndex(image => image.style.display === 'block');
    images[currentIndex].style.display = 'none';

    // Actualizar el índice
    currentIndex = (currentIndex + direction + totalImages) % totalImages;

    // Mostrar la nueva imagen
    images[currentIndex].style.display = 'block';
}



//-------------------------------------------------------------------------------//
// FUNCION PARA VALIDAR LOS INPUTS DE LAS TABLAS
function validateField(input, fieldName, validationType) {
    const value = input.value.trim();
    let isValid = true;

    // Validación de número entero
    if (validationType === 'integer') {
        isValid = /^[0-9]*$/.test(value);
        if (!isValid) {
            alert(`El campo "${fieldName}" debe ser un número entero válido.`);
        }
    }
    // Validación de precio (número con 2 decimales)
    else if (validationType === 'price') {
        isValid = /^\d+(\.\d{1,2})?$/.test(value);
        if (!isValid) {
            alert("El precio debe ser un número válido con hasta 2 decimales.");
        }
    }
    // Validación de fecha (YYYY-MM-DD)
    else if (validationType === 'date') {
        isValid = /^(0[0-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}/.test(value);
        if (!isValid) {
            alert(`La fecha de ${fieldName} debe tener el formato YYYY-MM-DD.`);
        }
    }

    // Validación de tamño 
    else if (validationType === 'size') {
        isValid = /^\d+(\.\d{1,2})?$/.test(value);
        if (!isValid) {
            alert(`El tamaño  ${fieldName} debe tener el formato X o X,x.`);
        }
    }

    // Validación de tamño 
    else if (validationType === 'email') {
        isValid = /^([a-z]+[a-z1-9._-]*)@{1}([a-z1-9\.]{2,})\.([a-z]{2,3})$/.test(value);
        if (!isValid) {
            alert(`El email  ${fieldName} debe tener el formato corrcto.`);
        }
    }

    // Validación de tamaño 
    else if (validationType === 'phone') {
        isValid = /^([0-9]{9})/.test(value);
        if (!isValid) {
            alert(`El tamaño  ${fieldName} debe tener el formato xxxxxxxxx.`);
        }
    }

    // Validación de texto no vacío
    else if (validationType === 'text') {
        isValid = value !== '';
        if (!isValid) {
            alert(`El campo "${fieldName}" no puede estar vacío.`);
        }
    }



    // Validación de DNI español
    else if (validationType === 'dni') {
        isValid = validateDNI(value);
        if (!isValid) {
            alert(`El campo "${fieldName}" debe ser un DNI español válido.`);
        }
    }


    // Validación de CIF español
    else if (validationType === 'cif') {
        isValid = cifValido(value);
        if (!isValid) {
            alert(`El campo "${fieldName}" debe ser un CIF español válido.`);
        }
    }

    // Validación de IBAN español
    else if (validationType === 'iban') {
        isValid = validarIBAN(value);
        if (!isValid) {
            alert(`El campo "${fieldName}" debe ser un IBAN español válido.`);
        }
    }

    if (!isValid) {
        input.focus();
    }

    return isValid;
}


// ---------------------------------------------------------------------------------------------------- //
// FUNCIÓN VALIDAR DNI

function validateDNI(dni) {
    // Verifica si el formato es correcto
    if (!/^\d{8}[A-Z]$/.test(dni)) {
        return false;
    }

    // Extrae el número y la letra
    const number = dni.slice(0, 8);
    const letter = dni.slice(8).toUpperCase();

    // Letras válidas
    const letters = "TRWAGMYFPDXBNJZSQVHLCKE".split('');

    // Calcula el índice de la letra válida
    const index = parseInt(number, 10) % 23;

    // Verifica si la letra corresponde con el número
    return letter === letters[index];
}

// ---------------------------------------------------------------------------------------------------- //
// FUNCIÓN VALIDAR CIF

function cifValido(cif) {
    // Convertir a mayúsculas
    cif = cif.toUpperCase();
    
    // Expresiones regulares para validar el formato
    const cifRegEx1 = /^[ABEH][0-9]{8}$/i;
    const cifRegEx2 = /^[KPQS][0-9]{7}[A-J]$/i;
    const cifRegEx3 = /^[CDFGJLMNRUVW][0-9]{7}[0-9A-J]$/i;
    
    // Validar el formato básico
    if (cifRegEx1.test(cif) || cifRegEx2.test(cif) || cifRegEx3.test(cif)) {

        // Obtener el dígito de control
        const control = cif[cif.length - 1];
        
        let sumaA = 0;
        let sumaB = 0;
        
        // Calcular sumas para la validación
        for (let i = 1; i < 8; i++) {
            
            if (i % 2 === 0) {
                sumaA += parseInt(cif[i]);
            } else {
                const t = (parseInt(cif[i]) * 2).toString();
                let p = 0;
                
                // Sumar los dígitos del resultado
                for (let j = 0; j < t.length; j++) {
                    p += parseInt(t[j]);
                }
                sumaB += p;
            }
        }
        
        // Calcular dígito de control esperado
        const sumaC = (sumaA + sumaB).toString();
        const sumaD = (10 - parseInt(sumaC[sumaC.length - 1])) % 10;
        const letras = "JABCDEFGHI";
        
        // Validar según si el control es número o letra
        if (!isNaN(control)) {
            return parseInt(control) === sumaD;
        } else {
            return control === letras[sumaD];
        }
    }
    return false;
}

// ---------------------------------------------------------------------------------------------------- //
// FUNCIÓN VALIDAR IBAN

function validarIBAN(iban) {

    iban = iban.replace(/\s+/g, '').toUpperCase();

    // Comprobar que la longitud esté entre 15 y 34 caracteres
    if (iban.length < 15 || iban.length > 34) {
        return false;
    }

    // Reorganizar el IBAN: mover los primeros 4 caracteres al final
    const ibanReorganizado = iban.slice(4) + iban.slice(0, 4);

    // Convertir las letras a números (A=10, B=11, ..., Z=35)
    let ibanNumerico = '';
    for (let i = 0; i < ibanReorganizado.length; i++) {
        const char = ibanReorganizado[i];
        if (char >= '0' && char <= '9') {
            ibanNumerico += char;
        } else if (char >= 'A' && char <= 'Z') {
            ibanNumerico += (char.charCodeAt(0) - 'A'.charCodeAt(0) + 10);
        } else {
            return false;  // Si hay caracteres inválidos
        }
    }

    // Comprobar el módulo 97
    const mod97 = BigInt(ibanNumerico) % 97n;
    return mod97 === 1n;
}