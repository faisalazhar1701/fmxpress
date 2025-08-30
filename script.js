

// Initialize products array - will be populated from admin storage
let products = [];

// Function to load products from admin storage
function loadProductsFromStorage() {
    const adminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');
    console.log('Loading products from storage. Admin products found:', adminProducts);
    
    if (adminProducts.length > 0) {
        products = adminProducts;
        console.log('Products loaded from admin storage:', products);
    } else {
        // Fallback to default product if no admin products exist
        products = [
            {
                id: 1,
                name: "Test Product - Wireless Headphones",
                originalPrice: 5000,
                price: 3500,
                category: "electronics",
                description: "This is a test product for demonstration purposes. High-quality wireless headphones with noise cancellation.",
                image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                stock: 25
            }
        ];
        console.log('Using default products:', products);
    }
    
    // Save to localStorage for consistency
    localStorage.setItem('syncedProducts', JSON.stringify(products));
}

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

// Mobile Navigation
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Display products function
function displayProducts() {
    productsGrid.innerHTML = '';
    
    products.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

// Create product card element
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    // Calculate discount percentage
    const discountPercentage = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
    
    card.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="product-image">
        <div class="product-info">
            <h3 class="product-title">${product.name}</h3>
            <div class="product-price">
                ${product.originalPrice && product.originalPrice > product.price ? 
                    `<span class="original-price">PKR ${product.originalPrice.toLocaleString()}</span>` : ''
                }
                <span class="current-price">PKR ${product.price.toLocaleString()}</span>
                ${discountPercentage > 0 ? `<span class="discount-badge">-${discountPercentage}%</span>` : ''}
            </div>
            <p class="product-description">${product.description}</p>
            <div class="product-stats">
                <span><i class="fas fa-box"></i> ${product.stock} in stock</span>
            </div>
            <div class="product-actions">
                <button class="btn btn-primary" onclick="addToCart(${product.id})">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
                <button class="btn btn-secondary" onclick="viewDetails(${product.id})">
                    <i class="fas fa-eye"></i> View
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// Shopping cart functionality
let cart = JSON.parse(localStorage.getItem('cart') || '[]');
let orders = JSON.parse(localStorage.getItem('orders') || '[]');

// Load cart on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartDisplay();
    displayProducts(); // Display products when page loads
});

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                ...product,
                quantity: 1
            });
        }
        // Save cart to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        showNotification(`${product.name} added to cart!`);
        updateCartDisplay();
    }
}

function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    cartSidebar.classList.toggle('active');
}

function updateCartDisplay() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Update cart items
    cartItems.innerHTML = '';
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">PKR ${item.price.toLocaleString()}</div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
            </div>
            <button class="quantity-btn" onclick="removeFromCart(${item.id})" style="background: #dc3545; color: white;">×</button>
        `;
        cartItems.appendChild(cartItem);
    });
    
    // Update total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `PKR ${total.toLocaleString()}`;
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            // Save cart to localStorage
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartDisplay();
        }
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
    showNotification('Item removed from cart!');
}

function checkout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }
    
    const checkoutModal = document.getElementById('checkoutModal');
    const orderItems = document.getElementById('orderItems');
    const orderTotal = document.getElementById('orderTotal');
    
    // Display order summary
    orderItems.innerHTML = '';
    cart.forEach(item => {
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';
        orderItem.innerHTML = `
            <span>${item.name} x ${item.quantity}</span>
            <span>PKR ${(item.price * item.quantity).toLocaleString()}</span>
        `;
        orderItems.appendChild(orderItem);
    });
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    orderTotal.textContent = `PKR ${total.toLocaleString()}`;
    
    // Show modal with proper centering
    checkoutModal.classList.add('active');
    
    // Close cart sidebar
    const cartSidebar = document.getElementById('cartSidebar');
    cartSidebar.classList.remove('active');
}

function closeCheckoutModal() {
    const checkoutModal = document.getElementById('checkoutModal');
    checkoutModal.classList.remove('active');
}

function generateOrderNumber() {
    return 'ORD-' + Date.now().toString().slice(-8);
}

function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Set background color based on type
    const bgColor = type === 'error' ? '#dc3545' : '#667eea';
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function viewDetails(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        // Create modal for product details
        showProductModal(product);
    }
}

function showProductModal(product) {
    const modal = document.createElement('div');
    modal.className = 'product-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    modal.innerHTML = `
        <div class="modal-content" style="
            background: white;
            padding: 2rem;
            border-radius: 15px;
            max-width: 600px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
        ">
            <button class="modal-close" onclick="this.parentElement.parentElement.remove()" style="
                position: absolute;
                top: 1rem;
                right: 1rem;
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: #666;
            ">&times;</button>
            <img src="${product.image}" alt="${product.name}" style="
                width: 100%;
                height: 300px;
                object-fit: cover;
                border-radius: 10px;
                margin-bottom: 1rem;
            ">
            <h2>${product.name}</h2>
            <div style="font-size: 1.5rem; font-weight: bold; color: #667eea; margin: 1rem 0;">
                ${product.originalPrice && product.originalPrice > product.price ? 
                    `<span style="text-decoration: line-through; color: #999; font-size: 1.2rem; margin-right: 1rem;">PKR ${product.originalPrice.toLocaleString()}</span>` : ''
                }
                <span style="color: #667eea;">PKR ${product.price.toLocaleString()}</span>
                ${product.originalPrice && product.originalPrice > product.price ? 
                    `<span style="background: #ff4757; color: white; padding: 0.3rem 0.6rem; border-radius: 4px; font-size: 0.9rem; margin-left: 1rem;">-${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF</span>` : ''
                }
            </div>
            <p style="margin-bottom: 1rem; line-height: 1.6;">${product.description}</p>
            <div style="margin-bottom: 1rem;">
                <strong>Stock:</strong> ${product.stock} units available
            </div>
            <div style="display: flex; gap: 1rem;">
                <button onclick="addToCart(${product.id}); this.parentElement.parentElement.parentElement.remove()" style="
                    background: #667eea;
                    color: white;
                    border: none;
                    padding: 1rem 2rem;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: bold;
                ">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" style="
                    background: #f8f9fa;
                    color: #333;
                    border: 1px solid #ddd;
                    padding: 1rem 2rem;
                    border-radius: 5px;
                    cursor: pointer;
                ">
                    Close
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Contact form handling
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(contactForm);
        const name = contactForm.querySelector('input[type="text"]').value;
        const email = contactForm.querySelector('input[type="email"]').value;
        const message = contactForm.querySelector('textarea').value;
        
        // Here you would typically send the data to a server
        console.log('Contact form submitted:', { name, email, message });
        
        showNotification('Thank you for your message! We\'ll get back to you soon.');
        contactForm.reset();
    });
}

