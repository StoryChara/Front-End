// =======================
// Datos
// =======================

const books = [
    { id: 1, title: "El Ingenioso Hidalgo Don Quijote de la Mancha", author: "Miguel de Cervantes", category: "ficcion", cover: "covers/1.gif", price: 210 },
    { id: 2, title: "Cien años de soledad", author: "Gabriel García Márquez", category: "ficcion", cover: "covers/2.gif", price: 240 },
    { id: 3, title: "1984", author: "George Orwell", category: "ficcion", cover: "covers/3.jpg", price: 180 },
    { id: 4, title: "Sapiens: De animales a dioses", author: "Yuval Noah Harari", category: "historia", cover: "covers/4.jpg", price: 215 },
    { id: 5, title: "Breve historia del tiempo", author: "Stephen Hawking", category: "ciencia", cover: "covers/5.webp", price: 175 },
    { id: 6, title: "El origen de las especies", author: "Charles Darwin", category: "ciencia", cover: "covers/6.jpg", price: 195 },
    { id: 7, title: "Historia del mundo en 12 mapas", author: "Jerry Brotton", category: "historia", cover: "covers/7.jpg", price: 165 },
    { id: 8, title: "El arte de la guerra", author: "Sun Tzu", category: "historia", cover: "covers/8.webp", price: 130 },
    { id: 9, title: "Cosmos", author: "Carl Sagan", category: "ciencia", cover: "covers/9.webp", price: 200 },
    { id: 10, title: "La metamorfosis", author: "Franz Kafka", category: "ficcion", cover: "covers/10.jpg", price: 150 },
    { id: 11, title: "Pensar rápido, pensar despacio", author: "Daniel Kahneman", category: "no-ficcion", cover: "covers/11.jpg", price: 205 },
    { id: 12, title: "Padre rico, padre pobre", author: "Robert Kiyosaki", category: "no-ficcion", cover: "covers/12.jpg", price: 160 }
];

const categoryNames = {
    'ficcion': 'Ficción',
    'no-ficcion': 'No ficción',
    'ciencia': 'Ciencia',
    'historia': 'Historia'
};

const CART_KEY = 'biblioteca_cart_v1';
let cart = {};

function guardarCarritoLS() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function cargarCarritoLS() {
    const data = localStorage.getItem(CART_KEY);
    if (data) cart = JSON.parse(data);
}

function obtenerCantidadTotal() {
    return Object.values(cart).reduce((a, b) => a + b, 0);
}

function obtenerTotalCarrito() {
    return Object.entries(cart).reduce(
        (acc, [bookId, cantidad]) => {
            const book = books.find(b => b.id == bookId);
            if (book) return acc + (book.price || 0) * cantidad;
            return acc;
        }, 0
    );
}

// =======================
// Renderizar libros
// =======================
function renderBooks(booksToShow = books) {
    const bookCatalog = document.getElementById('bookCatalog');
    bookCatalog.innerHTML = '';
    booksToShow.forEach(book => {
        const price = book.price ?? 150;
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        bookCard.innerHTML = `
            <img src="${book.cover}" alt="${book.title}" class="book-cover">
            <div class="book-title">${book.title}</div>
            <div class="book-author">por ${book.author}</div>
            <span class="book-category">${categoryNames[book.category]}</span>
            <div class="book-price"><strong>$${price}</strong></div>
            <button class="add-cart-btn" data-id="${book.id}">Agregar al carrito</button>
        `;
        bookCatalog.appendChild(bookCard);
    });
    document.querySelectorAll('.add-cart-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            agregarAlCarrito(btn.dataset.id);
        });
    });
}

// =======================
// Carrito: lógica y funciones
// =======================
function agregarAlCarrito(bookId) {
    cart[bookId] = (cart[bookId] || 0) + 1;
    renderCartCount();
    guardarCarritoLS();
}

function quitarDelCarrito(bookId) {
    if (cart[bookId]) {
        cart[bookId]--;
        if (cart[bookId] <= 0) delete cart[bookId];
        renderCartCount();
        guardarCarritoLS();
    }
}

