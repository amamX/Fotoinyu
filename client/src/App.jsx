import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Packages from './pages/Packages';
import Booking from './pages/Booking';
import BookingSuccess from './pages/BookingSuccess';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';

const Kontak = () => <div className="pt-32 text-center h-screen"><h1 className="text-3xl text-[var(--color-primary-dark)]">Kontak</h1></div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="paket" element={<Packages />} />
          <Route path="kontak" element={<Kontak />} />
          <Route path="booking" element={<Booking />} />
          <Route path="booking/:code" element={<BookingSuccess />} />
        </Route>
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