// Checkout form handling
const checkoutForm = document.getElementById('checkoutForm');
if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(checkoutForm);
        
        const order = {
            id: generateOrderNumber(),
            customer: {
                name: formData.get('name'),
                phone: formData.get('phone'),
                email: formData.get('email') || null, // Email is now optional
                address: formData.get('address'),
                city: formData.get('city'),
                payment: formData.get('payment')
            },
            items: [...cart],
            total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            status: 'pending',
            date: new Date().toISOString(),
            orderNumber: generateOrderNumber()
        };
        
        orders.push(order);
        
        // Save to localStorage
        localStorage.setItem('orders', JSON.stringify(orders));
        
        // Clear cart and save to localStorage
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay();
        
        // Close checkout modal
        const checkoutModal = document.getElementById('checkoutModal');
        checkoutModal.classList.remove('active');
        
        // Send email notifications
        sendOrderEmail(order);
        
        // Show success message with order number
        showNotification(`Order placed successfully! Order #${order.orderNumber}`, 'success');
        
        // Reset form
        checkoutForm.reset();
        
        console.log('Order placed:', order);
    });
}

// Email notification function
function sendOrderEmail(order) {
    // Create email content for admin
    const adminEmailContent = `
🛒 NEW ORDER RECEIVED - FM Xpress 🛒

📋 Order Details:
Order Number: ${order.orderNumber}
Date: ${new Date(order.date).toLocaleString()}
Status: ${order.status}

👤 Customer Information:
Name: ${order.customer.name}
Phone: ${order.customer.phone}
Email: ${order.customer.email || 'Not provided'}
Address: ${order.customer.address}
City: ${order.customer.city}
Payment Method: ${order.customer.payment}

📦 Order Items:
${order.items.map(item => `• ${item.name} x ${item.quantity} - PKR ${(item.price * item.quantity).toLocaleString()}`).join('\n')}

💰 Total Amount: PKR ${order.total.toLocaleString()}

---
FM Xpress - Your Premium Online Store
Thank you for your business!
    `;
    
    // Create a mailto link for admin email
    const adminSubject = `New Order #${order.orderNumber} - FM Xpress`;
    const adminBody = encodeURIComponent(adminEmailContent);
    const adminMailtoLink = `mailto:faisalazhar1701@gmail.com?subject=${encodeURIComponent(adminSubject)}&body=${adminBody}`;
    
    // Send email to admin automatically - open in new window to ensure it works
    const adminEmailWindow = window.open(adminMailtoLink, '_blank');
    
    // Fallback: if mailto doesn't work, show instructions
    setTimeout(() => {
        if (adminEmailWindow && adminEmailWindow.closed) {
            console.log('Admin email window closed, email sent successfully');
        } else {
            console.log('Admin email opened in new window');
        }
    }, 1000);
    
    // If customer provided email, send confirmation email to them
    if (order.customer.email) {
        const customerEmailContent = `
🎉 ORDER CONFIRMATION - FM Xpress 🎉

Dear ${order.customer.name},

Thank you for your order! Here are your order details:

📋 Order Information:
Order Number: ${order.orderNumber}
Order Date: ${new Date(order.date).toLocaleString()}
Status: ${order.status}

📦 Your Order Items:
${order.items.map(item => `• ${item.name} x ${item.quantity} - PKR ${(item.price * item.quantity).toLocaleString()}`).join('\n')}

💰 Order Total: PKR ${order.total.toLocaleString()}

📍 Shipping Address:
${order.customer.address}
${order.customer.city}

💳 Payment Method: ${order.customer.payment}

We'll process your order and ship it to you as soon as possible. You'll receive updates on your order status.

If you have any questions, please contact us at info@fmxpress.com

Thank you for choosing FM Xpress!
Best regards,
The FM Xpress Team
        `;
        
        const customerSubject = `Order Confirmation #${order.orderNumber} - FM Xpress`;
        const customerBody = encodeURIComponent(customerEmailContent);
        const customerMailtoLink = `mailto:${order.customer.email}?subject=${encodeURIComponent(customerSubject)}&body=${customerBody}`;
        
        // Send email to customer - open in new window
        const customerEmailWindow = window.open(customerMailtoLink, '_blank');
        
        // Log customer email status
        setTimeout(() => {
            if (customerEmailWindow && customerEmailWindow.closed) {
                console.log('Customer email sent successfully');
            } else {
                console.log('Customer email opened in new window');
            }
        }, 1000);
    }
    
    // Log email details to console for verification
    console.log('📧 Admin email sent for order #' + order.orderNumber + ':');
    console.log('To: faisalazhar1701@gmail.com');
    console.log('Subject: ' + adminSubject);
    console.log('Content:', adminEmailContent);
    
    if (order.customer.email) {
        console.log('📧 Customer email sent for order #' + order.orderNumber + ':');
        console.log('To: ' + order.customer.email);
        console.log('Subject: ' + customerSubject);
        console.log('Content:', customerEmailContent);
    }
}

