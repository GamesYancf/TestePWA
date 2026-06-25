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

let products = [];
let deferredPrompt = null;
const isMobile = /iphone|ipad|ipod|android/i.test(navigator.userAgent);

function formatCurrency(value) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function loadProducts() {
  const saved = localStorage.getItem('productCatalog');
  products = saved ? JSON.parse(saved) : [];
  renderProducts();
}

function saveProducts() {
  localStorage.setItem('productCatalog', JSON.stringify(products));
}

function renderProducts() {
  if (!productList || !productCount || !totalItems || !totalValue) return;

  if (products.length === 0) {
    productList.innerHTML = '<p class="empty-state">Nenhum produto cadastrado ainda.</p>';
  } else {
    productList.innerHTML = products.map(product => `
      <article class="product-card">
        <div class="product-row">
          <div>
            <strong>${product.name}</strong>
            <p>${product.description || 'Sem descrição'}</p>
          </div>
          <button type="button" data-id="${product.id}">Remover</button>
        </div>
        <div class="product-meta">
          <span>Quantidade: ${product.quantity}</span>
          <span>Preço unitário: ${formatCurrency(product.price)}</span>
          <span>Subtotal: ${formatCurrency(product.quantity * product.price)}</span>
        </div>
      </article>`).join('');
  }

  const totalQuantity = products.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = products.reduce((sum, item) => sum + item.price * item.quantity, 0);

  productCount.textContent = `${products.length} item${products.length === 1 ? '' : 's'}`;
  totalItems.textContent = totalQuantity;
  totalValue.textContent = formatCurrency(totalPrice);
}

function addProduct(event) {
  event.preventDefault();

  const name = nameInput.value.trim();
  const description = descriptionInput.value.trim();
  const quantity = Number(quantityInput.value);
  const price = Number(priceInput.value);

  if (!name || quantity <= 0 || price <= 0) {
    alert('Preencha o nome, quantidade e preço corretamente.');
    return;
  }

  products.unshift({
    id: Date.now(),
    name,
    description,
    quantity,
    price
  });

  saveProducts();
  renderProducts();
  productForm.reset();
  quantityInput.value = '1';
  priceInput.value = '0.00';
  nameInput.focus();
}

function removeProduct(id) {
  products = products.filter(item => item.id !== id);
  saveProducts();
  renderProducts();
}

function showInstallHelp() {
  if (installHelp) {
    installHelp.classList.remove('hidden');
  }
}

function hideInstallHelp() {
  if (installHelp) {
    installHelp.classList.add('hidden');
  }
}

function handleInstallPrompt(event) {
  event.preventDefault();
  deferredPrompt = event;
  if (installBtn) {
    installBtn.classList.remove('hidden');
  }
  hideInstallHelp();
}

if (productForm) {
  productForm.addEventListener('submit', addProduct);
}

if (productList) {
  productList.addEventListener('click', (event) => {
    const target = event.target;
    if (target.matches('button[data-id]')) {
      const id = Number(target.dataset.id);
      removeProduct(id);
    }
  });
}

if (installBtn) {
  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    deferredPrompt = null;
    installBtn.classList.add('hidden');

    if (choice.outcome !== 'accepted') {
      showInstallHelp();
    }
  });
}

window.addEventListener('beforeinstallprompt', handleInstallPrompt);

window.addEventListener('load', () => {
  loadProducts();

  setTimeout(() => {
    if (isMobile && !deferredPrompt) {
      if (installBtn) {
        installBtn.classList.add('hidden');
      }
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
  if (installBtn) {
    installBtn.classList.add('hidden');
  }
  hideInstallHelp();
});
