document.addEventListener("DOMContentLoaded", () => {
  // --- Check if data needs initialization ---
  if (
    typeof initializeData === "function" &&
    (!localStorage.getItem("users") || !localStorage.getItem("products"))
  ) {
    console.log("Running initialization from admin.js");
    initializeData();
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

  // --- Helper Functions ---
  const getUsersFromStorage = () =>
    JSON.parse(localStorage.getItem("users") || "[]");
  const getProductsFromStorage = () =>
    JSON.parse(localStorage.getItem("products") || "[]");
  const saveUsersToStorage = (users) =>
    localStorage.setItem("users", JSON.stringify(users));
  const saveProductsToStorage = (products) =>
    localStorage.setItem("products", JSON.stringify(products));

  // --- Rendering Functions ---

  function renderDashboardStats() {
    const users = getUsersFromStorage();
    const products = getProductsFromStorage();
    const customers = users.filter((u) => u.role === "customer");
    const sellers = users.filter((u) => u.role === "seller");

    document.getElementById("total-users-count").textContent = users.length;
    document.getElementById("total-products-count").textContent =
      products.length;
    document.getElementById("total-sellers-count").textContent = sellers.length;
  }

  function renderCustomers() {
    const users = getUsersFromStorage();
    const customers = users.filter((user) => user.role === "customer");
    const customerList = document.getElementById("customer-list");
    customerList.innerHTML = ""; // Clear previous content

    if (customers.length === 0) {
      customerList.innerHTML =
        '<tr><td colspan="5" class="text-center">No customers found.</td></tr>';
      return;
    }

    customers.forEach((customer) => {
      const row = `
                <tr data-user-id="${customer.id}">
                    <td>${customer.id}</td>
                    <td>${customer.name}</td>
                    <td>${customer.email}</td>
                    <td>${customer.joined || "N/A"}</td>
                    <td>
                        <button class="btn btn-sm btn-info view-details-btn" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-danger remove-user-btn" title="Remove User">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                         <!-- Add password reset later if needed -->
                    </td>
                </tr>
            `;
      customerList.insertAdjacentHTML("beforeend", row);
    });
  }

  function renderSellers() {
    const users = getUsersFromStorage();
    const sellers = users.filter((user) => user.role === "seller");
    const sellerList = document.getElementById("seller-list");
    sellerList.innerHTML = "";

    if (sellers.length === 0) {
      sellerList.innerHTML =
        '<tr><td colspan="6" class="text-center">No sellers found.</td></tr>';
      return;
    }

    sellers.forEach((seller) => {
      const performanceBadge = getPerformanceBadge(seller.performance);
      const row = `
                <tr data-user-id="${seller.id}">
                    <td>${seller.id}</td>
                    <td>${seller.name}</td>
                    <td>${seller.email}</td>
                     <td>${seller.joined || "N/A"}</td>
                    <td><span class="badge ${performanceBadge}">${
        seller.performance || "N/A"
      }</span></td>
                    <td>
                         <button class="btn btn-sm btn-info view-details-btn" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-danger remove-user-btn" title="Remove Seller">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                         <!-- Add moderation/activation later -->
                    </td>
                </tr>
            `;
      sellerList.insertAdjacentHTML("beforeend", row);
    });
  }

  function getPerformanceBadge(performance) {
    switch (performance?.toLowerCase()) {
      case "excellent":
        return "bg-success";
      case "good":
        return "bg-info";
      case "average":
        return "bg-warning";
      case "needs review":
      case "poor":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  }

  function renderProducts() {
    const products = getProductsFromStorage();
    const productList = document.getElementById("product-list");
    productList.innerHTML = "";

    if (products.length === 0) {
      productList.innerHTML =
        '<tr><td colspan="8" class="text-center">No products found.</td></tr>';
      return;
    }

    products.forEach((product) => {
      const row = `
                <tr data-product-id="${product.id}">
                    <td>${product.id}</td>
                    <td><img src="../${
                      product.img || "./imgs/placeholder.png"
                    }" alt="${
        product.name
      }" style="width: 50px; height: 50px; object-fit: cover;"></td>
                    <td>${product.name}</td>
                    <td>${product.category}</td>
                    <td>₱${product.price.toLocaleString()}</td>
                    <td>${product.sellerId}</td>
                    <td>${product.availible}</td>
                    <td>
                        <button class="btn btn-sm btn-info view-details-btn" title="View Details">
                             <i class="fas fa-eye"></i>
                        </button>
                        <!-- <button class="btn btn-sm btn-warning edit-product-btn" title="Edit Product"> <i class="fas fa-edit"></i> </button> -->
                        <button class="btn btn-sm btn-danger delete-product-btn" title="Delete Product">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                         <!-- Add approve/reject later -->
                    </td>
                </tr>
            `;
      productList.insertAdjacentHTML("beforeend", row);
    });
  }

  // --- Action Functions ---

  function showUserDetails(userId) {
    const users = getUsersFromStorage();
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const modalBody = document.getElementById("detailsModalBody");
    const modalTitle = document.getElementById("detailsModalLabel");

    modalTitle.textContent = `User Details: ${user.name} (ID: ${user.id})`;
    modalBody.innerHTML = `
            <p><strong>Name:</strong> ${user.name}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Role:</strong> <span class="badge bg-secondary">${
              user.role
            }</span></p>
            <p><strong>Address:</strong> ${user.address || "N/A"}</p>
            <p><strong>Joined:</strong> ${user.joined || "N/A"}</p>
             ${
               user.role === "customer"
                 ? `<p><strong>Order History IDs:</strong> ${
                     user.order_history?.join(", ") || "None"
                   }</p>`
                 : ""
             }
             ${
               user.role === "seller"
                 ? `<p><strong>Products Listed IDs:</strong> ${
                     user.products_listed?.join(", ") || "None"
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
             <!-- Add more details as needed -->
        `;
    detailsModal.show();
  }

  function showProductDetails(productId) {
    const products = getProductsFromStorage();
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const modalBody = document.getElementById("detailsModalBody");
    const modalTitle = document.getElementById("detailsModalLabel");

    modalTitle.textContent = `Product Details: ${product.name} (ID: ${product.id})`;

    let descriptionHtml = "<p>No detailed description provided.</p>";
    if (product.description) {
      descriptionHtml = `<h6>Specifications:</h6><ul>`;
      for (const key in product.description) {
        if (
          key !== "content" &&
          key !== "img" &&
          product.description.hasOwnProperty(key)
        ) {
          // Exclude content array and img if present
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
        descriptionHtml += `<h6>Description Content:</h6>`;
        product.description.content.forEach(
          (p) => (descriptionHtml += `<p>${p}</p>`)
        );
      }
    }

    modalBody.innerHTML = `
            <div class="row">
                 <div class="col-md-4">
                     <img src="../${
                       product.img || "./imgs/placeholder.png"
                     }" alt="${product.name}" class="img-fluid rounded mb-3">
                 </div>
                 <div class="col-md-8">
                     <p><strong>Name:</strong> ${product.name}</p>
                     <p><strong>Category:</strong> ${product.category}</p>
                     <p><strong>Price:</strong> ₱${product.price.toLocaleString()}</p>
                     <p><strong>Seller ID:</strong> ${product.sellerId}</p>
                     <p><strong>Added:</strong> ${product.added || "N/A"}</p>
                     <p><strong>Stock Available:</strong> ${
                       product.availible
                     }</p>
                     <p><strong>Units Sold:</strong> ${product.sold}</p>
                     <hr>
                     ${descriptionHtml}
                 </div>
            </div>
        `;
    detailsModal.show();
  }

  function handleDeleteUser(userId) {
    itemToDelete = { type: "user", id: userId };
    const users = getUsersFromStorage();
    const user = users.find((u) => u.id === userId);
    document.getElementById(
      "confirmDeleteModalBody"
    ).textContent = `Are you sure you want to delete user "${user?.name}" (ID: ${userId})? This action cannot be undone.`;
    confirmDeleteModal.show();
  }

  function handleDeleteProduct(productId) {
    itemToDelete = { type: "product", id: productId };
    const products = getProductsFromStorage();
    const product = products.find((p) => p.id === productId);
    document.getElementById(
      "confirmDeleteModalBody"
    ).textContent = `Are you sure you want to delete product "${product?.name}" (ID: ${productId})? This action cannot be undone.`;
    confirmDeleteModal.show();
  }

  // --- Confirm Deletion ---
  confirmDeleteButton.addEventListener("click", () => {
    if (itemToDelete.type === "user") {
      let users = getUsersFromStorage();
      users = users.filter((u) => u.id !== itemToDelete.id);
      saveUsersToStorage(users);
      console.log(`User ${itemToDelete.id} deleted.`);
      renderCustomers(); // Re-render relevant lists
      renderSellers();
      renderDashboardStats(); // Update stats
    } else if (itemToDelete.type === "product") {
      let products = getProductsFromStorage();
      products = products.filter((p) => p.id !== itemToDelete.id);
      saveProductsToStorage(products);
      console.log(`Product ${itemToDelete.id} deleted.`);
      renderProducts(); // Re-render product list
      renderDashboardStats(); // Update stats
    }
    itemToDelete = { type: null, id: null }; // Reset
    confirmDeleteModal.hide();
  });

  // --- Event Delegation ---
  document
    .getElementById("v-pills-tabContent")
    .addEventListener("click", (event) => {
      const target = event.target;
      const userRow = target.closest("tr[data-user-id]");
      const productRow = target.closest("tr[data-product-id]");

      // User Actions
      if (userRow) {
        const userId = parseInt(userRow.dataset.userId);
        if (target.closest(".view-details-btn")) {
          showUserDetails(userId);
        } else if (target.closest(".remove-user-btn")) {
          handleDeleteUser(userId);
        }
      }

      // Product Actions
      if (productRow) {
        const productId = parseInt(productRow.dataset.productId);
        if (target.closest(".view-details-btn")) {
          showProductDetails(productId);
        } else if (target.closest(".delete-product-btn")) {
          handleDeleteProduct(productId);
        }
        // Add listener for edit button if implemented
      }
    });

  // --- Initial Load ---
  renderDashboardStats();
  renderCustomers();
  renderSellers();
  renderProducts();
});
