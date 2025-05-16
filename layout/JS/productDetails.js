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

        <div class="product-details row m-5" style="place-content: center;">
            <img src="${product.img}" alt="${product.name}"  class="product-image col-6">
            <div class="product-info col-6">
                <h2>${product.name}</h2>
                ${specList}
                
                <p><strong>Price:</strong> ${product.price} EGP</p>
                <button class="btn" data-product='${JSON.stringify(product).replace(/'/g, "&apos;")}' id="addToCartBtn"
                ${ product.available <= 0 ? "disabled" : ""}>
                ${ product.available <= 0 ? "Out Of Stock": `Add to Cart <i class="fa-solid fa-cart-plus ms-1"></i>`}</button>

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
                    <div id="review-message" class="mt-2"></div>
                    <button type="submit" class="btn btn-primary w-100">Submit Review</button>
                    </form>
                </div>
            </section>
        </div>
        `;
        const reviewForm = document.getElementById('review-form');

        if (reviewForm) {
        reviewForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const customerId = sessionStorage.getItem('loggedInUserId');
            if (!customerId) {
            window.location.href = "./signUpdate/login.html";
            return;
            }
            const rating = document.getElementById('rating').value;
            const comment = document.getElementById('comment').value;
            const reviewMessage = document.getElementById("review-message");
            const userData = JSON.parse(localStorage.getItem("userData") || "{}");
            const customers = userData.customers || [];

            function getCustomerNameById(id) {
                const customer = customers.find(c => c.id == id);
                return customer ? customer.name : "Unknown Customer";
            }


            reviewMessage.innerHTML = "";
            if (!rating || !comment.trim()) {
                reviewMessage.innerHTML = `
                    <div class="alert alert-warning p-2" role="alert">
                    Please fill in both <strong>rating</strong> and <strong>comment</strong>.
                    </div>`;
                return;
            }
            setTimeout(() => {
            reviewMessage.innerHTML = "";
            }, 4000);

            const newReview = {
            productId: parseInt(productId),
            customerId: parseInt(customerId),
            customerName: getCustomerNameById(customerId),
            rating: parseInt(rating),
            comment: comment.trim(),
            date: new Date().toISOString()
            };

            const storedReviews = JSON.parse(localStorage.getItem("productReviews") || "[]");
            storedReviews.push(newReview);
            localStorage.setItem("productReviews", JSON.stringify(storedReviews));
            reviewForm.reset();
            loadReviewsForProduct(productId);
        });
    }

        function loadReviewsForProduct(productId) {
            const allReviews = JSON.parse(localStorage.getItem("productReviews") || "[]");
            const reviewsList = document.getElementById("reviews-list");
            const productReviews = allReviews.filter(review => review.productId == productId);
            if (!reviewsList) return;
            if (productReviews.length === 0) {
                reviewsList.innerHTML = `<p class="text-muted">No reviews yet. Be the first to review this product!</p>`;
                return;
            }
            reviewsList.innerHTML = productReviews.map(review => `
                <div class="card mb-3">
                <div class="card-body">
                    <h6 class="card-subtitle mb-1 text-muted"><i class="fa-solid fa-circle-user"></i> ${review.customerName}</h6>
                    <p class="mb-1">${"⭐".repeat(review.rating)}</p>
                    <p class="card-text">${review.comment}</p>
                    <small class="text-muted">${new Date(review.date).toLocaleString()}</small>
                </div>
                </div>
            `).join("");
        }
        loadReviewsForProduct(productId);

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