function eliminarDelCarrito(bookId) {
    if (cart[bookId] !== undefined) {
        delete cart[bookId];
        renderCartCount();
        guardarCarritoLS();
    }
}

function vaciarCarrito() {
    cart = {};
    renderCartCount();
    guardarCarritoLS();
}

// =======================
// Header y modal
// =======================
function renderCartCount() {
    document.getElementById('cartCount').textContent = obtenerCantidadTotal();
}

// Modal
function abrirCarrito() {
    renderCartModal();
    document.getElementById('cartModal').style.display = 'flex';
}

function cerrarCarrito() {
    document.getElementById('cartModal').style.display = 'none';
}

function renderCartModal() {
    const cartItemsDiv = document.getElementById('cartItems');
    cartItemsDiv.innerHTML = '';
    if (Object.keys(cart).length === 0) {
        cartItemsDiv.innerHTML = '<p>Carrito vacío.</p>';
        document.getElementById('cartTotal').textContent = '0';
        return;
    }
    for (const [bookId, cantidad] of Object.entries(cart)) {
        const book = books.find(b => b.id == bookId);
        if (!book) continue;
        const price = book.price ?? 150;
        const item = document.createElement('div');
        item.className = 'cart-item';
        item.innerHTML = `
            <img src="${book.cover}" alt="${book.title}" class="cart-item-cover">
            <div class="cart-item-info">
                <span>${book.title} <small>por ${book.author}</small></span>
                <span>Precio: $${price}</span>
                <span>
                  <button class="cart-decrease" data-id="${book.id}" title="Quitar uno">-</button>
                  <span class="cart-cantidad">${cantidad}</span>
                  <button class="cart-increase" data-id="${book.id}" title="Agregar uno">+</button>
                </span>
                <span>Subtotal: $${(cantidad * price)}</span>
                <button class="cart-remove" data-id="${book.id}" title="Eliminar del carrito">Eliminar</button>
            </div>
        `;
        cartItemsDiv.appendChild(item);
    }
    document.getElementById('cartTotal').textContent = obtenerTotalCarrito();
    cartItemsDiv.querySelectorAll('.cart-increase').forEach(btn =>
        btn.addEventListener('click', () => { agregarAlCarrito(btn.dataset.id); renderCartModal(); })
    );
    cartItemsDiv.querySelectorAll('.cart-decrease').forEach(btn =>
        btn.addEventListener('click', () => { quitarDelCarrito(btn.dataset.id); renderCartModal(); })
    );
    cartItemsDiv.querySelectorAll('.cart-remove').forEach(btn =>
        btn.addEventListener('click', () => { eliminarDelCarrito(btn.dataset.id); renderCartModal(); })
    );
}

// =======================
// Filtros y eventos globales
// =======================

function filterBooks(category) {
    const filteredBooks = category === 'all' ? books : books.filter(book => book.category === category);
    renderBooks(filteredBooks);
}

function toggleFilters() {
    const filters = document.getElementById('filters');
    const toggle = document.querySelector('.mobile-filter-toggle');
    filters.classList.toggle('show');
    toggle.textContent = filters.classList.contains('show') ? 'Ocultar Filtros' : 'Mostrar Filtros';
}

// Modal eventos
document.getElementById('cartButton').addEventListener('click', abrirCarrito);
document.getElementById('closeModal').addEventListener('click', cerrarCarrito);
window.addEventListener('click', (e) => {
    if (e.target == document.getElementById('cartModal')) cerrarCarrito();
});
document.getElementById('emptyCartBtn').addEventListener('click', () => {
    vaciarCarrito();
    renderCartModal();
});

// Filtros
const filterButtons = document.querySelectorAll('.filter-btn');
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        const category = button.getAttribute('data-category');
        filterBooks(category);
    });
});

// =======================
// Inicialización
// =======================
(function main() {
    cargarCarritoLS();
    renderCartCount();
    renderBooks();
})();