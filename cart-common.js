// Common Cart Management System
class CartManager {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.init();
    }

    init() {
        this.updateCartCount();
        this.updatePopupCart();
        this.bindEvents();
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    updateCartCount() {
        const count = this.cart.length;
        const countElements = document.querySelectorAll('.cart .count, .cart-count');
        countElements.forEach(el => el.textContent = count);
    }

    updatePopupCart() {
        const container = document.getElementById('popup-cart-items');
        if (!container) return;

        if (this.cart.length === 0) {
            container.innerHTML = `
                <div class="empty-cart text-center py-4">
                    <i class="fas fa-shopping-cart text-muted mb-3" style="font-size: 3rem;"></i>
                    <p class="text-muted">Your cart is empty</p>
                </div>
            `;
            const subtotalEl = document.getElementById('cart-subtotal');
            if (subtotalEl) subtotalEl.textContent = '$0.00';
            return;
        }

        let html = '';
        let subtotal = 0;

        this.cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;

            html += `
                <div class="cart-item mb-3 pb-3 border-bottom" data-id="${item.id}">
                    <div class="d-flex align-items-center gap-3">
                        <img src="${item.image}" alt="${item.name}" class="cart-item-image" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
                        <div class="flex-grow-1">
                            <h6 class="mb-1 fw-semibold">${item.name}</h6>
                            <div class="d-flex align-items-center justify-content-between">
                                <div class="quantity-controls d-flex align-items-center">
                                    <button class="btn btn-sm btn-outline-secondary px-2 py-1 decrease-popup-qty" style="font-size: 12px;">-</button>
                                    <span class="mx-2 fw-bold popup-quantity">${item.quantity}</span>
                                    <button class="btn btn-sm btn-outline-secondary px-2 py-1 increase-popup-qty" style="font-size: 12px;">+</button>
                                </div>
                                <span class="fw-bold text-dark popup-item-total">$${itemTotal.toFixed(2)}</span>
                            </div>
                        </div>
                        <button class="btn btn-sm text-muted remove-popup-item" style="border: none; background: none;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
        const subtotalEl = document.getElementById('cart-subtotal');
        if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    }

    addToCart(product, quantity = 1) {
        const existingItem = this.cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: quantity
            });
        }

        this.updateCartCount();
        this.updatePopupCart();
        this.saveCart();

        // Show notification
        this.showNotification(`${product.name} added to cart!`);
    }

    showNotification(message) {
        const notification = document.getElementById('add-to-cart-notification');
        if (notification) {
            notification.textContent = message;
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            // Cart icon click
            if (e.target.classList.contains('cart-icon') || e.target.closest('.cart-icon')) {
                const popup = document.getElementById('shopping-cart-popup');
                if (popup) popup.classList.toggle('visible');
            }

            // Close cart
            if (e.target.id === 'close-cart-btn') {
                const popup = document.getElementById('shopping-cart-popup');
                if (popup) popup.classList.remove('visible');
            }

            // Popup cart quantity increase
            if (e.target.classList.contains('increase-popup-qty')) {
                const item = e.target.closest('.cart-item');
                const productId = item.getAttribute('data-id');
                const cartItem = this.cart.find(item => item.id == productId);

                if (cartItem) {
                    cartItem.quantity++;
                    this.updateCartCount();
                    this.updatePopupCart();
                    this.saveCart();
                }
            }

            // Popup cart quantity decrease
            if (e.target.classList.contains('decrease-popup-qty')) {
                const item = e.target.closest('.cart-item');
                const productId = item.getAttribute('data-id');
                const cartItem = this.cart.find(item => item.id == productId);

                if (cartItem && cartItem.quantity > 1) {
                    cartItem.quantity--;
                    this.updateCartCount();
                    this.updatePopupCart();
                    this.saveCart();
                }
            }

            // Remove item from popup cart
            if (e.target.classList.contains('fa-times') && e.target.closest('.remove-popup-item')) {
                const item = e.target.closest('.cart-item');
                const productId = item.getAttribute('data-id');
                this.cart = this.cart.filter(item => item.id != productId);
                this.updateCartCount();
                this.updatePopupCart();
                this.saveCart();
            }
        });
    }
}

// Initialize cart manager
const cartManager = new CartManager();