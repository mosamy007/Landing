/**
 * LapStore Admin Product Manager
 * Handles product CRUD operations for admin panel
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize products list
    loadProducts();
    
    // Initialize product form handlers
    initProductForm();
    
    // Initialize stats if on dashboard
    updateStats();
    
    // Add product button
    const addProductBtn = document.getElementById('add-product-btn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', function() {
            openProductModal();
        });
    }
});

// Load all products for admin panel
function loadProducts() {
    const productsList = document.getElementById('admin-products-list');
    if (!productsList) return;
    
    // Clear loading message
    productsList.innerHTML = '<div class="loading">Loading products...</div>';
    
    fetchProducts().then(products => {
        if (products.length === 0) {
            productsList.innerHTML = '<div class="no-products">No products found. Add your first product!</div>';
            return;
        }
        
        productsList.innerHTML = '';
        
        products.forEach(product => {
            const productCard = createProductCard(product);
            productsList.appendChild(productCard);
        });
    });
}

// Create a product card for admin panel
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-id', product.id);
    
    // Get primary image or placeholder
    const primaryImage = product.images && product.images.length > 0 
        ? product.images[0] 
        : '../images/placeholder.jpg';
    
    // Create badge if needed
    let badgeHTML = '';
    if (product.badge) {
        badgeHTML = `<div class="product-badge">${product.badge}</div>`;
    }
    
    card.innerHTML = `
        ${badgeHTML}
        <div class="product-image">
            <img src="${primaryImage}" alt="${product.name}">
        </div>
        <div class="product-details">
            <div class="product-name">${product.name}</div>
            <div class="product-price">EGP ${product.price.toLocaleString()}</div>
            <div class="product-actions">
                <button class="action-button edit-button" data-id="${product.id}">Edit</button>
                <button class="action-button delete-button" data-id="${product.id}">Delete</button>
            </div>
        </div>
    `;
    
    // Add event listeners for buttons
    const editBtn = card.querySelector('.edit-button');
    const deleteBtn = card.querySelector('.delete-button');
    
    editBtn.addEventListener('click', function() {
        openProductModal(product.id);
    });
    
    deleteBtn.addEventListener('click', function() {
        if (confirm(`Are you sure you want to delete ${product.name}?`)) {
            deleteProduct(product.id);
        }
    });
    
    return card;
}

// Initialize the product form modal
function initProductForm() {
    const productForm = document.getElementById('product-form');
    if (!productForm) return;
    
    // Add spec button
    document.getElementById('add-spec').addEventListener('click', function() {
        addSpecInput();
    });
    
    // Add image button
    document.getElementById('add-image').addEventListener('click', function() {
        addImageInput();
    });
    
    // Cancel button
    document.getElementById('cancel-product').addEventListener('click', function() {
        closeProductModal();
    });
    
    // Close modal on X click
    document.querySelector('.close-modal').addEventListener('click', function() {
        closeProductModal();
    });
    
    // Form submission
    productForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveProduct();
    });
}

// Open product modal (edit or create)
function openProductModal(productId = null) {
    const modal = document.getElementById('product-modal');
    const modalTitle = document.getElementById('modal-title');
    const form = document.getElementById('product-form');
    
    // Reset form
    form.reset();
    document.getElementById('specs-container').innerHTML = '';
    document.getElementById('images-container').innerHTML = '';
    
    if (productId) {
        // Edit existing product
        modalTitle.textContent = 'Edit Product';
        
        fetchProducts().then(products => {
            const product = products.find(p => p.id === productId);
            if (!product) return;
            
            // Fill form with product data
            document.getElementById('product-id').value = product.id;
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-price').value = product.price;
            document.getElementById('product-badge').value = product.badge || '';
            
            // Add specs
            if (product.specs && product.specs.length) {
                product.specs.forEach(spec => {
                    addSpecInput(spec);
                });
            } else {
                addSpecInput();
            }
            
            // Add images (in a real implementation, we'd need to handle file uploads differently)
            if (product.images && product.images.length) {
                // For our simple implementation, just add empty file inputs
                // In a real implementation, we would show existing images and allow replacing/removing them
                product.images.forEach(image => {
                    addImageInput();
                });
            } else {
                addImageInput();
            }
        });
    } else {
        // Add new product
        modalTitle.textContent = 'Add New Product';
        document.getElementById('product-id').value = '';
        
        // Add one empty spec input and one empty image input
        addSpecInput();
        addImageInput();
    }
    
    modal.style.display = 'block';
}

// Close product modal
function closeProductModal() {
    const modal = document.getElementById('product-modal');
    modal.style.display = 'none';
}

// Add a new specification input
function addSpecInput(specValue = '') {
    const specsContainer = document.getElementById('specs-container');
    
    const specInput = document.createElement('div');
    specInput.className = 'spec-input';
    
    specInput.innerHTML = `
        <input type="text" name="spec[]" placeholder="e.g. CPU: Intel Core i7" value="${specValue}" required>
        <button type="button" class="remove-spec">-</button>
    `;
    
    // Add event listener to remove button
    specInput.querySelector('.remove-spec').addEventListener('click', function() {
        if (specsContainer.children.length > 1) {
            specsContainer.removeChild(specInput);
        }
    });
    
    specsContainer.appendChild(specInput);
}

// Add a new image input
function addImageInput() {
    const imagesContainer = document.getElementById('images-container');
    
    const imageInput = document.createElement('div');
    imageInput.className = 'image-upload';
    
    imageInput.innerHTML = `
        <input type="file" name="product-image[]" accept="image/*">
        <button type="button" class="remove-image">-</button>
    `;
    
    // Add event listener to remove button
    imageInput.querySelector('.remove-image').addEventListener('click', function() {
        if (imagesContainer.children.length > 1) {
            imagesContainer.removeChild(imageInput);
        }
    });
    
    imagesContainer.appendChild(imageInput);
}

// Save product (create or update)
function saveProduct() {
    // Get form data
    const productId = document.getElementById('product-id').value;
    const name = document.getElementById('product-name').value;
    const price = parseInt(document.getElementById('product-price').value);
    const badge = document.getElementById('product-badge').value;
    
    // Get specs
    const specInputs = document.querySelectorAll('input[name="spec[]"]');
    const specs = Array.from(specInputs).map(input => input.value);
    
    // For images, in a real implementation we would handle file uploads
    // Here we'll just simulate it by using placeholder paths
    // In a real app, we would upload these files to a server
    
    // Create a new product object
    const product = {
        id: productId ? parseInt(productId) : generateProductId(),
        name: name,
        price: price,
        badge: badge.trim() === '' ? null : badge,
        specs: specs,
        // In a real implementation, this would be updated with actual uploaded image paths
        images: ['../images/placeholder.jpg'],
        totalUsers: Math.floor(Math.random() * 5000) + 1000 // Random number for demo purposes
    };
    
    // Save to products data
    saveProductData(product);
    
    // Close modal
    closeProductModal();
    
    // Reload products list
    loadProducts();
    
    // Update statistics
    updateStats();
}

// Delete a product
function deleteProduct(productId) {
    fetchProducts().then(products => {
        // Filter out the product to delete
        const updatedProducts = products.filter(p => p.id !== productId);
        
        // Save updated products
        localStorage.setItem('lapstore_products', JSON.stringify(updatedProducts));
        
        // Reload products list
        loadProducts();
        
        // Update statistics
        updateStats();
    });
}

// Fetch products from storage
async function fetchProducts() {
    // In a real app, this would be an API call
    // For this demo, we'll use localStorage
    const products = localStorage.getItem('lapstore_products');
    
    if (products) {
        return JSON.parse(products);
    }
    
    // Return sample data if no products saved
    return [
        {
            id: 1,
            name: "MacBook Pro 16\"",
            price: 69999,
            badge: "New",
            specs: [
                "CPU: Apple M1 Pro",
                "RAM: 16GB",
                "Storage: 512GB SSD",
                "Display: 16-inch Retina"
            ],
            images: ['../images/placeholder.jpg'],
            totalUsers: 1843
        },
        {
            id: 2,
            name: "ASUS ROG Strix",
            price: 39999,
            badge: "Gaming",
            specs: [
                "CPU: Intel Core i7-12700H",
                "RAM: 32GB",
                "Storage: 1TB SSD",
                "GPU: NVIDIA RTX 3080"
            ],
            images: ['../images/placeholder.jpg'],
            totalUsers: 2156
        }
    ];
}

// Save product data (create or update)
function saveProductData(product) {
    fetchProducts().then(products => {
        // Check if product exists (update) or is new (create)
        const existingIndex = products.findIndex(p => p.id === product.id);
        
        if (existingIndex >= 0) {
            // Update existing product
            products[existingIndex] = product;
        } else {
            // Add new product
            products.push(product);
        }
        
        // Save updated products
        localStorage.setItem('lapstore_products', JSON.stringify(products));
    });
}

// Generate a unique product ID
function generateProductId() {
    return Date.now();
}

// Update dashboard statistics
function updateStats() {
    const totalProductsElement = document.getElementById('total-products');
    const featuredProductsElement = document.getElementById('featured-products');
    const imageCountElement = document.getElementById('image-count');
    
    if (!totalProductsElement || !featuredProductsElement || !imageCountElement) return;
    
    fetchProducts().then(products => {
        // Total products
        totalProductsElement.textContent = products.length;
        
        // Featured products (those with badge)
        const featuredCount = products.filter(p => p.badge).length;
        featuredProductsElement.textContent = featuredCount;
        
        // Total images count
        let imageCount = 0;
        products.forEach(product => {
            imageCount += product.images ? product.images.length : 0;
        });
        imageCountElement.textContent = imageCount;
    });
}