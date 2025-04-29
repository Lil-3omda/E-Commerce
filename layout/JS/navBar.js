export const searchBar=document.getElementById("searchInput");

export function addActiveToLinkes(){
    document.addEventListener("DOMContentLoaded", function () {
        console.log("DOM fully loaded and parsed");
      const links = document.querySelectorAll(".navbar-nav .nav-link");
      const currentPath = window.location.pathname;
    
      links.forEach(link => {
        if (link.getAttribute("href") === currentPath) {
          link.classList.add("active");
          link.setAttribute("aria-current", "page");
        } else {
          link.classList.remove("active");
          link.removeAttribute("aria-current");
        }
      });
    });
}
