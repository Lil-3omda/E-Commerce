// admin.js

document.addEventListener("DOMContentLoaded", () => {
  // --- Check if data needs initialization ---
  // Use the correct key 'userData' for the check
  if (
    typeof initializeAllData === "function" && // Use the combined initializer if available
    (!localStorage.getItem("userData") ||
      !localStorage.getItem("products") ||
      !localStorage.getItem("orders"))
  ) {
    console.log("Running initialization from admin.js");
    initializeAllData();
  } else if (
    typeof initializeData === "function" && // Fallback for separate initializers
    (!localStorage.getItem("userData") || !localStorage.getItem("products")) // Check for userData
  ) {
    console.log("Running fallback initialization from admin.js");
    // Assuming initializeData now handles both userData and products
    initializeData();
    // Or call specific initializers if they exist separately
    // if (typeof loadToLocalStorage === 'function' && !localStorage.getItem('userData')) loadToLocalStorage();
    // if (typeof initializeProductData === 'function' && !localStorage.getItem('products')) initializeProductData(); // Example
    // if (typeof initializeOrderData === 'function' && !localStorage.getItem('orders')) initializeOrderData(); // Example
  } else {
    console.log(
      "Data already initialized or initialization functions not found."
    );
  }

  // --- Modals ---
  const detailsModal = new bootstrap.Modal(
    document.getElementById("detailsModal")
  );
  const confirmDeleteModal = new bootstrap.Modal(
    document.getElementById("confirmDeleteModal")
  );
  const confirmDeleteButton = document.getElementById("confirmDeleteButton");
  let itemToDelete = { type: null, id: null };

  // --- Helper Functions (UPDATED) ---

  // **MODIFIED**: Fetches the userData object and returns a COMBINED flat array of all users.
  const getUsersFromStorage = () => {
    const userDataString = localStorage.getItem("userData");
    if (!userDataString) {
      console.error("userData not found in Local Storage!");
      return []; // Return empty array if no data
    }
    try {
      const userData = JSON.parse(userDataString);
      // Combine admin, sellers, and customers into a single array
      const allUsers = [
        ...(userData.admin || []),
        ...(userData.sellers || []),
        ...(userData.customers || []),
      ];
      return allUsers;
    } catch (e) {
      console.error("Error parsing userData from Local Storage:", e);
      return [];
    }
  };

  const getProductsFromStorage = () =>
    JSON.parse(localStorage.getItem("products") || "[]");

  const getOrdersFromStorage = () =>
    // Use the order structure from the previous step (with id, userId, date etc.)
    JSON.parse(localStorage.getItem("orders") || "[]");

  // **MODIFIED**: Accepts a flat array of all users, reconstructs the userData object, and saves it.
  const saveUsersToStorage = (allUsers) => {
    if (!Array.isArray(allUsers)) {
      console.error("saveUsersToStorage expects an array.");
      return;
    }
    // Reconstruct the object structure
    const newUserData = {
      admin: allUsers.filter((user) => user.role === "admin"),
      sellers: allUsers.filter((user) => user.role === "seller"),
      customers: allUsers.filter((user) => user.role === "customer"),
    };
    try {
      localStorage.setItem("userData", JSON.stringify(newUserData));
    } catch (e) {
      console.error("Error saving userData to Local Storage:", e);
    }
  };

  const saveProductsToStorage = (products) =>
    localStorage.setItem("products", JSON.stringify(products));

  const saveOrdersToStorage = (orders) =>
    localStorage.setItem("orders", JSON.stringify(orders));

  // --- Rendering Functions (Should mostly work with the flat array from new getUsersFromStorage) ---

  function renderDashboardStats() {
    // Uses the flat array returned by the new getUsersFromStorage
    const allUsers = getUsersFromStorage();
    const products = getProductsFromStorage();
    const orders = getOrdersFromStorage();

    const customers = allUsers.filter((u) => u.role === "customer");
    const sellers = allUsers.filter((u) => u.role === "seller");
    const pendingOrders = orders.filter(
      (o) => o.status === "Pending" || o.status === "Processing"
    );

    // Calculate total users from the combined array length
    document.getElementById("total-users-count").textContent = allUsers.length;
    document.getElementById("total-products-count").textContent =
      products.length;
    document.getElementById("total-sellers-count").textContent = sellers.length;
    document.getElementById("pending-orders-count").textContent =
      pendingOrders.length;
  }

  function renderRecentOrders(limit = 5) {
    const orders = getOrdersFromStorage();
    // Use the flat array to find user names
    const allUsers = getUsersFromStorage();
    const recentOrdersList = document.getElementById("recent-orders-list");
    recentOrdersList.innerHTML = "";

    if (orders.length === 0) {
      recentOrdersList.innerHTML = `<tr><td colspan="6" class="text-center">No orders found.</td></tr>`;
      return;
    }

    // Sort by date descending (Assuming 'date' field exists in the refactored order structure)
    // If using 'orderDate' still, adjust accordingly.
    const sortedOrders = orders.sort((a, b) => {
      // Handle potential invalid dates during sorting
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (isNaN(dateA) && isNaN(dateB)) return 0;
      if (isNaN(dateA)) return 1; // Put invalid dates last
      if (isNaN(dateB)) return -1;
      return dateB - dateA;
    });

    sortedOrders.slice(0, limit).forEach((order) => {
      // Find customer in the combined user list
      const customer = allUsers.find((u) => u.id === order.userId); // Use userId
      const customerName = customer ? customer.name : "Unknown User";
      const orderDateDisplay = order.date || "N/A"; // Use the stored locale string
      const statusBadge = getStatusBadge(order.status);

      const row = `
            <tr data-order-id="${order.id}"> 
                <td>#${String(order.id).replace(
                  "order_",
                  ""
                )}</td> 
                <td>${customerName}</td>
                <td>${orderDateDisplay}</td> 
                <td>₱${order.totalAmount.toLocaleString()}</td>
                <td><span class="badge ${statusBadge}">${
        order.status
      }</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-info view-order-details-btn" title="View Order Details">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `;
      recentOrdersList.insertAdjacentHTML("beforeend", row);
    });
  }

  // Helper for status badges (No changes needed)
  function getStatusBadge(status) {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-warning text-dark";
      case "processing":
        return "bg-info text-dark";
      case "shipped":
        return "bg-primary";
      case "delivered":
        return "bg-success";
      case "cancelled":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  }

  function renderCustomers() {
    // Uses the flat array returned by the new getUsersFromStorage
    const allUsers = getUsersFromStorage();
    const customers = allUsers.filter((user) => user.role === "customer");
    const customerList = document.getElementById("customer-list");
    customerList.innerHTML = "";

    if (customers.length === 0) {
      customerList.innerHTML =
        '<tr><td colspan="5" class="text-center">No customers found.</td></tr>';
      return;
    }
    // Add joined date if available in customer object
    customers.forEach((customer) => {
      const row = `
              <tr data-user-id="${customer.id}">
                  <td>${customer.id}</td>
                  <td>${customer.name}</td>
                  <td>${customer.email}</td>
                  <td>${
                    customer.joined ||
                    (customer.role === "customer" ? "N/A" : "")
                  }</td>
                  <td>
                      <button class="btn btn-sm btn-info view-details-btn me-1" title="View Details">
                          <i class="fas fa-eye"></i>
                      </button>
                       <button class="btn btn-sm btn-warning reset-password-btn me-1" title="Reset Password">
                          <i class="fas fa-key"></i>
                      </button>
                      <button class="btn btn-sm btn-danger remove-user-btn" title="Remove User">
                          <i class="fas fa-trash-alt"></i>
                      </button>
                  </td>
              </tr>
          `;
      customerList.insertAdjacentHTML("beforeend", row);
    });
  }

  function renderSellers() {
    // Uses the flat array returned by the new getUsersFromStorage
    const allUsers = getUsersFromStorage();
    const sellers = allUsers.filter((user) => user.role === "seller");
    const sellerList = document.getElementById("seller-list");
    sellerList.innerHTML = "";

    if (sellers.length === 0) {
      sellerList.innerHTML =
        '<tr><td colspan="6" class="text-center">No sellers found.</td></tr>';
      return;
    }
    // Add joined/performance if available in seller object
    sellers.forEach((seller) => {
      const performanceBadge = getPerformanceBadge(seller.performance); // Assuming performance is added later
      const row = `
              <tr data-user-id="${seller.id}">
                  <td>${seller.id}</td>
                  <td>${seller.name}</td>
                  <td>${seller.email}</td>
                   <td>${
                     seller.joined || (seller.role === "seller" ? "N/A" : "")
                   }</td> 
                  <td><span class="badge ${performanceBadge}">${
        seller.performance || "N/A"
      }</span></td>
                  <td>
                       <button class="btn btn-sm btn-info view-details-btn me-1" title="View Details">
                          <i class="fas fa-eye"></i>
                      </button>
                       <button class="btn btn-sm btn-warning reset-password-btn me-1" title="Reset Password">
                          <i class="fas fa-key"></i>
                      </button>
                      <button class="btn btn-sm btn-danger remove-user-btn" title="Remove Seller">
                          <i class="fas fa-trash-alt"></i>
                      </button>
                  </td>
              </tr>
          `;
      sellerList.insertAdjacentHTML("beforeend", row);
    });
  }

  // getPerformanceBadge (No changes needed)
  function getPerformanceBadge(performance) {
    switch (performance?.toLowerCase()) {
      case "excellent":
        return "bg-success";
      case "good":
        return "bg-info text-dark";
      case "average":
        return "bg-warning text-dark";
      case "needs review":
      case "poor":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  }

  // renderProducts (No changes needed)
  function renderProducts() {
    const products = getProductsFromStorage();
    const productList = document.getElementById("product-list");
    productList.innerHTML = ""; // Clear previous content

    if (products.length === 0) {
      productList.innerHTML =
        '<tr><td colspan="8" class="text-center">No products found.</td></tr>';
      return;
    }

    products.forEach((product) => {
      const imagePath = product.img
        ? `../${product.img.replace("./", "")}`
        : "../imgs/placeholder.png";
      const row = `
              <tr data-product-id="${product.id}">
                  <td>${product.id}</td>
                  <td><img src="${imagePath}" alt="${
        product.name
      }" style="width: 50px; height: 50px; object-fit: cover;" onerror="this.onerror=null; this.src='../imgs/placeholder.png';"></td>
                  <td>${product.name}</td>
                  <td>${product.category}</td>
                  <td>₱${product.price.toLocaleString()}</td>
                  <td>${product.sellerId}</td>
                  <td>${product.available}</td>
                  <td>
                      <button class="btn btn-sm btn-info view-details-btn me-1" title="View Details">
                           <i class="fas fa-eye"></i>
                      </button>
                      <button class="btn btn-sm btn-danger delete-product-btn" title="Delete Product">
                          <i class="fas fa-trash-alt"></i>
                      </button>
                  </td>
              </tr>
          `;
      productList.insertAdjacentHTML("beforeend", row);
    });
  }

  // --- Action Functions ---

  // showUserDetails (Uses the flat array from new getUsersFromStorage)
  function showUserDetails(userId) {
    const allUsers = getUsersFromStorage();
    const user = allUsers.find((u) => u.id === userId); // Find in the flat array
    if (!user) return;

    const modalBody = document.getElementById("detailsModalBody");
    const modalTitle = document.getElementById("detailsModalLabel");

    modalTitle.textContent = `User Details: ${user.name} (ID: ${user.id})`;
    // Add checks for properties that might not exist on all user types
    modalBody.innerHTML = `
              <p><strong>Name:</strong> ${user.name}</p>
              <p><strong>Email:</strong> ${user.email}</p>
              <p><strong>Role:</strong> <span class="badge bg-secondary">${
                user.role
              }</span></p>
              ${
                user.address
                  ? `<p><strong>Address:</strong> ${user.address}</p>`
                  : ""
              }
              ${
                user.joined
                  ? `<p><strong>Joined:</strong> ${user.joined}</p>`
                  : ""
              }
              ${
                user.role === "customer" && user.order_history
                  ? `<p><strong>Order History IDs:</strong> ${
                      user.order_history?.join(", ") || "None"
                    }</p>`
                  : ""
              }
              ${
                user.role === "seller" && user.products
                  ? `<p><strong>Products Listed IDs:</strong> ${
                      user.products?.join(", ") || "None"
                    }</p>`
                  : ""
              }
              ${
                user.role === "seller"
                  ? `<p><strong>Performance:</strong> <span class="badge ${getPerformanceBadge(
                      user.performance
                    )}">${user.performance || "N/A"}</span></p>`
                  : ""
              }
              <p class="text-muted small mt-2">Password is hidden for security.</p>
          `;
    detailsModal.show();
  }

  // showOrderDetails (Uses the flat array for customer lookup, uses new order format)
  function showOrderDetails(orderId) {
    // orderId here is the string like "order_1001"
    const orders = getOrdersFromStorage();
    const order = orders.find((o) => o.id === orderId); // Find by string 'id'
    const allUsers = getUsersFromStorage();
    const products = getProductsFromStorage();

    if (!order) {
      console.error(`Order with ID ${orderId} not found.`);
      return;
    }

    const customer = allUsers.find((u) => u.id === order.userId); // Find by userId
    const modalBody = document.getElementById("detailsModalBody");
    const modalTitle = document.getElementById("detailsModalLabel");
    const statusBadge = getStatusBadge(order.status);

    modalTitle.textContent = `Order Details: #${String(order.id).replace(
      "order_",
      ""
    )}`; // Display cleaner ID

    let itemsHtml = '<ul class="list-group list-group-flush">';
    if (Array.isArray(order.items)) {
      order.items.forEach((item) => {
        const product = products.find((p) => p.id === item.productId);
        const imagePath = product?.img
          ? `../${product.img.replace("./", "")}`
          : "../imgs/placeholder.png";
        itemsHtml += `
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                     <div>
                         <img src="${imagePath}" alt="${
          item.productName
        }" style="width: 40px; height: 40px; object-fit: cover; margin-right: 10px;" onerror="this.onerror=null; this.src='../imgs/placeholder.png';">
                         ${item.productName || "N/A"} (ID: ${item.productId})
                     </div>
                     <span>Qty: ${
                       item.quantity
                     } @ ₱${item.price.toLocaleString()} (Total: ₱${item.total.toLocaleString()})</span> {/* Show item total */}
                  </li>`;
      });
    } else {
      itemsHtml +=
        '<li class="list-group-item">No items found in this order.</li>';
    }
    itemsHtml += "</ul>";

    modalBody.innerHTML = `
          <p><strong>Order ID:</strong> #${String(order.id).replace(
            "order_",
            ""
          )}</p>
          <p><strong>Customer:</strong> ${
            customer ? customer.name : "Unknown User"
          } (ID: ${order.userId})</p>
          <p><strong>Order Date:</strong> ${order.date || "N/A"}</p>
          <p><strong>Status:</strong> <span class="badge ${statusBadge}">${
      order.status
    }</span></p>
          <!-- Shipping Address removed from order object -->
          <h6 class="mt-3">Items:</h6>
          ${itemsHtml}
          <hr>
          <p class="text-end fs-5"><strong>Total Amount: ₱${order.totalAmount.toLocaleString()}</strong></p>
      `;
    detailsModal.show();
  }

  // showProductDetails (No changes needed)
  function showProductDetails(productId) {
    // ... (Keep existing code) ...
    const products = getProductsFromStorage();
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const modalBody = document.getElementById("detailsModalBody");
    const modalTitle = document.getElementById("detailsModalLabel");

    modalTitle.textContent = `Product Details: ${product.name} (ID: ${product.id})`;

    let descriptionHtml = "<p>No detailed description provided.</p>";
    if (product.description) {
      descriptionHtml = `<h6 class="mt-3">Specifications:</h6><ul>`; // Added margin-top
      for (const key in product.description) {
        if (
          key !== "content" &&
          key !== "img" &&
          product.description.hasOwnProperty(key)
        ) {
          descriptionHtml += `<li><strong>${
            key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ")
          }:</strong> ${product.description[key]}</li>`;
        }
      }
      descriptionHtml += `</ul>`;

      if (
        Array.isArray(product.description.content) &&
        product.description.content.length > 0
      ) {
        descriptionHtml += `<h6 class="mt-3">Description Content:</h6>`; // Added margin-top
        product.description.content.forEach(
          (p) => (descriptionHtml += `<p class="mb-2">${p}</p>`)
        ); // Added margin-bottom
      }
    }

    const imagePath = product.img
      ? `../${product.img.replace("./", "")}`
      : "../imgs/placeholder.png";

    modalBody.innerHTML = `
          <div class="row">
               <div class="col-md-4">
                   <img src="${imagePath}" alt="${
      product.name
    }" class="img-fluid rounded mb-3" onerror="this.onerror=null; this.src='../imgs/placeholder.png';">
               </div>
               <div class="col-md-8">
                   <p><strong>Name:</strong> ${product.name}</p>
                   <p><strong>Category:</strong> ${product.category}</p>
                   <p><strong>Price:</strong> ₱${product.price.toLocaleString()}</p>
                   <p><strong>Seller ID:</strong> ${product.sellerId}</p>
                   <p><strong>Added:</strong> ${product.added || "N/A"}</p>
                   <p><strong>Stock Available:</strong> ${product.available}</p>
                   <p><strong>Units Sold:</strong> ${product.sold}</p>
               </div>
              <div class="col-12">
                  <hr>
                  ${descriptionHtml}
              </div>
          </div>
      `;
    detailsModal.show();
  }

  // generateTemporaryPassword (No changes needed)
  function generateTemporaryPassword(length = 8) {
    // ... (Keep existing code) ...
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `temp${password}`;
  }

  // handlePasswordReset (Modifies the flat array, then saves using new saveUsersToStorage)
  function handlePasswordReset(userId) {
    // Get the combined flat array
    let allUsers = getUsersFromStorage();
    const userIndex = allUsers.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
      alert(`User with ID ${userId} not found.`);
      return;
    }

    if (allUsers[userIndex].role === "admin") {
      alert(`Admin passwords cannot be reset through this interface.`);
      return;
    }

    const newPassword = generateTemporaryPassword();
    const userName = allUsers[userIndex].name;

    const confirmReset = confirm(
      `Are you sure you want to reset the password for ${userName} (ID: ${userId})?\n\nA new temporary password will be generated and displayed.`
    );

    if (confirmReset) {
      // Modify the user object within the flat array
      allUsers[userIndex].password = newPassword;
      // Save the modified flat array (which gets reconstructed into the object structure)
      saveUsersToStorage(allUsers);
      console.log(`Password for user ${userId} reset.`);
      alert(
        `Password for ${userName} (ID: ${userId}) has been reset to:\n\n${newPassword}\n\nPlease inform the user.`
      );
      // Optional: Re-render lists if needed, though not strictly necessary here
      // renderCustomers();
      // renderSellers();
    } else {
      console.log(`Password reset cancelled for user ${userId}.`);
    }
  }

  // handleDeleteUser (Finds user in flat array for confirmation)
  function handleDeleteUser(userId) {
    itemToDelete = { type: "user", id: userId };
    const allUsers = getUsersFromStorage(); // Get flat array
    const user = allUsers.find((u) => u.id === userId); // Find in flat array

    // Prevent deleting the main admin user (assuming ID 1 is admin)
    if (user && user.role === "admin" && user.id === 1) {
      alert("The primary admin account (ID: 1) cannot be deleted.");
      return;
    }

    document.getElementById(
      "confirmDeleteModalBody"
    ).textContent = `Are you sure you want to delete user "${
      user?.name || "Unknown"
    }" (ID: ${userId})? This action cannot be undone.`;
    confirmDeleteModal.show();
  }

  // handleDeleteProduct (No changes needed)
  function handleDeleteProduct(productId) {
    itemToDelete = { type: "product", id: productId };
    const products = getProductsFromStorage();
    const product = products.find((p) => p.id === productId);
    document.getElementById(
      "confirmDeleteModalBody"
    ).textContent = `Are you sure you want to delete product "${
      product?.name || "Unknown"
    }" (ID: ${productId})? This action cannot be undone.`;
    confirmDeleteModal.show();
  }

  // --- Confirm Deletion (Filters flat array, then saves using new saveUsersToStorage) ---
  confirmDeleteButton.addEventListener("click", () => {
    if (itemToDelete.type === "user") {
      // Get the current flat array
      let allUsers = getUsersFromStorage();

      // Double-check admin deletion prevention
      const userToDelete = allUsers.find((u) => u.id === itemToDelete.id);
      if (
        userToDelete &&
        userToDelete.role === "admin" &&
        userToDelete.id === 1
      ) {
        alert("Deletion of primary admin account cancelled.");
        itemToDelete = { type: null, id: null };
        confirmDeleteModal.hide();
        return;
      }

      // Filter the flat array
      const updatedUsers = allUsers.filter((u) => u.id !== itemToDelete.id);
      // Save the filtered flat array (which gets reconstructed)
      saveUsersToStorage(updatedUsers);
      console.log(`User ${itemToDelete.id} deleted.`);
      // Re-render lists
      renderCustomers();
      renderSellers();
      renderDashboardStats();
    } else if (itemToDelete.type === "product") {
      let products = getProductsFromStorage();
      products = products.filter((p) => p.id !== itemToDelete.id);
      saveProductsToStorage(products);
      console.log(`Product ${itemToDelete.id} deleted.`);
      renderProducts();
      renderDashboardStats();
    }
    itemToDelete = { type: null, id: null };
    confirmDeleteModal.hide();
  });

  // --- Event Delegation (Updated for order ID string) ---
  document
    .getElementById("v-pills-tabContent")
    .addEventListener("click", (event) => {
      const target = event.target;
      const userRow = target.closest("tr[data-user-id]");
      const productRow = target.closest("tr[data-product-id]");
      const orderRow = target.closest("tr[data-order-id]"); // Find by string id

      // User Actions
      if (userRow) {
        const userId = parseInt(userRow.dataset.userId); // IDs are numbers
        if (!isNaN(userId)) {
          // Check if ID is valid number
          if (target.closest(".view-details-btn")) {
            showUserDetails(userId);
          } else if (target.closest(".reset-password-btn")) {
            handlePasswordReset(userId);
          } else if (target.closest(".remove-user-btn")) {
            handleDeleteUser(userId);
          }
        }
      }

      // Product Actions
      if (productRow) {
        const productId = parseInt(productRow.dataset.productId); // IDs are numbers
        if (!isNaN(productId)) {
          if (target.closest(".view-details-btn")) {
            showProductDetails(productId);
          } else if (target.closest(".delete-product-btn")) {
            handleDeleteProduct(productId);
          }
        }
      }

      // Order Actions
      if (orderRow) {
        const orderId = orderRow.dataset.orderId; // Order ID is now a string "order_..."
        if (orderId && target.closest(".view-order-details-btn")) {
          // Check if orderId is valid
          showOrderDetails(orderId);
        }
      }
    });

  // --- Initial Load ---
  renderDashboardStats();
  renderRecentOrders();
  renderCustomers();
  renderSellers();
  renderProducts();
});
