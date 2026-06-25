const productForm = document.getElementById('product-form');
const nameInput = document.getElementById('name');
const categoryInput = document.getElementById('category');
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
const movementProductSelect = document.getElementById('movement-product-select');
const saleQuantity = document.getElementById('sale-quantity');
const movementQuantity = document.getElementById('movement-quantity');
const movementNoteInput = document.getElementById('movement-note');
const addToCartButton = document.getElementById('add-to-cart');
const cartList = document.getElementById('cart-list');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const completeSaleButton = document.getElementById('complete-sale');
const clearStockButton = document.getElementById('clear-stock');
const clearCartButton = document.getElementById('clear-cart');
const salesHistoryList = document.getElementById('sales-history');
const movementHistoryList = document.getElementById('movement-history');
const stockAddButton = document.getElementById('stock-add');
const stockRemoveButton = document.getElementById('stock-remove');
const productFormWrapper = document.getElementById('product-form-wrapper');
const toggleProductFormButton = document.getElementById('toggle-product-form');

let products = [];
let cart = [];
let salesHistory = [];
let stockMovements = [];
let editingProductId = null;
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

function loadSalesHistory() {
  const saved = localStorage.getItem('storeSalesHistory');
  salesHistory = saved ? JSON.parse(saved) : [];
}

function saveSalesHistory() {
  localStorage.setItem('storeSalesHistory', JSON.stringify(salesHistory));
}

function loadStockMovements() {
  const saved = localStorage.getItem('storeStockMovements');
  stockMovements = saved ? JSON.parse(saved) : [];
}

function saveStockMovements() {
  localStorage.setItem('storeStockMovements', JSON.stringify(stockMovements));
}

function showProductForm(open = true) {
  if (!productFormWrapper || !toggleProductFormButton) return;
  productFormWrapper.classList.toggle('expanded', open);
  toggleProductFormButton.textContent = open ? 'Fechar formulário' : '+ Novo produto';
}

