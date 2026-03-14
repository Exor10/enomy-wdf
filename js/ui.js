(function () {
  function setBoxState(element, type, message) {
    if (!element) return;
    element.classList.remove('hidden', 'success');
    if (type === 'success') element.classList.add('success');
    element.textContent = message;
  }

  function clearBox(element) {
    if (!element) return;
    element.classList.add('hidden');
    element.classList.remove('success');
    element.textContent = '';
  }

  function showToast(message) {
    const el = document.getElementById('global-message');
    if (!el) return;
    el.className = 'toast';
    el.textContent = message;
    setTimeout(() => {
      el.className = 'hidden';
      el.textContent = '';
    }, 3000);
  }

  function attachAuthPlaceholders() {
    document.querySelectorAll('[data-auth-placeholder]').forEach((button) => {
      button.addEventListener('click', () => {
        showToast('Login required in full backend version (Spring Security).');
      });
    });
  }

  window.UIService = { setBoxState, clearBox, showToast, attachAuthPlaceholders };
})();
