import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Layout from './components/Layout';

// Lazy loading components
const Home = lazy(() => import('./pages/Home'));
const Packages = lazy(() => import('./pages/Packages'));
const Booking = lazy(() => import('./pages/Booking'));
const BookingSuccess = lazy(() => import('./pages/BookingSuccess'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));

const Kontak = () => <div className="pt-32 text-center h-screen"><h1 className="text-3xl text-[var(--color-primary-dark)]">Kontak</h1></div>;

const NotFound = () => (
  <div className="pt-32 text-center h-screen flex flex-col items-center justify-center">
    <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
    <h2 className="text-2xl text-gray-600 mb-8">Halaman Tidak Ditemukan</h2>
    <p className="text-gray-500 mb-8">Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.</p>
    <a href="/" className="bg-[var(--color-primary)] text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">
      Kembali ke Beranda
    </a>
  </div>
);

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
    <div className="w-12 h-12 border-4 border-[var(--color-primary)]/20 border-t-[var(--color-primary)] rounded-full animate-spin"></div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="paket" element={<Packages />} />
            <Route path="kontak" element={<Kontak />} />
            <Route path="booking" element={<Booking />} />
            <Route path="booking/:code" element={<BookingSuccess />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
