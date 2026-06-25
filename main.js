const productForm = document.getElementById('product-form');
const nameInput = document.getElementById('name');
const descriptionInput = document.getElementById('description');
const quantityInput = document.getElementById('quantity');
const priceInput = document.getElementById('price');
const productList = document.getElementById('product-list');
const productCount = document.getElementById('product-count');
const totalItems = document.getElementById('total-items');
const totalValue = document.getElementById('total-value');
const installBtn = document.getElementById('install-btn');
const installHelp = document.getElementById('install-help');
const tabButtons = Array.from(document.querySelectorAll('.tab-button'));
const tabPanels = Array.from(document.querySelectorAll('.tab-panel'));
const productSelect = document.getElementById('product-select');
const saleQuantity = document.getElementById('sale-quantity');
const addToCartButton = document.getElementById('add-to-cart');
const cartList = document.getElementById('cart-list');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const completeSaleButton = document.getElementById('complete-sale');

let products = [];
let cart = [];
let deferredPrompt = null;
const isMobile = /iphone|ipad|ipod|android/i.test(navigator.userAgent);

function formatCurrency(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function loadProducts() {
  const saved = localStorage.getItem('storeProducts');
  products = saved ? JSON.parse(saved) : [];
}

function saveProducts() {
  localStorage.setItem('storeProducts', JSON.stringify(products));
}

function loadCart() {
  const saved = localStorage.getItem('storeCart');
  cart = saved ? JSON.parse(saved) : [];
}

function saveCart() {
  localStorage.setItem('storeCart', JSON.stringify(cart));
}

function renderProducts() {
  if (!productList || !productCount || !totalItems || !totalValue) return;

  if (products.length === 0) {
    productList.innerHTML = '<p class="empty-state">Cadastre produtos para gerenciar estoque.</p>';
  } else {
    productList.innerHTML = products.map(product => `
      <article class="product-card">
        <div class="product-row">
          <div>
            <strong>${product.name}</strong>
            <p>${product.description || 'Sem descrição'}</p>
          </div>
          <button type="button" data-action="remove" data-id="${product.id}">Remover</button>
        </div>
        <div class="product-meta">
          <span>Estoque: ${product.quantity}</span>
          <span>Preço: ${formatCurrency(product.price)}</span>
          <span>Valor total: ${formatCurrency(product.quantity * product.price)}</span>
        </div>
      </article>`).join('');
  }

  const totalQuantity = products.reduce((sum, item) => sum + item.quantity, 0);
  const totalStockValue = products.reduce((sum, item) => sum + item.quantity * item.price, 0);

  productCount.textContent = `${products.length} produto${products.length === 1 ? '' : 's'}`;
  totalItems.textContent = totalQuantity;
  totalValue.textContent = formatCurrency(totalStockValue);
}

function renderProductSelect() {
  if (!productSelect) return;

  if (products.length === 0) {
    productSelect.innerHTML = '<option value="">Nenhum produto disponível</option>';
    return;
  }

  productSelect.innerHTML = products.map(product => `
    <option value="${product.id}">${product.name} (${product.quantity} em estoque) - ${formatCurrency(product.price)}</option>
  `).join('');
}

function renderCart() {
  if (!cartList || !cartItems || !cartTotal) return;

  if (cart.length === 0) {
    cartList.innerHTML = '<p class="empty-state">Adicione produtos ao carrinho para registrar a venda.</p>';
  } else {
    cartList.innerHTML = cart.map(item => `
      <article class="product-card">
        <div class="product-row">
          <div>
            <strong>${item.name}</strong>
            <p>Qtd: ${item.quantity} × ${formatCurrency(item.price)}</p>
          </div>
          <button type="button" data-action="remove-cart" data-id="${item.id}">Remover</button>
        </div>
        <div class="product-meta">
          <span>Subtotal: ${formatCurrency(item.quantity * item.price)}</span>
        </div>
      </article>`).join('');
  }

  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartValue = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);

  cartItems.textContent = `${totalItemsCount} item${totalItemsCount === 1 ? '' : 's'}`;
  cartTotal.textContent = formatCurrency(totalCartValue);
}

