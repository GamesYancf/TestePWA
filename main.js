const productForm = document.getElementById('product-form');
const nameInput = document.getElementById('name');
const categoryInput = document.getElementById('category');
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
const movementHistoryList = document.getElementById('movement-history');
const stockAddButton = document.getElementById('stock-add');
const stockRemoveButton = document.getElementById('stock-remove');
const productFormWrapper = document.getElementById('product-form-wrapper');
const toggleProductFormButton = document.getElementById('toggle-product-form');
const productDetailModal = document.getElementById('product-detail-modal');
const closeProductDetailButton = document.getElementById('close-product-detail');
const detailName = document.getElementById('detail-name');
const detailCategory = document.getElementById('detail-category');
const detailQuantity = document.getElementById('detail-quantity');
const detailPrice = document.getElementById('detail-price');
const detailEditButton = document.getElementById('detail-edit');
const detailDeleteButton = document.getElementById('detail-delete');
const paymentModal = document.getElementById('payment-modal');
const paymentMethodSelect = document.getElementById('payment-method');
const paymentTotal = document.getElementById('payment-total');
const confirmPaymentButton = document.getElementById('confirm-payment');
const cancelPaymentButton = document.getElementById('cancel-payment');
const closePaymentModalButton = document.getElementById('close-payment-modal');
const managePaymentMethodsButton = document.getElementById('manage-payment-methods');
const paymentMethodModal = document.getElementById('payment-method-modal');
const closePaymentMethodModalButton = document.getElementById('close-payment-method-modal');
const paymentMethodForm = document.getElementById('payment-method-form');
const newPaymentMethodInput = document.getElementById('new-payment-method');
const paymentMethodList = document.getElementById('payment-method-list');
const productFormModal = document.getElementById('product-form-modal');
const closeProductFormButton = document.getElementById('close-product-form');
const imageInput = document.getElementById('image-url');
const clearCacheBtn = document.getElementById('clear-cache-btn');
const salesHistoryMainList = document.getElementById('sales-history-main');
const saleDetailModal = document.getElementById('sale-detail-modal');
const closeSaleDetailButton = document.getElementById('close-sale-detail');

let products = [];
let cart = [];
let salesHistory = [];
let stockMovements = [];
let editingProductId = null;
let currentDetailProductId = null;
let deferredPrompt = null;
const isMobile = /iphone|ipad|ipod|android/i.test(navigator.userAgent);
let paymentMethods = [];
let nextInternalCode = 1;

function formatCurrency(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function loadProducts() {
  const saved = localStorage.getItem('storeProducts');
  products = saved ? JSON.parse(saved) : [];
  const savedCode = localStorage.getItem('storeNextInternalCode');
  nextInternalCode = savedCode ? Number(savedCode) : 1;
  
  // Migrar produtos antigos sem internalCode
  products.forEach(product => {
    if (!product.internalCode) {
      product.internalCode = nextInternalCode++;
    }
  });
  localStorage.setItem('storeNextInternalCode', String(nextInternalCode));
}

function generateProductCode() {
  return `PRD-${String(Date.now()).slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
}

function getNextInternalCode() {
  const code = nextInternalCode;
  nextInternalCode++;
  localStorage.setItem('storeNextInternalCode', String(nextInternalCode));
  return code;
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
      <article class="product-card" data-id="${product.id}">
        <div class="product-row compact">
          <div style="display:flex;gap:0.75rem;align-items:center;">
            <img class="product-thumb" src="${product.image || 'icons/icon-192.png'}" alt="${product.name}" width="56" height="56">
            <div>
              <strong>${product.name}</strong>
              <p>${product.category || 'Sem categoria'}</p>
            </div>
          </div>
          <div class="product-meta compact">
            <span>#${product.internalCode}</span>
            <span>${product.quantity} em estoque</span>
            <span>${formatCurrency(product.price)}</span>
          </div>
        </div>
      </article>`).join('');
  }

  const totalQuantity = products.reduce((sum, item) => sum + item.quantity, 0);
  const totalStockValue = products.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const totalProductCount = products.length;

  productCount.textContent = `${totalProductCount} produto${totalProductCount === 1 ? '' : 's'}`;
  totalItems.textContent = totalProductCount;
  totalValue.textContent = formatCurrency(totalStockValue);
}

