const cartItems = document.getElementById("cartItems");
const cartContant = document.getElementById("cartContant");
let cartData = sessionStorage.getItem("cartData")
  ? JSON.parse(sessionStorage.getItem("cartData"))
  : [];
let counters = cartData.map(() => 1); // Initialize all quantities to 1


function renderCart() {
    let totalCost=0
  if (cartData.length === 0) {
    cartContant.innerHTML = `<h2 style="height:80vh;" class="text-center">Your cart is empty</h2>`;
    return;
  }

  cartItems.innerHTML = ''; // Clear previous items

  cartData.forEach((item, index) => {
    totalCost +=item.price * counters[index];
    cartItems.innerHTML += `
      <div class='col-4'>
        <img src="${item.img}" alt="${item.name}" class="img-fluid">
        <div style="display: flex; flex-direction: column; align-items: center;">
          <p>${item.name}</p>
          <p>${item.description.brand}</p>
          <button class="btn btn-danger" onclick="removeFromCart(${index})">Remove</button>
        </div>
      </div>
      <div class='col-4'>
        <p>Quantity: ${counters[index]}</p>
        <button class="btn btn-success" onclick="increment(${index})">+</button>
        <button class="btn btn-warning" onclick="decrement(${index})">-</button>
      </div>
      <div class='col-4'>
        <p>${item.price} $</p>
      </div>
    `;
  });
}

// Quantity functions
function increment(index) {
  counters[index]++;
  renderCart();
}

function decrement(index) {
  if (counters[index] > 1) {
    counters[index]--;
    renderCart();
  }
}

// Remove item
function removeFromCart(index) {
  cartData.splice(index, 1);
  counters.splice(index, 1);
  sessionStorage.setItem("cartData", JSON.stringify(cartData));
  renderCart();
}

// Initial render
renderCart();
