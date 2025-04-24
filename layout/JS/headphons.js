let products = [];
const productsPerPage = 16;
let currentPage = 1;

async function fetchProducts() {
  const productsData = localStorage.getItem("products");
  if (productsData) {
    products = JSON.parse(productsData);
    products = products.filter((product) => product.category === "headphones");
  } else {
    console.error("No product founded");
    products = [];
  }
  displayProducts(currentPage);
  setupPagination();
}

function displayProducts(page) {
  if (!products || !Array.isArray(products) || products.length === 0) return;
  if (typeof productsPerPage !== "number" || productsPerPage <= 0) return;

  const filterableCards = document.getElementById("filterable-cards");

  // Pagination logic
  const start = (page - 1) * productsPerPage;
  const end = start + productsPerPage;
  const paginatedProducts = products.slice(start, end);

  // Helper: render products
  function renderProducts(productList) {
    filterableCards.innerHTML = productList
      .map(
        (product) => `
        <div class="card item p-2 m-4 mt-0">
            <img class="product-card" src="${product.img}" alt="" data-id="${product.id}">
            <div class="card-body">
                <h6 class="card-title fs-5">${product.name}</h6>
                <p class="card-description">${product.category}</p>
                <p class="card-description">${product.price}$</p>
                <button class="btn btn-primary add-to-cart-btn">
                    Add to Cart <i class="fa-solid fa-cart-plus ms-1"></i>
                </button>
            </div>
        </div>
      `
      )
      .join("");
  }

  // Helper: toggle active class on filters
  function setActiveFilter(activeId) {
    ["all", "best-seller", "premium", "economic"].forEach((id) => {
      document.getElementById(id).classList.toggle("active", id === activeId);
    });
  }

  // Initial render of paginated products
  renderProducts(paginatedProducts);

  // Event listeners for filters
  document.getElementById("all").addEventListener("click", () => {
    setActiveFilter("all");
    renderProducts(products);
  });

  document.getElementById("best-seller").addEventListener("click", () => {
    setActiveFilter("best-seller");
    const bestSellers = products.filter((product) => product.sold >= 7);
    renderProducts(bestSellers);
  });

  document.getElementById("premium").addEventListener("click", () => {
    setActiveFilter("premium");
    const premiumProducts = products.filter((product) => product.price >= 10000);
    renderProducts(premiumProducts);
  });

  document.getElementById("economic").addEventListener("click", () => {
    setActiveFilter("economic");
    const economicProducts = products.filter((product) => product.price <= 1000);
    renderProducts(economicProducts);
  });

  // Event delegation for image clicks (product details)
  filterableCards.addEventListener("click", (e) => {
    if (e.target.classList.contains("product-card")) {
      const productId = e.target.dataset.id;
      console.log(`Navigating to product ${productId}`);
      window.location.href = `productDetails.html?productId=${productId}`;
    }
  });
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
