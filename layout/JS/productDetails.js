import { addToCart } from "./cartHandler.js";
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('productId');
const productsData = localStorage.getItem("products");

let products = [];

if (productsData) {
    products = JSON.parse(productsData).filter(product => product.id == productId);
} else {
    console.error("No product data found");
}

const productDetails = document.getElementById("productDetails");

if (products.length > 0) {
    const product = products[0];
    const description = product.description;

    const specList = Object.entries(description)
        .filter(([key, val]) => key !== 'content')
        .map(([key, val]) => {
            const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            return `<p><strong>${label}:</strong> ${val}</p>`;
        }).join("");

    // const highlights = description.content
    //     ? `<h4>Highlights:</h4><ul>${description.content.map(item => `<li>${item}</li>`).join("")}</ul>`
    //     : '';

    productDetails.innerHTML = `
        <div class="product-details row m-5 justify-content-center">
            <img src="${product.img}" alt="${product.name}"  class="product-image col-md-6 col-12 mb-4">
            <div class="product-info col-md-6 col-12">
            <h2>${product.name}</h2>
            ${specList}
            <p><strong>Price:</strong> ${product.price} EGP</p>
            <button class="btn btn-primary" data-product='${JSON.stringify(product).replace(/'/g, "&apos;")}' id="addToCartBtn">Add to Cart</button>
            </div>

            <section id="reviews-section" class="mt-3 mb-2 col-12">
            <h4 class="mb-4 text-center">Product Reviews</h4>
            
            <div id="reviews-list" class="mb-4"></div>
            
            <div id="review-form-container" class="border p-4 rounded shadow-sm bg-light">
                <h4 class="mb-3">Add Your Review</h4>
                <form id="review-form">
                <div class="mb-3">
                    <label for="rating" class="form-label">Rating:</label>
                    <select id="rating" class="form-select" required>
                    <option value="" selected disabled>Select rating</option>
                    <option value="5">⭐⭐⭐⭐⭐ (5)</option>
                    <option value="4">⭐⭐⭐⭐ (4)</option>
                    <option value="3">⭐⭐⭐ (3)</option>
                    <option value="2">⭐⭐ (2)</option>
                    <option value="1">⭐ (1)</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label for="comment" class="form-label">Comment:</label>
                    <textarea id="comment" class="form-control" rows="4" placeholder="Write your review here..." required></textarea>
                </div>
                <button type="submit" class="btn btn-primary w-100">Submit Review</button>
                </form>
            </div>
            </section>
        </div>
        `;

    const addToCartBtn = document.getElementById("addToCartBtn");
    addToCartBtn.addEventListener("click", () => {
        const productData = addToCartBtn.getAttribute("data-product");
        addToCart(productData);
    });
} else {
    productDetails.innerHTML = "<h5>Product not found.</h5>";
}
function getCartItemCount() {
    let totalCount = 0;        
    const cartKeys = Object.keys(localStorage).filter(key => key.startsWith("cart_"));
    cartKeys.forEach(key => {
    try {
        const cartItems = JSON.parse(localStorage.getItem(key)) || [];
        cartItems.forEach(item => {
        totalCount += item.quantity || 1;
        });
    } catch (e) {
        console.error("Error parsing cart data for key:", key);
    }
    });
    return totalCount;
}
window.addEventListener("DOMContentLoaded", function () {
    const cartCountEl = document.getElementById("cart-count");
    if (cartCountEl) {
    cartCountEl.textContent = getCartItemCount();
    }
});
