import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Home, Package, Image as ImageIcon, MessageCircle, HelpCircle, CalendarCheck } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { label: "Beranda", icon: Home, path: "/" },
  { label: "Paket", icon: Package, path: "/paket" },
  { label: "Galeri", icon: ImageIcon, path: "/galeri" },
  { label: "Testimoni", icon: MessageCircle, path: "/#testimoni" },
  { label: "FAQ", icon: HelpCircle, path: "/#faq" },
  { label: "Booking", icon: CalendarCheck, path: "/booking" },
];

const MOBILE_LABEL_WIDTH = 72;

export function BottomNavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Menentukan indeks aktif berdasarkan URL saat ini
  const getCurrentIndex = () => {
    const idx = navItems.findIndex(item => {
      if (item.path.includes('#')) {
        return location.pathname === '/' && location.hash === item.path.split('#')[1];
      }
      return location.pathname === item.path;
    });
    return idx === -1 ? 0 : idx;
  };

  const [activeIndex, setActiveIndex] = useState(getCurrentIndex());

  useEffect(() => {
    setActiveIndex(getCurrentIndex());
  }, [location]);

  const handleNavClick = (idx, path) => {
    setActiveIndex(idx);
    
    // Handle navigation
    if (path.includes('#')) {
      const [route, hash] = path.split('#');
      if (location.pathname !== route) {
        navigate(route + '#' + hash);
      } else {
        const element = document.getElementById(hash);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(path);
    }
  };

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      role="navigation"
      aria-label="Bottom Navigation"
      className="fixed inset-x-0 bottom-6 mx-auto z-50 w-fit bg-white/90 backdrop-blur-lg border border-pink-100 rounded-full flex items-center p-2 shadow-2xl space-x-1 min-w-[320px] max-w-[95vw] h-[60px] print:hidden"
    >
      {navItems.map((item, idx) => {
        const Icon = item.icon;
        const isActive = activeIndex === idx;
        
        // Cek jika ini tombol Booking (highlighted)
        const isBooking = item.label === "Booking";

        return (
          <motion.button
            key={item.label}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-0 px-3 py-2 rounded-full transition-colors duration-200 relative h-11 min-w-[48px] min-h-[44px] max-h-[48px] focus:outline-none ${
              isActive
                ? isBooking 
                  ? "bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-primary)] text-white gap-2 shadow-lg" 
                  : "bg-blue-50/80 text-[var(--color-primary-dark)] gap-2"
                : isBooking
                  ? "bg-blue-50 text-[var(--color-primary)] hover:bg-blue-100"
                  : "bg-transparent text-gray-500 hover:bg-gray-100"
            }`}
            onClick={() => handleNavClick(idx, item.path)}
            aria-label={item.label}
            type="button"
          >
            <Icon
              size={22}
              strokeWidth={isActive ? 2.5 : 2}
              aria-hidden
              className="transition-colors duration-200"
            />

            <motion.div
              initial={false}
              animate={{
                width: isActive ? `${MOBILE_LABEL_WIDTH}px` : "0px",
                opacity: isActive ? 1 : 0,
                marginLeft: isActive ? "8px" : "0px",
              }}
              transition={{
                width: { type: "spring", stiffness: 350, damping: 32 },
                opacity: { duration: 0.19 },
                marginLeft: { duration: 0.19 },
              }}
              className="overflow-hidden flex items-center max-w-[72px]"
            >
              <span
                className={`font-bold text-xs whitespace-nowrap select-none transition-opacity duration-200 overflow-hidden text-ellipsis leading-tight ${
                  isActive ? (isBooking ? "text-white" : "text-[var(--color-primary-dark)]") : "opacity-0"
                }`}
                title={item.label}
              >
                {item.label}
              </span>
            </motion.div>
          </motion.button>
        );
      })}
    </motion.nav>
  );
}

export default BottomNavBar;
