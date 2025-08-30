// Admin Dashboard JavaScript

// Sample data (in a real application, this would come from a database)
let adminProducts = [
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

// DOM Elements
const sidebarLinks = document.querySelectorAll('.sidebar-link');
const adminSections = document.querySelectorAll('.admin-section');
const productsTableBody = document.getElementById('productsTableBody');
const productSearch = document.getElementById('productSearch');
const categoryFilter = document.getElementById('categoryFilter');

// Navigation functionality
sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active class from all links and sections
        sidebarLinks.forEach(l => l.classList.remove('active'));
        adminSections.forEach(s => s.classList.remove('active'));
        
        // Add active class to clicked link
        link.classList.add('active');
        
        // Show corresponding section
        const targetSection = link.getAttribute('data-section');
        const section = document.getElementById(targetSection);
        if (section) {
            section.classList.add('active');
        }
        
        // Load specific data based on section
        if (targetSection === 'products') {
            loadProductsTable();
        } else if (targetSection === 'orders') {
            loadOrdersTable();
        } else if (targetSection === 'dashboard') {
            loadDashboardData();
        }
    });
});

// Load dashboard data
function loadDashboardData() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const totalProducts = adminProducts.length;
    
    // Update dashboard stats
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('totalProducts').textContent = totalProducts;
    document.getElementById('pendingOrders').textContent = pendingOrders;
    
    // Load recent orders
    loadRecentOrders();
}

// Load recent orders for dashboard
function loadRecentOrders() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const recentOrdersContainer = document.getElementById('recentOrders');
    
    if (orders.length === 0) {
        recentOrdersContainer.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No orders yet</p>';
        return;
    }
    
    // Get last 3 orders
    const recentOrders = orders.slice(-3).reverse();
    
    recentOrdersContainer.innerHTML = '';
    recentOrders.forEach(order => {
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';
        orderItem.innerHTML = `
            <div class="order-info">
                <h4>${order.orderNumber}</h4>
                <p>${order.items.map(item => item.name).join(', ')}</p>
                <span class="order-status ${order.status}">${order.status}</span>
            </div>
            <div class="order-amount">PKR ${order.total.toLocaleString()}</div>
        `;
        recentOrdersContainer.appendChild(orderItem);
    });
}

// Load products table
function loadProductsTable(products = adminProducts) {
    productsTableBody.innerHTML = '';
    
    products.forEach(product => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>
                <img src="${product.image}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
            </td>
            <td>
                <strong>${product.name}</strong>
                <br>
                <small style="color: #666;">${product.description.substring(0, 50)}...</small>
            </td>
            <td>
                <span class="category-badge" style="
                    background: ${getCategoryColor(product.category)};
                    color: white;
                    padding: 0.25rem 0.5rem;
                    border-radius: 15px;
                    font-size: 0.8rem;
                    text-transform: capitalize;
                ">${product.category}</span>
            </td>
            <td><strong>PKR ${product.originalPrice.toLocaleString()}</strong></td>
            <td><strong>PKR ${product.price.toLocaleString()}</strong></td>
            <td>
                <span style="color: ${product.stock < 10 ? '#dc3545' : product.stock < 30 ? '#ffc107' : '#28a745'};">
                    ${product.stock} units
                </span>
            </td>
            <td>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-small btn-primary" onclick="editProduct(${product.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-small btn-secondary" onclick="viewProduct(${product.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-small" style="background: #dc3545; color: white;" onclick="deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        productsTableBody.appendChild(row);
    });
}

// Get category color
function getCategoryColor(category) {
    const colors = {
        electronics: '#667eea',
        fashion: '#e91e63',
        home: '#4caf50'
    };
    return colors[category] || '#6c757d';
}

// Search functionality
productSearch.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredProducts = adminProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
    );
    loadProductsTable(filteredProducts);
});

// Category filter
categoryFilter.addEventListener('change', (e) => {
    const selectedCategory = e.target.value;
    const filteredProducts = selectedCategory 
        ? adminProducts.filter(product => product.category === selectedCategory)
        : adminProducts;
    loadProductsTable(filteredProducts);
});

// Product management functions
function editProduct(productId) {
    const product = adminProducts.find(p => p.id === productId);
    if (product) {
        showEditProductModal(product);
    }
}

function viewProduct(productId) {
    const product = adminProducts.find(p => p.id === productId);
    if (product) {
        showProductDetailsModal(product);
    }
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        adminProducts = adminProducts.filter(p => p.id !== productId);
        loadProductsTable();
        loadDashboardData();
        syncProductsToWebsite(); // Sync with website
        showNotification('Product deleted successfully!', 'success');
    }
}

