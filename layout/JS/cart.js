import { decreaseQuantity, getCart, increaseQuantity, removeFromCart, addToCart } from "./cartHandler.js";
function displayData(){
    const main_body= document.querySelector(".main");
    const cart_body = document.querySelector("#cart-body");
    const total_price = document.querySelector("#totalPrice");
    const subTotal = document.querySelector("#Subtotal");
    let total = 30;
    let subtotal = 0;
    cart_body.innerHTML = "";
    const userId = sessionStorage.getItem("loggedInUserId") || "0";
    if (userId !== "0") {
        (getCart(0) || []).forEach(item => addToCart(item.productData));
        localStorage.removeItem('cart_0');
    }
    let products = getCart(userId) || [];
    if(products && products.length>0){
        products.forEach((item) => {
            const productData = JSON.parse(item.productData);
            const quantity = item.quantity;
            subtotal += productData.price * quantity;
            subTotal.innerHTML=`$${subtotal}`;
            total_price.innerHTML=`$${subtotal+total}`;
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
                        <button class="btn btn-outline-secondary btn-sm decreaseButton" type="button" 
                        data-product='${JSON.stringify(productData).replace(/'/g, "&apos;")}'>
                        -</button>
                        <input style="max-width:100px" type="text" class="form-control form-control-sm text-center quantity-input" value="${quantity}">
                        <button class="btn btn-outline-secondary btn-sm increaseButton"
                        type="button" data-product='${JSON.stringify(productData).replace(/'/g, "&apos;")}'>+</button>
                    </div>
                </div>
                <div class="col-md-2 text-end">
                    <p class="fw-bold">$${productData.price * quantity}</p>
                    <button class="btn btn-sm btn-outline-danger deleteButton"
                    data-product='${JSON.stringify(productData).replace(/'/g, "&apos;")}'>
                        <i class="fa fa-trash"></i>
                    </button>`
                cart_body.appendChild(cartItem);
                const hr = document.createElement("hr");
                hr.className = "my-3";
                cart_body.appendChild(hr);
    })
    }else{
        main_body.innerHTML=`<div class="alert alert-danger" role="alert">
            <h4 class="alert-heading">Your cart is empty!</h4>
            <p>Please add some products to your cart.</p>
            <hr>
            <p class="mb-0">You can continue shopping by clicking the button below.</p>
            <a href="/homePage.html" class="btn btn-primary">Continue Shopping</a>
        </div>`
    }
    const deleteButtons = document.querySelectorAll(".deleteButton");
    deleteButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
            const productId = JSON.parse(e.target.dataset.product).id;
            removeFromCart(productId);
            displayData();
        });
    });

const input = document.querySelector(".quantity-input");
const increaseButtons = document.querySelectorAll(".increaseButton");
increaseButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
        console.log("Increase button clicked");
        const productId = JSON.parse(e.target.dataset.product).id;
        increaseQuantity(productId);
        displayData(); 
    });
})
    const decreaseButtons = document.querySelectorAll(".decreaseButton");
    decreaseButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
            console.log("decrease button clicked");
            const productId = JSON.parse(e.target.dataset.product).id;
            decreaseQuantity(productId);
            displayData();
    });
})    
}
displayData();

function checkout() {
    const userId = sessionStorage.getItem("loggedInUserId") || "0";
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
            userId: userId,
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
        alert("Checkout successful!");
        location.reload();
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const checkoutBtn = document.getElementById("checkoutBtn");
    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", checkout);
    }
});
