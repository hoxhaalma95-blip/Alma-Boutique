// ==========================================================
// Alma Boutique - site.js (every page)
// 1) Cart storage + "Cart (n)" link in the menu
// 2) Back-to-top button
// 3) Newsletter form check
// ==========================================================

// ---------- Cart (saved in localStorage) ----------
// The cart is a list like: [{ id: 5, qty: 2 }, { id: 12, qty: 1 }]
// Only the product id and quantity are saved; names and prices
// come from PRODUCTS (products.js) so they can never get out of date.
const AlmaCart = {
  KEY: "alma-cart",

  items() {
    try {
      const saved = JSON.parse(localStorage.getItem(this.KEY));
      return Array.isArray(saved) ? saved : [];
    } catch (error) {
      return []; // storage blocked or broken data: empty cart
    }
  },

  save(items) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(items));
    } catch (error) {
      // ignore: the cart still works until the page is closed
    }
    updateCartLink();
  },

  add(id) {
    const items = this.items();
    const found = items.find((item) => item.id === id);
    if (found) {
      found.qty = Math.min(found.qty + 1, 99);
    } else {
      items.push({ id: id, qty: 1 });
    }
    this.save(items);
  },

  setQty(id, qty) {
    const items = this.items();
    const found = items.find((item) => item.id === id);
    if (found) {
      found.qty = Math.max(1, Math.min(qty, 99));
      this.save(items);
    }
  },

  remove(id) {
    this.save(this.items().filter((item) => item.id !== id));
  },

  clear() {
    this.save([]);
  },

  // Total number of pieces in the cart
  count() {
    return this.items().reduce((sum, item) => sum + item.qty, 0);
  },
};

// Updates the text of the "Cart" link in the menu
function updateCartLink() {
  document.querySelectorAll(".cart-link").forEach(function (link) {
    const count = AlmaCart.count();
    link.textContent = count > 0 ? "Cart (" + count + ")" : "Cart";
  });
}

function setupCartLink() {
  // Adds a "Cart" item at the end of the menu on every page
  const menu = document.querySelector(".right-menu .nav-bar");
  if (!menu) return;

  const item = document.createElement("li");
  item.innerHTML = '<a href="./cart.html" class="cart-link">Cart</a>';
  menu.appendChild(item);
  updateCartLink();

  // If the cart changes in another browser tab, update this one too
  window.addEventListener("storage", updateCartLink);
}

document.addEventListener("DOMContentLoaded", function () {
  setupCartLink();
  setupBackToTop();
  setupNewsletter();
});

// ---------- Back to top ----------
function setupBackToTop() {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "back-to-top";
  button.setAttribute("aria-label", "Back to top");
  button.textContent = "↑";
  document.body.appendChild(button);

  // Show the button only after the visitor has scrolled down a bit
  window.addEventListener("scroll", function () {
    button.classList.toggle("show", window.scrollY > 400);
  });

  // Smooth scrolling back up (the CSS "scroll-behavior" also helps)
  button.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// ---------- Newsletter (footer) ----------
function setupNewsletter() {
  const forms = document.querySelectorAll(".footer-newsletter form");

  forms.forEach(function (form) {
    const input = form.querySelector("input");
    form.noValidate = true; // we show our own messages instead of the browser's

    const message = document.createElement("p");
    message.className = "newsletter-msg";
    message.setAttribute("role", "status");
    form.insertAdjacentElement("afterend", message);

    function show(text, type) {
      message.textContent = text;
      message.className = "newsletter-msg " + type;
      form.classList.toggle("invalid", type === "error");
      input.setAttribute("aria-invalid", type === "error");
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault(); // do not reload the page

      const email = input.value.trim();
      const looksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (email === "") {
        show("Please enter your email address.", "error");
      } else if (!looksValid) {
        show("Please enter a valid email, for example name@email.com", "error");
      } else {
        show("Thanks for subscribing! Welcome to Alma.", "success");
        input.value = "";
      }
    });

    // Remove the red state as soon as the visitor starts typing again
    input.addEventListener("input", function () {
      if (message.classList.contains("error")) {
        show("", "");
      }
    });
  });
}