function addProduct(event) {
  event.preventDefault();

  const name = nameInput.value.trim();
  const description = descriptionInput.value.trim();
  const quantity = Number(quantityInput.value);
  const price = Number(priceInput.value);

  if (!name || quantity < 1 || price <= 0) {
    alert('Preencha nome, quantidade e preço válidos.');
    return;
  }

  products.unshift({ id: Date.now(), name, description, quantity, price });
  saveProducts();
  renderProducts();
  renderProductSelect();
  productForm.reset();
  quantityInput.value = '1';
  priceInput.value = '0.00';
  nameInput.focus();
}

function removeProduct(id) {
  products = products.filter(item => item.id !== id);
  saveProducts();
  renderProducts();
  renderProductSelect();
}

function addToCart() {
  if (!productSelect || !saleQuantity) return;

  const productId = Number(productSelect.value);
  const quantity = Number(saleQuantity.value);
  const product = products.find(item => item.id === productId);

  if (!product) {
    alert('Selecione um produto válido.');
    return;
  }

  if (quantity < 1 || quantity > product.quantity) {
    alert(`Quantidade inválida. Estoque disponível: ${product.quantity}`);
    return;
  }

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    if (existing.quantity + quantity > product.quantity) {
      alert(`Quantidade total no carrinho não pode ultrapassar o estoque (${product.quantity}).`);
      return;
    }
    existing.quantity += quantity;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, quantity });
  }

  saveCart();
  renderCart();
}

function removeCartItem(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  renderCart();
}

function completeSale() {
  if (cart.length === 0) {
    alert('Adicione produtos ao carrinho antes de finalizar a venda.');
    return;
  }

  cart.forEach(item => {
    const product = products.find(prod => prod.id === item.id);
    if (product) {
      product.quantity -= item.quantity;
      if (product.quantity < 0) product.quantity = 0;
    }
  });

  cart = [];
  saveProducts();
  saveCart();
  renderProducts();
  renderProductSelect();
  renderCart();
  saleQuantity.value = '1';
  alert('Venda finalizada com sucesso!');
}

function switchTab(tabName) {
  tabButtons.forEach(button => {
    button.classList.toggle('active', button.dataset.tab === tabName);
  });
  tabPanels.forEach(panel => {
    panel.classList.toggle('active-panel', panel.id === tabName);
  });
}

function handleInstallPrompt(event) {
  event.preventDefault();
  deferredPrompt = event;
  if (installBtn) installBtn.classList.remove('hidden');
  if (installHelp) installHelp.classList.add('hidden');
}

function showInstallHelp() {
  if (installHelp) installHelp.classList.remove('hidden');
}

if (productForm) productForm.addEventListener('submit', addProduct);
if (addToCartButton) addToCartButton.addEventListener('click', addToCart);
if (completeSaleButton) completeSaleButton.addEventListener('click', completeSale);
if (installBtn) {
  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    deferredPrompt = null;
    installBtn.classList.add('hidden');
    if (choice.outcome !== 'accepted') showInstallHelp();
  });
}
if (tabButtons.length) {
  tabButtons.forEach(button => {
    button.addEventListener('click', () => switchTab(button.dataset.tab));
  });
}
if (productList) {
  productList.addEventListener('click', (event) => {
    const target = event.target;
    if (target.matches('button[data-action="remove"]')) {
      const id = Number(target.dataset.id);
      removeProduct(id);
    }
  });
}
if (cartList) {
  cartList.addEventListener('click', (event) => {
    const target = event.target;
    if (target.matches('button[data-action="remove-cart"]')) {
      const id = Number(target.dataset.id);
      removeCartItem(id);
    }
  });
}

window.addEventListener('beforeinstallprompt', handleInstallPrompt);
window.addEventListener('load', () => {
  loadProducts();
  loadCart();
  renderProducts();
  renderProductSelect();
  renderCart();

  setTimeout(() => {
    if (isMobile && !deferredPrompt) {
      if (installBtn) installBtn.classList.add('hidden');
      showInstallHelp();
    }
  }, 1200);

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
      .then(() => console.log('Service Worker registrado com sucesso.'))
      .catch((error) => console.warn('Falha no registro do SW:', error));
  }
});

window.addEventListener('appinstalled', () => {
  if (installBtn) installBtn.classList.add('hidden');
  if (installHelp) installHelp.classList.add('hidden');
});
