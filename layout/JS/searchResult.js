import { addToCart, getCart } from "./cartHandler.js";
import { searchBar,addActiveToLinkes } from "./navBar.js";
let products = [];
let allProducts = [];
const productsPerPage = 16;
let currentPage = 1;
const urlParams = new URLSearchParams(window.location.search);
const searchQuery = urlParams.get('query')?.toLowerCase().trim();
console.log(searchQuery);
addActiveToLinkes();

async function fetchProducts() {
    
  const productsData = localStorage.getItem("products");
  if (productsData) {
    allProducts = JSON.parse(productsData);
    products=allProducts.filter((product) => product.name.toLowerCase().includes(searchQuery));
    console.log(products);
  } else {
    console.error("No product founded");
    products = [];
  }
  displayProducts(currentPage);
  setupPagination();
}

try {
    searchBar.addEventListener("keydown", (e) => {
        if (event.key === 'Enter'){
            window.location.href = `searchResult.html?query=${searchBar.value}`;
        }
        
        
    });
    }
    catch (error) {
    window.location.reload();
    
    }


function displayProducts(page) {
    const filterableCards = document.getElementById("filterable-cards");
  if (!products || !Array.isArray(products) || products.length === 0){
    filterableCards.removeAttribute("class");
    filterableCards.innerHTML = `<div class="alert alert-danger text-center"  role="alert">
    <h1 calss="text-center m-auto">No products found </h1>
    </div>`;
    return;
  } 
  if (typeof productsPerPage !== "number" || productsPerPage <= 0) return;
 

  const start = (page - 1) * productsPerPage;
  const end = start + productsPerPage;
  const paginatedProducts = products.slice(start, end);

  function renderProducts(productList) {
    filterableCards.innerHTML = productList
      .map(
        (product) => `
        <div class="card item p-2 m-4 mt-0">
          <img src="${product.img}" alt="" class="product-card" data-id="${product.id}">
          <div class="card-body">
              <h6 class="card-title fs-5">${product.name}</h6>
              <p class="card-description">${product.category}</p>
              <p class="card-description">${product.price}EGP</p>
              <button data-product='${JSON.stringify(product).replace(/'/g, "&apos;")}' class="btn cartBtn">Add to Cart<i class="fa-solid fa-cart-plus ms-1"></i></button>
          </div>
        </div>
      `
      )
      .join("");
  }

  function setActiveFilter(activeId) {
    ["all", "best-seller", "premium", "economic"].forEach((id) => {
      document.getElementById(id).classList.toggle("active", id === activeId);
    });
  }

  const filters = {
    "all": () => products,
    "best-seller": () => products.filter((product) => product.sold >= 50),
    "premium": () => products.filter((product) => product.price >= 60000),
    "economic": () => products.filter((product) => product.price <= 800),
  };

  Object.keys(filters).forEach((filterId) => {
    const element = document.getElementById(filterId);
    element.addEventListener("click", () => {
      setActiveFilter(filterId);
      renderProducts(filters[filterId]());
    });
  });

  renderProducts(paginatedProducts);

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


function setupPagination() {
  const pageCount = Math.ceil(products.length / productsPerPage);
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

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
fetchProducts();
