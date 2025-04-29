import { addToCart } from "./cartHandler.js";
import { searchBar } from "./navBar.js";
let products = [];
let allProducts = [];
const productsPerPage = 16;
let currentPage = 1;

async function fetchProducts() {
  const productsData = localStorage.getItem("products");
  if (productsData) {
    allProducts = JSON.parse(productsData);
    allProducts = allProducts.filter((product) => product.category === "smartphones");
    products = [...allProducts];
  } else {
    console.error("No product founded");
    products = [];
  }
  displayProducts(currentPage);
  setupPagination();
}
// Search bar functionality
searchBar.addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase();
  products = allProducts.filter((product) =>
    product.name.toLowerCase().includes(query)
  );
  currentPage = 1;
  displayProducts(currentPage);
  setupPagination();
});

function displayProducts(page) {
  if (!products || !Array.isArray(products) || products.length === 0) return;
  if (typeof productsPerPage !== "number" || productsPerPage <= 0) return;

  const filterableCards = document.getElementById("filterable-cards");

  const start = (page - 1) * productsPerPage;
  const end = start + productsPerPage;
  const paginatedProducts = products.slice(start, end);

  // Helper: render product cards
  function renderProducts(productList) {
    filterableCards.innerHTML = productList
      .map(
        (product) => `
      <div class="card item p-2 m-4 mt-0">
        <img src="${product.img}" alt="" class="product-card" data-id="${product.id}">
        <div class="card-body">
          <h6 class="card-title fs-5">${product.name}</h6>
          <p class="card-description">${product.category}</p>
          <p class="card-description">${product.price} EGP</p>
          <button data-product='${JSON.stringify(product).replace(/'/g, "&apos;")}' class="btn btn-primary cartBtn">Add to Cart<i class="fa-solid fa-cart-plus ms-1"></i></button>
        </div>
      </div>
    `
      )
      .join("");
  }

  // Helper: toggle active filter button
  function setActiveFilter(activeId) {
    ["all", "best-seller", "premium", "economic"].forEach((id) => {
      document.getElementById(id).classList.toggle("active", id === activeId);
    });
  }

  // Initial load: paginated list
  renderProducts(paginatedProducts);

  // Filter logic map
  const filters = {
    "all": () => products,
    "best-seller": () => products.filter(product => product.sold >= 30),
    "premium": () => products.filter(product => product.price >= 50000),
    "economic": () => products.filter(product => product.price <= 35000)
  };

  // Attach filter click listeners
  Object.keys(filters).forEach(filterId => {
    const element = document.getElementById(filterId);
    element.addEventListener("click", () => {
      setActiveFilter(filterId);
      const filtered = filters[filterId]();
      renderProducts(filtered);
    });
  });

  // Navigation to product detail page via image click
  filterableCards.addEventListener("click", (e) => {
    if (e.target.classList.contains("product-card")) {
      const productId = e.target.dataset.id;
      window.location.href = `productDetails.html?productId=${productId}`;
    }
  });
  filterableCards.addEventListener("click", (e) => {
    const userId = sessionStorage.getItem("loggedInUserId") || "0";
    if (e.target.classList.contains("cartBtn")) {
      addToCart(e.target.dataset.product);
    }
  });
}
//end of displayProducts
function setupPagination() {
  const pageCount = Math.ceil(products.length / productsPerPage);
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  // Previous Button
  const prev = document.createElement("li");
  prev.className = `page-item ${currentPage === 1 ? "disabled" : ""}`;
  prev.innerHTML = `<a class="page-link" href="#">Previous</a>`;
  prev.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      displayProducts(currentPage);
      setupPagination();
    }
  });
  pagination.appendChild(prev);

  // Page Buttons
  for (let i = 1; i <= pageCount; i++) {
    const pageBtn = document.createElement("li");
    pageBtn.className = `page-item ${i === currentPage ? "active" : ""}`;
    pageBtn.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    pageBtn.addEventListener("click", () => {
      currentPage = i;
      displayProducts(currentPage);
      setupPagination();
    });
    pagination.appendChild(pageBtn);
  }

  // Next Button
  const next = document.createElement("li");
  next.className = `page-item ${currentPage === pageCount ? "disabled" : ""}`;
  next.innerHTML = `<a class="page-link" href="#">Next</a>`;
  next.addEventListener("click", () => {
    if (currentPage < pageCount) {
      currentPage++;
      displayProducts(currentPage);
      setupPagination();
    }
  });
  pagination.appendChild(next);
}
// const buttons = document.querySelectorAll("button");
// console.log(buttons);
// buttons.forEach(button => {
//     button.addEventListener("click", () => {
//         // Your logic here
//         console.log("Button clicked:", button.textContent);
//     });
// });
fetchProducts();
