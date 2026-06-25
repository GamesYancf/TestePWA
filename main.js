const toggleBtn = document.getElementById('toggle-btn');
const message = document.getElementById('message');
const statusBox = document.getElementById('status-box');
const navigateBtn = document.getElementById('navigate-btn');
const installBtn = document.getElementById('install-btn');
const errorBtn = document.getElementById('error-btn');
const closeErrorBtn = document.getElementById('close-error-btn');
const errorOverlay = document.getElementById('error-overlay');
let active = false;
let deferredPrompt = null;

function updateText() {
  if (!message || !statusBox) return;

  if (active) {
    message.textContent = 'Texto alterado! O PWA agora responde aos seus cliques.';
    statusBox.style.borderColor = '#a78bfa';
    statusBox.style.background = 'rgba(238, 242, 255, 0.9)';
  } else {
    message.textContent = 'Pronto para você testar o botão.';
    statusBox.style.borderColor = 'rgba(148, 163, 184, 0.18)';
    statusBox.style.background = '#f8fafc';
  }
}

function animateButton(button) {
  if (!button || !button.animate) return;

  button.animate([
    { transform: 'translateY(0px)' },
    { transform: 'translateY(-6px)' },
    { transform: 'translateY(0px)' }
  ], {
    duration: 280,
    easing: 'ease-out'
  });
}

if (toggleBtn) {
  toggleBtn.addEventListener('click', () => {
    active = !active;
    updateText();
    animateButton(toggleBtn);
  });
}

if (navigateBtn) {
  navigateBtn.addEventListener('click', () => {
    animateButton(navigateBtn);
    window.location.href = 'other.html';
  });
}

if (installBtn) {
  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) {
      return;
    }

    installBtn.classList.add('hidden');
    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    deferredPrompt = null;

    if (choiceResult.outcome === 'accepted') {
      console.log('Usuário aceitou a instalação');
    } else {
      console.log('Usuário rejeitou a instalação');
    }
  });
}

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredPrompt = event;

  if (installBtn) {
    installBtn.classList.remove('hidden');
  }
});

if (errorBtn) {
  errorBtn.addEventListener('click', () => {
    animateButton(errorBtn);
    if (errorOverlay) {
      errorOverlay.classList.remove('hidden');
    }
  });
}

if (closeErrorBtn) {
  closeErrorBtn.addEventListener('click', () => {
    if (errorOverlay) {
      errorOverlay.classList.add('hidden');
    }
  });
}

if (errorOverlay) {
  errorOverlay.addEventListener('click', (event) => {
    if (event.target === errorOverlay) {
      errorOverlay.classList.add('hidden');
    }
  });
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(() => console.log('Service Worker registrado com sucesso.'))
      .catch((error) => console.warn('Falha no registro do SW:', error));
  });
}
