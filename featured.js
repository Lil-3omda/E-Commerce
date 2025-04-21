function getRandomItems(arr, count) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function groupByCategory(products) {
  return products.reduce((groups, product) => {
    const cat = product.category;
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(product);
    return groups;
  }, {});
}

function renderFeaturedProducts(products) {
  const container = document.getElementById("featured-products");
  const grouped = groupByCategory(products);
  console.log(grouped);

  Object.entries(grouped).forEach(([category, items]) => {
    const randomProducts = getRandomItems(items, 4);

    const categoryHTML = `
      <h3 class="text-capitalize mt-5">${category}</h3>
      <div class="row">
        ${randomProducts
          .map(
            (prod) => `
          <div class="col-12 col-sm-6 col-lg-3 mb-4">
            <div class="card h-100">
              <img src="${prod.img}" class="card-img-top fixed-image" alt="${prod.name}">
              <div class="card-body">
                <h5 class="card-title">${prod.name}</h5>
                <p class="card-text">${prod.price}</p>
                <a href="#" class="btn btn-primary">add to cart</a>
              </div>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    `;

    container.innerHTML += categoryHTML;
  });
}

const products = JSON.parse(localStorage.getItem("products"));
renderFeaturedProducts(products);
