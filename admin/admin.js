// admin.js

// --- Constants ---
const USER_DATA_KEY = "userData";
const PRODUCTS_KEY = "products";
const ORDERS_KEY = "orders";

document.addEventListener("DOMContentLoaded", () => {
  // --- Check if data needs initialization ---
  if (
    typeof initializeData === "function" &&
    (!localStorage.getItem(USER_DATA_KEY) ||
      !localStorage.getItem(PRODUCTS_KEY) ||
      !localStorage.getItem(ORDERS_KEY))
  ) {
    console.info("Initializing default data (Users, Products, Orders)...");
    initializeData(); // Use the single initializer from data.js
  } else {
    console.info(
      "Data already initialized or initialization function not found."
    );
  }

  // --- Modals ---
  const detailsModalElement = document.getElementById("detailsModal");
  const confirmDeleteModalElement =
    document.getElementById("confirmDeleteModal");
  const confirmDeleteButton = document.getElementById("confirmDeleteButton");
  let detailsModal = null;
  let confirmDeleteModal = null;

  if (detailsModalElement) {
    detailsModal = new bootstrap.Modal(detailsModalElement);
  } else {
    console.error("Details Modal element not found!");
  }

  if (confirmDeleteModalElement) {
    confirmDeleteModal = new bootstrap.Modal(confirmDeleteModalElement);
  } else {
    console.error("Confirm Delete Modal element not found!");
  }

  let itemToDelete = { type: null, id: null };

  // --- Helper Functions ---

  const getUsersFromStorage = () => {
    const userDataString = localStorage.getItem(USER_DATA_KEY);
    if (!userDataString) {
      console.error(`${USER_DATA_KEY} not found in Local Storage!`);
      return [];
    }
    try {
      const userData = JSON.parse(userDataString);
      const allUsers = [
        ...(userData?.admin || []),
        ...(userData?.sellers || []),
        ...(userData?.customers || []),
      ];
      return allUsers;
    } catch (e) {
      console.error(`Error parsing ${USER_DATA_KEY} from Local Storage:`, e);
      return [];
    }
  };

  const getProductsFromStorage = () => {
    try {
      return JSON.parse(localStorage.getItem(PRODUCTS_KEY) || "[]");
    } catch (e) {
      console.error(`Error parsing ${PRODUCTS_KEY} from Local Storage:`, e);
      return [];
    }
  };

  const getOrdersFromStorage = () => {
    try {
      // Assuming orders structure is correct in data.js
      return JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
    } catch (e) {
      console.error(`Error parsing ${ORDERS_KEY} from Local Storage:`, e);
      return [];
    }
  };

  const saveUsersToStorage = (allUsers) => {
    if (!Array.isArray(allUsers)) {
      console.error("saveUsersToStorage expects an array.");
      return;
    }
    // Reconstruct the object structure expected by localStorage
    const newUserData = {
      admin: allUsers.filter((user) => user?.role === "admin"),
      sellers: allUsers.filter((user) => user?.role === "seller"),
      customers: allUsers.filter((user) => user?.role === "customer"),
    };
    try {
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(newUserData));
      console.info("User data saved successfully.");
    } catch (e) {
      console.error(`Error saving ${USER_DATA_KEY} to Local Storage:`, e);
    }
  };

  const saveProductsToStorage = (products) => {
    try {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
      console.info("Product data saved successfully.");
    } catch (e) {
      console.error(`Error saving ${PRODUCTS_KEY} to Local Storage:`, e);
    }
  };

  const saveOrdersToStorage = (orders) => {
    try {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
      console.info("Order data saved successfully.");
    } catch (e) {
      console.error(`Error saving ${ORDERS_KEY} to Local Storage:`, e);
    }
  };

  // --- Rendering Functions ---

  function renderDashboardStats() {
    const allUsers = getUsersFromStorage();
    const products = getProductsFromStorage();
    const orders = getOrdersFromStorage();

    const sellers = allUsers.filter((u) => u?.role === "seller");
    const pendingOrders = orders.filter(
      (o) => o?.status === "Pending" || o?.status === "Processing"
    );

    // Helper to update element text content safely
    const updateElementText = (id, value) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value;
      } else {
        console.warn(`Dashboard element with ID '${id}' not found.`);
      }
    };

    updateElementText("total-users-count", allUsers.length);
    updateElementText("total-products-count", products.length);
    updateElementText("total-sellers-count", sellers.length);
    updateElementText("pending-orders-count", pendingOrders.length);
  }

  function renderRecentOrders(limit = 5) {
    const orders = getOrdersFromStorage();
    const allUsers = getUsersFromStorage();
    const recentOrdersList = document.getElementById("recent-orders-list");

    if (!recentOrdersList) {
      console.error(
        "Element '#recent-orders-list' not found for rendering orders."
      );
      return;
    }

    recentOrdersList.innerHTML = "";

    if (orders.length === 0) {
      recentOrdersList.innerHTML = `<tr><td colspan="6" class="text-center text-body-secondary py-3">No orders found.</td></tr>`;
      return;
    }

    // Sort by date descending (handles potential invalid dates)
    const sortedOrders = orders.sort((a, b) => {
      const dateA = new Date(a?.date);
      const dateB = new Date(b?.date);
      if (isNaN(dateA) && isNaN(dateB)) return 0;
      if (isNaN(dateA)) return 1;
      if (isNaN(dateB)) return -1;
      return dateB - dateA;
    });

    sortedOrders.slice(0, limit).forEach((order) => {
      if (!order || !order.id) return;

      const customer = allUsers.find((u) => u?.id === order.userId);
      const customerName = customer ? customer.name : "Unknown User";

      const orderDateDisplay = order.date || "N/A";
      const statusBadge = getStatusBadge(order.status);

      const displayOrderId = String(order.id).startsWith("order_")
        ? `#${String(order.id).substring(6)}`
        : order.id;

      const row = `
                <tr data-order-id="${order.id}">
                    <td>${displayOrderId}</td>
                    <td>${customerName}</td>
                    <td>${orderDateDisplay}</td>
                    <td>₱${(order.totalAmount || 0).toLocaleString()}</td>
                    <td><span class="badge ${statusBadge}">${
        order.status || "N/A"
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

  function getStatusBadge(status) {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-warning text-dark";
      case "processing":
        return "bg-info text-dark";
      case "shipped":
        return "bg-primary text-white";
      case "delivered":
        return "bg-success text-white";
      case "cancelled":
        return "bg-danger text-white";
      default:
        return "bg-secondary text-white";
    }
  }

  function renderCustomers() {
    const allUsers = getUsersFromStorage();
    const customers = allUsers.filter((user) => user?.role === "customer");
    const customerList = document.getElementById("customer-list");

    if (!customerList) {
      console.error(
        "Element '#customer-list' not found for rendering customers."
      );
      return;
    }

    customerList.innerHTML = "";

    if (customers.length === 0) {
      customerList.innerHTML =
        '<tr><td colspan="5" class="text-center text-body-secondary py-3">No customers found.</td></tr>';
      return;
    }

    customers.forEach((customer) => {
      if (!customer || !customer.id) return;
      const joinedDate = customer.joined || "N/A";

      const row = `
                <tr data-user-id="${customer.id}">
                    <td>${customer.id}</td>
                    <td>${customer.name || "N/A"}</td>
                    <td>${customer.email || "N/A"}</td>
                    <td>${joinedDate}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-info view-details-btn me-1" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                         <button class="btn btn-sm btn-outline-warning reset-password-btn me-1" title="Reset Password">
                            <i class="fas fa-key"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger remove-user-btn" title="Remove User">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                </tr>
            `;
      customerList.insertAdjacentHTML("beforeend", row);
    });
  }

  function renderSellers() {
    const allUsers = getUsersFromStorage();
    const sellers = allUsers.filter((user) => user?.role === "seller");
    const sellerList = document.getElementById("seller-list");

    if (!sellerList) {
      console.error("Element '#seller-list' not found for rendering sellers.");
      return;
    }

    sellerList.innerHTML = "";

    if (sellers.length === 0) {
      sellerList.innerHTML =
        '<tr><td colspan="6" class="text-center text-body-secondary py-3">No sellers found.</td></tr>';
      return;
    }

    sellers.forEach((seller) => {
      if (!seller || !seller.id) return;
      const joinedDate = seller.joined || "N/A";
      const performance = seller.performance || "N/A";
      const performanceBadge = getPerformanceBadge(performance);

      const row = `
                <tr data-user-id="${seller.id}">
                    <td>${seller.id}</td>
                    <td>${seller.name || "N/A"}</td>
                    <td>${seller.email || "N/A"}</td>
                     <td>${joinedDate}</td>
                    <td><span class="badge ${performanceBadge}">${performance}</span></td>
                    <td>
                         <button class="btn btn-sm btn-outline-info view-details-btn me-1" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                         <button class="btn btn-sm btn-outline-warning reset-password-btn me-1" title="Reset Password">
                            <i class="fas fa-key"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger remove-user-btn" title="Remove Seller">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                </tr>
            `;
      sellerList.insertAdjacentHTML("beforeend", row);
    });
  }

  function getPerformanceBadge(performance) {
    switch (performance?.toLowerCase()) {
      case "excellent":
        return "bg-success text-white";
      case "good":
        return "bg-info text-dark";
      case "average":
        return "bg-warning text-dark";
      case "needs review":
      case "poor":
        return "bg-danger text-white";
      default:
        return "bg-secondary text-white";
    }
  }

  function renderProducts() {
    const products = getProductsFromStorage();
    const productList = document.getElementById("product-list");

    if (!productList) {
      console.error(
        "Element '#product-list' not found for rendering products."
      );
      return;
    }

    productList.innerHTML = "";

    if (products.length === 0) {
      productList.innerHTML =
        '<tr><td colspan="8" class="text-center text-body-secondary py-3">No products found.</td></tr>';
      return;
    }

    products.forEach((product) => {
      if (!product || !product.id) return;

      const placeholderImg = "../imgs/placeholder.png";
      const imagePath = product.img
        ? `../${product.img.replace(/^\.?\//, "")}`
        : placeholderImg;

      const row = `
                <tr data-product-id="${product.id}">
                    <td>${product.id}</td>
                    <td>
                       <img src="${imagePath}" alt="${
        product.name || "Product image"
      }" class="rounded"
                            onerror="this.onerror=null; this.src='${placeholderImg}'; this.alt='Placeholder Image';">
                    </td>
                    <td class="text-wrap">${product.name || "N/A"}</td>
                    <td>${product.category || "N/A"}</td>
                    <td>₱${(product.price || 0).toLocaleString()}</td>
                    <td>${product.sellerId || "N/A"}</td>
                    <td>${product.available ?? "N/A"}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-info view-details-btn me-1" title="View Details">
                             <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-product-btn" title="Delete Product">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                </tr>
            `;
      productList.insertAdjacentHTML("beforeend", row);
    });
  }

  // --- Action Functions ---

  function showUserDetails(userId) {
    if (!detailsModal) return;
    const allUsers = getUsersFromStorage();
    const user = allUsers.find((u) => u?.id === userId);

    if (!user) {
      console.error(`User with ID ${userId} not found for details view.`);

      return;
    }

    const modalBody = document.getElementById("detailsModalBody");
    const modalTitle = document.getElementById("detailsModalLabel");

    if (!modalBody || !modalTitle) return;

    modalTitle.textContent = `User Details: ${user.name || "N/A"} (ID: ${
      user.id
    })`;
    modalBody.innerHTML = `
            <p><strong>Name:</strong> ${user.name || "N/A"}</p>
            <p><strong>Email:</strong> ${user.email || "N/A"}</p>
            <p><strong>Role:</strong> <span class="badge bg-secondary text-capitalize">${
              user.role || "N/A"
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
            <p class="text-muted small mt-3 fst-italic">Password is hidden for security.</p>
        `;
    detailsModal.show();
  }

  function showOrderDetails(orderId) {
    if (!detailsModal) return;

    const orders = getOrdersFromStorage();
    const order = orders.find((o) => o?.id === orderId);
    const allUsers = getUsersFromStorage();
    const products = getProductsFromStorage();

    if (!order) {
      console.error(`Order with ID ${orderId} not found.`);
      return;
    }

    const customer = allUsers.find((u) => u?.id === order.userId);
    const modalBody = document.getElementById("detailsModalBody");
    const modalTitle = document.getElementById("detailsModalLabel");

    if (!modalBody || !modalTitle) return;

    const statusBadge = getStatusBadge(order.status);
    const displayOrderId = String(order.id).startsWith("order_")
      ? `#${String(order.id).substring(6)}`
      : order.id;

    modalTitle.textContent = `Order Details: ${displayOrderId}`;

    let itemsHtml = '<ul class="list-group list-group-flush">';
    if (Array.isArray(order.items) && order.items.length > 0) {
      order.items.forEach((item) => {
        if (!item) return;

        const product = products.find((p) => p?.id === item.productId);
        const placeholderImg = "../imgs/placeholder.png";
        const imagePath = product?.img
          ? `../${product.img.replace(/^\.?\//, "")}`
          : placeholderImg;

        itemsHtml += `
                    <li class="list-group-item d-flex justify-content-between align-items-center flex-wrap">
                        <div class="me-3 mb-1 mb-sm-0">
                           <img src="${imagePath}" alt="${
          item.productName || "Product"
        }" class="rounded me-2" style="width: 40px; height: 40px; object-fit: cover;" onerror="this.onerror=null; this.src='${placeholderImg}';">
                            <span>${item.productName || "N/A"} (ID: ${
          item.productId || "N/A"
        })</span>
                        </div>
                        <span class="badge bg-light text-dark p-2">Qty: ${
                          item.quantity || 0
                        } @ ₱${(item.price || 0).toLocaleString()}</span>
                        <span class="w-100 text-end mt-1">Item Total: <strong>₱${(
                          item.total || 0
                        ).toLocaleString()}</strong></span>
                    </li>`;
      });
    } else {
      itemsHtml +=
        '<li class="list-group-item text-body-secondary">No items found in this order.</li>';
    }
    itemsHtml += "</ul>";

    modalBody.innerHTML = `
            <p><strong>Order ID:</strong> ${displayOrderId}</p>
            <p><strong>Customer:</strong> ${
              customer ? customer.name : "Unknown User"
            } (User ID: ${order.userId || "N/A"})</p>
            <p><strong>Order Date:</strong> ${order.date || "N/A"}</p>
            <p><strong>Status:</strong> <span class="badge ${statusBadge}">${
      order.status || "N/A"
    }</span></p>
            <h6 class="mt-3">Items:</h6>
            ${itemsHtml}
            <hr>
            <p class="text-end fs-5"><strong>Total Amount: ₱${(
              order.totalAmount || 0
            ).toLocaleString()}</strong></p>
        `;
    detailsModal.show();
  }

  function showProductDetails(productId) {
    if (!detailsModal) return;
    const products = getProductsFromStorage();
    const product = products.find((p) => p?.id === productId);

    if (!product) {
      console.error(`Product with ID ${productId} not found for details view.`);
      return;
    }

    const modalBody = document.getElementById("detailsModalBody");
    const modalTitle = document.getElementById("detailsModalLabel");

    if (!modalBody || !modalTitle) return;

    modalTitle.textContent = `Product Details: ${product.name || "N/A"} (ID: ${
      product.id
    })`;

    const placeholderImg = "../imgs/placeholder.png";
    const imagePath = product.img
      ? `../${product.img.replace(/^\.?\//, "")}`
      : placeholderImg;

    let descriptionHtml = `<h6 class="mt-3">Description/Specifications:</h6>`;
    if (product.description && typeof product.description === "object") {
      let hasContent = false;
      descriptionHtml += '<ul class="list-unstyled">';
      for (const key in product.description) {
        if (
          ["content", "img"].includes(key) ||
          !product.description.hasOwnProperty(key)
        ) {
          continue;
        }
        const value = product.description[key];
        if (value !== undefined && value !== null && value !== "") {
          descriptionHtml += `<li class="mb-1"><strong>${
            key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ")
          }:</strong> ${value}</li>`;
          hasContent = true;
        }
      }
      descriptionHtml += "</ul>";

      if (
        Array.isArray(product.description.content) &&
        product.description.content.length > 0
      ) {
        descriptionHtml += `<div class="mt-3">`;
        product.description.content.forEach((p) => {
          if (typeof p === "string" && p.trim() !== "") {
            descriptionHtml += `<p class="mb-2">${p}</p>`;
            hasContent = true;
          }
        });
        descriptionHtml += `</div>`;
      }

      if (!hasContent) {
        descriptionHtml += `<p class="text-body-secondary">No detailed description provided.</p>`;
      }
    } else {
      descriptionHtml += `<p class="text-body-secondary">No detailed description available.</p>`;
    }

    modalBody.innerHTML = `
            <div class="row g-3">
                <div class="col-md-4">
                    <img src="${imagePath}" alt="${
      product.name || "Product image"
    }" class="img-fluid rounded border shadow-sm"
                         onerror="this.onerror=null; this.src='${placeholderImg}'; this.alt='Placeholder Image';">
                </div>
                <div class="col-md-8">
                    <p><strong>Name:</strong> ${product.name || "N/A"}</p>
                    <p><strong>Category:</strong> ${
                      product.category || "N/A"
                    }</p>
                    <p><strong>Price:</strong> ₱${(
                      product.price || 0
                    ).toLocaleString()}</p>
                    <p><strong>Seller ID:</strong> ${
                      product.sellerId || "N/A"
                    }</p>
                    <p><strong>Date Added:</strong> ${
                      product.added || "N/A"
                    }</p>
                    <p><strong>Stock Available:</strong> ${
                      product.available ?? "N/A"
                    }</p>
                    <p><strong>Units Sold:</strong> ${product.sold ?? 0}</p>
                </div>
                <div class="col-12">
                    <hr class="my-3">
                    ${descriptionHtml}
                </div>
            </div>
        `;
    detailsModal.show();
  }

  function generateTemporaryPassword(length = 10) {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  function handlePasswordReset(userId) {
    let allUsers = getUsersFromStorage();
    const userIndex = allUsers.findIndex((u) => u?.id === userId);

    if (userIndex === -1) {
      alert(`Error: User with ID ${userId} not found.`);
      console.error(`Password reset failed: User ID ${userId} not found.`);
      return;
    }

    const user = allUsers[userIndex];

    if (user.role === "admin") {
      alert(
        "Admin passwords cannot be reset from this interface for security reasons."
      );
      console.warn(
        `Attempted password reset for admin user ID ${userId}. Action blocked.`
      );
      return;
    }

    const newPassword = generateTemporaryPassword();
    const userName = user.name || "this user";

    const confirmReset = confirm(
      `Are you sure you want to reset the password for ${userName} (ID: ${userId})?\n\n` +
        `A new temporary password will be generated and displayed.\n` +
        `This action cannot be undone.`
    );

    if (confirmReset) {
      allUsers[userIndex].password = newPassword;
      saveUsersToStorage(allUsers);

      console.log(
        `Password for user ${userId} (${userName}) reset successfully.`
      );
      alert(
        `Password for ${userName} (ID: ${userId}) has been reset to:\n\n${newPassword}\n\nPlease inform the user securely.`
      );
    } else {
      console.log(`Password reset cancelled for user ${userId}.`);
    }
  }

  function handleDeleteUser(userId) {
    if (!confirmDeleteModal) return;

    const allUsers = getUsersFromStorage();
    const user = allUsers.find((u) => u?.id === userId);

    if (user && user.role === "admin" && user.id === 1) {
      // Example: Protect user ID 1
      alert(
        "The primary administrator account cannot be deleted from this interface."
      );
      console.warn(
        `Attempted deletion of primary admin account (ID: ${userId}). Action blocked.`
      );
      return;
    }

    itemToDelete = { type: "user", id: userId };
    const modalBody = document.getElementById("confirmDeleteModalBody");
    if (modalBody) {
      modalBody.textContent = `Are you sure you want to delete user "${
        user?.name || "Unknown"
      }" (ID: ${userId}, Role: ${
        user?.role || "N/A"
      })? Associated data might be affected. This action cannot be undone.`;
    }
    confirmDeleteModal.show();
  }

  function handleDeleteProduct(productId) {
    if (!confirmDeleteModal) return;

    const products = getProductsFromStorage();
    const product = products.find((p) => p?.id === productId);

    // Set item to delete and show confirmation modal
    itemToDelete = { type: "product", id: productId };
    const modalBody = document.getElementById("confirmDeleteModalBody");
    if (modalBody) {
      modalBody.textContent = `Are you sure you want to delete product "${
        product?.name || "Unknown"
      }" (ID: ${productId})? This action cannot be undone.`;
    }
    confirmDeleteModal.show();
  }

  if (confirmDeleteButton && confirmDeleteModal) {
    confirmDeleteButton.addEventListener("click", () => {
      if (itemToDelete.type === "user" && itemToDelete.id !== null) {
        let allUsers = getUsersFromStorage();

        const userToDelete = allUsers.find((u) => u?.id === itemToDelete.id);
        if (
          userToDelete &&
          userToDelete.role === "admin" &&
          userToDelete.id === 1
        ) {
          alert(
            "Deletion of primary admin account cancelled as a safety measure."
          );
          console.warn(
            "Deletion of primary admin cancelled during final confirmation."
          );
        } else {
          const updatedUsers = allUsers.filter(
            (u) => u?.id !== itemToDelete.id
          );
          saveUsersToStorage(updatedUsers);
          console.log(`User ${itemToDelete.id} deleted.`);
          renderCustomers();
          renderSellers();
          renderDashboardStats();
        }
      } else if (itemToDelete.type === "product" && itemToDelete.id !== null) {
        let products = getProductsFromStorage();
        const updatedProducts = products.filter(
          (p) => p?.id !== itemToDelete.id
        );
        saveProductsToStorage(updatedProducts);
        console.log(`Product ${itemToDelete.id} deleted.`);
        renderProducts();
        renderDashboardStats();
      } else {
        console.warn(
          "Deletion cancelled, item to delete was not properly set."
        );
      }

      itemToDelete = { type: null, id: null };
      confirmDeleteModal.hide();
    });
  } else {
    console.error(
      "Confirm delete button or modal not found. Deletion functionality may be broken."
    );
  }

  const tabContent = document.getElementById("v-pills-tabContent");
  if (tabContent) {
    tabContent.addEventListener("click", (event) => {
      const target = event.target;

      const viewDetailsButton = target.closest(".view-details-btn");
      const resetPasswordButton = target.closest(".reset-password-btn");
      const removeUserButton = target.closest(".remove-user-btn");
      const deleteProductButton = target.closest(".delete-product-btn");
      const viewOrderButton = target.closest(".view-order-details-btn");

      const userRow = target.closest("tr[data-user-id]");
      const productRow = target.closest("tr[data-product-id]");
      const orderRow = target.closest("tr[data-order-id]");

      // User Actions
      if (userRow) {
        const userId = parseInt(userRow.dataset.userId, 10);
        if (!isNaN(userId)) {
          if (viewDetailsButton) {
            showUserDetails(userId);
          } else if (resetPasswordButton) {
            handlePasswordReset(userId);
          } else if (removeUserButton) {
            handleDeleteUser(userId);
          }
        } else {
          console.warn(
            "Invalid user ID found in table row:",
            userRow.dataset.userId
          );
        }
      }

      // Product Actions
      else if (productRow) {
        const productId = parseInt(productRow.dataset.productId, 10);
        if (!isNaN(productId)) {
          if (viewDetailsButton) {
            showProductDetails(productId);
          } else if (deleteProductButton) {
            handleDeleteProduct(productId);
          }
        } else {
          console.warn(
            "Invalid product ID found in table row:",
            productRow.dataset.productId
          );
        }
      }

      // Order Actions
      else if (orderRow) {
        const orderId = orderRow.dataset.orderId;
        if (orderId && viewOrderButton) {
          showOrderDetails(orderId);
        } else if (!orderId) {
          console.warn("Missing order ID in table row:", orderRow);
        }
      }
    });
  } else {
    console.error(
      "Tab content container '#v-pills-tabContent' not found. Event delegation will not work."
    );
  }

  // --- Initial Load ---
  function initializeAdminPanel() {
    console.log("Initializing Admin Panel UI...");
    renderDashboardStats();
    renderRecentOrders();
    renderCustomers();
    renderSellers();
    renderProducts();
    console.log("Admin Panel UI Initialized.");
  }

  initializeAdminPanel();
});
