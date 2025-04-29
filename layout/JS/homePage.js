

// addActiveToLinkes();

// document.addEventListener('DOMContentLoaded', () => {
//     const products = JSON.parse(localStorage.getItem('products')) || [];

//     const newProductsContainer = document.querySelector('.row.new-products');
//     const topSellingContainer = document.querySelector('.row.top-selling');
//     const topRatedContainer = document.querySelector('.col-md-4.top-rated .products-list');
//     const topViewContainer = document.querySelector('.col-md-4.top-view .products-list');
//     const topselllingContainer = document.querySelector('.col-md-4.top-selling-mini .products-list');

//     function createProductCard(product) {
//         return `
//             <div class="col-md-3 mb-4">
//                 <div class="card product-card">
//                     <img src="${product.img}" class="card-img-top" alt="${product.name}">
//                     <div class="card-body">
//                         <h6 class="card-title">${product.name}</h6>
//                         <p class="card-text text-danger">$${product.price || 100} <del class="text-muted">$${(product.price + 50)}</del></p>
//                         <a href="#" class="btn btn-outline-primary btn-sm">Add to Cart</a>
//                     </div>
//                 </div>
//             </div>
//         `;
//     }

//     function createTopProductMini(product) {
//         return `
//             <div class="top-selling-product d-flex align-items-center mb-2">
//                 <img src="${product.img}" alt="${product.name}" style="width: 60px; height: 60px; object-fit: cover;">
//                 <div class="ms-2">
//                     <small>Category</small>
//                     <h6>${product.name}</h6>
//                     <span class="price">$${product.price || 100}</span>
//                 </div>
//             </div>
//         `;
//     }
//     function getRandomInt(min, max) {
//         min = Math.ceil(min);
//         max = Math.floor(max);
//         return Math.floor(Math.random() * (max - min + 1)) + min;
//     }
//     x = getRandomInt(1,60);
//     y = getRandomInt(1,60);
//     z = getRandomInt(1,60);
//     n = getRandomInt(1,60);
//     m = getRandomInt(1,60);    
//     products.slice(x, x+4).forEach(product => {
//         newProductsContainer.innerHTML += createProductCard(product);
//     });

//     products.slice(y, (y+4)).forEach(product => {
//         topSellingContainer.innerHTML += createProductCard(product);
//     });

//     products.slice(z, (z+4)).forEach(product => {
//         topRatedContainer.innerHTML += createTopProductMini(product);
//     });

//     products.slice(n, (n+4)).forEach(product => {
//         topViewContainer.innerHTML += createTopProductMini(product);
//     });
//     products.slice(m, (m+4)).forEach(product => {
//         topselllingContainer.innerHTML += createTopProductMini(product);
//     });
    
// });

// const brands = [
//     { name: "Lenovo", logo: "/imgs/homePage/lenovo.png" },
//     { name: "Dell", logo: "/imgs/homePage/dell.jpg" },
//     { name: "HP", logo: "/imgs/homePage/HP-Logo.png" },
//     { name: "Apple", logo: "/imgs/homePage/Apple-Logosu.png" },
//     { name: "Samsung", logo: "/imgs/homePage/samsung-logo-png_seeklogo-536641.png" },
//     { name: "Sony", logo: "/imgs/homePage/Sony_logo.svg.png" },
//     { name: "Bose", logo: "/imgs/homePage/Bose_Corporation-Logo.wine.png" },
//     { name: "JBL", logo: "/imgs/homePage/JBL-Logo.png" },
// ];
// function createLogoSlides() {
//     const container = document.getElementById('logoContainer');            
//     brands.forEach(brand => {
//         const slide = document.createElement('div');
//         slide.className = 'logo-slide';
        
//         const img = document.createElement('img');
//         img.src = brand.logo;
//         img.alt = brand.name + ' logo';
//         img.title = brand.name;
        
//         slide.appendChild(img);
//         container.appendChild(slide);
//     });            
//     const slides = document.querySelectorAll('.logo-slide');
//     slides.forEach(slide => {
//         const clone = slide.cloneNode(true);
//         container.appendChild(clone);
//     });
// }
// function updateLoginButton() {
// const loginBtn = document.getElementById('loginBtn');
// const loggedInUserId = sessionStorage.getItem('loggedInUserId');
// const loggedInUserRole = sessionStorage.getItem('loggedInUserRole');

// if (loginBtn) {
//     if (loggedInUserId && loggedInUserRole) {
//         const userDropdownHTML = `
//             <div class="dropdown">
//                 <a href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false" style="width: 45px; height: 45px;">
//                     <i class="fa-solid fa-circle-user text-white display-6"></i>
//                 </a>
//                 <ul class="dropdown-menu dropdown-menu-end rounded-3 mt-2" aria-labelledby="userDropdown" style="min-width: 120px;">
//                     <li><a class="dropdown-item small" href="/profile.html"><i class="fa-solid fa-user"></i> Profile</a></li>
//                     <li><hr class="dropdown-divider"></li>
//                     <li><a class="dropdown-item small text-danger" href="#" id="logoutBtn"><i class="fa-solid fa-right-from-bracket me-2"></i> Logout</a></li>
//                 </ul>
//             </div>
//         `;
//         loginBtn.outerHTML = userDropdownHTML;
//         setTimeout(() => {
//             const logoutBtn = document.getElementById('logoutBtn');
//             if (logoutBtn) {
//                 logoutBtn.addEventListener('click', function(e) {
//                     e.preventDefault();
//                     sessionStorage.removeItem('loggedInUserId');
//                     sessionStorage.removeItem('loggedInUserRole');
//                     window.location.href = '/homePage.html';
//                 });
//             }
//         }, 50);
//     }
// } else {
//     setTimeout(updateLoginButton, 50);
// }
// }
// document.addEventListener('DOMContentLoaded', function() {
// createLogoSlides();
// updateLoginButton();
// });
