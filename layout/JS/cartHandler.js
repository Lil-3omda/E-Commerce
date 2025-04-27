const getCartKey = (userId) => `cart_${userId}`;

export function addToCart(userId = 0, item) {
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



export function removeFromCart(userId = 0, itemId) {
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

export function increaseQuantity(userId,itemId){
  const cartKey= getCartKey(userId);
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
export function decreaseQuantity(userId,itemId){
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
export function getCart(userId = 0) {
  const cartKey = getCartKey(userId);
  const cart = localStorage.getItem(cartKey);
  return cart ? JSON.parse(cart) : null;
}

