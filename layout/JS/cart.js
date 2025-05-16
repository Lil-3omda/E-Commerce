import { decreaseQuantity, getCart, increaseQuantity, removeFromCart, addToCart } from "./cartHandler.js";
function displayData() {
    const main_body = document.querySelector(".main");
    const cart_body = document.querySelector("#cart-body");
    const total_price = document.querySelector("#totalPrice");
    const subTotal = document.querySelector("#Subtotal");
    const checkoutBtn = document.getElementById("checkoutBtn");

    let subtotal = 0;
    let total = 400;
    let anyOutOfStock = false;

    cart_body.innerHTML = "";
    const userId = sessionStorage.getItem("loggedInUserId") || "0";

    if (userId !== "0") {
        const oldCart = getCart(0) || [];
        oldCart.forEach(item => {
            addToCart(item.productData, item.quantity);
        });
        localStorage.removeItem('cart_0');
    }

    let products = getCart(userId) || [];
    if (products.length > 0) {
        products.forEach((item) => {
            const productData = JSON.parse(item.productData);
            const quantity = item.quantity;

            subtotal += productData.price * quantity;
            if (quantity > productData.available) {
                anyOutOfStock = true;
            }

            const cartItem = document.createElement("div");
            cartItem.className = "row cart-item mb-3";
            cartItem.innerHTML = `
                <div class="col-md-3">
                    <img src="${productData.img}" alt="${productData.name}" class="img-fluid rounded">
                </div>
                <div class="col-md-5">
                    <h5 class="card-title">${productData.name}</h5>
                    <p class="text-muted">Category: ${productData.category}</p>
                </div>
                <div class="col-md-2">
                    <div class="input-group">
                        <button class="btn btn-sm decreaseButton" type="button" 
                        data-product='${JSON.stringify(productData).replace(/'/g, "&apos;")}'>
                        -</button>
                        <input style="max-width:100px" type="text" class="form-control form-control-sm text-center quantity-input" value="${quantity}">
                        <button class="btn btn-sm increaseButton"
                            type="button" 
                            data-product='${JSON.stringify(productData).replace(/'/g, "&apos;")}'
                            ${quantity >= productData.available ? `disabled ` : ""}
                        >+</button>
                    </div>
                </div>
                <div class="col-md-2 text-end">
                    <p class="fw-bold">${productData.price * quantity} EGP</p>
                    <button class="btn btn-sm deleteButton"
                    data-product='${JSON.stringify(productData).replace(/'/g, "&apos;")}'><i class="fa fa-trash"></i></button>
                </div>
                <p class="text-center text-danger fw-semibold mt-2 ${quantity >= productData.available ? '' : 'd-none'}">
                    <i class="fa fa-exclamation-circle me-1"></i>
                    Only ${productData.available} unit(s) of "<span class="fw-bold">${productData.name}</span>" available in stock.
                </p>`;

            cart_body.appendChild(cartItem);
            const hr = document.createElement("hr");
            hr.className = "my-3";
            cart_body.appendChild(hr);
        });

        subTotal.innerHTML = `${subtotal} EGP`;
        total_price.innerHTML = `${subtotal + total} EGP`;
    } else {
        main_body.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <h4 class="alert-heading">Your cart is empty!</h4>
                <p>Please add some products to your cart.</p>
                <hr>
                <p class="mb-0">You can continue shopping by clicking the button below.</p>
                <a href="/homePage.html" class="btn btn-danger m-1">Continue Shopping</a>
            </div>`;
    }

    // Disable checkout button if any item exceeds available quantity
    if (checkoutBtn) {
        checkoutBtn.disabled = anyOutOfStock;
        checkoutBtn.classList.toggle("disabled", anyOutOfStock);
        checkoutBtn.title = anyOutOfStock ? "One or more items exceed available stock" : "";
    }

    // Setup button handlers
    document.querySelectorAll(".deleteButton").forEach(button => {
        button.addEventListener("click", (e) => {
            const productId = JSON.parse(e.currentTarget.dataset.product).id;
            removeFromCart(productId);
            displayData();
        });
    });

    document.querySelectorAll(".increaseButton").forEach(button => {
        button.addEventListener("click", (e) => {
            const productId = JSON.parse(e.currentTarget.dataset.product).id;
            increaseQuantity(productId);
            displayData();
        });
    });

    document.querySelectorAll(".decreaseButton").forEach(button => {
        button.addEventListener("click", (e) => {
            const productId = JSON.parse(e.currentTarget.dataset.product).id;
            decreaseQuantity(productId);
            displayData();
        });
    });
}

displayData();

function checkout() {
    const userId = sessionStorage.getItem("loggedInUserId");
    const loggedInStatus = sessionStorage.getItem("loggedInUserStatus");

    if (!userId || userId === "0") {
        window.location.href = "../../signUpdate/login.html";
        return;
    }

    if (loggedInStatus !== "enabled") {
        showToast("⏳ Your account is not active yet. Please wait 24 hours for approval.", "danger");
        return;
    }

    const cart = getCart(userId) || [];
    let allAvailable = true;
    let products = JSON.parse(localStorage.getItem("products")) || [];
    const orders = JSON.parse(localStorage.getItem("orders")) || [];

    for (let item of cart) {
        const productInCart = JSON.parse(item.productData);
        const quantity = item.quantity;

        const productIndex = products.findIndex(p => p.id === productInCart.id);
        if (productIndex === -1) continue;
        const available = products[productIndex].available;
        if (available < quantity) {
            alert(`"${productInCart.name}" has only ${available} pieces available. Please reduce the quantity.`);
            allAvailable = false;
            break;
        }
    }

    if (allAvailable) {
        for (let item of cart) {
            const productInCart = JSON.parse(item.productData);
            const quantity = item.quantity;
            const productIndex = products.findIndex(p => p.id === productInCart.id);
            if (productIndex !== -1) {
                products[productIndex].available -= quantity;
                products[productIndex].sold += quantity;
            }
        }

        const newOrder = {
            id: `order_${new Date().getTime()}`,
            userId: Number(userId),
            items: cart.map(item => ({
                productId: JSON.parse(item.productData).id,
                productName: JSON.parse(item.productData).name,
                quantity: item.quantity,
                price: JSON.parse(item.productData).price,
                total: item.quantity * JSON.parse(item.productData).price
            })),
            totalAmount: cart.reduce((total, item) => total + item.quantity * JSON.parse(item.productData).price, 0),
            status: "Pending",
            date: new Date().toLocaleString()
        };

        orders.push(newOrder);
        localStorage.setItem("orders", JSON.stringify(orders));
        localStorage.setItem("products", JSON.stringify(products));
        localStorage.removeItem(`cart_${userId}`);

        showToast("Checkout complete! Your items will be on their way soon.", "dark");
        setTimeout(() => location.reload(), 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const checkoutBtn = document.getElementById("checkoutBtn");
    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", checkout);
    }
});
function showToast(message, type = "info") {
    console.log("showToast called with message:", message);
    const toast = document.createElement("div");
    toast.className = `alert alert-${type}`;
    toast.style.position = "fixed";
    toast.style.top = "20%";
    toast.style.height="100px"
    toast.style.right = "35%";
    toast.style.zIndex = 9999;
    toast.style.minWidth = "300px";
    toast.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
    toast.style.borderRadius = "5px";
    toast.textContent = message;

    document.body.appendChild(toast);
    console.log("Toast added to DOM");

    setTimeout(() => {
        console.log("Removing toast now");
        toast.remove();
    }, 3000);
}


