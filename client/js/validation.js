// ICONO OJO DE LA CONTRASEÑA
function togglePassword() {
    const passwordInput = document.getElementById('passwordInput');
    const passwordIcon = document.getElementById('togglePassword');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        passwordIcon.src = "../assets/ojo-abierto.png";
    } else {
        passwordInput.type = 'password';
        passwordIcon.src = "../assets/ojo-cerrado.png";
    }
}

function ConfirmTogglePassword() {
    const passwordInput = document.getElementById('passwordInput2');
    const passwordIcon = document.getElementById('confirm-togglePassword');
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        passwordIcon.src = "../assets/ojo-abierto.png";
    } else {
        passwordInput.type = 'password';
        passwordIcon.src = "../assets/ojo-cerrado.png";
    }
}


// FUNCIONES CÓDIGO RECUPERACIÓN

function handleInput(currentInput, nextInputName, prevInputName, event) {
    const maxLength = parseInt(currentInput.getAttribute('maxlength'));
    const currentLength = currentInput.value.length;

    if (event.type === 'paste') {
        handlePaste(event, currentInput.getAttribute('name'));
    } else {
        if (event.keyCode === 8 && currentLength === 0 && prevInputName) {
            const prevInput = document.querySelector(`input[name='${prevInputName}']`);
            if (prevInput) {
                prevInput.focus();
            }
        } else if (currentLength >= maxLength && nextInputName) {
            const nextInput = document.querySelector(`input[name='${nextInputName}']`);
            if (nextInput) {
                nextInput.focus();
            }
        }
    }
}

// FUNCIÓN COPIAR Y PEGAR 
function handlePaste(event, currentInput) {
    event.preventDefault();
    const clipboardData = event.clipboardData || window.clipboardData;
    const pastedText = clipboardData.getData('text').replace(/\D/g, '');

    const inputs = Array.from(document.querySelectorAll("input[name^='digit']"));

    for (let i = 0; i < pastedText.length && i < inputs.length; i++) {
        inputs[i].value = pastedText[i];
        if (i < inputs.length - 1) {
            inputs[i].dispatchEvent(new Event('input'));
        }
    }
}



function validateLoginEmail() {
    let loginEmail = document.getElementById("loginEmail").value;
    loginEmail = loginEmail.replace(/\s+/g, "").toLowerCase();

    var patron = /^([a-z]+[a-z1-9._-]*)@{1}([a-z1-9\.]{2,})\.([a-z]{2,3})$/;
    const EmailLoginError = document.getElementById('EmailLoginError');

    if (!loginEmail.search(patron)) {
        EmailLoginError.style.display = 'none';
    } else {
        EmailLoginError.style.display = 'block';
    }
}

function validateRecoveryEmail() {
    let recoveryEmail = document.getElementById("recoveryEmail").value;
    recoveryEmail = ownerEmail.replace(/\s+/g, "").toLowerCase();

    var patron = /^([a-z]+[a-z1-9._-]*)@{1}([a-z1-9\.]{2,})\.([a-z]{2,3})$/;
    const EmailRecoveryError = document.getElementById('EmailRecoveryError');

    if (!recoveryEmail.search(patron)) {
        EmailRecoveryError.style.display = 'none';
    } else {
        EmailRecoveryError.style.display = 'block';
    }
}

function validateTenantEmail() {
    let tenantEmail = document.getElementById("tenantEmail").value;
    tenantEmail = ownerEmail.replace(/\s+/g, "").toLowerCase();

    var patron = /^([a-z]+[a-z1-9._-]*)@{1}([a-z1-9\.]{2,})\.([a-z]{2,3})$/;
    const EmailTenantError = document.getElementById('EmailTenantError');

    if (!tenantEmail.search(patron)) {
        EmailTenantError.style.display = 'none';
    } else {
        EmailTenantError.style.display = 'block';
    }
}

function validateEnterpriseEmail() {
    let enterpriseEmail = document.getElementById("enterpriseEmail").value;
    enterpriseEmail = ownerEmail.replace(/\s+/g, "").toLowerCase();

    var patron = /^([a-z]+[a-z1-9._-]*)@{1}([a-z1-9\.]{2,})\.([a-z]{2,3})$/;
    const EmailEnterpriseError = document.getElementById('EmailEnterpriseError');

    if (!enterpriseEmail.search(patron)) {
        EmailEnterpriseError.style.display = 'none';
    } else {
        EmailEnterpriseError.style.display = 'block';
    }
}

