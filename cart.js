
document.addEventListener('DOMContentLoaded', () => {
    // 🛍️ The core state of our cart
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Selectors for key elements
    const cartIcons = document.querySelectorAll('.cart-icon');
    const cartCountSpans = document.querySelectorAll('.cart-count');
    const cartPopup = document.getElementById('shopping-cart-popup');
    const cartItemsContainer = document.querySelector('.cart-items-container');
    const cartSubtotalSpan = document.getElementById('cart-subtotal');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const notification = document.getElementById('add-to-cart-notification');
    
    // Selectors for modal
    const modalQuantityInput = document.getElementById('modalProductQuantity');

    // 🔄 Function to update the cart count across all icons
    const updateCartCount = () => {
        const uniqueProducts = cart.length; // Count unique products, not total quantity
        cartCountSpans.forEach(span => {
            span.textContent = uniqueProducts;
        });
        localStorage.setItem('cart', JSON.stringify(cart));
    };

    // ➕ Function to add a product to the cart
    const addToCart = (product, quantity = 1) => {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ ...product, quantity: quantity });
        }
        updateCartCount();
        showNotification();
        renderCart();
    };

    // ➖ Function to decrease the quantity of a product - removes product when quantity reaches 0
    const decreaseQuantity = (productId) => {
        const item = cart.find(item => item.id === productId);
        if (item) {
            if (item.quantity > 1) {
                item.quantity -= 1;
            } else {
                cart = cart.filter(item => item.id !== productId);
            }
        }
        updateCartCount();
        renderCart();
    };

    // ⬆️ Function to increase the quantity of a product
    const increaseQuantity = (productId) => {
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity += 1;
        }
        updateCartCount();
        renderCart();
    };

    // 🎨 Function to render the cart's content dynamically
    const renderCart = () => {
        if (!cartItemsContainer) return;
        
        cartItemsContainer.innerHTML = '';
        let subtotal = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="text-center text-secondary my-4">Your cart is empty.</p>';
            if (cartSubtotalSpan) cartSubtotalSpan.textContent = '$0.00';
            return;
        }

        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('d-flex', 'align-items-start', 'gap-2', 'mb-3', 'border-bottom', 'pb-3');
            
            const itemPrice = item.price * item.quantity;
            subtotal += itemPrice;

            itemElement.innerHTML = `
                <div class="d-flex align-items-center gap-2 flex-shrink-0">
                    <img src="${item.image}" alt="${item.alt_text}" class="d-none d-sm-block" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
                    <img src="${item.image}" alt="${item.alt_text}" class="d-sm-none" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px;">
                </div>
                <div class="flex-grow-1 min-w-0">
                    <h6 class="fw-semibold mb-1 text-truncate">${item.name}</h6>
                    <div class="d-flex align-items-center justify-content-between">
                        <div class="d-flex align-items-center gap-1">
                            <button class="btn btn-sm btn-outline-secondary decrease-quantity decrease-cart-qty" data-id="${item.id}" style="width: 24px; height: 24px; padding: 0; font-size: 12px; line-height: 1;">-</button>
                            <span class="mx-2 fw-semibold" style="min-width: 20px; text-align: center;">${item.quantity}</span>
                            <button class="btn btn-sm btn-outline-secondary increase-quantity increase-cart-qty" data-id="${item.id}" style="width: 24px; height: 24px; padding: 0; font-size: 12px; line-height: 1;">+</button>
                        </div>
                        <div class="d-flex align-items-center gap-2">
                            <span class="fw-bold text-dark">$${itemPrice.toFixed(2)}</span>
                            <button class="btn btn-sm btn-outline-danger remove-item remove-cart-item" data-id="${item.id}" style="width: 24px; height: 24px; padding: 0; font-size: 12px; line-height: 1;">×</button>
                        </div>
                    </div>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
        });

        if (cartSubtotalSpan) cartSubtotalSpan.textContent = `$${subtotal.toFixed(2)}`;
    };

    // 🔔 Function to show a temporary notification
    const showNotification = () => {
        notification.textContent = `Item added to cart! 🎉`;
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 1000);
    };

    // Event Delegation for all interactive elements
    document.addEventListener('click', (e) => {
        const productElement = e.target.closest('.product-item');
        
        // Add to cart from product card (both old button and new floating button)
        if ((e.target.classList.contains('add-to-cart-btn') || e.target.closest('.add-to-cart-btn')) && productElement) {
            const productId = productElement.getAttribute('data-id');
            fetch('products.json')
                .then(res => res.json())
                .then(products => {
                    const product = products.find(p => p.id == productId);
                    if (product) {
                        addToCart(product);
                    }
                });
        }
        
        // View detail from product card (both old button and new floating button)
        if ((e.target.classList.contains('view-detail-btn') || e.target.closest('.view-detail-btn')) && productElement) {
            e.preventDefault();
            const viewBtn = e.target.classList.contains('view-detail-btn') ? e.target : e.target.closest('.view-detail-btn');
            const productId = viewBtn.getAttribute('data-product-id');
            
            fetch('products.json')
                .then(res => res.json())
                .then(products => {
                    const product = products.find(p => p.id == productId);
                    if (product) {
                        const event = new CustomEvent('showProductModal', { detail: product });
                        document.dispatchEvent(event);
                    }
                });
        }
        
        // Add to cart from the modal
        if (e.target.id === 'modalAddToCartBtn') {
             const productId = e.target.getAttribute('data-product-id');
             const quantity = parseInt(modalQuantityInput.value);
             
             fetch('products.json')
                .then(res => res.json())
                .then(products => {
                    const product = products.find(p => p.id == productId);
                    if (product && quantity > 0) {
                       addToCart(product, quantity);
                    }
                });
        }
        
        // Increase quantity button in modal
        if (e.target.classList.contains('increase-quantity') && e.target.closest('.modal')) {
             modalQuantityInput.value = parseInt(modalQuantityInput.value) + 1;
        }

        // Decrease quantity button in modal
        if (e.target.classList.contains('decrease-quantity') && e.target.closest('.modal')) {
             let currentVal = parseInt(modalQuantityInput.value);
             if (currentVal > 1) {
                 modalQuantityInput.value = currentVal - 1;
             }
        }

        // Increase quantity button in cart popup (multiple class names for compatibility)
        if ((e.target.classList.contains('increase-quantity') || e.target.classList.contains('increase-cart-qty')) && e.target.closest('#shopping-cart-popup')) {
            const productId = e.target.getAttribute('data-id');
            increaseQuantity(parseInt(productId));
        }

        // Decrease quantity button in cart popup (multiple class names for compatibility)
        if ((e.target.classList.contains('decrease-quantity') || e.target.classList.contains('decrease-cart-qty')) && e.target.closest('#shopping-cart-popup')) {
            const productId = e.target.getAttribute('data-id');
            decreaseQuantity(parseInt(productId));
        }

        // Remove item from cart (multiple class names for compatibility)
        if (e.target.classList.contains('remove-item') || e.target.classList.contains('remove-cart-item')) {
            const productId = e.target.getAttribute('data-id');
            cart = cart.filter(item => item.id != productId);
            updateCartCount();
            renderCart();
        }
        
        // Checkout button click
        if (e.target.textContent === 'CHECKOUT' && e.target.href && e.target.href.includes('checkout.html')) {
            if (cart.length === 0) {
                e.preventDefault();
                alert('Your cart is empty. Please add items before checkout.');
            }
        }
    });

    // 🔍 Toggle cart popup visibility
    cartIcons.forEach(icon => {
        icon.style.cursor = 'pointer';
        icon.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (cartPopup) {
                cartPopup.classList.toggle('visible');
                if (cartPopup.classList.contains('visible')) {
                    renderCart();
                }
            }
        });
    });
    
    // Also handle cart icon clicks specifically
    document.querySelectorAll('.fa-basket-shopping').forEach(icon => {
        icon.style.cursor = 'pointer';
        icon.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (cartPopup) {
                cartPopup.classList.toggle('visible');
                if (cartPopup.classList.contains('visible')) {
                    renderCart();
                }
            }
        });
    });

    // ❌ Close button for the cart popup
    if (closeCartBtn && cartPopup) {
        closeCartBtn.addEventListener('click', () => {
            cartPopup.classList.remove('visible');
        });
    }

    // 🌎 Hide cart when clicking outside of it
    document.addEventListener('click', (e) => {
        const isCartIcon = e.target.closest('.cart-icon');
        const isInsideCart = cartPopup.contains(e.target);
        const isCartControl = e.target.closest('.decrease-quantity, .increase-quantity, .remove-item');

        if (cartPopup.classList.contains('visible') && !isInsideCart && !isCartIcon && !isCartControl) {
            cartPopup.classList.remove('visible');
        }
    });

    // Listen for cart updates from other pages
    window.addEventListener('cartUpdated', () => {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
        updateCartCount();
        if (cartPopup && cartPopup.classList.contains('visible')) {
            renderCart();
        }
    });
    
    // Also update cart when it becomes visible
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                if (cartPopup.classList.contains('visible')) {
                    cart = JSON.parse(localStorage.getItem('cart')) || [];
                    renderCart();
                }
            }
        });
    });
    
    if (cartPopup) {
        observer.observe(cartPopup, { attributes: true });
    }
    
    // Initial render
    updateCartCount();
    renderCart();
});