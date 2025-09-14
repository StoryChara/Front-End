# Taller JS - Eventos biblioteca

## Objetivo del Taller
Desarrollar un sistema de carrito de compras funcional para una librería en línea, aplicando conceptos de JavaScript, manipulación del DOM y gestión de datos JSON.

## Requisitos previos:
- Proyecto base del sitio web de la biblioteca
- Conocimientos en HTML, CSS y JavaScript
- Familiaridad con arrays y objetos JSON

## Instrucciones:
1. Estructura de datos:
    - Crear un array de objetos JSON con información de al menos 8 libros
    - Cada libro debe incluir: título, autor, precio, imagen y otros datos relevantes

2. Interfaz de usuario:
    - Implementar un botón 'Agregar al carrito' para cada libro mostrado
    - Añadir un ícono de carrito en el header que muestre la cantidad de items
    - El ícono debe actualizarse dinámicamente al agregar/quitar productos

3. Funcionalidad del carrito:
    - Al hacer clic en el ícono del carrito, mostrar un modal o página con:
        - Lista de productos seleccionados
        - Cantidad de cada producto
        - Precio unitario y total
        - Opciones para modificar cantidades o eliminar productos

4. Persistencia de datos:
   - Mantener la información del carrito aunque se recargue la página
   - Utilizar localStorage para almacenar los datos del carrito

## Criterios de evaluación:
- Correcta implementación de la estructura JSON 
- Funcionalidad completa del carrito de compras 
- Diseño responsivo y experiencia de usuario 
- Calidad y organización del código 
- Manejo de errores y casos extremos 