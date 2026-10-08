# Fotoinyu Photobooth

Sistem booking online untuk layanan photobooth di Banjarmasin.

## Fitur Utama
- **Publik**: Melihat harga paket, galeri foto, FAQ, dan ketersediaan tanggal tanpa login.
- **Sistem Booking**: Memilih tanggal, pengisian form, perhitungan harga dinamis, dan invoice instan.
- **Dashboard Admin**: Pengelolaan jadwal, konfirmasi pembayaran (DP), dan pembaruan UI realtime.

## Tech Stack
- Frontend: React + Vite + Tailwind CSS + React Router.
- Backend: Supabase (Auth, Postgres, Storage, Realtime, Edge Functions).

## Struktur Direktori
- `/client`: Berisi kode sumber frontend React.
- `/supabase`: Berisi skema database lokal, *migrations*, dan *Edge Functions*.

## Cara Menjalankan Lokal

1. Masuk ke folder client dan install dependencies:
   ```bash
   cd client
   npm install
   ```

2. Jalankan Supabase secara lokal (pastikan Docker sudah berjalan):
   ```bash
   npx supabase start
   ```

3. Salin `.env.example` ke `.env.local` di folder `client` dan isi sesuai dengan konfigurasi lokal Supabase Anda (berasal dari output `supabase start`).

4. Jalankan Vite dev server:
   ```bash
   npm run dev
   ```
