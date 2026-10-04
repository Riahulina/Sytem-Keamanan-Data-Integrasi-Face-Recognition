# Front End Sistem Keamanan Komputer

Front end untuk sistem autentikasi dengan **registrasi (data akun → verifikasi email → verifikasi wajah)** dan **login (email + password → verifikasi wajah)**.

Saat ini semua data dan alert masih **dummy**. Belum ada koneksi ke server. Dokumen ini menjelaskan cara menjalankannya dan bagian mana yang harus diganti saat disambungkan ke backend.

---

## 1. Cara menjalankan

Tidak perlu install apa pun. Ini HTML, CSS, dan JavaScript biasa.

1. Buka folder project di VS Code.
2. Install ekstensi **Live Server** (kalau belum ada).
3. Klik kanan `index.html`, pilih **Open with Live Server**.
4. Browser terbuka di `http://127.0.0.1:5500/index.html`.

Kalau tidak pakai Live Server, double-click `index.html` juga bisa. Tapi nanti saat kamera dan API dipasang, sebaiknya tetap lewat server (`http://`), karena kamera browser tidak jalan di `file://`.

---

## 2. Struktur folder

```
frontend/
├── index.html          Beranda (Selamat Datang)
├── register.html       Registrasi, 3 langkah dalam 1 halaman
├── login.html          Login, 2 langkah dalam 1 halaman
├── home.html           Beranda setelah login
├── css/
│   ├── base.css        Warna (variabel), font, tombol, ukuran dasar
│   ├── modal.css       Pop-up berhasil, gagal, info, dan toast
│   ├── auth.css        Layout bersama register dan login
│   ├── landing.css     Khusus index.html
│   ├── register.css    Khusus register.html
│   ├── login.css       Khusus login.html
│   └── home.css        Khusus home.html
├── js/
│   ├── common.js       Helper bersama: modal, toast, stepper, scan wajah, sesi
│   ├── register.js     Logika halaman registrasi
│   ├── login.js        Logika halaman login
│   └── home.js         Logika halaman beranda setelah login
└── assets/img/         Gambar ilustrasi (ganti sesuai kebutuhan)
```

Setiap halaman memuat CSS bersama (`base.css`, `modal.css`, `auth.css`) ditambah CSS miliknya sendiri.

---

## 3. Alur halaman

```
index.html ──► login.html ──► (email+password) ──► (verifikasi wajah) ──► home.html
          └──► register.html ─► (data akun) ──► (kode email) ──► (verifikasi wajah) ──► login.html
```

Langkah-langkah di dalam register dan login **bukan halaman terpisah**. Itu beberapa `<section class="panel">` dalam satu file HTML yang ditampilkan atau disembunyikan lewat JavaScript (`goTo(n)`). Stepper di atas form (bar dan angka 1-2-3) ikut berubah otomatis.

---

## 4. Data dummy yang sedang dipakai

| Hal | Perilaku sekarang |
|---|---|
| Kode verifikasi email | Selalu **123456** |
| Validasi form | Nama min. 3 huruf, email valid, password min. 8 karakter, ulangi password harus sama |
| Login | Email dan password apa saja asal formatnya valid |
| Verifikasi wajah | Hanya simulasi pemindaian 2,4 detik, tanpa kamera |
| Hasil wajah | Berhasil. Gagal kalau URL ditambah `?face=fail` |
| Sesi login | Disimpan di `sessionStorage` (hanya untuk demo) |
| Profil, Pengolahan Data | Pop-up info dummy |

### Cara melihat pop-up gagal

```
http://127.0.0.1:5500/register.html?face=fail
http://127.0.0.1:5500/login.html?face=fail
```

Lalu jalankan alurnya sampai langkah verifikasi wajah. Untuk registrasi, isi form dulu lalu masukkan kode `123456`.

---

## 5. Titik yang harus disambungkan ke backend

Semua bagian dummy sudah ditandai di JavaScript. Berikut daftar yang perlu diganti. Nama endpoint hanya **saran**, silakan sesuaikan.

### `js/register.js`

| Aksi di UI | Sekarang | Ganti dengan |
|---|---|---|
| Submit form data akun | Hanya validasi lalu pindah ke langkah 2 | `POST /api/register` berisi `{nama, email, password}`. Server menyimpan data sementara dan mengirim kode ke email. |
| Tombol "Verifikasi dan buat akun" | Cek kode == `DUMMY_OTP` | `POST /api/register/verify-email` berisi `{email, code}` |
| Tombol "Kirim ulang" | Toast dummy | `POST /api/register/resend-code` berisi `{email}` |
| Tombol "Mulai Verifikasi" (wajah) | `App.scanFace(...)` simulasi | Ambil foto dari kamera, lalu `POST /api/register/face` berisi `{email, image}`. Server menyimpan data wajah (embedding). |

