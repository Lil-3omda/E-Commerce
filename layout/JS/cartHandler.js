const userId = sessionStorage.getItem("loggedInUserId") || "0";
const getCartKey = (userId) => `cart_${userId}`;

export function addToCart(item) {
  const userId = sessionStorage.getItem("loggedInUserId") || "0";
  const cartKey = getCartKey(userId);
  let cart = localStorage.getItem(cartKey);
  cart = cart ? JSON.parse(cart) : []; 
  const existingIndex = cart.findIndex(cartItem => JSON.parse(cartItem.productData).id === JSON.parse(item).id);
  if (existingIndex !== -1) {
    cart[existingIndex].quantity += 1;
  } else {
    cart.push({ productData: item, quantity: 1 });
  }
  localStorage.setItem(cartKey, JSON.stringify(cart));
  console.log("Updated cart:", cart);
  updateCartCount();
}

function getCartItemCount() {
  let totalCount = 0;
  const loginUser = sessionStorage.getItem("loggedInUserId");
  let cartKeys = ["cart_0"];
  if (loginUser) {
      try {
          const userId = JSON.parse(loginUser);
          cartKeys.push(`cart_${userId}`);
      } catch (e) {
          console.error("Invalid loggedInUserId");
      }
  }
  cartKeys.forEach(cartKey => {
      try {
          const cartItems = JSON.parse(localStorage.getItem(cartKey)) || [];
          cartItems.forEach(item => {
              totalCount += item.quantity || 1;
          });
      } catch (e) {
          console.error("Error parsing cart data for key:", cartKey);
      }
  });
  return totalCount;
}

export function updateCartCount() {
  const count = getCartItemCount();
  const countEl = document.getElementById('cart-count');
  if (countEl) {
      countEl.textContent = count;
  }
}


export function removeFromCart(itemId) {
  const userId = sessionStorage.getItem("loggedInUserId") || "0";
  const cartKey = getCartKey(userId);
  let cart = localStorage.getItem(cartKey);
  cart = cart ? JSON.parse(cart) : [];
  const existingIndex = cart.findIndex(cartItem => JSON.parse(cartItem.productData).id === itemId);
  if (existingIndex !== -1) {
      cart.splice(existingIndex, 1);
  } else {
    console.error(`Item with ID ${itemId} not found in cart for user ID ${userId}.`);
    return;
  }
  localStorage.setItem(cartKey, JSON.stringify(cart));
  console.log("Updated cart:", cart);
}

export function increaseQuantity(itemId){
  const userId = sessionStorage.getItem("loggedInUserId") || "0";
  const cartKey= getCartKey(userId);
  console.log(cartKey)
  let cart=localStorage.getItem(cartKey);
  cart=cart?JSON.parse(cart):[];
  const existingIndex=cart.findIndex(cartItem=>JSON.parse(cartItem.productData).id===itemId);
  if(existingIndex!==-1){
    cart[existingIndex].quantity+=1;
  }
  else{
    console.error(`Item with ID ${itemId} not found in cart for user ID ${userId}.`);
    return;
  }
  localStorage.setItem(cartKey, JSON.stringify(cart));
  console.log("Updated cart:", cart);
}
export function decreaseQuantity(itemId){
  const userId = sessionStorage.getItem("loggedInUserId") || "0";
  const cartKey= getCartKey(userId);
  let cart=localStorage.getItem(cartKey);
  cart=cart?JSON.parse(cart):[];
  const existingIndex=cart.findIndex(cartItem=>JSON.parse(cartItem.productData).id===itemId);
  if(existingIndex!==-1){
    if(cart[existingIndex].quantity>1){
      cart[existingIndex].quantity-=1;
    }
    else{
      alert("Quantity cannot be less than 1.");
    }
  }
  else{
    console.error(`Item with ID ${itemId} not found in cart for user ID ${userId}.`);
    return;
  }
  localStorage.setItem(cartKey, JSON.stringify(cart));
  console.log("Updated cart:", cart);
}
export function getCart(userId) {
  const cartKey = getCartKey(userId);
  const cart = localStorage.getItem(cartKey);
  return cart ? JSON.parse(cart) : null;
}