function validateOwnerEmail() {
    let ownerEmail = document.getElementById("ownerEmail").value;
    ownerEmail = ownerEmail.replace(/\s+/g, "").toLowerCase();

    var patron = /^([a-z]+[a-z1-9._-]*)@{1}([a-z1-9\.]{2,})\.([a-z]{2,3})$/;
    const EmailOwnerError = document.getElementById('EmailOwnerError');

    if (!ownerEmail.search(patron)) {
        EmailOwnerError.style.display = 'none';
    } else {
        EmailOwnerError.style.display = 'block';
    }
}


// Funciones de validación globales
function validateDNI() {
    dni = document.getElementById("dni").value;
    var patron = /^[0-9]{8}[A-Za-z]$/;
    const letters = "TRWAGMYFPDXBNJZSQVHLCKE";
    const DNIError = document.getElementById('DNIError');

    const number = dni.slice(0, 8);
    const letter = dni.slice(8).toUpperCase();
    const expectedLetter = letters[number % 23];

    if (!dni.search(patron) && letter === expectedLetter) {
        DNIError.style.display = 'none';
        return true;
    
    } else {
        DNIError.style.display = 'block';
        return false;
    }

    
}



// Función de validación del IBAN
function validarIBAN() {
    let iban = document.getElementById("bank_account").value;
    const IbanError = document.getElementById("IbanError");

    // Eliminar espacios y convertir a mayúsculas
    iban = iban.replace(/\s+/g, "").toUpperCase();

    // Comprobar que la longitud esté entre 15 y 34 caracteres
    if (iban.length < 15 || iban.length > 34) {
        IbanError.style.display = "block";
        return false;
    }

    // Reorganizar el IBAN: mover los primeros 4 caracteres al final
    const ibanReorganizado = iban.slice(4) + iban.slice(0, 4);

    // Convertir las letras a números (A=10, B=11, ..., Z=35)
    let ibanNumerico = "";
    for (let i = 0; i < ibanReorganizado.length; i++) {
        const char = ibanReorganizado[i];
        if (char >= "0" && char <= "9") {
            ibanNumerico += char;
        } else if (char >= "A" && char <= "Z") {
            ibanNumerico += char.charCodeAt(0) - "A".charCodeAt(0) + 10;
        } else {
            IbanError.style.display = "block";
            return false; // Caracter inválido encontrado
        }
    }

    // Comprobar el módulo 97
    const mod97 = BigInt(ibanNumerico) % 97n;
    if (mod97 !== 1n) {
        IbanError.style.display = "block";
        return false;
    }

    // Si es válido, ocultar el mensaje de error
    IbanError.style.display = "none";
    return true;
}

// Función de validación del CIF con logs para depuración
function validateCIF() {
    let cif = document.getElementById("cif").value;
    const cifError = document.getElementById("cifError");


    // Convertir a mayúsculas
    cif = cif.toUpperCase();

    // Expresiones regulares para validar el formato
    const cifRegEx1 = /^[ABEH][0-9]{8}$/i;
    const cifRegEx2 = /^[KPQS][0-9]{7}[A-J]$/i;
    const cifRegEx3 = /^[CDFGJLMNRUVW][0-9]{7}[0-9A-J]$/i;

    // Validar el formato básico
    if (!(cifRegEx1.test(cif) || cifRegEx2.test(cif) || cifRegEx3.test(cif))) {
        cifError.style.display = "block";
        return false;
    }
    console.log("Formato del CIF válido");

    // Obtener el dígito de control
    const control = cif[cif.length - 1];

    let sumaA = 0;
    let sumaB = 0;

    // Calcular sumas para la validación
    for (let i = 1; i < 8; i++) {
        let num = parseInt(cif[i]);

        if (i % 2 === 0) {
            sumaA += num;
        } else {
            const t = (num * 2).toString();
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
        if (parseInt(control) !== sumaD) {
            cifError.style.display = "block";
            return false;
        }
    } else {
        if (control !== letras[sumaD]) {
            cifError.style.display = "block";
            return false;
        }
    }

    // Si es válido, ocultar el mensaje de error
    cifError.style.display = "none";
    return true;
}