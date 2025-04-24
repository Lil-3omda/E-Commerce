let products = [];
const productsPerPage = 16;
let currentPage = 1;

async function fetchProducts() {
  const productsData = localStorage.getItem("products");
  if (productsData) {
    products = JSON.parse(productsData);
  } else {
    console.error("No product founded");
    products = [];
  }
  displayProducts(currentPage);
  setupPagination();
}

function displayProducts(page) {
  const start = (page - 1) * productsPerPage;
  const end = start + productsPerPage;
  const paginatedProducts = products.slice(start, end);

const items = document.getElementById("filterable-cards");
items.innerHTML = paginatedProducts.map(product => `
    <div class="card item p-2 m-4 mt-0">
        <img src="${product.img}" alt="">
        <div class="card-body">
            <h6 class="card-title fs-5">${product.name}</h6>
            <p class="card-description">${product.category}</p>
            <p class="card-description">${product.price}$</p>
            <button
             class="btn btn-primary add-to-cart-btn">Add to Cart<i class="fa-solid fa-cart-plus ms-1"></i></button>
        </div>
    </div>
`).join("");
}

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
fetchProducts();
