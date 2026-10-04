/* Helper umum: modal, toast, stepper, sesi dummy */
const App = (() => {
  const ICONS = {
    success: '<svg class="icon" viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5"/></svg>',
    error: '<svg class="icon" viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19"/></svg>',
    info: '<svg class="icon" viewBox="0 0 24 24"><path d="M12 8h.01M11 12h1v5h1"/></svg>'
  };

  // Atur hasil verifikasi wajah dummy: tambahkan ?face=fail di URL untuk melihat pop-up gagal
  const faceShouldSucceed = () => new URLSearchParams(location.search).get('face') !== 'fail';

  function showModal({ type = 'info', title, message, button = 'OK', onClose }) {
    document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal modal--${type}" role="dialog" aria-modal="true">
        <button class="modal__close" aria-label="Tutup">&times;</button>
        <h2 class="modal__title">${title}</h2>
        <div class="modal__icon">${ICONS[type] || ICONS.info}</div>
        <p class="modal__text">${message}</p>
        <button class="modal__btn">${button}</button>
      </div>`;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('is-open'));

    const close = (runCallback) => {
      overlay.classList.remove('is-open');
      setTimeout(() => overlay.remove(), 200);
      if (runCallback && onClose) onClose();
    };
    overlay.querySelector('.modal__btn').addEventListener('click', () => close(true));
    overlay.querySelector('.modal__close').addEventListener('click', () => close(false));
    overlay.addEventListener('click', e => { if (e.target === overlay) close(false); });
  }

  function toast(text, ms = 2200) {
    let el = document.querySelector('.toast');
    if (!el) { el = document.createElement('div'); el.className = 'toast'; document.body.appendChild(el); }
    el.textContent = text;
    requestAnimationFrame(() => el.classList.add('is-show'));
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('is-show'), ms);
  }

  // Stepper: current = nomor step aktif (1..n), state: 'active' | 'error'
  function setStep(stepperEl, current, state = 'active') {
    stepperEl.querySelectorAll('.step').forEach((li, i) => {
      const n = i + 1;
      li.classList.remove('is-active', 'is-done', 'is-error');
      if (n < current) li.classList.add('is-done');
      else if (n === current) li.classList.add(state === 'error' ? 'is-error' : 'is-active');
    });
  }

  function markAllDone(stepperEl) {
    stepperEl.querySelectorAll('.step').forEach(li => {
      li.classList.remove('is-active', 'is-error');
      li.classList.add('is-done');
    });
  }

  // Simulasi pemindaian wajah
  function scanFace(faceEl, btn, { onSuccess, onFail }) {
    const original = btn.innerHTML;
    btn.disabled = true;
    btn.textContent = 'Memindai wajah...';
    faceEl.classList.add('is-scanning');
    setTimeout(() => {
      faceEl.classList.remove('is-scanning');
      btn.disabled = false;
      btn.innerHTML = original;
      faceShouldSucceed() ? onSuccess() : onFail();
    }, 2400);
  }

  // Sesi dummy
  const session = {
    save: user => sessionStorage.setItem('dummyUser', JSON.stringify(user)),
    get: () => { try { return JSON.parse(sessionStorage.getItem('dummyUser')); } catch { return null; } },
    clear: () => sessionStorage.removeItem('dummyUser')
  };

  const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

  function setFieldError(fieldEl, message) {
    fieldEl.classList.toggle('has-error', !!message);
    const err = fieldEl.querySelector('.field__error');
    if (err) err.textContent = message || '';
  }

  return { showModal, toast, setStep, markAllDone, scanFace, session, isEmail, setFieldError };
})();
