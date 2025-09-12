// Variables para almacenar los valores y la operación
let valorActual = '0';
let operadorPendiente = null;
let valorAnterior = null;
// Elementos del DOM
const pantalla = document.getElementById('pantalla');
const botones = document.querySelectorAll('button');
// Añadir event listener a todos los botones
botones.forEach(boton => {
    boton.addEventListener('click', function() {
    // Diferentes acciones según el tipo de botón
        if (boton.classList.contains('numero')) {
            ingresarNumero(boton.textContent);
        } else if (boton.classList.contains('operador')) {
            aplicarOperador(boton.textContent);
        } else if (boton.id === 'igual') {
            calcularResultado();
        } else if (boton.id === 'decimal') {
            ingresarDecimal();
        } else if (boton.id === 'limpiar') {
            limpiarCalculadora();
        }
        // Actualizar la pantalla
        actualizarPantalla();
    });
});

function ingresarNumero(numero) {
    if (valorActual === '0') {
        valorActual = numero;
    } else {
        valorActual += numero;
    }
}

function ingresarDecimal() {
    if (!valorActual.includes('.')) {
        valorActual += '.';
    }
}

function aplicarOperador(operador) {
    if (operadorPendiente !== null) {
        calcularResultado();
    }
    valorAnterior = valorActual;
    valorActual = '0';
    operadorPendiente = operador;
}

function calcularResultado() {
    if (operadorPendiente === null) return;
    const num1 = parseFloat(valorAnterior);
    const num2 = parseFloat(valorActual);
    switch(operadorPendiente) {
        case '+': valorActual = (num1 + num2).toString(); break;
        case '-': valorActual = (num1 - num2).toString(); break;
        case '*': valorActual = (num1 * num2).toString(); break;
        case '/': valorActual = (num1 / num2).toString(); break;
        case '^': valorActual = Math.pow(num1, num2).toString(); break; // Nuevo caso para potencia
    }
    operadorPendiente = null;
    valorAnterior = null;
}

function limpiarCalculadora() {
    valorActual = '0';
    operadorPendiente = null;
    valorAnterior = null;
}

function actualizarPantalla() {
    pantalla.textContent = valorActual;
}