function loadPaymentMethods() {
  const saved = localStorage.getItem('storePaymentMethods');
  paymentMethods = saved ? JSON.parse(saved) : ['Dinheiro','Cartão','Pix','Vale'];
}

function savePaymentMethods() {
  localStorage.setItem('storePaymentMethods', JSON.stringify(paymentMethods));
}

function renderPaymentMethodOptions() {
  if (!paymentMethodSelect) return;
  if (paymentMethods.length === 0) {
    paymentMethodSelect.innerHTML = '<option value="">Selecione</option>';
    return;
  }
  paymentMethodSelect.innerHTML = ['<option value="">Selecione</option>', ...paymentMethods.map(m => `<option value="${m}">${m}</option>`)].join('');
}

function renderPaymentMethodList() {
  if (!paymentMethodList) return;
  if (paymentMethods.length === 0) {
    paymentMethodList.innerHTML = '<p class="empty-state">Nenhuma forma cadastrada.</p>';
    return;
  }

  paymentMethodList.innerHTML = paymentMethods.map((m, i) => `
    <article class="product-card">
      <div class="product-row">
        <div>
          <strong>${m}</strong>
        </div>
        <div>
          <button data-action="remove-method" data-id="${i}" class="button small secondary">Remover</button>
        </div>
      </div>
    </article>
  `).join('');
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

function renderSalesHistoryMain() {
  if (!salesHistoryMainList) return;

  if (salesHistory.length === 0) {
    salesHistoryMainList.innerHTML = '<p class="empty-state">Nenhuma venda registrada ainda.</p>';
    return;
  }

  salesHistoryMainList.innerHTML = salesHistory.map((entry, idx) => `
    <article class="sale-card" data-sale-index="${idx}">
      <div class="product-row compact">
        <div>
          <strong>${entry.date}</strong>
          <p>${entry.items.length} item${entry.items.length === 1 ? '' : 's'}</p>
        </div>
        <span class="payment-method">${entry.paymentMethod || 'Método não registrado'}</span>
      </div>
      <div class="product-meta">
        <span>Total: ${formatCurrency(entry.total)}</span>
      </div>
    </article>`).join('');
}

function openSaleDetails(idx) {
  const sale = salesHistory[idx];
  if (!sale) return;

  const saleDetailDate = document.getElementById('sale-detail-date');
  const saleDetailMethod = document.getElementById('sale-detail-method');
  const saleDetailTotal = document.getElementById('sale-detail-total');
  const saleDetailItems = document.getElementById('sale-detail-items');

  if (saleDetailDate) saleDetailDate.textContent = sale.date;
  if (saleDetailMethod) saleDetailMethod.textContent = sale.paymentMethod || 'Método não registrado';
  if (saleDetailTotal) saleDetailTotal.textContent = formatCurrency(sale.total);
  if (saleDetailItems) {
    saleDetailItems.innerHTML = sale.items.map(item => `
      <article class="product-card">
        <div class="product-row">
          <div>
            <strong>${item.name}</strong>
            <p>Qtd: ${item.quantity} × ${formatCurrency(item.price)}</p>
          </div>
        </div>
        <div class="product-meta">
          <span>Subtotal: ${formatCurrency(item.quantity * item.price)}</span>
        </div>
      </article>
    `).join('');
  }

  showModal(saleDetailModal);
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
  renderSalesHistoryMain();
  renderStockMovements();
}

function showModal(modal) {
  if (!modal) return;
  modal.classList.remove('hidden');
  document.body.classList.add('no-scroll');
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.add('hidden');
  document.body.classList.remove('no-scroll');
}

function openProductDetails(id) {
  const product = products.find(item => item.id === id);
  if (!product) return;

  currentDetailProductId = id;
  const detailCode = document.getElementById('detail-code');
  if (detailCode) detailCode.textContent = `#${product.internalCode}`;
  detailName.textContent = product.name;
  detailCategory.textContent = product.category || 'Geral';
  detailQuantity.textContent = product.quantity;
  detailPrice.textContent = formatCurrency(product.price);
  const detailImage = document.getElementById('detail-image');
  if (detailImage) detailImage.textContent = product.image || 'Sem imagem';
  showModal(productDetailModal);
}

function openPaymentModal() {
  if (!paymentModal || !paymentTotal || !paymentMethodSelect) return;
  paymentTotal.textContent = formatCurrency(cart.reduce((sum, item) => sum + item.quantity * item.price, 0));
  loadPaymentMethods();
  renderPaymentMethodOptions();
  paymentMethodSelect.value = '';
  showModal(paymentModal);
}

function confirmPayment() {
  if (!paymentMethodSelect || !paymentModal) return;
  const method = paymentMethodSelect.value;
  if (!method) {
    alert('Selecione um método de pagamento para finalizar a venda.');
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
    total: cart.reduce((sum, item) => sum + item.quantity * item.price, 0),
    paymentMethod: method
  };

  salesHistory.unshift(saleEntry);
  cart = [];

  saveProducts();
  saveCart();
  saveSalesHistory();
  updateAllLists();
  closeModal(paymentModal);
  saleQuantity.value = '1';
  alert('Venda finalizada com sucesso!');
}

function startEditProduct(id) {
  const product = products.find(item => item.id === id);
  if (!product) return;

  editingProductId = id;
  showModal(productFormModal);
  nameInput.value = product.name;
  categoryInput.value = product.category || '';
  quantityInput.value = String(product.quantity);
  priceInput.value = String(product.price.toFixed(2));
  if (imageInput) imageInput.value = product.image || '';
  const codeDisplay = document.getElementById('preview-product-code');
  if (codeDisplay) codeDisplay.textContent = `#${product.internalCode}`;
  if (productForm) {
    const submitButton = productForm.querySelector('button[type="submit"]');
    if (submitButton) submitButton.textContent = 'Salvar alterações';
  }
}

function addProduct(event) {
  event.preventDefault();

  const name = nameInput.value.trim();
  const category = categoryInput.value.trim();
  const quantity = Number(quantityInput.value);
  const price = Number(priceInput.value);

  if (!name || quantity < 1 || price <= 0) {
    alert('Preencha descrição, quantidade e preço válidos.');
    return;
  }

  if (editingProductId) {
    products = products.map(item => item.id === editingProductId ? {
      ...item,
      name,
      category,
      quantity,
      price,
      image: imageInput ? imageInput.value.trim() : ''
    } : item);
    editingProductId = null;
  } else {
    products.unshift({ id: Date.now(), internalCode: getNextInternalCode(), code: generateProductCode(), name, category, quantity, price, image: imageInput ? imageInput.value.trim() : '' });
  }

  saveProducts();
  updateAllLists();
  resetForm();
  if (productFormModal) closeModal(productFormModal);
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
  // Abre o modal de cadastro em vez do formulário inline
  editingProductId = null;
  resetForm();
  const codeDisplay = document.getElementById('preview-product-code');
  if (codeDisplay) codeDisplay.textContent = `#${nextInternalCode}`;
  if (productFormModal) showModal(productFormModal);
  if (productForm) {
    const submitButton = productForm.querySelector('button[type="submit"]');
    if (submitButton) submitButton.textContent = 'Cadastrar produto';
  }
}

function clearStock() {
  if (!confirm('Deseja limpar todos os produtos do estoque? Esta ação não pode ser desfeita.')) return;
  products = [];
  nextInternalCode = 1;
  localStorage.setItem('storeNextInternalCode', String(nextInternalCode));
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

  openPaymentModal();
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

function clearAppCache() {
  // Limpar todos os localStorage
  localStorage.clear();
  
  // Desregistrar service workers
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => registration.unregister());
    });
  }
  
  // Limpar cache do navegador
  if ('caches' in window) {
    caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => caches.delete(cacheName));
    });
  }
  
  alert('Cache limpo! A página será recarregada.');
  setTimeout(() => location.reload(), 500);
}