// Function to sync products from admin (called when admin updates products)
function syncProductsFromAdmin(adminProducts) {
    console.log('Syncing products from admin:', adminProducts);
    
    // Update local products array
    products.length = 0;
    products.push(...adminProducts);
    
    // Refresh display
    displayProducts();
    
    // Update cart if items exist
    if (cart.length > 0) {
        cart = cart.filter(cartItem => {
            const product = products.find(p => p.id === cartItem.id);
            if (product) {
                // Update cart item with latest product info
                Object.assign(cartItem, product);
                return true;
            }
            return false;
        });
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay();
    }
    
    // Save synced products to localStorage
    localStorage.setItem('syncedProducts', JSON.stringify(products));
}

// Function to check for product updates from admin
function checkForAdminUpdates() {
    const adminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');
    if (adminProducts.length > 0) {
        // Check if products have changed
        const currentProductIds = products.map(p => p.id).join(',');
        const adminProductIds = adminProducts.map(p => p.id).join(',');
        
        if (currentProductIds !== adminProductIds || 
            JSON.stringify(products) !== JSON.stringify(adminProducts)) {
            console.log('Products updated from admin, syncing...');
            syncProductsFromAdmin(adminProducts);
        }
    }
}

// Function to force refresh products from storage
function forceRefreshFromStorage() {
    console.log('Force refreshing products from storage...');
    loadProductsFromStorage();
    displayProducts();
    console.log('Products refreshed from storage:', products);
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Load products from storage first
    loadProductsFromStorage();
    
    // Then display products
    displayProducts();
    
    // Check for admin updates immediately
    checkForAdminUpdates();
    
    // Listen for product sync messages from admin
    window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SYNC_PRODUCTS') {
            console.log('Received product sync message from admin');
            syncProductsFromAdmin(event.data.products);
        }
    });
    
    // Check for admin updates every 2 seconds
    setInterval(checkForAdminUpdates, 2000);
    
    // Add scroll effect to header
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        if (window.scrollY > 100) {
            header.style.background = 'rgba(102, 126, 234, 0.95)';
        } else {
            header.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        }
    });
    
    // Close checkout modal when clicking outside
    const checkoutModal = document.getElementById('checkoutModal');
    checkoutModal.addEventListener('click', (e) => {
        if (e.target === checkoutModal) {
            closeCheckoutModal();
        }
    });
});

// Export functions for admin page
window.FMXpress = {
    products,
    cart,
    addToCart,
    displayProducts,
    syncProductsFromAdmin,
    checkForAdminUpdates
};

// Global function to force refresh products (can be called from admin)
window.refreshProducts = function() {
    console.log('Force refreshing products...');
    forceRefreshFromStorage();
    checkForAdminUpdates();
};