// Modal functions
function showAddProductModal() {
    const modal = document.getElementById('addProductModal');
    modal.classList.add('active');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
}

function showEditProductModal(product) {
    // Create edit modal similar to add modal but with pre-filled data
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Edit Product</h3>
                <button class="modal-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
            <form class="edit-product-form" onsubmit="updateProduct(event, ${product.id})">
                <div class="form-row">
                    <div class="form-group">
                        <label>Product Name</label>
                        <input type="text" name="name" value="${product.name}" required class="form-control">
                    </div>
                    <div class="form-group">
                        <label>Category</label>
                        <select name="category" required class="form-control">
                            <option value="electronics" ${product.category === 'electronics' ? 'selected' : ''}>Electronics</option>
                            <option value="fashion" ${product.category === 'fashion' ? 'selected' : ''}>Fashion</option>
                            <option value="home" ${product.category === 'home' ? 'selected' : ''}>Home & Garden</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Original Price (PKR)</label>
                        <input type="number" name="originalPrice" step="0.01" value="${product.originalPrice}" required class="form-control">
                    </div>
                    <div class="form-group">
                        <label>Current Price (PKR)</label>
                        <input type="number" name="price" step="0.01" value="${product.price}" required class="form-control">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Stock Quantity</label>
                        <input type="number" name="stock" value="${product.stock}" required class="form-control">
                    </div>
                    <div class="form-group">
                        <label>Image URL</label>
                        <input type="url" name="image" value="${product.image}" required class="form-control">
                    </div>
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea name="description" rows="4" required class="form-control">${product.description}</textarea>
                </div>
                <div class="form-actions">
                    <button type="button" onclick="this.parentElement.parentElement.parentElement.remove()" class="btn btn-secondary">Cancel</button>
                    <button type="submit" class="btn btn-primary">Update Product</button>
                </div>
                <div style="margin-top: 1rem; text-align: center;">
                    <button type="button" onclick="forceSyncToWebsite()" class="btn btn-secondary" style="background: #28a745; color: white;">
                        🔄 Force Sync to Website
                    </button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function showProductDetailsModal(product) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Product Details</h3>
                <button class="modal-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
            <div style="padding: 1.5rem;">
                <div style="text-align: center; margin-bottom: 1.5rem;">
                    <img src="${product.image}" alt="${product.name}" style="width: 200px; height: 200px; object-fit: cover; border-radius: 10px;">
                </div>
                <h2 style="margin-bottom: 1rem;">${product.name}</h2>
                <div style="font-size: 1.5rem; font-weight: bold; color: #667eea; margin-bottom: 1rem;">
                    <span style="text-decoration: line-through; color: #999; font-size: 1.2rem; margin-right: 1rem;">PKR ${product.originalPrice.toLocaleString()}</span>
                    <span style="color: #667eea;">PKR ${product.price.toLocaleString()}</span>
                </div>
                <p style="margin-bottom: 1rem; line-height: 1.6;">${product.description}</p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                    <div>
                        <strong>Category:</strong> 
                        <span style="text-transform: capitalize;">${product.category}</span>
                    </div>
                    <div>
                        <strong>Stock:</strong> ${product.stock} units
                    </div>
                </div>
                <div style="text-align: center;">
                    <button onclick="editProduct(${product.id}); this.parentElement.parentElement.parentElement.remove()" class="btn btn-primary">
                        <i class="fas fa-edit"></i> Edit Product
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Form handling
document.addEventListener('DOMContentLoaded', () => {
    // Save initial products to localStorage
    localStorage.setItem('adminProducts', JSON.stringify(adminProducts));
    
    // Add product form
    const addProductForm = document.querySelector('.add-product-form');
    if (addProductForm) {
        addProductForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(addProductForm);
            
            const newProduct = {
                id: adminProducts.length + 1,
                name: formData.get('name'),
                originalPrice: parseFloat(formData.get('originalPrice')),
                price: parseFloat(formData.get('price')),
                category: formData.get('category'),
                description: formData.get('description'),
                image: formData.get('image'),
                stock: parseInt(formData.get('stock'))
            };
            
            adminProducts.push(newProduct);
            loadProductsTable();
            loadDashboardData();
            closeModal('addProductModal');
            addProductForm.reset();
            syncProductsToWebsite(); // Sync with website
            showNotification('Product added successfully!', 'success');
        });
    }
    
    // Close modal when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.remove();
        }
    });
    
    // Load initial dashboard data
    loadProductsTable();
    loadDashboardData();
    
    // Initial sync to website
    setTimeout(() => {
        syncProductsToWebsite();
        console.log('Initial sync completed');
    }, 1000);
});

