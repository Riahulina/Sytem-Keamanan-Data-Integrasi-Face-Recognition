/* Logika halaman Registrasi (data dummy) */
(() => {
  const DUMMY_OTP = '123456';
  const stepper = document.getElementById('stepper');
  const panels = [1, 2, 3].map(n => document.getElementById('panel-' + n));
  let current = 1;
  let draft = {}; // data pendaftaran sementara

  function goTo(n) {
    current = n;
    panels.forEach((p, i) => p.classList.toggle('hidden', i + 1 !== n));
    App.setStep(stepper, n);
    if (n === 2) document.querySelector('#otp input').focus();
  }

  /* ---------- Step 1 ---------- */
  const f = id => document.getElementById(id);
  document.getElementById('form-akun').addEventListener('submit', e => {
    e.preventDefault();
    const nama = f('nama').value.trim();
    const email = f('email').value.trim();
    const pass = f('pass').value;
    const pass2 = f('pass2').value;

    const errs = {
      nama: nama.length < 3 ? 'Nama lengkap minimal 3 karakter.' : '',
      email: !App.isEmail(email) ? 'Format email belum valid.' : '',
      pass: pass.length < 8 ? 'Password minimal 8 karakter.' : '',
      pass2: pass2 !== pass || !pass2 ? 'Password tidak sama.' : ''
    };
    App.setFieldError(f('f-nama'), errs.nama);
    App.setFieldError(f('f-email'), errs.email);
    App.setFieldError(f('f-pass'), errs.pass);
    App.setFieldError(f('f-pass2'), errs.pass2);
    if (Object.values(errs).some(Boolean)) return;

    draft = { nama, email };
    f('email-tujuan').textContent = email;
    App.toast('Kode verifikasi dikirim (dummy)');
    goTo(2);
  });

  /* ---------- Step 2: OTP ---------- */
  const otp = f('otp');
  const boxes = [...otp.querySelectorAll('input')];
  const otpError = f('otp-error');

  boxes.forEach((box, i) => {
    box.addEventListener('input', () => {
      box.value = box.value.replace(/\D/g, '');
      otp.classList.remove('is-error');
      otpError.textContent = '';
      if (box.value && boxes[i + 1]) boxes[i + 1].focus();
    });
    box.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !box.value && boxes[i - 1]) boxes[i - 1].focus();
      if (e.key === 'Enter') f('btn-verif-email').click();
    });
    box.addEventListener('paste', e => {
      const text = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6);
      if (!text) return;
      e.preventDefault();
      text.split('').forEach((ch, k) => { if (boxes[k]) boxes[k].value = ch; });
      boxes[Math.min(text.length, 5)].focus();
    });
  });

  f('btn-verif-email').addEventListener('click', () => {
    const code = boxes.map(b => b.value).join('');
    if (code.length < 6) {
      otp.classList.add('is-error');
      otpError.textContent = 'Masukkan 6 digit kode verifikasi.';
      return;
    }
    if (code !== DUMMY_OTP) {
      otp.classList.add('is-error');
      otpError.textContent = 'Kode salah atau sudah kedaluwarsa. Coba lagi.';
      return;
    }
    App.toast('Email berhasil diverifikasi');
    goTo(3);
  });

  let cooldown = false;
  f('btn-kirim-ulang').addEventListener('click', () => {
    if (cooldown) return App.toast('Tunggu sebentar sebelum kirim ulang');
    cooldown = true;
    App.toast('Kode baru dikirim (dummy: 123456)');
    setTimeout(() => (cooldown = false), 5000);
  });

  f('btn-ubah-data').addEventListener('click', () => goTo(1));

  /* ---------- Step 3: Wajah ---------- */
  f('btn-kembali').addEventListener('click', () => goTo(2));

  f('btn-mulai-wajah').addEventListener('click', e => {
    App.setStep(stepper, 3);
    App.scanFace(f('face'), e.currentTarget, {
      onSuccess: () => {
        App.markAllDone(stepper);
        App.showModal({
          type: 'success',
          title: 'Registrasi Berhasil',
          message: 'Akun Anda berhasil dibuat. Silakan login untuk melanjutkan.',
          button: 'Login Sekarang',
          onClose: () => (location.href = 'login.html')
        });
      },
      onFail: () => {
        App.setStep(stepper, 3, 'error');
        App.showModal({
          type: 'error',
          title: 'Registrasi Gagal',
          message: 'Data yang dimasukkan tidak valid atau terjadi kesalahan pada sistem. Silakan coba kembali.',
          button: 'Coba Lagi',
          onClose: () => App.setStep(stepper, 3)
        });
      }
    });
  });
})();
