/**
 * LapStore Product Management
 * Handles loading and displaying products on the main website
 */

// Function to fetch products from the data file
async function fetchProducts() {
    try {
        const response = await fetch('data/products.json');
        if (!response.ok) {
            throw new Error('Failed to load products');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching products:', error);
        // Fallback to sample data if file can't be loaded
        return getSampleProducts();
    }
}

// Sample products (fallback data)
function getSampleProducts() {
    return [
        {
            id: 1,
            name: "MacBook Pro M2",
            price: 49999,
            images: ["images/products/macbook-pro-1.jpg", "images/products/macbook-pro-2.jpg"],
            specs: [
                "CPU: Apple M2 Pro",
                "RAM: 16GB Unified Memory",
                "Storage: 512GB SSD",
                "Display: 14-inch Liquid Retina XDR"
            ],
            badge: "New"
        },
        {
            id: 2,
            name: "Dell XPS 13",
            price: 29999,
            images: ["images/products/dell-xps-1.jpg"],
            specs: [
                "CPU: Intel Core i7-12700H",
                "RAM: 16GB DDR4",
                "Storage: 1TB SSD",
                "Display: 13.4-inch 4K UHD+"
            ]
        },
        {
            id: 3,
            name: "ASUS ROG Strix G15",
            price: 35999,
            images: ["images/products/asus-rog-1.jpg", "images/products/asus-rog-2.jpg"],
            specs: [
                "CPU: AMD Ryzen 9 5900HX",
                "RAM: 32GB DDR4",
                "Storage: 1TB NVMe SSD",
                "GPU: NVIDIA RTX 3070 8GB",
                "Display: 15.6-inch 165Hz FHD"
            ],
            badge: "Gaming"
        }
    ];
}

// Function to render products on the main page
function renderProducts(products) {
    const container = document.getElementById('products-container');
    if (!container) return;
    
    container.innerHTML = '';

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.setAttribute('data-id', product.id);

        // Get the first image for the card
        const primaryImage = product.images && product.images.length > 0 
            ? product.images[0] 
            : 'images/placeholder.jpg';

        // Show first 3 specs only in the card
        let specsHTML = '';
        const displaySpecs = product.specs.slice(0, 3);
        displaySpecs.forEach(spec => {
            const [key, value] = spec.split(':');
            specsHTML += `
                <div class="specs-item">
                    <strong>${key}:</strong> ${value}
                </div>
            `;
        });

        let badgeHTML = '';
        if (product.badge) {
            badgeHTML = `<div class="badge">${product.badge}</div>`;
        }

        productCard.innerHTML = `
            ${badgeHTML}
            <img src="${primaryImage}" alt="${product.name}" class="product-image">
            <div class="product-details">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">EGP ${product.price.toLocaleString()}</div>
                <div class="product-specs">
                    ${specsHTML}
                </div>
                <a href="https://wa.me/201204451749?text=I'm interested in buying ${encodeURIComponent(product.name)}" class="buy-button" target="_blank">Buy on WhatsApp</a>
            </div>
        `;

        productCard.addEventListener('click', function(e) {
            if (!e.target.classList.contains('buy-button')) {
                showProductDetails(product.id);
            }
        });

        container.appendChild(productCard);
    });
}

// Function to show product details modal
function showProductDetails(productId) {
    fetchProducts().then(products => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const modal = document.getElementById('product-modal');
        const primaryImage = product.images && product.images.length > 0 
            ? product.images[0] 
            : 'images/placeholder.jpg';
            
        document.getElementById('modal-image').src = primaryImage;
        document.getElementById('modal-title').textContent = product.name;
        document.getElementById('modal-price').textContent = `EGP ${product.price.toLocaleString()}`;

        // Render thumbnails if multiple images exist
        const thumbnailsContainer = document.getElementById('modal-thumbnails');
        thumbnailsContainer.innerHTML = '';
        
        if (product.images && product.images.length > 1) {
            product.images.forEach((image, index) => {
                const thumbnail = document.createElement('img');
                thumbnail.src = image;
                thumbnail.alt = `${product.name} - View ${index + 1}`;
                thumbnail.className = 'modal-thumbnail';
                if (index === 0) thumbnail.classList.add('active');
                
                thumbnail.addEventListener('click', function() {
                    document.getElementById('modal-image').src = image;
                    // Update active state
                    document.querySelectorAll('.modal-thumbnail').forEach(thumb => 
                        thumb.classList.remove('active'));
                    this.classList.add('active');
                });
                
                thumbnailsContainer.appendChild(thumbnail);
            });
        }

        // Render specifications
        const specsContainer = document.getElementById('modal-specs');
        specsContainer.innerHTML = '';
        product.specs.forEach(spec => {
            const [key, value] = spec.split(':');
            const specItem = document.createElement('div');
            specItem.className = 'specs-item';
            specItem.innerHTML = `<strong>${key}:</strong> ${value}`;
            specsContainer.appendChild(specItem);
        });

        // Set WhatsApp buy button
        document.getElementById('modal-buy-btn').href = 
            `https://wa.me/201204451749?text=I'm interested in buying ${encodeURIComponent(product.name)}`;

        // Show modal
        modal.style.display = 'flex';
    });
}

// Close modal when clicking the close button
document.addEventListener('DOMContentLoaded', function() {
    const modalClose = document.querySelector('.modal-close');
    const modal = document.getElementById('product-modal');
    
    if (modalClose && modal) {
        modalClose.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    
        // Close modal when clicking outside
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    
    // Initialize product display
    fetchProducts().then(products => {
        renderProducts(products);
    });
});
