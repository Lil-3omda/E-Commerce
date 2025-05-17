import { addToCart, getCart } from "./cartHandler.js";
import { searchBar, addActiveToLinkes } from "./navBar.js";

let products = [];
let allProducts = [];
const productsPerPage = 15;
let currentPage = 1;

addActiveToLinkes();

window.addEventListener('popstate', function () {
  window.location.reload();
});

const filters = {
  "all": () => allProducts,
  "best-seller": () => allProducts.filter(product => product.sold >= 50),
  "premium": () => allProducts.filter(product => product.price >= 60000),
  "economic": () => allProducts.filter(product => product.price <= 800),
};

function setActiveFilter(activeId) {
  ["all", "best-seller", "premium", "economic"].forEach((id) => {
    document.getElementById(id)?.classList.toggle("active", id === activeId);
  });
}

function attachFilterListeners() {
  Object.keys(filters).forEach((filterId) => {
    const element = document.getElementById(filterId);
    if (element) {
      element.addEventListener("click", () => {
        setActiveFilter(filterId);
        products = filters[filterId]();
        currentPage = 1;
        displayProducts(currentPage);
        setupPagination();
      });
    }
  });
}

async function fetchProducts() {
  const productsData = localStorage.getItem("products");
  if (productsData) {
    allProducts = JSON.parse(productsData).filter(product => product.category === "headphones");
    products = [...allProducts];
  } else {
    console.error("No products found");
    products = [];
  }

  attachFilterListeners();
  displayProducts(currentPage);
  setupPagination();
}

try {
  searchBar.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    products = allProducts.filter(product =>
      product.name.toLowerCase().includes(query)
    );
    currentPage = 1;
    displayProducts(currentPage);
    setupPagination();
  });
} catch (error) {
  console.warn("Search bar not found or errored, reloading...");
  window.location.reload();
}

function displayProducts(page) {
  const filterableCards = document.getElementById("filterable-cards");

  if (!products || products.length === 0) {
    filterableCards.removeAttribute("class");
    filterableCards.innerHTML = `<div class="alert alert-danger text-center" role="alert">
      <h1 class="text-center m-auto">No Products Found</h1>
    </div>`;
    return;
  }

  filterableCards.className = 'filterable-cards';

  const start = (page - 1) * productsPerPage;
  const end = start + productsPerPage;
  const paginatedProducts = products.slice(start, end);

  filterableCards.innerHTML = paginatedProducts
    .map((product) => `
      <div class="card item p-2 m-4 mt-0">
        <img src="${product.img}" alt="" class="product-card" data-id="${product.id}">
        <div class="card-body">
          <h6 class="card-title fs-5">${product.name}</h6>
          <p class="card-description">${product.category}</p>
          <p class="card-description">${product.price} EGP</p>
          <button data-product='${JSON.stringify(product).replace(/'/g, "&apos;")}' class="btn cartBtn"
            ${product.available <= 0 ? "disabled" : ""}>
            ${product.available <= 0 ? "Out Of Stock" : `Add to Cart <i class="fa-solid fa-cart-plus ms-1"></i>`}
          </button>
        </div>
      </div>
    `).join("");

  // Handle product detail navigation
  filterableCards.querySelectorAll(".product-card").forEach(card => {
    card.addEventListener("click", (e) => {
      const productId = e.target.dataset.id;
      window.location.href = `productDetails.html?productId=${productId}`;
    });
  });

  // Handle Add to Cart
  filterableCards.querySelectorAll(".cartBtn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const productData = e.target.dataset.product;
      addToCart(productData);
    });
  });
}

function setupPagination() {
  const pageCount = Math.ceil(products.length / productsPerPage);
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const createPageItem = (label, pageIndex, disabled = false, active = false) => {
    const li = document.createElement("li");
    li.className = `page-item ${disabled ? "disabled" : ""} ${active ? "active" : ""}`;
    li.innerHTML = `<a class="page-link" href="#">${label}</a>`;
    li.addEventListener("click", (e) => {
      e.preventDefault();
      if (!disabled && pageIndex !== currentPage) {
        currentPage = pageIndex;
        displayProducts(currentPage);
        setupPagination();
        window.scrollTo({ top: 0, behavior: 'smooth' }); // 🔼 SCROLL TO TOP
      }
    });
    return li;
  };

  pagination.appendChild(createPageItem("Previous", currentPage - 1, currentPage === 1));

  for (let i = 1; i <= pageCount; i++) {
    pagination.appendChild(createPageItem(i, i, false, currentPage === i));
  }

  pagination.appendChild(createPageItem("Next", currentPage + 1, currentPage === pageCount));
}


fetchProducts();