function updateProduct(event, productId) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const productIndex = adminProducts.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
        adminProducts[productIndex] = {
            ...adminProducts[productIndex],
            name: formData.get('name'),
            originalPrice: parseFloat(formData.get('originalPrice')),
            price: parseFloat(formData.get('price')),
            category: formData.get('category'),
            description: formData.get('description'),
            image: formData.get('image'),
            stock: parseInt(formData.get('stock'))
        };
        
        loadProductsTable();
        loadDashboardData();
        form.parentElement.parentElement.remove();
        syncProductsToWebsite(); // Sync with website
        showNotification('Product updated successfully!', 'success');
    }
}

// Function to sync products to the website
function syncProductsToWebsite() {
    // Store products in localStorage for main website to access
    localStorage.setItem('adminProducts', JSON.stringify(adminProducts));
    
    // Try to sync with the main website if it's open
    if (window.opener && window.opener.FMXpress) {
        try {
            window.opener.FMXpress.syncProductsFromAdmin(adminProducts);
            console.log('Products synced to main website via opener');
        } catch (error) {
            console.log('Could not sync with main website via opener:', error);
        }
    }
    
    // Try to sync with parent window
    try {
        window.parent.postMessage({
            type: 'SYNC_PRODUCTS',
            products: adminProducts
        }, '*');
        console.log('Products synced via postMessage');
    } catch (error) {
        console.log('Could not post message:', error);
    }
    
    // Broadcast to all open windows
    try {
        window.postMessage({
            type: 'SYNC_PRODUCTS',
            products: adminProducts
        }, '*');
        console.log('Products broadcasted to all windows');
    } catch (error) {
        console.log('Could not broadcast message:', error);
    }
    
    // Force refresh on main website if possible
    try {
        if (window.opener && window.opener.refreshProducts) {
            window.opener.refreshProducts();
            console.log('Forced refresh on main website');
        }
    } catch (error) {
        console.log('Could not force refresh:', error);
    }
}

// Function to force sync products to website
function forceSyncToWebsite() {
    console.log('Force syncing products to website...');
    syncProductsToWebsite();
    showNotification('Products synced to website!', 'success');
}

// Function to refresh website products
function refreshWebsiteProducts() {
    console.log('Refreshing website products...');
    
    // Save current products to localStorage
    localStorage.setItem('adminProducts', JSON.stringify(adminProducts));
    
    // Try to refresh the main website
    try {
        if (window.opener && window.opener.refreshProducts) {
            window.opener.refreshProducts();
            console.log('Website products refreshed successfully');
            showNotification('Website refreshed successfully!', 'success');
        } else {
            // Try alternative method - force sync
            syncProductsToWebsite();
            showNotification('Products synced to localStorage. Please refresh website manually.', 'info');
        }
    } catch (error) {
        console.log('Could not refresh website:', error);
        // Fallback: just sync to localStorage
        syncProductsToWebsite();
        showNotification('Products synced to localStorage. Please refresh website manually.', 'error');
    }
}