if (productForm) productForm.addEventListener('submit', addProduct);
if (toggleProductFormButton) toggleProductFormButton.addEventListener('click', toggleProductForm);
if (closeProductFormButton) closeProductFormButton.addEventListener('click', () => closeModal(productFormModal));
if (productFormModal) {
  productFormModal.addEventListener('click', (e) => { if (e.target === productFormModal) closeModal(productFormModal); });
}
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
if (clearCacheBtn) {
  clearCacheBtn.addEventListener('click', clearAppCache);
}
if (closeProductDetailButton) {
  closeProductDetailButton.addEventListener('click', () => closeModal(productDetailModal));
}
if (detailEditButton) {
  detailEditButton.addEventListener('click', () => {
    if (currentDetailProductId !== null) startEditProduct(currentDetailProductId);
    closeModal(productDetailModal);
  });
}
if (detailDeleteButton) {
  detailDeleteButton.addEventListener('click', () => {
    if (currentDetailProductId !== null) removeProduct(currentDetailProductId);
    closeModal(productDetailModal);
  });
}
if (productDetailModal) {
  productDetailModal.addEventListener('click', (event) => {
    if (event.target === productDetailModal) closeModal(productDetailModal);
  });
}
if (closePaymentModalButton) {
  closePaymentModalButton.addEventListener('click', () => closeModal(paymentModal));
}
if (cancelPaymentButton) {
  cancelPaymentButton.addEventListener('click', () => closeModal(paymentModal));
}
if (confirmPaymentButton) {
  confirmPaymentButton.addEventListener('click', confirmPayment);
}
if (paymentModal) {
  paymentModal.addEventListener('click', (event) => {
    if (event.target === paymentModal) closeModal(paymentModal);
  });
}
if (managePaymentMethodsButton) {
  managePaymentMethodsButton.addEventListener('click', () => {
    loadPaymentMethods();
    renderPaymentMethodList();
    showModal(paymentMethodModal);
  });
}
if (closePaymentMethodModalButton) {
  closePaymentMethodModalButton.addEventListener('click', () => closeModal(paymentMethodModal));
}
if (paymentMethodModal) {
  paymentMethodModal.addEventListener('click', (e) => { if (e.target === paymentMethodModal) closeModal(paymentMethodModal); });
}
if (paymentMethodForm) {
  paymentMethodForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = newPaymentMethodInput.value.trim();
    if (!val) return;
    loadPaymentMethods();
    if (!paymentMethods.includes(val)) paymentMethods.push(val);
    savePaymentMethods();
    renderPaymentMethodList();
    newPaymentMethodInput.value = '';
    renderPaymentMethodOptions();
  });
}
if (paymentMethodList) {
  paymentMethodList.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action="remove-method"]');
    if (!btn) return;
    const id = Number(btn.dataset.id);
    loadPaymentMethods();
    paymentMethods.splice(id, 1);
    savePaymentMethods();
    renderPaymentMethodList();
    renderPaymentMethodOptions();
  });
}
if (closeSaleDetailButton) {
  closeSaleDetailButton.addEventListener('click', () => closeModal(saleDetailModal));
}
if (saleDetailModal) {
  saleDetailModal.addEventListener('click', (e) => { if (e.target === saleDetailModal) closeModal(saleDetailModal); });
}
if (salesHistoryMainList) {
  salesHistoryMainList.addEventListener('click', (e) => {
    const card = e.target.closest('article[data-sale-index]');
    if (card) {
      openSaleDetails(Number(card.dataset.saleIndex));
    }
  });
}
if (tabButtons.length) {
  tabButtons.forEach(button => {
    button.addEventListener('click', () => switchTab(button.dataset.tab));
  });
}
if (productList) {
  productList.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (button) {
      const id = Number(button.dataset.id);
      if (button.dataset.action === 'remove') removeProduct(id);
      if (button.dataset.action === 'edit') startEditProduct(id);
      return;
    }

    const card = event.target.closest('article[data-id]');
    if (card) {
      openProductDetails(Number(card.dataset.id));
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
