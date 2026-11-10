// ==========================================================
// Alma Boutique - cart.js (cart.html)
// Shows the products saved in the cart (AlmaCart, from site.js)
// and lets the visitor change quantities, remove items and check out.
// ==========================================================
const cartBox = document.getElementById("cart");
let orderPlaced = false; // true after the (demo) checkout

function money(number) {
  return number.toFixed(2) + "$";
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Joins the saved cart ({id, qty}) with the full product info from PRODUCTS
function getCartLines() {
  return AlmaCart.items()
    .map((item) => ({ product: PRODUCTS.find((p) => p.id === item.id), qty: item.qty }))
    .filter((line) => line.product); // ignore ids that no longer exist
}

function lineHtml(line) {
  const p = line.product;
  const name = escapeHtml(p.name);
  return `
    <div class="cart-row">
      <img src="${escapeHtml(p.image)}" alt="${name}">
      <div class="cart-info">
        <h3>${name}</h3>
        <p class="cart-unit">${money(p.price)} each</p>
        <button class="link-btn" data-action="remove" data-id="${p.id}">Remove</button>
      </div>
      <div class="cart-qty">
        <button data-action="dec" data-id="${p.id}" aria-label="Fewer">−</button>
        <span>${line.qty}</span>
        <button data-action="inc" data-id="${p.id}" aria-label="More">+</button>
      </div>
      <p class="cart-line-total">${money(p.price * line.qty)}</p>
    </div>`;
}

function render() {
  const lines = getCartLines();

  if (orderPlaced) {
    cartBox.innerHTML = `
      <div class="cart-message">
        <h2>Thank you for your order! 💌</h2>
        <p>This is a student project, so no real order or payment was made.</p>
        <a href="./shop.html" class="cart-btn">Keep shopping</a>
      </div>`;
    return;
  }

  if (lines.length === 0) {
    cartBox.innerHTML = `
      <div class="cart-message">
        <h2>Your cart is empty</h2>
        <p>Find something you love in the shop.</p>
        <a href="./shop.html" class="cart-btn">Go to the shop</a>
      </div>`;
    return;
  }

  // reduce() adds up price × quantity for every line
  const total = lines.reduce((sum, line) => sum + line.product.price * line.qty, 0);
  const pieces = lines.reduce((sum, line) => sum + line.qty, 0);

  cartBox.innerHTML = `
    <div class="cart-layout">
      <div class="cart-list">${lines.map(lineHtml).join("")}</div>

      <aside class="cart-summary">
        <h2>Order summary</h2>
        <p class="summary-row"><span>Items (${pieces})</span><span>${money(total)}</span></p>
        <p class="summary-row"><span>Shipping</span><span>Free</span></p>
        <p class="summary-row summary-total"><span>Total</span><span>${money(total)}</span></p>
        <button class="cart-btn" data-action="checkout">Checkout</button>
        <button class="link-btn" data-action="clear">Clear cart</button>
      </aside>
    </div>`;
}

// One listener for every button inside the cart (event delegation)
cartBox.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const id = Number(button.dataset.id);
  const action = button.dataset.action;
  const current = AlmaCart.items().find((item) => item.id === id);

  if (action === "inc") AlmaCart.setQty(id, current.qty + 1);
  if (action === "dec" && current.qty > 1) AlmaCart.setQty(id, current.qty - 1);
  if (action === "remove") AlmaCart.remove(id);
  if (action === "clear") AlmaCart.clear();
  if (action === "checkout") {
    AlmaCart.clear();
    orderPlaced = true;
  }
  render();
});

render();
