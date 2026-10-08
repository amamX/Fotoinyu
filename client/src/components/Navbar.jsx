import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Package, Image as ImageIcon, MessageCircle, HelpCircle, CalendarCheck, Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import ThemeToggle from "./ThemeToggle";

const navItems = [
  { label: "Home", icon: Home, path: "/" },
  { label: "Galeri", icon: ImageIcon, path: "/#galeri" },
  { label: "Testimoni", icon: MessageCircle, path: "/#testimoni" },
  { label: "FAQ", icon: HelpCircle, path: "/#faq" },
  { label: "Paket", icon: Package, path: "/paket" },
  { label: "Booking", icon: CalendarCheck, path: "/booking" },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Menentukan indeks aktif saat route berubah
  useEffect(() => {
    const idx = navItems.findIndex(item => {
      if (item.path.includes('#')) {
        return location.pathname === '/' && location.hash === item.path.split('#')[1];
      }
      return location.pathname === item.path;
    });
    if (idx !== -1) setActiveIndex(idx);
  }, [location]);

  // ScrollSpy: Deteksi posisi scroll untuk update menu aktif
  useEffect(() => {
    if (location.pathname !== '/') return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 3; // Center point offset

      if (scrollPosition < window.innerHeight / 2) {
        setActiveIndex(0); // Home
        return;
      }

      for (let i = navItems.length - 1; i >= 0; i--) {
        const item = navItems[i];
        if (item.path.includes('#')) {
          const id = item.path.split('#')[1];
          const element = document.getElementById(id);
          if (element && element.offsetTop <= scrollPosition) {
            setActiveIndex(i);
            return;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const handleNavClick = (idx, path) => {
    setActiveIndex(idx);
    setIsMobileMenuOpen(false);

    if (path.includes('#')) {
      const [route, hash] = path.split('#');
      if (location.pathname !== route) {
        navigate(route + '#' + hash);
      } else {
        const element = document.getElementById(hash);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      if (location.pathname === path && path === "/") {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        navigate(path);
      }
    }
  };

  return (
    <>
      <div className="fixed top-6 inset-x-0 mx-auto z-50 flex justify-center pointer-events-none px-4 print:hidden">
        <nav className="pointer-events-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-full px-4 md:px-6 py-2 shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex items-center justify-between gap-2 md:gap-6 w-full max-w-5xl h-16 relative transition-colors duration-300">

          {/* Logo Section - Ukuran proporsional & aman dari cropping luar container */}
          <Link to="/" className="flex-shrink-0 flex items-center justify-center w-28 md:w-36 h-10 overflow-hidden mix-blend-multiply dark:mix-blend-normal bg-white/50 dark:bg-gray-800/50 rounded-xl px-2">
            <img
              src="/images/logo.png"
              alt="Fotoinyu Logo"
              className="w-full h-full object-contain drop-shadow-sm dark:brightness-200"
            />
          </Link>

          {/* Nav Links (Desktop) */}
          <div className="hidden lg:flex items-center space-x-1 relative">
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = activeIndex === idx;
              const isBooking = item.label === "Booking";

              return (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(idx, item.path)}
                  className={`relative flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-sm transition-colors duration-300 z-10 ${isBooking
                    ? "text-white"
                    : isActive
                      ? "text-white"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    }`}
                >
                  {/* Highlight pill indicator with Framer Motion layoutId for smooth sliding */}
                  {isActive && !isBooking && (
                    <motion.div
                      layoutId="active-nav-pill"
                      className="absolute inset-0 bg-[var(--color-primary)] rounded-full -z-10 shadow-md shadow-blue-200 dark:shadow-none"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  {isBooking && (
                    <div className="absolute inset-0 bg-[var(--color-primary-dark)] rounded-full -z-10 shadow-md transition-transform hover:scale-105" />
                  )}

                  <Icon size={18} strokeWidth={isActive || isBooking ? 2.5 : 2} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle Navbar */}
            <div className="hidden lg:block">
              <ThemeToggle />
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden text-gray-700 dark:text-gray-200 p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={`print:hidden lg:hidden fixed inset-x-4 top-24 z-40 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-300 origin-top ${isMobileMenuOpen ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0 pointer-events-none"
        }`}>
        <div className="flex flex-col p-4 space-y-2">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = activeIndex === idx;
            const isBooking = item.label === "Booking";

            return (
              <button
                key={item.label}
                onClick={() => handleNavClick(idx, item.path)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${isBooking
                  ? "bg-[var(--color-primary-dark)] text-white"
                  : isActive
                    ? "bg-blue-50 dark:bg-gray-800 text-[var(--color-primary)]"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between px-4 py-2">
            <span className="text-sm font-bold text-gray-600 dark:text-gray-300">Mode Gelap</span>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </>
  );
}
