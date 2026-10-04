/* Logika halaman Login (data dummy) */
(() => {
  const stepper = document.getElementById('stepper');
  const panels = [1, 2].map(n => document.getElementById('panel-' + n));
  const f = id => document.getElementById(id);
  let currentEmail = '';

  function goTo(n) {
    panels.forEach((p, i) => p.classList.toggle('hidden', i + 1 !== n));
    App.setStep(stepper, n);
  }

  /* ---------- Step 1 ---------- */
  f('form-login').addEventListener('submit', e => {
    e.preventDefault();
    const email = f('email').value.trim();
    const pass = f('pass').value;

    const errEmail = !App.isEmail(email) ? 'Format email belum valid.' : '';
    const errPass = pass.length < 8 ? 'Password minimal 8 karakter.' : '';
    App.setFieldError(f('f-email'), errEmail);
    App.setFieldError(f('f-pass'), errPass);
    if (errEmail || errPass) return;

    currentEmail = email;
    App.toast('Akun ditemukan, lanjut verifikasi wajah');
    goTo(2);
  });

  f('btn-lupa').addEventListener('click', () => {
    App.showModal({
      type: 'info',
      title: 'Lupa Password',
      message: 'Fitur reset password masih berupa dummy. Tautan reset akan dikirim ke email Anda.',
      button: 'Mengerti'
    });
  });

  /* ---------- Step 2 ---------- */
  f('btn-kembali').addEventListener('click', () => goTo(1));

  f('btn-mulai-wajah').addEventListener('click', e => {
    App.scanFace(f('face'), e.currentTarget, {
      onSuccess: () => {
        App.markAllDone(stepper);
        App.session.save({
          nama: 'Pengguna Dummy',
          email: currentEmail,
          loginAt: new Date().toLocaleString('id-ID')
        });
        App.showModal({
          type: 'success',
          title: 'Login Berhasil',
          message: 'Identitas Anda berhasil diverifikasi.<br>Selamat datang kembali!',
          button: 'Masuk ke Beranda',
          onClose: () => (location.href = 'home.html')
        });
      },
      onFail: () => {
        App.setStep(stepper, 2, 'error');
        App.showModal({
          type: 'error',
          title: 'Login Gagal',
          message: 'Verifikasi wajah tidak berhasil. Silakan pastikan posisi dan pencahayaan wajah sudah sesuai.',
          button: 'Coba Lagi',
          onClose: () => App.setStep(stepper, 2)
        });
      }
    });
  });
})();
