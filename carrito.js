let cart = [];

function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            nombre: product.nombre,
            precio: product.precio,
            imagen: product.imagen,
            quantity: 1
        });
    }

    updateCartUI();
    alert('Producto agregado al carrito!');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
}

function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');

    if (cartCount) {
        cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    if (cartItems) {
        cartItems.innerHTML = '';
        let total = 0;

        cart.forEach(item => {
            const itemTotal = item.precio * item.quantity;
            total += itemTotal;

            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img src="${item.imagen || 'https://via.placeholder.com/50'}" alt="${item.nombre}" style="width: 50px; height: 50px; object-fit: cover;">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.nombre}</div>
                    <div class="cart-item-price">$${item.precio.toFixed(2)} x ${item.quantity}</div>
                </div>
                <div class="cart-item-total">$${itemTotal.toFixed(2)}</div>
                <button class="remove-btn" onclick="removeFromCart('${item.id}')">❌</button>
            `;
            cartItems.appendChild(cartItem);
        });

        if (cartTotal) {
            cartTotal.textContent = total.toFixed(2);
        }
    }
}

function openCart() {
    document.getElementById('cartModal').style.display = 'flex';
    initializeCartEvents();
}

function closeCart() {
    document.getElementById('cartModal').style.display = 'none';
}

function initializeCartEvents() {
    const deliveryRadios = document.querySelectorAll('input[name="deliveryType"]');
    if (deliveryRadios.length > 0) {
        deliveryRadios.forEach(radio => {
            radio.addEventListener('change', function () {
                const addressField = document.getElementById('addressField');
                if (addressField) {
                    addressField.style.display = this.value === 'domicilio' ? 'block' : 'none';
                }
            });
        });
    }
}

window.onclick = function (event) {
    if (event.target.id === 'cartModal') {
        closeCart();
    }
}

async function placeOrder() {
    console.log("📍 placeOrder() ejecutándose...");

    if (cart.length === 0) {
        alert('El carrito está vacío');
        return;
    }

    let deliveryType, address, telefono;

    try {
        const deliveryTypeElement = document.querySelector('input[name="deliveryType"]:checked');
        if (!deliveryTypeElement) {
            deliveryType = 'local';
        } else {
            deliveryType = deliveryTypeElement.value;
        }

        if (deliveryType === 'domicilio') {
            const nameElement = document.getElementById('customerName');
            const addressElement = document.getElementById('deliveryAddress');
            const phoneElement = document.getElementById('deliveryPhone');

            customerName = nameElement ? nameElement.value : '';
            address = addressElement ? addressElement.value : '';
            telefono = phoneElement ? phoneElement.value : '';

            // Validar campos de domicilio
            if (!customerName || customerName.trim() === '') {
                alert('Por favor ingresa el nombre del cliente');
                return;
            }
            if (!address || address.trim() === '') {
                alert('Por favor ingresa la dirección de entrega');
                return;
            }
            if (!telefono || telefono.trim() === '') {
                alert('Por favor ingresa tu número de teléfono');
                return;
            }
        } else {
            customerName = 'Cliente Local';
            address = 'Recoger en local';
            telefono = 'No aplica';
        }

    } catch (error) {
        alert('Error en el formulario de entrega');
        return;
    }

    try {
        if (!window.firebaseDB || !window.firebaseFunctions) {
            throw new Error("Firebase no está configurado");
        }

        const db = window.firebaseDB;
        const { collection, addDoc } = window.firebaseFunctions;

        const orderData = {
            productos: cart,
            total: cart.reduce((sum, item) => sum + (item.precio * item.quantity), 0),
            tipoEntrega: deliveryType,
            cliente: customerName,  // ← NUEVO: nombre real del cliente
            direccion: address,
            telefono: telefono,
            fecha: new Date(),
            estado: 'pendiente'
        };

        const docRef = await addDoc(collection(db, "pedidos"), orderData);

        alert('¡Pedido realizado con éxito! Será atendido pronto.');

        cart = [];
        updateCartUI();
        closeCart();

    } catch (error) {
        console.error("❌ Error realizando pedido:", error);
        alert("Error al realizar el pedido: " + error.message);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    initializeCartEvents();
});