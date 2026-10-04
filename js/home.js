/* Logika halaman Beranda setelah login (data dummy) */
(() => {
  const user = App.session.get() || {
    nama: 'Pengguna Dummy',
    email: 'nama@email.com',
    loginAt: new Date().toLocaleString('id-ID')
  };

  document.getElementById('btn-profil').addEventListener('click', () => {
    App.showModal({
      type: 'info',
      title: 'Profil Pengguna',
      message: `<b>${user.nama}</b><br>${user.email}<br><small>Login terakhir: ${user.loginAt}</small>`,
      button: 'Keluar',
      onClose: () => {
        App.session.clear();
        location.href = 'index.html';
      }
    });
  });

  document.getElementById('btn-data').addEventListener('click', () => {
    App.showModal({
      type: 'info',
      title: 'Pengolahan Data',
      message: 'Halaman pengolahan data masih dummy dan akan dihubungkan ke sistem sebenarnya.',
      button: 'Mengerti'
    });
  });
})();
