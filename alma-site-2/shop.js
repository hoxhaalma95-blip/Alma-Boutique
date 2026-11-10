// ==========================================================
// Alma Boutique - shop.js
// Filters, search, sorting and wishlist hearts for shop.html.
// It uses the PRODUCTS list from products.js.
// ==========================================================

const STORAGE_KEY = "alma-wishlist";

// The filter buttons: [value, label]
const CATEGORIES = [
  ["all", "All"],
  ["bags", "Bags"],
  ["boots", "Boots & Shoes"],
  ["jackets", "Jackets"],
  ["blazers", "Blazers"],
  ["clothing", "Clothing"],
  ["parfumes", "Perfumes"],
  ["beauty", "Beauty"],
  ["kids", "Kids"],
  ["accessories", "Accessories"],
];

// Everything the page "remembers" about what the visitor chose
const state = {
  category: "all",
  query: "",
  sort: "featured",
  onlyFavorites: false,
};

// ---------- Wishlist (saved in localStorage) ----------
function loadWishlist() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    return []; // storage blocked or broken data: start with an empty list
  }
}

function saveWishlist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
  } catch (error) {
    // ignore: the hearts still work until the page is closed
  }
}

let wishlist = loadWishlist();

// ---------- Page elements ----------
const grid = document.getElementById("grid");
const searchInput = document.getElementById("search");
const sortSelect = document.getElementById("sort");
const categoryBar = document.getElementById("categories");
const favoritesButton = document.getElementById("favorites-toggle");
const countText = document.getElementById("count");

// ---------- Small helpers ----------
function formatPrice(price) {
  return (Number.isInteger(price) ? price : price.toFixed(2)) + "$";
}

// Stops names from being read as HTML code
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// "black bag" matches a product only if EVERY word is found in its name
function matchesSearch(product) {
  const words = state.query.toLowerCase().split(" ").filter(Boolean);
  const text = (product.name + " " + product.category).toLowerCase();
  return words.every((word) => text.includes(word));
}

// ---------- 1) Filter, 2) sort ----------
function getVisibleProducts() {
  // filter() keeps only the products that pass ALL the checks
  const filtered = PRODUCTS.filter((product) => {
    const categoryOk = state.category === "all" || product.category === state.category;
    const favoriteOk = !state.onlyFavorites || wishlist.includes(product.id);
    return categoryOk && favoriteOk && matchesSearch(product);
  });

  // sort() changes the order. We sort a copy so PRODUCTS stays untouched.
  const sorted = [...filtered];
  if (state.sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
  if (state.sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
  if (state.sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
  return sorted;
}

// ---------- Drawing the page ----------
function productCard(product) {
  const liked = wishlist.includes(product.id);
  const name = escapeHtml(product.name);

  return `
    <article class="product-card">
      <div class="product-img-wrap">
        <img src="${escapeHtml(product.image)}" alt="${name}" loading="lazy">
        <button class="heart ${liked ? "liked" : ""}" data-id="${product.id}"
                aria-pressed="${liked}"
                aria-label="${liked ? "Remove from" : "Add to"} wishlist: ${name}">
          ${liked ? "♥" : "♡"}
        </button>
      </div>
      <h3>${name}</h3>
      <p class="price">${formatPrice(product.price)}</p>
      <button class="add-btn" data-add-id="${product.id}">Add to cart</button>
    </article>`;
}

function render() {
  const products = getVisibleProducts();

  if (products.length === 0) {
    grid.innerHTML = `<p class="empty">No products found. Try another word or category.</p>`;
  } else {
    grid.innerHTML = products.map(productCard).join("");
  }

  countText.textContent = products.length + (products.length === 1 ? " product" : " products");
  favoritesButton.textContent = (state.onlyFavorites ? "♥" : "♡") + " Favorites (" + wishlist.length + ")";
  favoritesButton.setAttribute("aria-pressed", state.onlyFavorites);

  // Highlight the active category button
  categoryBar.querySelectorAll("button").forEach((button) => {
    button.classList.toggle("active", button.dataset.category === state.category);
  });
}

// ---------- Events ----------
// Build the category buttons from the CATEGORIES list
categoryBar.innerHTML = CATEGORIES.map(
  ([value, label]) => `<button type="button" data-category="${value}">${label}</button>`
).join("");

categoryBar.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  state.category = button.dataset.category;
  render();
});

searchInput.addEventListener("input", () => {
  state.query = searchInput.value.trim();
  render();
});

sortSelect.addEventListener("change", () => {
  state.sort = sortSelect.value;
  render();
});

favoritesButton.addEventListener("click", () => {
  state.onlyFavorites = !state.onlyFavorites;
  render();
});

// One listener for ALL hearts and "Add to cart" buttons (event delegation):
// it also works for cards that are created later by render().
grid.addEventListener("click", (event) => {
  const addButton = event.target.closest(".add-btn");
  if (addButton) {
    AlmaCart.add(Number(addButton.dataset.addId)); // from site.js
    addButton.textContent = "Added ✓";
    addButton.classList.add("added");
    setTimeout(() => {
      addButton.textContent = "Add to cart";
      addButton.classList.remove("added");
    }, 1200);
    return;
  }

  const heart = event.target.closest(".heart");
  if (!heart) return;

  const id = Number(heart.dataset.id);
  if (wishlist.includes(id)) {
    wishlist = wishlist.filter((savedId) => savedId !== id); // remove
  } else {
    wishlist.push(id); // add
  }
  saveWishlist();
  render();
});

render();
