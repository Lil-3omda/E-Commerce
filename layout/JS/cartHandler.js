// const userId = sessionStorage.getItem("loggedInUserId") || "0";
const getCartKey = (userId) => `cart_${userId}`;

export function addToCart(item) {
  const userId = sessionStorage.getItem("loggedInUserId");
  if (!userId) {
    window.location.href = `/signUpdate/login.html?redirect=${encodeURIComponent(window.location.href)}`;
    return;
  }
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
}



export function removeFromCart(itemId) {
  const userId = sessionStorage.getItem("loggedInUserId");
  if (!userId) {
    window.location.href = `/signUpdate/login.html?redirect=${encodeURIComponent(window.location.href)}`;
    return;
  }
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
  const userId = sessionStorage.getItem("loggedInUserId");
  if (!userId) {
    window.location.href = `/signUpdate/login.html?redirect=${encodeURIComponent(window.location.href)}`;
    return;
  }
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
  const userId = sessionStorage.getItem("loggedInUserId");
  if (!userId) {
    window.location.href = `/signUpdate/login.html?redirect=${encodeURIComponent(window.location.href)}`;
    return;
  }
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