function resetForm() {
  if (!productForm) return;
  productForm.reset();
  categoryInput.value = '';
  editingProductId = null;
  if (productForm) {
    const submitButton = productForm.querySelector('button[type="submit"]');
    if (submitButton) submitButton.textContent = 'Cadastrar produto';
  }
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
          <div>
            <button type="button" data-action="edit" data-id="${product.id}" class="button secondary small">Editar</button>
            <button type="button" data-action="remove" data-id="${product.id}" class="button small">Remover</button>
          </div>
        </div>
        <div class="product-meta">
          <span>Categoria: ${product.category || 'Geral'}</span>
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

function renderMovementProductSelect() {
  if (!movementProductSelect) return;

  if (products.length === 0) {
    movementProductSelect.innerHTML = '<option value="">Nenhum produto disponível</option>';
    return;
  }

  movementProductSelect.innerHTML = products.map(product => `
    <option value="${product.id}">${product.name} (${product.quantity} em estoque)</option>
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
          <button type="button" data-action="remove-cart" data-id="${item.id}" class="button small">Remover</button>
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

function renderSalesHistory() {
  if (!salesHistoryList) return;

  if (salesHistory.length === 0) {
    salesHistoryList.innerHTML = '<p class="empty-state">Nenhuma venda registrada ainda.</p>';
    return;
  }

  salesHistoryList.innerHTML = salesHistory.map(entry => `
    <article class="product-card">
      <div class="product-row">
        <div>
          <strong>${entry.date}</strong>
          <p>${entry.items.length} item${entry.items.length === 1 ? '' : 's'} - ${formatCurrency(entry.total)}</p>
        </div>
      </div>
      <div class="product-meta">
        ${entry.items.map(item => `<span>${item.quantity} × ${item.name} (${formatCurrency(item.price)})</span>`).join('')}
      </div>
    </article>`).join('');
}

function renderStockMovements() {
  if (!movementHistoryList) return;

  if (stockMovements.length === 0) {
    movementHistoryList.innerHTML = '<p class="empty-state">Nenhuma movimentação registrada ainda.</p>';
    return;
  }

  movementHistoryList.innerHTML = stockMovements.map(entry => `
    <article class="product-card">
      <div class="product-row">
        <div>
          <strong>${entry.date}</strong>
          <p>${entry.productName} — ${entry.type === 'add' ? '+' : '-'}${entry.quantity}</p>
        </div>
      </div>
      <div class="product-meta">
        <span>Tipo: ${entry.type === 'add' ? 'Entrada' : 'Saída'}</span>
        <span>Observação: ${entry.note || 'Sem observação'}</span>
      </div>
    </article>`).join('');
}

function updateAllLists() {
  renderProducts();
  renderProductSelect();
  renderMovementProductSelect();
  renderCart();
  renderSalesHistory();
  renderStockMovements();
}

function startEditProduct(id) {
  const product = products.find(item => item.id === id);
  if (!product) return;

  editingProductId = id;
  showProductForm(true);
  nameInput.value = product.name;
  categoryInput.value = product.category || '';
  descriptionInput.value = product.description || '';
  quantityInput.value = String(product.quantity);
  priceInput.value = String(product.price.toFixed(2));
  if (productForm) {
    const submitButton = productForm.querySelector('button[type="submit"]');
    if (submitButton) submitButton.textContent = 'Salvar alterações';
  }
}

function addProduct(event) {
  event.preventDefault();

  const name = nameInput.value.trim();
  const category = categoryInput.value.trim();
  const description = descriptionInput.value.trim();
  const quantity = Number(quantityInput.value);
  const price = Number(priceInput.value);

  if (!name || quantity < 1 || price <= 0) {
    alert('Preencha nome, quantidade e preço válidos.');
    return;
  }

  if (editingProductId) {
    products = products.map(item => item.id === editingProductId ? {
      ...item,
      name,
      category,
      description,
      quantity,
      price
    } : item);
    editingProductId = null;
  } else {
    products.unshift({ id: Date.now(), name, category, description, quantity, price });
  }

  saveProducts();
  updateAllLists();
  resetForm();
}

function removeProduct(id) {
  const product = products.find(item => item.id === id);
  if (!product) return;

  if (!confirm(`Remover ${product.name} do estoque?`)) {
    return;
  }

  products = products.filter(item => item.id !== id);
  saveProducts();
  updateAllLists();
}

function toggleProductForm() {
  if (!productFormWrapper) return;
  const open = !productFormWrapper.classList.contains('expanded');
  showProductForm(open);
}

function clearStock() {
  if (!confirm('Deseja limpar todos os produtos do estoque? Esta ação não pode ser desfeita.')) return;
  products = [];
  saveProducts();
  updateAllLists();
}

function clearCart() {
  if (!confirm('Deseja limpar o carrinho atual?')) return;
  cart = [];
  saveCart();
  renderCart();
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

  const saleEntry = {
    id: Date.now(),
    date: new Date().toLocaleString('pt-BR'),
    items: cart.map(item => ({ ...item })),
    total: cart.reduce((sum, item) => sum + item.quantity * item.price, 0)
  };

  salesHistory.unshift(saleEntry);
  cart = [];

  saveProducts();
  saveCart();
  saveSalesHistory();
  updateAllLists();
  saleQuantity.value = '1';
  alert('Venda finalizada com sucesso!');
}

function recordStockMovement(type) {
  if (!movementProductSelect || !movementQuantity) return;

  const productId = Number(movementProductSelect.value);
  const quantity = Number(movementQuantity.value);
  const note = movementNoteInput.value.trim();
  const product = products.find(item => item.id === productId);

  if (!product) {
    alert('Selecione um produto válido para movimentação.');
    return;
  }

  if (quantity < 1) {
    alert('Informe uma quantidade válida.');
    return;
  }

  if (type === 'remove' && quantity > product.quantity) {
    alert(`Quantidade maior que o estoque disponível (${product.quantity}).`);
    return;
  }

  product.quantity += type === 'add' ? quantity : -quantity;
  if (product.quantity < 0) product.quantity = 0;

  stockMovements.unshift({
    id: Date.now(),
    productId,
    productName: product.name,
    type,
    quantity,
    note,
    date: new Date().toLocaleString('pt-BR')
  });

  saveProducts();
  saveStockMovements();
  updateAllLists();
  movementQuantity.value = '1';
  movementNoteInput.value = '';
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
if (toggleProductFormButton) toggleProductFormButton.addEventListener('click', () => showProductForm(!productFormWrapper.classList.contains('expanded')));
if (clearStockButton) clearStockButton.addEventListener('click', clearStock);
if (clearCartButton) clearCartButton.addEventListener('click', clearCart);
if (addToCartButton) addToCartButton.addEventListener('click', addToCart);
if (completeSaleButton) completeSaleButton.addEventListener('click', completeSale);
if (stockAddButton) stockAddButton.addEventListener('click', () => recordStockMovement('add'));
if (stockRemoveButton) stockRemoveButton.addEventListener('click', () => recordStockMovement('remove'));
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
    if (target.matches('button[data-action="edit"]')) {
      const id = Number(target.dataset.id);
      startEditProduct(id);
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
  loadSalesHistory();
  loadStockMovements();
  updateAllLists();

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
