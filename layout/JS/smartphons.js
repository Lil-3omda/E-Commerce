let products = [];
const productsPerPage = 16;
let currentPage = 1;

async function fetchProducts() {
  const productsData = localStorage.getItem("products");
  if (productsData) {
    products = JSON.parse(productsData);
    products = products.filter((product) => product.category === "smartphones");
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

  // all products filter
  const all = document.getElementById("all");

  all.addEventListener("click", function () {
    // active state of the zuraar
    all.classList.add("active");
    document.getElementById("premium").classList.remove("active");
    document.getElementById("economic").classList.remove("active");
    document.getElementById("best-seller").classList.remove("active");

    const filterableCards = document.getElementById("filterable-cards");

    // all products filter
    filterableCards.innerHTML = products
      .filter((product) => {
        return product;
      })
      .map(
        (product) => `
      <div class="card item p-2 m-4 mt-0">
        <img src="${product.img}" alt="">
        <div class="card-body">
            <h6 class="card-title fs-5">${product.name}</h6>
            <p class="card-description">${product.category}</p>
            <p class="card-description">${product.price}$</p>
            <button class="btn btn-primary">Add to Cart<i class="fa-solid fa-cart-plus ms-1"></i></button>
        </div>
    </div>
    `
      )
      .join("");
  });

  // best sellers filter
  const betsSeller = document.getElementById("best-seller");

  betsSeller.addEventListener("click", function () {
    betsSeller.classList.add("active");
    document.getElementById("all").classList.remove("active");
    document.getElementById("premium").classList.remove("active");
    document.getElementById("economic").classList.remove("active");

    const filterableCards = document.getElementById("filterable-cards");

    filterableCards.innerHTML = products
      .filter((product) => {
        return product.sold >= 7;
      })
      .map(
        (product) => `
      <div class="card item p-2 m-4 mt-0">
        <img src="${product.img}" alt="">
        <div class="card-body">
            <h6 class="card-title fs-5">${product.name}</h6>
            <p class="card-description">${product.category}</p>
            <p class="card-description">${product.price}$</p>
            <button class="btn btn-primary">Add to Cart<i class="fa-solid fa-cart-plus ms-1"></i></button>
        </div>
    </div>
    `
      )
      .join("");
  });

  // premium filter

  const premium = document.getElementById("premium");
  premium.addEventListener("click", function () {
    premium.classList.add("active");
    document.getElementById("all").classList.remove("active");
    document.getElementById("best-seller").classList.remove("active");
    document.getElementById("economic").classList.remove("active");

    const filterableCards = document.getElementById("filterable-cards");

    filterableCards.innerHTML = products
      .filter((product) => {
        return product.price >= 10000;
      })
      .map(
        (product) => `
      <div class="card item p-2 m-4 mt-0">
        <img src="${product.img}" alt="">
        <div class="card-body">
            <h6 class="card-title fs-5">${product.name}</h6>
            <p class="card-description">${product.category}</p>
            <p class="card-description">${product.price}$</p>
            <button class="btn btn-primary">Add to Cart<i class="fa-solid fa-cart-plus ms-1"></i></button>
        </div>
    </div>
    `
      )
      .join("");
  });

  // economic filter
  const economic = document.getElementById("economic");
  economic.addEventListener("click", function () {
    economic.classList.add("active");
    document.getElementById("all").classList.remove("active");
    document.getElementById("best-seller").classList.remove("active");
    document.getElementById("premium").classList.remove("active");

    const filterableCards = document.getElementById("filterable-cards");

    filterableCards.innerHTML = products
      .filter((product) => {
        return product.price <= 1000;
      })
      .map(
        (product) => `
      <div class="card item p-2 m-4 mt-0">
        <img src="${product.img}" alt="">
        <div class="card-body">
            <h6 class="card-title fs-5">${product.name}</h6>
            <p class="card-description">${product.category}</p>
            <p class="card-description">${product.price}$</p>
            <button class="btn btn-primary">Add to Cart<i class="fa-solid fa-cart-plus ms-1"></i></button>
        </div>
    </div>
    `
      )
      .join("");
  });

  const items = document.getElementById("filterable-cards");
  items.innerHTML = paginatedProducts
    .map(
      (product) =>
        `
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
`
    )
    .join("");
  const cartButtons = document.querySelectorAll(".add-to-cart-btn");
  cartButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const product = {
        id: e.target.dataset.id,
        name: e.target.dataset.name,
        price: e.target.dataset.price,
        img: e.target.dataset.img,
        category: e.target.dataset.category,
        description: e.target.dataset.description,
      };
      console.log(`Add to Cart clicked for product ID: ${product.id}`);
    });
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
// const buttons = document.querySelectorAll("button");
// console.log(buttons);
// buttons.forEach(button => {
//     button.addEventListener("click", () => {
//         // Your logic here
//         console.log("Button clicked:", button.textContent);
//     });
// });
fetchProducts();
