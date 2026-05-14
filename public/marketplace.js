// Market Place Functionality

let currentCategory = '';
let allProducts = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadCategory('');
});

/**
 * Fetch data from backend API based on category
 * @param {string} category 
 */
async function loadCategory(category) {
    currentCategory = category;
    const grid = document.getElementById('productGrid');
    const title = document.getElementById('categoryTitle');
    
    // Update active button UI
    const btns = document.querySelectorAll('.cat-btn');
    btns.forEach(btn => btn.classList.remove('active'));
    
    // Logic to find current button
    const btnMap = {
        '': 'All Listings',
        'animals': 'Home Animals',
        'birds': 'Home Birds',
        'feed': 'Theevanam',
        'tools': 'Tools / Equipment'
    };
    
    title.innerText = btnMap[category] || 'All Listings';
    
    // Find button to add active class
    const categoryNameInHtml = btnMap[category] === 'All Listings' ? 'All' : btnMap[category];
    btns.forEach(btn => {
        if(btn.innerText === categoryNameInHtml) btn.classList.add('active');
    });

    grid.innerHTML = '<div class="loader">Loading products...</div>';

    try {
        let url = '/api/listings';
        if (category) {
            url += `?category=${category}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        allProducts = data;
        displayProducts(data);
    } catch (error) {
        console.error('Error loading products:', error);
        grid.innerHTML = '<div class="loader" style="color:red">Failed to load products. Check your connection.</div>';
    }
}

/**
 * Render product cards dynamically
 * @param {Array} products 
 */
function displayProducts(products) {
    const grid = document.getElementById('productGrid');
    
    if (products.length === 0) {
        grid.innerHTML = '<div class="loader">No products found in this category.</div>';
        return;
    }

    grid.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.image || 'https://picsum.photos/seed/agri' + product.id + '/400/400'}" alt="${product.title}" class="product-img" onerror="this.src='https://picsum.photos/seed/agri/400/400'">
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <p class="product-price">₹${Number(product.price).toLocaleString()}</p>
                <p class="product-location">📍 ${product.location}</p>
                <a href="javascript:void(0)" onclick="contactSeller('${product.seller_phone}')" class="contact-btn">Contact Seller</a>
            </div>
        </div>
    `).join('');
}

/**
 * Filter products by name in real-time
 */
function searchProducts() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    
    const filtered = allProducts.filter(p => 
        p.title.toLowerCase().includes(term) || 
        p.location.toLowerCase().includes(term)
    );
    
    displayProducts(filtered);
}

/**
 * Open WhatsApp using seller phone number
 * @param {string} phone 
 */
function contactSeller(phone) {
    if (!phone) {
        alert('Phone number not available for this seller.');
        return;
    }
    
    // Clean phone number (remove non-digits)
    const cleanPhone = phone.replace(/\D/g, '');
    const message = encodeURIComponent('Hi, I saw your listing on AgriMarket and I am interested.');
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${message}`;
    
    window.open(whatsappUrl, '_blank');
}
