// =======================
// Configuración general
// =======================
const API_URL = "https://my.api.mockaroo.com/books?key=c8e6a0a0&page=";
const TOTAL_PAGES = 4;
const BOOKS_PER_PAGE = 15;

const categoryNames = {
    'ficcion': 'Ficción',
    'no-ficcion': 'No ficción',
    'ciencia': 'Ciencia',
    'historia': 'Historia',
    'drama': 'Drama',
    'comedy': 'Comedia',
    'horror': 'Terror'
};

const CART_KEY = 'biblioteca_cart_v1';

// =======================
// Estado de la app
// =======================
let currentPage = 1;
let books = [];      // Solo los libros de la página actual
let allBooks = [];   // TODOS los libros vistos (de todas las páginas): aquí buscamos para el carrito
let cart = {};       // { [idLibro]: cantidad }

// =======================
// Fetch de API y manejo de datos
// =======================
async function fetchBooks(page = 1) {
    showError("");
    try {
        const response = await fetch(API_URL + page);
        if (!response.ok) throw new Error("Error de red. Código: " + response.status);
        const data = await response.json();

        if (!data.results || !Array.isArray(data.results)) throw new Error("Error: formato de datos inválido.");

        // Mapea los campos a la estructura interna esperada por la app
        return data.results.slice(0, BOOKS_PER_PAGE).map(book => ({
            id: book.id,
            title: book.name,
            author: book.author,
            category: (book.gender ? book.gender.split('|')[0].trim().toLowerCase() : "ficcion"),
            cover: book.image_url,
            price: book.price
        }));
    } catch (err) {
        showError(err.message || "Ocurrió un error al cargar los libros.");
        return [];
    }
}

// =======================
// Catálogo: renderizado y paginador
// =======================
async function loadAndRenderPage(page = 1) {
    if (page < 1 || page > TOTAL_PAGES) {
        showError("Página fuera de rango.");
        return;
    }
    const pageBooks = await fetchBooks(page);

    // Agrega libros nunca vistos a allBooks (solo si no están por ID)
    pageBooks.forEach(book => {
        if (!allBooks.some(b => b.id === book.id)) {
            allBooks.push(book);
        }
    });

    books = pageBooks;
    renderBooks(pageBooks);
    renderPaginator();
}

function renderBooks(booksToShow = []) {
    const bookCatalog = document.getElementById('bookCatalog');
    bookCatalog.innerHTML = '';
    if (booksToShow.length === 0) {
        bookCatalog.innerHTML = "<p style='padding:2em; text-align:center;'>No hay libros disponibles.</p>";
        return;
    }

    booksToShow.forEach(book => {
        const price = book.price ?? 150;
        const cover = book.cover ? book.cover : "covers/default.jpg";
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        bookCard.innerHTML = `
            <img src="${cover}" alt="${book.title}" class="book-cover">
            <div class="book-title">${book.title}</div>
            <div class="book-author">por ${book.author}</div>
            <span class="book-category">${categoryNames[book.category] || book.category}</span>
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

function renderPaginator() {
    const pagDiv = document.getElementById("paginator");
    pagDiv.innerHTML = "";
    for (let i = 1; i <= TOTAL_PAGES; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        btn.className = "paginator-btn" + (i === currentPage ? " active" : "");
        btn.disabled = i === currentPage;
        btn.onclick = () => {
            if (i !== currentPage) {
                currentPage = i;
                loadAndRenderPage(currentPage);
            }
        };
        pagDiv.appendChild(btn);
    }
}

// =======================
// Carrito: lógica y rendering
// =======================
function guardarCarritoLS() { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
function cargarCarritoLS()  { const data = localStorage.getItem(CART_KEY); if (data) cart = JSON.parse(data); }

function obtenerCantidadTotal() { return Object.values(cart).reduce((a, b) => a + b, 0); }
function obtenerTotalCarrito() {
    return Object.entries(cart).reduce(
        (acc, [bookId, cantidad]) => {
            const book = allBooks.find(b => b.id == bookId);
            if (book) return acc + (book.price || 0) * cantidad;
            return acc;
        }, 0
    );
}

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

function renderCartCount() {
    document.getElementById('cartCount').textContent = obtenerCantidadTotal();
}

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
        const book = allBooks.find(b => b.id == bookId);
        if (!book) continue; // Evita fallos si el usuario agregó libros nunca vistos en la sesión (raro)
        const price = book.price ?? 150;
        const cover = book.cover ? book.cover : "covers/default.jpg";
        const item = document.createElement('div');
        item.className = 'cart-item';
        item.innerHTML = `
            <img src="${cover}" alt="${book.title}" class="cart-item-cover">
            <div class="cart-item-info">
                <span>${book.title} <small>por ${book.author}</small></span>
                <span>Precio: $${price}</span>
                <span>
                  <button class="cart-decrease" data-id="${book.id}" title="Quitar uno">-</button>
                  <span class="cart-cantidad">${cantidad}</span>
                  <button class="cart-increase" data-id="${book.id}" title="Agregar uno">+</button>
                </span>
                <span>Subtotal: $${(cantidad * price).toFixed(2)}</span>
                <button class="cart-remove" data-id="${book.id}" title="Eliminar del carrito">Eliminar</button>
            </div>
        `;
        cartItemsDiv.appendChild(item);
    }
    document.getElementById('cartTotal').textContent = obtenerTotalCarrito().toFixed(2);
    cartItemsDiv.querySelectorAll('.cart-increase').forEach(btn =>
        btn.addEventListener('click', () => {
            agregarAlCarrito(btn.dataset.id);
            renderCartModal();
        })
    );
    cartItemsDiv.querySelectorAll('.cart-decrease').forEach(btn =>
        btn.addEventListener('click', () => {
            quitarDelCarrito(btn.dataset.id);
            renderCartModal();
        })
    );
    cartItemsDiv.querySelectorAll('.cart-remove').forEach(btn =>
        btn.addEventListener('click', () => {
            eliminarDelCarrito(btn.dataset.id);
            renderCartModal();
        })
    );
}

// =======================
// Filtros y eventos globales
// =======================
function filterBooks(category) {
    const filteredBooks = category === 'all' ? books : books.filter(book => book.category === category);
    renderBooks(filteredBooks);
    // Mantén los botones activos correctamente
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-category') === category);
    });
}

function toggleFilters() {
    const filters = document.getElementById('filters');
    const toggle = document.querySelector('.mobile-filter-toggle');
    filters.classList.toggle('show');
    toggle.textContent = filters.classList.contains('show') ? 'Ocultar Filtros' : 'Mostrar Filtros';
}

// =======================
// Paginador UX
// =======================
// (renderPaginator ya definido arriba)


// =======================
// Manejo de errores
// =======================
function showError(msg) {
    const ele = document.getElementById("errorMsg");
    if (!ele) return;
    ele.textContent = msg;
    ele.style.display = msg ? "block" : "none";
}

// =======================
// Eventos de la UI y filtros
// =======================

document.getElementById('cartButton').addEventListener('click', abrirCarrito);
document.getElementById('closeModal').addEventListener('click', cerrarCarrito);
window.addEventListener('click', (e) => {
    if (e.target == document.getElementById('cartModal')) cerrarCarrito();
});
document.getElementById('emptyCartBtn').addEventListener('click', () => {
    vaciarCarrito();
    renderCartModal();
});

// Filtros de categorías (sidebar)
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
// Inicialización principal
// =======================
(function main() {
    cargarCarritoLS();
    renderCartCount();
    loadAndRenderPage(currentPage);
})();