// Function to test sync functionality
function testSync() {
    console.log('Testing sync functionality...');
    console.log('Current admin products:', adminProducts);
    console.log('localStorage adminProducts:', localStorage.getItem('adminProducts'));
    
    // Force sync
    syncProductsToWebsite();
    
    // Check if main website is accessible
    if (window.opener) {
        console.log('Main website window found:', window.opener);
        if (window.opener.FMXpress) {
            console.log('FMXpress object found in main website');
        } else {
            console.log('FMXpress object not found in main website');
        }
    } else {
        console.log('Main website window not found');
    }
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        info: '#667eea'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${colors[type]};
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

// Order Management
let orders = JSON.parse(localStorage.getItem('orders') || '[]');

function loadOrdersTable() {
    const ordersTableBody = document.getElementById('ordersTableBody');
    if (!ordersTableBody) return;
    
    ordersTableBody.innerHTML = '';
    
    if (orders.length === 0) {
        ordersTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 2rem; color: #666;">
                    No orders found
                </td>
            </tr>
        `;
        return;
    }
    
    orders.forEach(order => {
        const row = document.createElement('tr');
        const itemsList = order.items.map(item => `${item.name} (x${item.quantity})`).join(', ');
        
        row.innerHTML = `
            <td>${order.orderNumber}</td>
            <td>${order.customer.name}</td>
            <td>${itemsList}</td>
            <td>PKR ${order.total.toLocaleString()}</td>
            <td><span class="status ${order.status}">${order.status}</span></td>
            <td>${new Date(order.date).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-small btn-primary" onclick="viewOrder('${order.id}')">View</button>
                <button class="btn btn-small btn-secondary" onclick="updateOrderStatus('${order.id}')">Update</button>
            </td>
        `;
        ordersTableBody.appendChild(row);
    });
}

function viewOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Order Details - ${order.orderNumber}</h3>
                <button class="modal-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
            <div style="padding: 1.5rem;">
                <div style="margin-bottom: 1.5rem;">
                    <h4>Customer Information</h4>
                    <p><strong>Name:</strong> ${order.customer.name}</p>
                    <p><strong>Phone:</strong> ${order.customer.phone}</p>
                    <p><strong>Email:</strong> ${order.customer.email || 'Not provided'}</p>
                    <p><strong>Address:</strong> ${order.customer.address}</p>
                    <p><strong>City:</strong> ${order.customer.city}</p>
                    <p><strong>Payment Method:</strong> ${order.customer.payment}</p>
                </div>
                <div style="margin-bottom: 1.5rem;">
                    <h4>Order Items</h4>
                    ${order.items.map(item => `
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <span>${item.name} x ${item.quantity}</span>
                            <span>PKR ${(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                    `).join('')}
                    <hr style="margin: 1rem 0;">
                    <div style="display: flex; justify-content: space-between; font-weight: bold;">
                        <span>Total:</span>
                        <span>PKR ${order.total.toLocaleString()}</span>
                    </div>
                </div>
                <div>
                    <h4>Order Status</h4>
                    <p><strong>Status:</strong> <span class="status ${order.status}">${order.status}</span></p>
                    <p><strong>Date:</strong> ${new Date(order.date).toLocaleString()}</p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function updateOrderStatus(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    // Create a better status update modal
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Update Order Status - ${order.orderNumber}</h3>
                <button class="modal-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
            <div style="padding: 1.5rem;">
                <div style="margin-bottom: 1.5rem;">
                    <h4>Current Status: <span class="status ${order.status}">${order.status}</span></h4>
                    <p><strong>Customer:</strong> ${order.customer.name}</p>
                    <p><strong>Order Total:</strong> PKR ${order.total.toLocaleString()}</p>
                </div>
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">New Status:</label>
                    <select id="newStatus" style="width: 100%; padding: 0.8rem; border: 2px solid #e9ecef; border-radius: 8px; font-size: 1rem;">
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                        <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </div>
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Status Notes (Optional):</label>
                    <textarea id="statusNotes" placeholder="Add any notes about this status change..." style="width: 100%; padding: 0.8rem; border: 2px solid #e9ecef; border-radius: 8px; font-size: 1rem; min-height: 80px; resize: vertical;"></textarea>
                </div>
                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background: #6c757d; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        Cancel
                    </button>
                    <button onclick="confirmStatusUpdate('${orderId}')" style="background: #667eea; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        Update Status
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function confirmStatusUpdate(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const newStatus = document.getElementById('newStatus').value;
    const statusNotes = document.getElementById('statusNotes').value;
    
    if (newStatus && newStatus !== order.status) {
        const oldStatus = order.status;
        order.status = newStatus;
        
        // Add status history
        if (!order.statusHistory) {
            order.statusHistory = [];
        }
        order.statusHistory.push({
            status: newStatus,
            date: new Date().toISOString(),
            notes: statusNotes
        });
        
        // Save to localStorage
        localStorage.setItem('orders', JSON.stringify(orders));
        
        // Refresh displays
        loadOrdersTable();
        loadDashboardData();
        
        // Close modal
        const modal = document.querySelector('.modal.active');
        if (modal) modal.remove();
        
        // Show success notification
        showNotification(`Order status updated from "${oldStatus}" to "${newStatus}" successfully!`, 'success');
        
        // Log the status change
        console.log(`Order #${order.orderNumber} status updated:`, {
            from: oldStatus,
            to: newStatus,
            notes: statusNotes,
            timestamp: new Date().toLocaleString()
        });
    }
}

// Export functions for potential external use
window.AdminDashboard = {
    products: adminProducts,
    loadProductsTable,
    showAddProductModal,
    editProduct,
    deleteProduct,
    showNotification,
    orders,
    loadOrdersTable,
    viewOrder,
    updateOrderStatus,
    syncProductsToWebsite
};