### `js/login.js`

| Aksi di UI | Sekarang | Ganti dengan |
|---|---|---|
| Submit email dan password | Hanya validasi format | `POST /api/login` berisi `{email, password}` |
| Tombol "Mulai Verifikasi" (wajah) | Simulasi | `POST /api/login/face` berisi `{email, image}`. Server mencocokkan wajah. |
| Tombol "Lupa Password?" | Pop-up dummy | Alur reset password |

### `js/common.js`

- `App.scanFace(...)` dan `faceShouldSucceed()`: bagian simulasi. Ganti dengan alur kamera sungguhan. Area kamera adalah elemen `<div id="face">` (lingkaran). Masukkan `<video>` ke dalamnya, buka kamera pakai `navigator.mediaDevices.getUserMedia({ video: true })`, lalu ambil gambar lewat `<canvas>`.
- `App.session`: sesi dummy di `sessionStorage`. Ganti dengan token atau **cookie httpOnly** dari server.

### `js/home.js`

- Tombol **Profil** dan **Pengolahan Data** masih menampilkan pop-up dummy. Hubungkan ke data pengguna asli dan halaman pengolahan data.
- Sebaiknya tambahkan pengecekan di awal: kalau belum login, arahkan ke `login.html`.

### Pop-up hasil

Semua pop-up dipanggil lewat satu fungsi:

```js
App.showModal({
  type: 'success',        // 'success' | 'error' | 'info'
  title: 'Judul',
  message: 'Isi pesan',
  button: 'Teks tombol',
  onClose: () => { /* aksi setelah tombol ditekan */ }
});
```

Jadi saat respons server datang (sukses atau gagal), cukup panggil `App.showModal(...)` dengan `type` dan pesan dari server.

---

## 6. Mengganti gambar ilustrasi

Gambar ada di tag `<img class="auth__art">` (register dan login) dan `<img class="home__art">` (home). Ganti nilai `src`-nya, atau timpa file di `assets/img/` dengan nama yang sama.

Ukuran gambar menyesuaikan otomatis (`object-fit: contain`), jadi tidak perlu dipotong.

---

## 7. Mengubah warna dan ukuran

- **Warna** ada di bagian atas `css/base.css` (blok `:root`), misalnya `--navy-800`, `--blue-600`, `--blue-400`, `--ok` (hijau), `--err` (merah). Ubah di sana, semua halaman ikut berubah.
- **Ukuran font** memakai satuan `rem`, dan `rem` dihitung dari tinggi layar (lihat `html { font-size: ... }` di `base.css`). Ini yang membuat tiap halaman muat satu layar tanpa scroll di desktop.
- Di layar sempit (di bawah 860px) tampilan berubah jadi satu kolom dan boleh di-scroll.

---

## 8. Catatan keamanan untuk saat dihubungkan ke backend

Front end ini hanya tampilan, jadi semua pengecekan harus diulang di server:

- Validasi form di JavaScript **tidak cukup**. Server wajib memvalidasi ulang.
- Hash password di server dengan **bcrypt atau argon2**. Jangan simpan password asli.
- Pencocokan wajah dilakukan **di server**, bukan di browser. Simpan **embedding** wajah, bukan foto asli.
- Tambahkan **deteksi liveness** (misalnya deteksi kedipan) supaya foto atau layar HP tidak bisa dipakai menipu.
- Kode verifikasi email harus **sekali pakai**, punya masa berlaku (di UI tertulis 10 menit), dan pengiriman ulangnya dibatasi.
- Batasi jumlah percobaan login (rate limit) dan pakai **HTTPS**.
- Simpan sesi di **cookie httpOnly**, bukan di `sessionStorage`.
- Pesan error ke pengguna jangan terlalu detail (misalnya jangan membedakan "email tidak ada" dan "password salah").

---

## 9. Daftar elemen penting (untuk dihubungkan lewat JS)

**register.html**: `#form-akun`, `#nama`, `#email`, `#pass`, `#pass2`, `#otp` (6 input kode), `#btn-verif-email`, `#btn-kirim-ulang`, `#btn-ubah-data`, `#face`, `#btn-mulai-wajah`, `#btn-kembali`

**login.html**: `#form-login`, `#email`, `#pass`, `#btn-lupa`, `#face`, `#btn-mulai-wajah`, `#btn-kembali`

**home.html**: `#btn-profil`, `#btn-data`
